-- Fix triggers for commission status updates and set up auto-completion

-- First, ensure the trigger for completing commissions exists and is properly attached
DROP TRIGGER IF EXISTS update_commission_on_booking_complete_trigger ON public.bookings;

CREATE TRIGGER update_commission_on_booking_complete_trigger
  AFTER UPDATE ON public.bookings
  FOR EACH ROW
  WHEN (NEW.status = 'completed' AND OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.update_commission_on_booking_complete();

-- Create function to handle cancelled booking commissions
CREATE OR REPLACE FUNCTION public.update_commission_on_booking_cancel()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Mark commission as cancelled when booking is cancelled
  UPDATE public.commission_transactions
  SET 
    status = 'cancelled',
    updated_at = NOW()
  WHERE payment_id = NEW.payment_id
    AND status = 'pending';
  
  RETURN NEW;
END;
$$;

-- Create trigger for handling cancelled bookings
DROP TRIGGER IF EXISTS update_commission_on_booking_cancel_trigger ON public.bookings;

CREATE TRIGGER update_commission_on_booking_cancel_trigger
  AFTER UPDATE ON public.bookings
  FOR EACH ROW
  WHEN (NEW.status = 'cancelled' AND OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.update_commission_on_booking_cancel();

-- Enable pg_cron extension for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule auto-complete bookings to run every hour at minute 0
SELECT cron.schedule(
  'auto-complete-bookings-hourly',
  '0 * * * *',
  $$SELECT public.auto_complete_bookings();$$
);

-- Also schedule a review notification check to run daily at 3 AM
-- This ensures users get review reminders after bookings complete
SELECT cron.schedule(
  'send-review-notifications-daily',
  '0 3 * * *',
  $$
    INSERT INTO public.notifications (user_id, title, message, type, related_id)
    SELECT 
      b.user_id,
      'How was your stay?',
      'We hope you enjoyed your stay at "' || p.title || '". Please share your experience by leaving a review!',
      'review_request',
      b.id
    FROM public.bookings b
    JOIN public.properties p ON p.id = b.property_id
    WHERE b.status = 'completed'
      AND p.category = 'short-stay'
      AND b.updated_at > NOW() - INTERVAL '24 hours'
      AND NOT EXISTS (
        SELECT 1 FROM public.reviews r WHERE r.booking_id = b.id
      )
      AND NOT EXISTS (
        SELECT 1 FROM public.notifications n 
        WHERE n.related_id = b.id AND n.type = 'review_request'
      );
  $$
);