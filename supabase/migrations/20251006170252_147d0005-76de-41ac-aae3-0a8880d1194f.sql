-- Create trigger for review notifications
CREATE OR REPLACE TRIGGER notify_host_on_review_created
  AFTER INSERT ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_host_review_created();

-- Create trigger for commission transactions  
CREATE OR REPLACE TRIGGER create_commission_on_booking_confirmed
  AFTER INSERT OR UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.create_commission_transaction_on_booking();