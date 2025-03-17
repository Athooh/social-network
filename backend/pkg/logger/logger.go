package logger

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"runtime"
	"sync"
	"time"
)

// Level represents the severity level of a log message
type Level int

const (
	// DEBUG level for detailed information
	DEBUG Level = iota
	// INFO level for general operational information
	INFO
	// WARN level for warning events
	WARN
	// ERROR level for error events
	ERROR
	// FATAL level for critical errors that cause the application to terminate
	FATAL
)

// String returns the string representation of a log level
func (l Level) String() string {
	switch l {
	case DEBUG:
		return "DEBUG"
	case INFO:
		return "INFO"
	case WARN:
		return "WARN"
	case ERROR:
		return "ERROR"
	case FATAL:
		return "FATAL"
	default:
		return "UNKNOWN"
	}
}

// Global loggers
var (
	debugLogger *log.Logger
	infoLogger  *log.Logger
	warnLogger  *log.Logger
	errorLogger *log.Logger
	fatalLogger *log.Logger
	level       Level
	once        sync.Once
	config      Config
)

// Color represents a terminal color code
type Color string

const (
	// Color codes for terminal output
	ColorReset  Color = "\033[0m"
	ColorRed    Color = "\033[31m"
	ColorGreen  Color = "\033[32m"
	ColorYellow Color = "\033[33m"
	ColorBlue   Color = "\033[34m"
	ColorPurple Color = "\033[35m"
	ColorCyan   Color = "\033[36m"
	ColorWhite  Color = "\033[37m"
)

// OutputType represents where logs should be written
type OutputType int

const (
	// ConsoleOutput writes logs to console only
	ConsoleOutput OutputType = iota
	// FileOutput writes logs to file only
	FileOutput
	// BothOutput writes logs to both console and file
	BothOutput
)

// Config holds the logger configuration
type Config struct {
	Level         Level
	Output        io.Writer  // Will be used for backward compatibility
	OutputType    OutputType // Determines where logs are written
	FileOutput    io.Writer  // File to write logs to
	ConsoleOutput io.Writer  // Console to write logs to (usually os.Stdout)
	TimeFormat    string
	ShowCaller    bool
	EnableColor   bool // Whether to enable colors in console output
	FilePath      string
}

// Init initializes the global loggers
func Init(cfg Config) {
	once.Do(func() {
		config = cfg

		// Setup file writer if needed
		if config.OutputType == FileOutput || config.OutputType == BothOutput {
			fileWriter := setupFileWriter(config)
			config.FileOutput = fileWriter
		}

		if config.TimeFormat == "" {
			config.TimeFormat = time.RFC3339
		}

		// Set default console output if not provided
		if config.ConsoleOutput == nil {
			config.ConsoleOutput = os.Stdout
		}

		if config.FileOutput == nil && (config.OutputType == FileOutput || config.OutputType == BothOutput) {
			config.FileOutput = setupFileWriter(config)
		}

		// For backward compatibility
		if config.Output == nil {
			switch config.OutputType {
			case ConsoleOutput:
				config.Output = config.ConsoleOutput
			case FileOutput:
				config.Output = config.FileOutput
			case BothOutput:
				// For BothOutput, we'll handle the writing separately in writeLog
				// This prevents double writing to console
				config.Output = io.Discard
			}
		}

		flags := 0
		prefix := ""

		debugLogger = log.New(config.Output, prefix, flags)
		infoLogger = log.New(config.Output, prefix, flags)
		warnLogger = log.New(config.Output, prefix, flags)
		errorLogger = log.New(config.Output, prefix, flags)
		fatalLogger = log.New(config.Output, prefix, flags)
		level = config.Level
	})
}

// getLevelColor returns the appropriate color for a log level
func getLevelColor(level Level) Color {
	switch level {
	case DEBUG:
		return ColorBlue
	case INFO:
		return ColorGreen
	case WARN:
		return ColorYellow
	case ERROR:
		return ColorRed
	case FATAL:
		return ColorPurple
	default:
		return ColorWhite
	}
}

// formatMessage formats a log message with timestamp, level, and caller information
func formatMessage(level Level, message string, config Config) string {
	timestamp := time.Now().Format(config.TimeFormat)

	var caller string
	if config.ShowCaller {
		_, file, line, ok := runtime.Caller(4) 
		if ok {
			file = filepath.Base(file)
			caller = fmt.Sprintf(" [%s:%d]", file, line)
		}
	}

	levelStr := level.String()

	// Apply colors only for console output and if enabled
	if config.EnableColor && (config.OutputType == ConsoleOutput || config.OutputType == BothOutput) {
		// Only apply color when writing to console
		if writer, ok := config.Output.(io.Writer); ok &&
			(writer == config.ConsoleOutput ||
				(config.OutputType == BothOutput && config.Output == io.MultiWriter(config.ConsoleOutput, config.FileOutput))) {
			color := getLevelColor(level)
			levelStr = fmt.Sprintf("%s%s%s", color, levelStr, ColorReset)
		}
	}

	return fmt.Sprintf("[%s] [%s]%s %s", timestamp, levelStr, caller, message)
}

// writeLog writes a log message to the appropriate outputs
func writeLog(logger *log.Logger, level Level, msg string) {
	// If we're using both outputs, handle each output separately
	if config.OutputType == BothOutput {
		// Write colored version to console if colors are enabled
		consoleConfig := config
		if config.EnableColor {
			coloredMsg := formatMessage(level, msg, consoleConfig)
			fmt.Fprintln(config.ConsoleOutput, coloredMsg)
		} else {
			plainMsg := formatMessage(level, msg, consoleConfig)
			fmt.Fprintln(config.ConsoleOutput, plainMsg)
		}

		// Write non-colored version to file
		fileConfig := config
		fileConfig.EnableColor = false
		plainMsg := formatMessage(level, msg, fileConfig)
		if config.FileOutput != nil {
			fmt.Fprintln(config.FileOutput, plainMsg)
		}
	} else {
		// Normal logging through the logger for single output
		formattedMsg := formatMessage(level, msg, config)
		logger.Println(formattedMsg)
	}
}

// Debug logs a debug message
func Debug(format string, v ...interface{}) {
	if level <= DEBUG {
		msg := fmt.Sprintf(format, v...)
		writeLog(debugLogger, DEBUG, msg)
	}
}

// Info logs an info message
func Info(format string, v ...interface{}) {
	if level <= INFO {
		msg := fmt.Sprintf(format, v...)
		writeLog(infoLogger, INFO, msg)
	}
}

// Warn logs a warning message
func Warn(format string, v ...interface{}) {
	if level <= WARN {
		msg := fmt.Sprintf(format, v...)
		writeLog(warnLogger, WARN, msg)
	}
}

// Error logs an error message
func Error(format string, v ...interface{}) {
	if level <= ERROR {
		msg := fmt.Sprintf(format, v...)
		writeLog(errorLogger, ERROR, msg)
	}
}

// Fatal logs a fatal message and exits the application
func Fatal(format string, v ...interface{}) {
	if level <= FATAL {
		msg := fmt.Sprintf(format, v...)
		writeLog(fatalLogger, FATAL, msg)
		os.Exit(1)
	}
}

// SetOutput sets the output destination for the logger
func SetOutput(outputType OutputType, consoleOutput, fileOutput io.Writer) {
	config.OutputType = outputType

	if consoleOutput != nil {
		config.ConsoleOutput = consoleOutput
	}

	if fileOutput != nil {
		config.FileOutput = fileOutput
	}

	switch outputType {
	case ConsoleOutput:
		config.Output = config.ConsoleOutput
	case FileOutput:
		config.Output = config.FileOutput
	case BothOutput:
		config.Output = io.MultiWriter(config.ConsoleOutput, config.FileOutput)
	}

	// Update all loggers with the new output
	debugLogger.SetOutput(config.Output)
	infoLogger.SetOutput(config.Output)
	warnLogger.SetOutput(config.Output)
	errorLogger.SetOutput(config.Output)
	fatalLogger.SetOutput(config.Output)
}

// SetColorEnabled enables or disables colored output
func SetColorEnabled(enabled bool) {
	config.EnableColor = enabled
}

// Logger represents a logger instance for compatibility with existing code
type Logger struct {
	debugLogger *log.Logger
	infoLogger  *log.Logger
	warnLogger  *log.Logger
	errorLogger *log.Logger
	fatalLogger *log.Logger
	level       Level
}

// New creates a new logger instance (for backward compatibility)
func New(config Config) *Logger {
	// Initialize global loggers if not already done
	Init(config)

	return &Logger{
		debugLogger: debugLogger,
		infoLogger:  infoLogger,
		warnLogger:  warnLogger,
		errorLogger: errorLogger,
		fatalLogger: fatalLogger,
		level:       level,
	}
}

// Debug logs a debug message (method for backward compatibility)
func (l *Logger) Debug(format string, v ...interface{}) {
	Debug(format, v...)
}

// Info logs an info message (method for backward compatibility)
func (l *Logger) Info(format string, v ...interface{}) {
	Info(format, v...)
}

// Warn logs a warning message (method for backward compatibility)
func (l *Logger) Warn(format string, v ...interface{}) {
	Warn(format, v...)
}

// Error logs an error message (method for backward compatibility)
func (l *Logger) Error(format string, v ...interface{}) {
	Error(format, v...)
}

// Fatal logs a fatal message and exits the application (method for backward compatibility)
func (l *Logger) Fatal(format string, v ...interface{}) {
	Fatal(format, v...)
}

// HTTPMiddleware creates a middleware for logging HTTP requests
func (l *Logger) HTTPMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()

		// Create a response writer wrapper to capture the status code
		rw := &responseWriter{
			ResponseWriter: w,
			statusCode:     http.StatusOK,
		}

		// Process the request
		next.ServeHTTP(rw, r)

		// Log the request
		duration := time.Since(start)
		Info(
			"%s %s %s %d %s",
			r.Method,
			r.RequestURI,
			r.RemoteAddr,
			rw.statusCode,
			duration,
		)
	})
}

// responseWriter is a wrapper for http.ResponseWriter that captures the status code
type responseWriter struct {
	http.ResponseWriter
	statusCode int
}

// WriteHeader captures the status code and calls the underlying ResponseWriter's WriteHeader
func (rw *responseWriter) WriteHeader(code int) {
	rw.statusCode = code
	rw.ResponseWriter.WriteHeader(code)
}

// HTTPMiddleware creates a global middleware for logging HTTP requests
func HTTPMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()

		// Create a response writer wrapper to capture the status code
		rw := &responseWriter{
			ResponseWriter: w,
			statusCode:     http.StatusOK,
		}

		// Process the request
		next.ServeHTTP(rw, r)

		// Log the request
		duration := time.Since(start)
		Info(
			"%s %s %s %d %s",
			r.Method,
			r.RequestURI,
			r.RemoteAddr,
			rw.statusCode,
			duration,
		)
	})
}

// setupFileWriter creates and returns a file writer for logging
func setupFileWriter(config Config) io.Writer {
	if config.FilePath == "" {
		// Use project root directory for logs
		projectRoot := getProjectRoot()
		logDir := filepath.Join(projectRoot, "logs")
		if err := os.MkdirAll(logDir, 0o755); err != nil {
			fmt.Printf("Failed to create log directory: %v\n", err)
			os.Exit(1)
		}
		config.FilePath = filepath.Join(logDir, fmt.Sprintf("%s.log", time.Now().Format("2006-01-02")))
	}

	// Create or open the log file with append mode
	file, err := os.OpenFile(config.FilePath, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0o644)
	if err != nil {
		fmt.Printf("Failed to open log file: %v\n", err)
		return os.Stdout
	}

	return file
}

// getProjectRoot attempts to find the project root directory
func getProjectRoot() string {
	// Try to use working directory as project root
	wd, err := os.Getwd()
	if err != nil {
		// Fallback to temp directory if working directory can't be determined
		return os.TempDir()
	}
	return wd
}
