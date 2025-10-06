-- Create notification triggers for bookings and reviews

-- Trigger to notify host when a booking is created
CREATE OR REPLACE FUNCTION public.notify_host_booking_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  property_title TEXT;
  host_user_id UUID;
BEGIN
  -- Get property title and host user id
  SELECT title, user_id INTO property_title, host_user_id
  FROM public.properties 
  WHERE id = NEW.property_id;
  
  IF host_user_id IS NOT NULL THEN
    -- Insert notification for host
    INSERT INTO public.notifications (user_id, title, message, type, related_id)
    VALUES (
      host_user_id,
      'New Booking Received',
      'You have a new booking for "' || property_title || '". Check-in: ' || NEW.check_in_date || ', Check-out: ' || NEW.check_out_date,
      'booking_created',
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for new bookings
DROP TRIGGER IF EXISTS on_booking_created ON public.bookings;
CREATE TRIGGER on_booking_created
  AFTER INSERT ON public.bookings
  FOR EACH ROW 
  WHEN (NEW.status IN ('confirmed', 'pending'))
  EXECUTE PROCEDURE public.notify_host_booking_created();

-- Trigger to notify host when a review is created
CREATE OR REPLACE FUNCTION public.notify_host_review_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  property_title TEXT;
  host_user_id UUID;
  reviewer_name TEXT;
BEGIN
  -- Get property title and host user id
  SELECT p.title, p.user_id INTO property_title, host_user_id
  FROM public.properties p
  WHERE p.id = NEW.property_id;
  
  -- Get reviewer name
  SELECT name INTO reviewer_name
  FROM public.profiles
  WHERE id = NEW.user_id;
  
  IF host_user_id IS NOT NULL THEN
    -- Insert notification for host
    INSERT INTO public.notifications (user_id, title, message, type, related_id)
    VALUES (
      host_user_id,
      'New Review Received',
      reviewer_name || ' left a ' || NEW.rating || '-star review for "' || property_title || '"',
      'review_created',
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for new reviews
DROP TRIGGER IF EXISTS on_review_created ON public.reviews;
CREATE TRIGGER on_review_created
  AFTER INSERT ON public.reviews
  FOR EACH ROW 
  EXECUTE PROCEDURE public.notify_host_review_created();