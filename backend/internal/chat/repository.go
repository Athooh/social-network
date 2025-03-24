package chat

import (
	"database/sql"
	"time"

	models "github.com/Athooh/social-network/pkg/models/dbTables"
)

// Repository defines the chat repository interface
type Repository interface {
	// Message operations
	SaveMessage(message *models.PrivateMessage) error
	GetMessagesBetweenUsers(userID1, userID2 string, limit, offset int) ([]*models.PrivateMessage, error)
	GetUnreadMessagesCount(userID string) (map[string]int, error)
	MarkMessagesAsRead(senderID, receiverID string) error

	// Contact operations
	GetChatContacts(userID string) ([]*models.ChatContact, error)
	CanSendMessage(senderID, receiverID string) (bool, error)
	GetUserBasicByID(userID string) (*models.UserBasic, error)
}

// SQLiteRepository implements the Repository interface for SQLite
type SQLiteRepository struct {
	db *sql.DB
}

// NewSQLiteRepository creates a new SQLite repository for chat
func NewSQLiteRepository(db *sql.DB) Repository {
	return &SQLiteRepository{db: db}
}

// SaveMessage saves a new message to the database
func (r *SQLiteRepository) SaveMessage(message *models.PrivateMessage) error {
	query := `
		INSERT INTO private_messages (sender_id, receiver_id, content, created_at, is_read)
		VALUES (?, ?, ?, ?, ?)
		RETURNING id
	`

	err := r.db.QueryRow(
		query,
		message.SenderID,
		message.ReceiverID,
		message.Content,
		message.CreatedAt,
		message.IsRead,
	).Scan(&message.ID)

	return err
}

// GetMessagesBetweenUsers retrieves messages between two users with pagination
func (r *SQLiteRepository) GetMessagesBetweenUsers(userID1, userID2 string, limit, offset int) ([]*models.PrivateMessage, error) {
	query := `
		SELECT id, sender_id, receiver_id, content, created_at, read_at, is_read
		FROM private_messages
		WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
		ORDER BY created_at DESC
		LIMIT ? OFFSET ?
	`

	rows, err := r.db.Query(query, userID1, userID2, userID2, userID1, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var messages []*models.PrivateMessage
	for rows.Next() {
		var msg models.PrivateMessage
		var readAt sql.NullTime

		err := rows.Scan(
			&msg.ID,
			&msg.SenderID,
			&msg.ReceiverID,
			&msg.Content,
			&msg.CreatedAt,
			&readAt,
			&msg.IsRead,
		)
		if err != nil {
			return nil, err
		}

		if readAt.Valid {
			msg.ReadAt = readAt.Time
		}

		// Get sender and receiver info
		sender, err := r.GetUserBasicByID(msg.SenderID)
		if err == nil {
			msg.Sender = sender
		}

		receiver, err := r.GetUserBasicByID(msg.ReceiverID)
		if err == nil {
			msg.Receiver = receiver
		}

		messages = append(messages, &msg)
	}

	return messages, nil
}

// GetUnreadMessagesCount gets the count of unread messages for a user grouped by sender
func (r *SQLiteRepository) GetUnreadMessagesCount(userID string) (map[string]int, error) {
	query := `
		SELECT sender_id, COUNT(*) as count
		FROM private_messages
		WHERE receiver_id = ? AND is_read = 0
		GROUP BY sender_id
	`

	rows, err := r.db.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	unreadCounts := make(map[string]int)
	for rows.Next() {
		var senderID string
		var count int

		if err := rows.Scan(&senderID, &count); err != nil {
			return nil, err
		}

		unreadCounts[senderID] = count
	}

	return unreadCounts, nil
}

// MarkMessagesAsRead marks all messages from a sender to a receiver as read
func (r *SQLiteRepository) MarkMessagesAsRead(senderID, receiverID string) error {
	query := `
		UPDATE private_messages
		SET is_read = 1, read_at = ?
		WHERE sender_id = ? AND receiver_id = ? AND is_read = 0
	`

	_, err := r.db.Exec(query, time.Now(), senderID, receiverID)
	return err
}

// GetChatContacts gets all users that the current user can chat with
func (r *SQLiteRepository) GetChatContacts(userID string) ([]*models.ChatContact, error) {
	query := `
		WITH chat_users AS (
			-- Users who have sent messages to or received messages from the current user
			SELECT DISTINCT
				CASE
					WHEN sender_id = ? THEN receiver_id
					ELSE sender_id
				END AS contact_id
			FROM private_messages
			WHERE sender_id = ? OR receiver_id = ?
			
			UNION
			
			-- Users who the current user follows or who follow the current user
			SELECT DISTINCT
				CASE
					WHEN follower_id = ? THEN following_id
					ELSE follower_id
				END AS contact_id
			FROM followers
			WHERE follower_id = ? OR following_id = ?
		)
		SELECT 
			u.id,
			u.first_name,
			u.last_name,
			u.avatar,
			COALESCE(us.is_online, 0) as is_online,
			(
				SELECT content
				FROM private_messages
				WHERE (sender_id = ? AND receiver_id = u.id) OR (sender_id = u.id AND receiver_id = ?)
				ORDER BY created_at DESC
				LIMIT 1
			) as last_message,
			(
				SELECT created_at
				FROM private_messages
				WHERE (sender_id = ? AND receiver_id = u.id) OR (sender_id = u.id AND receiver_id = ?)
				ORDER BY created_at DESC
				LIMIT 1
			) as last_sent,
			(
				SELECT COUNT(*)
				FROM private_messages
				WHERE sender_id = u.id AND receiver_id = ? AND is_read = 0
			) as unread_count
		FROM chat_users cu
		JOIN users u ON cu.contact_id = u.id
		LEFT JOIN user_status us ON u.id = us.user_id
		ORDER BY last_sent DESC NULLS LAST
	`

	rows, err := r.db.Query(
		query,
		userID, userID, userID,
		userID, userID, userID,
		userID, userID, userID, userID, userID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var contacts []*models.ChatContact
	for rows.Next() {
		var contact models.ChatContact
		var lastMessage sql.NullString
		var lastSent sql.NullTime

		err := rows.Scan(
			&contact.UserID,
			&contact.FirstName,
			&contact.LastName,
			&contact.Avatar,
			&contact.IsOnline,
			&lastMessage,
			&lastSent,
			&contact.UnreadCount,
		)
		if err != nil {
			return nil, err
		}

		if lastMessage.Valid {
			contact.LastMessage = lastMessage.String
		}

		if lastSent.Valid {
			contact.LastSent = lastSent.Time
		}

		contacts = append(contacts, &contact)
	}

	return contacts, nil
}

// CanSendMessage checks if a user can send a message to another user
func (r *SQLiteRepository) CanSendMessage(senderID, receiverID string) (bool, error) {
	// Check if the sender follows the receiver or vice versa
	query := `
		SELECT EXISTS (
			SELECT 1 FROM followers 
			WHERE (follower_id = ? AND following_id = ?) OR (follower_id = ? AND following_id = ?)
		) OR EXISTS (
			SELECT 1 FROM users
			WHERE id = ? AND is_private = 0
		)
	`

	var canSend bool
	err := r.db.QueryRow(query, senderID, receiverID, receiverID, senderID, receiverID).Scan(&canSend)
	return canSend, err
}

// GetUserBasicByID gets basic user information by ID
func (r *SQLiteRepository) GetUserBasicByID(userID string) (*models.UserBasic, error) {
	query := `
		SELECT id, first_name, last_name, avatar
		FROM users
		WHERE id = ?
	`

	var user models.UserBasic
	err := r.db.QueryRow(query, userID).Scan(
		&user.ID,
		&user.FirstName,
		&user.LastName,
		&user.Avatar,
	)
	if err != nil {
		return nil, err
	}

	return &user, nil
}
