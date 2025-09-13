-- Remove the admin policy that's causing infinite recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP FUNCTION IF EXISTS public.get_user_role(uuid);

-- For now, admins will use the same "Users can view their own profile" policy
-- This will get authentication working, we can add admin-specific policies later if needed