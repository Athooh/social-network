package auth

import (
	"errors"
	"net/http"

	"github.com/Athooh/social-network/pkg/user"
)

// Service provides authentication functionality
type Service struct {
	userRepo       user.Repository
	sessionManager *SessionManager
}

// NewService creates a new authentication service
func NewService(userRepo user.Repository, sessionManager *SessionManager) *Service {
	return &Service{
		userRepo:       userRepo,
		sessionManager: sessionManager,
	}
}

// Register creates a new user account
func (s *Service) Register(req RegisterRequest) (*UserResponse, error) {
	// Check if user already exists
	existingUser, err := s.userRepo.GetByEmail(req.Email)
	if err == nil && existingUser != nil {
		return nil, errors.New("email already registered")
	}

	// Hash the password
	hashedPassword, err := HashPassword(req.Password)
	if err != nil {
		return nil, err
	}

	// Create the user
	newUser := &user.User{
		Email:       req.Email,
		Password:    hashedPassword,
		FirstName:   req.FirstName,
		LastName:    req.LastName,
		DateOfBirth: req.DateOfBirth,
		Avatar:      req.Avatar,
		Nickname:    req.Nickname,
		AboutMe:     req.AboutMe,
		IsPublic:    true, // Default to public profile
	}

	if err := s.userRepo.Create(newUser); err != nil {
		return nil, err
	}

	// Return user data without sensitive information
	return &UserResponse{
		ID:          newUser.ID,
		Email:       newUser.Email,
		FirstName:   newUser.FirstName,
		LastName:    newUser.LastName,
		DateOfBirth: newUser.DateOfBirth,
		Avatar:      newUser.Avatar,
		Nickname:    newUser.Nickname,
		AboutMe:     newUser.AboutMe,
		IsPublic:    newUser.IsPublic,
		CreatedAt:   newUser.CreatedAt,
	}, nil
}

// Login authenticates a user and creates a session
func (s *Service) Login(w http.ResponseWriter, req LoginRequest) (*UserResponse, error) {
	// Find the user by email
	user, err := s.userRepo.GetByEmail(req.Email)
	if err != nil {
		return nil, errors.New("invalid email or password")
	}

	// Check the password
	if !CheckPassword(user.Password, req.Password) {
		return nil, errors.New("invalid email or password")
	}

	// Create a session
	if err := s.sessionManager.CreateSession(w, user.ID); err != nil {
		return nil, err
	}

	// Return user data without sensitive information
	return &UserResponse{
		ID:          user.ID,
		Email:       user.Email,
		FirstName:   user.FirstName,
		LastName:    user.LastName,
		DateOfBirth: user.DateOfBirth,
		Avatar:      user.Avatar,
		Nickname:    user.Nickname,
		AboutMe:     user.AboutMe,
		IsPublic:    user.IsPublic,
		CreatedAt:   user.CreatedAt,
	}, nil
}

// Logout ends a user's session
func (s *Service) Logout(w http.ResponseWriter, r *http.Request) error {
	return s.sessionManager.ClearSession(w, r)
}

// GetCurrentUser retrieves the currently authenticated user
func (s *Service) GetCurrentUser(r *http.Request) (*UserResponse, error) {
	// Get user ID from session
	userID, err := s.sessionManager.GetUserFromSession(r)
	if err != nil {
		return nil, err
	}

	// Get user data
	user, err := s.userRepo.GetByID(userID)
	if err != nil {
		return nil, err
	}

	// Return user data without sensitive information
	return &UserResponse{
		ID:          user.ID,
		Email:       user.Email,
		FirstName:   user.FirstName,
		LastName:    user.LastName,
		DateOfBirth: user.DateOfBirth,
		Avatar:      user.Avatar,
		Nickname:    user.Nickname,
		AboutMe:     user.AboutMe,
		IsPublic:    user.IsPublic,
		CreatedAt:   user.CreatedAt,
	}, nil
}
