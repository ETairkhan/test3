package handler

import (
	"time"
	"todo-app/internal/app/core"
	"todo-app/internal/app/service"
	"todo-app/internal/domain/models"
)

type TaskHandlers struct {
	service *service.TaskService
}

func NewTaskHandlers(service *service.TaskService) *TaskHandlers {
	return &TaskHandlers{
		service: service,
	}
}

func (h *TaskHandlers) GetTasks(filter core.FilterType, sortBy core.SortType) ([]models.Task, error) {
	tasks, err := h.service.GetAllTasks()
	if err != nil {
		return nil, err
	}

	filtered := h.service.FilterTasks(tasks, filter)
	sorted := h.service.SortTasks(filtered, sortBy)

	return sorted, nil
}

func (h *TaskHandlers) AddTask(text string, priority core.Priority, dueDate time.Time) (*models.Task, error) {
	if text == "" {
		return nil, core.ErrEmptyTaskText
	}

	return h.service.AddTask(text, priority, dueDate)
}

func (h *TaskHandlers) UpdateTask(task models.Task) error {
	return h.service.UpdateTask(task)
}

func (h *TaskHandlers) DeleteTask(id string) error {
	return h.service.DeleteTask(id)
}

func (h *TaskHandlers) ToggleTask(id string) error {
	tasks, err := h.service.GetAllTasks()
	if err != nil {
		return err
	}

	for _, task := range tasks {
		if task.ID == id {
			task.Completed = !task.Completed
			return h.service.UpdateTask(task)
		}
	}

	return core.ErrTaskNotFound
}

// ParseFilterType parses a string to a FilterType.
func ParseFilterType(s string) core.FilterType {
    switch s {
    case "active":
        return core.FilterActive
    case "completed":
        return core.FilterCompleted
    case "today":
        return core.FilterToday
    case "week":
        return core.FilterWeek
    case "overdue":
        return core.FilterOverdue
    default:
        return core.FilterAll
    }
}

// ParseSortType parses a string to a SortType.
func ParseSortType(s string) core.SortType {
	switch s {
	case "priority":
		return core.SortDate
	default:
		return core.SortPriority
	}
}

// ParsePriority parses a string to a Priority.
func ParsePriority(s string) core.Priority {
	switch s {
	case "2", "medium":
		return core.PriorityMedium
	case "3", "high":
		return core.PriorityHigh
	default:
		return core.PriorityLow
	}
}
