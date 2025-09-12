package service

import (
	"sort"
	"time"
	"todo-app/internal/domain/models"
	"todo-app/internal/domain/repository"
	"todo-app/internal/app/core"
)

type TaskService struct {
	repo repository.TaskRepository
}

func NewTaskService(repo repository.TaskRepository) *TaskService {
	return &TaskService{
		repo: repo,
	}
}

func (s *TaskService) GetAllTasks() ([]models.Task, error) {
	return s.repo.GetAll()
}

func (s *TaskService) AddTask(text string, priority core.Priority, dueDate time.Time) (*models.Task, error) {
	tasks, err := s.repo.GetAll()
	if err != nil {
		return nil, err
	}

	newTask := models.Task{
		ID:        generateID(),
		Text:      text,
		Completed: false,
		CreatedAt: time.Now(),
		Priority:  priority,
		DueDate:   dueDate,
	}

	tasks = append(tasks, newTask)

	if err := s.repo.SaveAll(tasks); err != nil {
		return nil, err
	}

	return &newTask, nil
}

func (s *TaskService) UpdateTask(task models.Task) error {
	tasks, err := s.repo.GetAll()
	if err != nil {
		return err
	}

	for i, t := range tasks {
		if t.ID == task.ID {
			tasks[i] = task
			break
		}
	}

	return s.repo.SaveAll(tasks)
}

func (s *TaskService) DeleteTask(id string) error {
	tasks, err := s.repo.GetAll()
	if err != nil {
		return err
	}

	for i, task := range tasks {
		if task.ID == id {
			tasks = append(tasks[:i], tasks[i+1:]...)
			break
		}
	}

	return s.repo.SaveAll(tasks)
}

func (s *TaskService) FilterTasks(tasks []models.Task, filter core.FilterType) []models.Task {
	now := time.Now()
	today := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	weekEnd := today.AddDate(0, 0, 7)

	var filtered []models.Task
	for _, task := range tasks {
		switch filter {
		case core.FilterAll:
			filtered = append(filtered, task)
		case core.FilterActive:
			if !task.Completed {
				filtered = append(filtered, task)
			}
		case core.FilterCompleted:
			if task.Completed {
				filtered = append(filtered, task)
			}
		case core.FilterToday:
			if !task.Completed && task.DueDate.After(today) && task.DueDate.Before(today.AddDate(0, 0, 1)) {
				filtered = append(filtered, task)
			}
		case core.FilterWeek:
			if !task.Completed && task.DueDate.After(now) && task.DueDate.Before(weekEnd) {
				filtered = append(filtered, task)
			}
		case core.FilterOverdue:
			if !task.Completed && task.DueDate.Before(now) {
				filtered = append(filtered, task)
			}
		}
	}

	return filtered
}

func (s *TaskService) SortTasks(tasks []models.Task, sortBy core.SortType) []models.Task {
	sorted := make([]models.Task, len(tasks))
	copy(sorted, tasks)

	switch sortBy {
	case core.SortDate:
		sort.Slice(sorted, func(i, j int) bool {
			return sorted[i].CreatedAt.After(sorted[j].CreatedAt)
		})
	case core.SortPriority:
		priorityOrder := map[core.Priority]int{
			core.PriorityHigh:   0,
			core.PriorityMedium: 1,
			core.PriorityLow:    2,
		}
		sort.Slice(sorted, func(i, j int) bool {
			if sorted[i].Priority == sorted[j].Priority {
				return sorted[i].CreatedAt.After(sorted[j].CreatedAt)
			}
			return priorityOrder[sorted[i].Priority] < priorityOrder[sorted[j].Priority]
		})
	}

	return sorted
}

func generateID() string {
	return time.Now().Format("20060102150405")
}