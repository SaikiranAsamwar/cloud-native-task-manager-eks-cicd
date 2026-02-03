# Task Manager - Python DevOps Project

A full-stack Flask application for task management with PostgreSQL backend, Nginx frontend, and containerized deployment on AWS EC2 with Ubuntu 24.04 LTS. Built with Docker, Kubernetes-ready, and complete CI/CD pipeline.

## 📋 Table of Contents

### SECTION A: INSTALLATION & CONFIGURATION
- [Architecture Overview](#architecture-overview)
- [Prerequisites](#prerequisites)
- [Step 1: EC2 Instance Setup](#step-1-ec2-instance-setup)
- [Step 2: Install Docker](#step-2-install-docker)
- [Step 3: Install Docker Compose](#step-3-install-docker-compose)
- [Step 4: Install Python](#step-4-install-python)
- [Step 5: Install AWS CLI](#step-5-install-aws-cli)
- [Step 6: Install kubectl](#step-6-install-kubectl)
- [Step 7: Install eksctl](#step-7-install-eksctl)
- [Step 8: Install Java](#step-8-install-java)
- [Step 9: Install PostgreSQL](#step-9-install-postgresql-for-sonarqube)
- [Step 10: Install & Configure Jenkins](#step-10-install--configure-jenkins)
- [Step 11: Install & Configure SonarQube](#step-11-install--configure-sonarqube)
- [Step 12: Install & Configure Prometheus](#step-12-install--configure-prometheus)
- [Step 13: Install & Configure Grafana](#step-13-install--configure-grafana)

### SECTION B: DEPLOYMENT
- [Step 14: Clone & Configure Application](#step-14-clone--configure-application)
- [Step 15: Docker Deployment](#step-15-docker-deployment)
- [Step 16: Kubernetes (EKS) Deployment](#step-16-kubernetes-eks-deployment)
- [Step 17: Setup CI/CD Pipeline](#step-17-setup-cicd-pipeline)
- [Step 18: Verify Monitoring](#step-18-verify-monitoring)

### SECTION C: REFERENCE
- [Environment Variables](#environment-variables)
- [Troubleshooting](#troubleshooting)
- [Quick Reference Commands](#quick-reference-commands)
- [Project Structure](#project-structure)

---

## Architecture Overview

```
AWS EC2 Instance (Ubuntu 24.04 LTS)
├── Backend (Flask + Python) - Port 8888
├── Frontend (HTML/CSS/JS + Nginx) - Port 80
├── Database (PostgreSQL) - Port 5432
├── Container Registry (DockerHub)
├── Orchestration (Amazon EKS)
├── CI/CD (Jenkins)
├── Code Quality (SonarQube)
└── Monitoring (Prometheus + Grafana)
```

---

## Prerequisites

### AWS Requirements
- AWS Account with IAM user
- Access to EC2, EKS, IAM, VPC services
- SSH key pair for EC2 access

### Local Requirements
- Git installed
- SSH client
- DockerHub account

---

# SECTION A: INSTALLATION & CONFIGURATION

---

## Step 1: EC2 Instance Setup

### 1.1 Launch EC2 Instance

**Instance Configuration:**
- **AMI:** Ubuntu Server 24.04 LTS
- **Instance Type:** t3.large (2 vCPU, 8 GB RAM minimum)
- **Storage:** 50 GB gp3
- **Security Group Ports:**
  - 22 (SSH)
  - 80 (Frontend)
  - 8888 (Backend)
  - 8080 (Jenkins)
  - 9000 (SonarQube)
  - 9090 (Prometheus)
  - 3000 (Grafana)

### 1.2 Connect to EC2

```bash
# Set permissions for your key
chmod 400 your-key.pem

# Connect via SSH
ssh -i your-key.pem ubuntu@your-ec2-public-ip
```

### 1.3 Initial System Update

```bash
sudo apt-get update && sudo apt-get upgrade -y
sudo apt-get install -y git wget curl unzip
```

---

## Step 2: Install Docker

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker
docker --version
```

---

## Step 3: Install Docker Compose

```bash
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
docker-compose --version
```

---

## Step 4: Install Python

```bash
sudo apt-get install -y python3 python3-pip python3-venv
python3 --version && pip3 --version
```

---

## Step 5: Install AWS CLI

```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o awscliv2.zip
unzip awscliv2.zip && sudo ./aws/install
aws --version
aws configure
```

---

## Step 6: Install kubectl

```bash
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo chmod +x kubectl && sudo mv kubectl /usr/local/bin/
kubectl version --client
```

---

## Step 7: Install eksctl

```bash
curl -sLO "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_Linux_amd64.tar.gz"
tar -xzf eksctl_Linux_amd64.tar.gz && sudo mv eksctl /usr/local/bin/
eksctl version
```

---

## Step 8: Install Java

```bash
sudo apt-get install -y openjdk-17-jdk
java -version
```

---

## Step 9: Install PostgreSQL (for SonarQube)

```bash
# Install PostgreSQL 15
sudo apt-get install -y postgresql postgresql-contrib postgresql-15

# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Check status
sudo systemctl status postgresql

# Switch to postgres user and create SonarQube database
sudo -u postgres psql << EOF
CREATE USER sonarqube WITH ENCRYPTED PASSWORD 'sonar123';
CREATE DATABASE sonarqube OWNER sonarqube;
GRANT ALL PRIVILEGES ON DATABASE sonarqube TO sonarqube;
\q
EOF

# Test connection
psql -h localhost -U sonarqube -d sonarqube -c "SELECT 1;"
# Enter password: sonar123
```

---

## Step 10: Install & Configure Jenkins

### 10.1 Install Jenkins

```bash
# Remove broken Jenkins repo & key (important)
sudo rm -f /etc/apt/sources.list.d/jenkins.list
sudo rm -f /usr/share/keyrings/jenkins-keyring.asc

# Download & install the correct Jenkins GPG key
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key \
| sudo tee /usr/share/keyrings/jenkins-keyring.asc > /dev/null

# This is the new official Jenkins key (required)
# Add Jenkins repository (signed properly)

echo "deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
https://pkg.jenkins.io/debian-stable binary/" \
| sudo tee /etc/apt/sources.list.d/jenkins.list > /dev/null

#Update package list
sudo apt update

# Install Jenkins
sudo apt-get install -y jenkins

# Start and enable Jenkins
sudo systemctl start jenkins
sudo systemctl enable jenkins

# Check status
sudo systemctl status jenkins
```

### 10.2 Configure Jenkins Initial Setup

```bash
# Get initial admin password
sudo cat /var/lib/jenkins/secrets/initialAdminPassword

# Access Jenkins UI
# Open browser: http://your-ec2-public-ip:8080
```

**Jenkins Initial Setup:**
1. Paste the initial admin password
2. Install suggested plugins
3. Create admin user
4. Configure Jenkins URL

### 10.3 Install Required Jenkins Plugins

**Required Plugins:**
- Docker Pipeline
- Kubernetes
- Git
- Pipeline
- AWS Steps
- SonarQube Scanner

**Install via UI:**
1. Dashboard → Manage Jenkins → Plugins
2. Search and install each plugin
3. Restart Jenkins

### 10.4 Configure Jenkins Credentials

**Add DockerHub Credentials:**
1. Manage Jenkins → Credentials → System → Global credentials
2. Add Credentials → Username with password
3. ID: `dockerhub-credentials`
4. Username: Your DockerHub username
5. Password: Your DockerHub password

**Add AWS Credentials:**
1. Add Credentials → AWS Credentials
2. ID: `aws-credentials`
3. Access Key ID: Your AWS access key
4. Secret Access Key: Your AWS secret key

**Add GitHub Credentials (for Private Repositories):**
1. Add Credentials → Username with password (or Personal Access Token)
2. ID: `github-credentials`
3. Username: Your GitHub username
4. Password: GitHub Personal Access Token
   - Generate token at: https://github.com/settings/tokens
   - Required scopes: `repo`, `admin:repo_hook`

**Add SonarQube Token:**
1. First, generate token in SonarQube UI:
   - Login to SonarQube: `http://your-ec2-public-ip:9000`
   - My Account → Security → Generate Token
   - Name: `jenkins`
   - Copy the generated token
2. Back in Jenkins → Add Credentials → Secret text
3. ID: `sonarqube-token`
4. Secret: Paste the SonarQube token

### 10.5 Configure GitHub Webhook (for Auto-Trigger)

**In GitHub Repository:**
1. Go to your repository → Settings → Webhooks
2. Click **Add webhook**
3. Payload URL: `http://your-ec2-public-ip:8080/github-webhook/`
4. Content type: `application/json`
5. Select events: **Just the push event**
6. Active: ✓ Check
7. Click **Add webhook**

**In Jenkins Job Configuration:**
1. Open your pipeline job
2. Build Triggers → Check **GitHub hook trigger for GITScm polling**
3. Save

### 10.6 Configure SonarQube Integration

**In Jenkins:**
1. Manage Jenkins → Configure System
2. Scroll to **SonarQube servers**
3. Click **Add SonarQube**
4. Name: `SonarQube`
5. Server URL: `http://localhost:9000`
6. Server authentication token: Select `sonarqube-token` from dropdown
7. Click **Save**

---

## Step 11: Install & Configure SonarQube

## Step 11: Install & Configure SonarQube

### 11.1 Install SonarQube

```bash
# Download SonarQube
cd /opt
sudo wget https://binaries.sonarsource.com/Distribution/sonarqube/sonarqube-9.9.0.65466.zip

# Unzip
sudo unzip sonarqube-9.9.0.65466.zip
sudo mv sonarqube-9.9.0.65466 sonarqube

# Set ownership (using root)
sudo chown -R root:root /opt/sonarqube

# Set system limits
sudo tee /etc/security/limits.d/99-sonarqube.conf << EOF
root   -   nofile   65536
root   -   nproc    4096
EOF

# Set kernel parameters
sudo tee -a /etc/sysctl.conf << EOF
vm.max_map_count=262144
fs.file-max=65536
EOF

# Apply settings
sudo sysctl -p
```

### 11.2 Configure SonarQube Database Connection

```bash
# Edit SonarQube configuration
sudo nano /opt/sonarqube/conf/sonar.properties
```

**Uncomment and update these lines:**
```properties
sonar.jdbc.username=sonarqube
sonar.jdbc.password=sonar123
sonar.jdbc.url=jdbc:postgresql://localhost/sonarqube
```

**Save and exit (Ctrl+X, Y, Enter)**

### 11.3 Configure SonarQube Service

```bash
# Create systemd service
sudo tee /etc/systemd/system/sonarqube.service << 'EOF'
[Unit]
Description=SonarQube service
After=network.target

[Service]
Type=forking
ExecStart=/opt/sonarqube/bin/linux-x86-64/sonar.sh start
ExecStop=/opt/sonarqube/bin/linux-x86-64/sonar.sh stop
User=root
Group=root
Restart=always
LimitNOFILE=65536
LimitNPROC=4096

[Install]
WantedBy=multi-user.target
EOF

# Start SonarQube
sudo systemctl start sonarqube
sudo systemctl enable sonarqube

# Check status
sudo systemctl status sonarqube
```

### 11.4 Access SonarQube UI

```bash
# Wait for startup (1-2 minutes)
# Access: http://your-ec2-public-ip:9000

# Default credentials:
# Username: admin
# Password: admin
```

### 11.5 Configure SonarQube Project

**In SonarQube UI:**
1. Create new project
2. Project key: `compressorr`
3. Generate token
4. Copy token

**Configure in Jenkins:**
1. Manage Jenkins → Configure System
2. SonarQube servers → Add SonarQube
3. Name: `SonarQube`
4. Server URL: `http://localhost:9000`
5. Add token in credentials

---

## Step 12: Install & Configure Prometheus

### 12.1 Download and Install Prometheus

```bash
# Create directories
sudo mkdir -p /etc/prometheus
sudo mkdir -p /var/lib/prometheus

# Download Prometheus
cd /tmp
sudo wget https://github.com/prometheus/prometheus/releases/download/v2.48.0/prometheus-2.48.0.linux-amd64.tar.gz

# Extract
sudo tar -xvf prometheus-2.48.0.linux-amd64.tar.gz
cd prometheus-2.48.0.linux-amd64

# Copy binaries
sudo cp prometheus /usr/local/bin/
sudo cp promtool /usr/local/bin/

# Set ownership
sudo chown root:root /usr/local/bin/prometheus
sudo chown root:root /usr/local/bin/promtool

# Copy configuration files
sudo cp -r consoles /etc/prometheus
sudo cp -r console_libraries /etc/prometheus
sudo cp prometheus.yml /etc/prometheus/prometheus.yml

# Set ownership
sudo chown -R root:root /etc/prometheus

# Verify installation
prometheus --version
```

### 12.2 Configure Prometheus

```bash
# Edit Prometheus configuration
sudo nano /etc/prometheus/prometheus.yml
```

**Replace with the following configuration:**
```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  # Prometheus itself
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  # Backend application metrics
  - job_name: 'compressorr-backend'
    static_configs:
      - targets: ['localhost:5000']
    metrics_path: '/metrics'

  # Node Exporter (system metrics)
  - job_name: 'node-exporter'
    static_configs:
      - targets: ['localhost:9100']
```

**Save and exit (Ctrl+X, Y, Enter)**

### 12.3 Validate Configuration

```bash
# Validate configuration file
sudo /usr/local/bin/promtool check config /etc/prometheus/prometheus.yml

# Fix permissions if needed
sudo chown -R root:root /etc/prometheus
sudo chown -R root:root /var/lib/prometheus
sudo chmod 755 /etc/prometheus
sudo chmod 755 /var/lib/prometheus
```

### 12.4 Create Prometheus Service

```bash
# Create systemd service file
sudo tee /etc/systemd/system/prometheus.service << 'EOF'
[Unit]
Description=Prometheus
Wants=network-online.target
After=network-online.target

[Service]
User=root
Group=root
Type=simple
Restart=on-failure
RestartSec=5s
ExecStart=/usr/local/bin/prometheus \
  --config.file=/etc/prometheus/prometheus.yml \
  --storage.tsdb.path=/var/lib/prometheus/ \
  --web.console.templates=/etc/prometheus/consoles \
  --web.console.libraries=/etc/prometheus/console_libraries \
  --web.enable-lifecycle
ExecReload=/bin/kill -HUP $MAINPID
TimeoutStopSec=20s
SendSIGKILL=no

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd
sudo systemctl daemon-reload

# Start Prometheus
sudo systemctl start prometheus
sudo systemctl enable prometheus

# Wait for service to start
sleep 5

# Check status
sudo systemctl status prometheus

# Check logs if failed
sudo journalctl -u prometheus -n 50 --no-pager
```

### 12.5 Install Node Exporter (System Metrics)

```bash
# Download Node Exporter
cd /tmp
sudo wget https://github.com/prometheus/node_exporter/releases/download/v1.7.0/node_exporter-1.7.0.linux-amd64.tar.gz

# Extract
sudo tar -xvf node_exporter-1.7.0.linux-amd64.tar.gz

# Copy binary
sudo cp node_exporter-1.7.0.linux-amd64/node_exporter /usr/local/bin/

# Set ownership
sudo chown root:root /usr/local/bin/node_exporter

# Create systemd service
sudo tee /etc/systemd/system/node_exporter.service << 'EOF'
[Unit]
Description=Node Exporter
After=network.target

[Service]
User=root
Group=root
Type=simple
ExecStart=/usr/local/bin/node_exporter

[Install]
WantedBy=multi-user.target
EOF

# Start Node Exporter
sudo systemctl daemon-reload
sudo systemctl start node_exporter
sudo systemctl enable node_exporter

# Check status
sudo systemctl status node_exporter
```

### 12.6 Verify Prometheus

```bash
# Check if Prometheus is listening
sudo netstat -tlnp | grep 9090

# Test Prometheus API
curl http://localhost:9090/-/healthy

# Access Prometheus UI
# Open browser: http://your-ec2-public-ip:9090

# Check targets
# Go to Status → Targets to verify all targets are UP
```

### 12.7 Troubleshoot Prometheus Issues

If Prometheus fails to start, use these commands:

```bash
# Check service status
sudo systemctl status prometheus

# View detailed logs
sudo journalctl -u prometheus -n 100 --no-pager

# Validate configuration
sudo /usr/local/bin/promtool check config /etc/prometheus/prometheus.yml

# Check permissions
ls -la /etc/prometheus
ls -la /var/lib/prometheus

# Fix permissions
sudo chown -R root:root /etc/prometheus
sudo chown -R root:root /var/lib/prometheus

# Check port availability
sudo netstat -tlnp | grep 9090

# If data is corrupted, clean and restart
sudo systemctl stop prometheus
sudo rm -rf /var/lib/prometheus/wal
sudo mkdir -p /var/lib/prometheus
sudo chown -R root:root /var/lib/prometheus
sudo systemctl start prometheus
```

**Common Prometheus Errors and Solutions:**

1. **"Permission denied" errors:**
   ```bash
   sudo chown -R root:root /etc/prometheus /var/lib/prometheus
   ```

2. **"Config file invalid" errors:**
   ```bash
   sudo /usr/local/bin/promtool check config /etc/prometheus/prometheus.yml
   ```

3. **Service fails to start:**
   ```bash
   sudo journalctl -u prometheus -n 50
   # Check for specific error and fix accordingly
   ```

4. **Port already in use:**
   ```bash
   sudo lsof -i :9090  # Find what's using the port
   sudo kill -9 <PID>  # Kill the process
   ```

5. **Corrupted WAL (Write-Ahead Log):**
   ```bash
   sudo systemctl stop prometheus
   sudo rm -rf /var/lib/prometheus/wal
   sudo systemctl start prometheus
   ```

[Service]
User=root
Group=root
Type=simple
ExecStart=/usr/local/bin/node_exporter

[Install]
WantedBy=multi-user.target
EOF

# Start Node Exporter
sudo systemctl daemon-reload
sudo systemctl start node_exporter
sudo systemctl enable node_exporter

# Check status
sudo systemctl status node_exporter
```

### 12.6 Verify Prometheus

```bash
# Check if Prometheus is listening
sudo netstat -tlnp | grep 9090

# Test Prometheus API
curl http://localhost:9090/-/healthy

# Access Prometheus UI
# Open browser: http://your-ec2-public-ip:9090

# Check targets
# Go to Status → Targets to verify all targets are UP
```

### 12.7 Troubleshoot Prometheus Issues

If Prometheus fails to start, use these commands:

```bash
# Check service status
sudo systemctl status prometheus

# View detailed logs
sudo journalctl -u prometheus -n 100 --no-pager

# Validate configuration
sudo /usr/local/bin/promtool check config /etc/prometheus/prometheus.yml

# Check permissions
ls -la /etc/prometheus
ls -la /var/lib/prometheus

# Fix permissions
sudo chown -R root:root /etc/prometheus
sudo chown -R root:root /var/lib/prometheus

# Check port availability
sudo netstat -tlnp | grep 9090

# If data is corrupted, clean and restart
sudo systemctl stop prometheus
sudo rm -rf /var/lib/prometheus/wal
sudo mkdir -p /var/lib/prometheus
sudo chown -R root:root /var/lib/prometheus
sudo systemctl start prometheus
```

**Common Prometheus Errors and Solutions:**

1. **"Permission denied" errors:**
   ```bash
   sudo chown -R root:root /etc/prometheus /var/lib/prometheus
   ```

2. **"Config file invalid" errors:**
   ```bash
   sudo /usr/local/bin/promtool check config /etc/prometheus/prometheus.yml
   ```

3. **Service fails to start:**
   ```bash
   sudo journalctl -u prometheus -n 50
   # Check for specific error and fix accordingly
   ```

4. **Port already in use:**
   ```bash
   sudo lsof -i :9090  # Find what's using the port
   sudo kill -9 <PID>  # Kill the process
   ```

5. **Corrupted WAL (Write-Ahead Log):**
   ```bash
   sudo systemctl stop prometheus
   sudo rm -rf /var/lib/prometheus/wal
   sudo systemctl start prometheus
   ```

---

## Step 13: Install & Configure Grafana

### 13.1 Install Grafana

```bash
# Add Grafana repository
sudo apt-get install -y software-properties-common
sudo add-apt-repository "deb https://packages.grafana.com/oss/deb stable main"

# Add Grafana GPG key
sudo wget -q -O /usr/share/keyrings/grafana.key https://packages.grafana.com/gpg.key

# Update package list
sudo apt-get update

# Install Grafana
sudo apt-get install -y grafana

# Start and enable Grafana
sudo systemctl start grafana-server
sudo systemctl enable grafana-server

# Check status
sudo systemctl status grafana-server
```

### 13.2 Access Grafana UI

```bash
# Access Grafana
# Open browser: http://your-ec2-public-ip:3000

# Default credentials:
# Username: admin
# Password: admin
# (You'll be prompted to change password on first login)
```

### 13.3 Configure Prometheus Data Source in Grafana

**In Grafana UI:**
1. Login with admin/admin
2. Change password when prompted
3. Click **Add your first data source**
4. Select **Prometheus**
5. Configure:
   - Name: `Prometheus`
   - URL: `http://localhost:9090`
   - Access: `Server (default)`
6. Click **Save & Test**
7. Should show "Data source is working"

### 13.4 Import Pre-built Dashboards

**Import Node Exporter Dashboard:**
1. Click **+** → **Import**
2. Enter dashboard ID: `1860`
3. Click **Load**
4. Select Prometheus data source
5. Click **Import**

**Import Custom Task Manager Dashboard (if available):**
1. Click **+** → **Import**
2. Upload `monitoring/grafana-dashboard.json` from your project
3. Select Prometheus data source
4. Click **Import**

### 13.5 Create Simple Dashboard for Task Manager

If custom dashboard doesn't exist, create one:

1. Click **+** → **Dashboard** → **Add new panel**
2. Query examples:
   - HTTP Request Rate: `rate(http_requests_total[5m])`
   - Memory Usage: `process_resident_memory_bytes`
   - Database Connections: `pg_stat_activity_count`
3. Customize visualization
4. Click **Save** → Name: `Task Manager Monitoring`

---

# SECTION B: DEPLOYMENT

## Step 14: Clone & Configure Application

### 14.1 Clone Repository

```bash
# Create application directory
mkdir -p ~/applications
cd ~/applications

# Clone your repository
git clone <your-repo-url> taskmanager
cd taskmanager
```

### 14.2 Configure Environment Variables

```bash
# Create .env file
cat > .env << EOF
# Flask Configuration
FLASK_ENV=production
SECRET_KEY=7a8f9d2e4c6b1a3e5d7f9b2c4e6a8d0f1c3e5a7b9d1f3e5c7a9b1d3f5e7a9c1b

# Database Configuration
POSTGRES_USER=taskmanager
POSTGRES_PASSWORD=P@ssw0rd!2026SecureDB
POSTGRES_DB=taskmanager_db
DATABASE_URL=postgresql://taskmanager:P@ssw0rd!2026SecureDB@postgres:5432/taskmanager_db

# Backend Configuration
BACKEND_PORT=8888
BACKEND_HOST=0.0.0.0

# Frontend Configuration
FRONTEND_PORT=80
EOF

# Secure the .env file
chmod 600 .env
```

### 14.3 Create Required Directories

```bash
# Create volume directories for persistent data
mkdir -p /var/lib/taskmanager/postgres-data
mkdir -p /var/lib/taskmanager/backend-instance
mkdir -p /var/log/taskmanager/backend
mkdir -p /var/log/taskmanager/frontend

# Set proper permissions
sudo chown -R 999:999 /var/lib/taskmanager/postgres-data
sudo chown -R 1000:1000 /var/lib/taskmanager/backend-instance
sudo chmod -R 755 /var/lib/taskmanager
```

---

## Step 15: Docker Deployment

### 15.1 Build Docker Images

```bash
# Build backend image
docker build -f backend/Dockerfile -t taskmanager-backend:latest ./backend

# Build frontend image
docker build -f frontend/Dockerfile -t taskmanager-frontend:latest ./frontend

# Verify images
docker images | grep taskmanager
```

### 15.2 Run with Docker Compose

```bash
# Start all services in detached mode
docker-compose up -d

# View container status
docker-compose ps

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### 15.3 Verify Application

```bash
# Check backend health
curl -X GET http://localhost:8888/health

# Check database connectivity
curl -X GET http://localhost:8888/api/status

# Access frontend
curl http://localhost/

# List running containers
docker ps
```

**Access in browser:**
- Frontend: `http://your-ec2-public-ip/`
- Backend API: `http://your-ec2-public-ip:8888`

### 15.4 Manage Containers

```bash
# Stop services
docker-compose stop

# Start services
docker-compose start

# Restart services
docker-compose restart

# Stop and remove containers (keep volumes)
docker-compose down

# Complete cleanup (removes everything including volumes)
docker-compose down -v
```

---

## Step 16: Kubernetes (EKS) Deployment

### 16.1 Create EKS Cluster

```bash
# Create EKS cluster (takes 15-20 minutes)
eksctl create cluster \
  --name taskmanager-cluster \
  --region us-east-1 \
  --nodegroup-name taskmanager-nodes \
  --node-type t3.medium \
  --nodes 2 \
  --nodes-min 1 \
  --nodes-max 3 \
  --managed

# Verify cluster creation
kubectl get nodes
kubectl cluster-info
```

### 16.2 Create Namespace

```bash
# Create namespace
kubectl create namespace taskmanager

# Set as default
kubectl config set-context --current --namespace=taskmanager

# Verify
kubectl get namespaces
```

### 16.3 Create Kubernetes Secrets

```bash
# Create secret for PostgreSQL
kubectl apply -f k8s/secrets.yaml

# Verify secrets
kubectl get secrets -n taskmanager
```

### 16.4 Deploy PostgreSQL

```bash
# Create PostgreSQL PVC
kubectl apply -f k8s/postgres-pvc.yaml

# Deploy PostgreSQL
kubectl apply -f k8s/postgres-deployment.yaml

# Check status
kubectl get statefulsets -n taskmanager
kubectl get pods -n taskmanager

# Wait for PostgreSQL to be ready
kubectl wait --for=condition=ready pod -l app=postgres --timeout=300s -n taskmanager
```

### 16.5 Deploy Backend

```bash
# Deploy backend
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml

# Check status
kubectl get deployments -n taskmanager
kubectl get pods -n taskmanager
kubectl get svc -n taskmanager
```

### 16.6 Deploy Frontend

```bash
# Deploy frontend
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/ingress.yaml

# Check all resources
kubectl get all -n taskmanager
```

### 16.7 Access Application

```bash
# Get service information
kubectl get svc -n taskmanager

# For NodePort service
kubectl get nodes -o wide
# Access: http://<node-ip>:<node-port>

# For LoadBalancer
kubectl get svc frontend -n taskmanager
# Access: http://<external-ip>
```

### 16.8 Kubernetes Cluster Management

```bash
# View cluster information
kubectl cluster-info
kubectl get nodes -o wide

# View all resources in namespace
kubectl get all -n taskmanager

# View logs
kubectl logs <pod-name> -n taskmanager
kubectl logs -f <pod-name> -n taskmanager  # Follow logs
kubectl logs -l app=backend -n taskmanager  # All backend pods

# Describe resources
kubectl describe pod <pod-name> -n taskmanager
kubectl describe svc <service-name> -n taskmanager

# Scale deployment
kubectl scale deployment backend --replicas=3 -n taskmanager

# Update image
kubectl set image deployment/backend backend=taskmanager-backend:v2 -n taskmanager
kubectl rollout status deployment/backend -n taskmanager

# Rollback deployment
kubectl rollout undo deployment/backend -n taskmanager

# Delete resources
kubectl delete -f k8s/frontend-deployment.yaml -n taskmanager

# Cleanup entire namespace
kubectl delete namespace taskmanager

# Delete cluster
eksctl delete cluster --name taskmanager-cluster --region us-east-1
```

---

## Step 17: Setup CI/CD Pipeline with Jenkins

### 17.1 Understanding the Jenkinsfile

The project includes a `Jenkinsfile` that defines the complete CI/CD pipeline with the following stages:

**Pipeline Stages:**
1. **Git Checkout** - Clone source code from repository
2. **SonarQube Analysis** - Code quality and security scan
3. **Quality Gate Check** - Verify code meets quality standards
4. **Build & Push Docker Images** - Build backend and frontend containers and push to DockerHub
5. **Apply Kubernetes Manifests** - Deploy/update all K8s resources (PostgreSQL, Backend, Frontend, Monitoring)
6. **Update Container Images** - Update deployments with new Docker images
7. **Post-Deployment Health Check** - Verify all pods and services are healthy

**Prerequisites:**
- All credentials configured (DockerHub, AWS, GitHub, SonarQube)
- GitHub webhook configured for auto-trigger
- EKS cluster running and accessible
- kubectl configured with EKS cluster access

### 17.2 Create Jenkins Pipeline Job

1. Open Jenkins UI: `http://your-ec2-public-ip:8080`
2. Click **New Item** on the left sidebar
3. Enter name: `TaskManager-Deploy`
4. Select **Pipeline**
5. Click **OK**

### 17.3 Configure General Settings

**In the pipeline configuration page:**

1. **Description:** (Optional)
   ```
   CI/CD pipeline for Task Manager application - builds Docker images and deploys to EKS
   ```

2. **Discard old builds:** (Recommended)
   - Check this option
   - Strategy: Log Rotation
   - Max # of builds to keep: `10`

### 17.4 Configure Build Triggers

**Enable GitHub Webhook:**
1. Under **Build Triggers** section
2. Check ☑ **GitHub hook trigger for GITScm polling**
3. This allows automatic builds when you push to GitHub

**Poll SCM (Alternative):**
- If webhook doesn't work, use: `H/5 * * * *` (checks every 5 minutes)

### 17.5 Configure Pipeline Definition

**Pipeline Section:**

1. **Definition:** Select **Pipeline script from SCM**

2. **SCM:** Select **Git**

3. **Repository URL:** Enter your GitHub repository URL
   ```
   https://github.com/your-username/Python-DevOps.git
   ```

4. **Credentials:**
   - If public repo: Select **- none -**
   - If private repo: Select **github-credentials** (configured in Step 10.4)

5. **Branches to build:**
   - Branch Specifier: `*/main` or `*/master`

6. **Script Path:** `Jenkinsfile`

7. **Lightweight checkout:** ☑ Check this

### 17.6 Save Configuration

1. Click **Save** at the bottom
2. Verify all settings are correct

### 17.7 Run the Pipeline (First Build)

**Trigger Manual Build:**

1. Click **Build Now** on the left sidebar
2. Click on **#1** (build number)
3. Click **Console Output** to view real-time logs

**Expected Pipeline Flow:**
```
Started by user admin
[Pipeline] Start
[Pipeline] node

[Pipeline] stage (Git Checkout)
  ✓ Checking out code...
  
[Pipeline] stage (SonarQube Analysis)
  ✓ Running code quality scan...
  
[Pipeline] stage (Build & Push Docker Images)
  ✓ Building backend image...
  ✓ Pushing to DockerHub...
  
[Pipeline] stage (Kubernetes Deployment)
  ✓ Applying manifests...
  ✓ Waiting for rollouts...
  
[Pipeline] stage (Health Check)
  ✓ Verifying deployment...
  
[Pipeline] End
SUCCESS
```

### 17.8 Monitor Pipeline Execution

**During Build:**
- Watch **Console Output** for real-time progress
- Each stage shows success ✓ or failure ✗

**After Build:**
1. Click on the build number to view details
2. Review **Console Output** for any errors
3. Check **Stage View** for execution time per stage

### 17.9 Verify Deployment Success

**After successful pipeline run:**

```bash
# Check EKS deployments
kubectl get deployments -n taskmanager

# Check pod status
kubectl get pods -n taskmanager

# View logs
kubectl logs -f deployment/backend -n taskmanager

# Get service info
kubectl get svc -n taskmanager
```

### 17.10 Configure Notifications (Optional)

**Add Email Notifications:**

1. Edit pipeline job → **Configure**
2. Add **Post-build Actions**
3. Select **Editable Email Notification**
4. Configure:
   - Recipients: `your-email@example.com`
   - Triggers: **Failure - Any**, **Success**

**Add Slack Notifications:**

1. Install **Slack Notification** plugin
2. Configure Slack webhook in Jenkins
3. Add to Jenkinsfile:
   ```groovy
   post {
       success {
           slackSend color: 'good', message: "Build Successful: ${env.JOB_NAME} #${env.BUILD_NUMBER}"
       }
       failure {
           slackSend color: 'danger', message: "Build Failed: ${env.JOB_NAME} #${env.BUILD_NUMBER}"
       }
   }
   ```

### 17.11 Automatic Builds via GitHub Webhook

**Test Webhook Trigger:**

1. Make a small change to your code locally
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Test CI/CD trigger"
   git push origin main
   ```
3. Jenkins should automatically start a new build
4. Check **Build History** for new build number
5. GitHub webhook should show delivery in repo Settings → Webhooks

**Troubleshoot Webhook:**
- Check Jenkins is accessible from internet (not localhost)
- Verify webhook URL: `http://your-ec2-public-ip:8080/github-webhook/`
- Check GitHub webhook delivery logs for errors
- Ensure security group allows port 8080

### 17.12 Pipeline Best Practices

**Security:**
- Never hardcode credentials in Jenkinsfile
- Use Jenkins credentials manager
- Rotate access tokens regularly
- Use minimal IAM permissions for AWS

**Performance:**
- Use Docker build cache
- Parallelize independent stages
- Clean workspace after builds
- Archive artifacts selectively

**Monitoring:**
- Review build trends regularly
- Set up failure alerts
- Monitor build duration
- Track deployment frequency

### 17.13 Common Pipeline Issues and Solutions

**Issue 1: Docker Login Failed**
```
Solution:
- Verify dockerhub-credentials in Jenkins
- Check DockerHub username/password
- Test login manually: docker login
```

**Issue 2: AWS EKS Access Denied**
```
Solution:
- Verify aws-credentials are correct
- Check IAM permissions
- Update kubeconfig: aws eks update-kubeconfig --name cluster-name
```

**Issue 3: Image Not Found**
```
Solution:
- Verify image was pushed to DockerHub
- Check image name matches in deployment YAML
- Ensure image tag is correct
```

**Issue 4: Deployment Timeout**
```
Solution:
- Check pod events: kubectl describe pod <pod-name>
- Verify container image can be pulled
- Check resource limits in deployment
```

**Issue 5: Webhook Not Triggering**
```
Solution:
- Check GitHub webhook delivery logs
- Verify Jenkins URL is accessible
- Ensure GitHub hook trigger is enabled in job
- Check firewall/security group rules
```

### 17.14 View Pipeline Metrics

**In Jenkins Dashboard:**
- Click on pipeline job name
- View **Build History** graph
- Check **Stage View** for bottlenecks
- Review **Trend** for success rate

**Useful Metrics:**
- Build success rate
- Average build duration
- Most frequent failure stage
- Deployment frequency

---

## Step 18: Verify Monitoring

### 18.1 Verify Prometheus

```bash
# Access Prometheus UI
# Browser: http://your-ec2-public-ip:9090

# Check if targets are UP
# Go to Status → Targets

# Run sample queries:
# - up (shows all targets)
# - rate(http_requests_total[5m])
# - process_resident_memory_bytes
```

### 18.2 Verify Grafana Dashboards

```bash
# Access Grafana UI
# Browser: http://your-ec2-public-ip:3000

# Login with admin credentials
# Verify Prometheus data source is connected (green check)

# Check dashboards:
# - Node Exporter Full (ID: 1860)
# - Task Manager Custom Dashboard (if imported)
```

### 18.3 Monitor Application Metrics

**Key Metrics to Monitor:**

1. **System Metrics (Node Exporter Dashboard):**
   - CPU Usage
   - Memory Usage
   - Disk I/O
   - Network Traffic

2. **Application Metrics (Backend):**
   - HTTP Request Rate
   - Response Time
   - Error Rate
   - Database Connection Pool

3. **Container Metrics (Kubernetes):**
   - Pod CPU/Memory usage
   - Container restarts
   - Pod health status

**Create Alerts in Prometheus:**

1. Edit `/etc/prometheus/prometheus.yml`
2. Add alerting rules
3. Configure Alertmanager
4. Set up notification channels (Email, Slack)

---
   - Database Connections
   - Memory Usage

3. **Database Metrics:**
   - Connection Count
   - Query Performance

**Access URLs:**
- Prometheus: `http://your-ec2-public-ip:9090`
- Grafana: `http://your-ec2-public-ip:3000`

---

# SECTION C: REFERENCE

## Environment Variables

### Required Variables (.env file)

```bash
# Flask Configuration
FLASK_ENV=production
SECRET_KEY=<generate-with: python3 -c "import secrets; print(secrets.token_hex(32))">

# Database
POSTGRES_USER=taskmanager
POSTGRES_PASSWORD=<strong-password-here>
POSTGRES_DB=taskmanager_db
DATABASE_URL=postgresql://taskmanager:<password>@postgres:5432/taskmanager_db

# Server
BACKEND_PORT=8888
BACKEND_HOST=0.0.0.0
NODE_ENV=production
```

### Generate Secure Secrets

```bash
# Generate random secret key
python3 -c "import secrets; print(secrets.token_hex(32))"

# Generate strong password
python3 -c "import secrets; print(secrets.token_urlsafe(16))"
```

---

## Troubleshooting

### Frontend/Nginx Issues

**Problem: LoadBalancer shows default nginx page instead of application**

This is usually caused by incorrect nginx configuration or files not being copied properly.

**Solution 1: Rebuild and redeploy the frontend image**
```bash
# Use the automated rebuild script
sudo chmod +x scripts/rebuild-frontend.sh
sudo ./scripts/rebuild-frontend.sh
```

**Solution 2: Manual fix steps**
```bash
# 1. Rebuild the Docker image
sudo docker build -f Dockerfiles/frontend.Dockerfile -t saikiranasamwar4/compressor-frontend:v1.1 .

# 2. Test locally first
sudo docker run -d --name test-frontend -p 8080:80 saikiranasamwar4/compressor-frontend:v1.1

# 3. Verify it works
curl http://localhost:8080/health
curl http://localhost:8080/  # Should show your HTML, not nginx default

# 4. If test passes, push to Docker Hub
sudo docker push saikiranasamwar4/compressor-frontend:v1.1

# 5. Delete existing pods to pull new image
kubectl delete pods -n media-app -l app=frontend

# 6. Wait for pods to be ready
kubectl wait --for=condition=ready pod -n media-app -l app=frontend --timeout=120s

# 7. Test the LoadBalancer URL
LB_URL=$(kubectl get svc frontend-service -n media-app -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
curl http://$LB_URL/health
```

**Solution 3: Debug the deployment**
```bash
# Use the debug script
sudo chmod +x scripts/debug-frontend.sh
sudo ./scripts/debug-frontend.sh

# Or manually check:
POD_NAME=$(kubectl get pods -n media-app -l app=frontend -o jsonpath='{.items[0].metadata.name}')

# Check files in the container
kubectl exec -n media-app $POD_NAME -- ls -la /usr/share/nginx/html/

# Check nginx config
kubectl exec -n media-app $POD_NAME -- cat /etc/nginx/conf.d/default.conf

# Check pod logs
kubectl logs -n media-app $POD_NAME
```

**Common Causes:**
- ✗ Docker image not rebuilt after config changes
- ✗ Kubernetes using cached/old image
- ✗ Wrong nginx.conf file being copied
- ✗ Frontend files not copied to correct directory
- ✗ Browser cache showing old version

**Quick Fixes:**
```bash
# Force clear browser cache
# Press Ctrl+Shift+R or Cmd+Shift+R

# Force Kubernetes to pull new image
kubectl rollout restart deployment frontend -n media-app

# If still not working, delete and recreate
kubectl delete deployment frontend -n media-app
kubectl apply -f k8s/frontend/
```

---

### Docker Issues

**Problem: Permission denied**
```bash
# Solution: Use sudo with all Docker commands
# All Docker commands must be prefixed with 'sudo'
sudo docker ps
sudo docker-compose up -d
```

**Problem: Container won't start**
```bash
# Check logs
sudo docker logs <container-name>

# Check if port is in use
sudo netstat -tulpn | grep <port>
```

### Kubernetes Issues

**Problem: Pods in CrashLoopBackOff**
```bash
# Check pod logs
kubectl logs <pod-name>

# Describe pod for events
kubectl describe pod <pod-name>

# Check if images exist
sudo docker pull saikiranasamwar4/compressor-backend:latest
```

**Problem: Service not accessible**
```bash
# Check service
kubectl get service <service-name>

# Check endpoints
kubectl get endpoints <service-name>

# Port forward for testing
kubectl port-forward service/<service-name> 8080:80
```

### MongoDB Connection Issues

**Problem: Backend can't connect to MongoDB**
```bash
# Check MongoDB pod
kubectl get pods -l app=mongo

# Check MongoDB logs
kubectl logs <mongo-pod-name>

# Test connection from backend pod
kubectl exec -it <backend-pod> -- sh
nc -zv mongo 27017
```

### Jenkins Issues

**Problem: Jenkins won't start**
```bash
# Check Java version
java -version

# Check Jenkins logs
sudo journalctl -u jenkins -f

# Check disk space
df -h
```

### EKS Issues

**Problem: kubectl can't connect to cluster**
```bash
# Update kubeconfig
aws eks update-kubeconfig --name compressor-cluster --region us-east-1

# Verify connection
kubectl cluster-info

# Check AWS credentials
aws sts get-caller-identity
```

### SonarQube Issues

**Problem: SonarQube won't start**
```bash
# Check system limits
ulimit -n
ulimit -u

# Check kernel parameters
sysctl vm.max_map_count

# Check logs
tail -f /opt/sonarqube/logs/sonar.log
```

### Application Issues

**Problem: Application flickering or infinite loading loop**

This occurs when the frontend JavaScript has hardcoded API URLs that don't work in the deployed environment.

**Symptoms:**
- Page loads but keeps redirecting
- Authentication checks fail repeatedly
- Browser console shows failed network requests to localhost

**Root Cause:**
Frontend JavaScript files contain hardcoded `http://localhost:5000` API URLs which don't work when deployed to Kubernetes.

**Solution:**
```bash
# This has been fixed in v1.1+ - all API URLs now use relative paths
# If you're still experiencing this issue, ensure you're using the latest image:

# 1. Check current deployment image
kubectl get deployment frontend -n media-app -o jsonpath='{.spec.template.spec.containers[0].image}'

# 2. If not v1.1+, update to latest
kubectl set image deployment/frontend frontend=saikiranasamwar4/compressor-frontend:v1.1 -n media-app

# 3. Verify rollout
kubectl rollout status deployment/frontend -n media-app
```

**Problem: 502 Bad Gateway**
```bash
# Check if backend is running
curl http://localhost:5000/api/health

# Check nginx logs (in Docker)
sudo docker logs compressorr-frontend

# Check backend logs
sudo docker logs compressorr-backend
```

**Problem: File upload fails**
```bash
# Check upload directory permissions
ls -la uploads/

# Create if missing
sudo mkdir -p uploads/profiles
sudo chmod -R 755 uploads
```

### Network Issues

**Problem: Can't access from browser**
```bash
# Check security group rules
aws ec2 describe-security-groups

# Check if service is listening
sudo netstat -tulpn | grep <port>

# Test from EC2
curl http://localhost:<port>
```

---

## Quick Reference Commands

### Docker
```bash
sudo docker ps                              # List running containers
sudo docker logs <container>                # View logs
sudo docker exec -it <container> sh         # Shell into container
sudo docker-compose up -d                   # Start services
sudo docker-compose down                    # Stop services
sudo docker system prune -a                 # Clean up
```

### Kubernetes
```bash
kubectl get all                        # List all resources
kubectl get pods -o wide               # Detailed pod info
kubectl logs -f <pod>                  # Follow logs
kubectl exec -it <pod> -- sh           # Shell into pod
kubectl delete pod <pod>               # Delete pod
kubectl rollout restart deployment/<name>  # Restart deployment
```

### AWS
```bash
aws eks list-clusters                  # List EKS clusters
aws eks update-kubeconfig --name <cluster>  # Update kubeconfig
aws ec2 describe-instances             # List EC2 instances
eksctl get cluster                     # Get cluster info
```

### System
```bash
sudo systemctl status <service>        # Check service status
sudo systemctl restart <service>       # Restart service
sudo journalctl -u <service> -f        # View service logs
df -h                                  # Check disk space
free -h                                # Check memory
top                                    # Monitor processes
```

---

## Project Structure

```
Compressorr/
├── backend/
│   ├── src/
│   │   ├── server.js              # Main server file
│   │   ├── routes/                # API routes
│   │   ├── controllers/           # Business logic
│   │   ├── models/                # MongoDB models
│   │   ├── middleware/            # Auth & validation
│   │   └── config/                # Configuration files
│   └── package.json
├── frontend/
│   ├── *.html                     # Frontend pages
│   ├── *.js                       # Client-side scripts
│   ├── styles.css                 # Styles
│   └── nginx.conf                 # Nginx configuration
├── Dockerfiles/
│   ├── backend.Dockerfile
│   ├── frontend.Dockerfile
│   └── nginx.conf
├── k8s/
│   ├── backend/                   # Backend K8s manifests
│   ├── frontend/                  # Frontend K8s manifests
│   ├── mongo/                     # MongoDB K8s manifests
│   └── monitoring/                # Prometheus & Grafana
├── monitoring/
│   ├── prometheus.yml
│   └── grafana-dashboards/
├── ansible/                       # Ansible playbooks
├── docker-compose.yml             # Docker Compose config
├── Jenkinsfile                    # CI/CD pipeline
├── sonar-project.properties       # SonarQube config
└── .env                           # Environment variables
```

---

## License

MIT

## Support

For issues and questions, please open an issue in the repository.
