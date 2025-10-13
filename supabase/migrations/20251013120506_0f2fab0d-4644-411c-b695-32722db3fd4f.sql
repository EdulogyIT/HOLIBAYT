-- Update notifications type constraint to include all existing and KYC notification types
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE notifications ADD CONSTRAINT notifications_type_check 
CHECK (type IN (
  'message',
  'booking',
  'booking_created',
  'booking_confirmed_guest',
  'booking_confirmed_host',
  'review_created',
  'review_request',
  'property_approval',
  'property_approved',
  'visit_scheduled',
  'superhost_promotion',
  'withdrawal_approved',
  'kyc_approved',
  'kyc_rejected',
  'kyc_requires_changes'
));