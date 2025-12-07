/**
 * Dashboard - Main page with overview statistics
 */

// API base URL
const API_URL = '/api';

// State management
let stats = {
    totalUsers: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0
};

/**
 * Initialize dashboard on page load
 */
document.addEventListener('DOMContentLoaded', async () => {
    await loadDashboardStats();
    await loadRecentTasks();
    setupEventListeners();
});

/**
 * Load dashboard statistics
 */
async function loadDashboardStats() {
    try {
        // Fetch all users and tasks
        const [usersResponse, tasksResponse] = await Promise.all([
            fetch(`${API_URL}/users`),
            fetch(`${API_URL}/tasks`)
        ]);

        if (!usersResponse.ok || !tasksResponse.ok) {
            throw new Error('Failed to load statistics');
        }

        const users = await usersResponse.json();
        const tasks = await tasksResponse.json();

        // Calculate statistics
        stats.totalUsers = users.length;
        stats.totalTasks = tasks.length;
        stats.completedTasks = tasks.filter(t => t.completed).length;
        stats.pendingTasks = tasks.filter(t => !t.completed).length;

        // Update UI
        updateStatCards();
    } catch (error) {
        console.error('Error loading stats:', error);
        showMessage('Error loading statistics', 'error');
    }
}

/**
 * Update statistics cards in UI
 */
function updateStatCards() {
    const totalUsersCard = document.getElementById('totalUsers');
    const totalTasksCard = document.getElementById('totalTasks');
    const completedTasksCard = document.getElementById('completedTasks');
    const pendingTasksCard = document.getElementById('pendingTasks');

    if (totalUsersCard) totalUsersCard.textContent = stats.totalUsers;
    if (totalTasksCard) totalTasksCard.textContent = stats.totalTasks;
    if (completedTasksCard) completedTasksCard.textContent = stats.completedTasks;
    if (pendingTasksCard) pendingTasksCard.textContent = stats.pendingTasks;
}

/**
 * Load and display recent tasks
 */
async function loadRecentTasks() {
    try {
        const response = await fetch(`${API_URL}/tasks`);
        if (!response.ok) throw new Error('Failed to load tasks');

        let tasks = await response.json();

        // Get recent 5 tasks
        tasks = tasks.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);

        const recentTasksContainer = document.getElementById('recentTasks');
        if (!recentTasksContainer) return;

        if (tasks.length === 0) {
            recentTasksContainer.innerHTML = '<p style="color: #666; text-align: center; padding: 20px;">No tasks yet. Create your first task!</p>';
            return;
        }

        recentTasksContainer.innerHTML = tasks.map(task => `
            <div class="task-item">
                <div class="task-info">
                    <h4>${escapeHtml(task.title)}</h4>
                    <p>${task.description ? escapeHtml(task.description) : 'No description'}</p>
                    <div class="task-meta">
                        <span class="priority priority-${task.priority}">${task.priority}</span>
                        <span class="status ${task.completed ? 'completed' : 'pending'}">${task.completed ? 'Completed' : 'Pending'}</span>
                    </div>
                </div>
                <button class="btn-small" onclick="toggleTask(${task.id})">
                    ${task.completed ? 'Undo' : 'Complete'}
                </button>
            </div>
        `).join('');

    } catch (error) {
        console.error('Error loading recent tasks:', error);
    }
}

/**
 * Toggle task completion status
 */
async function toggleTask(taskId) {
    try {
        const response = await fetch(`${API_URL}/tasks/${taskId}`);
        if (!response.ok) throw new Error('Failed to fetch task');

        const task = await response.json();

        const updateResponse = await fetch(`${API_URL}/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                completed: !task.completed
            })
        });

        if (!updateResponse.ok) throw new Error('Failed to update task');

        // Reload dashboard
        await loadDashboardStats();
        await loadRecentTasks();
        showMessage('Task updated successfully', 'success');
    } catch (error) {
        console.error('Error toggling task:', error);
        showMessage('Error updating task', 'error');
    }
}

/**
 * Setup event listeners for quick action buttons
 */
function setupEventListeners() {
    const goToUsersBtn = document.getElementById('goToUsersBtn');
    const goToTasksBtn = document.getElementById('goToTasksBtn');
    const goToAnalyticsBtn = document.getElementById('goToAnalyticsBtn');

    if (goToUsersBtn) goToUsersBtn.addEventListener('click', () => window.location.href = '/users');
    if (goToTasksBtn) goToTasksBtn.addEventListener('click', () => window.location.href = '/tasks');
    if (goToAnalyticsBtn) goToAnalyticsBtn.addEventListener('click', () => window.location.href = '/analytics');
}

/**
 * Show notification message
 */
function showMessage(message, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type}`;
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
