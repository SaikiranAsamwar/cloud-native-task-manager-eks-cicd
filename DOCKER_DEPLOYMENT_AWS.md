# 🐳 Docker Deployment on AWS EC2 (Amazon Linux 2023)

This guide provides step-by-step instructions to deploy the **Dockerized full-stack Python-DevOps application** using Docker and Docker Compose on an AWS EC2 instance running Amazon Linux 2023.

## 📌 Tech Stack

- **Frontend**: Static UI served via Node.js `http-server`
- **Backend**: Python (Flask)
- **Database**: PostgreSQL 15
- **Containerization**: Docker & Docker Compose
- **Cloud**: AWS EC2 (Amazon Linux 2023)

## 📁 Project Structure

```text
Python-DevOps/
│
├── docker-compose.yml
├── DOCKER_DEPLOYMENT_AWS.md
├── backend/
│   ├── Dockerfile
│   ├── config.py
│   ├── run.py
│   ├── requirements.txt
│   ├── utils.py
│   └── app/
│       ├── __init__.py
│       ├── models.py
│       └── routes.py
└── frontend/
    ├── Dockerfile
    ├── templates/
    │   └── *.html
    ├── css/
    │   └── style.css
    └── js/
        └── *.js
```

## 📌 Table of Contents

- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#prerequisites)
- [Quick Start (5 Steps)](#-quick-start-5-steps)
- [EC2 Instance Setup](#ec2-instance-setup)
- [Installing Docker and Docker Compose](#installing-docker-and-docker-compose)
- [Deployment Steps](#deployment-steps)
- [Accessing the Application](#accessing-the-application)
- [Common Commands](#-common-commands)
- [Environment Configuration](#environment-configuration)
- [Architecture Explanation](#-architecture-explanation)
- [Monitoring and Logs](#monitoring-and-logs)
- [Troubleshooting](#troubleshooting)
- [Security Considerations](#security-considerations)
- [Cleanup](#cleanup)
- [Additional Resources](#additional-resources)

## Prerequisites

- AWS Account with appropriate permissions to create EC2 instances
- Basic knowledge of AWS EC2, security groups, and SSH
- Access to SSH key pair for your EC2 instance
- Application source code available (GitHub repository or S3 bucket)

## 🚀 Quick Start (5 Steps)

If you already have an EC2 instance with Docker installed, deployment is simple:

### 1️⃣ Update System & Install Git

```bash
sudo yum update -y
sudo yum install git -y
```

### 2️⃣ Clone Repository

```bash
git clone https://github.com/SaikiranAsamwar/EC2-Python-Docker.git
cd EC2-Python-Docker
```

### 3️⃣ Start & Enable Docker

```bash
sudo systemctl start docker
sudo systemctl enable docker
```

### 4️⃣ Install Docker Compose

```bash
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
-o /usr/local/bin/docker-compose

sudo chmod +x /usr/local/bin/docker-compose
docker-compose --version
```

### 5️⃣ Build & Run Application

```bash
sudo docker-compose up -d --build
sudo docker ps
```

✅ **Done!** Access the application at:
- **Frontend**: http://<EC2_PUBLIC_IP>:3000
- **Backend**: http://<EC2_PUBLIC_IP>:5000

> Ensure EC2 Security Group allows inbound traffic on **ports 3000, 5000, and 5432**.

---

## EC2 Instance Setup

### 1. Launch an EC2 Instance

1. Navigate to **AWS Management Console** → **EC2** → **Instances**
2. Click **Launch Instances**
3. Choose **Amazon Linux 2023 AMI** (free tier eligible)
4. Select instance type: **t3.micro** (free tier) or **t3.small** for better performance
5. Configure security group with the following inbound rules:
   ```
   - SSH (Port 22): From your IP
   - HTTP (Port 80): From 0.0.0.0/0
   - HTTPS (Port 443): From 0.0.0.0/0
   - Custom TCP (Port 5000): From 0.0.0.0/0 (Backend)
   - Custom TCP (Port 3000): From 0.0.0.0/0 (Frontend)
   ```
6. Configure storage: **20 GB** minimum (gp3 recommended)
7. Review and **Launch** the instance
8. Select or create a key pair and download the `.pem` file

### 2. Connect to Your Instance

```bash
# Set permissions on your key pair
chmod 400 your-key-pair.pem

# Connect via SSH
ssh -i your-key-pair.pem ec2-user@your-instance-public-ip
```

### 3. Update System Packages

```bash
sudo yum update -y
sudo yum upgrade -y
```

## Installing Docker and Docker Compose

### 1. Install Docker

```bash
# Install Docker
sudo yum install docker -y

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Add ec2-user to docker group (to avoid sudo requirement)
sudo usermod -a -G docker ec2-user
```

**Log out and log back in** for group changes to take effect, or use:
```bash
newgrp docker
```

### 2. Install Docker Compose

```bash
# Download Docker Compose (latest version)
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Make it executable
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker-compose --version
```

### 3. Verify Docker Installation

```bash
# Check Docker version
docker --version

# Test Docker (without sudo)
docker run hello-world
```

## Deployment Steps

### 1. Clone or Transfer Application Code

#### Option A: Clone from GitHub
```bash
# Install Git
sudo yum install git -y

# Clone your repository
git clone https://github.com/your-username/Python-DevOps.git
cd Python-DevOps
```

#### Option B: Transfer via SCP
```bash
# From your local machine
scp -i your-key-pair.pem -r ./Python-DevOps ec2-user@your-instance-public-ip:/home/ec2-user/
```

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```bash
cat > .env << EOF
# Flask Configuration
FLASK_ENV=production
SECRET_KEY=$(openssl rand -hex 32)

# Database Configuration
DATABASE_URL=postgresql://devops_user:devops_password@db:5432/devops_db
POSTGRES_USER=devops_user
POSTGRES_PASSWORD=devops_password
POSTGRES_DB=devops_db

# Application Ports
BACKEND_PORT=5000
FRONTEND_PORT=3000
DATABASE_PORT=5432
EOF
```

**Security Note:** In production, use strong passwords and AWS Secrets Manager for sensitive data.

### 3. Build and Start Services

```bash
# Navigate to project directory
cd Python-DevOps

# Build Docker images
docker-compose build

# Start services in detached mode
docker-compose up -d

# Verify services are running
docker-compose ps
```

### 4. Verify Deployment

```bash
# Check container logs
docker-compose logs -f

# List running containers
docker ps

# Test backend connectivity
curl http://localhost:5000

# Test frontend connectivity
curl http://localhost:3000
```

Once deployed, access your application using your EC2 instance's public IP:

| Service | URL |
|---------|-----|
| Frontend | http://your-instance-public-ip:3000 |
| Backend API | http://your-instance-public-ip:5000 |
| Database | postgresql://your-instance-ip:5432 |

To find your public IP:
```bash
# From EC2 instance
curl http://169.254.169.254/latest/meta-data/public-ipv4

# Or from AWS Console: EC2 → Instances → Your Instance
```

---

## 🔁 Common Docker Compose Commands

```bash
# Build images and start containers
docker-compose up -d --build

# Stop services
docker-compose down

# Restart services
docker-compose restart

# View logs
docker-compose logs -f

# Check running containers
docker-compose ps

# Execute command in container
docker-compose exec backend python run.py

# Rebuild without starting
docker-compose build --no-cache
```

---

## 🧠 Architecture Explanation

The application uses **Docker Compose** to orchestrate **three main containers**:

1. **Frontend Container** (Node.js)
   - Serves static files via `http-server`
   - Listens on port 3000
   - Contains HTML, CSS, and JavaScript assets

2. **Backend Container** (Python Flask)
   - RESTful API server
   - Listens on port 5000
   - Connects to PostgreSQL database

3. **Database Container** (PostgreSQL 15)
   - Persistent data storage
   - Listens on port 5432
   - Uses Docker volumes for persistence

### Container Communication

- Containers communicate over a **user-defined bridge network** (`devops_network`)
- Allows inter-container communication using service names (e.g., `backend:5000`)
- Persistent data stored using **Docker volumes** (`db_data`)
- Environment variables passed through `docker-compose.yml`

---

### Modify Docker Compose Settings

Edit `docker-compose.yml` to adjust:

```yaml
services:
  backend:
    environment:
      FLASK_ENV: production  # or 'development'
    ports:
      - "5000:5000"  # Change port if needed
    
  frontend:
    ports:
      - "3000:3000"  # Change port if needed
```

### Database Configuration

The application uses PostgreSQL. Default credentials are in `docker-compose.yml`:
- **User:** devops_user
- **Password:** devops_password
- **Database:** devops_db
- **Port:** 5432

**For production:** Change these in the `.env` file and `docker-compose.yml`.

## Monitoring and Logs

### View Container Logs

```bash
# View all service logs
docker-compose logs

# View specific service logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs db

# Follow logs in real-time
docker-compose logs -f

# View logs with timestamps
docker-compose logs --timestamps
```

### Monitor Container Resources

```bash
# Real-time resource usage
docker stats

# Inspect a container
docker inspect devops-backend
docker inspect devops-frontend
docker inspect devops-db
```

### Check Service Health

```bash
# Check if services are healthy
docker-compose ps

# Test database connectivity
docker-compose exec db pg_isready -U devops_user

# Test backend
docker-compose exec backend curl http://localhost:5000
```

## Troubleshooting

### 1. Docker Daemon Not Running

```bash
# Start Docker service
sudo systemctl start docker

# Enable on startup
sudo systemctl enable docker

# Check status
sudo systemctl status docker
```

### 2. Permission Denied Errors

```bash
# Add user to docker group
sudo usermod -a -G docker $USER

# Log out and back in, or use
newgrp docker
```

### 3. Port Already in Use

```bash
# Find process using port (e.g., 5000)
sudo lsof -i :5000

# Stop the process or change port in docker-compose.yml
sudo kill -9 <PID>
```

### 4. Database Connection Failed

```bash
# Check database health
docker-compose exec db pg_isready -U devops_user

# Restart database
docker-compose restart db

# View database logs
docker-compose logs db
```

### 5. Images Won't Build

```bash
# Clean up old images and containers
docker-compose down -v

# Rebuild with no cache
docker-compose build --no-cache

# Start again
docker-compose up -d
```

### 6. Out of Disk Space

```bash
# Check disk usage
df -h

# Remove unused Docker resources
docker system prune -a

# Remove dangling volumes
docker volume prune
```

### 7. Cannot Connect to Application

```bash
# Check security group rules in AWS Console
# Verify ports are exposed: 5000 (backend), 3000 (frontend), 5432 (database)

# Test from instance
curl http://localhost:5000
curl http://localhost:3000

# Check if services are running
docker-compose ps
```

## Security Considerations

### Production Deployment Best Practices

1. **Use Secrets Management**
   ```bash
   # Avoid hardcoding credentials in docker-compose.yml
   # Use AWS Secrets Manager or .env files (not in version control)
   ```

2. **Environment Variables**
   - Never commit `.env` files to GitHub
   - Use AWS Secrets Manager for production credentials
   - Store sensitive data outside the repository

3. **Image Tags**
   - Always use **explicit image tags** (avoid `latest`)
   - Tag images with version numbers (e.g., `python:3.11`, `postgres:15`)

4. **Enable HTTPS**
   ```bash
   # Install Nginx reverse proxy with SSL
   sudo yum install nginx -y
   
   # Use Let's Encrypt for free SSL certificates
   sudo yum install certbot python3-certbot-nginx -y
   certbot certonly --nginx -d your-domain.com
   ```

5. **Update Security Group Rules**
   - Restrict SSH access to your IP only
   - Remove unnecessary open ports
   - Use security group descriptions

6. **Set Strong Database Passwords**
   ```bash
   # Generate strong password
   openssl rand -base64 32
   ```

7. **Enable Docker Content Trust**
   ```bash
   export DOCKER_CONTENT_TRUST=1
   ```

8. **Backup Database Regularly**
   ```bash
   # Create backup
   docker-compose exec db pg_dump -U devops_user devops_db > backup.sql
   
   # Restore from backup
   docker-compose exec -T db psql -U devops_user devops_db < backup.sql
   ```

9. **Monitor and Audit Logs**
   ```bash
   # Check CloudWatch logs in AWS Console
   # Set up CloudWatch agent for deeper monitoring
   ```

10. **Frontend Server**
    - Replace Node `http-server` with **Nginx** for production-grade frontend
    - Nginx provides better performance, caching, and security features

---

## ⚠️ Notes & Best Practices

- Always use **explicit image tags** (avoid `latest`)
- Do not commit `.env` files to GitHub
- Use **AWS Secrets Manager** for production credentials
- Replace Node `http-server` with **Nginx** for production-grade frontend
- Test thoroughly before deploying to production
- Keep Docker and dependencies up to date
- Use health checks for monitoring container status
- Implement proper error handling and logging

---

## Cleanup

### Stop Services

```bash
# Stop all services
docker-compose stop

# Remove stopped containers
docker-compose rm -f

# Stop and remove everything (including volumes)
docker-compose down -v
```

### Remove EC2 Instance

1. Navigate to **AWS EC2 Console**
2. Select your instance
3. Click **Instance State** → **Terminate**
4. Confirm termination

### Clean Up Unused Docker Resources

```bash
# Remove dangling images
docker image prune -f

# Remove dangling volumes
docker volume prune -f

# Remove everything unused
docker system prune -a --volumes
```

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [AWS EC2 Documentation](https://docs.aws.amazon.com/ec2/)
- [Amazon Linux 2023 Documentation](https://docs.aws.amazon.com/linux/)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [PostgreSQL Docker Image](https://hub.docker.com/_/postgres)
- [Project Repository](https://github.com/SaikiranAsamwar/EC2-Python-Docker.git)

---

## 👨‍💻 Author & Support

**Saikiran Rajesh Asamwar**  
AWS DevOps Engineer  

- GitHub: https://github.com/SaikiranAsamwar  
- Docker Hub: https://hub.docker.com/u/saikiranasamwar4  

For additional help:
1. Check application logs: `docker-compose logs`
2. Review Docker documentation: [docs.docker.com](https://docs.docker.com)
3. Check AWS CloudWatch for system logs
4. Consult project-specific README files in backend/ and frontend/ directories

---

## ✅ Deployment Outcome

✔ Clean Docker-based deployment  
✔ Single-command setup (5 steps)  
✔ Cloud-ready architecture  
✔ Fully containerized application  
✔ Scalable and maintainable solution  
✔ Portfolio & interview ready  

---

## Version Information

- **Docker:** Latest stable version
- **Docker Compose:** v2.x or later
- **Amazon Linux:** 2023
- **Python:** 3.11
- **Node.js:** 18 (frontend)
- **PostgreSQL:** 15
- **Flask:** Latest LTS version
