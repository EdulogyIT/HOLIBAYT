-- Create trigger to automatically create commission transactions for bookings

CREATE OR REPLACE FUNCTION public.create_commission_transaction_on_booking()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  property_record RECORD;
  commission_rate_val NUMERIC;
  commission_amt NUMERIC;
  host_amt NUMERIC;
BEGIN
  -- Only create commission for confirmed bookings with booking_fee
  IF NEW.status = 'confirmed' AND NEW.booking_fee > 0 THEN
    -- Get property details
    SELECT user_id, commission_rate INTO property_record
    FROM public.properties
    WHERE id = NEW.property_id;
    
    IF property_record IS NOT NULL THEN
      -- Calculate commission
      commission_rate_val := COALESCE(property_record.commission_rate, 0.15);
      commission_amt := NEW.booking_fee * commission_rate_val;
      host_amt := NEW.booking_fee - commission_amt;
      
      -- Insert commission transaction
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
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS on_booking_confirmed_create_commission ON public.bookings;
CREATE TRIGGER on_booking_confirmed_create_commission
  AFTER INSERT ON public.bookings
  FOR EACH ROW 
  WHEN (NEW.status = 'confirmed' AND NEW.booking_fee > 0)
  EXECUTE PROCEDURE public.create_commission_transaction_on_booking();