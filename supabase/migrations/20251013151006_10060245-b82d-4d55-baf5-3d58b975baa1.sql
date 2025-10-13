-- PHASE 1: Database Schema Updates for TRUE ESCROW SYSTEM

-- 1.1 Update payments table - Add escrow tracking columns
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS escrow_status TEXT DEFAULT 'escrowed' CHECK (escrow_status IN ('escrowed', 'released', 'refunded')),
ADD COLUMN IF NOT EXISTS escrow_released_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS escrow_release_reason TEXT;

-- Update existing completed payments to 'released' for backward compatibility
UPDATE payments 
SET escrow_status = 'released', 
    escrow_released_at = completed_at 
WHERE status = 'completed' AND escrow_status IS NULL;

-- 1.2 Update bookings table - Add escrow-specific fields
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS escrow_release_eligible_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS keys_received_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS guest_confirmed_completion BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS auto_release_scheduled BOOLEAN DEFAULT FALSE;

-- Update existing confirmed bookings to 'completed' for backward compatibility
UPDATE bookings 
SET status = 'completed' 
WHERE status = 'confirmed' AND check_out_date < NOW();

-- 1.3 Update commission_transactions table - Add escrow release tracking
ALTER TABLE commission_transactions
ADD COLUMN IF NOT EXISTS escrow_released_at TIMESTAMPTZ;

-- PHASE 5: Update Database Triggers

-- 5.1 Update commission transaction trigger to use 'escrowed' status
CREATE OR REPLACE FUNCTION create_commission_transaction_on_booking()
RETURNS TRIGGER AS $$
DECLARE
  property_record RECORD;
  commission_rate_val NUMERIC;
  commission_amt NUMERIC;
  host_amt NUMERIC;
BEGIN
  -- Only create commission for confirmed/escrowed bookings with booking_fee
  IF NEW.status IN ('confirmed', 'payment_escrowed') AND NEW.booking_fee > 0 THEN
    -- Check if commission transaction already exists for this payment
    IF EXISTS (
      SELECT 1 FROM public.commission_transactions 
      WHERE payment_id = NEW.payment_id
    ) THEN
      -- Commission already exists, skip creation
      RETURN NEW;
    END IF;
    
    -- Get property details
    SELECT user_id, commission_rate INTO property_record
    FROM public.properties
    WHERE id = NEW.property_id;
    
    IF property_record IS NOT NULL THEN
      -- Calculate commission
      commission_rate_val := COALESCE(property_record.commission_rate, 0.15);
      commission_amt := NEW.booking_fee * commission_rate_val;
      host_amt := NEW.booking_fee - commission_amt;
      
      -- Insert commission transaction with 'escrowed' status
      INSERT INTO public.commission_transactions (
        payment_id,
        property_id,
        host_user_id,
        total_amount,
        commission_rate,
        commission_amount,
        host_amount,
        status
      ) VALUES (
        NEW.payment_id,
        NEW.property_id,
        property_record.user_id,
        NEW.booking_fee,
        commission_rate_val,
        commission_amt,
        host_amt,
        'escrowed' -- Changed from 'pending' to match escrow flow
      )
      ON CONFLICT (payment_id) DO NOTHING;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 5.2 Create trigger to set escrow release eligibility on booking creation
CREATE OR REPLACE FUNCTION set_escrow_release_eligibility()
RETURNS TRIGGER AS $$
DECLARE
  property_category TEXT;
BEGIN
  -- Get property category
  SELECT category INTO property_category
  FROM public.properties
  WHERE id = NEW.property_id;
  
  -- For payment_escrowed bookings, set escrow release eligible time
  IF NEW.status = 'payment_escrowed' AND NEW.check_out_date IS NOT NULL THEN
    -- For short-stay: 24h after checkout
    IF property_category = 'short-stay' THEN
      NEW.escrow_release_eligible_at := (NEW.check_out_date::timestamp + INTERVAL '1 day' + TIME '11:00:00');
    END IF;
    -- For buy/rent: manual confirmation needed, set to NULL
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS trigger_set_escrow_release_eligibility ON bookings;
CREATE TRIGGER trigger_set_escrow_release_eligibility
BEFORE INSERT OR UPDATE ON bookings
FOR EACH ROW
EXECUTE FUNCTION set_escrow_release_eligibility();

-- Update commission trigger on booking completion to handle escrow release
CREATE OR REPLACE FUNCTION update_commission_on_booking_complete()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update commission when booking status changes to 'completed' from payment_escrowed
  IF NEW.status = 'completed' AND (OLD.status = 'payment_escrowed' OR OLD.status = 'confirmed') THEN
    -- Update commission transaction status to completed
    UPDATE public.commission_transactions
    SET 
      status = 'completed',
      escrow_released_at = NOW(),
      updated_at = NOW()
    WHERE payment_id = NEW.payment_id
      AND status IN ('pending', 'escrowed');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;