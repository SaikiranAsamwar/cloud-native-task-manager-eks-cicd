/**
 * Analytics Dashboard
 */

const API_URL = '/api';

/**
 * Initialize analytics page
 */
document.addEventListener('DOMContentLoaded', async () => {
    await loadAnalytics();
});

/**
 * Load and display analytics data
 */
async function loadAnalytics() {
    try {
        const [usersResponse, tasksResponse] = await Promise.all([
            fetch(`${API_URL}/users`),
            fetch(`${API_URL}/tasks`)
        ]);

        if (!usersResponse.ok || !tasksResponse.ok) {
            throw new Error('Failed to load analytics data');
        }

        const users = await usersResponse.json();
        const tasks = await tasksResponse.json();

        displayAnalytics(users, tasks);
    } catch (error) {
        console.error('Error loading analytics:', error);
        showMessage('Error loading analytics', 'error');
    }
}

/**
 * Display analytics data
 */
function displayAnalytics(users, tasks) {
    // Calculate statistics
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const totalUsers = users.length;
    const avgTasksPerUser = totalUsers > 0 ? Math.round(totalTasks / totalUsers * 10) / 10 : 0;

    // Update stat cards
    updateStatCard('statTotal', totalTasks, 'Total Tasks');
    updateStatCard('statCompleted', completedTasks, 'Completed');
    updateStatCard('statCompletion', completionRate + '%', 'Completion Rate');
    updateStatCard('statAvg', avgTasksPerUser, 'Avg per User');

    // Display priority distribution
    displayPriorityDistribution(tasks);

    // Display task status breakdown
    displayStatusBreakdown(tasks);

    // Display user summary
    displayUserSummary(users, tasks);
}

/**
 * Update stat card
 */
function updateStatCard(elementId, value, label) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const parent = element.closest('.stat-card');
    if (parent) {
        parent.innerHTML = `
            <div style="text-align: center;">
                <div style="font-size: 2.5em; font-weight: bold; color: #667eea; margin-bottom: 10px;">
                    ${value}
                </div>
                <div style="color: #999; font-size: 0.9em;">
                    ${label}
                </div>
            </div>
        `;
    }
}

/**
 * Display priority distribution
 */
function displayPriorityDistribution(tasks) {
    const priorityCounts = {
        high: tasks.filter(t => t.priority === 'high').length,
        medium: tasks.filter(t => t.priority === 'medium').length,
        low: tasks.filter(t => t.priority === 'low').length
    };

    const priorityChart = document.getElementById('priorityChart');
    if (!priorityChart) return;

    const maxCount = Math.max(...Object.values(priorityCounts), 1);
    const barHeight = (count) => (count / maxCount * 100);

    priorityChart.innerHTML = `
        <div style="display: flex; align-items: flex-end; justify-content: space-around; height: 200px; gap: 20px; padding: 20px;">
            <div style="display: flex; flex-direction: column; align-items: center; flex: 1;">
                <div style="width: 40px; height: ${barHeight(priorityCounts.high)}%; background: #f44336; border-radius: 4px 4px 0 0; min-height: 10px;"></div>
                <div style="margin-top: 10px; text-align: center; font-size: 0.9em;">
                    <div style="font-weight: bold; color: #f44336;">${priorityCounts.high}</div>
                    <div style="color: #999; font-size: 0.85em;">High</div>
                </div>
            </div>
            <div style="display: flex; flex-direction: column; align-items: center; flex: 1;">
                <div style="width: 40px; height: ${barHeight(priorityCounts.medium)}%; background: #ff9800; border-radius: 4px 4px 0 0; min-height: 10px;"></div>
                <div style="margin-top: 10px; text-align: center; font-size: 0.9em;">
                    <div style="font-weight: bold; color: #ff9800;">${priorityCounts.medium}</div>
                    <div style="color: #999; font-size: 0.85em;">Medium</div>
                </div>
            </div>
            <div style="display: flex; flex-direction: column; align-items: center; flex: 1;">
                <div style="width: 40px; height: ${barHeight(priorityCounts.low)}%; background: #4caf50; border-radius: 4px 4px 0 0; min-height: 10px;"></div>
                <div style="margin-top: 10px; text-align: center; font-size: 0.9em;">
                    <div style="font-weight: bold; color: #4caf50;">${priorityCounts.low}</div>
                    <div style="color: #999; font-size: 0.85em;">Low</div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Display task status breakdown
 */
function displayStatusBreakdown(tasks) {
    const completedCount = tasks.filter(t => t.completed).length;
    const pendingCount = tasks.filter(t => !t.completed).length;

    const statusChart = document.getElementById('statusChart');
    if (!statusChart) return;

    const total = completedCount + pendingCount || 1;
    const completedPercent = (completedCount / total * 100);
    const pendingPercent = (pendingCount / total * 100);

    statusChart.innerHTML = `
        <div style="padding: 20px;">
            <div style="margin-bottom: 30px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.9em;">
                    <span>Completed: ${completedCount}</span>
                    <span>${Math.round(completedPercent)}%</span>
                </div>
                <div style="height: 25px; background: #e0e0e0; border-radius: 12px; overflow: hidden;">
                    <div style="height: 100%; width: ${completedPercent}%; background: linear-gradient(90deg, #4caf50, #45a049); border-radius: 12px;"></div>
                </div>
            </div>
            <div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.9em;">
                    <span>Pending: ${pendingCount}</span>
                    <span>${Math.round(pendingPercent)}%</span>
                </div>
                <div style="height: 25px; background: #e0e0e0; border-radius: 12px; overflow: hidden;">
                    <div style="height: 100%; width: ${pendingPercent}%; background: linear-gradient(90deg, #2196f3, #1976d2); border-radius: 12px;"></div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Display user summary table
 */
function displayUserSummary(users, tasks) {
    const userSummaryTable = document.getElementById('userSummaryTable');
    if (!userSummaryTable) return;

    const userStats = users.map(user => {
        const userTasks = tasks.filter(t => t.user_id === user.id);
        const completedUserTasks = userTasks.filter(t => t.completed).length;
        const completionRate = userTasks.length > 0 ? Math.round((completedUserTasks / userTasks.length) * 100) : 0;

        return {
            id: user.id,
            name: escapeHtml(user.full_name || user.username),
            tasks: userTasks.length,
            completed: completedUserTasks,
            rate: completionRate
        };
    }).sort((a, b) => b.tasks - a.tasks);

    if (userStats.length === 0) {
        userSummaryTable.innerHTML = '<p style="text-align: center; padding: 20px; color: #999;">No users yet</p>';
        return;
    }

    userSummaryTable.innerHTML = `
        <table style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr style="background: #f5f5f5; border-bottom: 2px solid #ddd;">
                    <th style="padding: 12px; text-align: left; font-weight: 600; color: #333;">User</th>
                    <th style="padding: 12px; text-align: center; font-weight: 600; color: #333;">Total Tasks</th>
                    <th style="padding: 12px; text-align: center; font-weight: 600; color: #333;">Completed</th>
                    <th style="padding: 12px; text-align: center; font-weight: 600; color: #333;">Rate</th>
                </tr>
            </thead>
            <tbody>
                ${userStats.map((user, index) => `
                    <tr style="border-bottom: 1px solid #eee; background: ${index % 2 === 0 ? '#fff' : '#f9f9f9'};">
                        <td style="padding: 12px; text-align: left;">${user.name}</td>
                        <td style="padding: 12px; text-align: center;">${user.tasks}</td>
                        <td style="padding: 12px; text-align: center;">
                            <span style="background: #e8f5e9; color: #2e7d32; padding: 4px 8px; border-radius: 4px; font-weight: 500;">
                                ${user.completed}
                            </span>
                        </td>
                        <td style="padding: 12px; text-align: center;">
                            <span style="background: ${user.rate >= 75 ? '#e8f5e9' : user.rate >= 50 ? '#fff3e0' : '#ffebee'}; color: ${user.rate >= 75 ? '#2e7d32' : user.rate >= 50 ? '#e65100' : '#c62828'}; padding: 4px 8px; border-radius: 4px; font-weight: 500;">
                                ${user.rate}%
                            </span>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
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
