-- Drop existing problematic policy
DROP POLICY IF EXISTS "Admins can create notifications for any user" ON public.notifications;

-- Create corrected policy that checks user_roles table using has_role function
CREATE POLICY "Admins can create notifications for any user"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR auth.uid() = user_id
);

-- Enable realtime for notifications table
ALTER TABLE public.notifications REPLICA IDENTITY FULL;