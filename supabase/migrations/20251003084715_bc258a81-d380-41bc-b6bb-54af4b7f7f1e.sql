-- Fix search_path for is_host function to resolve security linter warning
CREATE OR REPLACE FUNCTION public.is_host(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.properties WHERE user_id = user_uuid
  )
$$;