-- Add commenting control setting to platform_settings
INSERT INTO public.platform_settings (setting_key, setting_value)
VALUES ('commenting_enabled', '{"blogs": true, "properties": true}'::jsonb)
ON CONFLICT (setting_key) DO NOTHING;