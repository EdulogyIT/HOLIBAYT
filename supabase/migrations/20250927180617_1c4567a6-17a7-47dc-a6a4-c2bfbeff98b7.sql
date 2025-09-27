-- Clean up dummy/test bookings - keep only confirmed bookings
DELETE FROM bookings WHERE status = 'pending';

-- Clean up payments for deleted bookings
DELETE FROM payments WHERE id NOT IN (
  SELECT DISTINCT payment_id FROM bookings WHERE payment_id IS NOT NULL
);