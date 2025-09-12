package models

import (
	"time"
	"todo-app/internal/app/core"
)

type Task struct {
	ID        string        `json:"id"`
	Text      string        `json:"text"`
	Completed bool          `json:"completed"`
	CreatedAt time.Time     `json:"createdAt"`
	Priority  core.Priority `json:"priority"`
	DueDate   time.Time     `json:"dueDate,omitempty"`
}
