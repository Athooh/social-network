package auth

import (
	"context"
	"fmt"
	"net/http"

	"github.com/Athooh/social-network/pkg/httputil"
	"github.com/Athooh/social-network/pkg/logger"
)

// contextKey is a custom type for context keys
type contextKey string

// UserIDKey is the key for storing the user ID in the request context
const UserIDKey contextKey = "userID"

// RequireAuth is a middleware that requires authentication
func (s *Service) RequireAuth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Skip authentication for OPTIONS requests
		if r.Method == http.MethodOptions {
			next.ServeHTTP(w, r)
			return
		}
		// Get user ID from session
		userID, err := s.sessionManager.GetUserFromSession(r)
		if err != nil {
			logger.Warn("Unauthorized attempt from user: %s", userID)
			httputil.SendError(w, http.StatusUnauthorized, fmt.Sprintf("Unauthorized: %s", err.Error()))
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

// RequireJWTAuth is a middleware that requires JWT authentication
func (s *Service) RequireJWTAuth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Skip authentication for OPTIONS requests
		if r.Method == http.MethodOptions {
			next.ServeHTTP(w, r)
			return
		}

		// Extract token from request
		tokenString, err := ExtractTokenFromRequest(r)
		if err != nil {
			httputil.SendError(w, http.StatusUnauthorized, fmt.Sprintf("Unauthorized: %s", err.Error()))
			return
		}

		// Validate token
		claims, err := ValidateToken(tokenString, s.jwtConfig)
		if err != nil {
			logger.Warn("Invalid JWT token: %s", tokenString)
			httputil.SendError(w, http.StatusUnauthorized, fmt.Sprintf("Unauthorized: %s", err.Error()))
			return
		}

		// Store user ID in request context
		ctx := context.WithValue(r.Context(), UserIDKey, claims.UserID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
