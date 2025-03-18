-- Revert migration for followers table

PRAGMA foreign_keys=off;

-- Create table with original schema
CREATE TABLE followers_new (
    follower_id TEXT NOT NULL,
    following_id TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Copy data back (best effort)
INSERT INTO followers_new (follower_id, following_id, created_at)
SELECT follower_id, following_id, created_at FROM followers;

-- Drop new table and rename temp table
DROP TABLE followers;
ALTER TABLE followers_new RENAME TO followers;


PRAGMA foreign_keys=on;
