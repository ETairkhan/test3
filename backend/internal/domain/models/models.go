package models

import (
	"time"
)

type Priority string

const (
	PriorityLow    Priority = "low"
	PriorityMedium Priority = "medium"
	PriorityHigh   Priority = "high"
)

type Task struct {
	ID          string    `json:"id"`
	Text        string    `json:"text"`
	Completed   bool      `json:"completed"`
	CreatedAt   time.Time `json:"createdAt"`
	Priority    Priority  `json:"priority"`
	DueDate     time.Time `json:"dueDate,omitempty"`
}
