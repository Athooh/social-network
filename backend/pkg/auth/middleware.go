package auth

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/Athooh/social-network/pkg/logger"
)

// contextKey is a custom type for context keys
type contextKey string

// UserIDKey is the key for storing the user ID in the request context
const UserIDKey contextKey = "userID"

// RequireAuth is a middleware that requires authentication
func (s *Service) RequireAuth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Get user ID from session
		userID, err := s.sessionManager.GetUserFromSession(r)
		if err != nil {
			logger.Warn("Unauthorized: %v", map[string]interface{}{
				"error": err.Error(),
			})
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusUnauthorized)
			json.NewEncoder(w).Encode(map[string]string{"error": "Unauthorized"})
			return
		}

		// Store user ID in request context
		ctx := context.WithValue(r.Context(), UserIDKey, userID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// GetUserIDFromContext retrieves the user ID from the request context
func GetUserIDFromContext(ctx context.Context) (string, bool) {
	userID, ok := ctx.Value(UserIDKey).(string)
	return userID, ok
}
