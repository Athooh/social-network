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
	CreatePost(userID string, content, privacy string, image, video *multipart.FileHeader) (*models.Post, error)
	GetPost(postID int64, userID string) (*models.Post, error)
	GetUserPosts(userID, viewerID string) ([]*models.Post, error)
	GetPublicPosts(limit, offset int) ([]*models.Post, error)
	UpdatePost(postID int64, userID string, content, privacy string, image, video *multipart.FileHeader) (*models.Post, error)
	DeletePost(postID int64, userID string) error

	// Privacy management
	SetPostViewers(postID int64, userID string, viewerIDs []string) error

	// Comments
	CreateComment(postID int64, userID string, content string, image *multipart.FileHeader) (*models.Comment, error)
	GetPostComments(postID int64, userID string) ([]*models.Comment, error)
	DeleteComment(commentID int64, userID string) error

	// Like functionality
	LikePost(postID int64, userID string) error
	UnlikePost(postID int64, userID string) error
	GetFeedPosts(userID string, page, pageSize int) ([]*models.Post, error)
	GetPostWithComments(postID int64, userID string) (*models.Post, []*models.Comment, error)
}

// PostService implements the Service interface
type PostService struct {
	repo            Repository
	fileStore       *filestore.FileStore
	log             *logger.Logger
	notificationSvc *NotificationService
}

// NewService creates a new post service
func NewService(repo Repository, fileStore *filestore.FileStore, log *logger.Logger, notificationSvc *NotificationService) Service {
	return &PostService{
		repo:            repo,
		fileStore:       fileStore,
		log:             log,
		notificationSvc: notificationSvc,
	}
}

// CreatePost creates a new post
func (s *PostService) CreatePost(userID string, content, privacy string, image, video *multipart.FileHeader) (*models.Post, error) {
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
		post.ImagePath.String = filename
	}

	// Handle video upload if provided
	if video != nil {
		filename, err := s.fileStore.SaveFile(video, "videos")
		if err != nil {
			s.log.Error("Failed to save post video: %v", err)
			return nil, err
		}
		post.VideoPath.String = filename
	}

	// Save post to database
	if err := s.repo.CreatePost(post); err != nil {
		s.log.Error("Failed to create post: %v", err)
		return nil, err
	}

	// Get user name for notification
	userData, err := s.repo.GetUserDataByID(userID)
	if err != nil {
		s.log.Warn("Failed to get user data for notification: %v", err)
		// Continue even if we can't get the user name
	}

	userName := "Unknown User"
	if userData != nil && userData.FirstName != "" {
		userName = userData.FirstName
	}

	// Send notification
	if s.notificationSvc != nil {
		go s.notificationSvc.NotifyPostCreated(post, userID, userName)
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
func (s *PostService) UpdatePost(postID int64, userID string, content, privacy string, image, video *multipart.FileHeader) (*models.Post, error) {
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
		if post.ImagePath.String != "" {
			if err := s.fileStore.DeleteFile(post.ImagePath.String); err != nil {
				s.log.Warn("Failed to delete old post image: %v", err)
			}
		}

		// Save new image
		filename, err := s.fileStore.SaveFile(image, "posts")
		if err != nil {
			s.log.Error("Failed to save post image: %v", err)
			return nil, err
		}
		post.ImagePath.String = filename
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
	if post.ImagePath.String != "" {
		if err := s.fileStore.DeleteFile(post.ImagePath.String); err != nil {
			s.log.Warn("Failed to delete post image: %v", err)
		}
	}

	// Delete the post video if exists
	if post.VideoPath.String != "" {
		if err := s.fileStore.DeleteFile(post.VideoPath.String); err != nil {
			s.log.Warn("Failed to delete post video: %v", err)
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
		comment.ImagePath.String = filename
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

	// Fetch user data for each comment
	for _, comment := range comments {
		userData, err := s.repo.GetUserDataByID(comment.UserID)
		if err != nil {
			s.log.Warn("Failed to get user data for comment %d: %v", comment.ID, err)
			continue
		}
		comment.UserData = userData
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

// LikePost handles liking a post
func (s *PostService) LikePost(postID int64, userID string) error {
	// Check if the user can view the post
	canView, err := s.repo.CanViewPost(postID, userID)
	if err != nil {
		return err
	}
	if !canView {
		return errors.New("you don't have permission to like this post")
	}

	// Check if already liked
	hasLiked, err := s.repo.HasLiked(postID, userID)
	if err != nil {
		return err
	}
	if hasLiked {
		if err := s.repo.UnlikePost(postID, userID); err != nil {
			return err
		}
	} else {
		if err := s.repo.LikePost(postID, userID); err != nil {
			return err
		}
	}

	return nil
}

// UnlikePost handles unliking a post
func (s *PostService) UnlikePost(postID int64, userID string) error {
	// Check if the user can view the post
	canView, err := s.repo.CanViewPost(postID, userID)
	if err != nil {
		return err
	}
	if !canView {
		return errors.New("you don't have permission to unlike this post")
	}

	return s.repo.UnlikePost(postID, userID)
}

// GetFeedPosts gets posts visible to the user with pagination
func (s *PostService) GetFeedPosts(userID string, page, pageSize int) ([]*models.Post, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = 10
	}

	offset := (page - 1) * pageSize
	posts, err := s.repo.GetFeedPosts(userID, pageSize, offset)
	if err != nil {
		s.log.Error("Failed to get feed posts: %v", err)
		return nil, err
	}

	// Fetch user data for each post
	for _, post := range posts {
		userData, err := s.repo.GetUserDataByID(post.UserID)
		if err != nil {
			s.log.Warn("Failed to get user data for post %d: %v", post.ID, err)
			continue
		}
		if userData != nil {
			post.UserData = userData
		}
	}

	return posts, nil
}

// GetPostWithComments retrieves a post along with its comments
func (s *PostService) GetPostWithComments(postID int64, userID string) (*models.Post, []*models.Comment, error) {
	post, err := s.repo.GetPostByID(postID)
	if err != nil {
		return nil, nil, err
	}

	comments, err := s.repo.GetCommentsByPostID(postID)
	if err != nil {
		return nil, nil, err
	}

	return post, comments, nil
}
