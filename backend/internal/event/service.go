package event

import (
	"errors"
	"fmt"
	"mime/multipart"
	"time"

	"github.com/Athooh/social-network/pkg/filestore"
	"github.com/Athooh/social-network/pkg/logger"
	models "github.com/Athooh/social-network/pkg/models/dbTables"
	"github.com/Athooh/social-network/pkg/websocket"
	"github.com/google/uuid"
)

// Service defines the interface for event business logic
type Service interface {
	// Event operations
	CreateEvent(groupID, userID, title, description string, eventDate time.Time, banner *multipart.FileHeader) (*models.GroupEvent, error)
	GetEvent(eventID, userID string) (*models.GroupEvent, error)
	GetGroupEvents(groupID, userID string) ([]*models.GroupEvent, error)
	UpdateEvent(eventID, userID, title, description string, eventDate time.Time, banner *multipart.FileHeader) (*models.GroupEvent, error)
	DeleteEvent(eventID, userID string) error

	// Event responses operations
	RespondToEvent(eventID, userID, response string) error
	GetEventResponses(eventID, userID string, responseType string) ([]*models.EventResponse, error)
}

// EventService implements the Service interface
type EventService struct {
	repo      Repository
	fileStore *filestore.FileStore
	log       *logger.Logger
	wsHub     *websocket.Hub
}

// NewService creates a new event service
func NewService(repo Repository, fileStore *filestore.FileStore, log *logger.Logger, wsHub *websocket.Hub) *EventService {
	return &EventService{
		repo:      repo,
		fileStore: fileStore,
		log:       log,
		wsHub:     wsHub,
	}
}

// CreateEvent creates a new event in a group
func (s *EventService) CreateEvent(groupID, userID, title, description string, eventDate time.Time, banner *multipart.FileHeader) (*models.GroupEvent, error) {
	// Check if user is a member of the group
	isMember, err := s.repo.IsGroupMember(groupID, userID)
	if err != nil {
		return nil, err
	}

	if !isMember {
		return nil, errors.New("you must be a member of the group to create an event")
	}

	// Create event
	event := &models.GroupEvent{
		ID:          uuid.New().String(),
		GroupID:     groupID,
		CreatorID:   userID,
		Title:       title,
		Description: description,
		EventDate:   eventDate,
	}

	// Handle banner upload if provided
	if banner != nil {
		bannerPath, err := s.fileStore.SaveFile(banner, "event_banners")
		if err != nil {
			return nil, fmt.Errorf("failed to save banner: %w", err)
		}
		event.BannerPath.String = bannerPath
		event.BannerPath.Valid = true
	}

	// Save event
	if err := s.repo.CreateEvent(event); err != nil {
		return nil, err
	}

	// Get full event with creator info
	fullEvent, err := s.repo.GetEventByID(event.ID)
	if err != nil {
		return nil, err
	}

	// Notify group members about new event
	s.notifyGroupEventCreated(fullEvent)

	return fullEvent, nil
}

// GetEvent gets an event by ID
func (s *EventService) GetEvent(eventID, userID string) (*models.GroupEvent, error) {
	// Get event
	event, err := s.repo.GetEventByID(eventID)
	if err != nil {
		return nil, err
	}

	// Check if user is a member of the group
	isMember, err := s.repo.IsGroupMember(event.GroupID, userID)
	if err != nil {
		return nil, err
	}

	if !isMember {
		return nil, errors.New("you must be a member of the group to view this event")
	}

	// Get user's response to this event
	userResponse, err := s.repo.GetUserEventResponse(eventID, userID)
	if err != nil {
		return nil, err
	}

	if userResponse != nil {
		event.UserResponse = userResponse.Response
	}

	return event, nil
}

// GetGroupEvents gets all events in a group
func (s *EventService) GetGroupEvents(groupID, userID string) ([]*models.GroupEvent, error) {
	// Check if user is a member of the group
	isMember, err := s.repo.IsGroupMember(groupID, userID)
	if err != nil {
		return nil, err
	}

	if !isMember {
		return nil, errors.New("you must be a member of the group to view events")
	}

	// Get events
	events, err := s.repo.GetGroupEvents(groupID)
	if err != nil {
		return nil, err
	}

	// Get user's response to each event
	for _, event := range events {
		userResponse, err := s.repo.GetUserEventResponse(event.ID, userID)
		if err != nil {
			return nil, err
		}

		if userResponse != nil {
			event.UserResponse = userResponse.Response
		}
	}

	return events, nil
}

// UpdateEvent updates an event
func (s *EventService) UpdateEvent(eventID, userID, title, description string, eventDate time.Time, banner *multipart.FileHeader) (*models.GroupEvent, error) {
	// Get event
	event, err := s.repo.GetEventByID(eventID)
	if err != nil {
		return nil, err
	}

	// Check if user is the creator or an admin
	if event.CreatorID != userID {
		// Check if user is an admin
		role, err := s.repo.GetMemberRole(event.GroupID, userID)
		if err != nil {
			return nil, err
		}

		if role != "admin" {
			return nil, errors.New("only the event creator or group admins can update this event")
		}
	}

	// Update fields
	event.Title = title
	event.Description = description
	event.EventDate = eventDate

	// Handle banner upload if provided
	if banner != nil {
		bannerPath, err := s.fileStore.SaveFile(banner, "event_banners")
		if err != nil {
			return nil, fmt.Errorf("failed to save banner: %w", err)
		}
		event.BannerPath.String = bannerPath
		event.BannerPath.Valid = true
	}

	// Update event
	if err := s.repo.UpdateEvent(event); err != nil {
		return nil, err
	}

	// Get updated event
	updatedEvent, err := s.repo.GetEventByID(eventID)
	if err != nil {
		return nil, err
	}

	// Notify group members about event update
	s.notifyGroupEventUpdated(updatedEvent)

	return updatedEvent, nil
}

// DeleteEvent deletes an event
func (s *EventService) DeleteEvent(eventID, userID string) error {
	// Get event
	event, err := s.repo.GetEventByID(eventID)
	if err != nil {
		return err
	}

	// Check if user is the creator or an admin
	if event.CreatorID != userID {
		// Check if user is an admin
		role, err := s.repo.GetMemberRole(event.GroupID, userID)
		if err != nil {
			return err
		}

		if role != "admin" {
			return errors.New("only the event creator or group admins can delete this event")
		}
	}

	// Delete event
	if err := s.repo.DeleteEvent(eventID); err != nil {
		return err
	}

	// Notify group members about event deletion
	s.notifyGroupEventDeleted(event)

	return nil
}

// RespondToEvent handles a user's response to an event
func (s *EventService) RespondToEvent(eventID, userID, responseType string) error {
	// Check if response type is valid
	if responseType != "going" && responseType != "not_going" {
		return errors.New("invalid response type")
	}

	// Get event
	event, err := s.repo.GetEventByID(eventID)
	if err != nil {
		return err
	}

	// Check if user is a member of the group
	isMember, err := s.repo.IsGroupMember(event.GroupID, userID)
	if err != nil {
		return err
	}

	if !isMember {
		return errors.New("you must be a member of the group to respond to this event")
	}

	// Create response
	response := &models.EventResponse{
		EventID:  eventID,
		UserID:   userID,
		Response: responseType,
	}

	// Save response
	if err := s.repo.AddEventResponse(response); err != nil {
		return err
	}

	// Notify group members about response
	s.notifyEventResponseUpdated(event, userID, responseType)

	return nil
}

// GetEventResponses gets all responses to an event
func (s *EventService) GetEventResponses(eventID, userID, responseType string) ([]*models.EventResponse, error) {
	// Get event
	event, err := s.repo.GetEventByID(eventID)
	if err != nil {
		return nil, err
	}

	// Check if user is a member of the group
	isMember, err := s.repo.IsGroupMember(event.GroupID, userID)
	if err != nil {
		return nil, err
	}

	if !isMember {
		return nil, errors.New("you must be a member of the group to view event responses")
	}

	// Get responses
	responses, err := s.repo.GetEventResponses(eventID, responseType)
	if err != nil {
		return nil, err
	}

	return responses, nil
}

// notifyGroupEventCreated notifies about group event creation
func (s *EventService) notifyGroupEventCreated(event *models.GroupEvent) {
	wsEvent := websocket.Message{
		Type: "group_event_created",
		Payload: map[string]interface{}{
			"event": event,
		},
	}

	// Notify all members
	members, _ := s.repo.GetGroupMembers(event.GroupID, "accepted")
	for _, member := range members {
		s.wsHub.BroadcastToUser(member.UserID, wsEvent)
	}
}

// notifyGroupEventUpdated notifies about group event updates
func (s *EventService) notifyGroupEventUpdated(event *models.GroupEvent) {
	wsEvent := websocket.Message{
		Type: "group_event_updated",
		Payload: map[string]interface{}{
			"event": event,
		},
	}

	// Notify all members
	members, _ := s.repo.GetGroupMembers(event.GroupID, "accepted")
	for _, member := range members {
		s.wsHub.BroadcastToUser(member.UserID, wsEvent)
	}
}

// notifyGroupEventDeleted notifies about group event deletion
func (s *EventService) notifyGroupEventDeleted(event *models.GroupEvent) {
	wsEvent := websocket.Message{
		Type: "group_event_deleted",
		Payload: map[string]interface{}{
			"eventId": event.ID,
			"groupId": event.GroupID,
		},
	}

	// Notify all members
	members, _ := s.repo.GetGroupMembers(event.GroupID, "accepted")
	for _, member := range members {
		s.wsHub.BroadcastToUser(member.UserID, wsEvent)
	}
}

// notifyEventResponseUpdated notifies about event response updates
func (s *EventService) notifyEventResponseUpdated(event *models.GroupEvent, userID, responseType string) {
	// Get user info
	user, err := s.repo.GetUserBasicByID(userID)
	if err != nil {
		s.log.Error("Failed to get user info for notification: %v", err)
		return
	}

	// Get updated counts
	going, notGoing, err := s.repo.GetEventResponseCounts(event.ID)
	if err != nil {
		s.log.Error("Failed to get response counts for notification: %v", err)
		return
	}

	wsEvent := websocket.Message{
		Type: "event_response_updated",
		Payload: map[string]interface{}{
			"eventId":       event.ID,
			"groupId":       event.GroupID,
			"userId":        userID,
			"userName":      user.FirstName + " " + user.LastName,
			"userAvatar":    user.Avatar,
			"responseType":  responseType,
			"goingCount":    going,
			"notGoingCount": notGoing,
		},
	}

	// Notify all members
	members, _ := s.repo.GetGroupMembers(event.GroupID, "accepted")
	for _, member := range members {
		s.wsHub.BroadcastToUser(member.UserID, wsEvent)
	}
}
