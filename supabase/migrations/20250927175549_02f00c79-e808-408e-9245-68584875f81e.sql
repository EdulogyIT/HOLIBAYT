-- Clean up duplicate bookings and fix booking statuses

-- First, let's update booking statuses for completed payments
UPDATE bookings 
SET status = 'confirmed', updated_at = now()
WHERE payment_id IN (
  SELECT id FROM payments WHERE status = 'completed'
) AND status != 'confirmed';

-- Delete duplicate bookings (keep only the latest booking per user/property/dates combination)
WITH ranked_bookings AS (
  SELECT id,
         ROW_NUMBER() OVER (
           PARTITION BY user_id, property_id, check_in_date, check_out_date 
           ORDER BY created_at DESC
         ) as rn
  FROM bookings
)
DELETE FROM bookings 
WHERE id IN (
  SELECT id FROM ranked_bookings WHERE rn > 1
);

-- Delete payments that don't have corresponding bookings anymore
DELETE FROM payments 
WHERE id NOT IN (SELECT DISTINCT payment_id FROM bookings WHERE payment_id IS NOT NULL)
AND status = 'pending';