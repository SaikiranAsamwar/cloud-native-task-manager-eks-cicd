# 🚀 Task Manager DevOps - Complete Deployment Guide

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Prerequisites](#prerequisites)
4. [Step 1: Launch Amazon Linux 2 EC2 Instance](#step-1-launch-amazon-linux-2-ec2-instance)
5. [Step 2: Connect to Your Instance](#step-2-connect-to-your-instance)
6. [Step 3: Update System & Install Basic Tools](#step-3-update-system--install-basic-tools)
7. [Step 4: Install Git](#step-4-install-git)
8. [Step 5: Install Docker](#step-5-install-docker)
9. [Step 6: Install Python & pip](#step-6-install-python--pip)
10. [Step 7: Install Java (For Jenkins)](#step-7-install-java-for-jenkins)
11. [Step 8: Install AWS CLI](#step-8-install-aws-cli)
12. [Step 9: Install Helm (Package Manager for Kubernetes)](#step-9-install-helm-package-manager-for-kubernetes)
13. [Step 10: Install PostgreSQL (For SonarQube)](#step-10-install-postgresql-for-sonarqube)
14. [Step 11: Install SonarQube](#step-11-install-sonarqube)
15. [Step 12: Clone Your Application Repository](#step-12-clone-your-application-repository)
16. [Step 13: Test Your Application Locally](#step-13-test-your-application-locally)
17. [Step 14: Create Docker Images](#step-14-create-docker-images)
18. [Step 15: Setup AWS ECR (Elastic Container Registry)](#step-15-setup-aws-ecr-elastic-container-registry)
19. [Step 16: Push Docker Images to ECR](#step-16-push-docker-images-to-ecr)
20. [Step 17: Install kubectl & eksctl](#step-17-install-kubectl--eksctl)
21. [Step 18: Create AWS EKS Cluster](#step-18-create-aws-eks-cluster)
22. [Step 19: Deploy Application to EKS](#step-19-deploy-application-to-eks)
23. [Step 20: Install Jenkins for CI/CD](#step-20-install-jenkins-for-cicd)
24. [Step 21: Configure Jenkins](#step-21-configure-jenkins)
25. [Step 22: Create Jenkins Pipeline](#step-22-create-jenkins-pipeline)
26. [Step 23: Install Prometheus & Grafana](#step-23-install-prometheus--grafana)
27. [Troubleshooting Guide](#troubleshooting-guide)
28. [Security Best Practices](#security-best-practices)

---

## 📌 Project Overview

This **Task Manager** application is a full-stack Python/Flask application with:

- **Backend**: Flask API with SQLAlchemy ORM for task management
- **Frontend**: HTML/CSS/JavaScript web interface
- **Database**: SQLite (development) / PostgreSQL (production)

The deployment architecture includes:
- **Docker** for containerization
- **AWS ECR** for container registry
- **AWS EKS** for Kubernetes orchestration
- **Jenkins** for automated CI/CD
- **Prometheus & Grafana** for monitoring
- **SonarQube** for code quality analysis

---

## 🏗️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Developer's Machine                      │
│                    (GitHub Repository)                      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ (Git Push)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│            Amazon EC2 Instance (Master Node)                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Docker - Build Images                              │   │
│  │  Git - Clone Repository                             │   │
│  │  Python - Run Application & Build Tools             │   │
│  │  Jenkins - Automate CI/CD Pipeline                  │   │
│  │  AWS CLI - Interact with AWS Services              │   │
│  │  SonarQube - Code Quality Analysis                 │   │
│  └─────────────────────────────────────────────────────┘   │
└────────────────────────┬──────────────────────────────────┬─────────┘
                         │                                  │
      (Push Image)│                                 │ (Deploy)
                 ▼                                  ▼
        ┌──────────────────┐              ┌──────────────────┐
        │   AWS ECR        │              │   AWS EKS        │
        │ (Image Registry) │              │  (Kubernetes)    │
        │                  │              │                  │
        │ • Frontend Image │              │ • Frontend Pod   │
        │ • Backend Image  │              │ • Backend Pod    │
        └──────────────────┘              │ • PostgreSQL     │
                                          │ • Prometheus     │
                                          │ • Grafana        │
                                          └──────────────────┘
```

---

## ✅ Prerequisites

Before starting, ensure you have:

1. **AWS Account** with appropriate IAM permissions
2. **AWS Access Key & Secret Key** for programmatic access
3. **GitHub Account** with repository access
4. **SSH Key Pair** for EC2 connection
5. **Internet Connection**

---

## Step 1: Launch Amazon Linux 2 EC2 Instance

### 1.1 Open AWS Console

1. Go to [AWS Management Console](https://console.aws.amazon.com/)
2. Navigate to **EC2 Dashboard**
3. Click **Launch Instances**

### 1.2 Choose Amazon Linux 2 AMI

1. Click **Select** next to "Amazon Linux 2"
2. Choose instance type: **t3.xlarge** (4 vCPU, 16 GB RAM - recommended for Jenkins + Docker + full stack)
3. Click **Next: Configure Instance Details**

### 1.3 Configure Instance

1. **Number of instances**: 1
2. **Network**: Default VPC
3. **Subnet**: Default subnet
4. **Auto-assign Public IP**: Enable
5. Click **Next: Add Storage**

### 1.4 Add Storage

1. **Size**: 100 GB (minimum for Docker images, Jenkins, SonarQube, and databases)
2. **Volume type**: gp3 (General Purpose)
3. Click **Next: Add Tags**

### 1.5 Add Tags (Optional)

1. Click **Add Tag**
2. **Key**: `Name`
3. **Value**: `task-manager-devops`
4. Click **Next: Configure Security Group**

### 1.6 Configure Security Group

Create a new security group named `task-manager-sg`:

| Type | Protocol | Port | Source |
|------|----------|------|--------|
| SSH | TCP | 22 | Your IP |
| HTTP | TCP | 80 | 0.0.0.0/0 |
| HTTPS | TCP | 443 | 0.0.0.0/0 |
| Custom | TCP | 8080 | 0.0.0.0/0 |
| Custom | TCP | 9000 | 0.0.0.0/0 |
| Custom | TCP | 5000 | 0.0.0.0/0 |

**Explanation**:
- **SSH (22)**: For connecting to your instance
- **HTTP (80)**: For accessing your application
- **HTTPS (443)**: For secure connections
- **8080**: For Jenkins web interface
- **9000**: For SonarQube web interface
- **5000**: For Flask backend API

### 1.7 Review and Launch

1. Review all settings
2. Click **Launch**
3. Select or create a key pair
4. Click **Launch Instances**

### 1.8 Wait for Instance to Start

- Go to **EC2 > Instances**
- Wait until Status is **Running** and Status Checks show **2/2**

---

## Step 2: Connect to Your Instance

### 2.1 Get Public IP Address

1. In EC2 Dashboard, select your instance
2. Copy the **Public IPv4 address**

Example: `52.12.34.56`

### 2.2 Connect via SSH (Linux/macOS)

```bash
chmod 600 your-key.pem
ssh -i your-key.pem ec2-user@52.12.34.56
```

### 2.3 Connect via SSH (Windows - Using PowerShell)

```powershell
ssh -i "C:\path\to\your-key.pem" ec2-user@52.12.34.56
```

### 2.4 Connect via SSH (Windows - Using PuTTY)

1. Convert `.pem` to `.ppk` using PuTTYgen
2. Open PuTTY
3. **Host Name**: `ec2-user@52.12.34.56`
4. **SSH > Auth > Private key file**: Select `.ppk` file
5. Click **Open**

**You should see**:
```
       __|  __|_  )
       _|  (     /   Amazon Linux 2
      ___|\___|___|
```

---

## Step 3: Update System & Install Basic Tools

Once connected to your instance, run the following commands:

### 3.1 Update Package Manager

```bash
sudo dnf update -y
```

**What it does**: Updates all package lists and system packages to latest versions

**Expected output**:
```
Complete! Updated XX packages.
```

### 3.2 Install Essential Tools

```bash
sudo dnf install -y git wget curl unzip jq vim nano
```

**What each tool does**:
- **git**: Version control system
- **wget**: Download files from internet
- **curl**: Transfer data using URLs
- **unzip**: Extract ZIP files
- **jq**: Parse JSON data
- **vim/nano**: Text editors

**Expected output**:
```
Complete! Installed XX packages and dependencies.
```

### 3.3 Verify Installations

```bash
git --version
wget --version
curl --version
```

---

## Step 4: Install Git

Git should already be installed from Step 3, but let's verify and configure it:

### 4.1 Verify Git

```bash
git --version
```

**Expected output**:
```
git version 2.40.1
```

### 4.2 Configure Git (Optional but Recommended)

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### 4.3 Verify Configuration

```bash
git config --list | grep user
```

**Expected output**:
```
user.name=Your Name
user.email=your.email@example.com
```

---

## Step 5: Install Docker

Docker is essential for building and running container images.

### 5.1 Install Docker Engine

```bash
sudo dnf install docker -y
```

**What it does**: Installs Docker and all its dependencies

**Expected output**:
```
Complete! Installed XX packages.
```

### 5.2 Enable Docker Service (Auto-start)

```bash
sudo systemctl enable docker
```

**What it does**: Ensures Docker starts automatically when instance boots

### 5.3 Start Docker Service

```bash
sudo systemctl start docker
```

**What it does**: Starts the Docker daemon immediately

### 5.4 Add User to Docker Group

```bash
sudo usermod -aG docker ec2-user
```

**What it does**: Allows `ec2-user` to run Docker commands without `sudo`

### 5.5 Re-login or Activate New Group

```bash
newgrp docker
```

**What it does**: Activates the new group membership without logging out

### 5.6 Verify Docker Installation

```bash
docker --version
docker run hello-world
```

**Expected output**:
```
Docker version 24.0.0

Hello from Docker!
This message shows that your installation appears to be working correctly.
```

### 5.7 Install Docker Compose

```bash
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
```

### 5.8 Verify Docker Compose

```bash
docker-compose --version
```

**Expected output**:
```
Docker Compose version v2.20.0
```

---

## Step 6: Install Python & pip

Python is required to run Flask application.

### 6.1 Install Python 3 and Development Tools

```bash
sudo dnf install -y python3 python3-pip python3-devel gcc
```

**What it does**: Installs Python 3, pip, and development tools needed for building packages

**Expected output**:
```
Complete! Installed XX packages.
```

### 6.2 Verify Python Installation

```bash
python3 --version
pip3 --version
```

**Expected output**:
```
Python 3.11.4
pip 23.2.1 from /usr/lib/python3.11/site-packages/pip (python 3.11)
```

### 6.3 Upgrade pip

```bash
pip3 install --upgrade pip
```

**What it does**: Upgrades pip to latest version

### 6.4 Install Virtual Environment Tools

```bash
sudo dnf install -y python3-venv
```

**What it does**: Installs Python venv for creating virtual environments

---

## Step 7: Install Java (For Jenkins)

Jenkins requires Java to run.

### 7.1 Install Java Development Kit

```bash
sudo dnf install -y java-17-amazon-corretto
```

**What it does**: Installs Amazon Corretto (free OpenJDK distribution) version 17

**Expected output**:
```
Complete! Installed XX packages.
```

### 7.2 Verify Java Installation

```bash
java -version
```

**Expected output**:
```
openjdk version "17.0.9" 2023-10-17 LTS
OpenJDK Runtime Environment Corretto-17.0.9
OpenJDK 64-Bit Server VM
```

---

## Step 8: Install AWS CLI

AWS CLI allows you to interact with AWS services from command line.

### 8.1 Download AWS CLI v2

```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o awscli.zip
```

**What it does**: Downloads AWS CLI installer to home directory

### 8.2 Extract the Installer

```bash
unzip awscli.zip
```

**Expected output**:
```
Archive:  awscli.zip
  inflating: aws/install
  ...
```

### 8.3 Install AWS CLI

```bash
sudo ./aws/install
```

**Expected output**:
```
You can now run: /usr/local/bin/aws --version
```

### 8.4 Clean Up Installer

```bash
rm -rf aws awscli.zip
```

**What it does**: Removes temporary installer files

### 8.5 Verify AWS CLI Installation

```bash
aws --version
```

**Expected output**:
```
aws-cli/2.13.0 Python/3.11.4
```

### 8.6 Configure AWS Credentials

```bash
aws configure
```

**Prompts you to enter**:
```
AWS Access Key ID: [Your Access Key]
AWS Secret Access Key: [Your Secret Key]
Default region name: us-east-1
Default output format: json
```

**How to get credentials**:
1. Go to AWS Console
2. Go to **IAM > Users > Your User > Security Credentials**
3. Create new Access Key if needed
4. Copy Access Key ID and Secret Access Key

### 8.7 Verify AWS Configuration

```bash
aws sts get-caller-identity
```

**Expected output**:
```json
{
    "UserId": "AIDACKCEVSQ6C2EXAMPLE",
    "Account": "514439471441",
    "Arn": "arn:aws:iam::514439471441:user/your-username"
}
```

---

## Step 9: Install Helm (Package Manager for Kubernetes)

Helm is a package manager for Kubernetes that simplifies deployment of applications.

### 9.1 Download Helm Installation Script

```bash
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
```

**What it does**: Downloads and executes the Helm installation script

**Expected output**:
```
Downloading https://get.helm.sh/helm-v3.13.0-linux-amd64.tar.gz
Verifying checksum...
Helm v3.13.0 installed successfully
```

### 9.2 Verify Helm Installation

```bash
helm version
```

**Expected output**:
```
version.BuildInfo{Version:"v3.13.0", GitCommit:"...", GitTreeState:"clean", GoVersion:"go1.21.0"}
```

### 9.3 Add Prometheus Helm Repository

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
```

**What it does**: Adds the Prometheus community charts repository to Helm

**Expected output**:
```
"prometheus-community" has been added to your repositories
```

### 9.4 Update Helm Repositories

```bash
helm repo update
```

**What it does**: Fetches the latest chart information from all added repositories

**Expected output**:
```
Hang tight while we grab the latest from your chart repositories...
Successfully got an update from the "prometheus-community" chart repository
```

---

## Step 10: Install PostgreSQL (For SonarQube)

SonarQube requires PostgreSQL database to store analysis data.

### 10.1 Install PostgreSQL Server

```bash
sudo dnf install postgresql15-server postgresql15 -y
```

**What it does**: Installs PostgreSQL 15 database server and client tools

**Expected output**:
```
Complete! Installed XX packages.
```

### 10.2 Initialize PostgreSQL Database

```bash
sudo /usr/bin/postgresql-setup --initdb
```

**What it does**: Initializes the PostgreSQL database cluster

**Expected output**:
```
Initializing database ... OK
```

### 10.3 Start PostgreSQL Service

```bash
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

**What it does**:
- Enables PostgreSQL to auto-start on reboot
- Starts the PostgreSQL service immediately

### 10.4 Create SonarQube Database User

```bash
sudo -u postgres psql -c "CREATE USER sonar WITH ENCRYPTED PASSWORD 'sonar_pass';"
```

**What it does**: Creates a PostgreSQL user named `sonar` with password `sonar_pass`

**Expected output**:
```
CREATE ROLE
```

### 10.5 Create SonarQube Database

```bash
sudo -u postgres psql -c "CREATE DATABASE sonarqube OWNER sonar;"
```

**What it does**: Creates a database named `sonarqube` owned by the `sonar` user

**Expected output**:
```
CREATE DATABASE
```

### 10.6 Verify Database Creation

```bash
sudo -u postgres psql -c "\l" | grep sonarqube
```

**Expected output**:
```
 sonarqube | sonar | UTF8 | en_US.UTF-8 | en_US.UTF-8 | 
```

---

## Step 11: Install SonarQube

SonarQube provides static code analysis for code quality checks.

### 11.1 Create SonarQube Directory

```bash
sudo mkdir -p /opt/sonarqube
sudo chown -R ec2-user:ec2-user /opt/sonarqube
```

**What it does**: Creates directory and gives permissions to ec2-user

### 11.2 Download SonarQube

```bash
cd /opt/sonarqube
wget https://binaries.sonarsource.com/Distribution/sonarqube/sonarqube-10.4.zip
```

**What it does**: Downloads SonarQube version 10.4 (latest stable)

**Expected output**:
```
Saving to: 'sonarqube-10.4.zip'
100%[==============================] XXX.XX.MB  XX.XXmb/s
```

### 11.3 Extract SonarQube

```bash
unzip sonarqube-10.4.zip
```

**What it does**: Extracts the zip file to current directory

**Expected output**:
```
Archive:  sonarqube-10.4.zip
  inflating: sonarqube-10.4/...
```

### 11.4 Move SonarQube to Final Location

```bash
mv sonarqube-10.4 sonarqube-app
```

**What it does**: Renames extracted folder for clarity

### 11.5 Configure SonarQube Database Connection

```bash
nano /opt/sonarqube/sonarqube-app/conf/sonar.properties
```

**Find and update these lines** (press `Ctrl + W` to search):

```properties
# Uncomment and update:
sonar.jdbc.username=sonar
sonar.jdbc.password=sonar_pass
sonar.jdbc.url=jdbc:postgresql://localhost/sonarqube
```

**Save**: Press `Ctrl + O`, then `Enter`, then `Ctrl + X`

### 11.6 Create SonarQube Systemd Service

```bash
sudo tee /etc/systemd/system/sonarqube.service > /dev/null <<EOF
[Unit]
Description=SonarQube
After=network.target postgresql.service

[Service]
Type=forking
User=ec2-user
ExecStart=/opt/sonarqube/sonarqube-app/bin/linux-x86-64/sonar.sh start
ExecStop=/opt/sonarqube/sonarqube-app/bin/linux-x86-64/sonar.sh stop
Restart=always

[Install]
WantedBy=multi-user.target
EOF
```

**What it does**: Creates a service file to manage SonarQube as a system service

### 11.7 Enable and Start SonarQube

```bash
sudo systemctl daemon-reload
sudo systemctl enable sonarqube
sudo systemctl start sonarqube
```

**What it does**:
- Reloads systemd configuration
- Enables SonarQube to auto-start
- Starts SonarQube immediately

**⏱️ Wait 30-60 seconds for SonarQube to start**

### 11.8 Verify SonarQube is Running

```bash
sudo systemctl status sonarqube
```

**Expected output**:
```
● sonarqube.service - SonarQube
     Loaded: loaded (/etc/systemd/system/sonarqube.service; enabled; vendor preset: disabled)
     Active: active (running) since ...
```

### 11.9 Access SonarQube Web Interface

Open in browser:
```
http://YOUR_EC2_PUBLIC_IP:9000
```

**Example**: `http://52.12.34.56:9000`

**Default credentials**:
- Username: `admin`
- Password: `admin`

**First login**: You'll be prompted to change the default password

### 11.10 Generate SonarQube Token (For Jenkins Integration)

1. Go to **Administration > Security > Users**
2. Click on **admin** user
3. Scroll to **Tokens** section
4. Click **Generate** token
5. Name it: `jenkins-token`
6. Copy the token
7. Save it somewhere safe (you'll use it in Jenkins)

---

## Step 12: Clone Your Application Repository

### 12.1 Navigate to Home Directory

```bash
cd ~
```

### 12.2 Clone Repository

```bash
git clone https://github.com/SaikiranAsamwar/python-devops.git
```

**What it does**: Downloads your application code from GitHub

**Expected output**:
```
Cloning into 'python-devops'...
remote: Enumerating objects: XXX, done.
Receiving objects: 100% (XXX/XXX)
```

### 12.3 Navigate to Project Directory

```bash
cd python-devops
```

### 12.4 Verify Directory Structure

```bash
ls -la
```

**Expected output**:
```
total XXX
drwxr-xr-x  backend/
drwxr-xr-x  frontend/
drwxr-xr-x  k8s/
drwxr-xr-x  ansible/
-rw-r--r--  README.md
-rw-r--r--  Jenkinsfile
-rw-r--r--  docker-compose.yml
```

---

## Step 13: Test Your Application Locally

### 13.1 Navigate to Backend Directory

```bash
cd ~/python-devops/backend
```

### 13.2 Create Virtual Environment

```bash
python3 -m venv venv
source venv/bin/activate
```

**What it does**: Creates isolated Python environment for the project

**Expected output**:
```
(venv) [ec2-user@ip-xxx python-devops]$
```

### 13.3 Install Backend Dependencies

```bash
pip install -r requirements.txt
```

**What it does**: Installs all Python packages listed in `requirements.txt`

**Expected output**:
```
Successfully installed flask==... sqlalchemy==... ...
```

### 13.4 Check Backend Structure

```bash
ls -la
```

**Expected files**:
```
venv/            (virtual environment)
app/             (application code)
config.py        (configuration)
run.py           (entry point)
requirements.txt (dependencies)
Dockerfile       (container definition)
```

### 13.5 Test Backend Server (Optional)

```bash
python run.py
```

**Expected output**:
```
 * Running on http://127.0.0.1:5000
 * Debug mode: off
```

**To stop**: Press `Ctrl + C`

### 13.6 Deactivate Virtual Environment

```bash
deactivate
```

---

## Step 14: Create Docker Images

### 14.1 Build Backend Docker Image

```bash
cd ~/python-devops
docker build -f backend/Dockerfile -t backend:latest .
```

**What it does**: 
1. Reads `backend/Dockerfile`
2. Builds a container image
3. Tags it as `backend:latest`

**Expected output**:
```
Sending build context to Docker daemon
Step 1/X : FROM python:3.11-slim
 ---> XXX
Step 2/X : WORKDIR /app
...
Successfully tagged backend:latest
```

### 14.2 Build Frontend Docker Image

```bash
docker build -f frontend/Dockerfile -t frontend:latest .
```

**Expected output**:
```
Successfully tagged frontend:latest
```

### 14.3 Verify Images

```bash
docker images
```

**Expected output**:
```
REPOSITORY    TAG       IMAGE ID       CREATED       SIZE
frontend      latest    XXXXX          X minutes     XXX MB
backend       latest    XXXXX          X minutes     XXX MB
```

### 14.4 Test Container Locally (Optional)

```bash
docker run -p 5000:5000 backend:latest
```

**Expected output**:
```
 * Running on http://0.0.0.0:5000
```

**To stop**: Press `Ctrl + C`

---

## Step 15: Setup AWS ECR (Elastic Container Registry)

ECR is AWS's container registry where you'll store your Docker images.

### 15.1 Create Backend Repository

```bash
aws ecr create-repository \
  --repository-name task-manager/backend \
  --region us-east-1
```

**What it does**: Creates an ECR repository for backend images

**Expected output**:
```json
{
    "repository": {
        "repositoryArn": "arn:aws:ecr:us-east-1:514439471441:...",
        "registryId": "514439471441",
        "repositoryName": "task-manager/backend",
        "repositoryUri": "514439471441.dkr.ecr.us-east-1.amazonaws.com/task-manager/backend",
        ...
    }
}
```

### 15.2 Create Frontend Repository

```bash
aws ecr create-repository \
  --repository-name task-manager/frontend \
  --region us-east-1
```

**Expected output**: Similar to above

### 15.3 Verify Repositories

```bash
aws ecr describe-repositories --region us-east-1
```

**Expected output**: Lists both repositories

---

## Step 16: Push Docker Images to ECR

### 16.1 Get AWS Account ID

```bash
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo $AWS_ACCOUNT_ID
```

**Expected output**:
```
514439471441
```

### 16.2 Login to ECR

```bash
aws ecr get-login-password --region us-east-1 | \
docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com
```

**Expected output**:
```
Login Succeeded
```

### 16.3 Tag Backend Image

```bash
docker tag backend:latest ${AWS_ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com/task-manager/backend:latest
```

**What it does**: Creates another tag for the same image pointing to ECR repository

### 16.4 Push Backend Image

```bash
docker push ${AWS_ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com/task-manager/backend:latest
```

**Expected output**:
```
The push refers to repository [514439471441.dkr.ecr.us-east-1.amazonaws.com/task-manager/backend]
latest: digest: sha256:XXXXX size: XXXXX
```

### 16.5 Tag Frontend Image

```bash
docker tag frontend:latest ${AWS_ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com/task-manager/frontend:latest
```

### 16.6 Push Frontend Image

```bash
docker push ${AWS_ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com/task-manager/frontend:latest
```

**Expected output**: Similar to backend

### 16.7 Verify Images in ECR

```bash
aws ecr list-images --repository-name task-manager/backend --region us-east-1
aws ecr list-images --repository-name task-manager/frontend --region us-east-1
```

**Expected output**:
```json
{
    "imageIds": [
        {
            "imageTag": "latest",
            "imageDigest": "sha256:XXXXX"
        }
    ]
}
```

---

## Step 17: Install kubectl & eksctl

These tools manage Kubernetes clusters.

### 17.1 Install kubectl

```bash
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
```

**What it does**: Downloads kubectl binary

### 17.2 Make kubectl Executable

```bash
chmod +x kubectl
```

### 17.3 Move kubectl to System Path

```bash
sudo mv kubectl /usr/local/bin/
```

### 17.4 Verify kubectl

```bash
kubectl version --client
```

**Expected output**:
```
Client Version: v1.28.0
```

### 17.5 Install eksctl

```bash
curl -sLO "https://github.com/eksctl-io/eksctl/releases/latest/download/eksctl_Linux_amd64.tar.gz"
```

**What it does**: Downloads eksctl binary

### 17.6 Extract eksctl

```bash
tar -xzf eksctl_Linux_amd64.tar.gz
```

### 17.7 Move eksctl to System Path

```bash
sudo mv eksctl /usr/local/bin/
```

### 17.8 Clean Up

```bash
rm eksctl_Linux_amd64.tar.gz
```

### 17.9 Verify eksctl

```bash
eksctl version
```

**Expected output**:
```
0.168.0
```

---

## Step 18: Create AWS EKS Cluster

This creates your Kubernetes cluster on AWS.

### 18.1 Create EKS Cluster

```bash
eksctl create cluster \
  --name task-manager-cluster \
  --region us-east-1 \
  --nodes 3 \
  --node-type t3.medium \
  --managed
```

**What it does**:
- Creates a Kubernetes cluster named `task-manager-cluster`
- Deploys 3 worker nodes of type `t3.medium`
- Uses managed node groups (AWS handles patching)

**⏱️ This takes 15-20 minutes. Go grab coffee! ☕**

**Expected output**:
```
[ℹ]  eksctl version 0.168.0
[ℹ]  using region us-east-1
[ℹ]  subnets for us-east-1a: [subnet-XXXXX]
[ℹ]  subnets for us-east-1b: [subnet-XXXXX]
...
[✔]  EKS cluster "task-manager-cluster" in "us-east-1" is ready
```

### 18.2 Verify Cluster Creation

```bash
kubectl get nodes
```

**Expected output**:
```
NAME                          STATUS   ROLES    AGE     VERSION
ip-10-0-XX-XX.ec2.internal   Ready    <none>   5m      v1.28.0
ip-10-0-XX-XX.ec2.internal   Ready    <none>   5m      v1.28.0
ip-10-0-XX-XX.ec2.internal   Ready    <none>   5m      v1.28.0
```

---

## Step 19: Deploy Application to EKS

### 19.1 Create Namespace

```bash
kubectl apply -f ~/python-devops/k8s/namespace.yaml
```

**What it does**: Creates a logical namespace for your application

**Expected output**:
```
namespace/task-manager created
```

### 19.2 Create PostgreSQL Secret

```bash
kubectl apply -f ~/python-devops/k8s/database/postgres-secret.yaml
```

**Expected output**:
```
secret/postgres-secret created
```

### 19.3 Deploy PostgreSQL StatefulSet

```bash
kubectl apply -f ~/python-devops/k8s/database/postgres-deployment.yaml
kubectl apply -f ~/python-devops/k8s/database/postgres-service.yaml
```

**Expected output**:
```
deployment.apps/postgres created
service/postgres-service created
```

### 19.4 Wait for PostgreSQL Pod to Start

```bash
kubectl get pods -n task-manager --watch
```

**Expected output**:
```
NAME         READY   STATUS              RESTARTS   AGE
postgres-0   0/1     ContainerCreating   0          10s
postgres-0   1/1     Running             0          30s
```

**Press `Ctrl + C` to exit watch**

### 19.5 Update ECR Registry URL in Deployment Files

First, get your account ID:

```bash
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo $AWS_ACCOUNT_ID
```

Then update the image URLs in deployment files:

```bash
sed -i "s/ACCOUNT_ID/${AWS_ACCOUNT_ID}/g" ~/python-devops/k8s/backend/backend-deployment.yaml
sed -i "s/ACCOUNT_ID/${AWS_ACCOUNT_ID}/g" ~/python-devops/k8s/frontend/frontend-deployment.yaml
```

### 19.6 Deploy Backend

```bash
kubectl apply -f ~/python-devops/k8s/backend/backend-configmap.yaml
kubectl apply -f ~/python-devops/k8s/backend/backend-deployment.yaml
kubectl apply -f ~/python-devops/k8s/backend/backend-service.yaml
```

**Expected output**:
```
configmap/backend-config created
deployment.apps/backend created
service/backend-service created
```

### 19.7 Deploy Frontend

```bash
kubectl apply -f ~/python-devops/k8s/frontend/frontend-deployment.yaml
kubectl apply -f ~/python-devops/k8s/frontend/frontend-service.yaml
```

**Expected output**:
```
deployment.apps/frontend created
service/frontend-service created
```

### 19.8 Verify All Pods are Running

```bash
kubectl get pods -n task-manager
```

**Expected output**:
```
NAME                       READY   STATUS    RESTARTS   AGE
backend-XXXXX             1/1     Running   0          2m
frontend-XXXXX            1/1     Running   0          2m
postgres-0                1/1     Running   0          5m
```

### 19.9 Get Application URLs

```bash
kubectl get svc -n task-manager
```

**Expected output**:
```
NAME               TYPE           CLUSTER-IP    EXTERNAL-IP      PORT(S)
backend-service    ClusterIP      10.100.XX.XX  <none>           5000/TCP
frontend-service   LoadBalancer   10.100.XX.XX  AB12.elb.us-...  80:31234/TCP
postgres-service   ClusterIP      10.100.XX.XX  <none>           5432/TCP
```

### 19.10 Access Your Application

Open in browser:
```
http://<EXTERNAL-IP>
```

**Example**: `http://AB12.elb.us-east-1.amazonaws.com`

---

## Step 20: Install Jenkins for CI/CD

### 20.1 Add Jenkins Repository

```bash
sudo wget -O /etc/yum.repos.d/jenkins.repo https://pkg.jenkins.io/redhat-stable/jenkins.repo
```

### 20.2 Import Jenkins GPG Key

```bash
sudo rpm --import https://pkg.jenkins.io/redhat-stable/jenkins.io.key
```

### 20.3 Install Jenkins

```bash
sudo dnf install -y jenkins
```

**Expected output**:
```
Complete! Installed XX packages.
```

### 20.4 Grant Jenkins Docker Permissions

```bash
sudo usermod -aG docker jenkins
```

**What it does**: Allows Jenkins to run Docker commands

### 20.5 Start Jenkins Service

```bash
sudo systemctl enable jenkins
sudo systemctl start jenkins
```

**What it does**: 
- Enables Jenkins to auto-start on reboot
- Starts Jenkins immediately

### 20.6 Get Jenkins Unlock Password

```bash
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

**Expected output**:
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

Copy this password.

### 20.7 Access Jenkins Web Interface

Open in browser:
```
http://YOUR_EC2_PUBLIC_IP:8080
```

**Example**: `http://52.12.34.56:8080`

### 20.8 Unlock Jenkins

1. Paste the password from Step 20.6
2. Click **Continue**

### 20.9 Install Suggested Plugins

1. Click **Install suggested plugins**
2. Wait for installation (5-10 minutes)

### 20.10 Create First Admin User

1. Set username: `admin`
2. Set password: (strong password)
3. Confirm password
4. Fill email
5. Click **Save and Continue**

### 20.11 Configure Jenkins URL

1. **Jenkins URL**: `http://YOUR_EC2_PUBLIC_IP:8080/`
2. Click **Save and Finish**

---

## Step 21: Configure Jenkins

### 21.1 Install Additional Plugins

1. Go to **Manage Jenkins > Plugin Manager**
2. Search for and install:
   - Docker
   - Docker Pipeline
   - Kubernetes
   - AWS Credentials
   - Pipeline: AWS Steps

### 21.2 Add AWS Credentials to Jenkins

1. Go to **Manage Jenkins > Manage Credentials > System**
2. Click **Global credentials (unrestricted)**
3. Click **Add Credentials**
4. **Kind**: AWS Credentials
5. **ID**: `aws-creds`
6. **Access Key ID**: Your AWS Access Key
7. **Secret Access Key**: Your AWS Secret Key
8. Click **Save**

### 21.3 Configure Docker in Jenkins

1. Go to **Manage Jenkins > Configure System**
2. Find **Docker**
3. **Docker Host URI**: `unix:///var/run/docker.sock`
4. Click **Save**

---

## Step 22: Create Jenkins Pipeline

### 22.1 Create New Pipeline Job

1. Go to Jenkins Dashboard
2. Click **New Item**
3. **Item name**: `Task-Manager-Pipeline`
4. Select **Pipeline**
5. Click **OK**

### 22.2 Configure Pipeline

1. **Description**: Task Manager CI/CD Pipeline
2. Under **Pipeline** section
3. **Definition**: Pipeline script from SCM
4. **SCM**: Git
5. **Repository URL**: `https://github.com/SaikiranAsamwar/python-devops.git`
6. **Branch**: `*/main`
7. **Script Path**: `Jenkinsfile`
8. Click **Save**

### 22.3 First Run

1. Click **Build Now**
2. Click on build number to view logs
3. Watch the pipeline execute all stages

---

## Step 23: Install Prometheus & Grafana (Monitoring Stack)

### 23.1 Add Prometheus Community Helm Repository

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
```

**What this does**: Adds the official Prometheus Community Helm chart repository to your Helm configuration.

### 23.2 Update Helm Repositories

```bash
helm repo update
```

**Expected output**:
```
Hang tight while we grab the latest from your chart repositories...
...Successfully got an update from the "prometheus-community" chart repository
Update Complete. ⎈ Happy Helming!⎈
```

### 23.3 Create Monitoring Namespace

```bash
kubectl create namespace monitoring
```

**Expected output**:
```
namespace/monitoring created
```

### 23.4 Install kube-prometheus-stack (Prometheus + Grafana)

```bash
helm install monitoring prometheus-community/kube-prometheus-stack \
  -n monitoring
```

**What this does**: Installs the complete Prometheus stack including:
- Prometheus (metrics collection)
- Grafana (visualization dashboard)
- AlertManager (alert management)
- Node Exporter (node metrics)
- kube-state-metrics (Kubernetes metrics)

**⏱️ This takes 5-10 minutes**

**Expected output**:
```
NAME: monitoring
LAST DEPLOYED: ...
NAMESPACE: monitoring
STATUS: deployed
REVISION: 1
...
```

### 23.5 Verify Monitoring Stack Installation

```bash
kubectl get pods -n monitoring
```

**Expected output** (wait for all pods to be Running):
```
NAME                                                     READY   STATUS    RESTARTS
alertmanager-monitoring-kube-prom-alertmanager-0        2/2     Running   0
monitoring-grafana-XXXXX                               1/1     Running   0
monitoring-kube-prom-operator-XXXXX                     1/1     Running   0
monitoring-prometheus-node-exporter-XXXXX               1/1     Running   0
monitoring-prometheus-node-exporter-XXXXX               1/1     Running   0
prometheus-monitoring-kube-prom-prometheus-0           2/2     Running   0
```

**Verify all services**:
```bash
kubectl get svc -n monitoring
```

**Expected output**:
```
NAME                                 TYPE        CLUSTER-IP
alertmanager-operated                ClusterIP   None
monitoring-grafana                   ClusterIP   10.100.XX.XX
monitoring-kube-prom-alertmanager    ClusterIP   10.100.XX.XX
monitoring-kube-prom-operator        ClusterIP   10.100.XX.XX
monitoring-kube-prom-prometheus      ClusterIP   10.100.XX.XX
monitoring-prometheus-node-exporter  ClusterIP   None
prometheus-operated                  ClusterIP   None
```

### 23.6 Access Grafana Dashboard

**Port forward Grafana to your local machine**:
```bash
kubectl port-forward -n monitoring svc/monitoring-grafana 3000:80 &
```

**Access Grafana**:
- Open browser: `http://localhost:3000`

### 23.7 Login to Grafana

**Default credentials**:
- **Username**: `admin`
- **Password**: `prom-operator`

**What to do**:
1. Enter username and password
2. Click "Log In"
3. Change password (recommended for security)

### 23.8 Verify Prometheus Metrics

**Port forward Prometheus**:
```bash
kubectl port-forward -n monitoring svc/monitoring-kube-prom-prometheus 9090:9090 &
```

**Access Prometheus**:
- Open browser: `http://localhost:9090`

**Check metrics**:
1. Click on "Metrics" tab
2. Start typing: `node_` to see available metrics
3. Example: Search for `node_cpu_seconds_total`

### 23.9 Pre-built Grafana Dashboards

After logging into Grafana, dashboards are already configured:

1. Go to **Dashboards** → **Browse**
2. You'll see pre-built dashboards:
   - Kubernetes Cluster Monitoring
   - Prometheus Stats
   - Node Exporter Full
   - Kubelet stats
   - API Server

**To view a dashboard**:
- Click on any dashboard name
- View real-time metrics and graphs

### 23.10 Create Custom Alerts (Optional)

**To add alerting rules**:

```bash
kubectl edit prometheus -n monitoring monitoring-kube-prom-prometheus
```

Add under `spec.ruleSelector`:
```yaml
alertingRules:
- name: app-alerts.yaml
  key: prometheus-rules
```

### 23.11 Verify AlertManager

**Port forward AlertManager**:
```bash
kubectl port-forward -n monitoring svc/alertmanager-operated 9093:9093 &
```

**Access AlertManager**:
- Open browser: `http://localhost:9093`
- View fired alerts and notification channels

### 23.12 Troubleshoot Monitoring (If Needed)

**Check Prometheus pod logs**:
```bash
kubectl logs -n monitoring prometheus-monitoring-kube-prom-prometheus-0
```

**Check Grafana pod logs**:
```bash
kubectl logs -n monitoring monitoring-grafana-XXXXX
```

**Check AlertManager pod logs**:
```bash
kubectl logs -n monitoring alertmanager-monitoring-kube-prom-alertmanager-0
```

---

## 🐛 Troubleshooting Guide

### Issue 1: kubectl Cannot Connect to EKS

**Error**: `Unable to connect to the server`

**Solution**:
```bash
aws eks update-kubeconfig --name task-manager-cluster --region us-east-1
```

### Issue 2: Docker Image Push to ECR Fails

**Error**: `denied: User is not authorized`

**Solution**:
```bash
aws ecr get-login-password --region us-east-1 | \
docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com
```

### Issue 3: Pod Stuck in ImagePullBackOff

**Error**: Container cannot pull image from ECR

**Solution**:
```bash
# Verify image exists in ECR
aws ecr describe-images --repository-name task-manager/backend --region us-east-1

# Check pod logs
kubectl describe pod <pod-name> -n task-manager
kubectl logs <pod-name> -n task-manager
```

### Issue 4: Jenkins Cannot Access Docker

**Error**: `Cannot connect to Docker daemon`

**Solution**:
```bash
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

### Issue 5: EKS Cluster Takes Too Long to Create

**Note**: Cluster creation typically takes 15-20 minutes. This is normal.

**Check progress**:
```bash
eksctl get cluster --name task-manager-cluster --region us-east-1
```

### Issue 6: PostgreSQL Pod Not Starting

**Error**: `CrashLoopBackOff` or `Pending`

**Debug**:
```bash
# Check pod events
kubectl describe pod postgres-0 -n task-manager

# Check pod logs
kubectl logs postgres-0 -n task-manager

# Check storage
kubectl get pvc -n task-manager
```

---

## 🔒 Security Best Practices

### 1. Use IAM Roles Instead of Access Keys

Avoid hardcoding AWS credentials. Instead, use IAM roles:

```bash
aws sts assume-role --role-arn arn:aws:iam::514439471441:role/YourRole --role-session-name session-name
```

### 2. Enable Encryption

```bash
# Encrypt EBS volumes
# Encrypt Docker images in transit

aws ecr put-image-scan-configuration \
  --repository-name task-manager/backend \
  --image-scan-configuration scanOnPush=true \
  --region us-east-1
```

### 3. Use Kubernetes Secrets

Store sensitive data in Kubernetes Secrets:

```bash
kubectl create secret generic app-secrets \
  -n task-manager \
  --from-literal=db-password=YourPassword \
  --from-literal=api-key=YourApiKey
```

### 4. Network Policies

Restrict traffic between pods:

```bash
# Create network policies in k8s/network-policy.yaml
kubectl apply -f k8s/network-policy.yaml
```

### 5. Regular Backups

Backup your PostgreSQL data:

```bash
kubectl exec -n task-manager postgres-0 -- pg_dump taskmanager > backup.sql
```

### 6. Monitor Logs

```bash
# View Jenkins logs
sudo tail -f /var/log/jenkins/jenkins.log

# View Docker logs
sudo journalctl -u docker -f

# View Kubernetes logs
kubectl logs -n task-manager <pod-name> -f
```

---

## 📊 Quick Reference Commands

### Kubernetes Commands

```bash
# Get all pods
kubectl get pods -n task-manager

# Get pod logs
kubectl logs <pod-name> -n task-manager

# Describe pod (troubleshooting)
kubectl describe pod <pod-name> -n task-manager

# Delete pod (will recreate)
kubectl delete pod <pod-name> -n task-manager

# Get services
kubectl get svc -n task-manager

# Scale deployment
kubectl scale deployment backend --replicas=5 -n task-manager

# Update image
kubectl set image deployment/backend backend=NEW_IMAGE -n task-manager
```

### Docker Commands

```bash
# List images
docker images

# List containers
docker ps -a

# Build image
docker build -t <name>:<tag> .

# Push image
docker push <image>

# Remove image
docker rmi <image-id>
```

### AWS Commands

```bash
# List ECR repositories
aws ecr describe-repositories --region us-east-1

# List images in repo
aws ecr list-images --repository-name task-manager/backend --region us-east-1

# Delete image
aws ecr batch-delete-image --repository-name task-manager/backend --image-ids imageTag=<tag> --region us-east-1

# List EKS clusters
aws eks list-clusters --region us-east-1

# Describe cluster
aws eks describe-cluster --name task-manager-cluster --region us-east-1
```

---

## 🎉 Congratulations!

You now have a **complete, production-ready DevOps setup** with:

✅ Docker containers
✅ AWS ECR registry
✅ AWS EKS Kubernetes cluster
✅ Jenkins CI/CD pipeline
✅ Monitoring with Prometheus & Grafana
✅ PostgreSQL persistence
✅ Auto-scaling applications

**Next steps**:
1. Configure your domain name
2. Setup SSL/TLS certificates
3. Add more monitoring and alerts
4. Implement backup strategies
5. Scale your application

---

## 📞 Need Help?

- **Kubernetes Docs**: https://kubernetes.io/docs/
- **AWS EKS Docs**: https://docs.aws.amazon.com/eks/
- **Jenkins Docs**: https://www.jenkins.io/doc/
- **Docker Docs**: https://docs.docker.com/
- **Flask Docs**: https://flask.palletsprojects.com/

---

**Happy Deploying! 🚀**
