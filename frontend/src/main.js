class TodoApp {
    async startTask(id) {
        try {
            if (!id || id.length === 0) {
                throw new Error('Invalid task ID');
            }
            await window.go.main.App.UpdateTaskStatus(id, 'in_progress');
            await this.loadTasks();
        } catch (error) {
            console.error('Ошибка начала задачи:', error);
            alert('Не удалось начать задачу: ' + error.message);
        }
    }
    constructor() {
        this.tasks = [];
        this.currentFilter = 'all';
        this.currentSort = 'date';
        this.theme = 'light';
        this.taskToDelete = null;
        
        this.initializeElements();
        this.bindEvents();
        this.loadTheme();
        this.loadTasks();
    }

    initializeElements() {
        // Форма добавления задач
        this.taskInput = document.getElementById('taskInput');
        this.prioritySelect = document.getElementById('prioritySelect');
        this.taskDescInput = document.getElementById('taskDescInput');
        this.startDateInput = document.getElementById('startDateInput');
        this.endDateInput = document.getElementById('endDateInput');
        this.addTaskBtn = document.getElementById('addTaskBtn');
        
        // Элементы управления
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.sortSelect = document.getElementById('sortSelect');
        this.themeToggle = document.getElementById('themeToggle');
        
        // Контейнер задач
        this.tasksContainer = document.getElementById('tasksContainer');
        
        // Модальное окно
        this.deleteModal = document.getElementById('deleteModal');
        this.deleteModalText = document.getElementById('deleteModalText');
        this.cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
        this.confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    }

    bindEvents() {
        // Добавление задачи
        this.addTaskBtn.addEventListener('click', () => this.addTask());
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });

        // Фильтрация
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.target.dataset.filter;
                this.setFilter(filter);
            });
        });

        // Сортировка
        this.sortSelect.addEventListener('change', (e) => {
            this.currentSort = e.target.value;
            this.renderTasks();
        });

        // Переключение темы
        this.themeToggle.addEventListener('click', () => this.toggleTheme());

        // Модальное окно
        this.cancelDeleteBtn.addEventListener('click', () => this.hideDeleteModal());
        this.confirmDeleteBtn.addEventListener('click', () => this.deleteTask());
    }

    async loadTasks() {
        try {
            this.tasks = await window.go.main.App.GetTasks();
            console.log('Loaded tasks:', this.tasks); // Debug log
            this.renderTasks();
        } catch (error) {
            console.error('Ошибка загрузки задач:', error);
        }
    }

    async addTask() {
        const title = this.taskInput.value.trim();
        const desc = this.taskDescInput.value.trim();
        if (!title) return;

        try {
            // Convert priority from string to int
            let priority = 2; // default medium
            switch (this.prioritySelect.value) {
                case 'low': priority = 1; break;
                case 'medium': priority = 2; break;
                case 'high': priority = 3; break;
            }

            // Handle deadline date
            let deadline = null;
            if (this.endDateInput.value) {
                deadline = new Date(this.endDateInput.value).toISOString();
            }

            const task = {
                ID: this.generateUUID(), 
                Title: title,
                Body: desc,
                Priority: priority,
                Status: "not_started",
                CreatedAt: new Date().toISOString(),
                Deadline: deadline,
                Done: false
            };

            console.log('Creating task:', task); // Debug log
            
            await window.go.main.App.CreateTask(task);
            
            // Reload tasks to get the updated list with IDs
            await this.loadTasks();
            
            // Сброс формы
            this.taskInput.value = '';
            this.taskDescInput.value = '';
            this.startDateInput.value = '';
            this.endDateInput.value = '';
            this.prioritySelect.value = 'medium';
            
        } catch (error) {
            console.error('Ошибка добавления задачи:', error);
            alert('Не удалось добавить задачу: ' + error.message);
        }
    }

    async toggleTask(id) {
        try {
            console.log('Toggling task:', id);
            if (!id || id.length === 0) {
                throw new Error('Invalid task ID');
            }
            // Find the current task to determine new status
            const task = this.tasks.find(t => {
                const taskId = t.ID || t.id || '';
                return taskId === id;
            });
            if (!task) {
                console.error('Task not found:', id);
                return;
            }
            let newStatus;
            const currentStatus = task.Status || task.status;
            if (currentStatus === 'done') {
                newStatus = 'not_started';
            } else if (currentStatus === 'in_progress') {
                newStatus = 'done';
            } else {
                newStatus = 'done';
            }
            console.log('Updating status:', id, '->', newStatus);
            await window.go.main.App.UpdateTaskStatus(id, newStatus);
            await this.loadTasks();
        } catch (error) {
            console.error('Ошибка обновления задачи:', error);
            alert('Не удалось обновить задачу: ' + error.message);
        }
    }

    showDeleteModal(task) {
        this.taskToDelete = task;
        this.deleteModalText.textContent = `Вы уверены, что хотите удалить задачу "${task.Title || 'Без названия'}"?`;
        this.deleteModal.style.display = 'flex';
    }

    hideDeleteModal() {
        this.taskToDelete = null;
        this.deleteModal.style.display = 'none';
    }

    async deleteTask() {
        if (!this.taskToDelete) return;

        try {
            console.log('Deleting task:', this.taskToDelete);
            // Make sure we have the correct ID field
            const taskId = this.taskToDelete.ID || this.taskToDelete.id;
            if (!taskId || taskId.length === 0) {
                throw new Error('Invalid task ID');
            }
            
            await window.go.main.App.DeleteTask(taskId);
            await this.loadTasks(); // Reload tasks after deletion
            this.hideDeleteModal();
        } catch (error) {
            console.error('Ошибка удаления задачи:', error);
            alert('Не удалось удалить задачу: ' + (error.message || 'Unknown error'));
        }
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        // Обновление активной кнопки
        this.filterBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        
        // For now, just reload all tasks - you can implement filtering later
        this.loadTasks();
    }

    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', this.theme);
        this.themeToggle.textContent = this.theme === 'light' ? '🌙' : '☀️';
        localStorage.setItem('theme', this.theme);
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        this.theme = savedTheme;
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.themeToggle.textContent = savedTheme === 'light' ? '🌙' : '☀️';
    }



    renderTasks() {
        if (!this.tasks || this.tasks.length === 0) {
            this.tasksContainer.innerHTML = '<div class="empty-state">Нет задач для отображения</div>';
            return;
        }

        // Фильтрация задач по текущему фильтру
        let filteredTasks = this.tasks;
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    // Неделя: с сегодняшнего дня до конца воскресенья
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    // endOfWeek: ближайшее воскресенье, 23:59:59.999
    const endOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (7 - now.getDay()));
    endOfWeek.setHours(23, 59, 59, 999);

        switch (this.currentFilter) {
            case 'active':
                filteredTasks = this.tasks.filter(task => (task.Status || task.status) === 'in_progress');
                break;
            case 'completed':
                filteredTasks = this.tasks.filter(task => (task.Status || task.status) === 'done');
                break;
            case 'today':
                filteredTasks = this.tasks.filter(task => {
                    const deadlineStr = task.Deadline || task.deadline;
                    if (!deadlineStr) return false;
                    const deadline = new Date(deadlineStr);
                    return deadline >= startOfToday && deadline < endOfToday;
                });
                break;
            case 'week':
                filteredTasks = this.tasks.filter(task => {
                    const deadlineStr = task.Deadline || task.deadline;
                    if (!deadlineStr) return false;
                    const deadline = new Date(deadlineStr);
                    return deadline >= startOfToday && deadline <= endOfWeek;
                });
                break;
            case 'overdue':
                filteredTasks = this.tasks.filter(task => {
                    const deadlineStr = task.Deadline || task.deadline;
                    if (!deadlineStr) return false;
                    const deadline = new Date(deadlineStr);
                    return deadline < now && (task.Status || task.status) !== 'done';
                });
                break;
            case 'all':
            default:
                // Все задачи
                filteredTasks = this.tasks;
        }

        if (!filteredTasks || filteredTasks.length === 0) {
            this.tasksContainer.innerHTML = '<div class="empty-state">Нет задач для отображения</div>';
            return;
        }

        console.log('Rendering tasks:', filteredTasks);

        // Сортировка задач
        let sortedTasks = [...filteredTasks];
        switch (this.currentSort) {
            case 'priority-asc':
                sortedTasks.sort((a, b) => (a.Priority || a.priority || 0) - (b.Priority || b.priority || 0));
                break;
            case 'priority-desc':
                sortedTasks.sort((a, b) => (b.Priority || b.priority || 0) - (a.Priority || a.priority || 0));
                break;
            case 'date-asc':
                sortedTasks.sort((a, b) => {
                    const aDate = new Date(a.CreatedAt || a.created_at || a.createdAt || 0);
                    const bDate = new Date(b.CreatedAt || b.created_at || b.createdAt || 0);
                    return aDate - bDate;
                });
                break;
            case 'date-desc':
            default:
                sortedTasks.sort((a, b) => {
                    const aDate = new Date(a.CreatedAt || a.created_at || a.createdAt || 0);
                    const bDate = new Date(b.CreatedAt || b.created_at || b.createdAt || 0);
                    return bDate - aDate;
                });
        }

        this.tasksContainer.innerHTML = sortedTasks.map(task => {
            // Ensure we have valid data
            const taskId = task.ID || task.id || '';
            const taskTitle = task.Title || task.title || 'Без названия';
            const taskStatus = task.Status || task.status || 'not_started';
            const taskPriority = task.Priority || task.priority || 2;
            const createdAt = task.CreatedAt || task.created_at || task.createdAt || new Date().toISOString();
            const deadline = task.Deadline || task.deadline;
            // Красивые статусы
            let statusHtml = '';
            if (taskStatus === 'not_started') {
                statusHtml = '<span class="task-status status-not-started">⏳ Не начата</span>';
            } else if (taskStatus === 'in_progress') {
                statusHtml = '<span class="task-status status-in-progress">🚀 В процессе</span>';
            } else if (taskStatus === 'done') {
                statusHtml = '<span class="task-status status-done">✅ Завершена</span>';
            } else {
                statusHtml = `<span class="task-status">${this.getStatusLabel(taskStatus)}</span>`;
            }
            // Красивая кнопка "Начать"
            const startBtnHtml = taskStatus === 'not_started' ? `<button class="start-btn fancy-start-btn" data-task-id="${taskId}">▶️ Начать</button>` : '';
            // Добавляем класс 'done' для зачёркивания
            const doneClass = taskStatus === 'done' ? 'done' : '';
            return `
            <div class="task-item ${taskStatus === 'done' ? 'completed' : ''} ${this.isOverdue(task) ? 'overdue' : ''}">
                <div class="task-content">
                    <input 
                        type="checkbox" 
                        ${taskStatus === 'done' ? 'checked' : ''}
                        data-task-id="${taskId}"
                        class="task-checkbox"
                        ${taskStatus === 'not_started' ? 'disabled' : ''}
                    >
                    <div class="task-text">
                        <span class="${doneClass}">${this.escapeHtml(taskTitle)}</span>
                        ${task.Body || task.body ? `<p class="task-desc ${doneClass}">${this.escapeHtml(task.Body || task.body)}</p>` : ''}
                        <div class="task-meta ${doneClass}">
                            <span class="priority-badge ${this.getPriorityClass(taskPriority)}">
                                ${this.getPriorityLabel(taskPriority)}
                            </span>
                            ${statusHtml}
                            ${deadline ? `
                                <span class="due-date">
                                   Дедлайн: 📅 ${this.formatDate(deadline)}
                                </span>
                            ` : ''}
                            <span class="created-date">
                                Создано: ${this.formatDate(createdAt)}
                            </span>
                        </div>
                        ${startBtnHtml}
                    </div>
                </div>
                <button 
                    class="delete-btn" 
                    data-task-id="${taskId}"
                    title="Удалить задачу"
                >
                    🗑️
                </button>
            </div>
            `;
        }).join('');
        // Привязка событий к кнопкам "Начать"
        const startBtns = this.tasksContainer.querySelectorAll('.start-btn');
        startBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = e.target.getAttribute('data-task-id');
                if (taskId && taskId.length > 0) {
                    this.startTask(taskId);
                }
            });
        });

        // Re-bind events after rendering
        this.bindTaskEvents();
    }
     // Add this helper method to generate UUIDs
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    bindTaskEvents() {
        // Add event listeners to checkboxes
        const checkboxes = this.tasksContainer.querySelectorAll('.task-checkbox');
        checkboxes.forEach(checkbox => {
            // Remove any existing event listener first to avoid duplicates
            checkbox.replaceWith(checkbox.cloneNode(true));
        });

        // Re-select checkboxes after cloning
        const newCheckboxes = this.tasksContainer.querySelectorAll('.task-checkbox');
        newCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const taskId = e.target.getAttribute('data-task-id');
                console.log('Checkbox changed for task:', taskId);
                if (taskId && taskId.length > 0) {
                    this.toggleTask(taskId);
                } else {
                    console.error('Invalid task ID:', taskId);
                }
            });
        });

        // Add event listeners to delete buttons
        const deleteButtons = this.tasksContainer.querySelectorAll('.delete-btn');
        deleteButtons.forEach(button => {
            // Remove any existing event listener first to avoid duplicates
            button.replaceWith(button.cloneNode(true));
        });

        // Re-select delete buttons after cloning
        const newDeleteButtons = this.tasksContainer.querySelectorAll('.delete-btn');
        newDeleteButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const taskId = e.target.getAttribute('data-task-id');
                console.log('Delete button clicked for task:', taskId);
                if (taskId && taskId.length > 0) {
                    this.showDeleteModalById(taskId);
                } else {
                    console.error('Invalid task ID for deletion:', taskId);
                }
            });
        });
    }

    showDeleteModalById(taskId) {
        console.log('Looking for task with ID:', taskId);
        const task = this.tasks.find(t => {
            const id1 = t.ID || t.id || '';
            console.log('Comparing:', id1, 'with', taskId);
            return id1 === taskId;
        });
        
        if (task) {
            console.log('Found task:', task);
            this.showDeleteModal(task);
        } else {
            console.error('Task not found with ID:', taskId, 'Available tasks:', this.tasks);
            alert('Задача не найдена');
        }
    }

    isOverdue(task) {
        if (!task.Deadline || task.Status === 'done') return false;
        const now = new Date();
        const deadline = new Date(task.Deadline);
        return deadline < now;
    }

    getPriorityClass(priority) {
        if (priority >= 3) return 'high';
        if (priority >= 2) return 'medium';
        return 'low';
    }

    getPriorityLabel(priority) {
        if (priority >= 3) return 'Высокий';
        if (priority >= 2) return 'Средний';
        return 'Низкий';
    }

    getStatusLabel(status) {
        // Не используется, но оставим для совместимости
        const statusLabels = {
            'not_started': 'Не начата',
            'in_progress': 'В процессе',
            'done': 'Завершена'
        };
        return statusLabels[status] || status;
    }


    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatDate(dateString) {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.error('Error formatting date:', error, dateString);
            return 'Неверная дата';
        }
    }
}


// Инициализация приложения
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new TodoApp();
});
