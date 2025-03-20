package websocket

import (
	"encoding/json"
	"sync"
	"time"

	"github.com/Athooh/social-network/pkg/logger"
	"github.com/gorilla/websocket"
)

// Client represents a connected WebSocket client
type Client struct {
	ID       string
	UserID   string
	Conn     *websocket.Conn
	Hub      *Hub
	Send     chan []byte
	Mu       sync.Mutex
	IsActive bool
}

// Hub maintains the set of active clients and broadcasts messages
type Hub struct {
	// Registered clients
	Clients map[*Client]bool

	// User ID to clients mapping for targeted messages
	UserClients map[string][]*Client

	// Inbound messages from clients
	Broadcast chan []byte

	// Register requests from clients
	Register chan *Client

	// Unregister requests from clients
	Unregister chan *Client

	// Mutex for concurrent access to maps
	Mu sync.RWMutex

	// Logger
	log *logger.Logger
}

// Message represents a WebSocket message
type Message struct {
	Type    string      `json:"type"`
	Payload interface{} `json:"payload"`
}

// NewHub creates a new Hub instance
func NewHub(log *logger.Logger) *Hub {
	return &Hub{
		Broadcast:   make(chan []byte),
		Register:    make(chan *Client),
		Unregister:  make(chan *Client),
		Clients:     make(map[*Client]bool),
		UserClients: make(map[string][]*Client),
		Mu:          sync.RWMutex{},
		log:         log,
	}
}

// Run starts the Hub
func (h *Hub) Run() {
	for {
		select {
		case client := <-h.Register:
			h.Mu.Lock()
			h.Clients[client] = true

			// Add to user-specific clients map
			h.UserClients[client.UserID] = append(h.UserClients[client.UserID], client)
			h.Mu.Unlock()

			h.log.Debug("Client registered: %s (User: %s)", client.ID, client.UserID)

		case client := <-h.Unregister:
			h.Mu.Lock()
			if _, ok := h.Clients[client]; ok {
				delete(h.Clients, client)
				close(client.Send)

				// Remove from user-specific clients map
				clients := h.UserClients[client.UserID]
				for i, c := range clients {
					if c.ID == client.ID {
						h.UserClients[client.UserID] = append(clients[:i], clients[i+1:]...)
						break
					}
				}

				// Clean up empty user entries
				if len(h.UserClients[client.UserID]) == 0 {
					delete(h.UserClients, client.UserID)
				}

				h.log.Debug("Client unregistered: %s (User: %s)", client.ID, client.UserID)
			}
			h.Mu.Unlock()

		case message := <-h.Broadcast:
			h.Mu.RLock()
			for client := range h.Clients {
				logger.Warn("Sending message to client %s", client.UserID)
				select {
				case client.Send <- message:
				default:
					close(client.Send)
					delete(h.Clients, client)
				}
			}
			h.Mu.RUnlock()
		}
	}
}

// BroadcastToAll sends a message to all connected clients
func (h *Hub) BroadcastToAll(message interface{}) {
	msgType, payload := prepareMessage("broadcast", message)
	h.Broadcast <- payload
	h.log.Debug("Broadcasting message type: %s to all clients", msgType)
}

// BroadcastToUser sends a message to a specific user's clients
func (h *Hub) BroadcastToUser(userID string, message interface{}) {
	_, payload := prepareMessage("user", message)

	h.Mu.RLock()
	clients, exists := h.UserClients[userID]
	h.Mu.RUnlock()

	if !exists {
		return
	}

	for _, client := range clients {
		client.Mu.Lock()
		if client.IsActive {
			select {
			case client.Send <- payload:
				h.log.Info("Sent message to user %s client %s", userID, client.ID)
			default:
				h.log.Info("Failed to send message to user %s client %s", userID, client.ID)
			}
		}
		client.Mu.Unlock()
	}
}

// BroadcastToFollowers sends a message to all followers of a user
// func (h *Hub) BroadcastToFollowers(userID string, followerIDs []string, message interface{}) {
// 	_, payload := prepareMessage("followers", message)

// 	// Send to the user themselves
// 	h.BroadcastToUser(userID, message)

// 	// Send to all followers
// 	for _, followerID := range followerIDs {
// 		h.BroadcastToUser(followerID, message)
// 	}
// }

// prepareMessage formats a message for sending
func prepareMessage(msgType string, payload interface{}) (string, []byte) {
	msg := Message{
		Type:    msgType,
		Payload: payload,
	}

	data, _ := json.Marshal(msg)
	return msgType, data
}

// HasActiveClient checks if a user already has an active client connection
func (h *Hub) HasActiveClient(userID string) bool {
	h.Mu.RLock()
	defer h.Mu.RUnlock()

	// Check if user has any active connections
	clients, exists := h.UserClients[userID]
	if !exists {
		return false
	}

	// Check if any of the user's clients are active
	for _, client := range clients {
		if client.IsActive {
			return true
		}
	}
	return false
}

// ReadPump pumps messages from the WebSocket connection to the hub
func (c *Client) ReadPump() {
	defer func() {
		c.Hub.Unregister <- c
		c.Conn.Close()
	}()

	c.Conn.SetReadLimit(512 * 1024) // 512KB max message size
	c.Conn.SetReadDeadline(time.Now().Add(60 * time.Second))
	c.Conn.SetPongHandler(func(string) error {
		c.Conn.SetReadDeadline(time.Now().Add(60 * time.Second))
		return nil
	})

	for {
		_, message, err := c.Conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				c.Hub.log.Error("WebSocket read error: %v", err)
			}
			break
		}

		// Handle ping/pong
		var msg Message
		if err := json.Unmarshal(message, &msg); err != nil {
			c.Hub.log.Error("Error unmarshaling message: %v", err)
			continue
		}

		if msg.Type == "ping" {
			c.handlePing()
			continue
		}

		// Process incoming messages if needed
		// For now, we're just handling server -> client communication
		c.Hub.log.Debug("Received message from client %s: %s", c.ID, string(message))
	}
}

// WritePump pumps messages from the hub to the WebSocket connection
func (c *Client) WritePump() {
	ticker := time.NewTicker(30 * time.Second)
	defer func() {
		ticker.Stop()
		c.Conn.Close()
	}()

	for {
		select {
		case message, ok := <-c.Send:
			c.Conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if !ok {
				// The hub closed the channel
				c.Conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := c.Conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write(message)

			// Add queued messages to the current WebSocket message
			n := len(c.Send)
			for i := 0; i < n; i++ {
				w.Write([]byte{'\n'})
				w.Write(<-c.Send)
			}

			if err := w.Close(); err != nil {
				return
			}
		case <-ticker.C:
			c.Conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if err := c.Conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

func (h *Hub) GetActiveConnectionCount(userID string) int {
	h.Mu.RLock()
	defer h.Mu.RUnlock()

	count := 0
	for client := range h.Clients {
		if client.UserID == userID && client.IsActive {
			count++
		}
	}
	return count
}

func (h *Hub) CloseUserConnections(userID string) {
	h.Mu.Lock()
	defer h.Mu.Unlock()

	if clients, exists := h.UserClients[userID]; exists {
		for _, client := range clients {
			if client.IsActive {
				client.IsActive = false
				client.Conn.Close()
				h.Unregister <- client
			}
		}
		// Clear the user's client list
		delete(h.UserClients, userID)
	}
}

func (c *Client) handlePing() {
	pong := Message{
		Type: "pong",
	}

	data, err := json.Marshal(pong)
	if err != nil {
		c.Hub.log.Error("Error marshaling pong message: %v", err)
		return
	}

	c.Hub.log.Debug("Sending pong to client %s", c.ID)

	c.Send <- data
}
