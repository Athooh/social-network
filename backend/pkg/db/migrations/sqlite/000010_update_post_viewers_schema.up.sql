-- Migration to update post_viewers table schema

PRAGMA foreign_keys=off;

-- Create new table with updated schema
CREATE TABLE post_viewers_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    user_id TEXT NOT NULL
);

-- Copy data from old table to new table
INSERT INTO post_viewers_new (post_id, user_id)
SELECT post_id, user_id FROM post_viewers;

-- Drop old table and rename new table
DROP TABLE post_viewers;
ALTER TABLE post_viewers_new RENAME TO post_viewers;

CREATE INDEX IF NOT EXISTS idx_post_viewers_post_id ON post_viewers(post_id);
CREATE INDEX IF NOT EXISTS idx_post_viewers_user_id ON post_viewers(user_id);

PRAGMA foreign_keys=on;
