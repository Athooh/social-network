package post

import (
	"encoding/json"

	models "github.com/Athooh/social-network/pkg/models/dbTables"
	"github.com/Athooh/social-network/pkg/websocket"
	"github.com/Athooh/social-network/pkg/websocket/events"
)

type NotificationService struct {
	hub *websocket.Hub
}

func NewNotificationService(hub *websocket.Hub) *NotificationService {
	return &NotificationService{hub: hub}
}

func (s *NotificationService) NotifyPostCreated(post interface{}, userID, userName string) error {
	event := events.Event{
		Type: events.PostCreated,
		Payload: events.PostCreatedPayload{
			Post:     post,
			UserID:   userID,
			UserName: userName,
		},
	}

	// Convert event to JSON and send it to the broadcast channel
	eventJSON, err := json.Marshal(event)
	if err != nil {
		return err
	}

	s.hub.Broadcast <- eventJSON
	return nil
}

// NotifyPostCreatedToSpecificUsers sends notifications about a new post to specific users
func (s *NotificationService) NotifyPostCreatedToSpecificUsers(post *models.Post, userID string, userName string, recipientIDs []string) error {
	// Create event payload
	payload := events.PostCreatedPayload{
		Post:     post,
		UserID:   userID,
		UserName: userName,
	}

	// Create event
	event := events.Event{
		Type:    events.PostCreated,
		Payload: payload,
	}

	// Send to each specific recipient
	for _, recipientID := range recipientIDs {
		// Don't notify the post creator
		if recipientID == userID {
			continue
		}

		s.hub.BroadcastToUser(recipientID, event)
	}

	return nil
}

// NotifyPostLiked sends a notification when a post is liked or unliked
func (s *NotificationService) NotifyPostLiked(post *models.Post, userID string, userName string, isLiked bool) error {
	// Create event payload
	payload := events.PostLikedPayload{
		PostID:     post.ID,
		UserID:     userID,
		UserName:   userName,
		IsLiked:    isLiked,
		LikesCount: int(post.LikesCount),
	}

	// Create event
	event := events.Event{
		Type:    events.PostLiked,
		Payload: payload,
	}

	// Notify the post owner if they're not the one who liked/unliked
	// if post.UserID != userID {
	// 	s.hub.BroadcastToUser(post.UserID, event)
	// }

	// Also broadcast to anyone viewing the post
	eventJSON, err := json.Marshal(event)
	if err != nil {
		return err
	}

	s.hub.Broadcast <- eventJSON
	return nil
}
