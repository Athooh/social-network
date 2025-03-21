package user

import (
	"database/sql"
)

// SQLiteStatusRepository implements StatusRepository for SQLite
type SQLiteStatusRepository struct {
	db *sql.DB
}

// NewSQLiteStatusRepository creates a new SQLite status repository
func NewSQLiteStatusRepository(db *sql.DB) *SQLiteStatusRepository {
	return &SQLiteStatusRepository{db: db}
}

// SetUserOnline marks a user as online
func (r *SQLiteStatusRepository) SetUserOnline(userID string) error {
	query := `
		INSERT INTO user_status (user_id, is_online, last_activity, updated_at)
		VALUES (?, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
		ON CONFLICT(user_id) DO UPDATE SET
		is_online = TRUE,
		last_activity = CURRENT_TIMESTAMP,
		updated_at = CURRENT_TIMESTAMP
	`
	_, err := r.db.Exec(query, userID)
	return err
}

// SetUserOffline marks a user as offline
func (r *SQLiteStatusRepository) SetUserOffline(userID string) error {
	query := `
		INSERT INTO user_status (user_id, is_online, last_activity, updated_at)
		VALUES (?, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
		ON CONFLICT(user_id) DO UPDATE SET
		is_online = FALSE,
		last_activity = CURRENT_TIMESTAMP,
		updated_at = CURRENT_TIMESTAMP
	`
	_, err := r.db.Exec(query, userID)
	return err
}

// GetUserStatus gets a user's online status
func (r *SQLiteStatusRepository) GetUserStatus(userID string) (bool, error) {
	query := `
		SELECT is_online FROM user_status
		WHERE user_id = ?
	`
	var isOnline bool
	err := r.db.QueryRow(query, userID).Scan(&isOnline)
	if err == sql.ErrNoRows {
		return false, nil // Default to offline if no record
	}
	return isOnline, err
}

// GetFollowersForStatusUpdate gets the list of followers who should be notified of status changes
func (r *SQLiteStatusRepository) GetFollowersForStatusUpdate(userID string) ([]string, error) {
	query := `
		SELECT follower_id FROM followers
		WHERE following_id = ?
	`
	rows, err := r.db.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var followerIDs []string
	for rows.Next() {
		var followerID string
		if err := rows.Scan(&followerID); err != nil {
			return nil, err
		}
		followerIDs = append(followerIDs, followerID)
	}

	return followerIDs, nil
}
