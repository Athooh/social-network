CREATE TABLE IF NOT EXISTS post_viewers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    user_id TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_post_viewers_post_id ON post_viewers(post_id);
CREATE INDEX IF NOT EXISTS idx_post_viewers_user_id ON post_viewers(user_id);
