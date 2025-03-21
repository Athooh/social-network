package events

// EventType defines the type of WebSocket event
type EventType string

const (
	PostCreated      EventType = "post_created"
	PostLiked        EventType = "post_liked"
	UserStatsUpdated EventType = "user_stats_updated"
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

// PostLikedPayload represents the data sent when a post is liked/unliked
type PostLikedPayload struct {
	PostID     int64  `json:"postId"`
	UserID     string `json:"userId"`
	UserName   string `json:"userName"`
	IsLiked    bool   `json:"isLiked"`
	LikesCount int    `json:"likesCount"`
}

type UserStatsUpdatedPayload struct {
	UserID    string `json:"userId"`
	StatsType string `json:"statsType"`
	Count     int    `json:"count"`
}
