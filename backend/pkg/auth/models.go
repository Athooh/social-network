package auth

import "time"

// SessionStore defines the interface for session storage
type SessionStore interface {
	CreateSession(userID string, expiresAt time.Time) (string, error)
	GetSession(sessionID string) (string, time.Time, error)
	DeleteSession(sessionID string) error
	DeleteUserSessions(userID string) error
	CleanExpired() error
}

// RegisterRequest represents the data needed for user registration
type RegisterRequest struct {
	Email       string `json:"email"`
	Password    string `json:"password"`
	FirstName   string `json:"firstName"`
	LastName    string `json:"lastName"`
	DateOfBirth string `json:"dateOfBirth"`
	Avatar      string `json:"avatar"`
	Nickname    string `json:"nickname"`
	AboutMe     string `json:"aboutMe"`
}

// LoginRequest represents the data needed for user login
type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// UserResponse represents the user data returned to the client
type UserResponse struct {
	ID          string    `json:"id"`
	Email       string    `json:"email"`
	FirstName   string    `json:"firstName"`
	LastName    string    `json:"lastName"`
	DateOfBirth string    `json:"dateOfBirth"`
	Avatar      string    `json:"avatar"`
	Nickname    string    `json:"nickname"`
	AboutMe     string    `json:"aboutMe"`
	IsPublic    bool      `json:"isPublic"`
	CreatedAt   time.Time `json:"createdAt"`
}

// TokenResponse represents the JWT token response
type TokenResponse struct {
	Token     string       `json:"token"`
	ExpiresIn int          `json:"expires_in"`
	User      UserResponse `json:"user"`
}
