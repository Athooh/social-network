package server

import (
	"net/http"

	"github.com/Athooh/social-network/internal/auth"
	"github.com/Athooh/social-network/internal/post"
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
func Router(
	authHandler *auth.Handler,
	postHandler *post.Handler,
	authMiddleware, jwtMiddleware func(http.Handler) http.Handler,
	log *logger.Logger,
	uploadDir string,
) http.Handler {
	// Create a new router
	mux := http.NewServeMux()

	// Define middleware chains
	loggingMiddleware := log.HTTPMiddleware
	publicRouteMiddleware := middlewareChain(loggingMiddleware, middleware.CorsMiddleware)
	authenticatedRouteMiddleware := middlewareChain(middleware.CorsMiddleware, jwtMiddleware, authMiddleware, loggingMiddleware)

	// Health check
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	})

	// Create route groups
	publicAuthGroup := NewRouteGroup("/api/auth", publicRouteMiddleware)
	publicAuthGroup.HandleFunc("/register", authHandler.Register)
	publicAuthGroup.HandleFunc("/login", authHandler.LoginJWT)

	protectedAuthGroup := NewRouteGroup("/api/auth", authenticatedRouteMiddleware)
	protectedAuthGroup.HandleFunc("/logout", authHandler.Logout)
	protectedAuthGroup.HandleFunc("/validate_token", authHandler.ValidateToken)

	protectedUserGroup := NewRouteGroup("/api/users", authenticatedRouteMiddleware)
	protectedUserGroup.HandleFunc("/me", authHandler.Me)

	protectedPostGroup := NewRouteGroup("/api/posts", authenticatedRouteMiddleware)
	protectedPostGroup.HandleFunc("", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPost:
			postHandler.CreatePost(w, r)
		case http.MethodGet:
			postHandler.GetPublicPosts(w, r)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})
	protectedPostGroup.HandleFunc("/comments/", postHandler.HandleComments)
	protectedPostGroup.HandleFunc("/user/", postHandler.GetUserPosts)

	// Register all groups
	publicAuthGroup.Register(mux)
	protectedAuthGroup.Register(mux)
	protectedPostGroup.Register(mux)

	// Serve static files
	fileServer := http.FileServer(http.Dir(uploadDir))
	mux.Handle("/uploads/", http.StripPrefix("/uploads/", fileServer))

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
