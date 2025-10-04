-- Create platform_settings table for storing global settings
CREATE TABLE IF NOT EXISTS public.platform_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can read settings
CREATE POLICY "Admins can view all settings"
  ON public.platform_settings
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can update settings  
CREATE POLICY "Admins can update settings"
  ON public.platform_settings
  FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can insert settings
CREATE POLICY "Admins can insert settings"
  ON public.platform_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Insert default commission settings
INSERT INTO public.platform_settings (setting_key, setting_value) 
VALUES 
  ('commission_rates', '{"default": 15, "short_stay": 12, "rental": 10, "sale": 5, "minimum_amount": 1000}'::jsonb),
  ('general_settings', '{"platform_name": "Holibayt", "support_email": "contact@holibayt.com", "maintenance_mode": false}'::jsonb),
  ('security_settings', '{"max_login_attempts": 5, "session_timeout": 3600, "require_email_verification": true}'::jsonb),
  ('notification_settings', '{"email_notifications": true, "push_notifications": true, "sms_notifications": false}'::jsonb),
  ('email_settings', '{"smtp_host": "", "smtp_port": 587, "from_email": "noreply@holibayt.com", "from_name": "Holibayt"}'::jsonb)
ON CONFLICT (setting_key) DO NOTHING;

-- Fix notification RLS by making system inserts work via service role
-- Drop existing INSERT policy and recreate with proper permissions
DROP POLICY IF EXISTS "Admins can create notifications for any user" ON public.notifications;

-- Recreate policy that works properly
CREATE POLICY "Allow authenticated users to create notifications"
  ON public.notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Admins can create notifications for anyone
    has_role(auth.uid(), 'admin'::app_role)
    OR 
    -- Users can only create notifications for themselves
    (auth.uid() = user_id)
  );