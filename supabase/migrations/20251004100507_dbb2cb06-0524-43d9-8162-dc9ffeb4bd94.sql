-- Change default status from 'active' to 'pending' for all new properties
-- This ensures all properties require admin approval before being published
ALTER TABLE properties 
ALTER COLUMN status SET DEFAULT 'pending';