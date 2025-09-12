package app

import (
	"context"
	"encoding/json"
	"time"
	"todo-app/internal/adapter/handler"
	"todo-app/internal/app/service"
	"todo-app/internal/domain/repository"
)

type App struct {
	ctx     context.Context
	handler *handler.TaskHandlers
}

func NewApp() *App {
	// Создаем репозиторий, сервис и обработчики
	repo := repository.NewFileTaskRepository("tasks.json")
	taskService := service.NewTaskService(repo)
	handler := handler.NewTaskHandlers(taskService)

	return &App{
		handler: handler,
	}
}

func (a *App) Startup(ctx context.Context) {
	a.ctx = ctx
}

// GetTasks возвращает задачи с учетом фильтра и сортировки
func (a *App) GetTasks(filterStr string, sortByStr string) (string, error) {
	filter := handler.ParseFilterType(filterStr)
	sortBy := handler.ParseSortType(sortByStr)

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
	priority := handler.ParsePriority(priorityStr)
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
