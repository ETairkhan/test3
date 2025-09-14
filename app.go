package main

import (
	"context"
	"fmt"
	"log/slog"
	"time"
	"todo-app/internal/adapter/postgres"
	"todo-app/internal/app/service"
	"todo-app/internal/config"
	"todo-app/internal/domain/model"

	"github.com/google/uuid"
)

// App struct
type App struct {
	ctx         context.Context
	cnf         *config.Config
	taskService *service.TaskService
	log         *slog.Logger
}

// NewApp creates a new App application struct
func NewApp(cnf *config.Config, log *slog.Logger) (*App, error) {
	database, err := postgres.New(context.Background(), cnf.DB)
	if err != nil {
		return nil, err
	}
	tr := postgres.NewTaskRepository(database.Conn)
	ts := service.NewTaskService(log, tr)
	return &App{
		cnf:         cnf,
		log:         log.With("app", "App"),
		taskService: ts,
	}, nil
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// Greet returns a greeting for the given name
func (a *App) Greet(t model.Task) string {
	return fmt.Sprintf("Hello %s, It's show time!", t.Title)
}

func (a *App) CreateTask(task model.Task) error {
	log := a.log.With("method", "CreateTask")

	ctx, cancel := context.WithTimeout(a.ctx, time.Second*5)
	defer cancel()

	// Ensure the task has an ID
	if task.ID == uuid.Nil {
		task.ID = uuid.New()
	}

	// Debug: log the incoming CreatedAt value
	if task.CreatedAt == nil {
		log.Info("[DEBUG] task.CreatedAt is nil (from client)")
	} else {
		log.Info("[DEBUG] task.CreatedAt from client", "created_at", task.CreatedAt.String())
	}

	// Ensure the created_at is set
	if task.CreatedAt == nil || task.CreatedAt.IsZero() {
		now := time.Now().UTC()
		task.CreatedAt = &now
	}

	err := a.taskService.Create(ctx, task)
	if err != nil {
		log.Error("cannot create task", "error", err)
		return err
	}
	log.Info("task succesfull created")
	return nil
}

func (a *App) GetTasks() ([]model.Task, error) {
	log := a.log.With("method", "GetTasks")

	tasks, err := a.taskService.GetTasks(a.ctx)
	if err != nil {
		log.Error("cannot get tasks", "error", err)
		return []model.Task{}, err
	}

	log.Info("retrieved tasks", "count", len(tasks))
	for i, task := range tasks {
		log.Debug("task", "index", i, "id", task.ID, "title", task.Title, "status", task.Status)
	}

	return tasks, nil
}

func (a *App) UpdateTaskStatus(id string, status string) error {
	log := a.log.With("method", "UpdateTaskStatus")

	err := a.taskService.UpdateTaskStatus(a.ctx, id, status)
	if err != nil {
		log.Error("cannot update task", "error", err)
		return err
	}
	log.Info("updated task", "id", id, "status", status)
	return nil
}

func (a *App) DeleteTask(id string) error {
	log := a.log.With("method", "UpdateTaskStatus")
	log.Info("Deleting task", "id", id)

	if id == "" {
		return fmt.Errorf("empty task ID")
	}

	err := a.taskService.DeleteTask(a.ctx, id)
	if err != nil {
		log.Error("cannot delete task", "error", err)
		return err
	}
	log.Info("deleted task", "id", id)
	return nil
}

func (a *App) GetFilteredAndSortedTasks(from, to string, status string, orderBy string, asc bool) ([]model.Task, error) {
	log := a.log.With("method", "GetFilteredAndSortedTasks")

	tasks, err := a.taskService.GetFilteredAndSortedTasks(a.ctx, from, to, status, orderBy, asc)
	if err != nil {
		slog.Error("cannot get filter", "error", err)
		return make([]model.Task, 0), nil
	}

	log.Debug("get filtered and sorted data")
	return tasks, nil
}

func (a *App) UpdateTaskPriority(id string, priority int) error {
	log := a.log.With("method", "UpdateTaskPriority")

	err := a.taskService.UpdateTaskPriority(a.ctx, id, priority)
	if err != nil {
		log.Error("cannot update", "error", err)
		return err
	}
	return nil
}
