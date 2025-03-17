package auth

import (
	"encoding/json"
	"net/http"

	"github.com/Athooh/social-network/pkg/filestore"
	"github.com/Athooh/social-network/pkg/logger"
)

// Handler provides HTTP handlers for authentication
type Handler struct {
	service   *Service
	fileStore *filestore.FileStore
}

// NewHandler creates a new authentication handler
func NewHandler(service *Service, fileStore *filestore.FileStore) *Handler {
	return &Handler{
		service:   service,
		fileStore: fileStore,
	}
}

// Register handles user registration
func (h *Handler) Register(w http.ResponseWriter, r *http.Request) {
	// Only allow POST method
	if r.Method != http.MethodPost {
		h.sendError(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	// Parse multipart form with 10MB max memory
	if err := r.ParseMultipartForm(10 << 20); err != nil {
		h.sendError(w, http.StatusBadRequest, "Failed to parse form data")
		return
	}

	// Get form fields
	req := RegisterRequest{
		Email:       r.FormValue("email"),
		Password:    r.FormValue("password"),
		FirstName:   r.FormValue("firstName"),
		LastName:    r.FormValue("lastName"),
		DateOfBirth: r.FormValue("dateOfBirth"),
		Nickname:    r.FormValue("nickname"),
		AboutMe:     r.FormValue("aboutMe"),
	}

	// Validate required fields
	if req.Email == "" || req.Password == "" ||
		req.FirstName == "" || req.LastName == "" || req.DateOfBirth == "" {
		h.sendError(w, http.StatusBadRequest, "Missing required fields")
		return
	}

	// Handle avatar upload if present
	if file, header, err := r.FormFile("avatar"); err == nil {
		defer file.Close()

		filename, err := h.fileStore.SaveFile(header)
		if err != nil {
			logger.Error("Failed to save avatar: %v", map[string]interface{}{
				"error": err.Error(),
			})
			h.sendError(w, http.StatusInternalServerError, "Failed to save avatar")
			return
		}
		req.Avatar = filename
	}

	// Register the user
	tokenResponse, err := h.service.Register(req)
	if err != nil {
		logger.Error("Failed to register user: %v", map[string]interface{}{
			"error": err.Error(),
		})
		h.sendError(w, http.StatusBadRequest, err.Error())
		return
	}

	// Create a session
	if err := h.service.sessionManager.CreateSession(w, tokenResponse.User.ID); err != nil {
		logger.Error("Failed to create session: %v", map[string]interface{}{
			"error": err.Error(),
		})
		h.sendError(w, http.StatusInternalServerError, "Failed to create session")
		return
	}

	logger.Info("User registered successfully")

	// Return success response
	h.sendJSON(w, http.StatusCreated, tokenResponse)
}

// Helper method to send JSON responses
func (h *Handler) sendJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

// Helper method to send error responses
func (h *Handler) sendError(w http.ResponseWriter, status int, message string) {
	logger.Error(message, map[string]interface{}{
		"status": status,
	})
	h.sendJSON(w, status, map[string]string{"error": message})
}

// Logout handles user logout
func (h *Handler) Logout(w http.ResponseWriter, r *http.Request) {
	// Only allow POST method
	if r.Method != http.MethodPost {
		logger.Error("Method not allowed: %s", map[string]interface{}{
			"method": r.Method,
			"path":   r.URL.Path,
			"status": http.StatusMethodNotAllowed,
		})
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(map[string]string{"error": "Method not allowed"})
		return
	}

	// Logout the user
	if err := h.service.Logout(w, r); err != nil {
		logger.Error("Failed to logout user: %v", map[string]interface{}{
			"error": err.Error(),
		})
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to logout"})
		return
	}

	// Return success
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Logged out successfully"})
}

// Me returns the current user's information
func (h *Handler) Me(w http.ResponseWriter, r *http.Request) {
	// Only allow GET method
	if r.Method != http.MethodGet {
		logger.Error("Method not allowed: %s", map[string]interface{}{
			"method": r.Method,
			"path":   r.URL.Path,
			"status": http.StatusMethodNotAllowed,
		})
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(map[string]string{"error": "Method not allowed"})
		return
	}

	// Get the current user
	user, err := h.service.GetCurrentUser(r)
	if err != nil {
		logger.Error("Failed to get current user: %v", map[string]interface{}{
			"error": err.Error(),
		})
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]string{"error": "Not authenticated"})
		return
	}

	// Return the user data
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(user)
}

// LoginJWT handles user login with JWT authentication
func (h *Handler) LoginJWT(w http.ResponseWriter, r *http.Request) {
	// Only allow POST method
	if r.Method != http.MethodPost {
		logger.Error("Method not allowed: %s", map[string]interface{}{
			"method": r.Method,
			"path":   r.URL.Path,
			"status": http.StatusMethodNotAllowed,
		})
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(map[string]string{"error": "Method not allowed"})
		return
	}

	// Parse request body
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		logger.Error("Invalid request body: %v", map[string]interface{}{
			"status": http.StatusBadRequest,
		})
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request body"})
		return
	}

	// Validate required fields
	if req.Email == "" || req.Password == "" {
		logger.Error("Missing email or password: %v", map[string]interface{}{
			"status": http.StatusBadRequest,
		})
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Missing email or password"})
		return
	}

	// Login the user with JWT
	tokenResponse, err := h.service.LoginWithJWT(req)
	if err != nil {
		logger.Error("Failed to login user: %v", map[string]interface{}{
			"error": err.Error(),
		})
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}
	logger.Info("creating session: %s", map[string]interface{}{
		"email": req.Email,
	})
	// Create a session
	if err := h.service.sessionManager.CreateSession(w, tokenResponse.User.ID); err != nil {
		logger.Error("Failed to create session: %v", map[string]interface{}{
			"error": err.Error(),
		})
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to create session"})
		return
	}

	// Return the token
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(tokenResponse)
}

// ValidateToken validates a JWT token
func (h *Handler) ValidateToken(w http.ResponseWriter, r *http.Request) {
	// Only allow GET method
	if r.Method != http.MethodGet {
		logger.Error("Method not allowed: %s", map[string]interface{}{
			"method": r.Method,
			"path":   r.URL.Path,
			"status": http.StatusMethodNotAllowed,
		})
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(map[string]string{"error": "Method not allowed"})
		return
	}

	// Extract token from request
	tokenString, err := ExtractTokenFromRequest(r)
	if err != nil {
		logger.Warn("Token validation failed: %v", map[string]interface{}{
			"error": err.Error(),
		})
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid token"})
		return
	}

	// Validate token
	_, err = ValidateToken(tokenString, h.service.jwtConfig)
	if err != nil {
		logger.Warn("Invalid token: %v", map[string]interface{}{
			"error": err.Error(),
		})
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid token"})
		return
	}

	// Token is valid
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Token is valid"})
}
