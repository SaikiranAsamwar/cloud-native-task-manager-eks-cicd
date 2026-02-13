# Task Manager — Production-Ready DevOps Project

A **professional-grade** Flask + PostgreSQL task management application with complete CI/CD, Kubernetes orchestration, and monitoring. Designed for portfolio demonstration and real-world deployment scenarios.

## 🎯 Project Overview

| Component | Technology | Port |
|-----------|-----------|------|
| **Backend API** | Flask + Gunicorn + SQLAlchemy | 8888 |
| **Frontend** | Nginx (static + reverse proxy) | 80 |
| **Database** | PostgreSQL 15 | 5432 |
| **Orchestration** | Docker Compose / Kubernetes (EKS) | - |
| **CI/CD** | Jenkins (declarative pipeline) | 8080 |
| **Monitoring** | Prometheus + Grafana | 9090/3000 |
| **Code Quality** | SonarQube | 9000 |

## ✅ Deployment Readiness Status

**Status:** ✅ **Production-Ready** (with configuration adjustments)

- ✅ Dockerized backend and frontend with multi-stage builds
- ✅ Kubernetes manifests with health checks, resource limits, and security contexts
- ✅ CI/CD pipeline with automated build, test, and deployment
- ✅ Monitoring stack with Prometheus and Grafana
- ✅ Database persistence via PVCs
- ⚠️ **Action Required:** Update secrets before production deployment (see [Security Checklist](#security-and-best-practice-checklist))

---

## 📋 Table of Contents

### Infrastructure Setup
1. [EC2 Instance Setup (Amazon Linux 2023)](#1-ec2-instance-setup-amazon-linux-2023)
2. [Basic Dependencies Installation](#2-basic-dependencies-installation)
3. [Docker and Docker Compose Installation](#3-docker-and-docker-compose-installation)
4. [AWS CLI Installation and Configuration](#4-aws-cli-installation-and-configuration)
5. [Git Installation and Setup](#5-git-installation-and-setup)
6. [EKS Cluster Setup (eksctl & kubectl)](#6-eks-cluster-setup-eksctl--kubectl)
7. [Java Installation](#7-java-installation)
8. [PostgreSQL Installation (Standalone)](#8-postgresql-installation-standalone)
9. [Jenkins Installation and Configuration](#9-jenkins-installation-and-configuration)
10. [SonarQube Installation and Setup](#10-sonarqube-installation-and-setup)
11. [Prometheus and Grafana Installation](#11-prometheus-and-grafana-installation)

### Deployment and Operations
12. [Application Deployment](#12-application-deployment)
13. [Testing and Validation](#13-testing-and-validation)

### Cleanup and Troubleshooting
14. [Infrastructure Destruction](#14-infrastructure-destruction)
15. [Common Errors and Debugging](#15-common-errors-and-debugging)
16. [Security and Best Practice Checklist](#security-and-best-practice-checklist)

---

## 1. EC2 Instance Setup (Amazon Linux 2023)

**Launch EC2 Instance:**
- AMI: Amazon Linux 2023
- Instance type: t3.large (2 vCPU, 8GB RAM)
- Storage: 30-50 GiB gp3 SSD
- Security Group: Allow ports 22 (SSH - your IP only), 80 (HTTP), 443 (HTTPS)

**Connect to Instance:**
```bash
chmod 400 /path/to/your-key.pem
ssh -i /path/to/your-key.pem ec2-user@<EC2_PUBLIC_IP>
```

---

## 2. Basic Dependencies Installation

```bash
# Update system
sudo dnf -y update

# Install essential utilities
sudo dnf -y install git curl wget unzip vim htop net-tools jq python3 python3-pip

# Enable time synchronization
sudo systemctl enable --now chronyd

# Verify installations
git --version
python3 --version
```

---

## 3. Docker and Docker Compose Installation

```bash
# Install Docker
sudo dnf -y install docker

# Start and enable Docker
sudo systemctl enable --now docker

# Add user to docker group
sudo usermod -aG docker ec2-user
newgrp docker

# Verify Docker
docker --version
docker run --rm hello-world

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
docker-compose --version
```

---

## 4. AWS CLI Installation and Configuration

```bash
# Download and install AWS CLI v2
cd /tmp
curl -fsSL "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o awscliv2.zip
unzip -q awscliv2.zip
sudo ./aws/install
aws --version

# Configure AWS credentials
aws configure
# Enter: Access Key ID, Secret Access Key, Region (us-east-1), Output format (json)

# Verify configuration
aws sts get-caller-identity
```

---

## 5. Git Installation and Setup

```bash
# Install Git
sudo dnf -y install git
git --version

# Configure Git
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
git config --global init.defaultBranch main

# Clone project repository
cd ~
git clone https://github.com/<YOUR_USERNAME>/Python-DevOps.git
cd Python-DevOps
```

---

## 6. EKS Cluster Setup (eksctl & kubectl)

```bash
# Install kubectl
KUBECTL_VERSION=$(curl -fsSL https://dl.k8s.io/release/stable.txt)
cd /tmp
curl -fsSL "https://dl.k8s.io/release/${KUBECTL_VERSION}/bin/linux/amd64/kubectl" -o kubectl
chmod +x kubectl
sudo mv kubectl /usr/local/bin/
kubectl version --client

# Install eksctl
EKSCTL_VERSION="v0.171.0"
curl -fsSL "https://github.com/eksctl-io/eksctl/releases/download/${EKSCTL_VERSION}/eksctl_Linux_amd64.tar.gz" -o eksctl.tar.gz
tar -xzf eksctl.tar.gz
sudo mv eksctl /usr/local/bin/
eksctl version

# Create EKS cluster
eksctl create cluster \
  --name taskmanager-eks \
  --region us-east-1 \
  --nodes 2 \
  --node-type t3.medium \
  --managed \
  --version 1.29

# Update kubeconfig
aws eks update-kubeconfig --name taskmanager-eks --region us-east-1

# Verify cluster
kubectl get nodes
kubectl create namespace taskmanager
kubectl create namespace monitoring
```

---

## 7. Java Installation

```bash
# Install Java 17 (required for Jenkins and SonarQube)
sudo dnf -y install java-17-amazon-corretto-devel

# Verify installation
java -version
javac -version

# Set JAVA_HOME
echo 'export JAVA_HOME=/usr/lib/jvm/java-17-amazon-corretto' >> ~/.bashrc
echo 'export PATH=$JAVA_HOME/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

---

## 8. PostgreSQL Installation (Standalone)

**Note:** For containerized deployment, PostgreSQL is included in docker-compose.yml and Kubernetes manifests. This section is optional for standalone installation.

```bash
# Install PostgreSQL 15
sudo dnf -y install postgresql15 postgresql15-server postgresql15-contrib

# Initialize and start
sudo postgresql-setup --initdb
sudo systemctl enable --now postgresql

# Create database and user
sudo -u postgres psql << 'EOF'
ALTER USER postgres WITH PASSWORD 'your_strong_password';
CREATE DATABASE taskmanager_db;
CREATE USER taskmanager WITH ENCRYPTED PASSWORD 'taskmanager_password';
GRANT ALL PRIVILEGES ON DATABASE taskmanager_db TO taskmanager;
\c taskmanager_db
GRANT ALL ON SCHEMA public TO taskmanager;
\q
EOF
```

---

## 9. Jenkins Installation and Configuration

✅ Docker
✅ kubectl
✅ eksctl
✅ AWS CLI
✅ Kubeconfig connected to EKS cluster

👉 We **do NOT install Docker / kubectl again**
👉 We only give Jenkins access to already installed tools

So your README Jenkins section must reflect:

> **Jenkins Controller = EKS Master Node (Single EC2 CI/CD Server)**

---

# ✅ FINAL UPDATED README SECTION

## 🔧 9. Jenkins Installation and Configuration (On Existing EKS Master EC2)

---

## 🖥️ 9.1 Pre-Requisites

Jenkins will be installed on the **same Master EC2** which already has:

* Docker Installed
* kubectl Installed
* eksctl Installed
* AWS CLI Installed
* IAM Role attached to access EKS Cluster
* kubeconfig configured using:

```bash
aws eks update-kubeconfig --region <region> --name <cluster-name>
```

Verify cluster access:

```bash
kubectl get nodes
```

---

## ⚙️ 9.2 Install Java (Required for Jenkins)

```bash
sudo dnf install java-17-amazon-corretto -y
java -version
```

---

## ⚙️ 9.3 Install Jenkins on Master EC2

```bash
sudo wget -O /etc/yum.repos.d/jenkins.repo \
https://pkg.jenkins.io/redhat-stable/jenkins.repo

sudo rpm --import https://pkg.jenkins.io/redhat-stable/jenkins.io-2023.key

sudo dnf install jenkins -y
```

Start Jenkins:

```bash
sudo systemctl enable jenkins
sudo systemctl start jenkins
```

Check status:

```bash
sudo systemctl status jenkins
```

---

## 🔓 9.4 Access Jenkins Dashboard

Open in browser:

```
http://<EC2_PUBLIC_IP>:8080
```

Get admin password:

```bash
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

Install:

```
Install Suggested Plugins
```

Create Admin User and complete setup.

---

## 🔑 9.5 Give Jenkins Access to Docker (Already Installed)

Since Docker is already installed on Master EC2:

Add Jenkins user to Docker group:

```bash
sudo usermod -aG docker jenkins
sudo chmod 666 /var/run/docker.sock
```

Restart services:

```bash
sudo systemctl restart docker
sudo systemctl restart jenkins
```

Verify:

```bash
sudo su - jenkins
docker ps
```

---

## ☸️ 9.6 Give Jenkins Access to Kubernetes Cluster

Copy kubeconfig to Jenkins home:

```bash
sudo mkdir -p /var/lib/jenkins/.kube
sudo cp ~/.kube/config /var/lib/jenkins/.kube/config
sudo chown -R jenkins:jenkins /var/lib/jenkins/.kube
```

Restart Jenkins:

```bash
sudo systemctl restart jenkins
```

Verify:

```bash
sudo su - jenkins
kubectl get nodes
```

---

## 📦 9.7 Install Required Jenkins Plugins

Navigate:

```
Manage Jenkins → Manage Plugins → Available Plugins
```

Install:

* Git
* Pipeline
* Docker Pipeline
* Kubernetes
* Kubernetes CLI
* Credentials Binding
* SonarQube Scanner
* Pipeline Stage View

Restart Jenkins after installation.

---

## 🔐 9.8 Configure Jenkins Credentials

Navigate:

```
Manage Jenkins → Manage Credentials → Global
```

---

### ➤ DockerHub Credentials

| Field    | Value                  |
| -------- | ---------------------- |
| Kind     | Username with password |
| ID       | dockerhub-credentials  |
| Username | DockerHub Username     |
| Password | DockerHub Access Token |

---

### ➤ SonarQube Token

| Field  | Value                 |
| ------ | --------------------- |
| Kind   | Secret Text           |
| ID     | sonarqube-token       |
| Secret | Generated Sonar Token |

---

## 📊 9.9 Configure SonarQube Server in Jenkins

Navigate:

```
Manage Jenkins → Configure System
```

Add SonarQube Server:

| Field | Value                      |
| ----- | -------------------------- |
| Name  | SonarQube                  |
| URL   | http://<SONARQUBE_IP>:9000 |
| Token | sonarqube-token            |

---

## 🚀 9.10 Create Jenkins Pipeline Job

```
Dashboard → New Item → Pipeline
```

Configure:

| Field         | Value                                                                                                                                  |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Pipeline Name | taskmanager-pipeline                                                                                                                   |
| Definition    | Pipeline Script from SCM                                                                                                               |
| SCM           | Git                                                                                                                                    |
| Repo URL      | [https://github.com/SaikiranAsamwar/Task-Manager-Python-DevOps.git](https://github.com/SaikiranAsamwar/Task-Manager-Python-DevOps.git) |
| Branch        | */main                                                                                                                                 |
| Script Path   | Jenkinsfile                                                                                                                            |

Click **Save**

---

## ▶️ 9.11 Run Pipeline

```
taskmanager-pipeline → Build Now
```

Pipeline will:

✔ Build Docker Images
✔ Push Images to DockerHub
✔ Deploy to EKS Cluster using kubectl
✔ Verify Running Pods

Check deployment:

```bash
kubectl get pods -n taskmanager
kubectl get svc -n taskmanager
```

---



## 10. SonarQube Installation and Setup

```bash
# Configure system limits for SonarQube
sudo tee -a /etc/sysctl.conf << EOF
vm.max_map_count=524288
fs.file-max=131072
EOF
sudo sysctl -p

# Create directories and run SonarQube
mkdir -p ~/sonarqube/{data,logs,extensions}
chmod 777 ~/sonarqube/{data,logs,extensions}

docker run -d \
  --name sonarqube \
  --restart=unless-stopped \
  -p 9000:9000 \
  -e SONAR_ES_BOOTSTRAP_CHECKS_DISABLE=true \
  -v ~/sonarqube/data:/opt/sonarqube/data \
  -v ~/sonarqube/logs:/opt/sonarqube/logs \
  -v ~/sonarqube/extensions:/opt/sonarqube/extensions \
  sonarqube:lts-community

# Access via SSH tunnel: ssh -i key.pem -L 9000:localhost:9000 ec2-user@<EC2_IP>
# Login at http://localhost:9000 (admin/admin), create project, generate token
# Configure in Jenkins: Manage Jenkins → Tools → Add SonarQube Scanner
```

---

## 11. Prometheus and Grafana Installation

```bash
# Create monitoring namespace
kubectl create namespace monitoring

# Deploy Prometheus
kubectl apply -f monitoring/prometheus-rbac.yaml
kubectl apply -f monitoring/prometheus-config.yaml
kubectl apply -f monitoring/prometheus-deployment.yaml
kubectl wait --for=condition=available --timeout=300s deployment/prometheus -n monitoring

# Access Prometheus: kubectl port-forward -n monitoring svc/prometheus 9090:9090

# Deploy Grafana
kubectl apply -f monitoring/grafana-datasource.yaml
kubectl apply -f monitoring/grafana-dashboard-config.yaml
kubectl apply -f monitoring/grafana-deployment.yaml
kubectl wait --for=condition=available --timeout=300s deployment/grafana -n monitoring

# Access Grafana: kubectl port-forward -n monitoring svc/grafana 3000:3000
# Login at http://localhost:3000 (admin/admin123) - change password after first login
# Import dashboards: Dashboards → Import → Use IDs: 315, 8588, 6417, 1860

# Verify
kubectl get pods -n monitoring
kubectl get svc -n monitoring
```

---

## 12. Application Deployment

**Docker Compose (EC2):**
```bash
cd ~/Python-DevOps
docker compose up -d --build

# Verify
docker compose ps
docker compose logs -f
curl -i http://localhost/
curl -i http://localhost/api/health
```

**Kubernetes (EKS):**
```bash
# Build and push images
docker login
docker build -t <YOUR_DOCKERHUB_USERNAME>/taskmanager-backend:v1.0 backend/
docker build -t <YOUR_DOCKERHUB_USERNAME>/taskmanager-frontend:v1.0 frontend/
docker push <YOUR_DOCKERHUB_USERNAME>/taskmanager-backend:v1.0
docker push <YOUR_DOCKERHUB_USERNAME>/taskmanager-frontend:v1.0

# Deploy to Kubernetes
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/postgres-pvc.yaml
kubectl apply -f k8s/postgres-deployment.yaml
kubectl wait --for=condition=available --timeout=300s deployment/postgres -n taskmanager
kubectl apply -f k8s/backend-deployment.yaml
kubectl wait --for=condition=available --timeout=300s deployment/backend -n taskmanager
kubectl apply -f k8s/frontend-deployment.yaml
kubectl wait --for=condition=available --timeout=300s deployment/frontend -n taskmanager

# Verify
kubectl get all -n taskmanager
kubectl get svc frontend -n taskmanager
curl http://<EXTERNAL-IP>/api/health
```

**Jenkins Pipeline:**
Navigate to Jenkins (http://localhost:8080) → taskmanager-pipeline → Build Now. Pipeline executes: checkout, SonarQube analysis, build, test, push, and Kubernetes deployment.

---

## 13. Testing and Validation

```bash
# Test frontend
curl -I http://<APPLICATION_URL>/
curl -I http://<APPLICATION_URL>/css/style.css

# Test backend API
curl -i http://<APPLICATION_URL>/api/health
curl -i http://<APPLICATION_URL>/api/ready

# Test database connectivity
docker compose exec backend python -c "from app import db; db.create_all(); print('Database connected')"
# For Kubernetes:
kubectl exec -n taskmanager deployment/backend -- python -c "from app import db; db.create_all(); print('Database connected')"

# Load testing (optional)
sudo dnf -y install httpd-tools
ab -n 100 -c 10 http://<APPLICATION_URL>/
```

---

## 14. Infrastructure Destruction

```bash
# Stop Docker Compose
cd ~/Python-DevOps
docker compose down -v

# Delete Kubernetes resources
kubectl delete -f k8s/frontend-deployment.yaml
kubectl delete -f k8s/backend-deployment.yaml
kubectl delete -f k8s/postgres-deployment.yaml
kubectl delete -f k8s/postgres-pvc.yaml
kubectl delete -f k8s/secrets.yaml
kubectl delete -f k8s/namespace.yaml

# Delete monitoring stack
kubectl delete -f monitoring/grafana-deployment.yaml
kubectl delete -f monitoring/grafana-dashboard-config.yaml
kubectl delete -f monitoring/grafana-datasource.yaml
kubectl delete -f monitoring/prometheus-deployment.yaml
kubectl delete -f monitoring/prometheus-config.yaml
kubectl delete -f monitoring/prometheus-rbac.yaml
kubectl delete namespace monitoring

# Delete EKS cluster
eksctl delete cluster --name taskmanager-eks --region us-east-1

# Stop Docker containers
docker stop jenkins sonarqube
docker rm jenkins sonarqube
docker system prune -a --volumes -f

# Terminate EC2 instance (via AWS Console or AWS CLI)
aws ec2 terminate-instances --instance-ids i-xxxxxxxxxxxxxxxxx
```

---

## 15. Common Errors and Debugging

**Docker Issues:**
```bash
# Check Docker service
sudo systemctl status docker
sudo systemctl start docker

# Fix permissions
sudo usermod -aG docker $USER
newgrp docker

# Find process on port
sudo netstat -tulpn | grep :80
sudo kill -9 <PID>

# Cleanup
docker system prune -a --volumes -f
```

**Kubernetes Issues:**
```bash
# Update kubeconfig
aws eks update-kubeconfig --name taskmanager-eks --region us-east-1

# Debug pods
kubectl get pods -n taskmanager
kubectl describe pod <POD_NAME> -n taskmanager
kubectl logs <POD_NAME> -n taskmanager
kubectl get events -n taskmanager --sort-by='.lastTimestamp'

# Check endpoints
kubectl get endpoints -n taskmanager
kubectl get svc -n taskmanager
```

**Application Issues:**
```bash
# Check logs
docker compose logs backend
kubectl logs -n taskmanager -l app=backend

# Test database
docker compose exec backend python -c "from app import db; print(db.engine.url)"
docker compose exec postgres pg_isready

# Check Nginx
docker compose exec frontend nginx -t
docker compose exec frontend curl -i http://backend:8888/api/health
```

**Jenkins/SonarQube Issues:**
```bash
# Jenkins logs
docker logs jenkins
docker restart jenkins

# SonarQube system limits
sudo sysctl -w vm.max_map_count=524288
docker restart sonarqube
docker logs sonarqube
```

---

## Security and Best Practice Checklist

### Pre-Production Security

- [ ] Change all default passwords (Grafana, PostgreSQL, SonarQube)
- [ ] Generate strong SECRET_KEY for Flask application
- [ ] Move secrets from YAML files to AWS Secrets Manager or Parameter Store
- [ ] Restrict Security Group rules (SSH to your IP only)
- [ ] Close admin ports (8080, 9000, 9090, 3000) to internet
- [ ] Enable HTTPS/TLS for all external endpoints
- [ ] Configure SSL certificates (Let's Encrypt or ACM)
- [ ] Set `SESSION_COOKIE_SECURE=True` in Flask config
- [ ] Enable MFA for AWS root account and IAM users
- [ ] Use IAM roles instead of access keys for EC2/EKS
- [ ] Enable AWS CloudTrail for audit logging
- [ ] Configure VPC Flow Logs
- [ ] Enable EKS control plane logging
- [ ] Scan Docker images for vulnerabilities (Trivy, Clair)
- [ ] Implement network policies in Kubernetes
- [ ] Use Pod Security Standards (restricted profile)
- [ ] Enable RBAC with least privilege principle
- [ ] Regularly update system packages and Docker images
- [ ] Configure backup strategy for databases and persistent volumes
- [ ] Set up disaster recovery plan
- [ ] Document runbooks for common incidents

### Operational Best Practices

- [ ] Implement proper logging and log aggregation
- [ ] Set up alerting for critical metrics
- [ ] Configure health checks for all services
- [ ] Implement auto-scaling policies
- [ ] Use Horizontal Pod Autoscaler (HPA) in Kubernetes
- [ ] Configure resource requests and limits
- [ ] Implement circuit breakers and retry logic
- [ ] Use blue-green or canary deployments
- [ ] Tag all AWS resources for cost tracking
- [ ] Implement cost monitoring and budgets
- [ ] Regular security audits and penetration testing
- [ ] Maintain documentation and keep it up-to-date
- [ ] Version control all infrastructure code
- [ ] Use GitOps for deployment automation

---

## Conclusion

This README provides a comprehensive guide to deploying the TaskManager application on AWS using modern DevOps practices. The infrastructure includes:

✅ **Compute**: EC2 with Amazon Linux 2023, EKS for Kubernetes orchestration  
✅ **Containerization**: Docker and Docker Compose for local/single-host deployment  
✅ **CI/CD**: Jenkins with automated pipeline for build, test, and deployment  
✅ **Code Quality**: SonarQube for static code analysis and quality gates  
✅ **Monitoring**: Prometheus for metrics collection, Grafana for visualization  
✅ **Database**: PostgreSQL for persistent data storage  
✅ **Security**: AWS IAM, Security Groups, secrets management  
✅ **High Availability**: Kubernetes with multiple replicas and load balancing  

**Next Steps:**
1. Follow the sections in order for first-time setup
2. Customize configurations for your environment
3. Implement security hardening before production deployment
4. Set up monitoring and alerting
5. Configure backups and disaster recovery
6. Automate infrastructure with Terraform/CloudFormation (advanced)

**Support and Contributions:**
- Report issues in GitHub repository
- Contribute improvements via pull requests
- Update documentation as you discover improvements

**Estimated Total Setup Time:** 2-4 hours (depending on experience level and AWS provisioning time)

---

**Last Updated:** February 2026  
**Maintained By:** DevOps Team  
**License:** MIT
