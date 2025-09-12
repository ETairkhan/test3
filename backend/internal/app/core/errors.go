package core

import "errors"

var (
	ErrDBConn  = errors.New("db connection failure")
	ErrTaskNotFound = errors.New("task is not exist")
	ErrEmptyTaskText = errors.New("task is empty")
)
