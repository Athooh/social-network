package main

import (
	"fmt"
	"os"

	"github.com/Athooh/social-network/internal/config"
	"github.com/Athooh/social-network/internal/server"
	"github.com/Athooh/social-network/pkg/auth"
	"github.com/Athooh/social-network/pkg/db/sqlite"
	"github.com/Athooh/social-network/pkg/logger"
	"github.com/Athooh/social-network/pkg/session"
	"github.com/Athooh/social-network/pkg/user"
)

func main() {
	if len(os.Args) != 1 {
		fmt.Println("Usage: go run cmd/api/main.go ")
		os.Exit(1)
	}

	// Load configuration
	cfg := config.Load()

	// Set up logger
	level := logger.INFO
	switch cfg.Log.Level {
	case "debug":
		level = logger.DEBUG
	case "info":
		level = logger.INFO
	case "warn":
		level = logger.WARN
	case "error":
		level = logger.ERROR
	case "fatal":
		level = logger.FATAL
	}

	log := logger.New(logger.Config{
		Level:       level,
		Output:      os.Stdout,
		TimeFormat:  cfg.Log.TimeFormat,
		ShowCaller:  cfg.Log.ShowCaller,
		FilePath:    cfg.Log.FilePath,
		EnableColor: cfg.Log.EnableColor,
		OutputType:  logger.BothOutput,
	})

	log.Info("Starting social network API server")

	// Set up database
	dbConfig := sqlite.Config{
		DBPath:         cfg.Database.Path,
		MigrationsPath: cfg.Database.MigrationsPath,
	}

	db, err := sqlite.New(dbConfig)
	if err != nil {
		log.Fatal("Failed to connect to database: %v", err)
	}
	defer db.Close()

	log.Info("Connected to database")

	// Set up repositories
	userRepo := user.NewSQLiteRepository(db.DB)
	sessionRepo := session.NewSQLiteRepository(db.DB)

	// Set up session manager
	sessionManager := auth.NewSessionManager(
		sessionRepo,
		cfg.Auth.SessionCookieName,
		cfg.Auth.SessionCookieDomain,
		cfg.Auth.SessionCookieSecure,
		cfg.Auth.SessionMaxAge,
	)

	// Set up services
	authService := auth.NewService(userRepo, sessionManager)

	// Set up handlers
	authHandler := auth.NewHandler(authService)

	// Set up router
	router := server.Router(authHandler, authService.RequireAuth, log)

	// Set up server
	serverConfig := server.Config{
		Host:         cfg.Server.Host,
		Port:         cfg.Server.Port,
		ReadTimeout:  cfg.Server.ReadTimeout,
		WriteTimeout: cfg.Server.WriteTimeout,
		IdleTimeout:  cfg.Server.IdleTimeout,
	}

	srv := server.New(serverConfig, router, log)

	// Start server
	if err := srv.Start(); err != nil {
		log.Fatal("Server error: %v", err)
	}
}
