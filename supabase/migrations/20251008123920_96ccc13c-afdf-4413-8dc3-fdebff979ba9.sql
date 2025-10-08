-- Fix the commission transaction trigger to handle duplicates gracefully
CREATE OR REPLACE FUNCTION public.create_commission_transaction_on_booking()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  property_record RECORD;
  commission_rate_val NUMERIC;
  commission_amt NUMERIC;
  host_amt NUMERIC;
BEGIN
  -- Only create commission for confirmed bookings with booking_fee
  IF NEW.status = 'confirmed' AND NEW.booking_fee > 0 THEN
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
      
      -- Insert commission transaction with ON CONFLICT to handle race conditions
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
        'pending'
      )
      ON CONFLICT (payment_id) DO NOTHING;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;