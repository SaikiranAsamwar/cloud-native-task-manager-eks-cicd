# Frontend Directory

This directory contains all frontend assets for the Python DevOps Task Manager application.

## Directory Structure

```
frontend/
├── css/
│   └── style.css          # Main stylesheet with light/dark theme support
├── js/
│   ├── analytics.js       # Analytics page functionality
│   ├── app.js            # Core application utilities
│   ├── auth.js           # Authentication logic
│   ├── calendar.js       # Calendar view functionality
│   ├── dashboard.js      # Dashboard page functionality
│   ├── notifications.js  # Notifications page functionality
│   ├── profile.js        # Profile page functionality
│   ├── reports.js        # Reports generation
│   ├── settings.js       # Settings page functionality
│   ├── tasks.js          # Tasks management functionality
│   ├── theme.js          # Theme switcher (light/dark mode)
│   └── users.js          # Users management functionality
├── templates/
│   ├── analytics.html    # Analytics dashboard
│   ├── calendar.html     # Calendar view
│   ├── dashboard.html    # Main dashboard
│   ├── index.html        # Landing page
│   ├── login.html        # Login page
│   ├── notifications.html # Notifications feed
│   ├── profile.html      # User profile
│   ├── register.html     # Registration page
│   ├── reports.html      # Reports generation
│   ├── settings.html     # Application settings
│   ├── tasks.html        # Tasks management
│   └── users.html        # Users management
└── README.md            # This file

## Features

### Theme System
- **Dark Mode**: Black/grey color scheme with cyan accents
- **Light Mode**: White/blue color scheme with orange accents
- Persistent theme selection using localStorage
- Smooth transitions between themes
- Professional theme toggle button with animations

### Responsive Design
- Mobile-first approach
- Breakpoints at 768px and 1024px
- Adaptive layouts for all screen sizes

### Animations
- Professional navbar animations
- Theme toggle animations (ripple, pulse, rotating border)
- Smooth page transitions
- Card hover effects
- Form interactions

## Static File Serving

All static files are served by Flask from this directory:
- CSS: `/static/css/style.css`
- JavaScript: `/static/js/*.js`
- Templates are rendered from `templates/` folder

## Development

The frontend is separated from the backend for better organization:
- Frontend files: `a:\Resume-Projects\python-devops\frontend\`
- Backend files: `a:\Resume-Projects\python-devops\backend\`

Flask is configured to serve templates and static files from this directory.
