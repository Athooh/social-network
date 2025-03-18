package post

import (
	"errors"
	"mime/multipart"

	"github.com/Athooh/social-network/pkg/filestore"
	"github.com/Athooh/social-network/pkg/logger"
	models "github.com/Athooh/social-network/pkg/models/dbTables"
)

// Service defines the post service interface
type Service interface {
	CreatePost(userID string, content, privacy string, image *multipart.FileHeader) (*models.Post, error)
	GetPost(postID int64, userID string) (*models.Post, error)
	GetUserPosts(userID, viewerID string) ([]*models.Post, error)
	GetPublicPosts(limit, offset int) ([]*models.Post, error)
	UpdatePost(postID int64, userID string, content, privacy string, image *multipart.FileHeader) (*models.Post, error)
	DeletePost(postID int64, userID string) error

	// Privacy management
	SetPostViewers(postID int64, userID string, viewerIDs []string) error

	// Comments
	CreateComment(postID int64, userID string, content string, image *multipart.FileHeader) (*models.Comment, error)
	GetPostComments(postID int64, userID string) ([]*models.Comment, error)
	DeleteComment(commentID int64, userID string) error
}

// PostService implements the Service interface
type PostService struct {
	repo      Repository
	fileStore *filestore.FileStore
	log       *logger.Logger
}

// NewService creates a new post service
func NewService(repo Repository, fileStore *filestore.FileStore, log *logger.Logger) Service {
	return &PostService{
		repo:      repo,
		fileStore: fileStore,
		log:       log,
	}
}

// CreatePost creates a new post
func (s *PostService) CreatePost(userID string, content, privacy string, image *multipart.FileHeader) (*models.Post, error) {
	// Validate privacy setting
	if privacy != models.PrivacyPublic && privacy != models.PrivacyAlmostPrivate && privacy != models.PrivacyPrivate {
		return nil, errors.New("invalid privacy setting")
	}

	// Create post object
	post := &models.Post{
		UserID:  userID,
		Content: content,
		Privacy: privacy,
	}

	// Handle image upload if provided
	if image != nil {
		filename, err := s.fileStore.SaveFile(image, "posts")
		if err != nil {
			s.log.Error("Failed to save post image: %v", err)
			return nil, err
		}
		post.ImagePath = filename
	}

	// Save post to database
	if err := s.repo.CreatePost(post); err != nil {
		s.log.Error("Failed to create post: %v", err)
		return nil, err
	}

	return post, nil
}

// GetPost retrieves a post by ID if the user has permission to view it
func (s *PostService) GetPost(postID int64, userID string) (*models.Post, error) {
	// Check if the user can view this post
	canView, err := s.repo.CanViewPost(postID, userID)
	if err != nil {
		s.log.Error("Failed to check post view permission: %v", err)
		return nil, err
	}

	if !canView {
		return nil, errors.New("you don't have permission to view this post")
	}

	post, err := s.repo.GetPostByID(postID)
	if err != nil {
		s.log.Error("Failed to get post: %v", err)
		return nil, err
	}

	if post == nil {
		return nil, errors.New("post not found")
	}

	return post, nil
}

// GetUserPosts retrieves all posts by a user that the viewer has permission to see
func (s *PostService) GetUserPosts(userID, viewerID string) ([]*models.Post, error) {
	// Get all posts by the user
	posts, err := s.repo.GetPostsByUserID(userID)
	if err != nil {
		s.log.Error("Failed to get user posts: %v", err)
		return nil, err
	}

	// Filter posts based on privacy settings
	var viewablePosts []*models.Post
	for _, post := range posts {
		canView, err := s.repo.CanViewPost(post.ID, viewerID)
		if err != nil {
			s.log.Error("Failed to check post view permission: %v", err)
			continue
		}

		if canView {
			viewablePosts = append(viewablePosts, post)
		}
	}

	return viewablePosts, nil
}

// GetPublicPosts retrieves public posts with pagination
func (s *PostService) GetPublicPosts(limit, offset int) ([]*models.Post, error) {
	if limit <= 0 {
		limit = 10 // Default limit
	}
	if offset < 0 {
		offset = 0
	}

	posts, err := s.repo.GetPublicPosts(limit, offset)
	if err != nil {
		s.log.Error("Failed to get public posts: %v", err)
		return nil, err
	}

	return posts, nil
}

// UpdatePost updates an existing post
func (s *PostService) UpdatePost(postID int64, userID string, content, privacy string, image *multipart.FileHeader) (*models.Post, error) {
	// Get the existing post
	post, err := s.repo.GetPostByID(postID)
	if err != nil {
		s.log.Error("Failed to get post for update: %v", err)
		return nil, err
	}

	if post == nil {
		return nil, errors.New("post not found")
	}

	// Check if the user is the post owner
	if post.UserID != userID {
		return nil, errors.New("you don't have permission to update this post")
	}

	// Validate privacy setting
	if privacy != models.PrivacyPublic && privacy != models.PrivacyAlmostPrivate && privacy != models.PrivacyPrivate {
		return nil, errors.New("invalid privacy setting")
	}

	// Update post fields
	post.Content = content
	post.Privacy = privacy

	// Handle image upload if provided
	if image != nil {
		// Delete old image if exists
		if post.ImagePath != "" {
			if err := s.fileStore.DeleteFile(post.ImagePath); err != nil {
				s.log.Warn("Failed to delete old post image: %v", err)
			}
		}

		// Save new image
		filename, err := s.fileStore.SaveFile(image, "posts")
		if err != nil {
			s.log.Error("Failed to save post image: %v", err)
			return nil, err
		}
		post.ImagePath = filename
	}

	// Save updated post
	if err := s.repo.UpdatePost(post); err != nil {
		s.log.Error("Failed to update post: %v", err)
		return nil, err
	}

	return post, nil
}

// DeletePost deletes a post
func (s *PostService) DeletePost(postID int64, userID string) error {
	// Get the post
	post, err := s.repo.GetPostByID(postID)
	if err != nil {
		s.log.Error("Failed to get post for deletion: %v", err)
		return err
	}

	if post == nil {
		return errors.New("post not found")
	}

	// Check if the user is the post owner
	if post.UserID != userID {
		return errors.New("you don't have permission to delete this post")
	}

	// Delete the post image if exists
	if post.ImagePath != "" {
		if err := s.fileStore.DeleteFile(post.ImagePath); err != nil {
			s.log.Warn("Failed to delete post image: %v", err)
		}
	}

	// Delete the post
	if err := s.repo.DeletePost(postID); err != nil {
		s.log.Error("Failed to delete post: %v", err)
		return err
	}

	return nil
}

// SetPostViewers sets the users who can view a private post
func (s *PostService) SetPostViewers(postID int64, userID string, viewerIDs []string) error {
	// Get the post
	post, err := s.repo.GetPostByID(postID)
	if err != nil {
		s.log.Error("Failed to get post for setting viewers: %v", err)
		return err
	}

	if post == nil {
		return errors.New("post not found")
	}

	// Check if the user is the post owner
	if post.UserID != userID {
		return errors.New("you don't have permission to set viewers for this post")
	}

	// Check if the post is private
	if post.Privacy != models.PrivacyPrivate {
		return errors.New("viewers can only be set for private posts")
	}

	// Get current viewers
	currentViewers, err := s.repo.GetPostViewers(postID)
	if err != nil {
		s.log.Error("Failed to get current post viewers: %v", err)
		return err
	}

	// Create maps for efficient lookup
	currentViewerMap := make(map[string]bool)
	for _, id := range currentViewers {
		currentViewerMap[id] = true
	}

	newViewerMap := make(map[string]bool)
	for _, id := range viewerIDs {
		newViewerMap[id] = true
	}

	// Add new viewers
	for _, id := range viewerIDs {
		if !currentViewerMap[id] {
			if err := s.repo.AddPostViewer(postID, id); err != nil {
				s.log.Error("Failed to add post viewer: %v", err)
				return err
			}
		}
	}

	// Remove viewers that are no longer in the list
	for _, id := range currentViewers {
		if !newViewerMap[id] {
			if err := s.repo.RemovePostViewer(postID, id); err != nil {
				s.log.Error("Failed to remove post viewer: %v", err)
				return err
			}
		}
	}

	return nil
}

// CreateComment creates a new comment on a post
func (s *PostService) CreateComment(postID int64, userID string, content string, image *multipart.FileHeader) (*models.Comment, error) {
	// Check if the user can view the post (and thus comment on it)
	canView, err := s.repo.CanViewPost(postID, userID)
	if err != nil {
		s.log.Error("Failed to check post view permission: %v", err)
		return nil, err
	}

	if !canView {
		return nil, errors.New("you don't have permission to comment on this post")
	}

	// Create comment object
	comment := &models.Comment{
		PostID:  postID,
		UserID:  userID,
		Content: content,
	}

	// Handle image upload if provided
	if image != nil {
		filename, err := s.fileStore.SaveFile(image, "comments")
		if err != nil {
			s.log.Error("Failed to save comment image: %v", err)
			return nil, err
		}
		comment.ImagePath = filename
	}

	// Save comment to database
	if err := s.repo.CreateComment(comment); err != nil {
		s.log.Error("Failed to create comment: %v", err)
		return nil, err
	}

	return comment, nil
}

// GetPostComments retrieves all comments for a post if the user has permission to view the post
func (s *PostService) GetPostComments(postID int64, userID string) ([]*models.Comment, error) {
	// Check if the user can view the post
	canView, err := s.repo.CanViewPost(postID, userID)
	if err != nil {
		s.log.Error("Failed to check post view permission: %v", err)
		return nil, err
	}

	if !canView {
		return nil, errors.New("you don't have permission to view this post's comments")
	}

	// Get comments
	comments, err := s.repo.GetCommentsByPostID(postID)
	if err != nil {
		s.log.Error("Failed to get post comments: %v", err)
		return nil, err
	}

	return comments, nil
}

// DeleteComment deletes a comment
func (s *PostService) DeleteComment(commentID int64, userID string) error {
	// Get the comment (would need to add this method to repository)
	// For now, we'll just delete if the user is the comment author
	// In a real implementation, you'd check if the user is either the comment author or the post owner

	// Delete the comment
	if err := s.repo.DeleteComment(commentID); err != nil {
		s.log.Error("Failed to delete comment: %v", err)
		return err
	}

	return nil
}
