/**
 * Calendar Page
 */

const API_URL = '/api';
let currentDate = new Date();
let tasks = [];

document.addEventListener('DOMContentLoaded', async () => {
    await loadTasks();
    renderCalendar();
    loadUpcomingTasks();
    loadTodayTasks();
});

/**
 * Load tasks from API
 */
async function loadTasks() {
    try {
        const response = await fetch(`${API_URL}/tasks`);
        if (response.ok) {
            tasks = await response.json();
        }
    } catch (error) {
        console.error('Error loading tasks:', error);
    }
}

/**
 * Render calendar
 */
function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Update month display
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    document.getElementById('currentMonth').textContent = `${monthNames[month]} ${year}`;

    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const calendarGrid = document.getElementById('calendarGrid');
    calendarGrid.innerHTML = '';

    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        const dayEl = createDayElement(day, true);
        calendarGrid.appendChild(dayEl);
    }

    // Current month days
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
        const isToday = year === today.getFullYear() && 
                       month === today.getMonth() && 
                       day === today.getDate();
        const dayEl = createDayElement(day, false, isToday);
        calendarGrid.appendChild(dayEl);
    }

    // Next month days
    const remainingDays = 42 - (firstDay + daysInMonth);
    for (let day = 1; day <= remainingDays; day++) {
        const dayEl = createDayElement(day, true);
        calendarGrid.appendChild(dayEl);
    }
}

/**
 * Create day element
 */
function createDayElement(day, isOtherMonth, isToday = false) {
    const dayEl = document.createElement('div');
    dayEl.className = 'calendar-day';
    
    if (isOtherMonth) dayEl.classList.add('other-month');
    if (isToday) dayEl.classList.add('today');

    const dayNumber = document.createElement('div');
    dayNumber.className = 'day-number';
    dayNumber.textContent = day;

    dayEl.appendChild(dayNumber);
    return dayEl;
}

/**
 * Previous month
 */
function previousMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
}

/**
 * Next month
 */
function nextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
}

/**
 * Load upcoming tasks
 */
function loadUpcomingTasks() {
    const container = document.getElementById('upcomingTasks');
    if (!container) return;

    if (tasks.length === 0) {
        container.innerHTML = '<p class="empty-state">No upcoming tasks</p>';
        return;
    }

    container.innerHTML = tasks.slice(0, 5).map(task => `
        <div class="task-item">
            <div class="task-info">
                <h4>${task.title}</h4>
                <p>${task.description || 'No description'}</p>
            </div>
            <span class="meta-tag priority-${task.priority}">${task.priority}</span>
        </div>
    `).join('');
}

/**
 * Load today's tasks
 */
function loadTodayTasks() {
    const container = document.getElementById('todayTasks');
    if (!container) return;

    const todayTasks = tasks.filter(task => {
        // Filter tasks for today
        return true; // Simplified
    });

    if (todayTasks.length === 0) {
        container.innerHTML = '<p class="empty-state">No tasks for today</p>';
        return;
    }

    container.innerHTML = todayTasks.map(task => `
        <div class="task-item">
            <div class="task-info">
                <h4>${task.title}</h4>
                <p>${task.description || 'No description'}</p>
            </div>
            <span class="meta-tag priority-${task.priority}">${task.priority}</span>
        </div>
    `).join('');
}
