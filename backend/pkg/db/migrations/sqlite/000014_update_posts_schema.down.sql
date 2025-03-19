-- Revert migration for posts table

PRAGMA foreign_keys=off;

-- Create table with original schema
CREATE TABLE posts_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    content TEXT NOT NULL,
    image_path TEXT,
    privacy TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL
);

-- Copy data back (best effort)
INSERT INTO posts_new (id, user_id, content, image_path, privacy, created_at, updated_at)
SELECT id, user_id, content, image_path, privacy, created_at, updated_at FROM posts;

-- Drop new table and rename temp table
DROP TABLE posts;
ALTER TABLE posts_new RENAME TO posts;

CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);

PRAGMA foreign_keys=on;
