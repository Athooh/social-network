CREATE TABLE IF NOT EXISTS user_statss (
    user_id TEXT PRIMARY KEY,
    posts_count INTEGER DEFAULT 0,
    groups_joined INTEGER DEFAULT 0,
    followers_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    last_activity_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_statss_user_id ON user_statss(user_id);
