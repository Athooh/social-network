package websocket

import (
	"net/http"

	"github.com/Athooh/social-network/internal/auth"
	"github.com/Athooh/social-network/pkg/httputil"
	"github.com/Athooh/social-network/pkg/logger"
	ws "github.com/Athooh/social-network/pkg/websocket"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

// Handler handles WebSocket connections
type Handler struct {
	hub *ws.Hub
	log *logger.Logger
}

// NewHandler creates a new WebSocket handler
func NewHandler(hub *ws.Hub, log *logger.Logger) *Handler {
	return &Handler{
		hub: hub,
		log: log,
	}
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		// In production, you should check the origin
		return true
	},
}

// HandleConnection handles WebSocket connections
func (h *Handler) HandleConnection(w http.ResponseWriter, r *http.Request) {
	// Get user ID from context (set by auth middleware)
	userID, ok := auth.GetUserIDFromContext(r.Context())
	if !ok {
		httputil.SendError(w, http.StatusUnauthorized, "(WebSocket) Unauthorized", false)
		return
	}

	// Check for existing connection and close it
	// if h.hub.HasActiveClient(userID) {
	// 	h.log.Info("Closing existing connection for user: %s", userID)
	// 	// Close existing connections for this user
	// 	h.hub.CloseUserConnections(userID)
	// }

	// Upgrade HTTP connection to WebSocket
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		httputil.SendError(w, http.StatusInternalServerError, "(WebSocket) Failed to upgrade connection", false)
		return
	}

	// Create a new client
	client := &ws.Client{
		ID:       uuid.New().String(),
		UserID:   userID,
		Conn:     conn,
		Hub:      h.hub,
		Send:     make(chan []byte, 256),
		IsActive: true,
	}

	// Register client with hub
	h.hub.Register <- client

	h.log.Info("New WebSocket connection established for user: %s", userID)

	// Debug: Print existing connections

	// Start goroutines for reading and writing
	go client.ReadPump()
	go client.WritePump()

	// h.log.Info("Current active connections for user %s: %d", userID, h.hub.GetActiveConnectionCount(userID))
}
