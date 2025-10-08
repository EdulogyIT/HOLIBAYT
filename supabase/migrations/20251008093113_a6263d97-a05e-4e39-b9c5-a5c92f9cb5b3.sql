-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Unschedule existing job if it exists
SELECT cron.unschedule('auto-complete-bookings-hourly');

-- Create cron job to auto-complete bookings every hour
-- This will mark bookings as completed after checkout time (11:00 AM) has passed
SELECT cron.schedule(
  'auto-complete-bookings-hourly',
  '0 * * * *', -- Run at the start of every hour
  $$
  SELECT auto_complete_bookings();
  $$
);

-- Also run it immediately to catch any past bookings
SELECT auto_complete_bookings();