package core


type FilterType string

const (
	FilterAll        FilterType = "all"
	FilterActive     FilterType = "active"
	FilterCompleted  FilterType = "completed"
	FilterToday      FilterType = "today"
	FilterWeek       FilterType = "week"
	FilterOverdue    FilterType = "overdue"
)

type SortType string

const (
	SortDate      SortType = "date"
	SortPriority  SortType = "priority"
)


type Priority string

const (
	PriorityLow    Priority = "low"
	PriorityMedium Priority = "medium"
	PriorityHigh   Priority = "high"
)
