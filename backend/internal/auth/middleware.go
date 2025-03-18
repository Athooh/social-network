package auth

import (
	"context"
	"fmt"
	"net/http"
	"strconv"

	"github.com/Athooh/social-network/pkg/httputil"
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
			httputil.SendError(w, http.StatusUnauthorized, fmt.Sprintf("(GetUserFromSession) Unauthorized: %s", err.Error()), true)
			return
		}

		// Store user ID in request context
		ctx := context.WithValue(r.Context(), UserIDKey, userID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// GetUserIDFromContext retrieves the user ID from the request context
func GetUserIDFromContext(ctx context.Context) (int64, bool) {
	userID, ok := ctx.Value(UserIDKey).(string)
	userIDInt, _ := strconv.Atoi(userID)
	return int64(userIDInt), ok
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
			httputil.SendError(w, http.StatusUnauthorized, fmt.Sprintf("(ExtractTokenFromRequest) Unauthorized: %s", err.Error()), true)
			return
		}

		// Validate token
		claims, err := ValidateToken(tokenString, s.jwtConfig)
		if err != nil {
			httputil.SendError(w, http.StatusUnauthorized, fmt.Sprintf("(ValidateToken) Unauthorized: %s", err.Error()), true)
			return
		}

		// Store user ID in request context
		ctx := context.WithValue(r.Context(), UserIDKey, claims.UserID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
