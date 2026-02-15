# Task Manager — Full-Stack DevOps Project

A production-ready Flask + PostgreSQL task management application deployed on **AWS EKS** with a complete **CI/CD pipeline**, **monitoring**, and **code quality** analysis.

> **Deployment Status:** ✅ Successfully deployed and running on AWS EKS

---

## Architecture

```
                        ┌─────────────────────────────────────────────┐
                        │              AWS Cloud (us-east-1)          │
                        │                                             │
  User ──► Internet ──► │  ┌──────────┐   ┌─────────┐   ┌─────────┐ │
                        │  │ Frontend │──►│ Backend │──►│Postgres │ │
                        │  │ (Nginx)  │   │ (Flask) │   │  (v15)  │ │
                        │  │ Port 80  │   │Port 8888│   │Port 5432│ │
                        │  └──────────┘   └─────────┘   └─────────┘ │
                        │                                             │
                        │  ┌──────────────────────────────────────┐  │
                        │  │ Monitoring: Prometheus + Grafana      │  │
                        │  └──────────────────────────────────────┘  │
                        └─────────────────────────────────────────────┘

  Jenkins (CI/CD) ──► Build ──► Test ──► Push to DockerHub ──► Deploy to EKS
  SonarQube ──► Code Quality Analysis
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python Flask, Gunicorn, SQLAlchemy |
| Frontend | HTML/CSS/JS served via Nginx |
| Database | PostgreSQL 15 (Alpine) |
| Containerization | Docker, Docker Compose |
| Orchestration | Kubernetes (AWS EKS) |
| CI/CD | Jenkins (Declarative Pipeline) |
| Code Quality | SonarQube 10.4 |
| Monitoring | Prometheus + Grafana (Helm) |
| Cloud | AWS (EC2, EKS, EBS, ELB) |

---

## Project Structure

```
├── backend/                  # Flask API application
│   ├── app/                  # App package (models, routes)
│   ├── Dockerfile            # Backend container image
│   ├── config.py             # Environment configurations
│   ├── run.py                # Gunicorn entry point
│   └── requirements.txt      # Python dependencies
├── frontend/                 # Static frontend + Nginx
│   ├── templates/            # HTML pages
│   ├── js/                   # JavaScript modules
│   ├── css/                  # Stylesheets
│   ├── Dockerfile            # Frontend container image
│   └── nginx.conf            # Nginx reverse proxy config
├── k8s/                      # Kubernetes manifests
│   ├── namespace.yaml
│   ├── secrets.yaml
│   ├── postgres-pvc.yaml
│   ├── postgres-deployment.yaml
│   ├── backend-deployment.yaml
│   ├── frontend-deployment.yaml
│   └── ingress.yaml
├── monitoring/               # Prometheus & Grafana configs
├── jenkins/                  # Jenkins K8s deployment files
├── docker-compose.yml        # Local multi-container setup
└── Jenkinsfile               # CI/CD pipeline definition
```

---

## CI/CD Pipeline

The Jenkins pipeline automates the entire workflow:

```
Git Checkout → SonarQube Analysis → Docker Build → Docker Test → Push to DockerHub → Deploy to EKS → Deploy Monitoring
```

**Pipeline stages:**

1. **Git Checkout** — Pull source code
2. **SonarQube Analysis** — Static code analysis
3. **Docker Build** — Build backend & frontend images
4. **Docker Test** — Spin up containers and run health checks
5. **Docker Push** — Push images to DockerHub (tagged with build number + latest)
6. **Deploy to EKS** — Apply K8s manifests, wait for rollouts, deploy Prometheus + Grafana via Helm

---

## Prerequisites

**EC2 Instance (Amazon Linux 2023):**
- Instance type: `t3.large` (2 vCPU, 8 GB RAM)
- Storage: 30–50 GiB gp3
- Security Group: Ports `22`, `80`, `443`, `8080`, `9000`

---

## Setup Guide

### 1. Install Base Dependencies

```bash
sudo dnf -y update
sudo dnf -y install git curl wget unzip vim net-tools jq python3 python3-pip
```

### 2. Install Docker

```bash
sudo dnf -y install docker
sudo systemctl enable --now docker
sudo usermod -aG docker ec2-user
newgrp docker

# Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
  -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 3. Install AWS CLI

```bash
cd /tmp
curl -fsSL "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o awscliv2.zip
unzip -q awscliv2.zip
sudo ./aws/install

aws configure
# Enter: Access Key ID, Secret Access Key, Region (us-east-1), Output (json)
```

### 4. Install kubectl & eksctl

```bash
# kubectl
curl -fsSL "https://dl.k8s.io/release/$(curl -fsSL https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl" \
  -o /tmp/kubectl
chmod +x /tmp/kubectl && sudo mv /tmp/kubectl /usr/local/bin/

# eksctl
curl -fsSL "https://github.com/eksctl-io/eksctl/releases/download/v0.171.0/eksctl_Linux_amd64.tar.gz" \
  | tar -xz -C /tmp
sudo mv /tmp/eksctl /usr/local/bin/
```

### 5. Create EKS Cluster

```bash
eksctl create cluster \
  --name taskmanager-eks \
  --region us-east-1 \
  --nodes 2 \
  --node-type t3.medium \
  --managed

aws eks update-kubeconfig --name taskmanager-eks --region us-east-1
kubectl get nodes
```

### 6. Install Java 17

```bash
sudo dnf -y install java-17-amazon-corretto-devel
echo 'export JAVA_HOME=/usr/lib/jvm/java-17-amazon-corretto' >> ~/.bashrc
source ~/.bashrc
```

### 7. Jenkins Installation and Configuration

#### 7.1 Pre-Requisites

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

#### 7.2 Install Jenkins on Master EC2

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

#### 7.3 Access Jenkins Dashboard

Open in browser:

```
http://<EC2_PUBLIC_IP>:8080
```

Get admin password:

```bash
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

Install suggested plugins and create an Admin User.

---

#### 7.4 Give Jenkins Access to Docker

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

#### 7.5 Give Jenkins Access to Kubernetes Cluster

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

#### 7.6 Install Required Jenkins Plugins

Navigate: `Manage Jenkins → Manage Plugins → Available Plugins`

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

#### 7.7 Configure Jenkins Credentials

Navigate: `Manage Jenkins → Manage Credentials → Global`

**DockerHub Credentials:**

| Field | Value |
|-------|-------|
| Kind | Username with password |
| ID | dockerhub-credentials |
| Username | DockerHub Username |
| Password | DockerHub Access Token |

**SonarQube Token:**

| Field | Value |
|-------|-------|
| Kind | Secret Text |
| ID | sonarqube-token |
| Secret | Generated Sonar Token |

**AWS Credentials:**

| Field | Value |
|-------|-------|
| Kind | AWS Credentials |
| ID | aws-credentials |
| Access Key ID | Your AWS Access Key |
| Secret Access Key | Your AWS Secret Key |

---

#### 7.8 Configure SonarQube Server in Jenkins

Navigate: `Manage Jenkins → Configure System`

Add SonarQube Server:

| Field | Value |
|-------|-------|
| Name | SonarQube |
| URL | http://localhost:9000 |
| Token | sonarqube-token |

---

#### 7.9 Create Jenkins Pipeline Job

Navigate: `Dashboard → New Item → Pipeline`

| Field | Value |
|-------|-------|
| Pipeline Name | taskmanager-pipeline |
| Definition | Pipeline Script from SCM |
| SCM | Git |
| Repo URL | https://github.com/SaikiranAsamwar/Task-Manager-Python-DevOps.git |
| Branch | */main |
| Script Path | Jenkinsfile |

Click **Save**

---

#### 7.10 Run Pipeline

```
taskmanager-pipeline → Build Now
```

Pipeline will:

- Build Docker Images
- Push Images to DockerHub
- Deploy to EKS Cluster using kubectl
- Deploy Monitoring via Helm
- Verify Running Pods

Check deployment:

```bash
kubectl get pods -n taskmanager
kubectl get svc -n taskmanager
```

---

### 8. Install SonarQube

```bash
# Create system user
sudo useradd -r -M -d /opt/sonarqube -s /bin/bash sonar

# Download & extract
cd /opt
sudo wget https://binaries.sonarsource.com/Distribution/sonarqube/sonarqube-10.4.1.88267.zip
sudo unzip sonarqube-10.4.1.88267.zip
sudo mv sonarqube-10.4.1.88267 sonarqube
sudo chown -R sonar:sonar /opt/sonarqube

# Kernel tuning (required)
echo "vm.max_map_count=262144" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
echo "sonar - nofile 65536" | sudo tee -a /etc/security/limits.conf
echo "sonar - nproc  4096"  | sudo tee -a /etc/security/limits.conf
```

Create systemd service at `/etc/systemd/system/sonarqube.service`:

```ini
[Unit]
Description=SonarQube Service
After=syslog.target network.target

[Service]
Type=forking
ExecStart=/opt/sonarqube/bin/linux-x86-64/sonar.sh start
ExecStop=/opt/sonarqube/bin/linux-x86-64/sonar.sh stop
User=sonar
Group=sonar
Restart=always
LimitNOFILE=65536
LimitNPROC=4096

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now sonarqube
```

Access at `http://<EC2_IP>:9000` — Default login: `admin` / `admin`

**Configure in Jenkins:** `Manage Jenkins → System → SonarQube servers` — add server URL and token.

### 9. Install Helm (for Monitoring)

```bash
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
```

> Prometheus + Grafana are auto-deployed by the Jenkins pipeline via Helm during the EKS deploy stage.

---

## Deployment

### Option A: Docker Compose (Local / Single EC2)

```bash
git clone https://github.com/SaikiranAsamwar/Task-Manager-Python-DevOps.git
cd Task-Manager-Python-DevOps

docker compose up -d --build
```

Verify:
```bash
curl http://localhost/api/health     # Backend health
curl http://localhost/               # Frontend
```

### Option B: Jenkins Pipeline (Recommended — Full CI/CD to EKS)

1. Open Jenkins → **New Item** → Pipeline
2. Set SCM to Git: `https://github.com/SaikiranAsamwar/Task-Manager-Python-DevOps.git`
3. Branch: `*/main`, Script Path: `Jenkinsfile`
4. Click **Build Now**

The pipeline will build, test, push, and deploy everything automatically.

### Option C: Manual Kubernetes Deployment

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/postgres-pvc.yaml
kubectl apply -f k8s/postgres-deployment.yaml
kubectl rollout status deployment/postgres -n taskmanager --timeout=300s

kubectl apply -f k8s/backend-deployment.yaml
kubectl rollout status deployment/backend -n taskmanager --timeout=300s

kubectl apply -f k8s/frontend-deployment.yaml
kubectl rollout status deployment/frontend -n taskmanager --timeout=300s
```

Get the application URL:
```bash
kubectl get svc frontend -n taskmanager
# Use the EXTERNAL-IP from the LoadBalancer
```

---

## Monitoring

Prometheus & Grafana are deployed via Helm (automated in the Jenkins pipeline):

```bash
helm upgrade --install monitoring prometheus-community/kube-prometheus-stack \
  --namespace monitoring --create-namespace \
  --set grafana.service.type=LoadBalancer \
  --set prometheus.service.type=LoadBalancer \
  --set grafana.adminPassword=admin123
```

```bash
kubectl get svc -n monitoring   # Get LoadBalancer URLs
```

- **Grafana:** `http://<GRAFANA-ELB>:3000` (admin / admin123)
- **Prometheus:** `http://<PROMETHEUS-ELB>:9090`
- **Recommended dashboard IDs:** 315, 8588, 6417, 1860

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Liveness probe |
| `/api/ready` | GET | Readiness probe (checks DB) |
| `/api/register` | POST | User registration |
| `/api/login` | POST | User login |
| `/api/tasks` | GET/POST | Task CRUD operations |
| `/api/users` | GET | List users |

---

## Troubleshooting

```bash
# Pod status & logs
kubectl get pods -n taskmanager
kubectl logs <POD_NAME> -n taskmanager
kubectl describe pod <POD_NAME> -n taskmanager

# Docker Compose logs
docker compose logs backend
docker compose logs frontend

# Port conflicts
sudo netstat -tulpn | grep :<PORT>
sudo fuser -k <PORT>/tcp

# Restart services
sudo systemctl restart jenkins
sudo systemctl restart sonarqube
sudo systemctl restart docker
```

---

## Cleanup

```bash
# Delete K8s app
kubectl delete -f k8s/ --ignore-not-found

# Delete monitoring
helm uninstall monitoring -n monitoring

# Delete EKS cluster
eksctl delete cluster --name taskmanager-eks --region us-east-1

# Docker cleanup
docker compose down -v
docker system prune -a --volumes -f
```

---

## Author

**Saikiran Asamwar**
- GitHub: [SaikiranAsamwar](https://github.com/SaikiranAsamwar)
- DockerHub: [saikiranasamwar4](https://hub.docker.com/u/saikiranasamwar4)

---

**License:** MIT
