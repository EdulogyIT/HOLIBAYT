-- Add 'review_request' to the allowed notification types
ALTER TABLE public.notifications 
DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE public.notifications 
ADD CONSTRAINT notifications_type_check 
CHECK (type = ANY (ARRAY['message'::text, 'property_approval'::text, 'property_rejection'::text, 'booking'::text, 'general'::text, 'review_request'::text]));

-- Now drop and recreate the auto_complete_bookings function
DROP FUNCTION IF EXISTS public.auto_complete_bookings();

CREATE OR REPLACE FUNCTION public.auto_complete_bookings()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  -- Update bookings to completed status after checkout time has passed
  WITH completed_bookings AS (
    UPDATE public.bookings b
    SET status = 'completed',
        updated_at = NOW()
    FROM public.properties p
    WHERE b.property_id = p.id
    AND b.status = 'confirmed'
    AND p.category = 'short-stay'
    AND (b.check_out_date::timestamp + TIME '11:00:00') < NOW()
    RETURNING b.id
  )
  SELECT COUNT(*) INTO updated_count FROM completed_bookings;
  
  RETURN updated_count;
END;
$$;

-- Call the function immediately to mark any past bookings as completed
SELECT public.auto_complete_bookings();

-- Create a helper function to get property category for a booking  
CREATE OR REPLACE FUNCTION public.get_booking_property_category(booking_id_param UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
AS $$
  SELECT p.category
  FROM public.properties p
  JOIN public.bookings b ON b.property_id = p.id
  WHERE b.id = booking_id_param
  LIMIT 1;
$$;