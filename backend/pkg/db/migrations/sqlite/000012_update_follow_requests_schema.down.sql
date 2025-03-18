-- Revert migration for follow_requests table

PRAGMA foreign_keys=off;

-- Create table with original schema
CREATE TABLE follow_requests_new (
    id TEXT PRIMARY KEY,
    follower_id TEXT NOT NULL,
    following_id TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Copy data back (best effort)
INSERT INTO follow_requests_new (id, follower_id, following_id, status, created_at, updated_at)
SELECT id, follower_id, following_id, status, created_at, updated_at FROM follow_requests;

-- Drop new table and rename temp table
DROP TABLE follow_requests;
ALTER TABLE follow_requests_new RENAME TO follow_requests;

CREATE INDEX IF NOT EXISTS idx_follow_requests_following ON follow_requests(following_id);
CREATE INDEX IF NOT EXISTS idx_follow_requests_follower ON follow_requests(follower_id);

PRAGMA foreign_keys=on;
