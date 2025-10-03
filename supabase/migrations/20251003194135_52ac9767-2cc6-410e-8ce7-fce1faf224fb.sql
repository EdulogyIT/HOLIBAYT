-- Fix notifications RLS policy to allow authenticated users to create notifications for any user
-- This is needed because admins need to create notifications for property owners
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;

CREATE POLICY "Authenticated users can create notifications for any user"
ON public.notifications
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);