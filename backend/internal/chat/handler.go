package chat

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/Athooh/social-network/pkg/httputil"
	"github.com/Athooh/social-network/pkg/logger"
)

// Handler handles HTTP requests for chat functionality
type Handler struct {
	service Service
	log     *logger.Logger
}

// NewHandler creates a new chat handler
func NewHandler(service Service, log *logger.Logger) *Handler {
	return &Handler{
		service: service,
		log:     log,
	}
}

// SendMessage handles sending a private message
func (h *Handler) SendMessage(w http.ResponseWriter, r *http.Request) {
	// Only allow POST method
	if r.Method != http.MethodPost {
		h.sendError(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	// Get user ID from context
	userID, ok := r.Context().Value("userID").(string)
	if !ok {
		h.sendError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	// Parse request body
	var request struct {
		ReceiverID string `json:"receiverId"`
		Content    string `json:"content"`
	}

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		h.sendError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if request.ReceiverID == "" || request.Content == "" {
		h.sendError(w, http.StatusBadRequest, "Receiver ID and content are required")
		return
	}

	// Send message
	message, err := h.service.SendMessage(userID, request.ReceiverID, request.Content)
	if err != nil {
		h.log.Error("Failed to send message: %v", err)
		h.sendError(w, http.StatusInternalServerError, err.Error())
		return
	}

	// Return response
	h.sendJSON(w, http.StatusCreated, message)
}

// GetMessages handles getting messages between two users
func (h *Handler) GetMessages(w http.ResponseWriter, r *http.Request) {
	// Only allow GET method
	if r.Method != http.MethodGet {
		h.sendError(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	// Get user ID from context
	userID, ok := r.Context().Value("userID").(string)
	if !ok {
		h.sendError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	// Get query parameters
	otherUserID := r.URL.Query().Get("userId")
	limitStr := r.URL.Query().Get("limit")
	offsetStr := r.URL.Query().Get("offset")

	if otherUserID == "" {
		h.sendError(w, http.StatusBadRequest, "User ID is required")
		return
	}

	limit := 50
	offset := 0

	if limitStr != "" {
		parsedLimit, err := strconv.Atoi(limitStr)
		if err == nil && parsedLimit > 0 {
			limit = parsedLimit
		}
	}

	if offsetStr != "" {
		parsedOffset, err := strconv.Atoi(offsetStr)
		if err == nil && parsedOffset >= 0 {
			offset = parsedOffset
		}
	}

	// Get messages
	messages, err := h.service.GetMessages(userID, otherUserID, limit, offset)
	if err != nil {
		h.log.Error("Failed to get messages: %v", err)
		h.sendError(w, http.StatusInternalServerError, err.Error())
		return
	}

	// Return response
	h.sendJSON(w, http.StatusOK, messages)
}

// MarkAsRead handles marking messages as read
func (h *Handler) MarkAsRead(w http.ResponseWriter, r *http.Request) {
	// Only allow POST method
	if r.Method != http.MethodPost {
		h.sendError(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	// Get user ID from context
	userID, ok := r.Context().Value("userID").(string)
	if !ok {
		h.sendError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	// Parse request body
	var request struct {
		SenderID string `json:"senderId"`
	}

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		h.sendError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if request.SenderID == "" {
		h.sendError(w, http.StatusBadRequest, "Sender ID is required")
		return
	}

	// Mark messages as read
	if err := h.service.MarkAsRead(request.SenderID, userID); err != nil {
		h.log.Error("Failed to mark messages as read: %v", err)
		h.sendError(w, http.StatusInternalServerError, err.Error())
		return
	}

	// Return success response
	h.sendJSON(w, http.StatusOK, map[string]bool{"success": true})
}

// GetContacts handles getting chat contacts
func (h *Handler) GetContacts(w http.ResponseWriter, r *http.Request) {
	// Only allow GET method
	if r.Method != http.MethodGet {
		h.sendError(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	// Get user ID from context
	userID, ok := r.Context().Value("userID").(string)
	if !ok {
		h.sendError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	// Get contacts
	contacts, err := h.service.GetContacts(userID)
	if err != nil {
		h.log.Error("Failed to get contacts: %v", err)
		h.sendError(w, http.StatusInternalServerError, err.Error())
		return
	}

	// Return response
	h.sendJSON(w, http.StatusOK, contacts)
}

// SendTypingIndicator handles sending typing indicators
func (h *Handler) SendTypingIndicator(w http.ResponseWriter, r *http.Request) {
	// Only allow POST method
	if r.Method != http.MethodPost {
		h.sendError(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	// Get user ID from context
	userID, ok := r.Context().Value("userID").(string)
	if !ok {
		h.sendError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	// Parse request body
	var request struct {
		ReceiverID string `json:"receiverId"`
	}

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		h.sendError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if request.ReceiverID == "" {
		h.sendError(w, http.StatusBadRequest, "Receiver ID is required")
		return
	}

	// Send typing indicator
	if err := h.service.SendTypingIndicator(userID, request.ReceiverID); err != nil {
		h.log.Error("Failed to send typing indicator: %v", err)
		h.sendError(w, http.StatusInternalServerError, err.Error())
		return
	}

	// Return success response
	h.sendJSON(w, http.StatusOK, map[string]bool{"success": true})
}

// Helper method to send JSON responses
func (h *Handler) sendJSON(w http.ResponseWriter, status int, data interface{}) {
	httputil.SendJSON(w, status, data)
}

// Helper method to send error responses
func (h *Handler) sendError(w http.ResponseWriter, status int, message string) {
	var isWarning bool = false
	if status >= 500 {
		isWarning = true
	}
	httputil.SendError(w, status, message, isWarning)
}
