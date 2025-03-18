-- Migration to update follow_requests table schema

PRAGMA foreign_keys=off;

-- Create new table with updated schema
CREATE TABLE follow_requests_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    follower_id TEXT NOT NULL,
    following_id TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Copy data from old table to new table
INSERT INTO follow_requests_new (id, follower_id, following_id, status, created_at, updated_at)
SELECT id, follower_id, following_id, status, created_at, updated_at FROM follow_requests;

-- Drop old table and rename new table
DROP TABLE follow_requests;
ALTER TABLE follow_requests_new RENAME TO follow_requests;


PRAGMA foreign_keys=on;
