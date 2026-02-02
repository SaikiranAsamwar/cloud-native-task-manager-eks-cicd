# Task Manager - Python DevOps End-to-End Project

A comprehensive **Task Manager web application** with a **Flask (Python) backend**, **PostgreSQL database**, and **Nginx-served frontend**, deployed using **Docker**, **Docker Compose**, and **Kubernetes (EKS-ready)**. Includes **Jenkins CI/CD automation**, **SonarQube code quality**, and **Prometheus + Grafana monitoring**.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Prerequisites](#prerequisites)
4. [Installation and Setup](#installation-and-setup)
5. [Running the Application](#running-the-application)
6. [Docker and Docker Compose](#docker-and-docker-compose)
7. [Kubernetes Deployment](#kubernetes-deployment)
8. [Jenkins CI/CD Pipeline](#jenkins-cicd-pipeline)
9. [SonarQube Code Quality](#sonarqube-code-quality)
10. [Monitoring with Prometheus and Grafana](#monitoring-with-prometheus-and-grafana)
11. [Troubleshooting](#troubleshooting)
12. [Project Structure](#project-structure)

---

## Project Overview

The Task Manager is an end-to-end DevOps project that demonstrates:

- **Frontend**: Static HTML/CSS/JavaScript served by Nginx
- **Backend**: Flask REST API with SQLAlchemy ORM
- **Database**: PostgreSQL for persistent data storage
- **Containerization**: Docker images for all services
- **Orchestration**: Kubernetes manifests for production deployment
- **Automation**: Jenkins pipeline for CI/CD
- **Quality**: SonarQube for code analysis
- **Monitoring**: Prometheus for metrics, Grafana for dashboards

---

## Architecture

### High-Level System Design

```
┌─────────────┐          ┌──────────────┐          ┌────────────────┐
│   Nginx     │ ◄────►   │    Flask     │ ◄────►   │  PostgreSQL    │
│  (Frontend) │          │   (Backend)  │          │   (Database)   │
│   Port 80   │          │  Port 8888   │          │   Port 5432    │
└─────────────┘          └──────────────┘          └────────────────┘
```

### Component Details

| Component | Technology | Port | Purpose |
|-----------|-----------|------|---------|
| Frontend | Nginx + HTML/CSS/JS | 80 | Static file serving |
| Backend | Flask + SQLAlchemy | 8888 | REST API server |
| Database | PostgreSQL 15 | 5432 | Data persistence |
| Message Queue | Docker Compose | - | Multi-container orchestration |
| Kubernetes | EKS-Ready | - | Production orchestration |

---

## Prerequisites

### System Requirements

- **OS**: Windows 10/11, macOS, or Linux
- **RAM**: Minimum 8GB (16GB recommended)
- **Disk Space**: 10GB free space
- **Internet**: Required for downloading dependencies

### Required Software

Before installation, ensure you have the following tools installed:

#### 1. **Python 3.10 or Higher**
   - Download from: https://www.python.org/downloads/
   - **Windows**: Choose "Add Python to PATH" during installation
   - **Verify installation**:
     ```bash
     python --version
     # Output should be: Python 3.10.0 or higher
     ```

#### 2. **Git**
   - Download from: https://git-scm.com/downloads
   - **Verify installation**:
     ```bash
     git --version
     # Output should be: git version 2.x.x
     ```

#### 3. **Docker Desktop**
   - Download from: https://www.docker.com/products/docker-desktop
   - Install and start Docker Desktop
   - **Verify installation**:
     ```bash
     docker --version
     # Output should be: Docker version 20.x.x
     docker run hello-world
     # Should display "Hello from Docker!" message
     ```

#### 4. **Docker Compose**
   - Usually comes with Docker Desktop
   - **Verify installation**:
     ```bash
     docker-compose --version
     # Output should be: docker-compose version 2.x.x
     ```

#### 5. **Kubernetes (kubectl)** [Optional for Kubernetes deployment]
   - Download from: https://kubernetes.io/docs/tasks/tools/
   - **Verify installation**:
     ```bash
     kubectl version --client
     ```

#### 6. **PostgreSQL Client Tools** [Optional for database management]
   - Download from: https://www.postgresql.org/download/
   - Or use command-line tools from PostgreSQL installation

---

## Installation and Setup

### Step 1: Clone the Repository

```bash
# Navigate to desired directory
cd path/to/your/directory

# Clone the repository
git clone https://github.com/yourusername/Python-DevOps.git

# Enter the project directory
cd Python-DevOps

# Verify the directory structure
ls -la  # On Linux/macOS
dir     # On Windows
```

### Step 2: Create Python Virtual Environment

Virtual environments isolate project dependencies from system Python.

#### On Windows:
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
venv\Scripts\activate

# After activation, your terminal should show: (venv)
```

#### On macOS/Linux:
```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# After activation, your terminal should show: (venv)
```

### Step 3: Install Backend Dependencies

```bash
# Ensure you're in the project root directory and venv is activated
cd backend

# Install all required Python packages
pip install --upgrade pip

# Install from requirements.txt
pip install -r requirements.txt

# Verify installation
pip list

# Expected packages:
# Flask==3.0.0
# Flask-SQLAlchemy==3.1.1
# Flask-CORS==4.0.0
# SQLAlchemy==2.0.25
# psycopg2-binary==2.9.9
# gunicorn==21.2.0
# ... and others
```

### Step 4: Set Up Environment Variables

Create a `.env` file in the backend directory:

```bash
# Navigate to backend directory
cd backend

# Create .env file (Windows)
type nul > .env

# OR create .env file (macOS/Linux)
touch .env

# Edit the .env file with the following content:
```

**Content for `.env` file:**
```
FLASK_ENV=development
FLASK_DEBUG=1
SECRET_KEY=7a8f9d2e4c6b1a3e5d7f9b2c4e6a8d0f1c3e5a7b9d1f3e5c7a9b1d3f5e7a9c1b
DATABASE_URL=postgresql://taskmanager:P@ssw0rd!2026SecureDB@localhost:5432/taskmanager_db
```

**Security Note**: In production, never use the same secret key and database password. Generate strong, unique values.

### Step 5: Database Setup

#### Option A: Using PostgreSQL Locally (Full Setup)

1. **Install PostgreSQL**:
   - Download from: https://www.postgresql.org/download/
   - Follow installation wizard
   - Remember the password you set for the `postgres` user

2. **Start PostgreSQL service**:
   - **Windows**: PostgreSQL starts automatically after installation
   - **macOS**: Use `brew services start postgresql`
   - **Linux**: Use `sudo systemctl start postgresql`

3. **Create database and user**:
   ```bash
   # Open PostgreSQL command prompt (psql)
   psql -U postgres
   
   # Inside psql, execute:
   CREATE USER taskmanager WITH PASSWORD 'P@ssw0rd!2026SecureDB';
   CREATE DATABASE taskmanager_db OWNER taskmanager;
   
   # Verify creation
   \l  # Lists all databases
   \du # Lists all users
   
   # Exit psql
   \q
   ```

4. **Test connection**:
   ```bash
   # Test the connection from your terminal
   psql -U taskmanager -d taskmanager_db -h localhost
   
   # If successful, you'll see: taskmanager_db=>
   # Exit with: \q
   ```

#### Option B: Using Docker PostgreSQL (Recommended for Development)

```bash
# Start PostgreSQL in Docker
docker run --name taskmanager-postgres \
  -e POSTGRES_USER=taskmanager \
  -e POSTGRES_PASSWORD=P@ssw0rd!2026SecureDB \
  -e POSTGRES_DB=taskmanager_db \
  -p 5432:5432 \
  -d postgres:15-alpine

# Verify PostgreSQL is running
docker ps

# Test connection (install psql if needed)
psql -U taskmanager -d taskmanager_db -h localhost -W
# Password: P@ssw0rd!2026SecureDB
```

---

## Running the Application

### Method 1: Local Development (Traditional Python)

This method runs the application directly on your machine without Docker.

#### Step 1: Start PostgreSQL
```bash
# If using Docker PostgreSQL (from previous setup)
docker start taskmanager-postgres

# If using local PostgreSQL, ensure the service is running
```

#### Step 2: Navigate to Backend Directory
```bash
# From project root
cd backend

# Ensure virtual environment is activated (you should see (venv) in terminal)
# If not activated:
# Windows: venv\Scripts\activate
# macOS/Linux: source ../venv/bin/activate
```

#### Step 3: Initialize Database
```bash
# Run the Flask application to create tables
python run.py

# You should see output like:
# WARNING in app.config from werkzeug: 'DATABASE_URL' is not set!
# Running on http://0.0.0.0:8888

# Press Ctrl+C to stop
```

#### Step 4: Run Backend Server
```bash
# Start Flask development server
python run.py

# Expected output:
# * Serving Flask app 'app'
# * Debug mode: on
# * WARNING: This is a development server. Do not use it in production deployment.
# * Running on http://127.0.0.1:8888
```

#### Step 5: Start Frontend (In a New Terminal)
```bash
# Open new terminal window/tab

# Navigate to frontend directory
cd frontend

# Start a simple HTTP server (Python built-in)
python -m http.server 8000

# Expected output:
# Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/)

# OR use Python's SimpleHTTPServer:
python -m SimpleHTTPServer 8000
```

#### Step 6: Access the Application
```
Open browser and navigate to: http://localhost:8000
```

### Method 2: Using Docker Compose (Recommended)

Docker Compose runs the entire application stack in containers with a single command.

#### Step 1: Ensure Docker is Running
```bash
# Verify Docker is installed and running
docker --version
docker ps  # Should show no errors
```

#### Step 2: Build and Start Services
```bash
# Navigate to project root (if not already there)
cd Python-DevOps

# Build images and start containers
docker-compose up -d

# Expected output:
# Building backend
# Building frontend
# Creating taskmanager-postgres
# Creating taskmanager-backend
# Creating taskmanager-frontend

# Verify all services are running
docker-compose ps

# Output should show:
# NAME              STATUS            PORTS
# taskmanager-postgres    Up 2 minutes   5432/tcp
# taskmanager-backend     Up 2 minutes   0.0.0.0:8888->8888/tcp
# taskmanager-frontend    Up 2 minutes   0.0.0.0:80->80/tcp
```

#### Step 3: Access the Application
```
Frontend: http://localhost
Backend API: http://localhost:8888
```

#### Step 4: View Logs
```bash
# View logs from all services
docker-compose logs -f

# View logs from specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

#### Step 5: Stop Services
```bash
# Stop all containers
docker-compose stop

# Remove all containers
docker-compose down

# Remove containers and volumes (careful: loses data)
docker-compose down -v
```

---

## Docker and Docker Compose

### Understanding Docker

Docker packages your application with all dependencies into a **container** that runs the same everywhere.

### Docker Commands

#### Build Images
```bash
# Build all images defined in docker-compose.yml
docker-compose build

# Build specific image
docker-compose build backend

# Build with no cache (fresh build)
docker-compose build --no-cache
```

#### Run Containers
```bash
# Start services defined in docker-compose.yml
docker-compose up

# Start in background (detached mode)
docker-compose up -d

# Rebuild and start
docker-compose up --build
```

#### Manage Containers
```bash
# List running containers
docker ps

# List all containers (including stopped)
docker ps -a

# Stop specific container
docker stop container_name

# Remove specific container
docker rm container_name

# View container logs
docker logs container_name

# Execute command inside container
docker exec -it container_name /bin/bash
```

#### Clean Up
```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Remove everything (images, containers, networks, volumes)
docker system prune -a
```

### Docker Compose Configuration Explained

The `docker-compose.yml` file defines the entire stack:

```yaml
version: '3.8'  # Docker Compose version

services:
  postgres:
    image: postgres:15-alpine
    # PostgreSQL database service
    # Runs on port 5432
    # Creates volume for persistent data

  backend:
    build: ./backend
    # Builds image from backend/Dockerfile
    # Runs Flask application on port 8888
    # Depends on postgres service

  frontend:
    build: ./frontend
    # Builds image from frontend/Dockerfile
    # Runs Nginx on port 80
    # Depends on backend service

volumes:
  postgres_data:
    # Named volume for PostgreSQL data persistence
```

---

## Kubernetes Deployment

Kubernetes is used for production-grade deployments with auto-scaling, self-healing, and rolling updates.

### Prerequisites for Kubernetes

1. **kubectl installed** (Kubernetes command-line tool)
   ```bash
   kubectl version --client
   ```

2. **Kubernetes cluster access**
   - Local cluster: Docker Desktop, Minikube, or Kind
   - Cloud cluster: AWS EKS, Azure AKS, Google GKE

3. **kubectl configured** to access your cluster
   ```bash
   # Verify cluster connection
   kubectl cluster-info
   ```

### Step 1: Set Up Kubernetes Namespace

The namespace provides isolation for your application.

```bash
# Create namespace
kubectl apply -f k8s/namespace.yaml

# Verify namespace created
kubectl get namespaces

# Expected output should include: taskmanager
```

### Step 2: Create Secrets for Database Credentials

Secrets securely store sensitive data.

```bash
# Create secrets
kubectl apply -f k8s/secrets.yaml

# Verify secrets created
kubectl get secrets -n taskmanager

# Expected output:
# NAME              TYPE     DATA   AGE
# db-credentials    Opaque   3      2m
```

### Step 3: Deploy PostgreSQL Database

```bash
# Create persistent volume claim for database
kubectl apply -f k8s/postgres-pvc.yaml

# Deploy PostgreSQL
kubectl apply -f k8s/postgres-deployment.yaml

# Verify PostgreSQL is running
kubectl get pods -n taskmanager
kubectl get svc -n taskmanager

# Check PostgreSQL pod status
kubectl get pod -n taskmanager -l app=postgres

# View PostgreSQL logs
kubectl logs -n taskmanager -l app=postgres
```

### Step 4: Deploy Backend Application

```bash
# Deploy Flask backend
kubectl apply -f k8s/backend-deployment.yaml

# Verify backend is running
kubectl get pods -n taskmanager
kubectl get svc -n taskmanager

# Check backend pod status
kubectl get pod -n taskmanager -l app=backend

# View backend logs
kubectl logs -n taskmanager -l app=backend

# Stream logs in real-time
kubectl logs -n taskmanager -l app=backend -f
```

### Step 5: Deploy Frontend Application

```bash
# Deploy Nginx frontend
kubectl apply -f k8s/frontend-deployment.yaml

# Verify frontend is running
kubectl get pods -n taskmanager
kubectl get svc -n taskmanager

# Check frontend pod status
kubectl get pod -n taskmanager -l app=frontend

# View frontend logs
kubectl logs -n taskmanager -l app=frontend
```

### Step 6: Set Up Ingress (External Access)

Ingress provides external access to your services.

```bash
# Deploy Ingress controller
kubectl apply -f k8s/ingress.yaml

# Verify Ingress created
kubectl get ingress -n taskmanager

# Get external IP/hostname
kubectl get svc -n taskmanager

# Once external IP is assigned, access:
# Frontend: http://<external-ip>
# Backend API: http://<external-ip>/api
```

### Useful Kubernetes Commands

```bash
# View all resources in namespace
kubectl get all -n taskmanager

# Describe a specific pod (for debugging)
kubectl describe pod <pod-name> -n taskmanager

# Get pod details
kubectl get pods -n taskmanager -o wide

# Port forward to access service locally
kubectl port-forward svc/backend 8888:8888 -n taskmanager
kubectl port-forward svc/frontend 80:80 -n taskmanager

# Scale deployment (increase replicas)
kubectl scale deployment backend --replicas=3 -n taskmanager

# Update deployment image
kubectl set image deployment/backend backend=image:new-tag -n taskmanager

# Check deployment rollout status
kubectl rollout status deployment/backend -n taskmanager

# Rollback to previous version
kubectl rollout undo deployment/backend -n taskmanager

# Delete entire namespace (removes all resources)
kubectl delete namespace taskmanager
```

---

## Jenkins CI/CD Pipeline

Jenkins automates the build, test, and deployment process.

### Jenkins Pipeline Stages

The `Jenkinsfile` defines the following stages:

1. **Git Checkout**: Pull latest code from repository
2. **SonarQube Analysis**: Code quality and security scan
3. **Docker Build**: Build backend and frontend images
4. **Push to Registry**: Push images to Docker registry
5. **Deploy to Kubernetes**: Roll out new versions

### Setup Jenkins

#### Option A: Jenkins in Docker

```bash
# Run Jenkins in Docker
docker run -d \
  --name jenkins \
  -p 8080:8080 \
  -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  jenkins/jenkins:latest

# Get initial admin password
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword

# Access Jenkins
# Open browser: http://localhost:8080
# Paste the password from above
```

#### Option B: Jenkins on Local Machine

1. Download Jenkins from: https://www.jenkins.io/download/
2. Follow installation instructions for your OS
3. Access Jenkins at: http://localhost:8080

### Configure Jenkins Pipeline

1. **Create New Job**
   - Click "New Item"
   - Enter job name: "TaskManager-Pipeline"
   - Select "Pipeline"
   - Click "OK"

2. **Configure Pipeline**
   - Under "Pipeline" section
   - Select "Pipeline script from SCM"
   - Set SCM to "Git"
   - Enter repository URL: `https://github.com/yourusername/Python-DevOps.git`
   - Set script path to: `Jenkinsfile`
   - Click "Save"

3. **Run Pipeline**
   - Click "Build Now"
   - Monitor progress in "Console Output"

### Jenkinsfile Explained

The `Jenkinsfile` contains the pipeline definition:

```groovy
pipeline {
    agent any
    
    stages {
        stage('Checkout') {
            steps {
                git 'repository-url'
            }
        }
        
        stage('SonarQube Analysis') {
            steps {
                // Code quality scan
            }
        }
        
        stage('Build Docker Images') {
            steps {
                // Build backend and frontend
            }
        }
        
        stage('Push Images') {
            steps {
                // Push to Docker registry
            }
        }
        
        stage('Deploy') {
            steps {
                // Deploy to Kubernetes
            }
        }
    }
}
```

---

## SonarQube Code Quality

SonarQube analyzes code for bugs, vulnerabilities, and code smells.

### Setup SonarQube

#### Option A: Docker

```bash
# Run SonarQube in Docker
docker run -d \
  --name sonarqube \
  -p 9000:9000 \
  sonarqube:latest

# Wait for startup (2-3 minutes)
# Access: http://localhost:9000
# Default credentials: admin / admin
```

#### Option B: Docker Compose

```bash
# Add to docker-compose.yml and run
docker-compose up -d sonarqube

# Access: http://localhost:9000
```

### Run SonarQube Analysis

#### Using Jenkins (Automated)
- Jenkins pipeline automatically runs SonarQube analysis
- Results appear in the Quality Gate

#### Manual Analysis

```bash
# Install SonarQube Scanner
# Download from: https://docs.sonarqube.org/latest/analysis/scan/sonarscanner/

# Run analysis
sonar-scanner \
  -Dsonar.projectKey=TaskManager \
  -Dsonar.sources=. \
  -Dsonar.host.url=http://localhost:9000 \
  -Dsonar.login=admin \
  -Dsonar.password=admin
```

### Quality Gate

A Quality Gate blocks deployments if code quality issues are found:

- **Coverage**: Code test coverage threshold
- **Bugs**: Maximum allowed bugs
- **Vulnerabilities**: Maximum allowed security issues
- **Code Smells**: Maximum allowed code smells

If the Quality Gate fails, the Jenkins pipeline stops, preventing bad code deployment.

---

## Monitoring with Prometheus and Grafana

### Prometheus

Prometheus collects metrics from your applications.

#### Deploy Prometheus

```bash
# Deploy Prometheus to Kubernetes
kubectl apply -f monitoring/prometheus-rbac.yaml
kubectl apply -f monitoring/prometheus-deployment.yaml

# Verify Prometheus is running
kubectl get pods -n taskmanager

# Access Prometheus (port forward)
kubectl port-forward svc/prometheus 9090:9090 -n taskmanager

# Open browser: http://localhost:9090
```

#### Prometheus Configuration

The `prometheus-config.yaml` defines:
- **Scrape targets**: Which services to monitor
- **Metrics**: What to collect
- **Intervals**: How often to collect

### Grafana

Grafana creates dashboards and visualizes Prometheus metrics.

#### Deploy Grafana

```bash
# Deploy Grafana to Kubernetes
kubectl apply -f monitoring/grafana-deployment.yaml

# Get Grafana admin password
kubectl get secret -n taskmanager grafana -o jsonpath="{.data.admin-password}" | base64 --decode

# Access Grafana (port forward)
kubectl port-forward svc/grafana 3000:3000 -n taskmanager

# Open browser: http://localhost:3000
# Login: admin / <password from above>
```

#### Add Prometheus as Data Source

1. Go to Configuration → Data Sources
2. Click "Add data source"
3. Select "Prometheus"
4. Set URL to: `http://prometheus:9090`
5. Click "Save & Test"

#### Import Dashboards

1. Go to Dashboards → Import
2. Enter dashboard ID from: https://grafana.com/grafana/dashboards/
3. Select Prometheus as data source
4. Click "Import"

### Metrics to Monitor

**Application Metrics:**
- Request latency
- Error rate
- Request count
- Database connection pool
- Memory usage
- CPU usage

**Infrastructure Metrics:**
- Pod CPU usage
- Pod memory usage
- Network I/O
- Disk I/O

---

## Troubleshooting

### Common Issues and Solutions

#### 1. Docker Not Running
```bash
# Error: Cannot connect to Docker daemon

# Solution: Start Docker Desktop
# macOS/Windows: Open Docker Desktop application
# Linux: sudo systemctl start docker
```

#### 2. Port Already in Use
```bash
# Error: Address already in use

# Find process using port
# Windows: netstat -ano | findstr :8888
# macOS/Linux: lsof -i :8888

# Kill process
# Windows: taskkill /PID <pid> /F
# macOS/Linux: kill -9 <pid>
```

#### 3. Database Connection Error
```bash
# Error: could not connect to server

# Solution: Verify PostgreSQL is running
docker ps  # Check if postgres container is running
docker-compose logs postgres  # View PostgreSQL logs

# Verify credentials in .env file
cat backend/.env
```

#### 4. Kubernetes Pod Stuck in Pending
```bash
# Check pod status
kubectl describe pod <pod-name> -n taskmanager

# Common causes:
# - Insufficient resources
# - Image pull error
# - Volume mount failure

# View node resources
kubectl top nodes
kubectl describe node <node-name>
```

#### 5. Jenkins Build Fails
```bash
# Check Jenkins logs
docker logs jenkins  # If using Docker

# Check console output
# Open Jenkins web UI → Job → Build Number → Console Output

# Common causes:
# - Git clone failure (check credentials)
# - Docker build failure (check Dockerfile)
# - SonarQube quality gate failure (check code quality)
```

#### 6. Application Won't Start
```bash
# View application logs
docker-compose logs <service>
kubectl logs <pod-name> -n taskmanager

# Common causes:
# - Missing environment variables
# - Database connection issues
# - Port conflicts
# - Missing dependencies
```

### Debug Commands

```bash
# Docker debugging
docker inspect <container-name>  # View container details
docker stats  # View resource usage
docker exec -it <container> /bin/bash  # Execute shell in container

# Kubernetes debugging
kubectl describe pod <pod-name> -n taskmanager  # Detailed pod info
kubectl logs <pod-name> -n taskmanager  # Pod logs
kubectl port-forward pod/<pod-name> 8888:8888 -n taskmanager  # Local access
kubectl get events -n taskmanager  # System events

# Network debugging
curl http://localhost:8888  # Test backend
curl http://localhost  # Test frontend
ping container-name  # Test DNS resolution (within container)
```

---

## Project Structure

```
Python-DevOps/
├── backend/
│   ├── app/
│   │   ├── __init__.py          # Flask app initialization
│   │   ├── models.py            # Database models
│   │   ├── routes.py            # API endpoints
│   │   └── __pycache__/
│   ├── instance/                # Flask instance folder
│   ├── static/                  # Static files
│   ├── templates/               # HTML templates
│   ├── config.py               # Configuration (Dev/Prod/Test)
│   ├── run.py                  # Application entry point
│   ├── utils.py                # Utility functions
│   ├── requirements.txt        # Python dependencies
│   └── Dockerfile              # Docker image definition
│
├── frontend/
│   ├── css/
│   │   └── style.css           # Stylesheet
│   ├── js/
│   │   ├── app.js              # Main application logic
│   │   ├── auth.js             # Authentication handling
│   │   ├── dashboard.js        # Dashboard functionality
│   │   ├── tasks.js            # Task management
│   │   └── ...other modules
│   ├── templates/
│   │   ├── index.html          # Home page
│   │   ├── login.html          # Login page
│   │   ├── dashboard.html      # Dashboard page
│   │   └── ...other pages
│   ├── nginx.conf              # Nginx configuration
│   └── Dockerfile              # Docker image definition
│
├── k8s/
│   ├── namespace.yaml          # Kubernetes namespace
│   ├── secrets.yaml            # Database credentials
│   ├── postgres-pvc.yaml       # Persistent volume for database
│   ├── postgres-deployment.yaml # PostgreSQL deployment
│   ├── backend-deployment.yaml  # Flask backend deployment
│   ├── frontend-deployment.yaml # Nginx frontend deployment
│   └── ingress.yaml            # Ingress configuration
│
├── monitoring/
│   ├── prometheus-rbac.yaml    # Prometheus RBAC
│   ├── prometheus-deployment.yaml # Prometheus deployment
│   ├── prometheus-config.yaml  # Prometheus configuration
│   ├── grafana-deployment.yaml # Grafana deployment
│   ├── grafana-dashboard.json  # Grafana dashboard
│   └── grafana-datasource.yaml # Grafana data source config
│
├── jenkins/
│   ├── jenkins-rbac.yaml       # Jenkins RBAC
│   └── jenkins-deployment.yaml # Jenkins deployment
│
├── docker-compose.yml          # Multi-container setup
├── Jenkinsfile                 # CI/CD pipeline definition
├── README.md                   # This file
├── INTERVIEW-PROJECT-EXPLANATION.md  # Detailed project explanation
├── VALIDATION-REPORT.md        # Project validation results
└── PROJECT-QUESTION-BANK.md    # Interview questions

```

---

## Quick Start Guide

For experienced users, here's the quickest way to get started:

```bash
# 1. Clone and enter project
git clone <repo-url>
cd Python-DevOps

# 2. Start with Docker Compose
docker-compose up -d

# 3. Access services
# Frontend: http://localhost
# Backend: http://localhost:8888

# 4. Stop when done
docker-compose down
```

---

## Best Practices

### Development
- Always use virtual environment for Python development
- Set `FLASK_ENV=development` for debugging
- Use `.env` files for sensitive data (never commit to Git)
- Run SonarQube before committing code

### Testing
- Test locally with Docker Compose before Kubernetes
- Use separate databases for testing (in-memory SQLite)
- Monitor logs for errors and warnings

### Production
- Set `FLASK_ENV=production`
- Use strong, unique SECRET_KEY and database passwords
- Enable HTTPS/SSL for all communications
- Configure resource limits in Kubernetes
- Set up monitoring and alerting
- Regular backups of PostgreSQL data

### Security
- Never hardcode credentials in code
- Use Kubernetes Secrets for sensitive data
- Implement authentication and authorization
- Use SonarQube Quality Gate to prevent vulnerable code
- Regularly update dependencies for security patches

---

## Additional Resources

- **Flask Documentation**: https://flask.palletsprojects.com/
- **SQLAlchemy Documentation**: https://docs.sqlalchemy.org/
- **Docker Documentation**: https://docs.docker.com/
- **Kubernetes Documentation**: https://kubernetes.io/docs/
- **Jenkins Documentation**: https://www.jenkins.io/doc/
- **Prometheus Documentation**: https://prometheus.io/docs/
- **Grafana Documentation**: https://grafana.com/docs/

---

## Support and Contributions

For issues, questions, or contributions:

1. Check the **Troubleshooting** section above
2. Review the **INTERVIEW-PROJECT-EXPLANATION.md** for architecture details
3. Open an issue on the repository
4. Submit a pull request with improvements

---

## License

This project is provided as-is for educational and portfolio purposes.

---

## Changelog

### Version 1.0.0 (February 2026)
- Initial project setup with Flask backend
- PostgreSQL database integration
- Nginx frontend with static files
- Docker and Docker Compose support
- Kubernetes deployment manifests
- Jenkins CI/CD pipeline
- SonarQube integration
- Prometheus and Grafana monitoring
- Comprehensive documentation

---

**Last Updated**: February 1, 2026  
**Project Status**: Production Ready  
**Maintainer**: Your Name / Team
