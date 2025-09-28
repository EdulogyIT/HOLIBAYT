-- Add admin policies for properties table
CREATE POLICY "Admins can delete any property" 
ON properties 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admins can update any property" 
ON properties 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Add cancel booking functionality
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS refund_amount NUMERIC DEFAULT 0;

-- Update booking status check constraint if it exists, or create enum
DO $$
BEGIN
    -- Try to add 'cancelled' to existing constraint or create new one
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name LIKE '%status%' 
        AND table_name = 'bookings'
    ) THEN
        ALTER TABLE bookings ADD CONSTRAINT bookings_status_check 
        CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled'));
    END IF;
EXCEPTION
    WHEN others THEN
        -- If constraint already exists or other issues, continue
        NULL;
END $$;