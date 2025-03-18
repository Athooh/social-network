package sqlite

import (
	"database/sql"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"reflect"
	"strings"
	"time"

	"github.com/Athooh/social-network/pkg/logger"
	models "github.com/Athooh/social-network/pkg/models/dbTables"
	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/sqlite3"
	_ "github.com/golang-migrate/migrate/v4/source/file"
)

// DB represents the database connection
type DB struct {
	*sql.DB
	config Config
}

// Config holds the database configuration
type Config struct {
	DBPath         string
	MigrationsPath string
}

// New creates a new database connection
func New(config Config) (*DB, error) {
	// Ensure the directory exists
	dbDir := filepath.Dir(config.DBPath)
	if err := os.MkdirAll(dbDir, 0o755); err != nil {
		return nil, fmt.Errorf("failed to create database directory: %w", err)
	}

	// Open the database connection
	db, err := sql.Open("sqlite3", config.DBPath+"?_foreign_keys=on")
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	// Test the connection
	if err := db.Ping(); err != nil {
		db.Close()
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	return &DB{db, config}, nil
}

// runMigrations runs the database migrations
func runMigrations(db *sql.DB, dbPath, migrationsPath string) error {
	driver, err := sqlite3.WithInstance(db, &sqlite3.Config{})
	if err != nil {
		return fmt.Errorf("failed to create migration driver: %w", err)
	}

	m, err := migrate.NewWithDatabaseInstance(
		fmt.Sprintf("file://%s", migrationsPath),
		"sqlite3",
		driver,
	)
	if err != nil {
		return fmt.Errorf("failed to create migration instance: %w", err)
	}

	// Check if database is dirty
	version, dirty, err := m.Version()
	if err != nil && !errors.Is(err, migrate.ErrNilVersion) {
		return fmt.Errorf("failed to get migration version: %w", err)
	}

	// If database is dirty, force the version
	if dirty {
		logger.Warn("Database is in dirty state at version %d, forcing version", version)
		if err := m.Force(int(version)); err != nil {
			return fmt.Errorf("failed to force version: %w", err)
		}
	}

	if err := m.Up(); err != nil && !errors.Is(err, migrate.ErrNoChange) {
		return fmt.Errorf("failed to run migrations: %w", err)
	}

	logger.Info("Database migrations applied successfully")
	return nil
}

// Close closes the database connection
func (db *DB) Close() error {
	return db.DB.Close()
}

// TableInfo holds information about a database table
type TableInfo struct {
	Name                string
	Columns             []ColumnInfo
	Indexes             []IndexInfo
	CompositePrimaryKey []string
}

// ColumnInfo holds information about a table column
type ColumnInfo struct {
	Name       string
	Type       string
	PrimaryKey bool
	NotNull    bool
	Unique     bool
	Default    string
	References string
}

// IndexInfo holds information about a table index
type IndexInfo struct {
	Name    string
	Columns []string
	Unique  bool
}

// CreateMigrationFromStruct generates migration files from a struct
func (db *DB) CreateMigrationFromStruct(modelStruct interface{}, migrationName string) error {
	// Check if migration already exists for this table
	tableName := camelToSnake(reflect.TypeOf(modelStruct).Name()) + "s"
	existingMigration, err := checkMigrationExists(db.config.MigrationsPath, tableName)
	if err != nil {
		return fmt.Errorf("failed to check existing migrations: %w", err)
	}

	if existingMigration {
		logger.Info("Migration for table %s already exists, skipping", tableName)
		return nil
	}

	// Get table info from struct
	tableInfo, err := extractTableInfoFromStruct(modelStruct)
	if err != nil {
		return fmt.Errorf("failed to extract table info: %w", err)
	}

	// Create migrations directory if it doesn't exist
	if err := os.MkdirAll(db.config.MigrationsPath, 0o755); err != nil {
		return fmt.Errorf("failed to create migrations directory: %w", err)
	}

	// Generate migration sequence number
	seq, err := getNextMigrationSequence(db.config.MigrationsPath)
	if err != nil {
		return fmt.Errorf("failed to get next migration sequence: %w", err)
	}

	// Generate migration file names
	upFileName := fmt.Sprintf("%06d_%s.up.sql", seq, migrationName)
	downFileName := fmt.Sprintf("%06d_%s.down.sql", seq, migrationName)

	// Generate SQL for up migration
	upSQL := generateCreateTableSQL(tableInfo)

	// Generate SQL for down migration
	downSQL := fmt.Sprintf("DROP TABLE IF EXISTS %s;", tableInfo.Name)

	// Write migration files
	upFilePath := filepath.Join(db.config.MigrationsPath, upFileName)
	if err := os.WriteFile(upFilePath, []byte(upSQL), 0o644); err != nil {
		return fmt.Errorf("failed to write up migration file: %w", err)
	}

	downFilePath := filepath.Join(db.config.MigrationsPath, downFileName)
	if err := os.WriteFile(downFilePath, []byte(downSQL), 0o644); err != nil {
		return fmt.Errorf("failed to write down migration file: %w", err)
	}

	logger.Info("Created migration files: %s, %s", upFileName, downFileName)
	return nil
}

// checkMigrationExists checks if a migration for the given table already exists
func checkMigrationExists(migrationsPath string, tableName string) (bool, error) {
	files, err := os.ReadDir(migrationsPath)
	if err != nil {
		if os.IsNotExist(err) {
			return false, nil
		}
		return false, err
	}

	for _, file := range files {
		if file.IsDir() {
			continue
		}

		// Check if filename contains create_tablename_table
		if strings.Contains(file.Name(), fmt.Sprintf("create_%s_table", tableName)) {
			return true, nil
		}
	}

	return false, nil
}

func CreateMigrations(db *DB) error {
	// Generate migrations for all models
	logger.Info("Generating database migrations...")
	if err := db.CreateMigrationFromStruct(models.User{}, "create_users_table"); err != nil {
		logger.Fatal("Failed to create users migration: %v", err)
	}
	if err := db.CreateMigrationFromStruct(models.Session{}, "create_sessions_table"); err != nil {
		logger.Fatal("Failed to create sessions migration: %v", err)
	}
	if err := db.CreateMigrationFromStruct(models.Post{}, "create_posts_table"); err != nil {
		logger.Fatal("Failed to create posts migration: %v", err)
	}
	if err := db.CreateMigrationFromStruct(models.PostViewer{}, "create_post_viewers_table"); err != nil {
		logger.Fatal("Failed to create post viewers migration: %v", err)
	}
	if err := db.CreateMigrationFromStruct(models.Comment{}, "create_comments_table"); err != nil {
		logger.Fatal("Failed to create comments migration: %v", err)
	}
	if err := db.CreateMigrationFromStruct(models.FollowRequest{}, "create_follow_requests_table"); err != nil {
		logger.Fatal("Failed to create follow requests migration: %v", err)
	}
	if err := db.CreateMigrationFromStruct(models.Follower{}, "create_followers_table"); err != nil {
		logger.Fatal("Failed to create followers migration: %v", err)
	}

	// Run migrations
	if err := runMigrations(db.DB, db.config.DBPath, db.config.MigrationsPath); err != nil {
		db.DB.Close()
		return fmt.Errorf("failed to run migrations: %w", err)
	}

	return nil
}

// getNextMigrationSequence determines the next sequence number for migrations
func getNextMigrationSequence(migrationsPath string) (int, error) {
	files, err := os.ReadDir(migrationsPath)
	if err != nil {
		if os.IsNotExist(err) {
			return 1, nil
		}
		return 0, err
	}

	maxSeq := 0
	for _, file := range files {
		if file.IsDir() {
			continue
		}

		name := file.Name()
		if len(name) < 6 {
			continue
		}

		var seq int
		_, err := fmt.Sscanf(name, "%d_", &seq)
		if err == nil && seq > maxSeq {
			maxSeq = seq
		}
	}

	return maxSeq + 1, nil
}

// extractTableInfoFromStruct extracts table information from a struct
func extractTableInfoFromStruct(modelStruct interface{}) (TableInfo, error) {
	tableInfo := TableInfo{}

	t := reflect.TypeOf(modelStruct)
	if t.Kind() == reflect.Ptr {
		t = t.Elem()
	}

	// Get table name from struct name (convert CamelCase to snake_case and pluralize)
	tableName := camelToSnake(t.Name()) + "s"
	tableInfo.Name = tableName

	// Check for composite primary keys
	var compositePKColumns []string

	// First pass to find composite primary key
	for i := 0; i < t.NumField(); i++ {
		field := t.Field(i)

		// Check for composite primary key tag
		dbTag := field.Tag.Get("db")
		if dbTag != "" {
			parts := strings.Split(dbTag, ",")
			for _, part := range parts {
				if strings.HasPrefix(part, "pk(") && strings.HasSuffix(part, ")") {
					// Extract column names from pk(col1,col2)
					pkCols := strings.TrimSuffix(strings.TrimPrefix(part, "pk("), ")")
					compositePKColumns = strings.Split(pkCols, ",")
				}
			}
		}
	}

	// Process struct fields
	for i := 0; i < t.NumField(); i++ {
		field := t.Field(i)

		// Skip unexported fields
		if !field.IsExported() {
			continue
		}

		// Get column info from field tags
		column := extractColumnInfoFromField(field)
		if column.Name != "" {
			// Check if this column is part of a composite primary key
			for _, pkCol := range compositePKColumns {
				if pkCol == column.Name {
					// Don't mark individual columns as PK when they're part of a composite key
					column.PrimaryKey = false
				}
			}
			tableInfo.Columns = append(tableInfo.Columns, column)
		}

		// Check for index tag
		indexTag := field.Tag.Get("index")
		if indexTag != "" {
			parts := strings.Split(indexTag, ",")
			indexName := fmt.Sprintf("idx_%s_%s", tableName, column.Name)
			unique := false

			for _, part := range parts {
				if part == "unique" {
					unique = true
				} else if strings.HasPrefix(part, "name=") {
					indexName = strings.TrimPrefix(part, "name=")
				}
			}

			tableInfo.Indexes = append(tableInfo.Indexes, IndexInfo{
				Name:    indexName,
				Columns: []string{column.Name},
				Unique:  unique,
			})
		}
	}

	// Add composite primary key constraint if needed
	if len(compositePKColumns) > 0 {
		tableInfo.CompositePrimaryKey = compositePKColumns
	}

	return tableInfo, nil
}

// extractColumnInfoFromField extracts column information from a struct field
func extractColumnInfoFromField(field reflect.StructField) ColumnInfo {
	column := ColumnInfo{}

	// Get column name from db tag or field name
	dbTag := field.Tag.Get("db")
	if dbTag == "-" {
		return column // Skip this field
	}

	if dbTag != "" {
		parts := strings.Split(dbTag, ",")
		column.Name = parts[0]

		// Process options
		for _, part := range parts[1:] {
			switch part {
			case "pk":
				column.PrimaryKey = true
			case "notnull":
				column.NotNull = true
			case "unique":
				column.Unique = true
			default:
				if strings.HasPrefix(part, "default=") {
					column.Default = strings.TrimPrefix(part, "default=")
				} else if strings.HasPrefix(part, "references=") {
					column.References = strings.TrimPrefix(part, "references=")
				}
			}
		}
	} else {
		column.Name = camelToSnake(field.Name)
	}

	// Map Go types to SQLite types
	column.Type = mapGoTypeToSQLite(field.Type)

	return column
}

// generateCreateTableSQL generates SQL for creating a table
func generateCreateTableSQL(table TableInfo) string {
	var sb strings.Builder

	sb.WriteString(fmt.Sprintf("CREATE TABLE IF NOT EXISTS %s (\n", table.Name))

	// Add columns
	for i, col := range table.Columns {
		if i > 0 {
			sb.WriteString(",\n")
		}

		sb.WriteString(fmt.Sprintf("    %s %s", col.Name, col.Type))

		if col.PrimaryKey {
			sb.WriteString(" PRIMARY KEY")
		}

		if col.NotNull {
			sb.WriteString(" NOT NULL")
		}

		if col.Unique {
			sb.WriteString(" UNIQUE")
		}

		if col.Default != "" {
			sb.WriteString(fmt.Sprintf(" DEFAULT %s", col.Default))
		}

		if col.References != "" {
			sb.WriteString(fmt.Sprintf(" REFERENCES %s", col.References))
		}
	}

	// Add composite primary key if needed
	if len(table.CompositePrimaryKey) > 0 {
		sb.WriteString(",\n    PRIMARY KEY (")
		for i, col := range table.CompositePrimaryKey {
			if i > 0 {
				sb.WriteString(", ")
			}
			sb.WriteString(col)
		}
		sb.WriteString(")")
	}

	sb.WriteString("\n);\n\n")

	// Add indexes
	for _, idx := range table.Indexes {
		uniqueStr := ""
		if idx.Unique {
			uniqueStr = "UNIQUE "
		}

		columns := strings.Join(idx.Columns, ", ")
		sb.WriteString(fmt.Sprintf("CREATE %sINDEX IF NOT EXISTS %s ON %s(%s);\n",
			uniqueStr, idx.Name, table.Name, columns))
	}

	return sb.String()
}

// mapGoTypeToSQLite maps Go types to SQLite types
func mapGoTypeToSQLite(t reflect.Type) string {
	switch t.Kind() {
	case reflect.Bool:
		return "BOOLEAN"
	case reflect.Int, reflect.Int8, reflect.Int16, reflect.Int32, reflect.Int64,
		reflect.Uint, reflect.Uint8, reflect.Uint16, reflect.Uint32, reflect.Uint64:
		return "INTEGER"
	case reflect.Float32, reflect.Float64:
		return "REAL"
	case reflect.String:
		return "TEXT"
	case reflect.Struct:
		if t == reflect.TypeOf(time.Time{}) {
			return "TIMESTAMP"
		}
		return "TEXT" // JSON serialization for other structs
	case reflect.Slice:
		if t.Elem().Kind() == reflect.Uint8 {
			return "BLOB" // []byte
		}
		return "TEXT" // JSON serialization for other slices
	default:
		return "TEXT"
	}
}

// camelToSnake converts a CamelCase string to snake_case
func camelToSnake(s string) string {
	var result strings.Builder
	for i, r := range s {
		if i > 0 && 'A' <= r && r <= 'Z' {
			result.WriteRune('_')
		}
		result.WriteRune(r)
	}
	return strings.ToLower(result.String())
}

// CreateTable creates a table from a struct if it doesn't exist
func (db *DB) CreateTable(modelStruct interface{}) error {
	tableInfo, err := extractTableInfoFromStruct(modelStruct)
	if err != nil {
		return fmt.Errorf("failed to extract table info: %w", err)
	}

	// Generate SQL
	sql := generateCreateTableSQL(tableInfo)

	// Execute SQL
	_, err = db.Exec(sql)
	if err != nil {
		return fmt.Errorf("failed to create table: %w", err)
	}

	logger.Info("Created table: %s", tableInfo.Name)
	return nil
}

// AutoMigrate automatically creates tables from structs
func (db *DB) AutoMigrate(modelStructs ...interface{}) error {
	for _, model := range modelStructs {
		if err := db.CreateTable(model); err != nil {
			return err
		}
	}
	return nil
}
