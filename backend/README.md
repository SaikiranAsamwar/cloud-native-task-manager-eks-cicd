# Task Manager - Full Stack Python Application 📋

A complete full-stack web application built with Python, Flask, SQLite, and vanilla JavaScript. This project demonstrates modern web development practices with a RESTful API backend and a responsive frontend.

## 🎯 Features

- **User Management**: Create, read, update, and delete users
- **Task Management**: Create, manage, and track tasks with priority levels
- **Real-time Updates**: Instant UI updates after API operations
- **Responsive Design**: Beautiful UI that works on desktop and mobile devices
- **SQLite Database**: Lightweight, file-based database (no external database required)
- **RESTful API**: Clean, documented API endpoints
- **CORS Support**: Ready for separate frontend deployment

## 🏗️ Project Structure

```
python-devops/
├── backend/                         # Backend API and server
│   ├── app/
│   │   ├── __init__.py             # Flask app factory (configured for frontend separation)
│   │   ├── models.py               # Database models (User, Task)
│   │   └── routes.py               # API routes and page routes
│   ├── instance/
│   │   └── app.db                  # SQLite database (auto-created)
│   ├── venv/                       # Python virtual environment
│   ├── run.py                      # Entry point to run the app
│   ├── requirements.txt            # Python dependencies
│   ├── config.py                   # Configuration settings
│   ├── seed_data.py               # Database seeding script
│   └── utils.py                   # Utility functions
├── frontend/                       # Frontend assets (separated from backend)
│   ├── css/
│   │   └── style.css              # Main stylesheet (light/dark theme)
│   ├── js/
│   │   ├── analytics.js           # Analytics functionality
│   │   ├── app.js                 # Core utilities
│   │   ├── auth.js                # Authentication logic
│   │   ├── calendar.js            # Calendar view
│   │   ├── dashboard.js           # Dashboard functionality
│   │   ├── notifications.js       # Notifications
│   │   ├── profile.js             # Profile management
│   │   ├── reports.js             # Reports generation
│   │   ├── settings.js            # Settings page
│   │   ├── tasks.js               # Task management
│   │   ├── theme.js               # Theme switcher
│   │   └── users.js               # User management
│   └── templates/
│       ├── index.html             # Landing page
│       ├── login.html             # Login page
│       ├── register.html          # Registration page
│       ├── dashboard.html         # Main dashboard
│       ├── users.html             # Users management
│       ├── tasks.html             # Tasks management
│       ├── analytics.html         # Analytics dashboard
│       ├── reports.html           # Reports generation
│       ├── calendar.html          # Calendar view
│       ├── profile.html           # User profile
│       ├── notifications.html     # Notifications feed
│       └── settings.html          # Application settings
└── README.md                      # This file
```

## 🚀 Getting Started

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- A text editor or IDE

### Installation

1. **Clone or navigate to the project directory**:
   ```bash
   cd A:\Resume-Projects\python-devops\backend
   ```

2. **Create a virtual environment** (recommended):
   ```bash
   # On Windows PowerShell
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Create a `.env` file** (optional, for development):
   ```
   FLASK_ENV=development
   DATABASE_URL=sqlite:///app.db
   ```

5. **Run the application**:
   ```bash
   python run.py
   ```

6. **Open in browser**:
   - Navigate to `http://localhost:5000`
   - You should see the Task Manager interface

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Users Endpoints

#### Get All Users
```
GET /api/users
```
Response:
```json
[
  {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "full_name": "John Doe",
    "created_at": "2025-12-07T10:30:00",
    "updated_at": "2025-12-07T10:30:00"
  }
]
```

#### Get Specific User
```
GET /api/users/{user_id}
```

#### Create User
```
POST /api/users
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "full_name": "John Doe"
}
```

#### Update User
```
PUT /api/users/{user_id}
Content-Type: application/json

{
  "username": "new_username",
  "email": "newemail@example.com",
  "full_name": "New Name"
}
```

#### Delete User
```
DELETE /api/users/{user_id}
```

### Tasks Endpoints

#### Get All Tasks
```
GET /api/tasks
```

#### Get Tasks by User
```
GET /api/tasks?user_id={user_id}
```

#### Get Specific Task
```
GET /api/tasks/{task_id}
```

#### Create Task
```
POST /api/tasks
Content-Type: application/json

{
  "user_id": 1,
  "title": "Complete project",
  "description": "Finish the Python project",
  "priority": "high",
  "due_date": "2025-12-15T17:00:00"
}
```

#### Update Task
```
PUT /api/tasks/{task_id}
Content-Type: application/json

{
  "title": "Updated title",
  "completed": true,
  "priority": "medium"
}
```

#### Delete Task
```
DELETE /api/tasks/{task_id}
```

### Health Check
```
GET /api/health
```

## 🎨 Frontend Guide

### User Interface

1. **Users Tab**:
   - View all users
   - Add new users with username, email, and full name
   - Edit user details
   - Delete users

2. **Tasks Tab**:
   - View all tasks
   - Filter tasks by user
   - Add new tasks with title, description, priority, and due date
   - Mark tasks as complete/incomplete
   - Edit task details
   - Delete tasks

### Key Features

- **Toast Notifications**: Get instant feedback on all actions
- **Real-time Filtering**: Filter tasks by user instantly
- **Form Validation**: Required fields are validated before submission
- **Responsive Design**: Mobile-friendly interface

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    username VARCHAR(80) UNIQUE NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    full_name VARCHAR(120) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Tasks Table
```sql
CREATE TABLE tasks (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL FOREIGN KEY REFERENCES users(id),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE,
    priority VARCHAR(20) DEFAULT 'medium',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    due_date DATETIME
);
```

## 🛠️ Technology Stack

### Backend
- **Flask 3.0.0**: Lightweight Python web framework
- **Flask-SQLAlchemy 3.1.1**: ORM for database operations
- **Flask-CORS 4.0.0**: Cross-Origin Resource Sharing support
- **SQLAlchemy 2.0.23**: SQL toolkit and ORM
- **Werkzeug 3.0.1**: WSGI utility library

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Modern styling with flexbox and grid
- **Vanilla JavaScript**: No dependencies, pure JS

### Database
- **SQLite**: Lightweight, serverless database

## 💡 How It Works

### Backend Flow

1. **Flask App Initialization** (`app/__init__.py`):
   - Creates Flask app instance
   - Configures SQLAlchemy database
   - Sets up CORS
   - Registers blueprints (routes)

2. **Database Models** (`app/models.py`):
   - Defines User and Task models
   - Sets up relationships
   - Includes helper methods for serialization

3. **Routes and Business Logic** (`app/routes.py`):
   - Implements RESTful API endpoints
   - Handles CRUD operations
   - Manages database transactions
   - Implements error handling

### Frontend Flow

1. **HTML Structure** (`templates/index.html`):
   - Two-tab interface (Users and Tasks)
   - Forms for creating/filtering items
   - Dynamic lists for displaying items

2. **Styling** (`static/css/style.css`):
   - Beautiful gradient backgrounds
   - Responsive grid layouts
   - Smooth transitions and animations
   - Mobile-friendly breakpoints

3. **JavaScript Logic** (`static/js/app.js`):
   - Handles user interactions
   - Makes API calls to backend
   - Updates UI dynamically
   - Manages form submissions
   - Displays notifications

## 📝 Common Tasks

### Add a New User
1. Go to the Users tab
2. Fill in the form with username, email, and full name
3. Click "Create User"
4. See the user appear in the list below

### Create a Task
1. Go to the Tasks tab
2. Select a user from the dropdown
3. Enter task title and description
4. Set priority and due date (optional)
5. Click "Create Task"
6. Task appears in the list

### Filter Tasks by User
1. Go to the Tasks tab
2. Use the "Filter by User" dropdown
3. Select a user to see only their tasks
4. Select "All Users" to see all tasks

## 🐛 Troubleshooting

### Port Already in Use
If port 5000 is already in use:
```python
# In run.py, change the port:
app.run(host='0.0.0.0', port=5001, debug=debug)
```

### Database Issues
To reset the database:
```bash
# Delete the app.db file
rm app.db
# Or on Windows:
del app.db
# Then restart the app - it will create a new database
```

### Missing Dependencies
```bash
pip install -r requirements.txt --upgrade
```

## 🔒 Security Notes

This is a learning/demo project. For production use:

- Add authentication (JWT tokens)
- Validate and sanitize all inputs
- Use environment variables for sensitive data
- Add HTTPS/SSL certificates
- Implement rate limiting
- Add logging and monitoring
- Use a production WSGI server (Gunicorn, uWSGI)
- Add database backups
- Implement proper error handling

## 🚢 Deployment

### Using Gunicorn (Production)
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 "app:create_app()"
```

### Using Docker
Create a `Dockerfile`:
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:create_app()"]
```

## 📊 Next Steps & Learning

1. **Add Authentication**: Implement user login with passwords
2. **Add Categories**: Organize tasks by categories
3. **Add Comments**: Allow users to comment on tasks
4. **Add Search**: Implement search functionality
5. **Add Charts**: Visualize task completion statistics
6. **Add Email Notifications**: Send reminders for due tasks
7. **Separate Frontend**: Move frontend to React/Vue.js
8. **Add Testing**: Write unit and integration tests

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review API documentation
3. Check browser console for JavaScript errors
4. Check Flask server logs for backend errors

## 📄 License

This project is open source and available for educational purposes.

---

**Happy Coding! 🚀**

Built with ❤️ using Python, Flask, and JavaScript
