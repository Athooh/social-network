package server

import (
	"net/http"

	"github.com/Athooh/social-network/internal/auth"
	"github.com/Athooh/social-network/internal/follow"
	"github.com/Athooh/social-network/internal/post"
	websocketHandler "github.com/Athooh/social-network/internal/websocket"
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

// RouterConfig holds all dependencies needed for routing
type RouterConfig struct {
	AuthHandler    *auth.Handler
	PostHandler    *post.Handler
	WSHandler      *websocketHandler.Handler
	FollowHandler  *follow.Handler
	AuthMiddleware func(http.Handler) http.Handler
	JWTMiddleware  func(http.Handler) http.Handler
	Logger         *logger.Logger
	UploadDir      string
}

// Router sets up the HTTP routes
func Router(config RouterConfig) http.Handler {
	// Create a new router
	mux := http.NewServeMux()

	// Define middleware chains
	loggingMiddleware := config.Logger.HTTPMiddleware
	publicRouteMiddleware := middlewareChain(loggingMiddleware, middleware.CorsMiddleware)
	authenticatedRouteMiddleware := middlewareChain(middleware.CorsMiddleware, config.JWTMiddleware, config.AuthMiddleware, loggingMiddleware)
	wsMiddleware := middlewareChain(middleware.CorsMiddleware, config.JWTMiddleware)

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
	publicAuthGroup.HandleFunc("/register", config.AuthHandler.Register)
	publicAuthGroup.HandleFunc("/login", config.AuthHandler.LoginJWT)

	protectedAuthGroup := NewRouteGroup("/api/auth", authenticatedRouteMiddleware)
	protectedAuthGroup.HandleFunc("/logout", config.AuthHandler.Logout)
	protectedAuthGroup.HandleFunc("/validate_token", config.AuthHandler.ValidateToken)

	protectedUserGroup := NewRouteGroup("/api/users", authenticatedRouteMiddleware)
	protectedUserGroup.HandleFunc("/me", config.AuthHandler.Me)

	// Add follow routes
	protectedFollowGroup := NewRouteGroup("/api/follow", authenticatedRouteMiddleware)
	protectedFollowGroup.HandleFunc("/follow", config.FollowHandler.FollowUser)
	protectedFollowGroup.HandleFunc("/unfollow", config.FollowHandler.UnfollowUser)
	protectedFollowGroup.HandleFunc("/accept", config.FollowHandler.AcceptFollowRequest)
	protectedFollowGroup.HandleFunc("/decline", config.FollowHandler.DeclineFollowRequest)
	protectedFollowGroup.HandleFunc("/requests", config.FollowHandler.GetPendingFollowRequests)
	protectedFollowGroup.HandleFunc("/followers", config.FollowHandler.GetFollowers)
	protectedFollowGroup.HandleFunc("/following", config.FollowHandler.GetFollowing)
	protectedFollowGroup.HandleFunc("/is-following", config.FollowHandler.IsFollowing)

	protectedPostGroup := NewRouteGroup("/api/posts", authenticatedRouteMiddleware)
	protectedPostGroup.HandleFunc("", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPost:
			config.PostHandler.CreatePost(w, r)
		case http.MethodGet:
			config.PostHandler.GetFeedPosts(w, r)
		case http.MethodDelete:
			config.PostHandler.DeletePost(w, r)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})
	protectedPostGroup.HandleFunc("/comments/", config.PostHandler.HandleComments)
	protectedPostGroup.HandleFunc("/user/", config.PostHandler.GetUserPosts)
	protectedPostGroup.HandleFunc("/like/", config.PostHandler.LikePost)

	// Add WebSocket route
	wsRoute := NewRouteGroup("/ws", wsMiddleware)
	wsRoute.HandleFunc("", config.WSHandler.HandleConnection)

	// Register all groups
	publicAuthGroup.Register(mux)
	protectedAuthGroup.Register(mux)
	protectedPostGroup.Register(mux)
	protectedFollowGroup.Register(mux)
	wsRoute.Register(mux)

	// Serve static files
	fileServer := http.FileServer(http.Dir(config.UploadDir))
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
