package server

import (
	"net/http"

	"github.com/Athooh/social-network/pkg/auth"
	"github.com/Athooh/social-network/pkg/logger"
	"github.com/Athooh/social-network/pkg/middleware"
)

// RouteGroup represents a group of routes with shared middleware
type RouteGroup struct {
	prefix     string
	middleware func(http.Handler) http.Handler
	routes     map[string]http.Handler
}

// NewRouteGroup creates a new route group
func NewRouteGroup(prefix string, middleware func(http.Handler) http.Handler) *RouteGroup {
	return &RouteGroup{
		prefix:     prefix,
		middleware: middleware,
		routes:     make(map[string]http.Handler),
	}
}

// Handle adds a route to the group
func (rg *RouteGroup) Handle(pattern string, handler http.Handler) {
	rg.routes[pattern] = handler
}

// HandleFunc adds a route with a handler function to the group
func (rg *RouteGroup) HandleFunc(pattern string, handlerFunc http.HandlerFunc) {
	rg.Handle(pattern, handlerFunc)
}

// Register registers all routes in the group with the provided mux
func (rg *RouteGroup) Register(mux *http.ServeMux) {
	for pattern, handler := range rg.routes {
		fullPattern := rg.prefix + pattern
		mux.Handle(fullPattern, rg.middleware(handler))
	}
}

// Router sets up the HTTP routes
func Router(authHandler *auth.Handler, authMiddleware, jwtMiddleware func(http.Handler) http.Handler, logger *logger.Logger, uploadDir string) http.Handler {
	// Create a new router
	mux := http.NewServeMux()

	uploadDirectory := http.Dir(uploadDir)
	fileServer := http.FileServer(uploadDirectory)
	mux.Handle("/uploads/", http.StripPrefix("/uploads/", fileServer))

	// Define middleware chains with more descriptive names
	loggingMiddleware := logger.HTTPMiddleware
	publicRouteMiddleware := middlewareChain(loggingMiddleware, middleware.CorsMiddleware)
	authenticatedRouteMiddleware := middlewareChain(middleware.CorsMiddleware, jwtMiddleware, authMiddleware, loggingMiddleware)

	// Create route groups
	publicAuthGroup := NewRouteGroup("/api/auth", publicRouteMiddleware)
	publicAuthGroup.HandleFunc("/register", authHandler.Register)
	publicAuthGroup.HandleFunc("/login", authHandler.LoginJWT)
	publicAuthGroup.HandleFunc("/validate_token", authHandler.ValidateToken)

	protectedAuthGroup := NewRouteGroup("/api/auth", authenticatedRouteMiddleware)
	protectedAuthGroup.HandleFunc("/logout", authHandler.Logout)
	protectedAuthGroup.HandleFunc("/me", authHandler.Me)

	// Register all groups
	publicAuthGroup.Register(mux)
	protectedAuthGroup.Register(mux)

	return mux
}

func middlewareChain(middlewares ...func(http.Handler) http.Handler) func(http.Handler) http.Handler {
	return func(final http.Handler) http.Handler {
		for _, middleware := range middlewares {
			final = middleware(final)
		}
		return final
	}
}
