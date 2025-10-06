-- Manually create the missing review notification for the existing review
INSERT INTO public.notifications (user_id, title, message, type, related_id)
SELECT 
  p.user_id,
  'New Review Received',
  prof.name || ' left a ' || r.rating || '-star review for "' || p.title || '"',
  'review_created',
  r.id
FROM public.reviews r
JOIN public.properties p ON r.property_id = p.id
JOIN public.profiles prof ON r.user_id = prof.id
WHERE r.id = '689bf0da-4280-4146-9ba8-f3b8d971c5fb'
  AND NOT EXISTS (
    SELECT 1 FROM public.notifications 
    WHERE type = 'review_created' AND related_id = r.id
  );

-- Manually create the missing commission transaction for the existing booking
INSERT INTO public.commission_transactions (
  payment_id,
  property_id,
  host_user_id,
  total_amount,
  commission_rate,
  commission_amount,
  host_amount,
  status
)
SELECT 
  b.payment_id,
  b.property_id,
  p.user_id,
  b.booking_fee,
  COALESCE(p.commission_rate, 0.15),
  b.booking_fee * COALESCE(p.commission_rate, 0.15),
  b.booking_fee * (1 - COALESCE(p.commission_rate, 0.15)),
  'pending'
FROM public.bookings b
JOIN public.properties p ON b.property_id = p.id
WHERE b.id = 'b07f402d-1690-4e0a-a21c-8881b78c5282'
  AND b.status = 'completed'
  AND b.booking_fee > 0
  AND NOT EXISTS (
    SELECT 1 FROM public.commission_transactions 
    WHERE payment_id = b.payment_id
  );