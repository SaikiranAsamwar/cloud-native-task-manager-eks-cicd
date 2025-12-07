/**
 * Profile Page
 */

const API_URL = '/api';

document.addEventListener('DOMContentLoaded', () => {
    loadProfileData();
    setupForms();
});

/**
 * Load profile data
 */
async function loadProfileData() {
    try {
        const username = sessionStorage.getItem('username');
        
        // Load user stats
        const tasksResponse = await fetch(`${API_URL}/tasks`);
        if (tasksResponse.ok) {
            const tasks = await tasksResponse.json();
            const userTasks = tasks.filter(t => t.user && t.user.username === username);
            
            const completed = userTasks.filter(t => t.completed).length;
            const pending = userTasks.filter(t => !t.completed).length;
            
            document.getElementById('profileCompletedTasks').textContent = completed;
            document.getElementById('profilePendingTasks').textContent = pending;
            document.getElementById('totalTasksCreated').textContent = userTasks.length;
            
            const completionRate = userTasks.length > 0 
                ? Math.round((completed / userTasks.length) * 100) 
                : 0;
            document.getElementById('completionRate').textContent = `${completionRate}%`;
        }

        // Mock data for other stats
        document.getElementById('achievementPoints').textContent = completed * 10;
        document.getElementById('daysActive').textContent = Math.floor(Math.random() * 30) + 1;
        
        // Load profile info
        document.getElementById('profileUsername').value = username || '';
        document.getElementById('profileFullName').value = sessionStorage.getItem('fullName') || '';
        document.getElementById('profileEmail').value = sessionStorage.getItem('email') || '';
        
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

/**
 * Setup forms
 */
function setupForms() {
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileUpdate);
    }

    const passwordForm = document.getElementById('passwordForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', handlePasswordChange);
    }
}

/**
 * Handle profile update
 */
async function handleProfileUpdate(e) {
    e.preventDefault();

    const fullName = document.getElementById('profileFullName').value;
    const email = document.getElementById('profileEmail').value;
    const bio = document.getElementById('profileBio').value;

    // Save to session storage
    sessionStorage.setItem('fullName', fullName);
    sessionStorage.setItem('email', email);
    sessionStorage.setItem('bio', bio);

    showMessage('Profile updated successfully', 'success');
}

/**
 * Handle password change
 */
async function handlePasswordChange(e) {
    e.preventDefault();

    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (newPassword !== confirmPassword) {
        showMessage('Passwords do not match', 'error');
        return;
    }

    if (newPassword.length < 6) {
        showMessage('Password must be at least 6 characters', 'error');
        return;
    }

    showMessage('Password changed successfully', 'success');
    
    // Clear form
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
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
