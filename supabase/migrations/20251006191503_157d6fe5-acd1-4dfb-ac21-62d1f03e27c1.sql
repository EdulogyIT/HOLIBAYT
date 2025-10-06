-- Drop the old trigger and function that creates duplicate notifications
-- Using CASCADE to drop dependent objects
DROP FUNCTION IF EXISTS public.notify_host_booking_created() CASCADE;