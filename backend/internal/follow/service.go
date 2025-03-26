package follow

import (
	"errors"
	"fmt"
	"time"

	"github.com/Athooh/social-network/pkg/logger"
	"github.com/Athooh/social-network/pkg/user"
	"github.com/Athooh/social-network/pkg/websocket"
)

// Service defines the follow service interface
type Service interface {
	// Follow/unfollow operations
	FollowUser(followerID, followingID string) (bool, error)
	UnfollowUser(followerID, followingID string) error

	// Follow request operations
	AcceptFollowRequest(followerID, followingID string) error
	DeclineFollowRequest(followerID, followingID string) error
	GetPendingFollowRequests(userID string) ([]*FollowRequestWithUser, error)

	// Status checks
	IsFollowing(followerID, followingID string) (bool, error)

	// Retrieval operations
	GetFollowers(userID string) ([]*FollowerWithUser, error)
	GetFollowing(userID string) ([]*FollowerWithUser, error)
}

// FollowRequestWithUser extends FollowRequest with user information
type FollowRequestWithUser struct {
	FollowRequest
	FollowerName   string
	FollowerAvatar string
	MutualFriends  int
}

// FollowerWithUser extends Follower with user information
type FollowerWithUser struct {
	Follower
	UserName   string
	UserAvatar string
	IsOnline   bool
}

// FollowService implements the Service interface
type FollowService struct {
	repo            Repository
	userRepo        user.Repository
	statusRepo      user.StatusRepository
	log             *logger.Logger
	notificationSvc *NotificationService
}

// NewService creates a new follow service
func NewService(repo Repository, userRepo user.Repository, statusRepo user.StatusRepository, log *logger.Logger, wsHub *websocket.Hub) Service {
	notificationSvc := NewNotificationService(wsHub, userRepo, log)

	return &FollowService{
		repo:            repo,
		userRepo:        userRepo,
		statusRepo:      statusRepo,
		log:             log,
		notificationSvc: notificationSvc,
	}
}

// FollowUser handles the logic for a user following another user
func (s *FollowService) FollowUser(followerID, followingID string) (bool, error) {
	// Check if users are the same
	if followerID == followingID {
		return false, errors.New("you cannot follow yourself")
	}

	// Check if already following
	isFollowing, err := s.repo.IsFollowing(followerID, followingID)
	if err != nil {
		return false, err
	}

	if isFollowing {
		return false, errors.New("already following this user")
	}

	// Check if the target user's profile is public
	isPublic, err := s.repo.IsUserProfilePublic(followingID)
	if err != nil {
		return false, err
	}

	// For public profiles, create follower relationship directly
	if isPublic {
		if err := s.repo.CreateFollower(followerID, followingID); err != nil {
			return false, err
		}

		// Update user stats
		_, err = s.repo.UpdateUserStats(followingID, "followers_count", true)
		if err != nil {
			s.log.Error("Failed to update user stats: %v", err)
		}
	
		// Update user stats
		_, err = s.repo.UpdateUserStats(followerID, "following_count", true)
		if err != nil {
			s.log.Error("Failed to update user stats: %v", err)
		}
		// Update follower counts
		s.notificationSvc.UpdateFollowerCounts(followerID, followingID, s.repo)

		// Send notification to the user being followed
		s.notificationSvc.SendFollowNotification(followerID, followingID, true)

		return true, nil
	}

	// For private profiles, create a follow request
	// Check if a request already exists
	existingRequest, err := s.repo.GetFollowRequest(followerID, followingID)
	if err != nil {
		return false, err
	}

	if existingRequest != nil {
		if existingRequest.Status == string(StatusPending) {
			return false, errors.New("follow request already pending")
		}

		// Update existing request back to pending
		if err := s.repo.UpdateFollowRequestStatus(followerID, followingID, string(StatusPending)); err != nil {
			return false, err
		}
	} else {
		// Create new follow request
		if err := s.repo.CreateFollowRequest(followerID, followingID); err != nil {
			return false, err
		}
	}

	// Send follow request notification
	// s.notificationSvc.SendFollowRequestNotification(followerID, followingID)

	return false, nil
}

// UnfollowUser handles the logic for a user unfollowing another user
func (s *FollowService) UnfollowUser(followerID, followingID string) error {
	// Check if users are the same
	if followerID == followingID {
		return errors.New("you cannot unfollow yourself")
	}

	// Check if actually following
	isFollowing, err := s.repo.IsFollowing(followerID, followingID)
	if err != nil {
		return err
	}

	if !isFollowing {
		return errors.New("not following this user")
	}

	// Remove follower relationship
	if err := s.repo.DeleteFollower(followerID, followingID); err != nil {
		return err
	}
	// Update user stats
	_, err = s.repo.UpdateUserStats(followingID, "followers_count", false)
	if err != nil {
		s.log.Error("Failed to update user stats: %v", err)
	}

	// Update user stats
	_, err = s.repo.UpdateUserStats(followerID, "following_count", false)
	if err != nil {
		s.log.Error("Failed to update user stats: %v", err)
	}

	// Update follower counts
	s.notificationSvc.UpdateFollowerCounts(followerID, followingID, s.repo)

	// Send notification
	// s.notificationSvc.SendFollowNotification(followerID, followingID, false)

	return nil
}

// AcceptFollowRequest accepts a pending follow request
func (s *FollowService) AcceptFollowRequest(followerID, followingID string) error {
	// Verify the request exists and is pending
	request, err := s.repo.GetFollowRequest(followerID, followingID)
	if err != nil {
		return err
	}

	if request == nil {
		return errors.New("follow request not found")
	}

	if request.Status != string(StatusPending) {
		return errors.New("follow request is not pending")
	}

	// Update request status
	if err := s.repo.UpdateFollowRequestStatus(followerID, followingID, string(StatusAccepted)); err != nil {
		return err
	}

	// Create follower relationship
	if err := s.repo.CreateFollower(followerID, followingID); err != nil {
		return err
	}
	// Update user stats
	_, err = s.repo.UpdateUserStats(followingID, "followers_count", true)
	if err != nil {
		s.log.Error("Failed to update user stats: %v", err)
	}

	// Update user stats
	_, err = s.repo.UpdateUserStats(followerID, "following_count", true)
	if err != nil {
		s.log.Error("Failed to update user stats: %v", err)
	}

	// Update follower counts
	s.notificationSvc.UpdateFollowerCounts(followerID, followingID, s.repo)

	// Send notification to the follower that their request was accepted
	// s.notificationSvc.SendFollowRequestAcceptedNotification(followerID, followingID)

	return nil
}

// DeclineFollowRequest declines a pending follow request
func (s *FollowService) DeclineFollowRequest(followerID, followingID string) error {
	// Verify the request exists and is pending
	request, err := s.repo.GetFollowRequest(followerID, followingID)
	if err != nil {
		return err
	}

	if request == nil {
		return errors.New("follow request not found")
	}

	if request.Status != string(StatusPending) {
		return errors.New("follow request is not pending")
	}

	// Update request status
	return s.repo.UpdateFollowRequestStatus(followerID, followingID, string(StatusDeclined))
}

// GetPendingFollowRequests retrieves all pending follow requests for a user with mutual friends count
func (s *FollowService) GetPendingFollowRequests(userID string) ([]*FollowRequestWithUser, error) {
	requests, err := s.repo.GetPendingFollowRequests(userID)
	if err != nil {
		return nil, err
	}

	var requestsWithUser []*FollowRequestWithUser
	for _, request := range requests {
		// Get follower user info
		follower, err := s.userRepo.GetByID(request.FollowerID)
		if err != nil {
			s.log.Warn("Failed to get follower info: %v", err)
			continue
		}

		// Get mutual followers count
		mutualCount, err := s.repo.GetMutualFollowersCount(userID, request.FollowerID)
		if err != nil {
			s.log.Warn("Failed to get mutual followers count: %v", err)
			mutualCount = 0
		}

		requestWithUser := &FollowRequestWithUser{
			FollowRequest:  *request,
			FollowerName:   fmt.Sprintf("%s %s", follower.FirstName, follower.LastName),
			FollowerAvatar: follower.Avatar,
			MutualFriends:  mutualCount,
		}

		requestsWithUser = append(requestsWithUser, requestWithUser)
	}

	return requestsWithUser, nil
}

// IsFollowing checks if a user is following another user
func (s *FollowService) IsFollowing(followerID, followingID string) (bool, error) {
	return s.repo.IsFollowing(followerID, followingID)
}

// GetFollowers retrieves all followers of a user with user information
func (s *FollowService) GetFollowers(userID string) ([]*FollowerWithUser, error) {
	followers, err := s.repo.GetFollowers(userID)
	if err != nil {
		return nil, err
	}

	var followersWithUser []*FollowerWithUser
	for _, follower := range followers {
		// Get follower user info
		user, err := s.userRepo.GetByID(follower.FollowerID)
		if err != nil {
			s.log.Warn("Failed to get follower info: %v", err)
			continue
		}

		// Check if the user is online
		isOnline, err := s.statusRepo.GetUserStatus(follower.FollowerID)
		if err != nil {
			s.log.Warn("Failed to get online status for user %s: %v", follower.FollowerID, err)
			// Continue with isOnline = false as default
		}

		followerWithUser := &FollowerWithUser{
			Follower:   *follower,
			UserName:   fmt.Sprintf("%s %s", user.FirstName, user.LastName),
			UserAvatar: user.Avatar,
			IsOnline:   isOnline,
		}

		followersWithUser = append(followersWithUser, followerWithUser)
	}

	return followersWithUser, nil
}

// GetFollowing retrieves all users a user is following with user information
func (s *FollowService) GetFollowing(userID string) ([]*FollowerWithUser, error) {
	following, err := s.repo.GetFollowing(userID)
	if err != nil {
		return nil, err
	}

	var followingWithUser []*FollowerWithUser
	for _, follow := range following {
		// Get following user info
		user, err := s.userRepo.GetByID(follow.FollowingID)
		if err != nil {
			s.log.Warn("Failed to get following user info: %v", err)
			continue
		}

		// Check if the user is online
		isOnline, err := s.statusRepo.GetUserStatus(follow.FollowingID)
		if err != nil {
			s.log.Warn("Failed to get online status for user %s: %v", follow.FollowingID, err)
			// Continue with isOnline = false as default
		}

		followWithUser := &FollowerWithUser{
			Follower:   *follow,
			UserName:   fmt.Sprintf("%s %s", user.FirstName, user.LastName),
			UserAvatar: user.Avatar,
			IsOnline:   isOnline,
		}

		followingWithUser = append(followingWithUser, followWithUser)
	}

	return followingWithUser, nil
}

// UpdateUserStats updates or inserts a user's statistics
func (r *SQLiteRepository) UpdateUserStats(userID string, statsType string, increment bool) (int, error) {
	// If statsType is posts_count, get the actual count from posts table
	if statsType == "followers_count" {
		fmt.Println("hhh")
		var followCount int
		countQuery := "SELECT COUNT(*) FROM followers WHERE follower_id = ?"
		err := r.db.QueryRow(countQuery, userID).Scan(&followCount)
		if err != nil {
			return 0, err
		}

		// Now update the user_stats table with the actual count
		return r.updateUserStatsWithValue(userID, statsType, followCount)
	}

	if statsType == "following_count" {
		var followCount int
		countQuery := "SELECT COUNT(*) FROM followers WHERE following_id = ?"
		err := r.db.QueryRow(countQuery, userID).Scan(&followCount)
		if err != nil {
			return 0, err
		}

		// Now update the user_stats table with the actual count
		return r.updateUserStatsWithValue(userID, statsType, followCount)
	}

	// For other stats types, proceed with the original logic
	return r.updateUserStatsNormal(userID, statsType, increment)
}

// Helper method for the original increment/decrement logic
func (r *SQLiteRepository) updateUserStatsNormal(userID string, statsType string, increment bool) (int, error) {
	// Check if user stats record exists
	var exists bool
	checkQuery := "SELECT EXISTS(SELECT 1 FROM user_stats WHERE user_id = ?)"
	err := r.db.QueryRow(checkQuery, userID).Scan(&exists)
	if err != nil {
		return 0, err
	}

	tx, err := r.db.Begin()
	if err != nil {
		return 0, err
	}
	defer func() {
		if err != nil {
			tx.Rollback()
		}
	}()

	now := time.Now()
	var newCount int

	if exists {
		// Update existing record
		var updateQuery string
		var selectQuery string
		if increment {
			updateQuery = fmt.Sprintf("UPDATE user_stats SET %s = %s + 1, updated_at = ? WHERE user_id = ?", statsType, statsType)
		} else {
			updateQuery = fmt.Sprintf("UPDATE user_stats SET %s = CASE WHEN %s > 0 THEN %s - 1 ELSE 0 END, updated_at = ? WHERE user_id = ?", statsType, statsType, statsType)
		}
		_, err = tx.Exec(updateQuery, now, userID)
		if err != nil {
			return 0, err
		}

		// Get the new count
		selectQuery = fmt.Sprintf("SELECT %s FROM user_stats WHERE user_id = ?", statsType)
		err = tx.QueryRow(selectQuery, userID).Scan(&newCount)
	} else {
		// Create new record with default values
		var value int
		if increment {
			value = 1
		} else {
			value = 0
		}
		insertQuery := fmt.Sprintf("INSERT INTO user_stats (user_id, %s, created_at, updated_at) VALUES (?, ?, ?, ?)", statsType)
		_, err = tx.Exec(insertQuery, userID, value, now, now)
		if err != nil {
			return 0, err
		}

		newCount = value
	}

	if err != nil {
		return 0, err
	}

	err = tx.Commit()
	if err != nil {
		return 0, err
	}

	return newCount, nil
}

// Helper method to update stats with a specific value
func (r *SQLiteRepository) updateUserStatsWithValue(userID string, statsType string, value int) (int, error) {
	// Check if user stats record exists
	var exists bool
	checkQuery := "SELECT EXISTS(SELECT 1 FROM user_stats WHERE user_id = ?)"
	err := r.db.QueryRow(checkQuery, userID).Scan(&exists)
	if err != nil {
		return 0, err
	}

	tx, err := r.db.Begin()
	if err != nil {
		return 0, err
	}
	defer func() {
		if err != nil {
			tx.Rollback()
		}
	}()

	now := time.Now()

	if exists {
		// Update existing record with the provided value
		updateQuery := fmt.Sprintf("UPDATE user_stats SET %s = ?, updated_at = ? WHERE user_id = ?", statsType)
		_, err = tx.Exec(updateQuery, value, now, userID)
	} else {
		// Create new record with the provided value
		insertQuery := fmt.Sprintf("INSERT INTO user_stats (user_id, %s, created_at, updated_at) VALUES (?, ?, ?, ?)", statsType)
		_, err = tx.Exec(insertQuery, userID, value, now, now)
	}

	if err != nil {
		return 0, err
	}

	err = tx.Commit()
	if err != nil {
		return 0, err
	}

	return value, nil
}
