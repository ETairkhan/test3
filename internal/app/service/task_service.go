package service

import (
	"context"
	"log/slog"
	"time"
	"todo-app/internal/adapter/postgres"
	"todo-app/internal/domain/model"

	"github.com/google/uuid"
)

type TaskService struct {
	log      *slog.Logger
	taskRepo *postgres.TaskRepository
}

func NewTaskService(log *slog.Logger, tr *postgres.TaskRepository) *TaskService {
	return &TaskService{
		log:      log,
		taskRepo: tr,
	}
}

func (ts *TaskService) Create(ctx context.Context, task model.Task) error {
	ctx, cancel := context.WithTimeout(ctx, time.Second*5)
	defer cancel()
	err := ts.taskRepo.Create(ctx, task)
	if err != nil {
		return err
	}
	return nil
}

func (ts *TaskService) GetTasks(ctx context.Context) ([]model.Task, error) {
	ctx, cancel := context.WithTimeout(ctx, time.Second*5)
	defer cancel()

	tasks, err := ts.taskRepo.GetAll(ctx)
	if err != nil {
		return []model.Task{}, err
	}
	return tasks, nil
}

func (ts *TaskService) UpdateTaskStatus(ctx context.Context, id string, status string) error {
	log := ts.log.With("method", "UpdateTaskStatus")
	iid, err := uuid.Parse(id)
	if err != nil {
		return err
	}
	ctx, cancel := context.WithTimeout(ctx, time.Second*5)
	defer cancel()

	err = ts.taskRepo.UpdateStatus(ctx, iid, status)
	if err != nil {
		return err
	}
	log.Info("updated task", "id", id, "status", status)
	return nil
}

func (ts *TaskService) DeleteTask(ctx context.Context, id string) error {

	iid, err := uuid.Parse(id)
	if err != nil {
		return err
	}
	ctx, cancel := context.WithTimeout(ctx, time.Second*5)
	defer cancel()

	err = ts.taskRepo.Delete(ctx, iid)
	if err != nil {
		return err
	}
	return nil
}

func (ts *TaskService) GetFilteredAndSortedTasks(
	ctx context.Context,
	from, to string,
	status string,
	orderBy string,
	asc bool,
) ([]model.Task, error) {
	log := ts.log.With("method", "GetFilteredAndSortedTasks")

	start, end := time.Unix(0, 0).UTC(), time.Now()
	if from != "" {
		start1, err := time.Parse("2006-01-02", from)
		if err != nil {
			return make([]model.Task, 0), err
		}
		start = start1
	}

	if to != "" {
		end2, err := time.Parse("2006-01-02", to)
		if err != nil {
			return make([]model.Task, 0), err
		}
		end = end2
	}

	ctx, cancel := context.WithTimeout(ctx, time.Second*5)
	defer cancel()

	log.Debug("data came", "start", start, "end", end, "status", status, "orderby", orderBy, "asc", asc)

	tasks, err := ts.taskRepo.FilterAndSort(ctx, start, end, status, orderBy, asc)
	if err != nil {
		return make([]model.Task, 0), nil
	}
	log.Debug("dea len", "len", len(tasks))
	return tasks, nil
}

func (ts *TaskService) UpdateTaskPriority(ctx context.Context, id string, priority int) error {
	iid, err := uuid.Parse(id)
	if err != nil {
		return err
	}
	ctx, cancel := context.WithTimeout(ctx, time.Second*5)
	defer cancel()

	err = ts.taskRepo.UpdatePriority(ctx, iid, priority)
	if err != nil {
		return err
	}
	return nil
}
