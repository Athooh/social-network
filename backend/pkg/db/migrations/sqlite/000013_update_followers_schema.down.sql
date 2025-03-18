-- Revert migration for followers table

PRAGMA foreign_keys=off;

-- Create table with original schema
CREATE TABLE followers_new (
    follower_id TEXT PRIMARY KEY NOT NULL,
    following_id TEXT PRIMARY KEY NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Copy data back (best effort)
INSERT INTO followers_new (follower_id, following_id, created_at)
SELECT follower_id, following_id, created_at FROM followers;

-- Drop new table and rename temp table
DROP TABLE followers;
ALTER TABLE followers_new RENAME TO followers;

CREATE INDEX IF NOT EXISTS idx_followers_following ON followers(following_id);
CREATE INDEX IF NOT EXISTS idx_followers_follower ON followers(follower_id);

PRAGMA foreign_keys=on;
