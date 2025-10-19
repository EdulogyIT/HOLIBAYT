-- Fix 1: Update cron job - Check if exists first, then update
DO $$
BEGIN
  -- Try to unschedule if exists (will silently fail if doesn't exist)
  PERFORM cron.unschedule('auto-release-escrow-every-15-min');
EXCEPTION WHEN OTHERS THEN
  -- Job doesn't exist, continue
  NULL;
END $$;

-- Create/Re-create with correct SERVICE_ROLE_KEY
SELECT cron.schedule(
  'auto-release-escrow-every-15-min',
  '*/15 * * * *', -- Every 15 minutes
  $$
  SELECT net.http_post(
    url:='https://vsruezynaanqprobpvrr.supabase.co/functions/v1/auto-release-escrow',
    headers:=jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzcnVlenluYWFucXByb2JwdnJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Nzc0NTgzNCwiZXhwIjoyMDczMzIxODM0fQ.KpxTx0AvCMvNaUmVRmVwcv6bIdnQUCXRE0-OItKE6Vg'
    ),
    body:=jsonb_build_object('scheduled', true)
  ) as request_id;
  $$
);

-- Fix 2: Manually release the stuck booking
UPDATE public.bookings
SET 
  status = 'completed',
  updated_at = NOW()
WHERE id = '67441878-d298-4a6e-a248-0d3542f675f6'
  AND status = 'payment_escrowed';

-- Update the related payment
UPDATE public.payments
SET 
  status = 'completed',
  escrow_released_at = NOW(),
  escrow_release_reason = 'Manual release - cron job authentication fix',
  updated_at = NOW()
WHERE id IN (
  SELECT payment_id 
  FROM public.bookings 
  WHERE id = '67441878-d298-4a6e-a248-0d3542f675f6'
);

-- Update commission transaction
UPDATE public.commission_transactions
SET 
  status = 'completed',
  escrow_released_at = NOW(),
  updated_at = NOW()
WHERE payment_id IN (
  SELECT payment_id 
  FROM public.bookings 
  WHERE id = '67441878-d298-4a6e-a248-0d3542f675f6'
)
  AND status IN ('pending', 'escrowed');

-- Fix 3: Update Admin Dashboard Metric Functions
CREATE OR REPLACE FUNCTION public.calculate_platform_gmv(days_back integer DEFAULT 30)
RETURNS numeric
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(SUM(booking_fee), 0)
  FROM public.bookings
  WHERE status IN ('completed', 'payment_escrowed')
    AND created_at >= NOW() - (days_back || ' days')::INTERVAL;
$$;

CREATE OR REPLACE FUNCTION public.calculate_avg_booking_value(days_back integer DEFAULT 30)
RETURNS numeric
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(AVG(booking_fee), 0)
  FROM public.bookings
  WHERE status IN ('completed', 'payment_escrowed')
    AND booking_fee > 0
    AND created_at >= NOW() - (days_back || ' days')::INTERVAL;
$$;

CREATE OR REPLACE FUNCTION public.calculate_conversion_rate(days_back integer DEFAULT 30)
RETURNS numeric
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  WITH stats AS (
    SELECT
      (SELECT COUNT(*) FROM public.bookings 
       WHERE created_at >= NOW() - (days_back || ' days')::INTERVAL
       AND status IN ('completed', 'confirmed', 'payment_escrowed')) AS bookings,
      (SELECT COUNT(*) FROM public.property_views 
       WHERE created_at >= NOW() - (days_back || ' days')::INTERVAL) AS views
  )
  SELECT 
    CASE 
      WHEN views > 0 THEN LEAST(ROUND((bookings::NUMERIC / views::NUMERIC) * 100, 2), 100)
      ELSE 0
    END
  FROM stats;
$$;