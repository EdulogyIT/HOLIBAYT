-- Delete all pending bookings and their associated payments for user to clean up duplicates
DELETE FROM bookings 
WHERE user_id = '9eac5c5e-8356-4e7a-9710-006b705acd65' 
AND status = 'pending';

DELETE FROM payments 
WHERE user_id = '9eac5c5e-8356-4e7a-9710-006b705acd65' 
AND status = 'pending';