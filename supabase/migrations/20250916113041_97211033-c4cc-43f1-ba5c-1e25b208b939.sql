-- Check what the constraint expects vs what we're sending
SELECT 
  tc.constraint_name, 
  tc.table_name, 
  cc.check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc 
  ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'properties' 
  AND tc.constraint_type = 'CHECK'
  AND tc.constraint_name LIKE '%price_type%';

-- Also check actual data that's being sent
SELECT DISTINCT price_type FROM properties WHERE price_type IS NOT NULL;

-- Let's see what values are currently failing by looking at recent properties attempts
SELECT category, price_type FROM properties ORDER BY created_at DESC LIMIT 5;