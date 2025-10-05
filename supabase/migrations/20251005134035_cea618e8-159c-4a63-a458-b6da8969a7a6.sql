-- Fix the search_path for the helper function
DROP FUNCTION IF EXISTS public.get_booking_property_category(UUID);

CREATE OR REPLACE FUNCTION public.get_booking_property_category(booking_id_param UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.category
  FROM public.properties p
  JOIN public.bookings b ON b.property_id = p.id
  WHERE b.id = booking_id_param
  LIMIT 1;
$$;