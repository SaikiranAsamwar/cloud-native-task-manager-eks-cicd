/**
 * Tasks Management Page
 */

const API_URL = '/api';

// State
let allTasks = [];
let users = [];
let filters = {
    user: '',
    status: '',
    priority: ''
};

/**
 * Initialize tasks page
 */
document.addEventListener('DOMContentLoaded', async () => {
    await loadInitialData();
    setupFormListeners();
    setupFilterListeners();
});

/**
 * Load users and tasks
 */
async function loadInitialData() {
    try {
        const [usersResponse, tasksResponse] = await Promise.all([
            fetch(`${API_URL}/users`),
            fetch(`${API_URL}/tasks`)
        ]);

        if (!usersResponse.ok || !tasksResponse.ok) {
            throw new Error('Failed to load data');
        }

        users = await usersResponse.json();
        allTasks = await tasksResponse.json();

        populateUserSelects();
        displayTasks();
    } catch (error) {
        console.error('Error loading data:', error);
        showMessage('Error loading data', 'error');
    }
}

/**
 * Populate user dropdown selects
 */
function populateUserSelects() {
    const userSelect = document.getElementById('userSelect');
    const taskUserSelect = document.getElementById('taskUser');

    const userOptions = users.map(u => `<option value="${u.id}">${escapeHtml(u.full_name || u.username)}</option>`).join('');

    if (userSelect) {
        userSelect.innerHTML = '<option value="">All Users</option>' + userOptions;
    }

    if (taskUserSelect) {
        taskUserSelect.innerHTML = '<option value="">Select a user</option>' + userOptions;
    }
}

/**
 * Setup filter event listeners
 */
function setupFilterListeners() {
    const userSelect = document.getElementById('userSelect');
    const statusSelect = document.getElementById('statusSelect');
    const prioritySelect = document.getElementById('prioritySelect');

    if (userSelect) userSelect.addEventListener('change', (e) => {
        filters.user = e.target.value;
        displayTasks();
    });

    if (statusSelect) statusSelect.addEventListener('change', (e) => {
        filters.status = e.target.value;
        displayTasks();
    });

    if (prioritySelect) prioritySelect.addEventListener('change', (e) => {
        filters.priority = e.target.value;
        displayTasks();
    });
}

/**
 * Setup form event listeners
 */
function setupFormListeners() {
    const createTaskForm = document.getElementById('createTaskForm');
    if (createTaskForm) {
        createTaskForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await createTask();
        });
    }
}

/**
 * Display tasks with current filters
 */
function displayTasks() {
    const tasksContainer = document.getElementById('tasksContainer');
    if (!tasksContainer) return;

    let filtered = allTasks;

    // Apply filters
    if (filters.user) {
        filtered = filtered.filter(t => t.user_id === parseInt(filters.user));
    }

    if (filters.status) {
        const isCompleted = filters.status === 'completed';
        filtered = filtered.filter(t => t.completed === isCompleted);
    }

    if (filters.priority) {
        filtered = filtered.filter(t => t.priority === filters.priority);
    }

    if (filtered.length === 0) {
        tasksContainer.innerHTML = '<p style="text-align: center; padding: 40px; color: #666;">No tasks match your filters.</p>';
        return;
    }

    // Sort by due date
    filtered.sort((a, b) => {
        if (!a.due_date && !b.due_date) return 0;
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date) - new Date(b.due_date);
    });

    tasksContainer.innerHTML = filtered.map(task => {
        const user = users.find(u => u.id === task.user_id);
        const userName = user ? escapeHtml(user.full_name || user.username) : 'Unknown User';

        return `
            <div class="task-card ${task.completed ? 'completed' : ''}">
                <div class="task-header">
                    <div>
                        <h4>${escapeHtml(task.title)}</h4>
                        <p class="task-user">by ${userName}</p>
                    </div>
                    <button class="btn-icon" onclick="deleteTask(${task.id})">×</button>
                </div>
                <p class="task-description">${task.description ? escapeHtml(task.description) : 'No description'}</p>
                <div class="task-footer">
                    <div class="task-badges">
                        <span class="badge priority-${task.priority}">${task.priority}</span>
                        <span class="badge status-${task.completed ? 'completed' : 'pending'}">${task.completed ? 'Completed' : 'Pending'}</span>
                        ${task.due_date ? `<span class="badge">Due: ${formatDate(task.due_date)}</span>` : ''}
                    </div>
                    <button class="btn btn-small" onclick="toggleTask(${task.id})">
                        ${task.completed ? 'Mark Pending' : 'Mark Complete'}
                    </button>
                </div>
            </div>
        `;
    }).join('');

    addTaskCardStyles();
}

/**
 * Create new task
 */
async function createTask() {
    const titleInput = document.getElementById('taskTitle');
    const descriptionInput = document.getElementById('taskDescription');
    const userSelect = document.getElementById('taskUser');
    const prioritySelect = document.getElementById('taskPriority');
    const dueDateInput = document.getElementById('taskDueDate');

    if (!titleInput || !userSelect) return;

    const title = titleInput.value.trim();
    const description = descriptionInput ? descriptionInput.value.trim() : '';
    const userId = parseInt(userSelect.value);
    const priority = prioritySelect ? prioritySelect.value : 'medium';
    const dueDate = dueDateInput ? dueDateInput.value : '';

    if (!title || !userId) {
        showMessage('Please fill in title and select a user', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_id: userId,
                title,
                description,
                priority,
                due_date: dueDate || null
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create task');
        }

        showMessage('Task created successfully!', 'success');
        document.getElementById('createTaskForm').reset();
        await loadInitialData();
    } catch (error) {
        console.error('Error creating task:', error);
        showMessage(error.message, 'error');
    }
}

/**
 * Toggle task completion status
 */
async function toggleTask(taskId) {
    try {
        const task = allTasks.find(t => t.id === taskId);
        if (!task) return;

        const response = await fetch(`${API_URL}/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                completed: !task.completed
            })
        });

        if (!response.ok) throw new Error('Failed to update task');

        showMessage('Task updated successfully', 'success');
        await loadInitialData();
    } catch (error) {
        console.error('Error updating task:', error);
        showMessage('Error updating task', 'error');
    }
}

/**
 * Delete task
 */
async function deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/tasks/${taskId}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete task');

        showMessage('Task deleted successfully', 'success');
        await loadInitialData();
    } catch (error) {
        console.error('Error deleting task:', error);
        showMessage('Error deleting task', 'error');
    }
}

/**
 * Format date for display
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Add CSS for task cards
 */
function addTaskCardStyles() {
    if (document.getElementById('taskCardStyles')) return;

    const style = document.createElement('style');
    style.id = 'taskCardStyles';
    style.textContent = `
        #tasksContainer {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
            gap: 20px;
            margin-top: 30px;
        }

        .task-card {
            background: white;
            border-left: 4px solid #667eea;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            transition: all 0.3s ease;
        }

        .task-card.completed {
            opacity: 0.7;
            border-left-color: #4caf50;
        }

        .task-card:hover {
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        }

        .task-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 12px;
            gap: 10px;
        }

        .task-header h4 {
            margin: 0;
            color: #333;
            word-break: break-word;
        }

        .task-user {
            font-size: 0.85em;
            color: #999;
            margin: 5px 0 0 0;
        }

        .task-description {
            color: #666;
            font-size: 0.95em;
            margin: 10px 0;
            line-height: 1.4;
        }

        .task-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 10px;
            flex-wrap: wrap;
        }

        .task-badges {
            display: flex;
            gap: 5px;
            flex-wrap: wrap;
        }

        .badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.8em;
            font-weight: 500;
        }

        .badge.priority-high {
            background: #ffebee;
            color: #c62828;
        }

        .badge.priority-medium {
            background: #fff3e0;
            color: #e65100;
        }

        .badge.priority-low {
            background: #e8f5e9;
            color: #2e7d32;
        }

        .badge.status-completed {
            background: #e8f5e9;
            color: #2e7d32;
        }

        .badge.status-pending {
            background: #e3f2fd;
            color: #1565c0;
        }
    `;
    document.head.appendChild(style);
}

/**
 * Show notification message
 */
function showMessage(message, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'};
        color: white;
        border-radius: 5px;
        z-index: 1000;
        animation: slideIn 0.3s ease-in-out;
    `;
    document.body.appendChild(messageDiv);

    setTimeout(() => {
        messageDiv.style.animation = 'slideOut 0.3s ease-in-out';
        setTimeout(() => messageDiv.remove(), 300);
    }, 3000);
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
