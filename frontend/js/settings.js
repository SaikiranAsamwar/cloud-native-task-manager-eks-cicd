/**
 * Settings Page
 */

const API_URL = '/api';

/**
 * Initialize settings page
 */
document.addEventListener('DOMContentLoaded', async () => {
    loadSettings();
    setupEventListeners();
    loadDatabaseStats();
});

/**
 * Load settings from localStorage
 */
function loadSettings() {
    const theme = localStorage.getItem('theme') || 'light';
    const notifications = localStorage.getItem('notifications') !== 'false';
    const itemsPerPage = localStorage.getItem('itemsPerPage') || '10';

    // Set UI to current settings
    const themeSelect = document.getElementById('themeSelect');
    const notificationsCheckbox = document.getElementById('notifications');
    const itemsInput = document.getElementById('itemsPerPage');

    if (themeSelect) themeSelect.value = theme;
    if (notificationsCheckbox) notificationsCheckbox.checked = notifications;
    if (itemsInput) itemsInput.value = itemsPerPage;

    applyTheme(theme);
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Theme selector
    const themeSelect = document.getElementById('themeSelect');
    if (themeSelect) {
        themeSelect.addEventListener('change', (e) => {
            localStorage.setItem('theme', e.target.value);
            applyTheme(e.target.value);
            showMessage('Theme updated', 'success');
        });
    }

    // Notifications toggle
    const notificationsCheckbox = document.getElementById('notifications');
    if (notificationsCheckbox) {
        notificationsCheckbox.addEventListener('change', (e) => {
            localStorage.setItem('notifications', e.target.checked);
            showMessage('Notification settings updated', 'success');
        });
    }

    // Items per page
    const itemsInput = document.getElementById('itemsPerPage');
    if (itemsInput) {
        itemsInput.addEventListener('change', (e) => {
            const value = Math.min(Math.max(parseInt(e.target.value) || 10, 5), 100);
            itemsInput.value = value;
            localStorage.setItem('itemsPerPage', value);
            showMessage('Display settings updated', 'success');
        });
    }

    // Export data button
    const exportBtn = document.getElementById('exportDataBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportData);
    }

    // Clear cache button
    const clearCacheBtn = document.getElementById('clearCacheBtn');
    if (clearCacheBtn) {
        clearCacheBtn.addEventListener('click', clearCache);
    }

    // Reset to defaults button
    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetToDefaults);
    }
}

/**
 * Apply theme
 */
function applyTheme(theme) {
    if (theme === 'dark') {
        document.documentElement.style.setProperty('--bg-color', '#1a1a1a');
        document.documentElement.style.setProperty('--text-color', '#ffffff');
    } else {
        document.documentElement.style.setProperty('--bg-color', '#ffffff');
        document.documentElement.style.setProperty('--text-color', '#333333');
    }
}

/**
 * Load database statistics
 */
async function loadDatabaseStats() {
    try {
        const [usersResponse, tasksResponse] = await Promise.all([
            fetch(`${API_URL}/users`),
            fetch(`${API_URL}/tasks`)
        ]);

        if (!usersResponse.ok || !tasksResponse.ok) {
            throw new Error('Failed to load database stats');
        }

        const users = await usersResponse.json();
        const tasks = await tasksResponse.json();

        // Calculate database size (rough estimate)
        const userSize = users.length * 200; // ~200 bytes per user
        const taskSize = tasks.length * 300; // ~300 bytes per task
        const totalSize = (userSize + taskSize) / 1024; // Convert to KB

        // Update database info
        const dbInfo = document.getElementById('databaseInfo');
        if (dbInfo) {
            dbInfo.innerHTML = `
                <div style="background: #f5f5f5; padding: 15px; border-radius: 8px;">
                    <p><strong>Total Records:</strong> ${users.length + tasks.length}</p>
                    <p><strong>Users:</strong> ${users.length}</p>
                    <p><strong>Tasks:</strong> ${tasks.length}</p>
                    <p><strong>Est. Database Size:</strong> ${totalSize.toFixed(2)} KB</p>
                    <p><strong>Database Type:</strong> SQLite</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading database stats:', error);
    }
}

/**
 * Export data as JSON
 */
async function exportData() {
    if (!confirm('Export all data as JSON file?')) {
        return;
    }

    try {
        const [usersResponse, tasksResponse] = await Promise.all([
            fetch(`${API_URL}/users`),
            fetch(`${API_URL}/tasks`)
        ]);

        if (!usersResponse.ok || !tasksResponse.ok) {
            throw new Error('Failed to export data');
        }

        const users = await usersResponse.json();
        const tasks = await tasksResponse.json();

        const data = {
            exportDate: new Date().toISOString(),
            users,
            tasks
        };

        // Create and download file
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `task-app-export-${new Date().getTime()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        showMessage('Data exported successfully', 'success');
    } catch (error) {
        console.error('Error exporting data:', error);
        showMessage('Error exporting data', 'error');
    }
}

/**
 * Clear browser cache
 */
function clearCache() {
    if (!confirm('Clear all cached data? This will clear browser cache but not server data.')) {
        return;
    }

    try {
        // Clear localStorage
        localStorage.clear();
        
        // Clear sessionStorage
        sessionStorage.clear();

        // Clear browser cache (if available)
        if ('caches' in window) {
            caches.keys().then(names => {
                names.forEach(name => caches.delete(name));
            });
        }

        showMessage('Cache cleared successfully. Page will reload.', 'success');
        setTimeout(() => location.reload(), 1500);
    } catch (error) {
        console.error('Error clearing cache:', error);
        showMessage('Error clearing cache', 'error');
    }
}

/**
 * Reset settings to defaults
 */
function resetToDefaults() {
    if (!confirm('Reset all settings to defaults? Your data will not be affected.')) {
        return;
    }

    try {
        // Reset localStorage
        localStorage.setItem('theme', 'light');
        localStorage.setItem('notifications', 'true');
        localStorage.setItem('itemsPerPage', '10');

        // Reload settings UI
        loadSettings();

        showMessage('Settings reset to defaults', 'success');
    } catch (error) {
        console.error('Error resetting settings:', error);
        showMessage('Error resetting settings', 'error');
    }
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
