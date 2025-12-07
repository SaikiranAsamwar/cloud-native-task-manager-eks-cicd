/**
 * Authentication Check - Include in all protected pages
 */

function checkAuthentication() {
    const isAuthenticated = sessionStorage.getItem('isAuthenticated');
    
    if (isAuthenticated !== 'true') {
        // Redirect to login page
        window.location.href = '/login';
        return false;
    }
    
    return true;
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        sessionStorage.clear();
        window.location.href = '/login';
    }
}

function getUsername() {
    return sessionStorage.getItem('username') || 'User';
}

// Check authentication on page load
checkAuthentication();
