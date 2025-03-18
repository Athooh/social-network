package models

import "time"

// FollowRequest represents a follow request between users
type FollowRequest struct {
	ID          string    `db:"id,pk"`
	FollowerID  string    `db:"follower_id,notnull" index:"" references:"users(id) ON DELETE CASCADE"`
	FollowingID string    `db:"following_id,notnull" index:"" references:"users(id) ON DELETE CASCADE"`
	Status      string    `db:"status,notnull"`
	CreatedAt   time.Time `db:"created_at,default=CURRENT_TIMESTAMP"`
	UpdatedAt   time.Time `db:"updated_at,default=CURRENT_TIMESTAMP"`
}

// Follower represents a follower relationship
type Follower struct {
	FollowerID  string    `db:"follower_id,notnull,pk(follower_id,following_id)" index:"" references:"users(id) ON DELETE CASCADE"`
	FollowingID string    `db:"following_id,notnull" index:"" references:"users(id) ON DELETE CASCADE"`
	CreatedAt   time.Time `db:"created_at,default=CURRENT_TIMESTAMP"`
}
