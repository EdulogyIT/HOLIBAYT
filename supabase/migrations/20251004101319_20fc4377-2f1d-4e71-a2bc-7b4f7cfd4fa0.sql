-- Fix notification RLS policies to allow admins to create notifications for any user
-- Drop existing admin insert policy
DROP POLICY IF EXISTS "Admins can create notifications for any user" ON public.notifications;

-- Create new admin insert policy that properly checks admin role
CREATE POLICY "Admins can create notifications for any user"
ON public.notifications
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'::app_role
  )
  OR auth.uid() = user_id
);

-- Also ensure the edge function can create notifications via service role
-- (service role bypasses RLS, so this is just for documentation)