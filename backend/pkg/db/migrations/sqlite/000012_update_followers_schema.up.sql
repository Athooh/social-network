-- Migration to update followers table schema

PRAGMA foreign_keys=off;

-- Create new table with updated schema
CREATE TABLE followers_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    follower_id TEXT NOT NULL,
    following_id TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Copy data from old table to new table
INSERT INTO followers_new (follower_id, following_id, created_at)
SELECT follower_id, following_id, created_at FROM followers;

-- Drop old table and rename new table
DROP TABLE followers;
ALTER TABLE followers_new RENAME TO followers;


PRAGMA foreign_keys=on;
