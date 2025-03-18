package models

import "time"

// Post represents a user post
type Post struct {
	ID        string    `db:"id,pk"`
	UserID    string    `db:"user_id,notnull" index:"" references:"users(id) ON DELETE CASCADE"`
	Content   string    `db:"content,notnull"`
	ImagePath string    `db:"image_path"`
	Privacy   string    `db:"privacy,notnull"`
	CreatedAt time.Time `db:"created_at,default=CURRENT_TIMESTAMP"`
	UpdatedAt time.Time `db:"updated_at,default=CURRENT_TIMESTAMP"`
}

// PostViewer represents a user who can view a post
type PostViewer struct {
	PostID string `db:"post_id" references:"posts(id) ON DELETE CASCADE"`
	UserID string `db:"user_id" references:"users(id) ON DELETE CASCADE"`
	// Add a composite primary key tag that will be processed correctly
	_ string `db:",pk(post_id,user_id)"`
}
