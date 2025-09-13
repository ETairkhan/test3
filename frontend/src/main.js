class TodoApp {
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
                Title: title,
                Body: "",
                Priority: priority,
                Status: "not_started",
                Deadline: deadline
            };

            console.log('Creating task:', task); // Debug log
            
            await window.go.main.App.CreateTask(task);
            
            // Reload tasks to get the updated list with IDs
            await this.loadTasks();
            
            // Сброс формы
            this.taskInput.value = '';
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
            console.log('Toggling task:', id); // Debug log
            
            // Find the current task to determine new status
            const task = this.tasks.find(t => t.ID === id);
            if (!task) {
                console.error('Task not found:', id);
                return;
            }

            let newStatus;
            if (task.Status === 'done') {
                newStatus = 'not_started';
            } else {
                newStatus = 'done';
            }

            console.log('Updating status:', id, '->', newStatus); // Debug log
            
            await window.go.main.App.UpdateTaskStatus(id, newStatus);
            await this.loadTasks(); // Reload tasks to get updated status
        } catch (error) {
            console.error('Ошибка обновления задачи:', error);
            alert('Не удалось обновить задачу: ' + error.message);
        }
    }

    showDeleteModal(task) {
        this.taskToDelete = task;
        this.deleteModalText.textContent = `Вы уверены, что хотите удалить задачу "${task.Title}"?`;
        this.deleteModal.style.display = 'flex';
    }

    hideDeleteModal() {
        this.taskToDelete = null;
        this.deleteModal.style.display = 'none';
    }

    async deleteTask() {
        if (!this.taskToDelete) return;

        try {
            console.log('Deleting task:', this.taskToDelete.ID); // Debug log
            await window.go.main.App.DeleteTask(this.taskToDelete.ID);
            await this.loadTasks(); // Reload tasks after deletion
            this.hideDeleteModal();
        } catch (error) {
            console.error('Ошибка удаления задачи:', error);
            alert('Не удалось удалить задачу: ' + error.message);
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

        console.log('Rendering tasks:', this.tasks); // Debug log

        this.tasksContainer.innerHTML = this.tasks.map(task => {
            // Ensure we have valid data
            const taskId = task.ID || '';
            const taskTitle = task.Title || 'Без названия';
            const taskStatus = task.Status || 'not_started';
            const taskPriority = task.Priority || 2;
            const createdAt = task.CreatedAt || new Date().toISOString();
            
            return `
            <div class="task-item ${taskStatus === 'done' ? 'completed' : ''} ${this.isOverdue(task) ? 'overdue' : ''}">
                <div class="task-content">
                    <input 
                        type="checkbox" 
                        ${taskStatus === 'done' ? 'checked' : ''}
                        onchange="window.app.toggleTask('${taskId}')"
                        class="task-checkbox"
                    >
                    <div class="task-text">
                        <span>${this.escapeHtml(taskTitle)}</span>
                        ${task.Body ? `<p>${this.escapeHtml(task.Body)}</p>` : ''}
                        <div class="task-meta">
                            <span class="priority-badge ${this.getPriorityClass(taskPriority)}">
                                ${this.getPriorityLabel(taskPriority)}
                            </span>
                            <span class="task-status">${this.getStatusLabel(taskStatus)}</span>
                            ${task.Deadline ? `
                                <span class="due-date">
                                    📅 ${this.formatDate(task.Deadline)}
                                </span>
                            ` : ''}
                            <span class="created-date">
                                Создано: ${this.formatDate(createdAt)}
                            </span>
                        </div>
                    </div>
                </div>
                <button 
                    class="delete-btn" 
                    onclick="window.app.showDeleteModal(${this.escapeHtml(JSON.stringify(task))})"
                    title="Удалить задачу"
                >
                    🗑️
                </button>
            </div>
            `;
        }).join('');

        // Re-bind events after rendering
        this.bindTaskEvents();
    }

    bindTaskEvents() {
        // Add event listeners to checkboxes and delete buttons
        const checkboxes = this.tasksContainer.querySelectorAll('.task-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const taskId = e.target.getAttribute('data-task-id');
                if (taskId) {
                    this.toggleTask(taskId);
                }
            });
        });

        const deleteButtons = this.tasksContainer.querySelectorAll('.delete-btn');
        deleteButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const taskData = e.target.getAttribute('data-task');
                if (taskData) {
                    try {
                        const task = JSON.parse(taskData);
                        this.showDeleteModal(task);
                    } catch (error) {
                        console.error('Error parsing task data:', error);
                    }
                }
            });
        });
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

// Глобальные функции для обработки событий в HTML
window.app = {
    toggleTask: (id) => app.toggleTask(id),
    showDeleteModal: (task) => app.showDeleteModal(task)
};