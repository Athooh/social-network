package user

import (
	"database/sql"
	"errors"
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

// Create adds a new user to the database
func (r *SQLiteRepository) Create(user *User) error {
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

	_, err := r.db.Exec(
		query,
		user.ID, user.Email, user.Password, user.FirstName, user.LastName, user.DateOfBirth,
		user.Avatar, user.Nickname, user.AboutMe, user.IsPublic, user.CreatedAt, user.UpdatedAt,
	)
	if err != nil {
		return err
	}

	return nil
}

// GetByID retrieves a user by ID
func (r *SQLiteRepository) GetByID(id string) (*User, error) {
	query := `
		SELECT id, email, password, first_name, last_name, date_of_birth, 
		       avatar, nickname, about_me, is_public, created_at, updated_at
		FROM users
		WHERE id = ?
	`

	var user User
	err := r.db.QueryRow(query, id).Scan(
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
