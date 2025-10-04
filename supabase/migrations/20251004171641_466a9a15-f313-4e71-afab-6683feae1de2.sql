-- Drop the redundant INSERT policy for notifications
DROP POLICY IF EXISTS "Users can create their own notifications" ON public.notifications;