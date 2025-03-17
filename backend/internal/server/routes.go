package server

import (
	"net/http"

	"github.com/Athooh/social-network/pkg/auth"
	"github.com/Athooh/social-network/pkg/logger"
)

// Router sets up the HTTP routes
func Router(authHandler *auth.Handler, authMiddleware func(http.Handler) http.Handler, logger *logger.Logger) http.Handler {
	// Create a new router
	mux := http.NewServeMux()

	// Public routes
	mux.HandleFunc("/api/auth/register", authHandler.Register)
	mux.HandleFunc("/api/auth/login", authHandler.Login)

	// Protected routes
	protected := http.NewServeMux()
	protected.HandleFunc("/api/auth/logout", authHandler.Logout)
	protected.HandleFunc("/api/auth/me", authHandler.Me)

	// Apply middleware to protected routes
	protectedHandler := authMiddleware(protected)

	// Register protected routes with the main router
	mux.Handle("/api/auth/logout", protectedHandler)
	mux.Handle("/api/auth/me", protectedHandler)

	// Apply logging middleware to all routes
	return logger.HTTPMiddleware(mux)
}
