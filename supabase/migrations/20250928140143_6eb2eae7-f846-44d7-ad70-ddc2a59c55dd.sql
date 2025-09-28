-- Remove duplicate pending bookings for the Villa property, keeping only the most recent one
DELETE FROM bookings 
WHERE property_id = 'fc4537eb-0629-44f1-a811-b176cf269a14' 
AND status = 'pending' 
AND id NOT IN (
  SELECT id 
  FROM bookings 
  WHERE property_id = 'fc4537eb-0629-44f1-a811-b176cf269a14' 
  AND status = 'pending' 
  ORDER BY created_at DESC 
  LIMIT 1
);