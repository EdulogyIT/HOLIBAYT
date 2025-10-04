-- Fix notifications RLS policies to allow admins to create notifications for any user
DROP POLICY IF EXISTS "Authenticated users can create notifications for any user" ON notifications;

-- Allow admins to create notifications for any user
CREATE POLICY "Admins can create notifications for any user"
ON notifications
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Allow users to create notifications for themselves
CREATE POLICY "Users can create their own notifications"
ON notifications
FOR INSERT
WITH CHECK (auth.uid() = user_id);