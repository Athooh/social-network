package user

import (
	"database/sql"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
)

// SQLiteRepository implements Repository for SQLite
type SQLiteRepository struct {
	db *sql.DB
}

// NewSQLiteRepository creates a new SQLite repository
func NewSQLiteRepository(db *sql.DB) *SQLiteRepository {
	return &SQLiteRepository{db: db}
}

// Create adds a new user to the database and creates a basic profile
func (r *SQLiteRepository) Create(user *User) error {
	// Start a transaction
	tx, err := r.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// Generate ID if not provided
	if user.ID == "" {
		user.ID = uuid.New().String()
	}

	now := time.Now()
	user.CreatedAt = now
	user.UpdatedAt = now

	query := `
        INSERT INTO users (
            id, email, password, first_name, last_name, date_of_birth,
            avatar, nickname, about_me, is_public, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
	_, err = tx.Exec(
		query,
		user.ID, user.Email, user.Password, user.FirstName, user.LastName, user.DateOfBirth,
		user.Avatar, user.Nickname, user.AboutMe, user.IsPublic, user.CreatedAt, user.UpdatedAt,
	)
	if err != nil {
		return err
	}

	// Create basic profile with the username (nickname)
	profileQuery := `
        INSERT INTO user_profiles (
            id, user_id, username, full_name, email, is_private, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `

	fullName := fmt.Sprintf("%s %s", user.FirstName, user.LastName)

	_, err = tx.Exec(
		profileQuery,
		uuid.New().String(), user.ID, user.Nickname, fullName,
		user.Email, !user.IsPublic, now, now,
	)
	if err != nil {
		return err
	}

	return tx.Commit()
}

// SyncFollowStats updates the follower and following counts in the user_stats table
// based on the actual counts in the followers table
func (r *SQLiteRepository) SyncFollowStats(userID string) error {
	tx, err := r.db.Begin()
	if err != nil {
		return err
	}
	defer func() {
		if err != nil {
			tx.Rollback()
		}
	}()

	// Get followers count
	var followersCount int
	err = tx.QueryRow("SELECT COUNT(*) FROM followers WHERE following_id = ?", userID).Scan(&followersCount)
	if err != nil {
		return err
	}

	// Get following count
	var followingCount int
	err = tx.QueryRow("SELECT COUNT(*) FROM followers WHERE follower_id = ?", userID).Scan(&followingCount)
	if err != nil {
		return err
	}

	// Check if user stats record exists
	var exists bool
	err = tx.QueryRow("SELECT EXISTS(SELECT 1 FROM user_stats WHERE user_id = ?)", userID).Scan(&exists)
	if err != nil {
		return err
	}

	now := time.Now()
	if exists {
		// Update existing record
		_, err = tx.Exec(
			"UPDATE user_stats SET followers_count = ?, following_count = ?, updated_at = ? WHERE user_id = ?",
			followersCount, followingCount, now, userID)
	} else {
		// Create new record
		_, err = tx.Exec(
			"INSERT INTO user_stats (user_id, followers_count, following_count, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
			userID, followersCount, followingCount, now, now)
	}
	if err != nil {
		return err
	}

	return tx.Commit()
}

// GetByID retrieves a user by ID
func (r *SQLiteRepository) GetByID(id string) (*User, error) {
	err := r.SyncFollowStats(id)
	if err != nil {
		return nil, err
	}
	query := `
        SELECT u.id, u.email, u.password, u.first_name, u.last_name, u.date_of_birth, 
               u.avatar, u.nickname, u.about_me, u.is_public, u.created_at, u.updated_at,
               COALESCE(us.posts_count, 0) AS posts_count,
               COALESCE(us.groups_joined, 0) AS groups_joined,
               COALESCE(us.followers_count, 0) AS followers_count,
               COALESCE(us.following_count, 0) AS following_count
        FROM users u
        LEFT JOIN user_stats us ON u.id = us.user_id
        WHERE u.id = ?
    `

	var user User
	err = r.db.QueryRow(query, id).Scan(
		&user.ID, &user.Email, &user.Password, &user.FirstName, &user.LastName, &user.DateOfBirth,
		&user.Avatar, &user.Nickname, &user.AboutMe, &user.IsPublic, &user.CreatedAt, &user.UpdatedAt,
		&user.PostsCount, &user.GroupsJoined, &user.FollowersCount, &user.FollowingCount,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("user not found")
		}
		return nil, err
	}

	return &user, nil
}

// GetByEmail retrieves a user by email
func (r *SQLiteRepository) GetByEmail(email string) (*User, error) {
	query := `
		SELECT id, email, password, first_name, last_name, date_of_birth, 
		       avatar, nickname, about_me, is_public, created_at, updated_at
		FROM users
		WHERE email = ?
	`

	var user User
	err := r.db.QueryRow(query, email).Scan(
		&user.ID, &user.Email, &user.Password, &user.FirstName, &user.LastName, &user.DateOfBirth,
		&user.Avatar, &user.Nickname, &user.AboutMe, &user.IsPublic, &user.CreatedAt, &user.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("user not found")
		}
		return nil, err
	}

	return &user, nil
}

// Update  a user in the database
func (r *SQLiteRepository) Update(user *User) error {
	user.UpdatedAt = time.Now()

	query := `
		UPDATE users
		SET email = ?, password = ?, first_name = ?, last_name = ?, date_of_birth = ?,
		    avatar = ?, nickname = ?, about_me = ?, is_public = ?, updated_at = ?
		WHERE id = ?
	`

	_, err := r.db.Exec(
		query,
		user.Email, user.Password, user.FirstName, user.LastName, user.DateOfBirth,
		user.Avatar, user.Nickname, user.AboutMe, user.IsPublic, user.UpdatedAt, user.ID,
	)
	if err != nil {
		return err
	}

	return nil
}

// Delete removes a user from the database
func (r *SQLiteRepository) Delete(id string) error {
	query := `DELETE FROM users WHERE id = ?`
	_, err := r.db.Exec(query, id)
	return err
}
