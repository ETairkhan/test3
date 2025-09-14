package model

import (
	"time"
	"encoding/json"
	"fmt"
	"github.com/google/uuid"
)
type Task struct{
	ID        uuid.UUID  `json:"id"`
	Title     string     `json:"title"`
	Body      string     `json:"body"`
	Done      bool       `json:"done"`
	Status    string     `json:"status"`   // "not_started", "in_progress", "done"
	Priority  int        `json:"priority"` // 0, 1, 2, 4
	CreatedAt *time.Time  `json:"CreatedAt"`
	Deadline  *time.Time `json:"deadline"`
}

// UnmarshalJSON для корректного парсинга только created_at
func (t *Task) UnmarshalJSON(data []byte) error {
	type Alias Task
	aux := &struct {
		CreatedAt *string `json:"CreatedAt"`
		*Alias
	}{
		Alias: (*Alias)(t),
	}
	if err := json.Unmarshal(data, &aux); err != nil {
		return err
	}
	// Parse CreatedAt
	if aux.CreatedAt != nil && *aux.CreatedAt != "" {
		parsed, err := time.Parse(time.RFC3339, *aux.CreatedAt)
		if err != nil {
			return fmt.Errorf("invalid created_at: %w", err)
		}
		t.CreatedAt = &parsed
	}
	return nil
}
