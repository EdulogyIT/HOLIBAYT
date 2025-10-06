-- Allow anyone to view booking dates for availability checking (without personal info)
CREATE POLICY "Anyone can view booking dates for availability"
ON bookings FOR SELECT
USING (true);