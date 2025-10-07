-- Update notification types constraint to include both existing and new types
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE notifications ADD CONSTRAINT notifications_type_check 
CHECK (type IN (
  -- Existing types in database
  'property_approval',
  'property_approved',
  'superhost_promotion',
  'review_request',
  'review_created',
  'booking_created',
  -- New types for booking confirmations
  'booking_confirmed',
  'booking_cancelled', 
  'booking_confirmed_guest',
  'booking_confirmed_host',
  'property_rejected',
  'message_received',
  'payment_received',
  'payment_failed',
  'booking_failed',
  'system_notification'
));