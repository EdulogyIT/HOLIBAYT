-- Allow all users to view general_settings (for maintenance mode status)
-- This enables real-time subscriptions to work for all users
CREATE POLICY "Anyone can view general settings"
ON public.platform_settings
FOR SELECT
TO public
USING (setting_key = 'general_settings');