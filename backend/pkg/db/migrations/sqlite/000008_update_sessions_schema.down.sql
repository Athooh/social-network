-- Revert migration for sessions table

PRAGMA foreign_keys=off;

-- Create table with original schema
CREATE TABLE sessions_new (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Copy data back (best effort)
INSERT INTO sessions_new (id, user_id, expires_at, created_at)
SELECT id, user_id, expires_at, created_at FROM sessions;

-- Drop new table and rename temp table
DROP TABLE sessions;
ALTER TABLE sessions_new RENAME TO sessions;

CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);

PRAGMA foreign_keys=on;
