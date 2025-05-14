package profile

import (
	"database/sql"
	"fmt"
	"strings"
	"time"
)

// SQLiteRepository implements Repository interface for SQLite
type SQLiteRepository struct {
	db *sql.DB
}

// NewSQLiteRepository creates a new SQLite repository
func NewSQLiteRepository(db *sql.DB) Repository {
	return &SQLiteRepository{
		db: db,
	}
}

func (r *SQLiteRepository) UpdateUserProfile(userID string, profileData map[string]interface{}) error {
	tx, err := r.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()
	now := time.Now()

	if len(profileData) > 0 {
		// Build the user table update query dynamically based on what data was provided
		userFields := []string{"updated_at = ?"}
		userValues := []interface{}{now}

		// Fields from User that can be updated from profile edit
		if nickname, ok := profileData["username"].(string); ok && nickname != "" {
			userFields = append(userFields, "nickname = ?")
			userValues = append(userValues, nickname)
		}

		if aboutMe, ok := profileData["bio"].(string); ok {
			userFields = append(userFields, "about_me = ?")
			userValues = append(userValues, aboutMe)
		}

		if avatar, ok := profileData["profileImage"].(string); ok && avatar != "" {
			userFields = append(userFields, "avatar = ?")
			userValues = append(userValues, avatar)
		}

		if isPrivate, ok := profileData["isPrivate"].(bool); ok {
			userFields = append(userFields, "is_public = ?")
			userValues = append(userValues, !isPrivate) // Note: isPrivate is the inverse of isPublic
		}

		// Add the WHERE clause values
		userValues = append(userValues, userID)

		if len(userFields) > 1 {
			userQuery := fmt.Sprintf("UPDATE users SET %s WHERE id = ?", strings.Join(userFields, ", "))
			_, err = tx.Exec(userQuery, userValues...)
			if err != nil {
				return err
			}
		}
	}

	// Update the user_profiles table
	profileFields := []string{"updated_at = ?"}
	profileValues := []interface{}{now}
	// Map each field from the form to the database field
	fieldMappings := map[string]string{
		"username":     "username",
		"fullName":     "full_name",
		"bio":          "bio",
		"work":         "work",
		"education":    "education",
		"email":        "email", // This is contact email, not authentication email
		"phone":        "phone",
		"website":      "website",
		"location":     "location",
		"techSkills":   "tech_skills",
		"softSkills":   "soft_skills",
		"interests":    "interests",
		"bannerImage":  "banner_image",
		"profileImage": "profile_image",
		"isPrivate":    "is_private",
	}

	// Add each field that exists in the profileData
	for formField, dbField := range fieldMappings {
		if value, exists := profileData[formField]; exists {
			// Special handling for boolean values
			if dbField == "is_private" {
				if boolVal, ok := value.(bool); ok {
					profileFields = append(profileFields, dbField+" = ?")
					profileValues = append(profileValues, boolVal)
				}
				continue
			}

			// Handle strings, including empty strings (which are valid updates)
			if strVal, ok := value.(string); ok {
				profileFields = append(profileFields, dbField+" = ?")
				profileValues = append(profileValues, strVal)
			}
		}
	}

	// Add WHERE clause value
	profileValues = append(profileValues, userID)

	// Execute the profile update if there are fields to update
	if len(profileFields) > 1 { // More than just updated_at
		profileQuery := fmt.Sprintf("UPDATE user_profiles SET %s WHERE user_id = ?", strings.Join(profileFields, ", "))
		_, err = tx.Exec(profileQuery, profileValues...)
		if err != nil {
			return err
		}
	}

	return tx.Commit()
}
