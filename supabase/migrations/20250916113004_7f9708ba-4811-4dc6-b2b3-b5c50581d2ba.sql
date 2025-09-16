-- Check what values are allowed for price_type
SELECT conname, pg_get_constraintdef(oid) as constraint_definition 
FROM pg_constraint 
WHERE conname = 'properties_price_type_check';

-- Update the user's role to host since they should be a host
UPDATE profiles 
SET role = 'host', updated_at = now() 
WHERE email = 'princessmars08@gmail.com';

-- Check if there's a constraint on price_type that needs to be updated
-- If the constraint is too restrictive, we may need to drop and recreate it
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns 
WHERE table_name = 'properties' AND column_name = 'price_type';