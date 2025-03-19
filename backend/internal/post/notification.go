package post

import (
	"encoding/json"

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
