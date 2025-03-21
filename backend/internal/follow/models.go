package follow

import "time"

// FollowStatus represents the status of a follow request
type FollowStatus string

const (
	// StatusPending indicates a follow request is waiting for approval
	StatusPending FollowStatus = "pending"
	// StatusAccepted indicates a follow request has been accepted
	StatusAccepted FollowStatus = "accepted"
	// StatusDeclined indicates a follow request has been declined
	StatusDeclined FollowStatus = "declined"
)

// FollowRequest represents a follow request between users
type FollowRequest struct {
	ID          int64
	FollowerID  string // User who initiated the follow
	FollowingID string // User being followed
	Status      string // Status of the follow request (pending, accepted, declined)
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

// Follower represents an established follower relationship
type Follower struct {
	ID          int64
	FollowerID  string // User who is following
	FollowingID string // User being followed
	CreatedAt   time.Time
}
