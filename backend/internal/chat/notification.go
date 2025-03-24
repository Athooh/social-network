package chat

import (
	"fmt"
	"time"

	models "github.com/Athooh/social-network/pkg/models/dbTables"
	"github.com/Athooh/social-network/pkg/websocket"
	"github.com/Athooh/social-network/pkg/websocket/events"
)

// NotificationService handles sending notifications related to chat operations
type NotificationService struct {
	hub *websocket.Hub
}

// NewNotificationService creates a new chat notification service
func NewNotificationService(hub *websocket.Hub) *NotificationService {
	return &NotificationService{hub: hub}
}

// NotifyNewMessage sends a notification when a new message is received
func (s *NotificationService) NotifyNewMessage(message *models.PrivateMessage) error {
	if s.hub == nil {
		return nil
	}

	// Create event for the message
	event := events.Event{
		Type: "private_message",
		Payload: map[string]interface{}{
			"messageId":    message.ID,
			"senderId":     message.SenderID,
			"receiverId":   message.ReceiverID,
			"content":      message.Content,
			"createdAt":    message.CreatedAt.Format(time.RFC3339),
			"isRead":       message.IsRead,
			"senderName":   fmt.Sprintf("%s %s", message.Sender.FirstName, message.Sender.LastName),
			"senderAvatar": message.Sender.Avatar,
		},
	}

	// Send to the recipient
	s.hub.BroadcastToUser(message.ReceiverID, event)

	// Also send to the sender to update their UI
	s.hub.BroadcastToUser(message.SenderID, event)

	return nil
}

// NotifyMessageRead sends a notification when messages are read
func (s *NotificationService) NotifyMessageRead(senderID, receiverID string, readAt time.Time) error {
	if s.hub == nil {
		return nil
	}

	// Create event for the read status update
	event := events.Event{
		Type: "messages_read",
		Payload: map[string]interface{}{
			"senderId":   senderID,
			"receiverId": receiverID,
			"readAt":     readAt.Format(time.RFC3339),
		},
	}

	// Notify both the sender and receiver
	s.hub.BroadcastToUser(senderID, event)
	s.hub.BroadcastToUser(receiverID, event)

	return nil
}

// NotifyTyping sends a notification when a user is typing
func (s *NotificationService) NotifyTyping(senderID, receiverID string) error {
	if s.hub == nil {
		return nil
	}

	// Create event for typing indicator
	event := events.Event{
		Type: "user_typing",
		Payload: map[string]interface{}{
			"senderId":   senderID,
			"receiverId": receiverID,
			"timestamp":  fmt.Sprintf("%d", time.Now().Unix()),
		},
	}

	// Send to the recipient only
	s.hub.BroadcastToUser(receiverID, event)

	return nil
}
