-- Drop the existing problematic policy
DROP POLICY IF EXISTS "Allow authenticated users to create notifications" ON public.notifications;

-- Create new policy with direct user_roles check
CREATE POLICY "Admins and users can create notifications" 
ON public.notifications 
FOR INSERT 
TO authenticated 
WITH CHECK (
  auth.uid() = user_id 
  OR EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'::app_role
  )
);