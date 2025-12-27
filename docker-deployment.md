# 🐳 Docker Deployment Guide - Task Manager Application

## 📋 Table of Contents
- [Overview](#overview)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Detailed Setup](#detailed-setup)
- [Configuration](#configuration)
- [Container Details](#container-details)
- [Networking](#networking)
- [Data Persistence](#data-persistence)
- [Health Checks](#health-checks)
- [Production Deployment](#production-deployment)
- [Monitoring and Logs](#monitoring-and-logs)
- [Troubleshooting](#troubleshooting)
- [Maintenance](#maintenance)

---

## 🎯 Overview

This project uses Docker and Docker Compose to containerize a full-stack task management application with the following components:

- **Frontend**: Nginx serving static HTML/CSS/JS files
- **Backend**: Flask REST API application
- **Database**: PostgreSQL 15

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Docker Network                     │
│                (taskmanager-network)                 │
│                                                      │
│  ┌──────────────┐    ┌──────────────┐    ┌────────┐│
│  │   Frontend   │───▶│   Backend    │───▶│Postgres││
│  │   (Nginx)    │    │   (Flask)    │    │  DB    ││
│  │   Port 80    │    │  Port 8888   │    │Port5432││
│  └──────────────┘    └──────────────┘    └────────┘│
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

## 📦 Prerequisites

### Required Software
- **Docker**: Version 20.10 or higher
- **Docker Compose**: Version 2.0 or higher

### System Requirements
- **RAM**: Minimum 2GB, Recommended 4GB
- **Disk Space**: At least 2GB free space
- **OS**: Windows 10/11, macOS 10.14+, or Linux (Ubuntu 18.04+, CentOS 7+)

### Verify Installation
```bash
# Check Docker version
docker --version

# Check Docker Compose version
docker-compose --version

# Verify Docker is running
docker ps
```

---

## 🚀 Quick Start

### 1. Clone and Navigate
```bash
cd Python-DevOps
```

### 2. Environment Setup
```bash
# Copy environment template
copy .env.example .env

# Edit .env file with your configurations
notepad .env  # On Windows
# or
nano .env     # On Linux/Mac
```

### 3. Build and Start
```bash
# Build and start all containers
docker-compose up -d --build

# View logs
docker-compose logs -f
```

### 4. Access Application
- **Frontend**: http://localhost
- **Backend API**: http://localhost:8888
- **Database**: localhost:5432

### 5. Stop Application
```bash
# Stop containers
docker-compose down

# Stop and remove volumes (⚠️ deletes data)
docker-compose down -v
```

---

## 🔧 Detailed Setup

### Directory Structure
```
Python-DevOps/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── models.py
│   │   └── routes.py
│   ├── config.py
│   ├── run.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .dockerignore
├── frontend/
│   ├── templates/
│   ├── css/
│   ├── js/
│   ├── nginx.conf
│   ├── Dockerfile
│   └── .dockerignore
├── docker-compose.yml
├── .env.example
└── docker-deployment.md
```

### Building Individual Containers

#### Backend Only
```bash
cd backend
docker build -t taskmanager-backend:latest .
docker run -d -p 8888:8888 --name backend taskmanager-backend:latest
```

#### Frontend Only
```bash
cd frontend
docker build -t taskmanager-frontend:latest .
docker run -d -p 80:80 --name frontend taskmanager-frontend:latest
```

#### Database Only
```bash
docker run -d \
  --name postgres \
  -e POSTGRES_USER=taskmanager \
  -e POSTGRES_PASSWORD=taskmanager123 \
  -e POSTGRES_DB=taskmanager_db \
  -p 5432:5432 \
  -v postgres_data:/var/lib/postgresql/data \
  postgres:15-alpine
```

---

## ⚙️ Configuration

### Environment Variables

#### Backend (.env)
```env
FLASK_ENV=production                    # development | production | testing
SECRET_KEY=your-secret-key-here         # Change in production!
DATABASE_URL=postgresql://user:pass@postgres:5432/db
DEBUG=False
```

#### Database
```env
POSTGRES_USER=taskmanager
POSTGRES_PASSWORD=taskmanager123        # Change in production!
POSTGRES_DB=taskmanager_db
PGDATA=/var/lib/postgresql/data/pgdata
```

### Docker Compose Configuration

#### Service Scaling
```bash
# Scale backend to 3 instances
docker-compose up -d --scale backend=3
```

#### Custom Ports
Edit `docker-compose.yml`:
```yaml
services:
  frontend:
    ports:
      - "8080:80"  # Access on port 8080 instead of 80
  backend:
    ports:
      - "9000:8888"  # Access on port 9000
```

---

## 📦 Container Details

### Frontend Container
- **Base Image**: `nginx:alpine`
- **Size**: ~50MB
- **Port**: 80
- **Purpose**: Serves static files and proxies API requests
- **Configuration**: Custom nginx.conf with routing and proxy rules

**Key Features**:
- Gzip compression enabled
- Security headers configured
- API proxy to backend
- Health check endpoint
- Static file caching (1 year)

### Backend Container
- **Base Image**: `python:3.11-slim`
- **Size**: ~400MB
- **Port**: 8888
- **Purpose**: Flask REST API server
- **Server**: Gunicorn with 4 workers

**Key Features**:
- Production-ready with Gunicorn
- PostgreSQL database support
- SQLite fallback option
- CORS enabled
- Health check endpoint at `/api/health`

### Database Container
- **Base Image**: `postgres:15-alpine`
- **Size**: ~230MB
- **Port**: 5432
- **Purpose**: Persistent data storage

**Key Features**:
- Alpine Linux based (lightweight)
- Automated health checks
- Persistent volume storage
- Configurable credentials

---

## 🌐 Networking

### Network Configuration
```yaml
networks:
  taskmanager-network:
    driver: bridge
```

### Internal Communication
- Containers communicate using service names
- Frontend → Backend: `http://backend:8888`
- Backend → Database: `postgresql://postgres:5432`

### External Access
| Service | Internal Port | External Port | URL |
|---------|--------------|---------------|-----|
| Frontend | 80 | 80 | http://localhost |
| Backend | 8888 | 8888 | http://localhost:8888 |
| Database | 5432 | 5432 | localhost:5432 |

### Network Inspection
```bash
# List networks
docker network ls

# Inspect network
docker network inspect python-devops_taskmanager-network

# View container IPs
docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' <container_name>
```

---

## 💾 Data Persistence

### Volumes

#### PostgreSQL Data
```yaml
volumes:
  postgres_data:
    driver: local
```
- **Location**: `/var/lib/postgresql/data`
- **Purpose**: Database files persistence
- **Backup**: Required for production

#### Backend Instance
```yaml
volumes:
  backend_instance:
    driver: local
```
- **Location**: `/app/instance`
- **Purpose**: SQLite database (if used) and session data

### Volume Management

#### List Volumes
```bash
docker volume ls
```

#### Inspect Volume
```bash
docker volume inspect python-devops_postgres_data
```

#### Backup Database
```bash
# Create backup
docker exec taskmanager-postgres pg_dump -U taskmanager taskmanager_db > backup.sql

# Restore backup
docker exec -i taskmanager-postgres psql -U taskmanager taskmanager_db < backup.sql
```

#### Remove Volumes
```bash
# ⚠️ Warning: This deletes all data!
docker-compose down -v
```

---

## 🏥 Health Checks

### Frontend Health Check
```yaml
healthcheck:
  test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 5s
```

### Backend Health Check
```yaml
healthcheck:
  test: ["CMD", "python", "-c", "import requests; requests.get('http://localhost:8888/api/health', timeout=5)"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

### Database Health Check
```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U taskmanager"]
  interval: 10s
  timeout: 5s
  retries: 5
```

### Check Health Status
```bash
# View health status
docker-compose ps

# Detailed health info
docker inspect --format='{{json .State.Health}}' taskmanager-backend | jq
```

---

## 🚀 Production Deployment

### Pre-Production Checklist

- [ ] Change `SECRET_KEY` to a strong random value
- [ ] Update database credentials
- [ ] Set `FLASK_ENV=production`
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall rules
- [ ] Set up monitoring and logging
- [ ] Implement backup strategy
- [ ] Configure resource limits
- [ ] Review security headers
- [ ] Set up CI/CD pipeline

### Security Best Practices

#### 1. Update Secrets
```env
# Generate strong secret key
SECRET_KEY=$(python -c 'import secrets; print(secrets.token_hex(32))')
POSTGRES_PASSWORD=$(openssl rand -base64 32)
```

#### 2. Use Docker Secrets (Swarm Mode)
```yaml
secrets:
  db_password:
    external: true
  secret_key:
    external: true
```

#### 3. Resource Limits
```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

#### 4. HTTPS Configuration
Add SSL certificates and update nginx.conf:
```nginx
server {
    listen 443 ssl http2;
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
}
```

### Production docker-compose.yml Example
```yaml
version: '3.8'

services:
  backend:
    image: your-registry/taskmanager-backend:v1.0
    environment:
      - FLASK_ENV=production
      - SECRET_KEY=${SECRET_KEY}
      - DATABASE_URL=${DATABASE_URL}
    deploy:
      replicas: 3
      restart_policy:
        condition: on-failure
        max_attempts: 3
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
```

---

## 📊 Monitoring and Logs

### View Logs

#### All Services
```bash
docker-compose logs -f
```

#### Specific Service
```bash
# Backend logs
docker-compose logs -f backend

# Frontend logs
docker-compose logs -f frontend

# Database logs
docker-compose logs -f postgres
```

#### Last N Lines
```bash
# Last 100 lines
docker-compose logs --tail=100 backend
```

#### Filter by Time
```bash
# Since 1 hour ago
docker-compose logs --since 1h backend
```

### Container Statistics
```bash
# Real-time stats
docker stats

# Specific container
docker stats taskmanager-backend
```

### Log Files Location
- **Frontend**: `/var/log/nginx/access.log`, `/var/log/nginx/error.log`
- **Backend**: stdout/stderr captured by Docker
- **Database**: `/var/lib/postgresql/data/log/`

### Export Logs
```bash
# Export to file
docker-compose logs backend > backend-logs.txt

# With timestamps
docker-compose logs -t backend > backend-logs-timestamped.txt
```

---

## 🔍 Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Windows - Find process using port 80
netstat -ano | findstr :80

# Kill process (replace PID)
taskkill /PID <PID> /F

# Linux/Mac - Find and kill
lsof -ti:80 | xargs kill -9
```

#### 2. Database Connection Failed
```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# View database logs
docker-compose logs postgres

# Test connection
docker exec -it taskmanager-postgres psql -U taskmanager -d taskmanager_db
```

#### 3. Container Won't Start
```bash
# View container logs
docker logs taskmanager-backend

# Inspect container
docker inspect taskmanager-backend

# Start in debug mode
docker-compose up backend
```

#### 4. Permission Denied
```bash
# Fix volume permissions (Linux)
sudo chown -R $USER:$USER ./backend/instance
```

#### 5. Out of Disk Space
```bash
# Clean up Docker
docker system prune -a --volumes

# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune
```

### Debug Commands

#### Enter Container Shell
```bash
# Backend container
docker exec -it taskmanager-backend /bin/bash

# Frontend container
docker exec -it taskmanager-frontend /bin/sh

# Database container
docker exec -it taskmanager-postgres /bin/bash
```

#### Check Environment Variables
```bash
docker exec taskmanager-backend env
```

#### Test API Endpoint
```bash
# From host
curl http://localhost:8888/api/health

# From inside backend container
docker exec taskmanager-backend curl http://localhost:8888/api/health
```

#### Network Connectivity
```bash
# Test backend from frontend
docker exec taskmanager-frontend wget -qO- http://backend:8888/api/health
```

---

## 🛠️ Maintenance

### Regular Tasks

#### Update Images
```bash
# Pull latest images
docker-compose pull

# Rebuild and restart
docker-compose up -d --build
```

#### Cleanup
```bash
# Remove stopped containers
docker container prune

# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Remove unused networks
docker network prune

# Complete cleanup (⚠️ Be careful!)
docker system prune -a --volumes
```

#### Database Maintenance
```bash
# Vacuum database
docker exec taskmanager-postgres psql -U taskmanager -d taskmanager_db -c "VACUUM ANALYZE;"

# Check database size
docker exec taskmanager-postgres psql -U taskmanager -d taskmanager_db -c "SELECT pg_size_pretty(pg_database_size('taskmanager_db'));"
```

### Backup Strategy

#### Automated Backup Script
```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups"

mkdir -p $BACKUP_DIR

# Backup database
docker exec taskmanager-postgres pg_dump -U taskmanager taskmanager_db > "$BACKUP_DIR/db_backup_$DATE.sql"

# Compress backup
gzip "$BACKUP_DIR/db_backup_$DATE.sql"

# Keep only last 7 days
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completed: db_backup_$DATE.sql.gz"
```

#### Schedule with Cron (Linux/Mac)
```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /path/to/backup.sh >> /var/log/backup.log 2>&1
```

### Update Strategy

#### Zero-Downtime Update
```bash
# 1. Build new images
docker-compose build

# 2. Scale up with new version
docker-compose up -d --scale backend=4

# 3. Remove old containers
docker-compose up -d --scale backend=2

# 4. Cleanup
docker image prune
```

---

## 📝 Additional Commands

### Docker Compose Commands
```bash
# Start services
docker-compose up -d

# Stop services
docker-compose stop

# Restart services
docker-compose restart

# Pause services
docker-compose pause

# Unpause services
docker-compose unpause

# View configuration
docker-compose config

# Validate configuration
docker-compose config --quiet

# List containers
docker-compose ps

# Top processes
docker-compose top
```

### Container Management
```bash
# Restart specific service
docker-compose restart backend

# Stop specific service
docker-compose stop frontend

# Remove specific service
docker-compose rm -f postgres

# Execute command in container
docker-compose exec backend python --version

# Run one-off command
docker-compose run --rm backend python -c "print('Hello')"
```

---

## 🔗 Useful Links

- **Docker Documentation**: https://docs.docker.com/
- **Docker Compose Documentation**: https://docs.docker.com/compose/
- **Flask Documentation**: https://flask.palletsprojects.com/
- **Nginx Documentation**: https://nginx.org/en/docs/
- **PostgreSQL Documentation**: https://www.postgresql.org/docs/

---

## 📞 Support

For issues and questions:
1. Check logs: `docker-compose logs -f`
2. Review this documentation
3. Check Docker status: `docker ps -a`
4. Verify network connectivity: `docker network inspect`

---

## 📄 License

This deployment configuration is part of the Task Manager application project.

---

**Last Updated**: December 28, 2025  
**Version**: 1.0.0  
**Author**: DevOps Team
