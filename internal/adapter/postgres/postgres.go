package postgres

import (
	"context"
	"fmt"
	"todo-app/internal/config"

	"github.com/jackc/pgx/v5"
)

type DB struct {
	Conn *pgx.Conn
}

func New(ctx context.Context, cfg config.ConfigDB) (*DB, error) {
	conn, err := pgx.Connect(ctx, fmt.Sprintf(
		"postgres://%s:%s@%s:%d/%s?sslmode=disable",
		"admin",
		"admin",
		"localhost",
		5433,
		"todolist",
	))
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}
	return &DB{
		Conn: conn,
	}, nil

}
