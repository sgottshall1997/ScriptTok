-- Cleanup script for test data generated during production testing
-- Run this to remove test entries from content history and related tables

-- Remove content entries from the last 2 hours (testing period)
DELETE FROM content_evaluations 
WHERE content_history_id IN (
  SELECT id FROM content_history 
  WHERE created_at > NOW() - INTERVAL '2 hours'
  AND (product_name LIKE '%Sony WH-1000XM5%' OR product_name LIKE '%Skincare Serum%')
);

DELETE FROM content_history 
WHERE created_at > NOW() - INTERVAL '2 hours'
AND (product_name LIKE '%Sony WH-1000XM5%' OR product_name LIKE '%Skincare Serum%');

-- Verify cleanup
SELECT COUNT(*) as remaining_recent_entries 
FROM content_history 
WHERE created_at > NOW() - INTERVAL '2 hours';