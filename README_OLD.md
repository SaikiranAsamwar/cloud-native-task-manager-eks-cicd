# 🐳 Task Manager - Full Stack Docker Deployment

This repository demonstrates a **production-ready, Dockerized full-stack task management application** deployed using **Docker and Docker Compose**. Supports local development and AWS EC2 (Amazon Linux) deployment. Perfect for DevOps engineers, cloud architects, and portfolio builders.

**Key Features:**
- ✅ Complete Docker containerization with multi-service orchestration
- ✅ Production-grade Nginx frontend server
- ✅ Flask backend REST API with PostgreSQL
- ✅ Docker Compose for single-command deployment
- ✅ Database persistence with Docker volumes
- ✅ Health checks and service dependencies
- ✅ Ready for AWS EC2 deployment (see [DOCKER_DEPLOYMENT_AWS.md](DOCKER_DEPLOYMENT_AWS.md))
- ✅ Pre-built Docker images on Docker Hub

---

## 📌 Tech Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| **Frontend** | Nginx (Alpine) | Production-ready reverse proxy |
| **Backend** | Python Flask | 3.11-slim |
| **Database** | PostgreSQL | 15-alpine |
| **Containerization** | Docker & Docker Compose | Latest |
| **Cloud** | AWS EC2 (Optional) | Amazon Linux 2023 |
| **Networking** | Docker Bridge Network | User-defined (devops_network) |
| **Container Registry** | Docker Hub | saikiranasamwar4/* |

---

## 📁 Project Structure

```text
Python-DevOps/
│
├── docker-compose.yml              # Multi-container orchestration
├── DOCKER_DEPLOYMENT_AWS.md        # Complete AWS EC2 deployment guide
├── README.md                        # This file
│
├── backend/                         # Flask REST API Service
│   ├── Dockerfile                   # Python 3.11-slim container
│   ├── requirements.txt             # Flask, psycopg2, etc.
│   ├── config.py                    # Database & Flask config
│   ├── run.py                       # Application entry point
│   ├── utils.py                     # Helper functions
│   └── app/
│       ├── __init__.py              # Flask app initialization
│       ├── models.py                # SQLAlchemy models
│       └── routes.py                # REST API endpoints
│
└── frontend/                        # Nginx Static Server
    ├── Dockerfile                   # Multi-stage build with Nginx
    ├── nginx.conf                   # Main Nginx configuration
    ├── default.conf                 # Server block configuration
    ├── templates/                   # HTML pages
    │   ├── index.html               # Landing page
    │   ├── dashboard.html           # Main dashboard
    │   ├── login.html               # Authentication
    │   ├── register.html            # User registration
    │   ├── tasks.html               # Task management
    │   ├── calendar.html            # Calendar view
    │   ├── analytics.html           # Analytics dashboard
    │   ├── users.html               # User management
    │   └── *.html                   # Additional pages
    ├── css/
    │   └── style.css                # Application styling
    └── js/
        ├── app.js                   # Main application logic
        ├── auth.js                  # Authentication handling
        ├── dashboard.js             # Dashboard functionality
        ├── tasks.js                 # Task operations
        ├── calendar.js              # Calendar integration
        ├── analytics.js             # Analytics charts
        └── *.js                     # Other feature modules
```

---

## � Prerequisites

### Local Development
- **Docker Desktop** (Windows/Mac) or **Docker Engine** (Linux)
- **Docker Compose** (v2.0+)
- Git installed
- Terminal/PowerShell access
- 4GB RAM minimum
- 10GB free disk space

### AWS EC2 Deployment (Optional)
- AWS account with EC2 permissions
- EC2 instance running **Amazon Linux 2023** (t3.micro or larger)
- Security group with inbound rules:
  - SSH (Port 22) - from your IP
  - HTTP (Port 80) - from 0.0.0.0/0
  - HTTPS (Port 443) - from 0.0.0.0/0
  - Custom TCP (Port 5000) - from 0.0.0.0/0 (Backend API)
  - Custom TCP (Port 5432) - *Restrict to VPC only* (Database)
- 20 GB EBS storage minimum
- SSH key pair downloaded

> 📘 For detailed EC2 deployment instructions, see [DOCKER_DEPLOYMENT_AWS.md](DOCKER_DEPLOYMENT_AWS.md)

---

## 🚀 Quick Start

### Option 1: Local Development (Windows/Mac/Linux)

```bash
# 1. Clone the repository
git clone https://github.com/SaikiranAsamwar/Python-DevOps.git
cd Python-DevOps

# 2. Start all services with Docker Compose
docker-compose up -d --build

# 3. Verify containers are running
docker-compose ps
```

✅ **Done!** Access the application at:
- **Frontend (Nginx)**: http://localhost
- **Backend API**: http://localhost:5000
- **Database**: localhost:5432

### Option 2: AWS EC2 Deployment (Amazon Linux 2023)

```bash
# 1. Connect to EC2 instance
ssh -i your-key.pem ec2-user@<EC2_PUBLIC_IP>

# 2. Update system and install dependencies
sudo yum update -y && sudo yum install git docker -y

# 3. Start Docker
sudo systemctl start docker && sudo systemctl enable docker

# 4. Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 5. Clone and deploy
git clone https://github.com/SaikiranAsamwar/Python-DevOps.git
cd Python-DevOps
sudo docker-compose up -d --build
```

✅ **Live on EC2!** Access at:
- **Frontend**: http://<EC2_PUBLIC_IP>
- **Backend API**: http://<EC2_PUBLIC_IP>:5000

> 📘 **Need detailed EC2 setup?** See [DOCKER_DEPLOYMENT_AWS.md](DOCKER_DEPLOYMENT_AWS.md) for complete instructions

---

## � Detailed Deployment Steps

### Local Development Setup

#### 1️⃣ Install Prerequisites

**Windows:**
- Download and install [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Enable WSL2 backend
- Ensure Docker Compose is included (comes with Docker Desktop)

**Mac:**
- Download and install [Docker Desktop for Mac](https://www.docker.com/products/docker-desktop/)

**Linux:**
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

#### 2️⃣ Clone Repository

```bash
git clone https://github.com/SaikiranAsamwar/Python-DevOps.git
cd Python-DevOps
```

#### 3️⃣ Build and Start Services

```bash
# Build and start all containers in detached mode
docker-compose up -d --build

# View running containers
docker-compose ps

# View logs
docker-compose logs -f
```

#### 4️⃣ Verify Deployment

```bash
# Check container status
docker-compose ps

# Test backend API
curl http://localhost:5000

# Test frontend
curl http://localhost
```

### AWS EC2 Deployment

For complete EC2 deployment instructions including security group configuration, SSH access, and production best practices, see [DOCKER_DEPLOYMENT_AWS.md](DOCKER_DEPLOYMENT_AWS.md)

---

## 🗑️ Destroy Deployment

```bash
# Stop and remove containers
docker-compose down

# Remove containers, volumes, and images
docker-compose down -v --rmi all

# Remove orphaned containers
docker-compose down -v --rmi all --remove-orphans
```

---

## � Monitoring

```bash
# View logs
docker-compose logs -f

# Check container status
docker-compose ps

# View resource usage
docker stats
```

---

## 🌍 Environment Configuration

### Default Credentials

The application comes with default development credentials in `docker-compose.yml`:

```yaml
Database:
  User: devops_user
  Password: devops_password
  Database: devops_db
  Port: 5432
```

### For Production

⚠️ **Never use defaults in production!** Instead:

1. Create a `.env` file in project root:
   ```bash
   POSTGRES_USER=secure_username
   POSTGRES_PASSWORD=$(openssl rand -base64 32)
   POSTGRES_DB=production_db
   FLASK_ENV=production
   SECRET_KEY=$(openssl rand -hex 32)
   ```

2. Update `docker-compose.yml` to reference `.env`

3. **Do NOT commit `.env` to Git**

4. Use AWS Secrets Manager for sensitive data

---

## 🚨 Troubleshooting

### Issue: "Permission denied" when running docker commands

**Solution**: Add your user to docker group
```bash
sudo usermod -a -G docker $USER
newgrp docker
# Log out and back in
```

### Issue: Port already in use

**Solution**: Find and stop the conflicting process
```bash
# Find process using port 5000
sudo lsof -i :5000

# Kill the process
sudo kill -9 <PID>

# Or change port in docker-compose.yml
```

### Issue: Database connection failed

**Solution**: Restart the database container
```bash
sudo docker-compose restart db
sudo docker-compose logs db
```

### Issue: Frontend shows wrong page or 404

**Solution**: Nginx is configured to serve from `/usr/share/nginx/html`
```bash
# Check Nginx configuration
docker-compose exec frontend cat /etc/nginx/conf.d/default.conf

# Verify files are copied correctly
docker-compose exec frontend ls -la /usr/share/nginx/html/

# Rebuild frontend without cache
docker-compose build --no-cache frontend
docker-compose up -d frontend
```

### Issue: "Connection refused" on port 80

**Solution**: Check if Nginx container is running and port is available
```bash
# Check container status
docker-compose ps frontend

# View Nginx logs
docker-compose logs frontend

# Windows: Check if port 80 is in use
netstat -ano | findstr :80

# Linux/Mac: Check port usage
lsof -i :80
sudo lsof -i :80

# Kill process using port (Windows)
# Find PID from netstat, then: taskkill /PID <PID> /F

### Current Setup

This application uses **production-ready** components:
- ✅ **Nginx** as frontend server (not http-server)
- ✅ Multi-stage Docker builds for optimized images
- ✅ Alpine-based images for smaller footprint
- ✅ Health checks for service reliability
- ✅ Named volumes for data persistence
- ✅ User-defined bridge network for isolation

### Development vs Production

| Aspect | Current Setup | Production Recommendations |
|--------|---------------|---------------------------|
| Frontend Server | **Nginx (Alpine)** ✅ | Add SSL/HTTPS with Let's Encrypt |
| Image Tags | `latest` (dev) | Pin specific versions (e.g., `3.11.8`, `15.5`) |
| Database | Docker container | Migrate to AWS RDS or managed service |
| Credentials | Environment variables | AWS Secrets Manager or Parameter Store |
| Networking | All ports exposed (dev) | Restrict to necessary ports only |
| SSL/HTTPS | Not configured | **Required** - Use Certbot + Nginx |
| Logging | Docker logs | CloudWatch Logs, ELK Stack, or Datadog |
| Monitoring | Basic health checks | CloudWatch, Prometheus + Grafana |
| Backups | Manual | Automated with AWS Backup or cron jobs |

### Security Checklist

- ✅ Use `.env` files (not in Git) for sensitive data
- ✅ Always use explicit image versions
- ✅ Restrict database ports to internal network only
- ✅ Nginx reverse proxy with security headers
- ✅ Use strong passwords (generate with `openssl rand -base64 32`)
- ✅ Enable Docker Content Trust
- ✅ Backup database regularly
- ✅ Monitor container logs and CloudWatch
- ✅ Update base images regularly (Nginx, PostgreSQL)
- ✅ UsCommon Errors

### Error: Port already in use

```bash
# Windows: Find and kill process
netstat -ano | findstr :80
taskkill /PID <PID> /F

# Linux/Mac: Find and kill process
sudo lsof -i :80
sudo kill -9 <PID>
```

### Error: Database connection failed

```bash
# Restart database container
docker-compose restart db
docker-compose logs db
```

### Error: Permission denied (Docker commands)

```bash
# Linux: Add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

### Error: Out of disk space

```bash
# Clean up Docker resources
docker system prune -a --volumes
```

### Error: Container fails to start

```bash
# View container logs
docker-compose logs -f <service_name>

# Rebuild without cache
docker-compose build --no-cache
docker-compose up -d
sudo docker-compose logs --timestamps -f

# Last 100 lines
sudo docker-compose logs --tail=100
```

### Monitor Resource Usage

```bash
# Real-time container stats
docker stats

# Container details
docker inspect devops-backend
```

### Database Health

```bash
# Check PostgreSQL status
sudo docker-compose exec db pg_isready -U devops_user

# Connect to database
sudo docker-compose exec db psql -U devops_user -d devops_db

# List tables
sudo docker-compose exec db psql -U devops_user -d devops_db -c "\dt"
```

---

## ❓ FAQ

**Q: Can I run this on t3.micro (free tier)?**
A: Yes, but performance will be limited. t3.small or larger recommended.

**Q: How do I backup my database?**
A: `docker-compose exec db pg_dump -U devops_user devops_db > backup.sql`

**Q: Can I use this setup for production?**
A: With modifications: use Nginx for frontend, RDS for database, Secrets Manager for credentials, and enable HTTPS.

**Q: How do I update the application?**
A: Pull changes, rebuild, and restart: `git pull && docker-compose up -d --build`

**Q: Can I add more services?**
A: Yes, add new services to `docker-compose.yml` and rebuild.

**Q: What if I need to change ports?**
A: Edit `docker-compose.yml` and update the `ports:` section, then restart.

---
