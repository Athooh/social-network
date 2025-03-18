-- Migration to update comments table schema

PRAGMA foreign_keys=off;

-- Create new table with updated schema
CREATE TABLE comments_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    image_path TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL
);

-- Copy data from old table to new table
INSERT INTO comments_new (id, post_id, user_id, content, image_path, created_at, updated_at)
SELECT id, post_id, user_id, content, image_path, created_at, updated_at FROM comments;

-- Drop old table and rename new table
DROP TABLE comments;
ALTER TABLE comments_new RENAME TO comments;

CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);

PRAGMA foreign_keys=on;
