package models

import (
	"time"
)

// Privacy level constants
const (
	PrivacyPublic        = "public"
	PrivacyAlmostPrivate = "almost_private"
	PrivacyPrivate       = "private"
)

// Post represents a user post in the database
type Post struct {
	ID        int64     `db:"id,pk"`
	UserID    int64     `db:"user_id,notnull" index:"idx_post_user_id"`
	Content   string    `db:"content,notnull"`
	ImagePath string    `db:"image_path"`
	Privacy   string    `db:"privacy,notnull"`
	CreatedAt time.Time `db:"created_at,notnull"`
	UpdatedAt time.Time `db:"updated_at,notnull"`
}

// PostViewer represents which users can view a private post
type PostViewer struct {
	ID     int64 `db:"id,pk"`
	PostID int64 `db:"post_id,notnull" index:"idx_post_viewer_post_id"`
	UserID int64 `db:"user_id,notnull" index:"idx_post_viewer_user_id"`
}

// Comment represents a comment on a post
type Comment struct {
	ID        int64     `db:"id,pk"`
	PostID    int64     `db:"post_id,notnull" index:"idx_comment_post_id"`
	UserID    int64     `db:"user_id,notnull" index:"idx_comment_user_id"`
	Content   string    `db:"content,notnull"`
	ImagePath string    `db:"image_path"`
	CreatedAt time.Time `db:"created_at,notnull"`
	UpdatedAt time.Time `db:"updated_at,notnull"`
}
