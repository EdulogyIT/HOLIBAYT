-- Enable real-time updates for platform_settings table
ALTER TABLE platform_settings REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE platform_settings;