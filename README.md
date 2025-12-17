# 🐳 Task Manager - Docker Deployment

Full-stack task management application with Flask backend, Nginx frontend, and PostgreSQL database.

**Stack:** Nginx + Flask + PostgreSQL | **Deployment:** Docker Compose

---

## 📌 Tech Stack

| Component | Technology |
|-----------|-----------|
| **Frontend** | Nginx (Alpine) |
| **Backend** | Python Flask 3.11 |
| **Database** | PostgreSQL 15 |
| **Container Registry** | Docker Hub (saikiranasamwar4/*) |

---

## 🚀 Deployment

### Local Deployment (Windows/Mac/Linux)

```bash
# Clone repository
git clone https://github.com/SaikiranAsamwar/Python-DevOps.git
cd Python-DevOps

# Start all services
docker-compose up -d --build

# Verify deployment
docker-compose ps
```

**Access:**
- Frontend: http://localhost
- Backend API: http://localhost:5000

### AWS EC2 Deployment (Amazon Linux 2023)

```bash
# Connect to EC2
ssh -i your-key.pem ec2-user@<EC2_PUBLIC_IP>

# Install Docker & Docker Compose
sudo yum update -y && sudo yum install git docker -y
sudo systemctl start docker && sudo systemctl enable docker
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Deploy application
git clone https://github.com/SaikiranAsamwar/Python-DevOps.git
cd Python-DevOps
sudo docker-compose up -d --build
```

**Access:**
- Frontend: http://\<EC2_PUBLIC_IP\>
- Backend API: http://\<EC2_PUBLIC_IP\>:5000

> **Note:** Ensure EC2 Security Group allows ports 22, 80, 443, 5000. See [DOCKER_DEPLOYMENT_AWS.md](DOCKER_DEPLOYMENT_AWS.md) for details.

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

## 📊 Monitoring

```bash
# View logs
docker-compose logs -f

# Check container status
docker-compose ps

# View resource usage
docker stats
```

---

## 🚨 Common Errors

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
```

---

## 👨‍💻 Author

**Saikiran Rajesh Asamwar**

- **GitHub**: https://github.com/SaikiranAsamwar
- **Docker Hub**: https://hub.docker.com/u/saikiranasamwar4

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [AWS EC2 Deployment Guide](DOCKER_DEPLOYMENT_AWS.md)

---

**Last Updated**: December 2025
