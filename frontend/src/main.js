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
        this.dueDateInput = document.getElementById('dueDateInput');
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
            this.tasks = await window.go.main.App.GetTasks(this.currentFilter, this.currentSort);
            this.renderTasks();
        } catch (error) {
            console.error('Ошибка загрузки задач:', error);
        }
    }

    async addTask() {
        const text = this.taskInput.value.trim();
        if (!text) return;

        try {
            const priority = this.prioritySelect.value;
            const dueDate = this.dueDateInput.value ? new Date(this.dueDateInput.value).toISOString() : "";
            const task = await window.go.main.App.AddTask(text, priority, dueDate);
            
            this.tasks.unshift(task);
            this.renderTasks();
            
            // Сброс формы
            this.taskInput.value = '';
            this.dueDateInput.value = '';
            this.prioritySelect.value = 'medium';
            
        } catch (error) {
            console.error('Ошибка добавления задачи:', error);
            alert('Не удалось добавить задачу');
        }
    }

    async toggleTask(id) {
        try {
            await window.go.main.App.ToggleTask(id);
            await this.loadTasks();
        } catch (error) {
            console.error('Ошибка обновления задачи:', error);
        }
    }

    showDeleteModal(task) {
        this.taskToDelete = task;
        this.deleteModalText.textContent = `Вы уверены, что хотите удалить задачу "${task.text}"?`;
        this.deleteModal.style.display = 'flex';
    }

    hideDeleteModal() {
        this.taskToDelete = null;
        this.deleteModal.style.display = 'none';
    }

    async deleteTask() {
        if (!this.taskToDelete) return;

        try {
            await window.go.main.App.DeleteTask(this.taskToDelete.id);
            this.tasks = this.tasks.filter(t => t.id !== this.taskToDelete.id);
            this.renderTasks();
            this.hideDeleteModal();
        } catch (error) {
            console.error('Ошибка удаления задачи:', error);
            alert('Не удалось удалить задачу');
        }
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        // Обновление активной кнопки
        this.filterBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        
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
        if (this.tasks.length === 0) {
            this.tasksContainer.innerHTML = '<div class="empty-state">Нет задач для отображения</div>';
            return;
        }

        this.tasksContainer.innerHTML = this.tasks.map(task => `
            <div class="task-item ${task.completed ? 'completed' : ''}">
                <div class="task-content">
                    <input 
                        type="checkbox" 
                        ${task.completed ? 'checked' : ''}
                        onchange="app.toggleTask('${task.id}')"
                        class="task-checkbox"
                    >
                    <div class="task-text">
                        <span>${this.escapeHtml(task.text)}</span>
                        <div class="task-meta">
                            <span class="priority-badge ${task.priority}">
                                ${this.getPriorityLabel(task.priority)}
                            </span>
                            ${task.dueDate && new Date(task.dueDate).getTime() > 0 ? `
                                <span class="due-date">
                                    📅 ${this.formatDate(task.dueDate)}
                                </span>
                            ` : ''}
                        </div>
                    </div>
                </div>
                <button 
                    class="delete-btn" 
                    onclick="app.showDeleteModal(${this.escapeHtml(JSON.stringify(task))})"
                    title="Удалить задачу"
                >
                    🗑️
                </button>
            </div>
        `).join('');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    getPriorityLabel(priority) {
        const labels = {
            low: 'Низкий',
            medium: 'Средний',
            high: 'Высокий'
        };
        return labels[priority] || priority;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
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