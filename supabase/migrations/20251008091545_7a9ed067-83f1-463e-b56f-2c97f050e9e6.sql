-- Fix issues with commission status updates and missing commissions
-- Use 'failed' status for cancelled bookings since 'cancelled' is not a valid status

-- Step 1: Remove duplicate trigger
DROP TRIGGER IF EXISTS on_booking_completed ON public.bookings;

-- Step 2: Update existing completed bookings to have completed commission status
UPDATE public.commission_transactions ct
SET 
  status = 'completed',
  updated_at = NOW()
FROM public.bookings b
WHERE ct.payment_id = b.payment_id
  AND b.status = 'completed'
  AND ct.status = 'pending';

-- Step 3: Create missing commissions for completed bookings that don't have them
-- Use 'failed' status for cancelled bookings since check constraint only allows pending/completed/failed
INSERT INTO public.commission_transactions (
  payment_id,
  property_id,
  host_user_id,
  total_amount,
  commission_rate,
  commission_amount,
  host_amount,
  status
)
SELECT 
  b.payment_id,
  b.property_id,
  p.user_id,
  b.booking_fee,
  COALESCE(p.commission_rate, 0.15),
  b.booking_fee * COALESCE(p.commission_rate, 0.15),
  b.booking_fee * (1 - COALESCE(p.commission_rate, 0.15)),
  CASE 
    WHEN b.status = 'completed' THEN 'completed'
    WHEN b.status = 'cancelled' THEN 'failed'
    ELSE 'pending'
  END
FROM public.bookings b
JOIN public.properties p ON p.id = b.property_id
WHERE b.booking_fee > 0
  AND b.payment_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.commission_transactions ct 
    WHERE ct.payment_id = b.payment_id
  )
ON CONFLICT DO NOTHING;

-- Step 4: Update the cancel trigger function to use 'failed' instead of 'cancelled'
CREATE OR REPLACE FUNCTION public.update_commission_on_booking_cancel()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Mark commission as failed when booking is cancelled
  UPDATE public.commission_transactions
  SET 
    status = 'failed',
    updated_at = NOW()
  WHERE payment_id = NEW.payment_id
    AND status = 'pending';
  
  RETURN NEW;
END;
$$;

-- Step 5: Recreate the complete trigger function
CREATE OR REPLACE FUNCTION public.update_commission_on_booking_complete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only update commission when booking status changes to 'completed'
  IF NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM NEW.status) THEN
    -- Update commission transaction status to completed
    UPDATE public.commission_transactions
    SET 
      status = 'completed',
      updated_at = NOW()
    WHERE payment_id = NEW.payment_id
      AND status = 'pending';
  END IF;
  
  RETURN NEW;
END;
$$;