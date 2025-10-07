-- Create helper function to check if platform is in maintenance mode
CREATE OR REPLACE FUNCTION public.is_platform_in_maintenance()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT COALESCE(
    (setting_value->>'maintenance_mode')::boolean,
    false
  )
  FROM public.platform_settings
  WHERE setting_key = 'general_settings'
  LIMIT 1
$$;

-- Add comment for documentation
COMMENT ON FUNCTION public.is_platform_in_maintenance() IS 
'Checks if the platform is currently in maintenance mode. Returns false if setting does not exist.';
