-- Create function to update commission status when booking completes
CREATE OR REPLACE FUNCTION public.update_commission_on_booking_complete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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

-- Create trigger to update commission when booking completes
DROP TRIGGER IF EXISTS on_booking_completed ON public.bookings;
CREATE TRIGGER on_booking_completed
  AFTER UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_commission_on_booking_complete();