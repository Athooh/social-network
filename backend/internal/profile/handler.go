package profile

import (
	"net/http"

	"github.com/Athooh/social-network/pkg/logger"
)

// Handler handles HTTP requests for posts
type Handler struct {
	service Service
	log     *logger.Logger
}

// NewHandler creates a new chat handler
func NewHandler(service Service, log *logger.Logger) *Handler {
	return &Handler{
		service: service,
		log:     log,
	}
}


func (h *Handler) UpdateProfile(w http.ResponseWriter, r *http.Request) {

}