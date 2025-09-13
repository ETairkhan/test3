package postgres

import (
	"context"
	"database/sql"
	"fmt"
	"log/slog"
	"time"
	"todo-app/internal/domain/model"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
)

type TaskRepository struct {
	conn *pgx.Conn
}

func NewTaskRepository(conn *pgx.Conn) *TaskRepository {
	return &TaskRepository{
		conn: conn,
	}
}

// implement me
func (tr *TaskRepository) Create(ctx context.Context, task model.Task) error {
	q := `INSERT INTO tasks (title, body, priority, deadline) VALUES ($1, $2, $3, $4)`
	_, err := tr.conn.Exec(ctx, q, task.Title, task.Body, task.Priority, task.Deadline)
	return err
}

func (tr *TaskRepository) GetAll(ctx context.Context) ([]model.Task, error) {
	q := `SELECT id, title, body, done, status, created_at, priority, deadline FROM tasks ORDER BY created_at`
	rows, err := tr.conn.Query(ctx, q)
	if err != nil {
		return []model.Task{}, err
	}
	tasks := make([]model.Task, 0)
	for rows.Next() {
		task := model.Task{}
		deadline := sql.NullTime{}
		err = rows.Scan(&task.ID, &task.Title, &task.Body, &task.Done, &task.Status, &task.CreatedAt, &task.Priority, &deadline)
		if err != nil {
			continue
		}
		if deadline.Valid {
			task.Deadline = &deadline.Time
		} else {
			task.Deadline = nil
		}
		tasks = append(tasks, task)
	}

	return tasks, nil
}

func (tr *TaskRepository) UpdateStatus(ctx context.Context, id uuid.UUID, status string) error {
	q := `UPDATE tasks SET status = $1 WHERE id = $2`
	_, err := tr.conn.Exec(ctx, q, status, id)
	if err != nil {
		return err
	}
	return nil
}

func (tr *TaskRepository) Delete(ctx context.Context, id uuid.UUID) error {
	q := `DELETE FROM tasks WHERE id = $1`
	_, err := tr.conn.Exec(ctx, q, id)
	if err != nil {
		return err
	}
	return nil
}

func (tr *TaskRepository) FilterAndSort(
	ctx context.Context,
	start, end time.Time,
	status string,
	orderBy string,
	asc bool,
) ([]model.Task, error) {
	q := `SELECT id,
		title, 
		body,
		done,
		status,
		created_at,
		priority,
		deadline
	FROM 
		tasks
	WHERE created_at::date >= $1 AND created_at::date <= $2`
	args := []interface{}{start, end}

	if status == "expired" {
		q += ` AND deadline <= CURRENT_TIMESTAMP AND status != 'done'`
	} else if status != "" {
		args = append(args, status)
		q += ` AND status = $3`
	}

	switch orderBy {
	case "created_at":
		q += ` ORDER BY created_at `
	case "priority":
		q += ` ORDER BY priority `
	case "deadline":
		q += ` AND deadline IS NOT NULL ORDER BY deadline `
	default:
		q += fmt.Sprintf(` ORDER BY $%d `, len(args)+1)
		args = append(args, "created_at")
	}

	if orderBy != "" && asc {
		q += ` ASC;`
	} else if orderBy != "" && !asc {
		q += ` DESC;`
	}

	rows, err := tr.conn.Query(ctx, q, args...)
	if err != nil {
		return []model.Task{}, err
	}
	tasks := make([]model.Task, 0)
	for rows.Next() {
		task := model.Task{}
		deadline := sql.NullTime{}
		err = rows.Scan(&task.ID, &task.Title, &task.Body, &task.Done, &task.Status, &task.CreatedAt, &task.Priority, &deadline)
		if err != nil {
			slog.Warn("cannot scan data")
			continue
		}
		if deadline.Valid {
			task.Deadline = &deadline.Time
		} else {
			task.Deadline = nil
		}

		tasks = append(tasks, task)
	}
	return tasks, nil
}

func (tr *TaskRepository) UpdatePriority(ctx context.Context, id uuid.UUID, priority int) error {
	q := `UPDATE tasks SET priority = $1 WHERE id = $2`
	cmd, err := tr.conn.Exec(ctx, q, priority, id)
	if cmd.RowsAffected() == 0 {
		return fmt.Errorf("no such id: %v", err)
	}

	return err
}
