package repository

import (
	"encoding/json"
	"os"
	"sync"
	"todo-app/internal/domain/models"
)

type TaskRepository interface {
	GetAll() ([]models.Task, error)
	SaveAll(tasks []models.Task) error
}

type FileTaskRepository struct {
	filePath string
	mu       sync.Mutex
}

func NewFileTaskRepository(filePath string) *FileTaskRepository {
	return &FileTaskRepository{
		filePath: filePath,
	}
}

func (r *FileTaskRepository) GetAll() ([]models.Task, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	if _, err := os.Stat(r.filePath); os.IsNotExist(err) {
		return []models.Task{}, nil
	}

	data, err := os.ReadFile(r.filePath)
	if err != nil {
		return nil, err
	}

	var tasks []models.Task
	if err := json.Unmarshal(data, &tasks); err != nil {
		return nil, err
	}

	return tasks, nil
}

func (r *FileTaskRepository) SaveAll(tasks []models.Task) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	data, err := json.MarshalIndent(tasks, "", "  ")
	if err != nil {
		return err
	}

	return os.WriteFile(r.filePath, data, 0644)
}
