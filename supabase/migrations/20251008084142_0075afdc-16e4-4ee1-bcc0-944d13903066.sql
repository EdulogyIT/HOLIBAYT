-- Delete all duplicates by keeping only the record with the minimum id for each payment_id
WITH duplicates AS (
  SELECT id, payment_id,
    ROW_NUMBER() OVER (PARTITION BY payment_id ORDER BY created_at ASC, id ASC) as rn
  FROM commission_transactions
)
DELETE FROM commission_transactions
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- Now add unique constraint
ALTER TABLE commission_transactions
ADD CONSTRAINT unique_payment_commission 
UNIQUE (payment_id);