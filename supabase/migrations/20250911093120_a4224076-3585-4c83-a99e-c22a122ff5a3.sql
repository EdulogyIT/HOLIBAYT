-- First drop the problematic policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;

-- Create a security definer function to check user roles safely
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid DEFAULT auth.uid())
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_profiles
  WHERE user_profiles.user_id = $1
  LIMIT 1;
$$;

-- Create a helper function to check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(required_role text, user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_profiles
    WHERE user_profiles.user_id = $2
    AND user_profiles.role = $1
  );
$$;

-- Now create a safe admin policy using the security definer function
CREATE POLICY "Admins can view all profiles"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (
  -- Users can always see their own profile
  auth.uid() = user_id
  OR 
  -- Admins can see all profiles (using security definer function)
  public.has_role('admin', auth.uid())
);

-- Also create a policy for admins to update any profile
CREATE POLICY "Admins can update any profile"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (
  -- Users can update their own profile
  auth.uid() = user_id
  OR 
  -- Admins can update any profile
  public.has_role('admin', auth.uid())
);

-- Grant execute permissions on the functions
GRANT EXECUTE ON FUNCTION public.get_user_role(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(text, uuid) TO authenticated;