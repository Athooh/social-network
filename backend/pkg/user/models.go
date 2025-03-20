package user

import "time"

// Repository defines the user repository interface
type Repository interface {
	Create(user *User) error
	GetByID(id string) (*User, error)
	GetByEmail(email string) (*User, error)
	Update(user *User) error
	Delete(id string) error
}

// User represents a user in the system
type User struct {
	ID          string
	Email       string
	Password    string
	FirstName   string
	LastName    string
	DateOfBirth string
	Avatar      string
	Nickname    string
	AboutMe     string
	IsPublic    bool
	CreatedAt   time.Time
	UpdatedAt   time.Time
	PostsCount     int
    GroupsJoined   int
    FollowersCount int
    FollowingCount int
}
