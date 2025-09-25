-- Fix numeric field overflow by adjusting precision and scale for payments table
ALTER TABLE payments ALTER COLUMN amount TYPE NUMERIC(15,2);

-- Also ensure bookings table can handle large amounts
ALTER TABLE bookings ALTER COLUMN total_amount TYPE NUMERIC(15,2);
ALTER TABLE bookings ALTER COLUMN booking_fee TYPE NUMERIC(15,2);
ALTER TABLE bookings ALTER COLUMN security_deposit TYPE NUMERIC(15,2);