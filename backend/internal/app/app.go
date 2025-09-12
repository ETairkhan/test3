package app

import (
	"context"
	"encoding/json"
	"log"
	"time"
	"todo-app/internal/adapter/handler"
	"todo-app/internal/domain/repository"
	"todo-app/internal/app/service"
)

type App struct {
	ctx     context.Context
	handler *handlers.TaskHandlers
}

func NewApp() *App {
	// Создаем репозиторий, сервис и обработчики
	repo := repository.NewFileTaskRepository("tasks.json")
	taskService := service.NewTaskService(repo)
	handler := handlers.NewTaskHandlers(taskService)

	return &App{
		handler: handler,
	}
}

func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// GetTasks возвращает задачи с учетом фильтра и сортировки
func (a *App) GetTasks(filterStr string, sortByStr string) (string, error) {
	filter := handlers.FilterType(filterStr)
	sortBy := handlers.SortType(sortByStr)
	
	tasks, err := a.handler.GetTasks(filter, sortBy)
	if err != nil {
		return "", err
	}
	
	jsonData, err := json.Marshal(tasks)
	if err != nil {
		return "", err
	}
	
	return string(jsonData), nil
}

// AddTask добавляет новую задачу
func (a *App) AddTask(text string, priorityStr string, dueDateMillis int64) (string, error) {
	priority := handlers.Priority(priorityStr)
	var dueDate time.Time
	
	if dueDateMillis > 0 {
		dueDate = time.Unix(0, dueDateMillis*int64(time.Millisecond))
	}
	
	task, err := a.handler.AddTask(text, priority, dueDate)
	if err != nil {
		return "", err
	}
	
	jsonData, err := json.Marshal(task)
	if err != nil {
		return "", err
	}
	
	return string(jsonData), nil
}

// ToggleTask переключает статус выполнения задачи
func (a *App) ToggleTask(id string) error {
	return a.handler.ToggleTask(id)
}

// DeleteTask удаляет задачу
func (a *App) DeleteTask(id string) error {
	return a.handler.DeleteTask(id)
}