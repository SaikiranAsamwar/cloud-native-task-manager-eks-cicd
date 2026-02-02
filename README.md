# Complete Deployment Guide for Python DevOps Project on Amazon Linux 2023

This guide provides a comprehensive, step-by-step walkthrough for deploying the entire Python DevOps application stack on Amazon Linux 2023.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [System Setup and Configuration](#system-setup-and-configuration)
3. [Installing Required Tools](#installing-required-tools)
4. [Backend Application Setup](#backend-application-setup)
5. [Frontend Application Setup](#frontend-application-setup)
6. [Database Setup](#database-setup)
7. [Docker and Docker Compose Deployment](#docker-and-docker-compose-deployment)
8. [Kubernetes Deployment](#kubernetes-deployment)
9. [Jenkins CI/CD Setup](#jenkins-cicd-setup)
10. [Monitoring with Prometheus and Grafana](#monitoring-with-prometheus-and-grafana)
11. [Troubleshooting](#troubleshooting)
12. [Verification and Testing](#verification-and-testing)

---

## Prerequisites

### Hardware Requirements
- **RAM**: Minimum 4GB (8GB recommended for smooth operation)
- **CPU**: 2 vCPUs minimum (4 vCPUs recommended)
- **Disk Space**: 50GB minimum
- **OS**: Amazon Linux 2023

### Network Requirements
- Internet connectivity for downloading packages and dependencies
- Open ports: 80 (HTTP), 443 (HTTPS), 5432 (PostgreSQL), 8080 (Jenkins), 9090 (Prometheus), 3000 (Grafana)

### AWS EC2 Instance Setup
1. Launch an EC2 instance with Amazon Linux 2023 AMI
2. Choose appropriate instance type (t3.medium or larger recommended)
3. Allocate 50GB EBS volume
4. Create/use security group with rules allowing ports mentioned above
5. Connect to instance via SSH

---

## System Setup and Configuration

### Step 1: Connect to Your EC2 Instance

```bash
ssh -i your-key.pem ec2-user@your-instance-ip
```

Replace `your-key.pem` with your actual key file and `your-instance-ip` with your instance IP address.

### Step 2: Update System Packages

After connecting, update all system packages to ensure you have the latest patches and security updates:

```bash
sudo yum update -y
```

This command will:
- Download package lists from configured repositories
- Check for updates for all installed packages
- Install all available updates
- The `-y` flag automatically confirms the operation

### Step 3: Install Essential Build Tools

Install the necessary build tools that will be needed for compiling Python packages and other dependencies:

```bash
sudo yum groupinstall "Development Tools" -y
```

Additionally, install some individual essential packages:

```bash
sudo yum install -y \
  gcc \
  gcc-c++ \
  make \
  kernel-devel \
  openssl-devel \
  bzip2-devel \
  libffi-devel \
  zlib-devel \
  wget \
  curl \
  git \
  vim
```

### Step 4: Configure System Limits (For Production)

Edit the system limits configuration file:

```bash
sudo nano /etc/security/limits.conf
```

Add the following lines at the end of the file:

```
* soft nofile 65536
* hard nofile 65536
* soft nproc 65536
* hard nproc 65536
```

Save the file (Ctrl+X, then Y, then Enter).

### Step 5: Create Application User

Create a dedicated user for running the application:

```bash
sudo useradd -m -s /bin/bash appuser
```

This creates a user named `appuser` with:
- `-m`: Creates home directory
- `-s /bin/bash`: Sets shell to bash

Switch to this user:

```bash
sudo su - appuser
```

---

## Installing Required Tools

### Step 1: Install Python 3.11

Amazon Linux 2023 comes with Python 3, but let's ensure we have the latest stable version:

```bash
sudo yum install -y python3.11 python3.11-devel
```

Create a symbolic link to make Python 3.11 the default:

```bash
sudo alternatives --install /usr/bin/python3 python3 /usr/bin/python3.11 1
```

Verify Python installation:

```bash
python3 --version
pip3 --version
```

Both should return version information.

### Step 2: Install pip and Virtual Environment Tools

pip should come with Python, but let's ensure it's updated:

```bash
sudo python3 -m pip install --upgrade pip
```

Install virtualenv for creating isolated Python environments:

```bash
sudo python3 -m pip install virtualenv
```

Verify the installation:

```bash
virtualenv --version
```

### Step 3: Install Docker

Docker is essential for containerizing our application.

Add Docker repository:

```bash
sudo yum install -y amazon-linux-extras
```

Install Docker:

```bash
sudo yum install -y docker
```

Start and enable Docker service:

```bash
sudo systemctl start docker
sudo systemctl enable docker
```

Add your user to the docker group to run Docker without sudo:

```bash
sudo usermod -a -G docker ec2-user
sudo usermod -a -G docker appuser
```

Apply the new group membership:

```bash
newgrp docker
```

Verify Docker installation:

```bash
docker --version
docker run hello-world
```

### Step 4: Install Docker Compose

Docker Compose allows us to define and run multi-container Docker applications.

Download the latest Docker Compose binary:

```bash
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
```

Make it executable:

```bash
sudo chmod +x /usr/local/bin/docker-compose
```

Verify installation:

```bash
docker-compose --version
```

### Step 5: Install Git

Git is likely already installed, but ensure it's the latest version:

```bash
sudo yum install -y git
```

Configure Git (replace with your information):

```bash
git config --global user.name "SaikiranAsamwar"
git config --global user.email "saikiranasamwar@gmail.com"
```

Verify Git installation:

```bash
git --version
```

### Step 6: Install PostgreSQL Client

Although the database runs in a container, installing the client tools helps with debugging:

```bash
sudo yum install -y postgresql
```

Verify installation:

```bash
psql --version
```

### Step 7: Install kubectl (For Kubernetes)

Download kubectl binary:

```bash
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
```

Make it executable and move to PATH:

```bash
chmod +x kubectl
sudo mv kubectl /usr/local/bin/
```

Verify installation:

```bash
kubectl version --client
```

### Step 8: Install Minikube or Kind (For Local Kubernetes Testing)

For testing Kubernetes manifests locally, install Minikube:

```bash
curl -minikube https://github.com/kubernetes/minikube/releases/latest/download/minikube-linux-amd64
chmod +x minikube
sudo mv minikube /usr/local/bin/
```

Verify installation:

```bash
minikube version
```

### Step 9: Install Java (For Jenkins)

Jenkins requires Java to run:

```bash
sudo yum install -y java-17-amazon-corretto-jdk
```

Verify Java installation:

```bash
java -version
javac -version
```

### Step 10: Install Jenkins

Add the Jenkins repository:

```bash
sudo wget -O /etc/yum.repos.d/jenkins.repo https://pkg.jenkins.io/redhat-stable/jenkins.repo
```

Import Jenkins GPG key:

```bash
sudo rpm --import https://pkg.jenkins.io/redhat-stable/jenkins.io.key
```

Install Jenkins:

```bash
sudo yum install -y jenkins
```

Start and enable Jenkins service:

```bash
sudo systemctl start jenkins
sudo systemctl enable jenkins
```

Verify Jenkins is running:

```bash
sudo systemctl status jenkins
```

---

## Backend Application Setup

### Step 1: Clone the Repository

Create a directory for the project:

```bash
mkdir -p ~/projects
cd ~/projects
```

Clone your repository (replace with your actual repository URL):

```bash
git clone https://github.com/your-username/Python-DevOps.git
cd Python-DevOps
```

If using local code, copy it to the directory instead.

### Step 2: Create Python Virtual Environment

Navigate to the backend directory:

```bash
cd backend
```

Create a virtual environment:

```bash
python3 -m venv venv
```

Activate the virtual environment:

```bash
source venv/bin/activate
```

You should see `(venv)` prefix in your terminal prompt.

### Step 3: Install Python Dependencies

Ensure you're in the backend directory with the virtual environment activated.

Upgrade pip, setuptools, and wheel:

```bash
pip install --upgrade pip setuptools wheel
```

Install dependencies from requirements.txt:

```bash
pip install -r requirements.txt
```

This command reads the requirements.txt file and installs all specified Python packages with their specified versions.

To verify all packages are installed:

```bash
pip list
```

### Step 4: Review Backend Configuration

Examine the configuration file:

```bash
cat config.py
```

Key configuration parameters typically include:
- `SQLALCHEMY_DATABASE_URI`: Database connection string
- `SECRET_KEY`: Application secret key
- `DEBUG`: Debug mode flag
- `FLASK_ENV`: Environment type (development/production)

### Step 5: Examine Application Structure

Review the main application files:

```bash
cat run.py          # Main entry point
cat app/__init__.py # Application factory
cat app/models.py   # Database models
cat app/routes.py   # API routes
cat utils.py        # Utility functions
```

### Step 6: Test Backend Locally (Optional)

To test the backend without Docker:

```bash
python run.py
```

This should start the Flask development server. By default, it runs on http://localhost:5000

To stop the server: Press Ctrl+C

Verify it's running:

```bash
curl http://localhost:5000
```

---

## Frontend Application Setup

### Step 1: Check Node.js Installation (Optional)

If your frontend uses Node.js/npm:

```bash
curl -sL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs
```

Verify installation:

```bash
node --version
npm --version
```

### Step 2: Navigate to Frontend Directory

```bash
cd ../frontend
```

### Step 3: Review Frontend Files

Check the structure of your frontend:

```bash
ls -la
cat nginx.conf
```

The nginx.conf file contains web server configuration for serving static files.

### Step 4: Build Frontend (If Required)

If there's a build process (check for package.json):

```bash
npm install
npm run build
```

If no build process, frontend files are already ready to serve.

---

## Database Setup

### Step 1: Create PostgreSQL Data Directory

Create a directory for PostgreSQL data persistence:

```bash
mkdir -p ~/data/postgres
```

### Step 2: Review Database Configuration

Check the Kubernetes PostgreSQL manifest:

```bash
cat ../k8s/postgres-deployment.yaml
```

Note the:
- Database name
- Username
- Password requirements
- Storage configuration

### Step 3: Environment Variables Setup

Create a .env file for sensitive information:

```bash
cd ~/projects/Python-DevOps
cat > .env << EOF
# Database Configuration
DB_NAME=appdb
DB_USER=appuser
DB_PASSWORD=your-secure-password-here
DB_HOST=localhost
DB_PORT=5432

# Flask Configuration
FLASK_ENV=production
SECRET_KEY=your-secret-key-here

# Other configurations
LOG_LEVEL=INFO
EOF
```

Secure the .env file:

```bash
chmod 600 .env
```

### Step 4: Create Database Initialization Script

Create a script to initialize the database:

```bash
cat > init-db.sh << 'EOF'
#!/bin/bash
set -e

echo "Waiting for PostgreSQL to be ready..."
for i in {1..30}; do
  if psql -h $DB_HOST -U $DB_USER -d postgres -c "SELECT 1" > /dev/null 2>&1; then
    echo "PostgreSQL is ready!"
    break
  fi
  echo "Attempt $i failed. Retrying..."
  sleep 2
done

echo "Creating database..."
psql -h $DB_HOST -U $DB_USER -d postgres -c "CREATE DATABASE $DB_NAME;" || echo "Database already exists"

echo "Running migrations..."
cd backend
source venv/bin/activate
python run.py

echo "Database initialization complete!"
EOF

chmod +x init-db.sh
```

---

## Docker and Docker Compose Deployment

### Step 1: Review Docker Compose Configuration

```bash
cat docker-compose.yml
```

This file defines all services:
- Backend service
- Frontend service
- PostgreSQL service
- Any other services

### Step 2: Build Docker Images

Ensure you're in the project root directory:

```bash
cd ~/projects/Python-DevOps
```

Build all images defined in docker-compose.yml:

```bash
docker-compose build
```

This process will:
- Read the docker-compose.yml file
- Build each service's image using its Dockerfile
- Tag images appropriately
- Store images in local Docker registry

Monitor the build output for any errors. Typical output should show:
```
Building backend
Building frontend
...
Successfully built [image-id]
```

### Step 3: Start Services with Docker Compose

Start all services in the background:

```bash
docker-compose up -d
```

The `-d` flag runs services in detached mode (background).

### Step 4: Verify Services are Running

Check the status of all services:

```bash
docker-compose ps
```

Output should show all services with status "Up X seconds/minutes".

### Step 5: Check Service Logs

View logs from all services:

```bash
docker-compose logs -f
```

View logs from a specific service:

```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

The `-f` flag follows log output (like `tail -f`).

### Step 6: Test Backend Service

```bash
curl http://localhost:5000/
```

Should return a response from your Flask application.

### Step 7: Test Frontend Service

Open a browser and navigate to:

```
http://your-instance-ip
```

Should display your frontend application.

### Step 8: Test Database Connection

Verify PostgreSQL is accessible:

```bash
docker-compose exec postgres psql -U appuser -d appdb -c "SELECT version();"
```

This command executes a SQL query in the PostgreSQL container.

### Step 9: Stop Services

When needed, stop all services:

```bash
docker-compose down
```

Remove volumes (data) as well:

```bash
docker-compose down -v
```

---

## Kubernetes Deployment

### Step 1: Start Kubernetes Cluster

If using Minikube:

```bash
minikube start --cpus=2 --memory=4096
```

Configure kubectl to use Minikube:

```bash
minikube config set vm-driver docker
```

### Step 2: Create Namespace

Kubernetes uses namespaces to organize resources:

```bash
kubectl create namespace devops-app
```

Verify namespace creation:

```bash
kubectl get namespaces
```

### Step 3: Review Kubernetes Manifests

Check all manifest files:

```bash
ls k8s/
cat k8s/namespace.yaml
cat k8s/secrets.yaml
cat k8s/postgres-pvc.yaml
cat k8s/postgres-deployment.yaml
cat k8s/backend-deployment.yaml
cat k8s/frontend-deployment.yaml
cat k8s/ingress.yaml
```

### Step 4: Create Secrets

Create Kubernetes secrets for sensitive data:

```bash
kubectl apply -f k8s/secrets.yaml -n devops-app
```

Verify secrets creation:

```bash
kubectl get secrets -n devops-app
```

### Step 5: Create Storage Resources

Create PersistentVolumeClaim for PostgreSQL data:

```bash
kubectl apply -f k8s/postgres-pvc.yaml -n devops-app
```

Verify PVC creation:

```bash
kubectl get pvc -n devops-app
```

### Step 6: Deploy PostgreSQL

```bash
kubectl apply -f k8s/postgres-deployment.yaml -n devops-app
```

Wait for PostgreSQL pod to be ready:

```bash
kubectl wait --for=condition=ready pod -l app=postgres -n devops-app --timeout=300s
```

Verify PostgreSQL deployment:

```bash
kubectl get pods -n devops-app -l app=postgres
kubectl get svc -n devops-app
```

### Step 7: Deploy Backend Application

```bash
kubectl apply -f k8s/backend-deployment.yaml -n devops-app
```

Wait for backend pods to be ready:

```bash
kubectl wait --for=condition=ready pod -l app=backend -n devops-app --timeout=300s
```

Verify backend deployment:

```bash
kubectl get pods -n devops-app -l app=backend
kubectl get svc -n devops-app -l app=backend
```

Check backend logs:

```bash
kubectl logs -f deployment/backend -n devops-app
```

### Step 8: Deploy Frontend Application

```bash
kubectl apply -f k8s/frontend-deployment.yaml -n devops-app
```

Wait for frontend pods to be ready:

```bash
kubectl wait --for=condition=ready pod -l app=frontend -n devops-app --timeout=300s
```

Verify frontend deployment:

```bash
kubectl get pods -n devops-app -l app=frontend
kubectl get svc -n devops-app -l app=frontend
```

Check frontend logs:

```bash
kubectl logs -f deployment/frontend -n devops-app
```

### Step 9: Configure Ingress

Apply Ingress configuration:

```bash
kubectl apply -f k8s/ingress.yaml -n devops-app
```

Verify Ingress creation:

```bash
kubectl get ingress -n devops-app
```

For Minikube, get the Ingress IP:

```bash
minikube service -n devops-app frontend --url
```

### Step 10: Verify All Deployments

Check all resources in the namespace:

```bash
kubectl get all -n devops-app
```

This shows:
- Pods (containers running)
- Services (load balancers)
- Deployments (desired state)
- StatefulSets (if applicable)
- ReplicaSets (pod replicas)

### Step 11: Port Forward for Testing (Local Testing)

Test backend through port forwarding:

```bash
kubectl port-forward -n devops-app svc/backend 5000:5000 &
curl http://localhost:5000
```

Test frontend through port forwarding:

```bash
kubectl port-forward -n devops-app svc/frontend 80:80 &
curl http://localhost
```

---

## Jenkins CI/CD Setup

### Step 1: Access Jenkins Dashboard

Get Jenkins initial admin password:

```bash
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

Copy this password.

Open browser and navigate to:

```
http://your-instance-ip:8080
```

### Step 2: Complete Jenkins Setup

1. Paste the initial admin password
2. Click "Continue"
3. Choose "Install suggested plugins"
4. Wait for plugin installation to complete
5. Create first admin user:
   - Username: admin
   - Password: (choose strong password)
   - Full name: Administrator
   - Email: your-email@example.com
6. Click "Save and Continue"
7. Configure Jenkins URL (use your instance IP)
8. Click "Save and Finish"

### Step 3: Configure Jenkins Credentials

1. Navigate to Jenkins Dashboard
2. Click "Manage Jenkins" → "Manage Credentials"
3. Click on "global" store
4. Click "Add Credentials"
5. Add your credentials:
   - SSH key (for Git access)
   - Docker Hub credentials (for pushing images)
   - AWS credentials (if deploying to AWS)

### Step 4: Create Pipeline Job

1. Click "New Item"
2. Enter job name (e.g., "Python-DevOps-Pipeline")
3. Select "Pipeline"
4. Click "OK"

### Step 5: Configure Pipeline Script

In the Pipeline section, add the Jenkinsfile from your repository:

```groovy
// Jenkinsfile content
pipeline {
    agent any
    
    stages {
        stage('Checkout') {
            steps {
                git 'https://github.com/your-username/Python-DevOps.git'
            }
        }
        
        stage('Build') {
            steps {
                sh '''
                    docker-compose build
                '''
            }
        }
        
        stage('Test') {
            steps {
                sh '''
                    docker-compose run backend pytest
                '''
            }
        }
        
        stage('Push') {
            steps {
                sh '''
                    docker tag backend:latest your-registry/backend:latest
                    docker push your-registry/backend:latest
                '''
            }
        }
        
        stage('Deploy') {
            steps {
                sh '''
                    kubectl apply -f k8s/
                '''
            }
        }
    }
}
```

### Step 6: Configure Webhook (Optional)

For automatic builds on Git push:

1. Go to your GitHub repository settings
2. Click "Webhooks"
3. Click "Add webhook"
4. Payload URL: `http://your-instance-ip:8080/github-webhook/`
5. Content type: `application/json`
6. Events: Push events
7. Active: Yes
8. Click "Add webhook"

### Step 7: Run First Build

1. Click "Build Now" in Jenkins job
2. Monitor build progress in "Console Output"
3. Check build results

Monitor logs:

```bash
tail -f /var/log/jenkins/jenkins.log
```

---

## Monitoring with Prometheus and Grafana

### Step 1: Review Monitoring Configuration

Check Prometheus configuration:

```bash
cat monitoring/prometheus-config.yaml
```

Check Grafana configuration:

```bash
cat monitoring/grafana-deployment.yaml
cat monitoring/grafana-dashboard.json
```

### Step 2: Deploy Prometheus

If using Kubernetes:

```bash
kubectl apply -f monitoring/prometheus-rbac.yaml
kubectl apply -f monitoring/prometheus-deployment.yaml
```

For Docker Compose, add to docker-compose.yml or run:

```bash
docker run -d \
  --name prometheus \
  -p 9090:9090 \
  -v ~/projects/Python-DevOps/monitoring/prometheus-config.yaml:/etc/prometheus/prometheus.yml \
  prom/prometheus:latest
```

Verify Prometheus is running:

```bash
curl http://localhost:9090
```

Access Prometheus dashboard:

```
http://your-instance-ip:9090
```

### Step 3: Deploy Grafana

If using Kubernetes:

```bash
kubectl apply -f monitoring/grafana-datasource.yaml
kubectl apply -f monitoring/grafana-deployment.yaml
kubectl apply -f monitoring/grafana-dashboard-config.yaml
```

For Docker Compose:

```bash
docker run -d \
  --name grafana \
  -p 3000:3000 \
  -e GF_SECURITY_ADMIN_PASSWORD=admin \
  grafana/grafana:latest
```

Access Grafana dashboard:

```
http://your-instance-ip:3000
```

Default credentials:
- Username: admin
- Password: admin (change on first login)

### Step 4: Configure Data Source in Grafana

1. Navigate to Grafana
2. Click "Configuration" → "Data Sources"
3. Click "Add data source"
4. Select "Prometheus"
5. Configure URL: `http://prometheus:9090`
6. Click "Save & Test"

### Step 5: Import Grafana Dashboard

1. Click "+" → "Import"
2. Upload the dashboard JSON file: `monitoring/grafana-dashboard.json`
3. Select Prometheus data source
4. Click "Import"

### Step 6: View Metrics

Monitor application performance:

1. Check available metrics in Prometheus dashboard
2. View dashboards in Grafana
3. Set up alerts for critical metrics

Example metrics to monitor:
- CPU usage
- Memory usage
- Request latency
- Error rates
- Database connection pool status

---

## Troubleshooting

### Issue: Docker Services Won't Start

**Problem**: `docker-compose up` fails or services don't start.

**Solution**:

1. Check Docker daemon status:
   ```bash
   sudo systemctl status docker
   ```

2. Start Docker if stopped:
   ```bash
   sudo systemctl start docker
   ```

3. Check Docker Compose syntax:
   ```bash
   docker-compose config
   ```

4. View detailed error logs:
   ```bash
   docker-compose logs
   ```

### Issue: PostgreSQL Connection Refused

**Problem**: Cannot connect to PostgreSQL database.

**Solution**:

1. Check if PostgreSQL container is running:
   ```bash
   docker-compose ps postgres
   ```

2. Wait for PostgreSQL to initialize (30-60 seconds):
   ```bash
   docker-compose logs postgres
   ```

3. Verify connection string in backend config:
   ```bash
   cat backend/config.py
   ```

4. Test connection manually:
   ```bash
   docker-compose exec postgres psql -U appuser -d appdb -c "SELECT 1;"
   ```

### Issue: Port Already in Use

**Problem**: `bind: address already in use` error.

**Solution**:

1. Find process using the port:
   ```bash
   sudo lsof -i :5000  # For port 5000
   sudo lsof -i :80    # For port 80
   ```

2. Kill the process:
   ```bash
   sudo kill -9 <PID>
   ```

3. Or change the port in docker-compose.yml:
   ```yaml
   ports:
     - "5001:5000"  # Use 5001 instead of 5000
   ```

### Issue: Kubernetes Pod Crashes

**Problem**: Pods are in CrashLoopBackOff state.

**Solution**:

1. Check pod status:
   ```bash
   kubectl get pods -n devops-app
   kubectl describe pod <pod-name> -n devops-app
   ```

2. View pod logs:
   ```bash
   kubectl logs <pod-name> -n devops-app
   kubectl logs <pod-name> -n devops-app --previous
   ```

3. Check resource limits:
   ```bash
   kubectl describe node
   ```

4. Check if secrets exist:
   ```bash
   kubectl get secrets -n devops-app
   ```

### Issue: Backend Application Won't Start

**Problem**: Backend fails to start with Python errors.

**Solution**:

1. Check Python dependencies:
   ```bash
   cd backend
   source venv/bin/activate
   pip install -r requirements.txt
   ```

2. Verify Python version:
   ```bash
   python --version
   ```

3. Check for missing environment variables:
   ```bash
   cat backend/config.py
   ```

4. Run migrations if needed:
   ```bash
   cd backend
   python run.py db upgrade
   ```

### Issue: Frontend Not Loading

**Problem**: Frontend shows 404 or blank page.

**Solution**:

1. Check if frontend service is running:
   ```bash
   docker-compose ps frontend
   curl http://localhost
   ```

2. Check nginx configuration:
   ```bash
   docker-compose exec frontend nginx -t
   ```

3. Verify static files are in correct location:
   ```bash
   docker-compose exec frontend ls -la /usr/share/nginx/html
   ```

4. Check frontend logs:
   ```bash
   docker-compose logs frontend
   ```

### Issue: Jenkins Build Fails

**Problem**: Jenkins pipeline jobs are failing.

**Solution**:

1. Check Jenkins logs:
   ```bash
   sudo tail -f /var/log/jenkins/jenkins.log
   ```

2. Check if Docker is accessible from Jenkins:
   ```bash
   docker ps
   ```

3. Verify Jenkins has permissions:
   ```bash
   sudo usermod -a -G docker jenkins
   sudo systemctl restart jenkins
   ```

4. Check Git credentials:
   - Jenkins Dashboard → Manage Credentials
   - Verify SSH keys or tokens are correct

5. Check build console output:
   - Click on failed build
   - Click "Console Output"
   - Look for error messages

### Issue: High Memory Usage

**Problem**: System running out of memory.

**Solution**:

1. Check memory usage:
   ```bash
   free -h
   ```

2. Stop unnecessary services:
   ```bash
   docker-compose stop jenkins  # If not needed
   ```

3. Remove unused Docker resources:
   ```bash
   docker system prune -a
   ```

4. Increase swap space:
   ```bash
   sudo dd if=/dev/zero of=/swapfile bs=1G count=2
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile
   ```

### Issue: SSL Certificate Errors

**Problem**: HTTPS/SSL certificate issues.

**Solution**:

1. Install Certbot for Let's Encrypt:
   ```bash
   sudo yum install -y certbot python3-certbot-nginx
   ```

2. Generate certificate:
   ```bash
   sudo certbot certonly --standalone -d your-domain.com
   ```

3. Update nginx configuration with certificate paths

4. Enable auto-renewal:
   ```bash
   sudo systemctl enable certbot-renew.timer
   sudo systemctl start certbot-renew.timer
   ```

---

## Verification and Testing

### Step 1: Verify All Services Are Running

```bash
# Docker Compose
docker-compose ps

# Kubernetes
kubectl get all -n devops-app

# System services
sudo systemctl status docker
sudo systemctl status jenkins
```

### Step 2: Test Backend API

Test basic endpoint:

```bash
curl http://localhost:5000/
```

Test specific routes (adjust based on your API):

```bash
curl http://localhost:5000/api/users
curl http://localhost:5000/api/health
```

### Step 3: Test Frontend

Open browser and verify:

```
http://your-instance-ip
```

Ensure:
- Page loads without errors
- Static assets load (CSS, JavaScript)
- Can navigate through pages
- Forms work correctly

### Step 4: Test Database Connectivity

```bash
# Through Docker Compose
docker-compose exec postgres psql -U appuser -d appdb -c "SELECT COUNT(*) FROM information_schema.tables;"

# Through Kubernetes
kubectl exec -it -n devops-app <postgres-pod-name> -- psql -U appuser -d appdb -c "\dt"
```

### Step 5: Test End-to-End Flow

1. Log in to frontend (if authentication required)
2. Perform a database operation (create, read, update, delete)
3. Verify data is persisted in database
4. Check logs for errors

### Step 6: Performance Testing

Load test the backend:

```bash
# Install Apache Bench
sudo yum install -y httpd-tools

# Run load test
ab -n 1000 -c 10 http://localhost:5000/
```

Monitor performance:

```bash
# Check system resources during test
top
free -h
iostat -x 1
```

### Step 7: Health Check Endpoints

Verify application health endpoints:

```bash
curl -v http://localhost:5000/health
curl -v http://localhost:5000/api/status
```

### Step 8: Security Verification

Verify security headers:

```bash
curl -I http://localhost:5000
```

Look for:
- X-Frame-Options
- X-Content-Type-Options
- Content-Security-Policy
- Strict-Transport-Security

### Step 9: Log Verification

Check for error messages in logs:

```bash
# Docker Compose
docker-compose logs | grep -i error

# Kubernetes
kubectl logs -n devops-app --all-containers --tail=100
```

### Step 10: Monitoring Verification

Verify metrics collection:

1. Prometheus Dashboard: http://your-instance-ip:9090
   - Check "Targets" section
   - Verify all endpoints are "UP"

2. Grafana Dashboard: http://your-instance-ip:3000
   - View configured dashboards
   - Check metric values updating in real-time

---

## Maintenance and Best Practices

### Regular Backups

Backup database regularly:

```bash
docker-compose exec postgres pg_dump -U appuser appdb > backup_$(date +%Y%m%d_%H%M%S).sql
```

Backup volumes:

```bash
docker-compose down
tar -czf docker_volumes_backup_$(date +%Y%m%d_%H%M%S).tar.gz /var/lib/docker/volumes/
docker-compose up -d
```

### Update Dependencies

Update Python packages periodically:

```bash
cd backend
source venv/bin/activate
pip install --upgrade pip
pip list --outdated
pip install --upgrade <package-name>
```

Update system packages:

```bash
sudo yum update -y
```

### Monitor Disk Space

Check disk usage:

```bash
df -h
du -sh /var/lib/docker/
```

Clean up Docker:

```bash
docker system prune -a --volumes
```

### Security Hardening

1. Keep systems updated
2. Use strong passwords
3. Implement firewall rules
4. Use SSH keys instead of passwords
5. Enable audit logging
6. Regularly scan for vulnerabilities
7. Use secrets management (AWS Secrets Manager, HashiCorp Vault)

### Scaling Considerations

For production scaling:

1. Use Kubernetes for orchestration
2. Implement horizontal pod autoscaling:

```bash
kubectl autoscale deployment backend -n devops-app --min=2 --max=5
```

3. Use managed databases instead of containers
4. Implement caching (Redis)
5. Use CDN for static content
6. Load balance traffic (ELB/ALB)

---

## Quick Reference Commands

```bash
# Docker Compose Commands
docker-compose up -d              # Start all services
docker-compose down               # Stop all services
docker-compose logs -f            # View logs
docker-compose ps                 # List services
docker-compose exec <service> bash # Access service

# Kubernetes Commands
kubectl get all -n devops-app     # List all resources
kubectl logs <pod> -n devops-app  # View pod logs
kubectl describe pod <pod> -n devops-app # Detailed pod info
kubectl port-forward <pod> 8000:5000 # Port forwarding
kubectl apply -f <file>           # Apply manifest
kubectl delete -f <file>          # Delete resource

# Useful Docker Commands
docker ps                         # List running containers
docker images                     # List images
docker build -t name:tag .        # Build image
docker push registry/name:tag     # Push image
docker inspect <container>        # Get container details

# System Commands
top                              # Monitor processes
free -h                          # Check memory
df -h                            # Check disk space
sudo systemctl status <service>  # Check service status
sudo journalctl -u <service> -f  # View service logs
```

---

## Support and Documentation

For more information, refer to:

- [Docker Documentation](https://docs.docker.com)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Jenkins Documentation](https://www.jenkins.io/doc/)
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)

---

## Conclusion

You now have a complete deployment setup for your Python DevOps application on Amazon Linux 2023. Follow these steps carefully, and your application should be running smoothly with proper monitoring, CI/CD, and containerization in place.

For troubleshooting and advanced configurations, refer to the individual tool documentation and the troubleshooting section above.

---

**Last Updated**: February 2, 2026
**Version**: 1.0
**Maintainer**: DevOps Team
