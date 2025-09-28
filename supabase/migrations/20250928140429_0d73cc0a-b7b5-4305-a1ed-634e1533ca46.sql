-- Remove the dummy pending booking for Villa
DELETE FROM bookings 
WHERE property_id = 'fc4537eb-0629-44f1-a811-b176cf269a14' 
AND status = 'pending';