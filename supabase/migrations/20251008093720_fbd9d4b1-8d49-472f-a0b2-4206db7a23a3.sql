-- Update notification types constraint to include all existing types plus new withdrawal types
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE public.notifications ADD CONSTRAINT notifications_type_check 
CHECK (type IN (
  'booking_confirmed',
  'booking_confirmed_guest',
  'booking_confirmed_host',
  'booking_cancelled',
  'booking_created',
  'property_approval',
  'property_approved',
  'message_received',
  'review_created',
  'review_request',
  'visit_scheduled',
  'payment_received',
  'superhost_promotion',
  'withdrawal_approved',
  'withdrawal_rejected'
));