-- Migration to update posts table schema

PRAGMA foreign_keys=off;

-- Create new table with updated schema
CREATE TABLE posts_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    content TEXT NOT NULL,
    image_path TEXT,
    video_path TEXT,
    privacy TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL
);

-- Copy data from old table to new table
INSERT INTO posts_new (id, user_id, content, image_path, privacy, created_at, updated_at)
SELECT id, user_id, content, image_path, privacy, created_at, updated_at FROM posts;

-- Drop old table and rename new table
DROP TABLE posts;
ALTER TABLE posts_new RENAME TO posts;

CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);

PRAGMA foreign_keys=on;
