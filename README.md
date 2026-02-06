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

### 9.1 Install Jenkins Container

```bash
# Run Jenkins container
docker run -d \
  --name jenkins \
  --restart=unless-stopped \
  -p 8080:8080 \
  -p 50000:50000 \
  -v ~/jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  jenkins/jenkins:lts-jdk17

# Add jenkins user to docker group
docker exec -u root jenkins bash -c "apt-get update && apt-get install -y docker.io && usermod -aG docker jenkins"
docker restart jenkins

# Get initial admin password
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

### 9.2 Initial Jenkins Setup

**Step 1: Access Jenkins Web Interface**
```bash
# Create SSH tunnel to access Jenkins (if on EC2)
ssh -i key.pem -L 8080:localhost:8080 ec2-user@<EC2_IP>

# Or access directly if local
# http://localhost:8080
```

**Step 2: Unlock Jenkins**
1. Open browser and navigate to `http://localhost:8080`
2. Copy the initial admin password from terminal (from previous command)
3. Paste the password in the "Administrator password" field
4. Click **Continue**

**Step 3: Install Plugins**
1. Select **Install suggested plugins**
2. Wait for plugins to install (this may take 5-10 minutes)
3. Common plugins that will be installed:
   - Git
   - Pipeline
   - Docker Pipeline
   - Credentials Binding
   - SSH Agent
   - Workspace Cleanup

**Step 4: Create First Admin User**
1. Fill in the form:
   - Username: `admin` (or your preferred username)
   - Password: (use a strong password)
   - Confirm password
   - Full name: `Your Name`
   - Email: `your-email@example.com`
2. Click **Save and Continue**

**Step 5: Configure Jenkins URL**
1. Keep the default Jenkins URL: `http://localhost:8080/` (or your domain)
2. Click **Save and Finish**
3. Click **Start using Jenkins**

### 9.3 Install Additional Required Plugins

**Step 1: Navigate to Plugin Manager**
1. Click **Manage Jenkins** (left sidebar)
2. Click **Manage Plugins**
3. Click on the **Available** tab

**Step 2: Install Required Plugins**
Search for and select the following plugins:
- **SonarQube Scanner** - For code quality analysis
- **Docker** - For Docker operations
- **Docker Pipeline** - For Docker commands in pipeline
- **Kubernetes** - For K8s deployment
- **Kubernetes CLI** - For kubectl commands
- **Pipeline: Stage View** - For better pipeline visualization
- **Blue Ocean** - For modern pipeline UI (optional)
- **Git** - For Git repository integration (usually pre-installed)
- **GitHub** - For GitHub-specific features
- **Credentials Binding** - For secure credential handling (usually pre-installed)

**Step 3: Install Plugins**
1. After selecting all required plugins, click **Install without restart**
2. Check the box **Restart Jenkins when installation is complete and no jobs are running**
3. Wait for Jenkins to restart (2-3 minutes)
4. Log back in with your admin credentials

**Step 4: Verify Plugin Installation**
1. Go to **Manage Jenkins** → **Manage Plugins**
2. Click on **Installed** tab
3. Search for each plugin to verify installation:
   - Search for "SonarQube" - should show "SonarQube Scanner"
   - Search for "Docker" - should show "Docker" and "Docker Pipeline"
   - Search for "Kubernetes" - should show "Kubernetes" and "Kubernetes CLI"
4. All plugins should have status: "Enabled" with a checkmark ✓

### 9.3a Configure Global Tools

#### 9.3a.1 Configure Git

**Step 1: Navigate to Global Tool Configuration**
1. Click **Manage Jenkins**
2. Click **Global Tool Configuration**

**Step 2: Configure Git**
1. Scroll down to **Git** section
2. Click **Add Git** if no Git installation exists
3. Configure:
   - **Name**: Enter `Default` or `Git`
   - **Path to Git executable**: Enter `git` (Jenkins will auto-detect)
   - **Install automatically**: Uncheck (if git is already in PATH)
4. Click **Save**

**Verification:**
```bash
# Verify Git is available in Jenkins
docker exec jenkins git --version
# Should show: git version 2.x.x
```

#### 9.3a.2 Configure Docker

**Step 1: Configure Docker**
1. In **Global Tool Configuration**, scroll to **Docker** section
2. Click **Add Docker**
3. Configure:
   - **Name**: Enter `Docker`
   - **Install automatically**: Uncheck
   - **Installation root**: Leave empty (uses system Docker)
4. Click **Save**

**Verification:**
```bash
# Verify Docker is accessible
docker exec jenkins docker --version
# Should show: Docker version 24.x.x or higher
```

#### 9.3a.3 Configure Environment Variables

**Step 1: Navigate to System Configuration**
1. Click **Manage Jenkins**
2. Click **Configure System**

**Step 2: Add Global Environment Variables**
1. Scroll down to **Global properties**
2. Check **Environment variables**
3. Click **Add** for each variable:

| Name | Value | Description |
|------|-------|-------------|
| `DOCKER_HOST` | `unix:///var/run/docker.sock` | Docker daemon socket |
| `PATH+EXTRA` | `/usr/local/bin` | Additional PATH for tools |

4. Click **Save**

### 9.4 Configure Credentials (Detailed)

**Overview**: Jenkins needs credentials to interact with external services. We'll configure credentials for:
1. Docker Hub (for pushing images)
2. Kubernetes (for deployment)
3. SonarQube (for code analysis)
4. GitHub (for private repositories - optional)

**Important Notes:**
- Credential IDs must match exactly with those used in Jenkinsfile
- Use strong passwords or tokens, never commit credentials to Git
- Scope should be Global for credentials used in pipelines

---

#### 9.4.1 Add Docker Hub Credentials

**Step 1: Navigate to Credentials**
1. From Jenkins Dashboard, click **Manage Jenkins**
2. Click **Manage Credentials**
3. Under **Stores scoped to Jenkins**, find **System**
4. Click on **System**
5. Click on **Global credentials (unrestricted)**
6. Click **Add Credentials** (left sidebar)

**Step 2: Create Docker Hub Access Token (Recommended)**
Before adding credentials in Jenkins, create a secure access token:

1. Go to [Docker Hub](https://hub.docker.com/)
2. Log in to your account
3. Click on your username (top right) → **Account Settings**
4. Click on **Security** (left sidebar)
5. Click **New Access Token**
6. Fill in:
   - **Access Token Description**: Enter `jenkins-ci-token`
   - **Access permissions**: Select `Read, Write, Delete`
7. Click **Generate**
8. **CRITICAL**: Copy the token immediately (it won't be shown again)
   - Example token: `dckr_pat_1234abcd5678efgh...`

**Step 3: Configure Docker Hub Credentials in Jenkins**
1. Back in Jenkins Add Credentials page:
2. **Kind**: Select `Username with password`
3. **Scope**: Select `Global (Jenkins, nodes, items, all child items, etc)`
4. **Username**: Enter your Docker Hub username
   - Example: `saikiranasamwar4`
   - **Note**: This is your Docker Hub username, NOT email
5. **Password**: Paste the access token you just created
   - **DO NOT** use your Docker Hub password, use the token
6. **ID**: Enter `dockerhub-credentials`
   - ⚠️ **IMPORTANT**: Must be exactly `dockerhub-credentials` (matches Jenkinsfile)
7. **Description**: Enter `Docker Hub login credentials for pushing images`
8. Click **Create**

**Step 4: Verification**
1. You should see the credential listed in Global credentials
2. Verify the following:
   - **ID**: `dockerhub-credentials` ✓
   - **Kind**: `Username with password` ✓
   - **Description**: Shows your description ✓
   - **Domain**: Global ✓

**Test Docker Hub Login (Optional but Recommended):**
```bash
# Test login from Jenkins container
docker exec jenkins sh -c 'echo "YOUR_TOKEN" | docker login -u YOUR_USERNAME --password-stdin'

# Expected output:
# Login Succeeded

# Logout
docker exec jenkins docker logout
```

#### 9.4.2 Add Kubeconfig Credentials

**Overview**: Kubeconfig file contains cluster authentication details for Kubernetes deployment.

**Step 1: Prepare Kubeconfig File**

**Option A: Local Minikube/Kind Cluster**
```bash
# View your kubeconfig
cat ~/.kube/config

# Create a standalone kubeconfig for this cluster (Linux/Mac)
kubectl config view --minify --flatten > kubeconfig-jenkins.yaml

# For Windows PowerShell
kubectl config view --minify --flatten | Out-File -FilePath kubeconfig-jenkins.yaml -Encoding utf8

# Verify the file
cat kubeconfig-jenkins.yaml
```

**Option B: AWS EKS Cluster**
```bash
# Update kubeconfig for EKS
aws eks update-kubeconfig --name <cluster-name> --region <region>

# Generate a standalone kubeconfig
kubectl config view --minify --flatten > kubeconfig-jenkins.yaml

# For EKS, ensure AWS credentials are also configured
```

**Option C: Azure AKS Cluster**
```bash
# Get AKS credentials
az aks get-credentials --resource-group <resource-group> --name <cluster-name>

# Generate standalone kubeconfig
kubectl config view --minify --flatten > kubeconfig-jenkins.yaml
```

**Step 2: Verify Kubeconfig Content**
The kubeconfig file should contain:
```yaml
apiVersion: v1
kind: Config
clusters:
- cluster:
    certificate-authority-data: BASE64_ENCODED_CA_CERT
    server: https://your-kubernetes-server:6443
  name: your-cluster
contexts:
- context:
    cluster: your-cluster
    user: your-user
  name: your-context
current-context: your-context
users:
- name: your-user
  user:
    client-certificate-data: BASE64_ENCODED_CLIENT_CERT
    client-key-data: BASE64_ENCODED_CLIENT_KEY
```

**Step 3: Add Secret File Credential in Jenkins**

**Method 1: Upload File (Recommended)**
1. In Jenkins, click **Add Credentials**
2. **Kind**: Select `Secret file`
3. **Scope**: Select `Global (Jenkins, nodes, items, all child items, etc)`
4. **File**: Click **Choose File**
   - Browse to `kubeconfig-jenkins.yaml`
   - Select and upload the file
5. **ID**: Enter `kubeconfig`
   - ⚠️ **IMPORTANT**: Must be exactly `kubeconfig` (matches Jenkinsfile)
6. **Description**: Enter `Kubernetes cluster configuration for deployment`
7. Click **Create**

**Method 2: Secret Text (Alternative)**
If file upload doesn't work:
1. Click **Add Credentials**
2. **Kind**: Select `Secret text`
3. **Scope**: Select `Global`
4. **Secret**: Copy entire contents of kubeconfig file and paste here
   ```bash
   # Copy file contents (Linux/Mac)
   cat kubeconfig-jenkins.yaml | pbcopy
   
   # OR manually copy the entire file content
   ```
5. **ID**: Enter `kubeconfig`
6. **Description**: Enter `Kubernetes cluster configuration (text format)`
7. Click **Create**

**Step 4: Verification**
1. The credential should appear in the list with:
   - **ID**: `kubeconfig` ✓
   - **Kind**: `Secret file` or `Secret text` ✓
   - **Description**: Your description ✓

**Test Kubernetes Access (Critical):**
```bash
# Create a test script to verify kubeconfig
docker exec jenkins bash -c 'cat > /tmp/test-k8s.sh << "EOF"
#!/bin/bash
export KUBECONFIG=/var/jenkins_home/workspace/kubeconfig
kubectl cluster-info
kubectl get nodes
EOF
chmod +x /tmp/test-k8s.sh'

# Note: Actual testing happens in pipeline context
```

#### 9.4.3 Add SonarQube Token

**Overview**: SonarQube token authenticates Jenkins for code quality analysis.

**Step 1: Access SonarQube Web Interface**

**Option A: Local Access**
```bash
# SonarQube runs on port 9000
# Open browser: http://localhost:9000
```

**Option B: Remote EC2/Server Access**
```bash
# Create SSH tunnel
ssh -i your-key.pem -L 9000:localhost:9000 ec2-user@<EC2_IP>

# Then access: http://localhost:9000
```

**Step 2: Initial SonarQube Login**
1. Open browser and navigate to `http://localhost:9000`
2. Default credentials:
   - **Username**: `admin`
   - **Password**: `admin`
3. Click **Log in**
4. **First-time login**: You'll be prompted to change password
   - Enter new password (minimum 8 characters)
   - Confirm new password
   - Click **Update**
5. **Remember** this new password for future logins

**Step 3: Generate Security Token**
1. After logging in, click on your **profile icon** (top right corner)
   - Shows "Administrator" or "admin"
2. Click **My Account** from dropdown
3. Click on **Security** tab (top menu)
4. Scroll down to **Generate Tokens** section
5. Fill in token details:
   - **Name**: Enter `jenkins-token`
   - **Type**: Select `Global Analysis Token` (recommended)
     - Alternative: `User Token` (if Global not available)
   - **Expires in**: Select `No expiration`
     - Alternative: Select `90 days` for better security
6. Click **Generate** button
7. **CRITICAL**: A token will appear in a box
   - Example: `squ_1a2b3c4d5e6f7g8h9i0j...`
   - **Copy this token IMMEDIATELY**
   - You cannot see this token again after closing
   - Store it temporarily in a text file

**Step 4: Add Token to Jenkins**
1. Return to Jenkins → **Manage Jenkins** → **Manage Credentials**
2. Go to **Global credentials** → **Add Credentials**
3. Configure SonarQube token:
   - **Kind**: Select `Secret text`
   - **Scope**: Select `Global (Jenkins, nodes, items, all child items, etc)`
   - **Secret**: Paste the SonarQube token you copied
     - Example: `squ_1a2b3c4d5e6f7g8h9i0j...`
     - ⚠️ Paste the ENTIRE token with the `squ_` prefix
   - **ID**: Enter `sonarqube-token`
     - ⚠️ **IMPORTANT**: Must be exactly `sonarqube-token` (matches Jenkinsfile)
   - **Description**: Enter `SonarQube authentication token for code analysis`
4. Click **Create**

**Step 5: Verification**
1. The credential should appear in the list:
   - **ID**: `sonarqube-token` ✓
   - **Kind**: `Secret text` ✓
   - **Description**: Your description ✓

**Test SonarQube Connection:**
```bash
# Test from Jenkins container
docker exec jenkins curl -u YOUR_TOKEN: http://localhost:9000/api/system/status

# Expected response:
# {"id":"...","version":"9.x","status":"UP"}

# If you see "200 OK" or {"status":"UP"}, connection works
```

---

#### 9.4.4 Add GitHub Credentials (Optional - For Private Repositories)

**When to use**: Only needed if your Git repository is private.

**Step 1: Create GitHub Personal Access Token**
1. Go to [GitHub](https://github.com) and log in
2. Click your **profile picture** (top right) → **Settings**
3. Scroll down and click **Developer settings** (left sidebar, at bottom)
4. Click **Personal access tokens** → **Tokens (classic)**
5. Click **Generate new token** → **Generate new token (classic)**
6. Configure token:
   - **Note**: Enter `jenkins-access-token`
   - **Expiration**: Select `90 days` or `No expiration`
   - **Select scopes** (permissions):
     - ✓ `repo` (Full control of private repositories)
     - ✓ `read:org` (Read org and team membership)
7. Scroll down and click **Generate token**
8. **CRITICAL**: Copy the token immediately
   - Example: `ghp_1A2b3C4d5E6f7G8h9I0j...`
   - Store it securely, you won't see it again

**Step 2: Add GitHub Token to Jenkins**
1. In Jenkins, go to **Manage Jenkins** → **Manage Credentials**
2. Go to **Global credentials** → **Add Credentials**
3. Configure:
   - **Kind**: Select `Username with password`
   - **Scope**: Select `Global`
   - **Username**: Enter your GitHub username
     - Example: `yourusername`
   - **Password**: Paste the Personal Access Token
     - NOT your GitHub password, use the token
   - **ID**: Enter `github-credentials`
   - **Description**: Enter `GitHub personal access token for private repos`
4. Click **Create**

**Alternative Method: SSH Key (Advanced)**
If you prefer SSH authentication:

1. Generate SSH key on Jenkins server:
```bash
# Execute in Jenkins container
docker exec -it jenkins bash

# Generate SSH key
ssh-keygen -t ed25519 -C "jenkins@yourdomain.com"
# Press Enter for default location: /var/jenkins_home/.ssh/id_ed25519
# Press Enter twice for no passphrase (or use a passphrase)

# Display public key
cat /var/jenkins_home/.ssh/id_ed25519.pub
# Copy this entire output
```

2. Add public key to GitHub:
   - GitHub → Settings → SSH and GPG keys → New SSH key
   - Title: `Jenkins CI Server`
   - Key: Paste the public key
   - Click **Add SSH key**

3. Add private key to Jenkins:
   - Jenkins → Manage Credentials → Add Credentials
   - **Kind**: Select `SSH Username with private key`
   - **Scope**: Global
   - **ID**: `github-ssh-key`
   - **Username**: `git`
   - **Private Key**: Select `Enter directly`
   - Click **Add** and paste the private key content:
     ```bash
     docker exec jenkins cat /var/jenkins_home/.ssh/id_ed25519
     ```
   - Click **Create**

---

#### 9.4.5 Credentials Summary

After completing all credential configurations, verify you have:

| Credential ID | Type | Purpose | Required |
|---------------|------|---------|----------|
| `dockerhub-credentials` | Username with password | Push Docker images | ✅ Yes |
| `kubeconfig` | Secret file/text | Kubernetes deployment | ✅ Yes |
| `sonarqube-token` | Secret text | Code quality analysis | ✅ Yes |
| `github-credentials` | Username with password OR SSH key | Private Git repos | ⚠️ Optional |

**Verification Checklist:**
- [ ] All credential IDs match Jenkinsfile exactly
- [ ] All credentials show in Global credentials list
- [ ] Tokens/passwords are secure (not plain passwords)
- [ ] Descriptions are clear for future reference

**View All Credentials:**
```
Jenkins Dashboard → Manage Jenkins → Manage Credentials → System → Global credentials
```

You should see 3-4 credentials listed with their IDs matching above table.

### 9.5 Configure SonarQube Server

**Step 1: Navigate to System Configuration**
1. Click **Manage Jenkins**
2. Click **Configure System**
3. Scroll down to the **SonarQube servers** section

**Step 2: Add SonarQube Server**
1. Check the box **Environment variables** → Enable injection of SonarQube server configuration
2. Click **Add SonarQube**
3. Fill in the configuration:
   - **Name**: Enter `SonarQube` (must match withSonarQubeEnv in Jenkinsfile)
   - **Server URL**: Enter `http://localhost:9000`
     - If SonarQube is on same EC2: `http://localhost:9000`
     - If SonarQube is on different server: `http://<SONARQUBE_IP>:9000`
   - **Server authentication token**: Select `sonarqube-token` from dropdown
4. Click **Save**

**Step 3: Configure SonarQube Scanner**
1. Click **Manage Jenkins**
2. Click **Global Tool Configuration**
3. Scroll down to **SonarQube Scanner**
4. Click **Add SonarQube Scanner**
5. Configure:
   - **Name**: Enter `SonarScanner`
   - **Install automatically**: Check this box
   - **Version**: Select latest version (e.g., `SonarQube Scanner 4.8.0.2856`)
6. Click **Save**

---

### 9.5a Additional Jenkins Configuration (Missing Steps)

**Overview**: These are important configurations that enhance Jenkins security, performance, and usability.

---

#### 9.5a.1 Configure Security Settings

**Step 1: Configure Security Realm**
1. Click **Manage Jenkins**
2. Click **Configure Global Security**
3. Verify **Security Realm** is set to:
   - **Jenkins' own user database**
   - **Allow users to sign up**: Uncheck (prevent unauthorized signups)

**Step 2: Configure Authorization**
1. In same **Configure Global Security** page
2. Find **Authorization** section
3. Recommended setting: **Logged-in users can do anything**
   - Allows authenticated users full access
   - Alternative: **Matrix-based security** for granular permissions

**Step 3: Enable Agent to Controller Security**
1. Scroll down to **Agents** section
2. Verify **Agent → Controller Security** is enabled
3. Keep default settings for security

**Step 4: CSRF Protection**
1. Find **CSRF Protection** section
2. Verify **Prevent Cross Site Request Forgery exploits** is checked ✓
3. Keep default crumb issuer

**Step 5: Save Security Settings**
- Click **Save** at bottom of page

---

#### 9.5a.2 Configure Jenkins URL and System Message

**Step 1: Set Jenkins URL**
1. Click **Manage Jenkins**
2. Click **Configure System**
3. Find **Jenkins Location** section
4. **Jenkins URL**: Update if needed
   - For local: `http://localhost:8080/`
   - For EC2: `http://YOUR_EC2_PUBLIC_IP:8080/`
   - For domain: `https://jenkins.yourdomain.com/`
5. **System Admin e-mail address**: Enter admin email
   - Example: `admin@yourdomain.com`
   - Used for email notifications

**Step 2: Add System Message (Optional)**
1. Scroll to **System Message** (top of Configure System page)
2. Add a message shown on Jenkins homepage:
   ```html
   <h2>Welcome to Task Manager CI/CD Pipeline</h2>
   <p>Jenkins automatically builds, tests, and deploys the application to Kubernetes.</p>
   ```
3. This appears on the main dashboard for all users

---

#### 9.5a.3 Configure Build Executor Settings

**Step 1: Set Number of Executors**
1. In **Manage Jenkins** → **Configure System**
2. Find **# of executors** at top
3. Set value based on your resources:
   - **1 executor**: For 2GB RAM or less
   - **2 executors**: For 4GB RAM (recommended)
   - **4+ executors**: For 8GB+ RAM (production)
4. Executors determine how many builds run simultaneously

**Step 2: Usage Optimization**
1. **Usage**: Select recommended option
   - `Use this node as much as possible` (default)
   - Builds run on Jenkins controller node

---

#### 9.5a.4 Configure Timestamper for Console Output

**Why**: Adds timestamps to console output for better debugging.

**Step 1: Install Timestamper Plugin** (if not installed)
1. **Manage Jenkins** → **Manage Plugins**
2. Search for "Timestamper"
3. Install if not present

**Step 2: Configure Timestamper**
1. **Manage Jenkins** → **Configure System**
2. Scroll to **Timestamper** section
3. Check **Add timestamps to the Console Output**
4. **Select timestamp format**:
   - `Elapsed time` (e.g., "1 hr 2 min 3 sec")
   - `System clock time` (e.g., "10:23:45")
   - Recommended: `System clock time`
5. Click **Save**

---

#### 9.5a.5 Configure Workspace Cleanup

**Purpose**: Automatically clean workspaces to save disk space.

**Step 1: Install Workspace Cleanup Plugin** (usually pre-installed)
1. **Manage Jenkins** → **Manage Plugins** → **Installed**
2. Search for "Workspace Cleanup"
3. Verify it's installed

**Step 2: Configure in Jenkinsfile** (already done if using provided Jenkinsfile)
```groovy
post {
    always {
        cleanWs()  // Cleans workspace after build
    }
}
```

**Alternative: Manual Cleanup**
```bash
# Clean all workspaces manually
docker exec jenkins find /var/jenkins_home/workspace -type d -name "*" -exec rm -rf {} +

# Clean specific pipeline workspace
docker exec jenkins rm -rf /var/jenkins_home/workspace/taskmanager-pipeline
```

---

#### 9.5a.6 Configure Email Notifications (Optional)

**Step 1: Configure Email Server**
1. **Manage Jenkins** → **Configure System**
2. Scroll to **E-mail Notification**
3. Configure SMTP server:
   - **SMTP server**: `smtp.gmail.com` (for Gmail)
   - **Default user e-mail suffix**: `@yourdomain.com`
4. Click **Advanced**:
   - **Use SMTP Authentication**: Check
   - **User Name**: Your email address
   - **Password**: App-specific password (for Gmail)
   - **Use SSL**: Check
   - **SMTP Port**: `465`

**Step 2: Test Email Configuration**
1. Check **Test configuration by sending test e-mail**
2. **Test e-mail recipient**: Enter your email
3. Click **Test configuration**
4. Check your inbox for test email

**Step 3: Configure in Jenkinsfile**
Add email notification to post section:
```groovy
post {
    success {
        emailext subject: "✅ Build SUCCESS: ${JOB_NAME} #${BUILD_NUMBER}",
                 body: "Build completed successfully.",
                 to: "team@yourdomain.com"
    }
    failure {
        emailext subject: "❌ Build FAILED: ${JOB_NAME} #${BUILD_NUMBER}",
                 body: "Build failed. Check console output for details.",
                 to: "team@yourdomain.com"
    }
}
```

---

#### 9.5a.7 Configure Proxy Settings (If Behind Corporate Firewall)

**When needed**: If Jenkins container cannot access internet for plugins/tools.

**Step 1: Configure Proxy**
1. **Manage Jenkins** → **Manage Plugins** → **Advanced**
2. Scroll to **HTTP Proxy Configuration**
3. Configure:
   - **Server**: Enter proxy server address
   - **Port**: Enter proxy port
   - **User name**: (if authentication required)
   - **Password**: (if authentication required)
   - **No Proxy Host**: `localhost,127.0.0.1`
4. Click **Validate Proxy**
5. Click **Save**

---

#### 9.5a.8 Configure Disk Space Monitoring

**Step 1: Enable Disk Space Monitoring**
1. **Manage Jenkins** → **Configure System**
2. Scroll to **Disk Usage** section (if plugin installed)
3. Or use built-in monitoring:
   - **Manage Jenkins** shows warning if disk space < 1GB

**Step 2: Manual Disk Check**
```bash
# Check Jenkins container disk usage
docker exec jenkins df -h

# Check Jenkins home directory size
docker exec jenkins du -sh /var/jenkins_home

# Check workspace sizes
docker exec jenkins du -sh /var/jenkins_home/workspace/*
```

**Cleanup Strategies:**
```bash
# Remove old builds beyond retention policy
# (Done automatically if configured)

# Clean Docker build cache
docker system prune -a -f

# Remove unused Docker volumes
docker volume prune -f
```

---

#### 9.5a.9 Configure JVM Memory Settings

**When needed**: If Jenkins is slow or running out of memory.

**Step 1: Check Current Memory**
```bash
# Check Jenkins container memory
docker stats jenkins --no-stream
```

**Step 2: Increase Memory (if needed)**
Stop and recreate Jenkins with more memory:
```bash
# Stop current Jenkins
docker stop jenkins
docker rm jenkins

# Restart with memory settings
docker run -d \
  --name jenkins \
  --restart=unless-stopped \
  -p 8080:8080 \
  -p 50000:50000 \
  -e JAVA_OPTS="-Xmx2048m -Xms1024m" \
  -v ~/jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  jenkins/jenkins:lts-jdk17
```

Explanation:
- `-Xmx2048m`: Maximum heap size 2GB
- `-Xms1024m`: Initial heap size 1GB
- Adjust based on available RAM

---

#### 9.5a.10 Enable Auto-Refresh for Dashboard

**Step 1: Configure Auto-Refresh**
1. On Jenkins **Dashboard**
2. Look for **Enable Auto Refresh** link (top right)
3. Click it to enable/disable
4. Dashboard auto-updates every 10 seconds

**Alternative**: Use Browser Extension
- Install "Auto Refresh" browser extension
- Set refresh interval: 10-30 seconds

---

#### 9.5a.11 Configuration Verification Checklist

After completing all configuration steps, verify:

**Security:**
- [ ] Admin user created with strong password
- [ ] Anonymous users cannot access Jenkins
- [ ] CSRF protection enabled
- [ ] Security realm configured

**System:**
- [ ] Jenkins URL set correctly
- [ ] System admin email configured
- [ ] Number of executors appropriate for resources
- [ ] Disk space monitoring active

**Tools:**
- [ ] Git configured and accessible
- [ ] Docker configured and accessible
- [ ] SonarQube Scanner installed
- [ ] All plugins installed and updated

**Credentials:**
- [ ] All 3-4 credentials configured correctly
- [ ] Credentials match Jenkinsfile IDs exactly

**Integrations:**
- [ ] SonarQube server configured and tested
- [ ] Docker registry accessible
- [ ] Kubernetes cluster accessible

**Optional But Recommended:**
- [ ] Timestamper enabled for console output
- [ ] Email notifications configured (if needed)
- [ ] Workspace cleanup enabled
- [ ] Build retention policy set

**Quick Verification Commands:**
```bash
# Test all critical components
echo "Checking Jenkins..."
curl -I http://localhost:8080

echo "Checking Docker access..."
docker exec jenkins docker ps

echo "Checking Git..."
docker exec jenkins git --version

echo "Checking kubectl..."
docker exec jenkins kubectl version --client

echo "Checking SonarQube..."
curl -s http://localhost:9000/api/system/status

echo "All checks passed! ✅"
```

---

### 9.6 Create and Configure Pipeline (Detailed)

**Overview**: This section guides you through creating a Jenkins Pipeline job that will automate the CI/CD process using the Jenkinsfile from your repository.

**Prerequisites Check:**
- [ ] Jenkins is running and accessible
- [ ] All credentials are configured (dockerhub, kubeconfig, sonarqube-token)
- [ ] SonarQube server is configured in Jenkins
- [ ] Git repository contains Jenkinsfile
- [ ] You have admin access to Jenkins

---

#### 9.6.1 Create New Pipeline Job

**Step 1: Access New Item**
1. From Jenkins **Dashboard** (main page)
2. Look at the left sidebar
3. Click **New Item** (first option in sidebar)

**Step 2: Configure Item Name and Type**
1. In the **Enter an item name** field:
   - Type: `taskmanager-pipeline`
   - Or use your preferred name (e.g., `python-devops-cicd`)
   - **Note**: No spaces allowed, use hyphens or underscores
2. Scroll down and select **Pipeline** as the project type
   - You'll see various options: Freestyle, Pipeline, Multi-branch Pipeline, etc.
   - Click on **Pipeline** (it will highlight)
3. Click **OK** button at the bottom
4. You'll be redirected to the Pipeline Configuration page

---

#### 9.6.2 Configure General Settings

**Step 1: Description and Display**
1. At top of configuration page:
   - **Description**: Enter a meaningful description
     ```
     CI/CD Pipeline for Task Manager Application
     Automated build, test, quality check, and deployment to Kubernetes
     ```
   - **Display Name**: (Optional) Leave empty or enter custom display name

**Step 2: GitHub Project (Optional)**
If your code is on GitHub:
1. Check the box **GitHub project**
2. **Project url**: Enter your repository URL
   - Example: `https://github.com/yourusername/Python-DevOps/`
   - ⚠️ Use the web URL (not SSH URL)
   - ⚠️ Include trailing slash `/`

**Step 3: Build Retention**
Configure how long to keep build history:
1. Check **Discard old builds** (recommended to save disk space)
2. **Strategy**: Verify `Log Rotation` is selected
3. Configure retention:
   - **Days to keep builds**: Enter `7`
     - Keeps builds for last 7 days
   - **Max # of builds to keep**: Enter `10`
     - Keeps maximum 10 builds regardless of age
   - Leave other fields empty

**Why this matters**: Old builds consume disk space. This keeps recent builds for debugging while cleaning old ones.

---

#### 9.6.3 Configure Build Triggers

**Overview**: Build triggers determine WHEN your pipeline runs.

**Choose ONE of the following options:**

**Option A: Manual Trigger Only (Recommended for Testing)**
- **Don't check any boxes** in the Build Triggers section
- Pipeline will only run when you click "Build Now"
- Best for: Initial setup, testing, learning

**Option B: Poll SCM (Automatic Builds)**
Good for small teams without webhook setup:
1. Check the box **Poll SCM**
2. **Schedule**: Enter cron-like schedule
   - `H/5 * * * *` - Check every 5 minutes
   - `H/15 * * * *` - Check every 15 minutes
   - `H/30 * * * *` - Check every 30 minutes
3. Click the **?** icon next to Schedule for syntax help

**How Poll SCM works**:

**How Poll SCM works**:
- Jenkins periodically checks Git repository for changes
- If new commits detected, pipeline automatically runs
- `H` provides some randomness to avoid server spikes

**Option C: GitHub Webhook (Recommended for Production)**
Most efficient method - GitHub notifies Jenkins of changes:

1. **In Jenkins:**
   - Check **GitHub hook trigger for GITScm polling**

2. **In GitHub Repository:**
   - Go to your repository on GitHub
   - Click **Settings** (top menu)
   - Click **Webhooks** (left sidebar)
   - Click **Add webhook**
   - Configure webhook:
     - **Payload URL**: `http://YOUR_JENKINS_URL:8080/github-webhook/`
       - Example: `http://52.123.45.67:8080/github-webhook/`
       - ⚠️ Include trailing `/github-webhook/`
       - ⚠️ Must be publicly accessible URL
     - **Content type**: Select `application/json`
     - **Which events**: Select `Just the push event`
     - **Active**: Check this box ✓
   - Click **Add webhook**
   - GitHub will test the webhook (you'll see a green ✓ if successful)

**Option D: Trigger Builds Remotely**
Advanced option for API-based triggers:
1. Check **Trigger builds remotely**
2. **Authentication Token**: Enter a secure token (e.g., `mySecureToken123`)
3. Use URL to trigger: `http://JENKINS_URL/job/taskmanager-pipeline/build?token=mySecureToken123`

**Recommendation for beginners**: Use **Manual trigger** first, then switch to **Poll SCM** after testing.

---

#### 9.6.4 Configure Pipeline Definition

**Step 1: Pipeline Section**
Scroll down to the **Pipeline** section (bottom of configuration page)

**Step 2: Choose Definition Type**
1. **Definition**: Select `Pipeline script from SCM`
   - This tells Jenkins to get pipeline code from your Git repository
   - Alternative: `Pipeline script` (write Jenkinsfile directly in Jenkins - not recommended)

**Why "Pipeline script from SCM"?**
- ✅ Version control for Jenkinsfile
- ✅ Easy to update - just push to Git
- ✅ Team collaboration
- ✅ Code review for CI/CD changes

**Step 3: Configure SCM (Git)**
1. **SCM**: Select `Git` from dropdown
2. You'll see Git-specific configuration options appear

**Step 4: Repository Configuration**

**Repository URL:**
- **For Public Repository:**
  - Enter HTTPS URL: `https://github.com/yourusername/Python-DevOps.git`
  - Example: `https://github.com/SaiKiran-Asamwar/Python-DevOps.git`

- **For Private Repository:**
  - Enter HTTPS URL: `https://github.com/yourusername/Python-DevOps.git`
  - OR SSH URL: `git@github.com:yourusername/Python-DevOps.git`

**Credentials:**
- **For Public Repository:**
  - Select `- none -` (no authentication needed)

- **For Private Repository with HTTPS:**
  - Click **Add** dropdown → **Jenkins**
  - Add GitHub credentials (see section 9.4.4)
  - Or select existing `github-credentials` from dropdown

- **For Private Repository with SSH:**
  - Select `github-ssh-key` (configured in section 9.4.4)

**Repository Browser (Optional):**
- Select `(Auto)` or leave as default

**Step 5: Branches to Build**
1. **Branch Specifier**: Enter the branch pattern
   - For main branch: `*/main`
   - For master branch: `*/master`
   - For any branch: `*/*`
   - For specific branch: `*/development`
   - For multiple: `*/main */develop`

**What does `*/main` mean?**
- `*` = any remote (usually `origin`)
- `/main` = the main branch
- Result: Jenkins will build the `main` branch from any remote

**Step 6: Configure Script Path**
1. **Script Path**: Enter `Jenkinsfile`
   - This is the path to Jenkinsfile in your repository
   - If Jenkinsfile is in root: `Jenkinsfile`
   - If in subfolder: `ci/Jenkinsfile` or `.jenkins/Jenkinsfile`

**Step 7: Lightweight Checkout (Optimization)**
1. Check **Lightweight checkout** box
   - This speeds up checkout by fetching only Jenkinsfile first
   - Full checkout happens in the pipeline's checkout stage
   - Recommended: ✅ Enabled

**Step 8: Additional Behaviors (Optional)**
Click **Add** under "Additional Behaviours" for advanced options:
- **Clean before checkout** - Ensures clean workspace (recommended for production)
- **Clean after checkout** - Removes untracked files
- **Checkout to subdirectory** - Checkout into specific folder
- **Sparse Checkout** - Checkout only specific paths

For most cases, you can skip this section.

---

#### 9.6.5 Save and Verify Configuration

**Step 1: Save the Pipeline**
1. Scroll to the bottom of the configuration page
2. Click **Save** button
3. You'll be redirected to the Pipeline project page

**Step 2: Verify Pipeline Page**
You should see:
- **Pipeline name**: `taskmanager-pipeline` (top of page)
- **Left sidebar menu**:
  - Status
  - Changes
  - Build Now
  - Configure
  - Delete Pipeline
  - Pipeline Syntax
- **Main area**: Shows build history (empty for now)
- **Description**: Your description text

**Step 3: Review Configuration**
1. Click **Configure** (left sidebar)
2. Review all settings:
   - ✓ Description is correct
   - ✓ Build retention is configured
   - ✓ Build triggers are set
   - ✓ Pipeline definition is `Pipeline script from SCM`
   - ✓ Git repository URL is correct
   - ✓ Credentials are selected (if private repo)
   - ✓ Branch specifier is `*/main` or `*/master`
   - ✓ Script path is `Jenkinsfile`
3. Make any necessary corrections
4. Click **Save**

---

#### 9.6.6 Update Jenkinsfile with Your Settings

**Critical**: Before running the pipeline, update Jenkinsfile with your specific values.

**Step 1: Open Jenkinsfile**
```bash
# Navigate to your project directory
cd Python-DevOps/

# Edit Jenkinsfile
nano Jenkinsfile
# Or use your preferred editor
```

**Step 2: Update Environment Variables**
Find the `environment` section and update:

```groovy
environment {
    // REQUIRED: Update with your Docker Hub username
    DOCKER_REGISTRY = 'YOUR_DOCKERHUB_USERNAME'  // ← Change this
    
    // These should match your credential IDs (usually don't change)
    DOCKER_CREDENTIALS = credentials('dockerhub-credentials')
    KUBECONFIG = credentials('kubeconfig')
    SONAR_TOKEN = credentials('sonarqube-token')
    
    // Update if SonarQube is on different server
    SONAR_HOST_URL = 'http://localhost:9000'  // ← Update if needed
    
    // Image tags (optional to change)
    IMAGE_TAG = 'v1.0'
    BACKEND_IMAGE = "${DOCKER_REGISTRY}/taskmanager-backend:${IMAGE_TAG}"
    FRONTEND_IMAGE = "${DOCKER_REGISTRY}/taskmanager-frontend:${IMAGE_TAG}"
}
```

**Step 3: Example Update**
If your Docker Hub username is `john_doe`, change:
```groovy
// FROM:
DOCKER_REGISTRY = 'YOUR_DOCKERHUB_USERNAME'

// TO:
DOCKER_REGISTRY = 'john_doe'
```

**Step 4: Commit and Push Changes**
```bash
git add Jenkinsfile
git commit -m "Update Jenkinsfile with personal Docker Hub username"
git push origin main
```

**Step 5: Verify Jenkinsfile Syntax (Optional)**
In Jenkins:
1. Go to your pipeline → **Pipeline Syntax**
2. Useful for generating pipeline code snippets
3. Click **Declarative Directive Generator** to validate syntax

---

#### 9.6.7 Pre-Flight Checklist

Before running your first build, verify:

**Credentials:**
- [ ] `dockerhub-credentials` exists with your Docker Hub token
- [ ] `kubeconfig` exists with valid cluster config
- [ ] `sonarqube-token` exists with valid SonarQube token
- [ ] (Optional) `github-credentials` if using private repo

**Services Running:**
```bash
# Verify all services
docker ps

# Should see:
# - jenkins (running)
# - sonarqube (running)

# Verify Kubernetes cluster
kubectl get nodes
# Should show at least one node in Ready state
```

**Jenkins Tools:**
```bash
# Verify Jenkins can access Docker
docker exec jenkins docker --version

# Verify Jenkins can access Git
docker exec jenkins git --version

# Verify SonarQube is accessible
curl -s http://localhost:9000/api/system/status
```

**Jenkinsfile:**
- [ ] Jenkinsfile exists in repository root
- [ ] `DOCKER_REGISTRY` is updated with your username
- [ ] All credential IDs match Jenkins configuration
- [ ] Branch name in pipeline config matches your repo

**Configuration:**
- [ ] Pipeline is configured to use correct repository
- [ ] Branch specifier matches your branch name
- [ ] Script path is set to `Jenkinsfile`

If all checks pass, you're ready to run your first pipeline! ✅

### 9.7 Run Pipeline (Comprehensive Step-by-Step Guide)

**Overview**: This section guides you through running your first Jenkins pipeline build and monitoring its progress.

---

#### 9.7.1 Start Your First Build

**Step 1: Navigate to Pipeline**
1. From Jenkins Dashboard, click on your pipeline name: **taskmanager-pipeline**
2. You'll see the pipeline overview page

**Step 2: Initiate Build**
1. Look at the left sidebar
2. Click **Build Now**
3. What happens:
   - Jenkins immediately schedules the build
   - A new build appears in **Build History** (left sidebar, bottom)
   - Build number starts at **#1**
   - Status icon shows: ⏸️ (pending) or 🔵 (running)

**What you should see:**
```
Build History
#1 [clock icon] In progress (started X seconds ago)
```

**Step 3: Initial Observations**
After clicking "Build Now":
- Build number **#1** appears within 1-2 seconds
- Icon changes from ⏸️ (gray) to 🔵 (blue/blinking) = building
- Build description shows date/time started
- Jenkins begins executing the Jenkinsfile

---

#### 9.7.2 Monitor Build Progress (Real-Time)

**Method 1: Console Output (Detailed Logs)**

**Step 1: Access Console Output**
1. Click on the build number (**#1**) in Build History
2. You'll see the build details page
3. Click **Console Output** (left sidebar)

**Step 2: Understanding Console Output**
You'll see detailed log output like:
```
Started by user admin
Running in Durability level: MAX_SURVIVABILITY
[Pipeline] Start of Pipeline
[Pipeline] node
Running on Jenkins in /var/jenkins_home/workspace/taskmanager-pipeline
[Pipeline] {
[Pipeline] stage
[Pipeline] { (Declarative: Checkout SCM)
[Pipeline] checkout
Cloning repository https://github.com/yourusername/Python-DevOps.git
 > git init /var/jenkins_home/workspace/taskmanager-pipeline
 > git fetch --no-tags --progress https://github.com/...
Checking out Revision abc1234... (refs/remotes/origin/main)
[Pipeline] }
[Pipeline] // stage
[Pipeline] stage
[Pipeline] { (Git Checkout)
...
```

**Step 3: Watch Stages Execute**
You'll see each stage from your Jenkinsfile:
1. **Declarative: Checkout SCM** (automatic)
   - Clones your Git repository
   - Checks out specified branch
2. **Git Checkout** (your first stage)
   - Verifies checkout
   - Shows commit hash
3. **SonarQube Analysis**
   - Runs code quality scan
   - Shows analysis results
4. **Docker Build - Backend**
   - Builds backend Docker image
   - Shows layer caching
5. **Docker Build - Frontend**
   - Builds frontend Docker image
6. **Docker Push**
   - Logs in to Docker Hub
   - Pushes both images
7. **Deploy to Kubernetes**
   - Applies K8s manifests
   - Shows deployment status
8. **Verify Deployment**
   - Checks pod status

**Step 4: Real-Time Monitoring Tips**
- Console auto-scrolls to latest output
- To pause auto-scroll: Click anywhere in the log
- To resume: Scroll to bottom or refresh
- Look for:
  - `[Pipeline] stage` - New stage starting
  - `SUCCESS` or `FAILURE` - Stage completion
  - Error messages in red (if viewing in browser)

**Method 2: Stage View (Visual Overview)**

**Step 1: Access Stage View**
1. From build details page (click build #1)
2. Look at the main content area (center of page)
3. You'll see a visual representation of pipeline stages

**Step 2: Understanding Stage View**
Visual indicators:
- **Blue/Blinking** (◐) - Stage currently running
- **Green** (✓) - Stage passed successfully
- **Red** (✗) - Stage failed
- **Gray** (○) - Stage not run yet or skipped
- **Yellow** (⚠) - Stage completed with warnings

Example display:
```
[✓ Git Checkout] → [◐ SonarQube Analysis] → [○ Docker Build] → [○ Push] → [○ Deploy]
    2s                 Currently running            Pending      Pending    Pending
```

**Step 3: Interact with Stage View**
- **Click on a stage** to see its specific logs
- **Hover over stage** to see timing information
- **Green bar** below stage shows progress
- **Click "Logs"** button to see stage-specific output

**Method 3: Blue Ocean (Modern UI - Optional)**

If you installed Blue Ocean plugin:

**Step 1: Access Blue Ocean**
1. From pipeline page, click **Open Blue Ocean** (left sidebar)
2. Or navigate to: `http://localhost:8080/blue/organizations/jenkins/taskmanager-pipeline/`

**Step 2: Blue Ocean Features**
- Beautiful, modern interface
- Real-time animated pipeline visualization
- Better log organization
- Easier to identify failures
- Timeline view shows parallel stages

**Comparison of Views:**
| Feature | Console Output | Stage View | Blue Ocean |
|---------|---------------|------------|------------|
| Detailed logs | ✅ Full | ⚠️ Summary | ✅ Full |
| Visual stages | ❌ No | ✅ Yes | ✅ Beautiful |
| Modern UI | ❌ Classic | ⚠️ Basic | ✅ Modern |
| Real-time | ✅ Yes | ✅ Yes | ✅ Yes |
| Best for | Debugging | Overview | General use |

---

#### 9.7.3 Understand Build Progress Indicators

**Build Status Icons (Build History):**
- 🔵 **Blue/Blinking** - Build in progress
- ☀️ **Blue Solid** - Build successful
- ❌ **Red** - Build failed
- ⚠️ **Yellow** - Build unstable (passed but with warnings)
- ⏸️ **Gray** - Build aborted or not started
- ⏰ **Clock** - Build pending/queued

**Weather Icons (Overall health):**
Shows success rate of recent builds:
- ☀️ **Sunny** - 80-100% success rate (excellent)
- 🌤️ **Partly Cloudy** - 60-80% success rate (good)
- ⛅ **Cloudy** - 40-60% success rate (fair)
- 🌧️ **Rainy** - 20-40% success rate (poor)
- ⛈️ **Stormy** - 0-20% success rate (critical)

---

#### 9.7.4 Monitor Specific Stages

**Step 1: View Individual Stage Logs**
From Console Output, find stage boundaries:
```
[Pipeline] stage
[Pipeline] { (SonarQube Analysis)
[Pipeline] withSonarQubeEnv
... (stage-specific logs) ...
[Pipeline] }
[Pipeline] // stage
```

**Step 2: Key Information Per Stage**

**Git Checkout Stage:**
```
Cloning the remote Git repository
Checking out Revision abc1234567890... (refs/remotes/origin/main)
Commit message: "your commit message"
```
- ✓ Verify correct commit hash
- ✓ Verify correct branch
- ✓ Check commit message

**SonarQube Analysis Stage:**
```
INFO: Scanner configuration file: /var/jenkins_home/...
INFO: Project root configuration file: NONE
INFO: SonarQube Scanner 4.8.0.2856
INFO: Analyzing on SonarQube server 9.x
INFO: Analysis report uploaded in 123ms
INFO: ANALYSIS SUCCESSFUL
```
- ✓ Look for "ANALYSIS SUCCESSFUL"
- ✓ Check for quality gate status
- ⚠️ Note any code smells or bugs

**Docker Build Stages:**
```
[Pipeline] sh
+ docker build -t yourusername/taskmanager-backend:v1.0 backend/
Step 1/8 : FROM python:3.11-slim
Step 2/8 : WORKDIR /app
Step 3/8 : COPY requirements.txt .
Step 4/8 : RUN pip install --no-cache-dir -r requirements.txt
...
Successfully built abc123def456
Successfully tagged yourusername/taskmanager-backend:v1.0
```
- ✓ Watch for "Successfully built"
- ✓ Verify image tags are correct
- ⏱️ Monitor build time (first build slower, cached builds faster)

**Docker Push Stage:**
```
+ echo **** | docker login -u yourusername --password-stdin
Login Succeeded
+ docker push yourusername/taskmanager-backend:v1.0
The push refers to repository [docker.io/yourusername/taskmanager-backend]
abc123: Pushed
def456: Pushed
...
v1.0: digest: sha256:abc123... size: 2345
```
- ✓ "Login Succeeded" confirms credentials work
- ✓ "Pushed" for each layer
- ✓ Final digest shows successful push

**Deploy to Kubernetes Stage:**
```
+ kubectl apply -f k8s/namespace.yaml
namespace/taskmanager created
+ kubectl apply -f k8s/postgres-pvc.yaml
persistentvolumeclaim/postgres-pvc created
+ kubectl apply -f k8s/postgres-deployment.yaml
deployment.apps/postgres created
...
```
- ✓ "created" or "configured" for each resource
- ⚠️ "unchanged" means resource already exists (OK)
- ❌ Errors show as "Error from server"

**Verify Deployment Stage:**
```
+ kubectl get pods -n taskmanager

**Verify Deployment Stage:**
```
+ kubectl get pods -n taskmanager
NAME                        READY   STATUS    RESTARTS   AGE
backend-xxx                 1/1     Running   0          10s
frontend-yyy                1/1     Running   0          10s
postgres-zzz                1/1     Running   0          15s
```
- ✓ All pods show "Running" status
- ✓ READY shows "1/1" (all containers ready)
- ⚠️ "Pending" or "ContainerCreating" means still deploying
- ❌ "CrashLoopBackOff" or "Error" means deployment failed

---

#### 9.7.5 Check Build Result

**Step 1: Wait for Build Completion**
- Average build time: 5-15 minutes (first build)
- Subsequent builds: 3-8 minutes (with Docker layer caching)
- The console will stop scrolling when complete

**Step 2: Identify Build Status**

**SUCCESS (Best Case):**
```
[Pipeline] End of Pipeline
Finished: SUCCESS
```
Visual indicators:
- ✅ Build icon changes to blue/green checkmark
- ☀️ Weather icon shows sunny
- 🕐 Build duration shown (e.g., "2 min 34 sec")
- All stages show green ✓ in Stage View

**Actions after SUCCESS:**
1. Verify application is deployed:
   ```bash
   kubectl get pods -n taskmanager
   kubectl get services -n taskmanager
   ```
2. Test application:
   ```bash
   # Get service URL
   kubectl get ingress -n taskmanager
   
   # Or port-forward for local testing
   kubectl port-forward -n taskmanager svc/frontend 8000:80
   # Access: http://localhost:8000
   ```
3. Check Docker Hub for pushed images:
   - Visit: `https://hub.docker.com/r/yourusername/taskmanager-backend`
   - Verify `v1.0` tag exists

**FAILURE (Need to Debug):**
```
[Pipeline] End of Pipeline
ERROR: script returned exit code 1
Finished: FAILURE
```
Visual indicators:
- ❌ Build icon shows red X
- 🌧️ Weather icon shows clouds/rain
- Failed stage shows red ✗ in Stage View
- Error message in console output

**Actions after FAILURE:**
1. **Identify Which Stage Failed:**
   - Check Stage View - the red ✗ shows where
   - Or search Console Output for `ERROR` or `FAILURE`

2. **Common Failure Points:**

   **SonarQube Analysis Failed:**
   ```
   ERROR: Unable to connect to SonarQube server
   ```
   Solution: Verify SonarQube is running:
   ```bash
   docker ps | grep sonarqube
   curl http://localhost:9000/api/system/status
   ```

   **Docker Build Failed:**
   ```
   ERROR: failed to solve: failed to fetch
   ```
   Solution: Check Dockerfile syntax, verify base images exist

   **Docker Push Failed:**
   ```
   denied: requested access to the resource is denied
   ```
   Solution: Verify Docker Hub credentials, check username in DOCKER_REGISTRY

   **Kubernetes Deploy Failed:**
   ```
   Error from server (Forbidden): error when creating
   ```
   Solution: Check kubeconfig credentials, verify cluster access

3. **Fix and Rebuild:**
   - Fix the identified issue
   - Commit and push changes (if code fixes needed)
   - Click **Build Now** again

**UNSTABLE (Warning):**
```
[Pipeline] End of Pipeline
Finished: UNSTABLE
```
- ⚠️ Build completed but has warnings
- Usually from test failures or quality gate issues
- Application may still be deployed but needs attention

---

#### 9.7.6 View Build Artifacts and Reports

**Step 1: Access Build Details**
1. Click on build number (**#1**)
2. You'll see the build details page

**Step 2: Available Information**

**Build Summary:**
- **Status**: SUCCESS/FAILURE/UNSTABLE
- **Duration**: Total build time
- **Started**: Date and time build began
- **Triggered by**: Who/what started the build (e.g., "Started by user admin")

**SonarQube Analysis Report:**
1. Look for "SonarQube" section or link in build page
2. Or visit SonarQube directly:
   - Go to: `http://localhost:9000`
   - Find project: `taskmanager` or your project key
   - View analysis results:
     - Bugs
     - Vulnerabilities
     - Code smells
     - Coverage
     - Duplications

**Console Output:**
- Full log of entire build
- Downloadable for offline analysis

**Changes (if any):**
- Shows Git commits that triggered this build
- Author, commit message, changed files

---

#### 9.7.7 Run Subsequent Builds

**Trigger Next Build:**
1. Make changes to your code
2. Commit and push:
   ```bash
   git add .
   git commit -m "Updated feature X"
   git push origin main
   ```
3. Build triggers automatically (if Poll SCM or webhook configured)
4. Or manually: Click **Build Now**

**What's Different in Subsequent Builds:**
- ✅ Faster Docker builds (layer caching)
- ✅ Build history grows (#2, #3, #4, ...)
- ✅ "Changes" shows what commits triggered build
- ✅ Can compare with previous builds

**Build Trends:**
After multiple builds, you'll see:
- **Build history graph** showing success/failure trend
- **Average build duration**
- **Success rate** (weather icon)

---

#### 9.7.8 Advanced: Build with Parameters

**Step 1: Add Parameters to Jenkinsfile (Optional)**
Edit Jenkinsfile and add at top:
```groovy
pipeline {
    agent any
    
    parameters {
        choice(
            name: 'ENVIRONMENT',
            choices: ['dev', 'staging', 'prod'],
            description: 'Deployment environment'
        )
        string(
            name: 'IMAGE_TAG',
            defaultValue: 'v1.0',
            description: 'Docker image tag'
        )
        booleanParam(
            name: 'RUN_TESTS',
            defaultValue: true,
            description: 'Run tests before deployment'
        )
    }
    
    environment {
        // Use parameter
        IMAGE_TAG = "${params.IMAGE_TAG}"
        // ...
    }
}
```

**Step 2: Build with Parameters**
After adding parameters:
1. **Build Now** changes to **Build with Parameters**
2. Click it
3. Select/enter values:
   - Environment: `dev`
   - Image Tag: `v1.1`
   - Run Tests: ✓
4. Click **Build**

**Benefits:**
- Deploy to different environments
- Use different image versions
- Conditionally run stages
- More flexible CI/CD

---

#### 9.7.9 Pipeline Execution Checklist

**Before Each Build:**
- [ ] All required services running (SonarQube, Kubernetes)
- [ ] Latest code pushed to Git repository
- [ ] DOCKER_REGISTRY matches your Docker Hub username
- [ ] Credentials are valid and not expired

**During Build:**
- [ ] Monitor Console Output for errors
- [ ] Watch Stage View for progress
- [ ] Check approximate build time (unusual delays = problems)

**After Successful Build:**
- [ ] Verify pods are running in Kubernetes
- [ ] Test application functionality
- [ ] Check Docker Hub for new images
- [ ] Review SonarQube analysis report
- [ ] Verify deployment matches expected version

**After Failed Build:**
- [ ] Identify failed stage
- [ ] Read error message carefully
- [ ] Check service dependencies
- [ ] Verify credentials and configurations
- [ ] Fix issue and rebuild
- [ ] Document the issue/solution for future reference

---

#### 9.7.10 Understanding Build Timeline

**Typical Build Timeline (First successful build):**

```
Time    Stage                   Activity
00:00   Started                 User clicks "Build Now"
00:02   SCM Checkout           Clone Git repository
00:15   Git Checkout           Verify checkout
00:20   SonarQube Analysis     Scan code quality (1-3 min)
03:30   Docker Build Backend   Build + tag image (1-2 min)
05:00   Docker Build Frontend  Build + tag image (1 min)
06:00   Docker Push            Push both images (1-2 min)
08:00   Deploy to K8s          Apply manifests
08:30   Verify Deployment      Check pod status
09:00   Finished               SUCCESS ✓
```

**Subsequent builds are faster:**
- Docker layer caching reduces build time
- Git clone becomes fetch (smaller)
- Typical subsequent build: 3-5 minutes

---

#### 9.7.11 Troubleshooting Build Issues

**Issue: Build Stuck/Hanging**
Symptoms: Build runs for very long time with no progress

Common causes:
- Waiting for user input (shouldn't happen with declarative pipeline)
- Network timeout (downloading large images)
- Resource exhaustion (out of memory/disk)

Solution:
```bash
# Check Jenkins container resources
docker stats jenkins

# Check disk space
docker exec jenkins df -h

# If stuck, abort build
# Click build #X → Click "Abort" (left sidebar)
```

**Issue: "Workspace is locked"**
Error: `Waiting for workspace to be unlocked`

Solution:
```bash
# Previous build might not have cleaned up
# Wait 2-3 minutes for timeout,, or restart Jenkins
docker restart jenkins
```

**Issue: Docker daemon not accessible**
Error: `Cannot connect to Docker daemon`

Solution:
```bash
# Verify Docker socket mount
docker inspect jenkins | grep /var/run/docker.sock

# Re-add permissions
docker exec -u root jenkins usermod -aG docker jenkins
docker restart jenkins
```

**Issue: Kubectl not found**
Error: `kubectl: command not found`

Solution:
```bash
# Install kubectl in Jenkins container
docker exec -u root jenkins bash -c "
  curl -LO https://dl.k8s.io/release/\$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl
  chmod +x kubectl
  mv kubectl /usr/local/bin/
"
```

---

#### 9.7.12 Build Success Confirmation

**Final Verification Steps:**

**1. Check Jenkins**
- Build shows SUCCESS ✓
- All stages green
- No error messages

**2. Check Docker Hub**
```bash
# Visit Docker Hub website
# Navigate to: https://hub.docker.com/r/YOUR_USERNAME

# Or use CLI
docker search YOUR_USERNAME/taskmanager
```

**3. Check Kubernetes**
```bash
# All pods running
kubectl get pods -n taskmanager
# Should show Running status

# Services accessible
kubectl get svc -n taskmanager

# Check deployment status
kubectl rollout status deployment/backend -n taskmanager
kubectl rollout status deployment/frontend -n taskmanager
```

**4. Check Application**
```bash
# Port forward to test locally
kubectl port-forward -n taskmanager svc/frontend 8000:80

# Open browser: http://localhost:8000
# Application should load
```

**5. Check SonarQube**
- Visit: `http://localhost:9000`
- Find your project
- Verify analysis completed
- Check quality gate status

**Success Indicators:**
- ✅ Jenkins build: SUCCESS
- ✅ Docker images: Pushed and tagged
- ✅ Kubernetes: All pods Running (1/1)
- ✅ Application: Accessible and functional
- ✅ SonarQube: Analysis passed

🎉 **Congratulations!** Your CI/CD pipeline is working correctly!

---

### 9.8 Troubleshooting Common Issues

#### Issue 1: SonarQube Connection Failed
**Error**: `Unable to connect to SonarQube server`

**Solution**:
```bash
# Verify SonarQube is running
docker ps | grep sonarqube

# Check SonarQube logs
docker logs sonarqube

# Test connection from Jenkins container
docker exec jenkins curl -I http://localhost:9000
```

#### Issue 2: Docker Permission Denied
**Error**: `Got permission denied while trying to connect to Docker daemon`

**Solution**:
```bash
# Add Jenkins user to docker group again
docker exec -u root jenkins bash -c "usermod -aG docker jenkins"
docker restart jenkins

# Verify
docker exec jenkins docker ps
```

#### Issue 3: Kubectl Not Found
**Error**: `kubectl: command not found`

**Solution**:
```bash
# Install kubectl in Jenkins container
docker exec -u root jenkins bash -c "
  curl -LO https://dl.k8s.io/release/\$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl
  chmod +x kubectl
  mv kubectl /usr/local/bin/
"

# Verify
docker exec jenkins kubectl version --client
```

#### Issue 4: Kubeconfig Not Working
**Error**: `Unable to connect to the server`

**Solution**:
```bash
# Update kubeconfig with correct server URL
kubectl config view

# If using EKS, update kubeconfig
aws eks update-kubeconfig --name <cluster-name> --region <region>

# Re-upload the kubeconfig credential in Jenkins
```

#### Issue 5: Docker Hub Push Failed
**Error**: `denied: requested access to the resource is denied`

**Solution**:
1. Verify Docker Hub credentials are correct
2. Update image name to include your username:
   ```groovy
   DOCKER_REGISTRY = 'yourusername'  // Not 'saikiranasamwar4'
   ```
3. Test login manually:
   ```bash
   docker exec jenkins docker login -u yourusername -p yourpassword
   ```

### 9.9 Pipeline Best Practices

**1. Use Multibranch Pipeline** (Optional Advanced Setup)
- Creates separate pipelines for each branch
- Better for teams working on multiple features

**2. Set Up Notifications**
- Configure email notifications: Manage Jenkins → Configure System → E-mail Notification
- Or use Slack/Teams integration

**3. Archive Artifacts**
Add to Jenkinsfile:
```groovy
post {
    always {
        archiveArtifacts artifacts: '**/target/*.jar', allowEmptyArchive: true
        junit '**/target/test-*.xml'
    }
}
```

**4. Use Build Parameters**
Make pipeline configurable:
```groovy
parameters {
    choice(name: 'ENVIRONMENT', choices: ['dev', 'staging', 'prod'], description: 'Deployment environment')
    booleanParam(name: 'RUN_TESTS', defaultValue: true, description: 'Run tests')
}
```

**5. Enable Console Output Timestamps**
- Manage Jenkins → Configure System → Timestamps → Add to all console output

### 9.10 Verify Complete Setup

**Checklist**:
- [ ] Jenkins accessible at http://localhost:8080
- [ ] Admin user created and logged in
- [ ] All required plugins installed
- [ ] Three credentials configured (dockerhub, kubeconfig, sonarqube-token)
- [ ] SonarQube server configured
- [ ] SonarQube Scanner installed
- [ ] Pipeline job created and configured
- [ ] First build runs successfully
- [ ] All stages pass (Git, SonarQube, Docker Build, Docker Push, K8s Deploy)

**Quick Test**:
```bash
# Verify all services are running
docker ps

# Expected containers:
# jenkins
# sonarqube
# (other project containers)

# Check Jenkins can access Docker
docker exec jenkins docker ps

# Check Jenkins can access kubectl
docker exec jenkins kubectl get nodes
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
