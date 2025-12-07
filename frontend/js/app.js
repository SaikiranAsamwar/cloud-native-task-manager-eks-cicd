// API Base URL
const API_BASE_URL = '/api';

// ==================== Helper Functions ====================

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

/**
 * Make API calls
 */
async function apiCall(endpoint, method = 'GET', data = null) {
    try {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
            }
        };
        
        if (data) {
            options.body = JSON.stringify(data);
        }
        
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || `HTTP ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

/**
 * Format date to readable format
 */
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * Parse ISO date from datetime-local input
 */
function parseDateTimeLocal(value) {
    if (!value) return null;
    return new Date(value).toISOString();
}

// ==================== User Management ====================

/**
 * Load and display all users
 */
async function loadUsers() {
    try {
        const users = await apiCall('/users');
        displayUsers(users);
        updateUserSelects(users);
    } catch (error) {
        showToast('Failed to load users', 'error');
        document.getElementById('usersList').innerHTML = '<p class="empty-state">Failed to load users</p>';
    }
}

/**
 * Display users in the list
 */
function displayUsers(users) {
    const usersList = document.getElementById('usersList');
    
    if (users.length === 0) {
        usersList.innerHTML = '<p class="empty-state">No users yet. Create one to get started!</p>';
        return;
    }
    
    usersList.innerHTML = users.map(user => `
        <div class="item-card">
            <div class="item-header">
                <div class="item-title">👤 ${escapeHtml(user.username)}</div>
                <button class="btn btn-danger btn-small" onclick="deleteUser(${user.id})">Delete</button>
            </div>
            <div class="item-meta">
                <span class="meta-tag">📧 ${escapeHtml(user.email)}</span>
                <span class="meta-tag">👤 ${escapeHtml(user.full_name)}</span>
                <span class="meta-tag">📅 ${formatDate(user.created_at)}</span>
            </div>
            <button class="btn btn-secondary btn-small" style="margin-top: 10px;" onclick="editUserClick(${user.id}, '${escapeHtml(user.username)}', '${escapeHtml(user.email)}', '${escapeHtml(user.full_name)}')">Edit</button>
        </div>
    `).join('');
}

/**
 * Create a new user
 */
async function createUser(e) {
    e.preventDefault();
    
    const formData = {
        username: document.getElementById('username').value,
        email: document.getElementById('email').value,
        full_name: document.getElementById('fullName').value
    };
    
    try {
        await apiCall('/users', 'POST', formData);
        showToast('User created successfully!', 'success');
        document.getElementById('userForm').reset();
        await loadUsers();
    } catch (error) {
        showToast(`Failed to create user: ${error.message}`, 'error');
    }
}

/**
 * Delete a user
 */
async function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user and all their tasks?')) {
        return;
    }
    
    try {
        await apiCall(`/users/${userId}`, 'DELETE');
        showToast('User deleted successfully!', 'success');
        await loadUsers();
        await loadTasks();
    } catch (error) {
        showToast(`Failed to delete user: ${error.message}`, 'error');
    }
}

/**
 * Edit user click handler
 */
function editUserClick(userId, username, email, fullName) {
    // Simple implementation: collect new data
    const newUsername = prompt('Enter new username:', username);
    if (newUsername === null) return;
    
    const newEmail = prompt('Enter new email:', email);
    if (newEmail === null) return;
    
    const newFullName = prompt('Enter new full name:', fullName);
    if (newFullName === null) return;
    
    editUser(userId, newUsername, newEmail, newFullName);
}

/**
 * Edit a user
 */
async function editUser(userId, username, email, fullName) {
    try {
        await apiCall(`/users/${userId}`, 'PUT', {
            username,
            email,
            full_name: fullName
        });
        showToast('User updated successfully!', 'success');
        await loadUsers();
    } catch (error) {
        showToast(`Failed to update user: ${error.message}`, 'error');
    }
}

/**
 * Update user select dropdowns
 */
function updateUserSelects(users) {
    const taskUserSelect = document.getElementById('taskUser');
    const userFilterSelect = document.getElementById('userFilter');
    
    taskUserSelect.innerHTML = '<option value="">Choose a user...</option>' +
        users.map(user => `<option value="${user.id}">${escapeHtml(user.username)}</option>`).join('');
    
    userFilterSelect.innerHTML = '<option value="">All Users</option>' +
        users.map(user => `<option value="${user.id}">${escapeHtml(user.username)}</option>`).join('');
}

// ==================== Task Management ====================

/**
 * Load and display all tasks or filtered tasks
 */
async function loadTasks() {
    try {
        const userFilter = document.getElementById('userFilter').value;
        const endpoint = userFilter ? `/tasks?user_id=${userFilter}` : '/tasks';
        const tasks = await apiCall(endpoint);
        displayTasks(tasks);
    } catch (error) {
        showToast('Failed to load tasks', 'error');
        document.getElementById('tasksList').innerHTML = '<p class="empty-state">Failed to load tasks</p>';
    }
}

/**
 * Display tasks in the list
 */
function displayTasks(tasks) {
    const tasksList = document.getElementById('tasksList');
    
    if (tasks.length === 0) {
        tasksList.innerHTML = '<p class="empty-state">No tasks yet. Create one to get started!</p>';
        return;
    }
    
    tasksList.innerHTML = tasks.map(task => `
        <div class="item-card">
            <div class="item-header">
                <div class="item-title">${task.completed ? '✅' : '📝'} ${escapeHtml(task.title)}</div>
                <button class="btn btn-danger btn-small" onclick="deleteTask(${task.id})">Delete</button>
            </div>
            ${task.description ? `<div class="item-description">${escapeHtml(task.description)}</div>` : ''}
            <div class="checkbox-group">
                <input type="checkbox" id="task-${task.id}" ${task.completed ? 'checked' : ''} onchange="toggleTaskStatus(${task.id}, this.checked)">
                <label for="task-${task.id}">Mark as ${task.completed ? 'incomplete' : 'complete'}</label>
            </div>
            <div class="item-meta">
                <span class="meta-tag ${task.priority}">${task.priority.toUpperCase()}</span>
                <span class="meta-tag ${task.completed ? 'completed' : ''}">User ID: ${task.user_id}</span>
                ${task.due_date ? `<span class="meta-tag">⏰ Due: ${formatDate(task.due_date)}</span>` : ''}
                <span class="meta-tag">📅 ${formatDate(task.created_at)}</span>
            </div>
            <button class="btn btn-secondary btn-small" style="margin-top: 10px;" onclick="editTaskClick(${task.id}, '${escapeHtml(task.title)}', '${escapeHtml(task.description || '')}', '${task.priority}')">Edit</button>
        </div>
    `).join('');
}

/**
 * Create a new task
 */
async function createTask(e) {
    e.preventDefault();
    
    const userId = document.getElementById('taskUser').value;
    if (!userId) {
        showToast('Please select a user', 'error');
        return;
    }
    
    const formData = {
        user_id: parseInt(userId),
        title: document.getElementById('taskTitle').value,
        description: document.getElementById('taskDescription').value,
        priority: document.getElementById('taskPriority').value,
        due_date: document.getElementById('taskDueDate').value ? parseDateTimeLocal(document.getElementById('taskDueDate').value) : null
    };
    
    try {
        await apiCall('/tasks', 'POST', formData);
        showToast('Task created successfully!', 'success');
        document.getElementById('taskForm').reset();
        await loadTasks();
    } catch (error) {
        showToast(`Failed to create task: ${error.message}`, 'error');
    }
}

/**
 * Toggle task completion status
 */
async function toggleTaskStatus(taskId, completed) {
    try {
        await apiCall(`/tasks/${taskId}`, 'PUT', { completed });
        showToast(`Task marked as ${completed ? 'complete' : 'incomplete'}!`, 'success');
        await loadTasks();
    } catch (error) {
        showToast(`Failed to update task: ${error.message}`, 'error');
    }
}

/**
 * Delete a task
 */
async function deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) {
        return;
    }
    
    try {
        await apiCall(`/tasks/${taskId}`, 'DELETE');
        showToast('Task deleted successfully!', 'success');
        await loadTasks();
    } catch (error) {
        showToast(`Failed to delete task: ${error.message}`, 'error');
    }
}

/**
 * Edit task click handler
 */
function editTaskClick(taskId, title, description, priority) {
    const newTitle = prompt('Enter new title:', title);
    if (newTitle === null) return;
    
    editTask(taskId, newTitle, description, priority);
}

/**
 * Edit a task
 */
async function editTask(taskId, title, description, priority) {
    try {
        await apiCall(`/tasks/${taskId}`, 'PUT', {
            title,
            description,
            priority
        });
        showToast('Task updated successfully!', 'success');
        await loadTasks();
    } catch (error) {
        showToast(`Failed to update task: ${error.message}`, 'error');
    }
}

// ==================== Tab Navigation ====================

/**
 * Handle tab switching
 */
function setupTabNavigation() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tabId = btn.dataset.tab;
            
            // Remove active class from all tabs
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            btn.classList.add('active');
            document.getElementById(tabId).classList.add('active');
            
            // Reload data when switching tabs
            if (tabId === 'users-tab') {
                loadUsers();
            } else if (tabId === 'tasks-tab') {
                loadTasks();
            }
        });
    });
}

// ==================== Event Listeners & Initialization ====================

/**
 * Setup filter event listener
 */
function setupFilterListener() {
    document.getElementById('userFilter').addEventListener('change', loadTasks);
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Initialize the application
 */
function initApp() {
    setupTabNavigation();
    setupFilterListener();
    
    // Form submissions
    document.getElementById('userForm').addEventListener('submit', createUser);
    document.getElementById('taskForm').addEventListener('submit', createTask);
    
    // Load initial data
    loadUsers();
    loadTasks();
}

// Start the app when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);
