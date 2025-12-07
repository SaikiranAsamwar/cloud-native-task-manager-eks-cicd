/**
 * Notifications Page
 */

let currentFilter = 'all';

document.addEventListener('DOMContentLoaded', () => {
    // Notifications are already in HTML, just setup interactions
});

/**
 * Filter notifications
 */
function filterNotifications(filter) {
    currentFilter = filter;
    
    // Update active tab
    document.querySelectorAll('.filter-tabs .tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    const notifications = document.querySelectorAll('.notification-item');
    
    notifications.forEach(notification => {
        if (filter === 'all') {
            notification.style.display = 'flex';
        } else if (filter === 'unread') {
            notification.style.display = notification.classList.contains('unread') ? 'flex' : 'none';
        } else {
            // Filter by type based on icon class
            const hasType = notification.querySelector(`.notification-icon.${filter}`);
            notification.style.display = hasType ? 'flex' : 'none';
        }
    });

    showMessage(`Showing ${filter} notifications`, 'info');
}

/**
 * Mark all as read
 */
function markAllAsRead() {
    document.querySelectorAll('.notification-item.unread').forEach(item => {
        item.classList.remove('unread');
    });
    showMessage('All notifications marked as read', 'success');
}

/**
 * Clear all notifications
 */
function clearAllNotifications() {
    if (confirm('Are you sure you want to clear all notifications?')) {
        document.getElementById('notificationsList').innerHTML = 
            '<p class="empty-state">No notifications</p>';
        showMessage('All notifications cleared', 'success');
    }
}

/**
 * Refresh notifications
 */
function refreshNotifications() {
    showMessage('Refreshing notifications...', 'info');
    setTimeout(() => {
        showMessage('Notifications refreshed', 'success');
    }, 1000);
}

/**
 * Mark single notification as read
 */
function markAsRead(button) {
    const notification = button.closest('.notification-item');
    notification.classList.remove('unread');
    showMessage('Notification marked as read', 'success');
}

/**
 * Delete single notification
 */
function deleteNotification(button) {
    const notification = button.closest('.notification-item');
    notification.style.animation = 'fadeOut 0.3s ease';
    setTimeout(() => {
        notification.remove();
        showMessage('Notification deleted', 'success');
    }, 300);
}

/**
 * Show message
 */
function showMessage(message, type) {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.textContent = message;
    toast.className = `toast ${type} show`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
