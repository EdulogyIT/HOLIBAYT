-- Enable required extensions for cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create cron job to auto-release escrow payments
-- Runs every 15 minutes to check for eligible bookings
SELECT cron.schedule(
  'auto-release-escrow-check',
  '*/15 * * * *', -- Every 15 minutes
  $$
  SELECT net.http_post(
    url:='https://vsruezynaanqprobpvrr.supabase.co/functions/v1/auto-release-escrow',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzcnVlenluYWFucXByb2JwdnJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3NDU4MzQsImV4cCI6MjA3MzMyMTgzNH0.plquvaj7X-W58GdHABRM-K6LbEe2O7LUITzXJjzLM5I"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);