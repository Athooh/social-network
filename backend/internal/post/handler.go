package post

import (
	"encoding/json"
	"fmt"
	"mime/multipart"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/Athooh/social-network/internal/auth"
	"github.com/Athooh/social-network/pkg/httputil"
	"github.com/Athooh/social-network/pkg/logger"
)

// Handler handles HTTP requests for posts
type Handler struct {
	service Service
	log     *logger.Logger
}

// NewHandler creates a new post handler
func NewHandler(service Service, log *logger.Logger) *Handler {
	return &Handler{
		service: service,
		log:     log,
	}
}

// CreatePostRequest represents the request to create a post
type CreatePostRequest struct {
	Content string `json:"content"`
	Privacy string `json:"privacy"`
}

// PostResponse represents the response for a post
type PostResponse struct {
	ID        int64  `json:"id"`
	UserID    int64  `json:"userId"`
	Content   string `json:"content"`
	ImageURL  string `json:"imageUrl,omitempty"`
	Privacy   string `json:"privacy"`
	CreatedAt string `json:"createdAt"`
	UpdatedAt string `json:"updatedAt"`
}

// CommentResponse represents the response for a comment
type CommentResponse struct {
	ID        int64  `json:"id"`
	PostID    int64  `json:"postId"`
	UserID    int64  `json:"userId"`
	Content   string `json:"content"`
	ImageURL  string `json:"imageUrl,omitempty"`
	CreatedAt string `json:"createdAt"`
	UpdatedAt string `json:"updatedAt"`
}

// CreatePost handles the creation of a new post
func (h *Handler) CreatePost(w http.ResponseWriter, r *http.Request) {
	// Get user ID from context (set by auth middleware)
	userID, ok := auth.GetUserIDFromContext(r.Context())
	if !ok {
		h.sendError(w, http.StatusUnauthorized, fmt.Sprintf("Unauthrized Attempt bu user: %d", userID))
		return
	}

	// Parse multipart form
	if err := r.ParseMultipartForm(10 << 20); err != nil { // 10 MB max
		h.sendError(w, http.StatusBadRequest, fmt.Sprintf("Failed to parse form data: %s", err.Error()))
		return
	}

	// Get form values
	content := r.FormValue("content")
	privacy := r.FormValue("privacy")

	// Validate required fields
	if content == "" {
		h.sendError(w, http.StatusBadRequest, "Content field is missing")
		return
	}

	if privacy == "" {
		h.sendError(w, http.StatusBadRequest, "Privacy field is missing")
		return
	}

	// Get image file if provided
	var imageFile *multipart.FileHeader
	if file, header, err := r.FormFile("image"); err == nil {
		defer file.Close()
		imageFile = header
	}

	// Create post
	post, err := h.service.CreatePost(userID, content, privacy, imageFile)
	if err != nil {
		h.sendError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to create post: %s", err.Error()))
		return
	}

	// Prepare response
	response := PostResponse{
		ID:        post.ID,
		UserID:    post.UserID,
		Content:   post.Content,
		Privacy:   post.Privacy,
		CreatedAt: post.CreatedAt.Format(time.RFC3339),
		UpdatedAt: post.UpdatedAt.Format(time.RFC3339),
	}

	if post.ImagePath != "" {
		response.ImageURL = "/uploads/posts/" + post.ImagePath
	}

	// Return response
	h.sendJSON(w, http.StatusCreated, response)
}

// GetPost handles retrieving a post by ID
func (h *Handler) GetPost(w http.ResponseWriter, r *http.Request) {
	// Get user ID from context (set by auth middleware)
	userID, ok := auth.GetUserIDFromContext(r.Context())
	if !ok {
		h.sendError(w, http.StatusUnauthorized, fmt.Sprintf("Unauthrized Attempt by user: %d", userID))
		return
	}

	// Get post ID from URL
	pathParts := strings.Split(r.URL.Path, "/")
	if len(pathParts) < 3 {
		h.sendError(w, http.StatusBadRequest, fmt.Sprintf("Invalid URL: %s", r.URL.Path))
		return
	}
	postID, err := strconv.ParseInt(pathParts[len(pathParts)-1], 10, 64)
	if err != nil {
		h.sendError(w, http.StatusBadRequest, fmt.Sprintf("Invalid Post Id: %d", postID))
		return
	}

	// Get post
	post, err := h.service.GetPost(postID, userID)
	if err != nil {
		h.sendError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to get post: %v", err))
		return
	}

	// Prepare response
	response := PostResponse{
		ID:        post.ID,
		UserID:    post.UserID,
		Content:   post.Content,
		Privacy:   post.Privacy,
		CreatedAt: post.CreatedAt.Format(time.RFC3339),
		UpdatedAt: post.UpdatedAt.Format(time.RFC3339),
	}

	if post.ImagePath != "" {
		response.ImageURL = "/uploads/posts/" + post.ImagePath
	}

	// Return response
	h.sendJSON(w, http.StatusOK, response)
}

// GetUserPosts handles retrieving all posts by a user
func (h *Handler) GetUserPosts(w http.ResponseWriter, r *http.Request) {
	// Get user ID from context (set by auth middleware)
	userID, ok := auth.GetUserIDFromContext(r.Context())
	if !ok {
		h.sendError(w, http.StatusUnauthorized, fmt.Sprintf("Unauthrized Attempt by user: %d", userID))
		return
	}

	// Get target user ID from URL
	pathParts := strings.Split(r.URL.Path, "/")
	if len(pathParts) < 3 {
		h.sendError(w, http.StatusBadRequest, fmt.Sprintf("Invalid URL: %s", r.URL.Path))
		return
	}
	viewerID, err := strconv.ParseInt(pathParts[len(pathParts)-1], 10, 64)
	if err != nil {
		h.sendError(w, http.StatusBadRequest, fmt.Sprintf("Invalid Viewer ID: %d", userID))
		return
	}

	// Get posts
	posts, err := h.service.GetUserPosts(userID, viewerID)
	if err != nil {
		h.sendError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to get user posts: %s", err.Error()))
		return
	}

	// Prepare response
	var response []PostResponse
	for _, post := range posts {
		postResp := PostResponse{
			ID:        post.ID,
			UserID:    post.UserID,
			Content:   post.Content,
			Privacy:   post.Privacy,
			CreatedAt: post.CreatedAt.Format(time.RFC3339),
			UpdatedAt: post.UpdatedAt.Format(time.RFC3339),
		}

		if post.ImagePath != "" {
			postResp.ImageURL = "/uploads/posts/" + post.ImagePath
		}

		response = append(response, postResp)
	}

	// Return response
	h.sendJSON(w, http.StatusOK, response)
}

// GetPublicPosts handles retrieving public posts with pagination
func (h *Handler) GetPublicPosts(w http.ResponseWriter, r *http.Request) {
	// Get user ID from context (set by auth middleware)
	userID, ok := auth.GetUserIDFromContext(r.Context())
	if !ok {
		h.sendError(w, http.StatusUnauthorized, fmt.Sprintf("Unauthrized Attempt by user: %d", userID))
		return
	}

	// Get pagination parameters
	limitStr := r.URL.Query().Get("limit")
	offsetStr := r.URL.Query().Get("offset")

	limit := 10 // Default limit
	if limitStr != "" {
		parsedLimit, err := strconv.Atoi(limitStr)
		if err == nil && parsedLimit > 0 {
			limit = parsedLimit
		}
	}

	offset := 0 // Default offset
	if offsetStr != "" {
		parsedOffset, err := strconv.Atoi(offsetStr)
		if err == nil && parsedOffset >= 0 {
			offset = parsedOffset
		}
	}

	// Get posts
	posts, err := h.service.GetPublicPosts(limit, offset)
	if err != nil {
		h.sendError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to get public posts: %v", err))
		return
	}

	// Prepare response
	var response []PostResponse
	for _, post := range posts {
		postResp := PostResponse{
			ID:        post.ID,
			UserID:    post.UserID,
			Content:   post.Content,
			Privacy:   post.Privacy,
			CreatedAt: post.CreatedAt.Format(time.RFC3339),
			UpdatedAt: post.UpdatedAt.Format(time.RFC3339),
		}

		if post.ImagePath != "" {
			postResp.ImageURL = "/uploads/posts/" + post.ImagePath
		}

		response = append(response, postResp)
	}

	// Return response
	h.sendJSON(w, http.StatusOK, response)
}

// UpdatePost handles updating an existing post
func (h *Handler) UpdatePost(w http.ResponseWriter, r *http.Request) {
	// Get user ID from context (set by auth middleware)
	userID, ok := auth.GetUserIDFromContext(r.Context())
	if !ok {
		h.sendError(w, http.StatusUnauthorized, fmt.Sprintf("Unauthrized Attempt bu user: %d", userID))
		return
	}

	// Get post ID from URL
	pathParts := strings.Split(r.URL.Path, "/")
	if len(pathParts) < 3 {
		h.sendError(w, http.StatusBadRequest, fmt.Sprintf("Invalid URL: %s", r.URL.Path))
		return
	}
	postID, err := strconv.ParseInt(pathParts[len(pathParts)-1], 10, 64)
	if err != nil {
		h.sendError(w, http.StatusBadRequest, fmt.Sprintf("Invalid Post Id: %d", postID))
		return
	}

	// Parse multipart form
	if err := r.ParseMultipartForm(10 << 20); err != nil { // 10 MB max
		h.sendError(w, http.StatusBadRequest, fmt.Sprintf("Failed to parse form data: %s", err.Error()))
		return
	}

	// Get form values
	content := r.FormValue("content")
	privacy := r.FormValue("privacy")

	// Validate required fields
	if content == "" {
		h.sendError(w, http.StatusBadRequest, "Content field is missing")
		return
	}

	// Get image file if provided
	var imageFile *multipart.FileHeader
	if file, header, err := r.FormFile("image"); err == nil {
		defer file.Close()
		imageFile = header
	}

	// Update post
	post, err := h.service.UpdatePost(postID, userID, content, privacy, imageFile)
	if err != nil {
		h.sendError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to update post: %s", err.Error()))
		return
	}

	// Prepare response
	response := PostResponse{
		ID:        post.ID,
		UserID:    post.UserID,
		Content:   post.Content,
		Privacy:   post.Privacy,
		CreatedAt: post.CreatedAt.Format(time.RFC3339),
		UpdatedAt: post.UpdatedAt.Format(time.RFC3339),
	}

	if post.ImagePath != "" {
		response.ImageURL = "/uploads/posts/" + post.ImagePath
	}

	// Return response
	h.sendJSON(w, http.StatusOK, response)
}

// DeletePost handles deleting a post
func (h *Handler) DeletePost(w http.ResponseWriter, r *http.Request) {
	// Get user ID from context (set by auth middleware)
	userID, ok := auth.GetUserIDFromContext(r.Context())
	if !ok {
		h.sendError(w, http.StatusUnauthorized, fmt.Sprintf("Unauthrized Attempt bu user: %d", userID))
		return
	}

	// Get post ID from URL
	pathParts := strings.Split(r.URL.Path, "/")
	if len(pathParts) < 3 {
		h.sendError(w, http.StatusBadRequest, fmt.Sprintf("Invalid URL: %s", r.URL.Path))
		return
	}
	postID, err := strconv.ParseInt(pathParts[len(pathParts)-1], 10, 64)
	if err != nil {
		h.sendError(w, http.StatusBadRequest, fmt.Sprintf("Invalid Post Id: %d", postID))
		return
	}

	// Delete post
	if err := h.service.DeletePost(postID, userID); err != nil {
		h.sendError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to Delete post: %s", err.Error()))
		return
	}

	// Return success
	w.WriteHeader(http.StatusNoContent)
}

// SetPostViewers handles setting the users who can view a private post
func (h *Handler) SetPostViewers(w http.ResponseWriter, r *http.Request) {
	// Get user ID from context (set by auth middleware)
	userID, ok := auth.GetUserIDFromContext(r.Context())
	if !ok {
		h.sendError(w, http.StatusUnauthorized, fmt.Sprintf("Unauthrized Attempt bu user: %d", userID))
		return
	}

	// Get post ID from URL
	pathParts := strings.Split(r.URL.Path, "/")
	if len(pathParts) < 3 {
		h.sendError(w, http.StatusBadRequest, fmt.Sprintf("Invalid URL: %s", r.URL.Path))
		return
	}
	postID, err := strconv.ParseInt(pathParts[len(pathParts)-1], 10, 64)
	if err != nil {
		h.sendError(w, http.StatusBadRequest, fmt.Sprintf("Invalid Post Id: %d", postID))
		return
	}

	// Parse request body
	var request struct {
		ViewerIDs []int64 `json:"viewerIds"`
	}

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		h.sendError(w, http.StatusInternalServerError, "Invalid Request Body")
		return
	}

	// Set post viewers
	if err := h.service.SetPostViewers(postID, userID, request.ViewerIDs); err != nil {
		h.sendError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to set Post viewers: %s", err.Error()))
		return
	}

	// Return success
	w.WriteHeader(http.StatusNoContent)
}

// CreateComment handles creating a new comment on a post
func (h *Handler) CreateComment(w http.ResponseWriter, r *http.Request) {
	// Get user ID from context (set by auth middleware)
	userID, ok := auth.GetUserIDFromContext(r.Context())
	if !ok {
		h.sendError(w, http.StatusUnauthorized, fmt.Sprintf("Unauthrized Attempt bu user: %d", userID))
		return
	}

	// Get post ID from URL
	pathParts := strings.Split(r.URL.Path, "/")
	if len(pathParts) < 4 {
		h.sendError(w, http.StatusBadRequest, fmt.Sprintf("Invalid URL: %s", r.URL.Path))
		return
	}
	postID, err := strconv.ParseInt(pathParts[len(pathParts)-2], 10, 64)
	if err != nil {
		h.sendError(w, http.StatusBadRequest, fmt.Sprintf("Invalid Post Id: %d", postID))
		return
	}

	// Parse multipart form
	if err := r.ParseMultipartForm(10 << 20); err != nil { // 10 MB max
		h.sendError(w, http.StatusBadRequest, fmt.Sprintf("Failed to parse form data: %s", err.Error()))
		return
	}

	// Get form values
	content := r.FormValue("content")

	// Validate required fields
	if content == "" {
		h.sendError(w, http.StatusBadRequest, "Content field is missing")
		return
	}

	// Get image file if provided
	var imageFile *multipart.FileHeader
	if file, header, err := r.FormFile("image"); err == nil {
		defer file.Close()
		imageFile = header
	}

	// Create comment
	comment, err := h.service.CreateComment(postID, userID, content, imageFile)
	if err != nil {
		h.sendError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to create comment: %s", err.Error()))
		return
	}

	// Prepare response
	response := CommentResponse{
		ID:        comment.ID,
		PostID:    comment.PostID,
		UserID:    comment.UserID,
		Content:   comment.Content,
		CreatedAt: comment.CreatedAt.Format(time.RFC3339),
		UpdatedAt: comment.UpdatedAt.Format(time.RFC3339),
	}

	if comment.ImagePath != "" {
		response.ImageURL = "/uploads/comments/" + comment.ImagePath
	}

	// Return response
	h.sendJSON(w, http.StatusCreated, response)
}

// GetPostComments handles retrieving all comments for a post
func (h *Handler) GetPostComments(w http.ResponseWriter, r *http.Request) {
	// Get user ID from context (set by auth middleware)
	userID, ok := auth.GetUserIDFromContext(r.Context())
	if !ok {
		h.sendError(w, http.StatusUnauthorized, fmt.Sprintf("Unauthrized Attempt bu user: %d", userID))
		return
	}

	// Get post ID from URL
	pathParts := strings.Split(r.URL.Path, "/")
	if len(pathParts) < 4 {
		h.sendError(w, http.StatusBadRequest, fmt.Sprintf("Invalid URL: %s", r.URL.Path))
		return
	}
	postID, err := strconv.ParseInt(pathParts[len(pathParts)-2], 10, 64)
	if err != nil {
		h.sendError(w, http.StatusBadRequest, fmt.Sprintf("Invalid Post Id: %d", postID))
		return
	}

	// Get comments
	comments, err := h.service.GetPostComments(postID, userID)
	if err != nil {
		h.sendError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to get post comments: %v", err))
		return
	}

	// Prepare response
	var response []CommentResponse
	for _, comment := range comments {
		commentResp := CommentResponse{
			ID:        comment.ID,
			PostID:    comment.PostID,
			UserID:    comment.UserID,
			Content:   comment.Content,
			CreatedAt: comment.CreatedAt.Format(time.RFC3339),
			UpdatedAt: comment.UpdatedAt.Format(time.RFC3339),
		}

		if comment.ImagePath != "" {
			commentResp.ImageURL = "/uploads/comments/" + comment.ImagePath
		}

		response = append(response, commentResp)
	}

	// Return response
	h.sendJSON(w, http.StatusOK, response)
}

// DeleteComment handles deleting a comment
func (h *Handler) DeleteComment(w http.ResponseWriter, r *http.Request) {
	// Get user ID from context (set by auth middleware)
	userID, ok := auth.GetUserIDFromContext(r.Context())
	if !ok {
		h.sendError(w, http.StatusUnauthorized, fmt.Sprintf("Unauthrized Attempt bu user: %d", userID))
		return
	}

	// Get comment ID from URL
	pathParts := strings.Split(r.URL.Path, "/")
	if len(pathParts) < 3 {
		h.sendError(w, http.StatusBadRequest, fmt.Sprintf("Invalid URL: %s", r.URL.Path))
		return
	}
	commentID, err := strconv.ParseInt(pathParts[len(pathParts)-1], 10, 64)
	if err != nil {
		http.Error(w, "Invalid comment ID", http.StatusBadRequest)
		return
	}

	// Delete comment
	if err := h.service.DeleteComment(commentID, userID); err != nil {
		h.sendError(w, http.StatusInternalServerError, fmt.Sprintf("Failed to delete comment: %s", err.Error()))
		return
	}

	// Return success
	w.WriteHeader(http.StatusNoContent)
}

// HandleComments handles comments for a post
func (h *Handler) HandleComments(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodPost:
		h.CreateComment(w, r)
	case http.MethodGet:
		h.GetPostComments(w, r)
	case http.MethodDelete:
		h.DeleteComment(w, r)
	default:
		h.sendError(w, http.StatusMethodNotAllowed, fmt.Sprintf("Method not allowed: %s", r.Method))
	}
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
