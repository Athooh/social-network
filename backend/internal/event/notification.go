package event

import (
	"fmt"
	"time"

	"github.com/Athooh/social-network/pkg/logger"
	models "github.com/Athooh/social-network/pkg/models/dbTables"
	"github.com/Athooh/social-network/pkg/websocket"
	"github.com/Athooh/social-network/pkg/websocket/events"
)

// NotificationService handles sending notifications related to event operations
type NotificationService struct {
	hub  *websocket.Hub
	repo Repository
	log  *logger.Logger
}

// NewNotificationService creates a new event notification service
func NewNotificationService(hub *websocket.Hub, repo Repository, log *logger.Logger) *NotificationService {
	return &NotificationService{
		hub:  hub,
		repo: repo,
		log:  log,
	}
}

// SendEventCreatedNotification sends a notification when a new event is created
func (s *NotificationService) SendEventCreatedNotification(event *models.GroupEvent) {
	if s.hub == nil {
		return
	}

	// Get creator info
	creator, err := s.repo.GetUserBasicByID(event.CreatorID)
	if err != nil {
		s.log.Warn("Failed to get creator info for notification: %v", err)
		return
	}

	creatorName := fmt.Sprintf("%s %s", creator.FirstName, creator.LastName)

	// Create notification event
	notificationEvent := events.Event{
		Type: "group_event_created",
		Payload: map[string]interface{}{
			"eventId":     event.ID,
			"groupId":     event.GroupID,
			"title":       event.Title,
			"creatorId":   event.CreatorID,
			"creatorName": creatorName,
			"eventDate":   event.EventDate.Format(time.RFC3339),
			"timestamp":   fmt.Sprintf("%d", time.Now().Unix()),
		},
	}

	// Get group members to notify
	members, err := s.repo.GetGroupMembers(event.GroupID, "accepted")
	if err != nil {
		s.log.Warn("Failed to get group members for notification: %v", err)
		return
	}

	// Send to all group members
	for _, member := range members {
		s.hub.BroadcastToUser(member.UserID, notificationEvent)
	}
}

// SendEventUpdatedNotification sends a notification when an event is updated
func (s *NotificationService) SendEventUpdatedNotification(event *models.GroupEvent) {
	if s.hub == nil {
		return
	}

	// Create notification event
	notificationEvent := events.Event{
		Type: "group_event_updated",
		Payload: map[string]interface{}{
			"eventId":   event.ID,
			"groupId":   event.GroupID,
			"title":     event.Title,
			"eventDate": event.EventDate.Format(time.RFC3339),
			"timestamp": fmt.Sprintf("%d", time.Now().Unix()),
		},
	}

	// Get group members to notify
	members, err := s.repo.GetGroupMembers(event.GroupID, "accepted")
	if err != nil {
		s.log.Warn("Failed to get group members for notification: %v", err)
		return
	}

	// Send to all group members
	for _, member := range members {
		s.hub.BroadcastToUser(member.UserID, notificationEvent)
	}
}

// SendEventResponseNotification sends a notification when a user responds to an event
func (s *NotificationService) SendEventResponseNotification(eventID, userID, response string) {
	if s.hub == nil {
		return
	}

	// Get event info
	event, err := s.repo.GetEventByID(eventID)
	if err != nil {
		s.log.Warn("Failed to get event info for notification: %v", err)
		return
	}

	// Get user info
	user, err := s.repo.GetUserBasicByID(userID)
	if err != nil {
		s.log.Warn("Failed to get user info for notification: %v", err)
		return
	}

	userName := fmt.Sprintf("%s %s", user.FirstName, user.LastName)

	// Create notification event
	notificationEvent := events.Event{
		Type: "event_response_updated",
		Payload: map[string]interface{}{
			"eventId":   eventID,
			"groupId":   event.GroupID,
			"title":     event.Title,
			"userId":    userID,
			"userName":  userName,
			"response":  response,
			"timestamp": fmt.Sprintf("%d", time.Now().Unix()),
		},
	}

	// Send to event creator
	s.hub.BroadcastToUser(event.CreatorID, notificationEvent)
}
