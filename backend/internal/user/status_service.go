package user

import (
	"github.com/Athooh/social-network/pkg/logger"
	"github.com/Athooh/social-network/pkg/user"
	"github.com/Athooh/social-network/pkg/websocket"
	"github.com/Athooh/social-network/pkg/websocket/events"
)

// StatusService handles user online/offline status
type StatusService struct {
	statusRepo user.StatusRepository
	hub        *websocket.Hub
	log        *logger.Logger
}

// NewStatusService creates a new user status service
func NewStatusService(statusRepo user.StatusRepository, hub *websocket.Hub, log *logger.Logger) *StatusService {
	return &StatusService{
		statusRepo: statusRepo,
		hub:        hub,
		log:        log,
	}
}

// SetUserOnline marks a user as online and notifies followers
func (s *StatusService) SetUserOnline(userID string) error {
	// Update database
	if err := s.statusRepo.SetUserOnline(userID); err != nil {
		s.log.Error("Failed to set user online status: %v", err)
		return err
	}

	// Get followers to notify
	followerIDs, err := s.statusRepo.GetFollowersForStatusUpdate(userID)
	if err != nil {
		s.log.Error("Failed to get followers for status update: %v", err)
		return err
	}

	// Create status update event
	event := events.Event{
		Type: "user_status_update",
		Payload: map[string]interface{}{
			"userId":   userID,
			"isOnline": true,
		},
	}

	// Notify followers
	for _, followerID := range followerIDs {
		s.hub.BroadcastToUser(followerID, event)
	}

	return nil
}

// SetUserOffline marks a user as offline and notifies followers
func (s *StatusService) SetUserOffline(userID string) error {
	// Update database
	if err := s.statusRepo.SetUserOffline(userID); err != nil {
		s.log.Error("Failed to set user offline status: %v", err)
		return err
	}

	// Get followers to notify
	followerIDs, err := s.statusRepo.GetFollowersForStatusUpdate(userID)
	if err != nil {
		s.log.Error("Failed to get followers for status update: %v", err)
		return err
	}

	// Create status update event
	event := events.Event{
		Type: "user_status_update",
		Payload: map[string]interface{}{
			"userId":   userID,
			"isOnline": false,
		},
	}

	// Notify followers
	for _, followerID := range followerIDs {
		s.hub.BroadcastToUser(followerID, event)
	}

	s.log.Info("User %s is offline", userID)

	return nil
}

// GetUserStatus gets a user's online status
func (s *StatusService) GetUserStatus(userID string) (bool, error) {
	return s.statusRepo.GetUserStatus(userID)
}
