package model

import (
	"time"

	"github.com/google/uuid"
)

type Task struct {
	ID        uuid.UUID  `json:"id"`
	Title     string     `json:"title"`
	Body      string     `json:"body"`
	Done      bool       `json:"done"`
	Status    string     `json:"status"`   // "not_started", "in_progress", "done"
	Priority  int        `json:"priority"` // 0, 1, 2, 4
	CreatedAt time.Time  `json:"created_at"`
	Deadline  *time.Time `json:"deadline"`
}
