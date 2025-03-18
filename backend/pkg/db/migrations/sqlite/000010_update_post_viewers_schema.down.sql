-- Revert migration for post_viewers table

PRAGMA foreign_keys=off;

-- Create table with original schema
CREATE TABLE post_viewers_new (
    post_id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT PRIMARY KEY NOT NULL
);

-- Copy data back (best effort)
INSERT INTO post_viewers_new (post_id, user_id)
SELECT post_id, user_id FROM post_viewers;

-- Drop new table and rename temp table
DROP TABLE post_viewers;
ALTER TABLE post_viewers_new RENAME TO post_viewers;


PRAGMA foreign_keys=on;
