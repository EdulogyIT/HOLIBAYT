-- Enable pg_cron extension for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Create a cron job to fetch OANDA rates daily at 6 AM UTC
SELECT cron.schedule(
  'fetch-oanda-rates-daily',
  '0 6 * * *', -- Every day at 6 AM UTC
  $$
  SELECT
    net.http_post(
        url:='https://vsruezynaanqprobpvrr.supabase.co/functions/v1/fetch-oanda-rates',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzcnVlenluYWFucXByb2JwdnJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3NDU4MzQsImV4cCI6MjA3MzMyMTgzNH0.plquvaj7X-W58GdHABRM-K6LbEe2O7LUITzXJjzLM5I"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);

-- Insert initial currency exchange rate if it doesn't exist
INSERT INTO public.platform_settings (setting_key, setting_value)
VALUES (
  'currency_exchange_rates',
  '{"dzd_to_eur": 0.0069, "last_updated": "2025-10-08T00:00:00Z", "source": "default"}'::jsonb
)
ON CONFLICT (setting_key) DO NOTHING;