/**
 * Reports Page
 */

const API_URL = '/api';

document.addEventListener('DOMContentLoaded', () => {
    setupReportForm();
});

/**
 * Setup report form
 */
function setupReportForm() {
    const form = document.getElementById('reportForm');
    if (form) {
        form.addEventListener('submit', handleReportSubmit);
    }

    // Date range selector
    const dateRange = document.getElementById('dateRange');
    if (dateRange) {
        dateRange.addEventListener('change', handleDateRangeChange);
    }
}

/**
 * Handle report form submission
 */
async function handleReportSubmit(e) {
    e.preventDefault();

    const reportType = document.getElementById('reportType').value;
    const dateRange = document.getElementById('dateRange').value;
    const exportFormat = document.getElementById('exportFormat').value;

    showMessage('Generating report...', 'info');

    // Simulate report generation
    setTimeout(() => {
        showMessage(`${reportType} report generated successfully as ${exportFormat}`, 'success');
    }, 2000);
}

/**
 * Handle date range change
 */
function handleDateRangeChange(e) {
    const startDate = document.getElementById('startDate');
    const endDate = document.getElementById('endDate');
    const customRange = e.target.value === 'custom';

    startDate.disabled = !customRange;
    endDate.disabled = !customRange;
}

/**
 * Generate task report
 */
function generateTaskReport() {
    showMessage('Generating task report...', 'info');
    setTimeout(() => {
        showMessage('Task report generated successfully', 'success');
    }, 1500);
}

/**
 * Generate user report
 */
function generateUserReport() {
    showMessage('Generating user report...', 'info');
    setTimeout(() => {
        showMessage('User report generated successfully', 'success');
    }, 1500);
}

/**
 * Generate performance report
 */
function generatePerformanceReport() {
    showMessage('Generating performance report...', 'info');
    setTimeout(() => {
        showMessage('Performance report generated successfully', 'success');
    }, 1500);
}

/**
 * Export all data
 */
function exportAllData() {
    showMessage('Exporting all data...', 'info');
    setTimeout(() => {
        showMessage('Data exported successfully', 'success');
    }, 2000);
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
