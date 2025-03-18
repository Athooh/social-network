-- Migration to update sessions table schema

PRAGMA foreign_keys=off;

-- Create new table with updated schema
CREATE TABLE sessions_new (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Copy data from old table to new table
INSERT INTO sessions_new (id, user_id, expires_at, created_at)
SELECT id, user_id, expires_at, created_at FROM sessions;

-- Drop old table and rename new table
DROP TABLE sessions;
ALTER TABLE sessions_new RENAME TO sessions;


PRAGMA foreign_keys=on;
