package events

// EventType defines the type of WebSocket event
type EventType string

const (
	PostCreated EventType = "post_created"
)

// Event represents a WebSocket event
type Event struct {
	Type    EventType   `json:"type"`
	Payload interface{} `json:"payload"`
}

// PostCreatedPayload represents the payload for a post_created event
type PostCreatedPayload struct {
	Post     interface{} `json:"post"`
	UserID   string      `json:"userId"`
	UserName string      `json:"userName"`
}
