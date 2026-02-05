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

### 1.1 Launch EC2 Instance

**Recommended Configuration:**
- **AMI:** Amazon Linux 2023 (latest version)
- **Instance type:** 
  - Minimum: `t3.medium` (2 vCPU, 4GB RAM) - for application only
  - Recommended: `t3.large` (2 vCPU, 8GB RAM) - for full stack + Jenkins + monitoring
  - Production: `t3.xlarge` (4 vCPU, 16GB RAM) - for high availability
- **Storage:** 
  - Root volume: 30-50 GiB gp3 SSD
  - IOPS: 3000 (default)
  - Throughput: 125 MB/s (default)
- **Key pair:** Create new or use existing SSH key (required for access)

### 1.2 Security Group Configuration

Create a security group with the following inbound rules:

| Rule Name | Type | Protocol | Port Range | Source | Description |
|-----------|------|----------|------------|--------|-------------|
| SSH | SSH | TCP | 22 | Your IP/32 | Secure SSH access (restrict to your IP) |
| HTTP | HTTP | TCP | 80 | 0.0.0.0/0 | Application frontend access |
| HTTPS | HTTPS | TCP | 443 | 0.0.0.0/0 | SSL/TLS encrypted traffic (optional) |

**Important Security Notes:**
- ⚠️ **NEVER** open the following ports to the internet (0.0.0.0/0):
  - Port 8080 (Jenkins)
  - Port 9000 (SonarQube)
  - Port 9090 (Prometheus)
  - Port 3000 (Grafana)
  - Port 5432 (PostgreSQL)
  - Port 8888 (Backend API - only accessible via frontend proxy)

- ✅ **Best Practices:**
  - Use SSH tunneling or AWS Systems Manager Session Manager for admin tools
  - Use `kubectl port-forward` for Kubernetes services
  - Implement VPN or bastion host for internal services
  - Enable VPC Flow Logs for network monitoring

**Outbound Rules:**
- Allow all outbound traffic (default) for package downloads and updates

### 1.3 IAM Role Configuration (Optional but Recommended)

Create an IAM role for your EC2 instance with the following policies:

**For EKS Deployment:**
- `AmazonEKSClusterPolicy`
- `AmazonEKSWorkerNodePolicy`
- `AmazonEC2ContainerRegistryReadOnly`
- `AmazonEKS_CNI_Policy`

**For ECR Access:**
- `AmazonEC2ContainerRegistryPowerUser` (if pushing images to ECR)

**For CloudWatch Logs:**
- `CloudWatchAgentServerPolicy`

**Attach the IAM role during EC2 launch or after creation.**

### 1.4 SSH Access to EC2 Instance

```bash
# Set correct permissions for private key (Linux/Mac)
chmod 400 /path/to/your-key.pem

# Connect to EC2 instance
ssh -i /path/to/your-key.pem ec2-user@<EC2_PUBLIC_IP>

# For Windows (using PowerShell)
ssh -i C:\path\to\your-key.pem ec2-user@<EC2_PUBLIC_IP>
```

**Verify connection:**
```bash
# Check system information
uname -a
cat /etc/os-release

# Expected output: Amazon Linux 2023
```

### 1.5 Initial System Hardening (Optional but Recommended)

```bash
# Update hostname (optional)
sudo hostnamectl set-hostname taskmanager-server

# Configure firewall with firewalld
sudo systemctl enable --now firewalld
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --reload

# Disable root login (optional, ensure ec2-user access works first)
sudo sed -i 's/^#\?PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config
sudo systemctl restart sshd

# Verify firewall status
sudo firewall-cmd --list-all
```

---

## 2. Basic Dependencies Installation

### 2.1 System Update

```bash
# Update all packages to latest versions
sudo dnf -y update

# Clean package cache
sudo dnf clean all

# Verify update
sudo dnf check-update
```

**Expected time:** 3-5 minutes (depending on internet speed)

### 2.2 Essential Utilities Installation

```bash
# Install core development tools and utilities
sudo dnf -y install \
    git \
    curl \
    wget \
    unzip \
    tar \
    gzip \
    vim \
    nano \
    htop \
    net-tools \
    bind-utils \
    telnet \
    nc \
    jq \
    yq \
    ca-certificates \
    openssl \
    python3 \
    python3-pip

# Verify installations
git --version
curl --version
wget --version
python3 --version
pip3 --version
jq --version
```

### 2.3 Time Synchronization (Critical for Distributed Systems)

```bash
# Enable and start chronyd for time synchronization
sudo systemctl enable --now chronyd

# Verify time synchronization status
sudo systemctl status chronyd
timedatectl

# Check NTP sync
chronyc tracking

# Expected output: System time synchronized: yes
```

**Why this is important:**
- Prevents certificate validation errors
- Ensures accurate log timestamps
- Critical for distributed systems (Kubernetes, databases)
- Required for AWS API calls

### 2.4 System Resource Verification

```bash
# Check available disk space (need at least 15GB free)
df -h

# Check memory (need at least 4GB for basic setup)
free -h

# Check CPU information
lscpu

# Check system load
uptime
top -bn1 | head -20
```

**Resource Requirements:**

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| Disk Space | 15 GB | 30 GB |
| RAM | 4 GB | 8 GB |
| CPU | 2 cores | 4 cores |

### 2.5 Environment Setup

```bash
# Set up environment variables (add to ~/.bashrc for persistence)
cat >> ~/.bashrc << 'EOF'

# Custom environment variables
export EDITOR=vim
export HISTSIZE=10000
export HISTFILESIZE=10000
export HISTTIMEFORMAT="%F %T "

# Aliases for convenience
alias ll='ls -lah'
alias df='df -h'
alias free='free -h'
alias docker-clean='docker system prune -af --volumes'
alias k='kubectl'
alias kns='kubectl config set-context --current --namespace'

EOF

# Reload bashrc
source ~/.bashrc
```

---

## 3. Docker and Docker Compose Installation

### 3.1 Install Docker Engine (Amazon Linux 2023)

```bash
# Install Docker package from AL2023 repository
sudo dnf -y install docker

# Start and enable Docker service
sudo systemctl enable docker
sudo systemctl start docker

# Verify Docker service is running
sudo systemctl status docker

# Check Docker version
docker --version

# Expected output: Docker version 24.x.x or higher
```

### 3.2 Configure Docker User Permissions

```bash
# Add current user to docker group (avoid using sudo for docker commands)
sudo usermod -aG docker ec2-user

# Apply group changes (logout/login alternative)
newgrp docker

# Verify docker works without sudo
docker run --rm hello-world

# Expected output: "Hello from Docker!" message
```

**Important:** If `newgrp docker` doesn't work, log out and log back in:
```bash
exit
# SSH back in
ssh -i your-key.pem ec2-user@<EC2_PUBLIC_IP>
```

### 3.3 Configure Docker Daemon (Production Settings)

```bash
# Create Docker daemon configuration directory
sudo mkdir -p /etc/docker

# Create daemon.json with production settings
cat | sudo tee /etc/docker/daemon.json > /dev/null << 'EOF'
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "storage-driver": "overlay2",
  "live-restore": true,
  "userland-proxy": false,
  "default-ulimits": {
    "nofile": {
      "Name": "nofile",
      "Hard": 64000,
      "Soft": 64000
    }
  }
}
EOF

# Restart Docker to apply configuration
sudo systemctl restart docker

# Verify configuration
docker info | grep -A 10 "Log"
docker info | grep "Storage Driver"
```

**Configuration Explained:**
- `log-driver`: JSON file logging with rotation (prevents disk filling)
- `max-size`: Maximum log file size before rotation (10MB)
- `max-file`: Number of log files to keep (3 files)
- `storage-driver`: Overlay2 for better performance
- `live-restore`: Keeps containers running during Docker daemon updates
- `userland-proxy`: Disabled for better network performance
- `default-ulimits`: Increased file descriptor limits

### 3.4 Install Docker Compose v2 (Plugin Method)

**Method 1: Package Installation (Recommended)**

```bash
# Install Docker Compose plugin from repository
sudo dnf -y install docker-compose-plugin

# Verify installation
docker compose version

# Expected output: Docker Compose version v2.24.x or higher
```

**Method 2: Manual Installation (if package not available)**

```bash
# Set desired Compose version
COMPOSE_VERSION="v2.24.6"

# Create Docker CLI plugins directory
DOCKER_CLI_PLUGINS_DIR="$HOME/.docker/cli-plugins"
mkdir -p "$DOCKER_CLI_PLUGINS_DIR"

# Download Docker Compose plugin
curl -fsSL "https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-linux-$(uname -m)" \
  -o "${DOCKER_CLI_PLUGINS_DIR}/docker-compose"

# Make it executable
chmod +x "${DOCKER_CLI_PLUGINS_DIR}/docker-compose"

# Verify installation
docker compose version

# For system-wide installation (optional)
sudo mkdir -p /usr/local/lib/docker/cli-plugins
sudo cp "${DOCKER_CLI_PLUGINS_DIR}/docker-compose" /usr/local/lib/docker/cli-plugins/
```

### 3.5 Docker Post-Installation Verification

```bash
# Run comprehensive Docker test
docker run --rm -it alpine:latest sh -c "echo 'Docker is working correctly!'"

# Check Docker system information
docker info

# Test Docker Compose
docker compose version

# Check Docker disk usage
docker system df

# List Docker networks
docker network ls

# List Docker volumes
docker volume ls
```

### 3.6 Docker Security Hardening (Optional)

```bash
# Enable Docker Content Trust (image verification)
echo "export DOCKER_CONTENT_TRUST=1" >> ~/.bashrc
source ~/.bashrc

# Configure Docker to use no-new-privileges flag by default
# Add to ~/.docker/config.json
mkdir -p ~/.docker
cat > ~/.docker/config.json << 'EOF'
{
  "experimental": "enabled",
  "features": {
    "buildkit": true
  }
}
EOF

# Verify BuildKit is enabled
docker buildx version
```

---

## 4. AWS CLI Installation and Configuration

### 4.1 Install AWS CLI v2

```bash
# Download AWS CLI v2 installer
cd /tmp
curl -fsSL "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o awscliv2.zip

# Unzip the installer
unzip -q awscliv2.zip

# Run the installer
sudo ./aws/install

# Verify installation
aws --version

# Expected output: aws-cli/2.x.x Python/3.x.x Linux/x.x.x

# Clean up installation files
cd ~
rm -rf /tmp/aws /tmp/awscliv2.zip
```

### 4.2 Configure AWS CLI with Credentials

**Method 1: Using AWS Access Keys (Development/Testing)**

```bash
# Run AWS configure
aws configure

# You will be prompted for:
# AWS Access Key ID: [Enter your access key]
# AWS Secret Access Key: [Enter your secret key]
# Default region name: us-east-1 (or your preferred region)
# Default output format: json (or yaml, table, text)
```

**Example:**
```
AWS Access Key ID [None]: AKIAIOSFODNN7EXAMPLE
AWS Secret Access Key [None]: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
Default region name [None]: us-east-1
Default output format [None]: json
```

**Method 2: Using IAM Instance Profile (Production - Recommended)**

```bash
# If using IAM role attached to EC2 instance, no credentials needed
# Verify IAM role is working
aws sts get-caller-identity

# Expected output: Shows your IAM role ARN
```

### 4.3 Verify AWS CLI Configuration

```bash
# Test AWS CLI with basic commands
aws sts get-caller-identity

# List S3 buckets (if you have permissions)
aws s3 ls

# List EC2 instances in current region
aws ec2 describe-instances --query 'Reservations[*].Instances[*].[InstanceId,State.Name,InstanceType]' --output table

# Check current region
aws configure get region

# List all configured profiles
aws configure list

# Test specific region
aws ec2 describe-regions --output table
```

### 4.4 Configure AWS CLI Profiles (Optional - Multiple Accounts)

```bash
# Configure additional profile
aws configure --profile production
# Enter credentials for production account

# Configure another profile
aws configure --profile development
# Enter credentials for development account

# List all profiles
cat ~/.aws/credentials

# Use specific profile
aws s3 ls --profile production

# Set default profile
export AWS_PROFILE=production
echo 'export AWS_PROFILE=production' >> ~/.bashrc
```

### 4.5 AWS CLI Security Best Practices

```bash
# Set restrictive permissions on credentials file
chmod 600 ~/.aws/credentials
chmod 600 ~/.aws/config

# Verify permissions
ls -la ~/.aws/

# Enable MFA for sensitive operations (example)
aws sts get-session-token --serial-number arn:aws:iam::123456789012:mfa/user --token-code 123456

# Configure CLI to use MFA (add to ~/.aws/config)
cat >> ~/.aws/config << 'EOF'

[profile mfa]
region = us-east-1
output = json
mfa_serial = arn:aws:iam::123456789012:mfa/username

EOF
```

### 4.6 Install AWS Session Manager Plugin (Optional - Enhanced Security)

```bash
# Download Session Manager plugin
cd /tmp
curl "https://s3.amazonaws.com/session-manager-downloads/plugin/latest/linux_64bit/session-manager-plugin.rpm" -o session-manager-plugin.rpm

# Install the plugin
sudo dnf install -y ./session-manager-plugin.rpm

# Verify installation
session-manager-plugin --version

# Clean up
rm -f session-manager-plugin.rpm
cd ~
```

---

## 5. Git Installation and Setup

### 5.1 Install Git

```bash
# Git should already be installed from basic dependencies
# Verify installation
git --version

# If not installed, install it
sudo dnf -y install git

# Expected output: git version 2.x.x or higher
```

### 5.2 Configure Git User Information

```bash
# Set your name and email (used for commits)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Set default branch name to main
git config --global init.defaultBranch main

# Enable colored output
git config --global color.ui auto

# Set default editor
git config --global core.editor vim

# Verify configuration
git config --list
```

### 5.3 Configure Git SSH Keys (For GitHub/GitLab)

```bash
# Generate SSH key pair (if you don't have one)
ssh-keygen -t ed25519 -C "your.email@example.com" -f ~/.ssh/id_ed25519

# Or use RSA (if ed25519 not supported)
ssh-keygen -t rsa -b 4096 -C "your.email@example.com" -f ~/.ssh/id_rsa

# Start SSH agent
eval "$(ssh-agent -s)"

# Add SSH key to agent
ssh-add ~/.ssh/id_ed25519  # or ~/.ssh/id_rsa

# Display public key (copy this to GitHub/GitLab)
cat ~/.ssh/id_ed25519.pub  # or ~/.ssh/id_rsa.pub

# Test GitHub connection
ssh -T git@github.com

# Expected output: "Hi username! You've successfully authenticated..."
```

**Add SSH key to GitHub:**
1. Copy the public key output from `cat ~/.ssh/id_ed25519.pub`
2. Go to GitHub → Settings → SSH and GPG keys → New SSH key
3. Paste the key and save

### 5.4 Clone the Project Repository

```bash
# Navigate to home directory
cd ~

# Clone repository (replace with your actual repository URL)
git clone https://github.com/<YOUR_USERNAME>/Python-DevOps.git

# Alternative: Clone via SSH (if SSH key configured)
git clone git@github.com:<YOUR_USERNAME>/Python-DevOps.git

# Enter project directory
cd Python-DevOps

# Verify repository structure
ls -la

# Check git status
git status

# View branches
git branch -a

# View remote URLs
git remote -v
```

### 5.5 Git Advanced Configuration (Optional)

```bash
# Set up credential helper (caches credentials for 1 hour)
git config --global credential.helper 'cache --timeout=3600'

# Or store credentials permanently (less secure)
git config --global credential.helper store

# Set up aliases for common commands
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.st status
git config --global alias.unstage 'reset HEAD --'
git config --global alias.last 'log -1 HEAD'
git config --global alias.lg "log --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit"

# Enable auto-correction
git config --global help.autocorrect 1

# Set pull strategy to rebase
git config --global pull.rebase true

# View all global configuration
git config --global --list
```

### 5.6 Git Workflow Best Practices

```bash
# Create a development branch
git checkout -b develop

# Create a feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "Add new feature"

# Push to remote repository
git push -u origin feature/new-feature

# Pull latest changes from main
git checkout main
git pull origin main

# Merge feature branch
git merge feature/new-feature

# Delete local feature branch
git branch -d feature/new-feature

# Delete remote feature branch
git push origin --delete feature/new-feature
```

---

## 6. EKS Cluster Setup (eksctl & kubectl)

### 6.1 Install kubectl (Kubernetes CLI)

```bash
# Set desired kubectl version (should match or be close to your EKS version)
KUBECTL_VERSION="v1.29.0"

# Download kubectl binary
cd /tmp
curl -fsSL "https://dl.k8s.io/release/${KUBECTL_VERSION}/bin/linux/amd64/kubectl" -o kubectl

# Download kubectl checksum
curl -fsSL "https://dl.k8s.io/release/${KUBECTL_VERSION}/bin/linux/amd64/kubectl.sha256" -o kubectl.sha256

# Verify checksum
echo "$(cat kubectl.sha256)  kubectl" | sha256sum --check

# Expected output: kubectl: OK

# Make kubectl executable
chmod +x kubectl

# Move to system path
sudo mv kubectl /usr/local/bin/

# Verify installation
kubectl version --client

# Expected output: Client Version: v1.29.0

# Clean up
rm -f kubectl.sha256
cd ~
```

### 6.2 Configure kubectl Auto-completion (Optional but Recommended)

```bash
# Enable kubectl bash completion
kubectl completion bash | sudo tee /etc/bash_completion.d/kubectl > /dev/null

# Add alias to bashrc
echo 'alias k=kubectl' >> ~/.bashrc
echo 'complete -o default -F __start_kubectl k' >> ~/.bashrc

# Reload bashrc
source ~/.bashrc

# Test autocomplete (type 'k get po' and press TAB)
```

### 6.3 Install eksctl (EKS Cluster Management Tool)

```bash
# Set eksctl version
EKSCTL_VERSION="v0.171.0"

# Download eksctl
cd /tmp
curl -fsSL "https://github.com/eksctl-io/eksctl/releases/download/${EKSCTL_VERSION}/eksctl_Linux_amd64.tar.gz" -o eksctl.tar.gz

# Extract archive
tar -xzf eksctl.tar.gz

# Move to system path
sudo mv eksctl /usr/local/bin/

# Verify installation
eksctl version

# Expected output: 0.171.0

# Clean up
rm -f eksctl.tar.gz
cd ~
```

### 6.4 Create EKS Cluster with eksctl

**Option 1: Basic Cluster Creation**

```bash
# Set cluster parameters
export AWS_REGION="us-east-1"
export CLUSTER_NAME="taskmanager-eks"
export NODE_TYPE="t3.medium"
export NODE_COUNT=2

# Create EKS cluster (basic)
eksctl create cluster \
  --name "${CLUSTER_NAME}" \
  --region "${AWS_REGION}" \
  --nodes "${NODE_COUNT}" \
  --node-type "${NODE_TYPE}" \
  --managed \
  --version 1.29

# This command will take 15-20 minutes to complete
```

**Option 2: Advanced Cluster Creation with eksctl Config File**

```bash
# Create eksctl configuration file
cat > eks-cluster-config.yaml << 'EOF'
apiVersion: eksctl.io/v1alpha5
kind: ClusterConfig

metadata:
  name: taskmanager-eks
  region: us-east-1
  version: "1.29"

# IAM configuration
iam:
  withOIDC: true

# Managed node groups
managedNodeGroups:
  - name: taskmanager-nodes
    instanceType: t3.medium
    minSize: 2
    maxSize: 4
    desiredCapacity: 2
    volumeSize: 30
    volumeType: gp3
    labels:
      role: worker
    tags:
      Environment: production
      Project: taskmanager
    iam:
      withAddonPolicies:
        imageBuilder: true
        autoScaler: true
        externalDNS: true
        certManager: true
        appMesh: true
        ebs: true
        fsx: true
        efs: true
        albIngress: true
        cloudWatch: true

# VPC configuration
vpc:
  cidr: 10.0.0.0/16
  nat:
    gateway: Single # Use 'HighlyAvailable' for production

# CloudWatch logging
cloudWatch:
  clusterLogging:
    enableTypes:
      - api
      - audit
      - authenticator
      - controllerManager
      - scheduler

EOF

# Create cluster using config file
eksctl create cluster -f eks-cluster-config.yaml
```

**Cluster creation progress monitoring:**
```bash
# Monitor cluster creation (in another terminal)
watch -n 10 'eksctl get cluster --name taskmanager-eks --region us-east-1'

# Check CloudFormation stacks
aws cloudformation list-stacks --region us-east-1 --query 'StackSummaries[?contains(StackName, `eksctl-taskmanager-eks`)].{Name:StackName,Status:StackStatus}' --output table
```

### 6.5 Verify EKS Cluster Setup

```bash
# List EKS clusters
eksctl get cluster --region us-east-1

# Get cluster information
aws eks describe-cluster --name taskmanager-eks --region us-east-1 --query 'cluster.{Name:name,Status:status,Version:version,Endpoint:endpoint}' --output table

# Update kubeconfig
aws eks update-kubeconfig --name taskmanager-eks --region us-east-1

# Verify kubectl context
kubectl config current-context

# List nodes
kubectl get nodes -o wide

# Expected output: 2 nodes in Ready status

# Check system pods
kubectl get pods -n kube-system

# Get cluster info
kubectl cluster-info

# Check node resources
kubectl top nodes  # Requires metrics-server (see next step)
```

### 6.6 Install Kubernetes Add-ons

**Install Metrics Server (for resource monitoring)**

```bash
# Deploy metrics-server
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# Verify deployment
kubectl get deployment metrics-server -n kube-system

# Wait for metrics-server to be ready
kubectl wait --for=condition=available --timeout=300s deployment/metrics-server -n kube-system

# Test metrics (may take 1-2 minutes to start collecting)
kubectl top nodes
kubectl top pods -A
```

**Install AWS Load Balancer Controller (for EKS Ingress)**

```bash
# Download IAM policy
curl -fsSL https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/v2.7.0/docs/install/iam_policy.json -o iam_policy.json

# Create IAM policy
aws iam create-policy \
    --policy-name AWSLoadBalancerControllerIAMPolicy \
    --policy-document file://iam_policy.json

# Create IAM service account
eksctl create iamserviceaccount \
  --cluster=taskmanager-eks \
  --namespace=kube-system \
  --name=aws-load-balancer-controller \
  --role-name AmazonEKSLoadBalancerControllerRole \
  --attach-policy-arn=arn:aws:iam::<AWS_ACCOUNT_ID>:policy/AWSLoadBalancerControllerIAMPolicy \
  --approve

# Add Helm repository
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
helm repo add eks https://aws.github.io/eks-charts
helm repo update

# Install AWS Load Balancer Controller
helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=taskmanager-eks \
  --set serviceAccount.create=false \
  --set serviceAccount.name=aws-load-balancer-controller

# Verify installation
kubectl get deployment -n kube-system aws-load-balancer-controller
```

**Install EBS CSI Driver (for persistent volumes)**

```bash
# Create IAM service account for EBS CSI driver
eksctl create iamserviceaccount \
    --name ebs-csi-controller-sa \
    --namespace kube-system \
    --cluster taskmanager-eks \
    --role-name AmazonEKS_EBS_CSI_DriverRole \
    --role-only \
    --attach-policy-arn arn:aws:iam::aws:policy/service-role/AmazonEBSCSIDriverPolicy \
    --approve

# Install EBS CSI driver addon
aws eks create-addon \
    --cluster-name taskmanager-eks \
    --addon-name aws-ebs-csi-driver \
    --service-account-role-arn arn:aws:iam::<AWS_ACCOUNT_ID>:role/AmazonEKS_EBS_CSI_DriverRole

# Verify installation
kubectl get pods -n kube-system -l app.kubernetes.io/name=aws-ebs-csi-driver
```

### 6.7 EKS Cluster Configuration Best Practices

```bash
# Enable IRSA (IAM Roles for Service Accounts) if not already enabled
eksctl utils associate-iam-oidc-provider --cluster=taskmanager-eks --approve

# Create namespace for application
kubectl create namespace taskmanager

# Set default namespace
kubectl config set-context --current --namespace=taskmanager

# Create resource quotas (optional)
cat > resource-quota.yaml << 'EOF'
apiVersion: v1
kind: ResourceQuota
metadata:
  name: taskmanager-quota
  namespace: taskmanager
spec:
  hard:
    requests.cpu: "4"
    requests.memory: 8Gi
    limits.cpu: "8"
    limits.memory: 16Gi
    persistentvolumeclaims: "10"
EOF

kubectl apply -f resource-quota.yaml

# Verify quota
kubectl get resourcequota -n taskmanager
```

---

## 7. Java Installation

### 7.1 Install Java Development Kit (JDK)

**Java is required for Jenkins and SonarQube**

```bash
# Install Amazon Corretto 17 (AWS-optimized JDK, LTS version)
sudo dnf -y install java-17-amazon-corretto-devel

# Alternative: Install OpenJDK 17
# sudo dnf -y install java-17-openjdk-devel

# Verify installation
java -version

# Expected output: openjdk version "17.0.x"

# Check Java compiler
javac -version

# Set JAVA_HOME environment variable
echo 'export JAVA_HOME=/usr/lib/jvm/java-17-amazon-corretto' >> ~/.bashrc
echo 'export PATH=$JAVA_HOME/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# Verify JAVA_HOME
echo $JAVA_HOME
```

### 7.2 Install Maven (Optional - for Java builds)

```bash
# Install Maven
MAVEN_VERSION="3.9.6"
cd /tmp
wget https://dlcdn.apache.org/maven/maven-3/${MAVEN_VERSION}/binaries/apache-maven-${MAVEN_VERSION}-bin.tar.gz

# Extract Maven
sudo tar -xzf apache-maven-${MAVEN_VERSION}-bin.tar.gz -C /opt

# Create symbolic link
sudo ln -s /opt/apache-maven-${MAVEN_VERSION} /opt/maven

# Set Maven environment variables
cat >> ~/.bashrc << 'EOF'
export MAVEN_HOME=/opt/maven
export PATH=$MAVEN_HOME/bin:$PATH
EOF

source ~/.bashrc

# Verify installation
mvn -version

# Clean up
rm -f /tmp/apache-maven-${MAVEN_VERSION}-bin.tar.gz
cd ~
```

### 7.3 Java Configuration for Production

```bash
# Configure Java memory limits (add to ~/.bashrc)
cat >> ~/.bashrc << 'EOF'

# Java memory settings for production
export JAVA_OPTS="-Xms512m -Xmx2048m -XX:+UseG1GC"

EOF

source ~/.bashrc

# Verify Java configuration
java -XX:+PrintFlagsFinal -version | grep -i HeapSize
```

---

## 8. PostgreSQL Installation (Standalone)

**Note:** This section is for standalone PostgreSQL installation. For containerized deployment, PostgreSQL is included in docker-compose.yml and Kubernetes manifests.

### 8.1 Install PostgreSQL 15

```bash
# Install PostgreSQL 15 from Amazon Linux repository
sudo dnf -y install postgresql15 postgresql15-server postgresql15-contrib

# Verify installation
postgres --version

# Expected output: postgres (PostgreSQL) 15.x
```

### 8.2 Initialize and Configure PostgreSQL

```bash
# Initialize PostgreSQL database
sudo postgresql-setup --initdb

# Start and enable PostgreSQL service
sudo systemctl enable postgresql
sudo systemctl start postgresql

# Verify service status
sudo systemctl status postgresql

# Check PostgreSQL is listening
sudo ss -tunlp | grep 5432
```

### 8.3 Secure PostgreSQL Installation

```bash
# Switch to postgres user
sudo -u postgres psql

# Inside PostgreSQL shell, run:
# Set password for postgres user
ALTER USER postgres WITH PASSWORD 'your_strong_password';

# Create database and user for application
CREATE DATABASE taskmanager_db;
CREATE USER taskmanager WITH ENCRYPTED PASSWORD 'taskmanager_password';
GRANT ALL PRIVILEGES ON DATABASE taskmanager_db TO taskmanager;

# For PostgreSQL 15+, also grant schema privileges
\c taskmanager_db
GRANT ALL ON SCHEMA public TO taskmanager;

# Exit PostgreSQL shell
\q
```

### 8.4 Configure PostgreSQL for Remote Access (If Needed)

```bash
# Edit PostgreSQL configuration
sudo vim /var/lib/pgsql/data/postgresql.conf

# Find and modify:
listen_addresses = 'localhost'  # Change to '*' for all interfaces or specific IP

# Edit pg_hba.conf for authentication
sudo vim /var/lib/pgsql/data/pg_hba.conf

# Add line for password authentication (replace with your network):
# host    all             all             10.0.0.0/16             md5

# Restart PostgreSQL
sudo systemctl restart postgresql

# Verify listening addresses
sudo ss -tunlp | grep 5432
```

### 8.5 PostgreSQL Performance Tuning (Optional)

```bash
# Edit postgresql.conf for better performance
sudo vim /var/lib/pgsql/data/postgresql.conf

# Recommended settings for t3.medium (4GB RAM):
# shared_buffers = 1GB
# effective_cache_size = 3GB
# maintenance_work_mem = 256MB
# work_mem = 16MB
# max_connections = 100

# Apply changes
sudo systemctl restart postgresql
```

### 8.6 PostgreSQL Backup and Restore

```bash
# Backup database
sudo -u postgres pg_dump taskmanager_db > taskmanager_backup.sql

# Restore database
sudo -u postgres psql taskmanager_db < taskmanager_backup.sql

# Backup all databases
sudo -u postgres pg_dumpall > all_databases_backup.sql
```

---

## 9. Jenkins Installation and Configuration

### 9.1 Install Jenkins (Standalone on EC2)

**Method 1: Docker Installation (Recommended)**

```bash
# Create Jenkins home directory
mkdir -p ~/jenkins_home
chmod 755 ~/jenkins_home

# Run Jenkins container
docker run -d \
  --name jenkins \
  --restart=unless-stopped \
  -p 8080:8080 \
  -p 50000:50000 \
  -v ~/jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  jenkins/jenkins:lts-jdk17

# Add jenkins user to docker group (inside container)
docker exec -u root jenkins bash -c "apt-get update && apt-get install -y docker.io && usermod -aG docker jenkins"

# Restart Jenkins container
docker restart jenkins

# Get initial admin password
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword

# Copy the password for web setup
```

**Method 2: Direct Installation on EC2**

```bash
# Add Jenkins repository
sudo wget -O /etc/yum.repos.d/jenkins.repo https://pkg.jenkins.io/redhat-stable/jenkins.repo
sudo rpm --import https://pkg.jenkins.io/redhat-stable/jenkins.io-2023.key

# Install Jenkins
sudo dnf -y install jenkins

# Start and enable Jenkins
sudo systemctl enable jenkins
sudo systemctl start jenkins

# Check status
sudo systemctl status jenkins

# Get initial admin password
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

### 9.2 Access Jenkins Web Interface

```bash
# Create SSH tunnel for secure access (from your local machine)
ssh -i your-key.pem -L 8080:localhost:8080 ec2-user@<EC2_PUBLIC_IP>

# Open in browser: http://localhost:8080
```

**Web Setup Steps:**
1. Enter initial admin password
2. Select "Install suggested plugins"
3. Create first admin user:
   - Username: `admin`
   - Password: `<strong_password>`
   - Full name: `Your Name`
   - Email: `your.email@example.com`
4. Configure Jenkins URL: `http://<EC2_PUBLIC_IP>:8080` or `http://localhost:8080`
5. Click "Start using Jenkins"

### 9.3 Install Required Jenkins Plugins

**Navigate to:** Manage Jenkins → Plugin Manager → Available

**Essential Plugins to Install:**

1. **Docker Plugins:**
   - Docker Pipeline
   - Docker plugin
   - CloudBees Docker Build and Publish

2. **Kubernetes Plugins:**
   - Kubernetes CLI
   - Kubernetes Credentials Provider

3. **Git and SCM:**
   - Git plugin (usually pre-installed)
   - GitHub Integration Plugin
   - Pipeline: GitHub Groovy Libraries

4. **Code Quality:**
   - SonarQube Scanner
   - Warnings Next Generation

5. **Build Tools:**
   - Pipeline Maven Integration
   - Pipeline Utility Steps

6. **Credentials and Security:**
   - Credentials Binding Plugin
   - SSH Agent Plugin

**Install plugins via Jenkins UI:**
```
Manage Jenkins → Plugins → Available plugins
Search and select each plugin, then click "Install without restart"
```

**Alternative: Install via Jenkins CLI**
```bash
# Get list of plugin short names
docker exec jenkins java -jar /var/jenkins_home/war/WEB-INF/jenkins-cli.jar -s http://localhost:8080/ -auth admin:your_password list-plugins

# Install plugins
docker exec jenkins java -jar /var/jenkins_home/war/WEB-INF/jenkins-cli.jar -s http://localhost:8080/ -auth admin:your_password install-plugin docker-workflow kubernetes-cli sonar
```

### 9.4 Configure Jenkins Credentials

**Add DockerHub Credentials:**
1. Navigate to: Manage Jenkins → Credentials → System → Global credentials → Add Credentials
2. Kind: `Username with password`
3. Username: `<your_dockerhub_username>`
4. Password: `<your_dockerhub_password>`
5. ID: `dockerhub-credentials`
6. Description: `DockerHub Credentials`
7. Click "Create"

**Add Kubernetes Config:**
1. Get kubeconfig content:
   ```bash
   cat ~/.kube/config
   ```
2. Navigate to: Manage Jenkins → Credentials → System → Global credentials → Add Credentials
3. Kind: `Secret file`
4. File: Upload kubeconfig or paste content
5. ID: `kubeconfig`
6. Description: `Kubernetes Config for EKS`
7. Click "Create"

**Add SonarQube Token:**
1. Generate token in SonarQube (covered in SonarQube section)
2. Navigate to: Manage Jenkins → Credentials → System → Global credentials → Add Credentials
3. Kind: `Secret text`
4. Secret: `<your_sonarqube_token>`
5. ID: `sonarqube-token`
6. Description: `SonarQube Authentication Token`
7. Click "Create"

**Add GitHub Token (Optional - for private repositories):**
1. Generate token at: GitHub → Settings → Developer settings → Personal access tokens
2. Navigate to: Manage Jenkins → Credentials → System → Global credentials → Add Credentials
3. Kind: `Secret text`
4. Secret: `<your_github_token>`
5. ID: `github-token`
6. Description: `GitHub Personal Access Token`
7. Click "Create"

### 9.5 Configure Jenkins System Settings

**Configure Docker:**
1. Navigate to: Manage Jenkins → System
2. Scroll to "Docker"
3. Click "Add Docker"
4. Docker Host URI: `unix:///var/run/docker.sock` (for container) or leave blank (for local)
5. Click "Test Connection" - should show Docker version
6. Click "Save"

**Configure SonarQube Server:**
1. Navigate to: Manage Jenkins → System
2. Scroll to "SonarQube servers"
3. Check "Enable injection of SonarQube server configuration"
4. Add SonarQube:
   - Name: `SonarQube`
   - Server URL: `http://<EC2_PRIVATE_IP>:9000` or `http://sonarqube:9000` (if using Docker network)
   - Server authentication token: Select `sonarqube-token` credential
5. Click "Save"

**Configure Tools:**

Navigate to: Manage Jenkins → Tools

**JDK Configuration:**
- JDK installations → Add JDK
- Name: `JDK17`
- JAVA_HOME: `/usr/lib/jvm/java-17-amazon-corretto`
- Uncheck "Install automatically"

**Maven Configuration (if needed):**
- Maven installations → Add Maven
- Name: `Maven3`
- MAVEN_HOME: `/opt/maven`
- Uncheck "Install automatically"

**Docker Configuration:**
- Docker installations → Add Docker
- Name: `docker-latest`
- Install automatically → Download from docker.com
- Docker version: `latest`

**Save all configurations**

### 9.6 Create Jenkins Pipeline Job

**Step-by-Step Pipeline Creation:**

1. **Create New Item:**
   - Click "New Item"
   - Enter name: `taskmanager-pipeline`
   - Select "Pipeline"
   - Click "OK"

2. **General Configuration:**
   - Description: `CI/CD pipeline for TaskManager application`
   - Check "GitHub project" (optional)
   - Project URL: `https://github.com/<YOUR_USERNAME>/Python-DevOps`

3. **Build Triggers:**
   - Check "Poll SCM" (for automatic builds)
   - Schedule: `H/5 * * * *` (check every 5 minutes)
   - Or use "GitHub hook trigger for GITScm polling" for webhook-based builds

4. **Pipeline Configuration:**
   - Definition: `Pipeline script from SCM`
   - SCM: `Git`
   - Repository URL: `https://github.com/<YOUR_USERNAME>/Python-DevOps.git`
   - Credentials: Select if private repository
   - Branch Specifier: `*/main`
   - Script Path: `Jenkinsfile`

5. **Save Configuration**

### 9.7 Jenkinsfile Explanation (Already in Repository)

The `Jenkinsfile` in the repository contains the following stages:

```groovy
pipeline {
    agent any
    
    environment {
        DOCKER_REGISTRY = 'docker.io'
        DOCKER_CREDENTIALS = 'dockerhub-credentials'
        BACKEND_IMAGE = 'taskmanager-backend'
        FRONTEND_IMAGE = 'taskmanager-frontend'
        IMAGE_TAG = "v${BUILD_NUMBER}"
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('SonarQube Analysis') {
            steps {
                script {
                    def scannerHome = tool 'SonarQubeScanner'
                    withSonarQubeEnv('SonarQube') {
                        sh "${scannerHome}/bin/sonar-scanner"
                    }
                }
            }
        }
        
        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }
        
        stage('Build Backend') {
            steps {
                dir('backend') {
                    sh 'docker build -t ${BACKEND_IMAGE}:${IMAGE_TAG} .'
                }
            }
        }
        
        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    sh 'docker build -t ${FRONTEND_IMAGE}:${IMAGE_TAG} .'
                }
            }
        }
        
        stage('Test') {
            steps {
                sh 'docker compose up -d'
                sh 'sleep 10'
                sh 'curl -f http://localhost/api/health || exit 1'
                sh 'docker compose down'
            }
        }
        
        stage('Push Images') {
            steps {
                script {
                    docker.withRegistry("https://${DOCKER_REGISTRY}", "${DOCKER_CREDENTIALS}") {
                        sh "docker push ${BACKEND_IMAGE}:${IMAGE_TAG}"
                        sh "docker push ${FRONTEND_IMAGE}:${IMAGE_TAG}"
                    }
                }
            }
        }
        
        stage('Deploy to Kubernetes') {
            steps {
                withKubeConfig([credentialsId: 'kubeconfig']) {
                    sh 'kubectl apply -f k8s/'
                    sh 'kubectl set image deployment/backend backend=${BACKEND_IMAGE}:${IMAGE_TAG} -n taskmanager'
                    sh 'kubectl set image deployment/frontend frontend=${FRONTEND_IMAGE}:${IMAGE_TAG} -n taskmanager'
                }
            }
        }
    }
    
    post {
        always {
            cleanWs()
        }
        success {
            echo 'Pipeline succeeded!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}
```

### 9.8 Execute Jenkins Pipeline

**Manual Build:**
1. Navigate to pipeline job: `taskmanager-pipeline`
2. Click "Build Now"
3. Monitor build in "Build History"
4. Click on build number to see detailed logs
5. View "Console Output" for real-time logs

**View Pipeline Stages:**
- Click on build number
- View "Pipeline Steps" or "Blue Ocean" view for visual representation

**Automatic Builds:**
- Pipeline will automatically trigger on git push if webhook is configured
- Or on SCM polling interval (every 5 minutes as configured)

### 9.9 Jenkins Security Hardening

```bash
# Enable CSRF protection (already enabled by default)
# Navigate to: Manage Jenkins → Security

# Configure security settings:
# - Authorization: "Project-based Matrix Authorization Strategy"
# - Enable "Prevent Cross Site Request Forgery exploits"
# - Configure agent protocols: Use only JNLP4

# Backup Jenkins configuration
docker exec jenkins tar -czf /tmp/jenkins_backup.tar.gz /var/jenkins_home
docker cp jenkins:/tmp/jenkins_backup.tar.gz ~/jenkins_backup_$(date +%Y%m%d).tar.gz

# Create backup script
cat > ~/backup_jenkins.sh << 'EOF'
#!/bin/bash
BACKUP_DIR=~/jenkins_backups
mkdir -p $BACKUP_DIR
DATE=$(date +%Y%m%d_%H%M%S)
docker exec jenkins tar -czf /tmp/jenkins_backup.tar.gz /var/jenkins_home
docker cp jenkins:/tmp/jenkins_backup.tar.gz $BACKUP_DIR/jenkins_backup_$DATE.tar.gz
# Keep only last 7 backups
ls -t $BACKUP_DIR/jenkins_backup_*.tar.gz | tail -n +8 | xargs -r rm
EOF

chmod +x ~/backup_jenkins.sh

# Add to cron for daily backups
(crontab -l 2>/dev/null; echo "0 2 * * * ~/backup_jenkins.sh") | crontab -
```

---

## 10. SonarQube Installation and Setup

### 10.1 Prerequisite: System Configuration for SonarQube

```bash
# Increase system limits for Elasticsearch (required by SonarQube)
sudo tee -a /etc/sysctl.conf << EOF
vm.max_map_count=524288
fs.file-max=131072
EOF

sudo sysctl -p

# Set ulimit for current session
ulimit -n 131072
ulimit -u 8192

# Make ulimit persistent (add to /etc/security/limits.conf)
sudo tee -a /etc/security/limits.conf << EOF
* soft nofile 131072
* hard nofile 131072
* soft nproc 8192
* hard nproc 8192
EOF
```

### 10.2 Install SonarQube with Docker

```bash
# Create SonarQube directories
mkdir -p ~/sonarqube/{data,logs,extensions}
chmod 777 ~/sonarqube/{data,logs,extensions}

# Run SonarQube container
docker run -d \
  --name sonarqube \
  --restart=unless-stopped \
  -p 9000:9000 \
  -e SONAR_ES_BOOTSTRAP_CHECKS_DISABLE=true \
  -v ~/sonarqube/data:/opt/sonarqube/data \
  -v ~/sonarqube/logs:/opt/sonarqube/logs \
  -v ~/sonarqube/extensions:/opt/sonarqube/extensions \
  sonarqube:lts-community

# Wait for SonarQube to start (may take 2-3 minutes)
echo "Waiting for SonarQube to start..."
until curl -s http://localhost:9000/api/system/status | grep -q '"status":"UP"'; do
    sleep 5
    echo "Still waiting..."
done
echo "SonarQube is up!"

# Check logs
docker logs -f sonarqube
```

### 10.3 Access SonarQube Web Interface

```bash
# Create SSH tunnel for secure access (from your local machine)
ssh -i your-key.pem -L 9000:localhost:9000 ec2-user@<EC2_PUBLIC_IP>

# Open in browser: http://localhost:9000
```

**Default credentials:**
- Username: `admin`
- Password: `admin`

**First login steps:**
1. Login with default credentials
2. You will be prompted to change password
3. Set new strong password
4. Click "Update"

### 10.4 Configure SonarQube for Project

**Create Project:**
1. Click "Create new project" or "+" icon
2. Choose "Manually"
3. Project display name: `TaskManager`
4. Project key: `taskmanager`
5. Main branch name: `main`
6. Click "Set Up"

**Generate Authentication Token:**
1. Choose "With Jenkins"
2. Generate token:
   - Token name: `jenkins-token`
   - Type: `Global Analysis Token`
   - Expires in: `90 days` (or `No expiration` for testing)
3. Click "Generate"
4. **Copy the token** (you won't be able to see it again)
5. Save token in Jenkins credentials (covered in Jenkins section)

**Configure Analysis:**
1. Choose build technology: `Other`
2. Choose OS: `Linux`
3. Copy the provided scanner command (will use in Jenkinsfile)

### 10.5 Install SonarQube Scanner in Jenkins

**Method 1: Via Jenkins UI**
1. Navigate to: Manage Jenkins → Tools
2. Scroll to "SonarQube Scanner installations"
3. Click "Add SonarQube Scanner"
4. Name: `SonarQubeScanner`
5. Check "Install automatically"
6. Version: Select latest version
7. Click "Save"

**Method 2: Manual Installation in Jenkins Container**
```bash
# Enter Jenkins container
docker exec -it -u root jenkins bash

# Download SonarQube Scanner
cd /opt
wget https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-5.0.1.3006-linux.zip
unzip sonar-scanner-cli-5.0.1.3006-linux.zip
ln -s sonar-scanner-5.0.1.3006-linux sonar-scanner
chown -R jenkins:jenkins sonar-scanner*

# Exit container
exit
```

### 10.6 Create sonar-project.properties File

```bash
# In your project repository
cd ~/Python-DevOps

# Create SonarQube configuration file
cat > sonar-project.properties << 'EOF'
# Project identification
sonar.projectKey=taskmanager
sonar.projectName=TaskManager
sonar.projectVersion=1.0

# Source code location
sonar.sources=backend,frontend/js
sonar.sourceEncoding=UTF-8

# Exclusions (files/folders to ignore)
sonar.exclusions=**/node_modules/**,**/migrations/**,**/__pycache__/**,**/tests/**,**/*.pyc

# Python specific settings
sonar.python.version=3.11

# Coverage reports location (if you generate coverage)
# sonar.python.coverage.reportPaths=coverage.xml

# Test results location
# sonar.python.xunit.reportPath=test-results.xml

# Code quality settings
sonar.qualitygate.wait=true

EOF

# Commit the file
git add sonar-project.properties
git commit -m "Add SonarQube configuration"
git push origin main
```

### 10.7 Configure Quality Gates (Optional)

**Create Custom Quality Gate:**
1. Navigate to: Quality Gates → Create
2. Name: `TaskManager Gate`
3. Add conditions:
   - Coverage: `< 80%` → Error
   - Duplicated Lines (%): `> 3%` → Error
   - Maintainability Rating: `worse than A` → Error
   - Reliability Rating: `worse than A` → Error
   - Security Rating: `worse than A` → Error
   - Code Smells: `> 50` → Warning
4. Click "Save"

**Set as Default:**
1. Click on the Quality Gate
2. Click "Set as Default"

**Assign to Project:**
1. Navigate to: Projects → TaskManager → Project Settings → Quality Gate
2. Select `TaskManager Gate`
3. Click "Save"

### 10.8 Verify SonarQube Integration

```bash
# Test SonarQube analysis locally (optional)
cd ~/Python-DevOps

# Run scanner (replace with your token)
docker run --rm \
  -e SONAR_HOST_URL="http://<EC2_PRIVATE_IP>:9000" \
  -e SONAR_LOGIN="<your_sonarqube_token>" \
  -v "$(pwd):/usr/src" \
  sonarsource/sonar-scanner-cli

# Or if sonar-scanner is installed locally:
sonar-scanner \
  -Dsonar.projectKey=taskmanager \
  -Dsonar.sources=. \
  -Dsonar.host.url=http://localhost:9000 \
  -Dsonar.login=<your_sonarqube_token>

# View results in SonarQube web interface
```

### 10.9 SonarQube Database Backup (Optional)

```bash
# SonarQube stores data in embedded H2 database by default
# For production, consider PostgreSQL backend

# Backup SonarQube data
docker exec sonarqube tar -czf /tmp/sonarqube_backup.tar.gz /opt/sonarqube/data
docker cp sonarqube:/tmp/sonarqube_backup.tar.gz ~/sonarqube_backup_$(date +%Y%m%d).tar.gz

# Restore (if needed)
docker stop sonarqube
docker cp ~/sonarqube_backup_YYYYMMDD.tar.gz sonarqube:/tmp/
docker exec sonarqube tar -xzf /tmp/sonarqube_backup.tar.gz -C /
docker start sonarqube
```

---

## 11. Prometheus and Grafana Installation

### 11.1 Prometheus Installation on Kubernetes

**Apply Prometheus RBAC:**
```bash
# Navigate to project directory
cd ~/Python-DevOps

# Create monitoring namespace
kubectl create namespace monitoring

# Apply RBAC configuration
kubectl apply -f monitoring/prometheus-rbac.yaml

# Verify RBAC
kubectl get clusterrole prometheus -o yaml
kubectl get clusterrolebinding prometheus -n monitoring
```

**Apply Prometheus ConfigMap:**
```bash
# Apply Prometheus configuration
kubectl apply -f monitoring/prometheus-config.yaml

# Verify ConfigMap
kubectl get configmap prometheus-config -n monitoring
kubectl describe configmap prometheus-config -n monitoring
```

**Deploy Prometheus:**
```bash
# Apply Prometheus deployment
kubectl apply -f monitoring/prometheus-deployment.yaml

# Wait for Prometheus to be ready
kubectl wait --for=condition=available --timeout=300s deployment/prometheus -n monitoring

# Verify deployment
kubectl get pods -n monitoring -l app=prometheus
kubectl get svc -n monitoring -l app=prometheus

# Check Prometheus logs
kubectl logs -n monitoring -l app=prometheus --tail=50
```

**Access Prometheus UI:**
```bash
# Method 1: Port forwarding (recommended for security)
kubectl port-forward -n monitoring svc/prometheus 9090:9090

# Open in browser: http://localhost:9090

# Method 2: Expose via LoadBalancer (not recommended for production)
# kubectl patch svc prometheus -n monitoring -p '{"spec": {"type": "LoadBalancer"}}'
# kubectl get svc prometheus -n monitoring
```

### 11.2 Grafana Installation on Kubernetes

**Apply Grafana Datasource Configuration:**
```bash
# Apply datasource configuration (connects Grafana to Prometheus)
kubectl apply -f monitoring/grafana-datasource.yaml

# Verify datasource ConfigMap
kubectl get configmap grafana-datasource -n monitoring
kubectl describe configmap grafana-datasource -n monitoring
```

**Apply Grafana Dashboard Configuration:**
```bash
# Apply dashboard configuration
kubectl apply -f monitoring/grafana-dashboard-config.yaml

# Verify dashboard ConfigMap
kubectl get configmap grafana-dashboard-config -n monitoring
```

**Deploy Grafana:**
```bash
# Apply Grafana deployment
kubectl apply -f monitoring/grafana-deployment.yaml

# Wait for Grafana to be ready
kubectl wait --for=condition=available --timeout=300s deployment/grafana -n monitoring

# Verify deployment
kubectl get pods -n monitoring -l app=grafana
kubectl get svc -n monitoring -l app=grafana

# Check Grafana logs
kubectl logs -n monitoring -l app=grafana --tail=50
```

**Access Grafana UI:**
```bash
# Method 1: Port forwarding (recommended for security)
kubectl port-forward -n monitoring svc/grafana 3000:3000

# Open in browser: http://localhost:3000

# Method 2: Get LoadBalancer URL (if configured)
kubectl get svc grafana -n monitoring
# Access via EXTERNAL-IP
```

**Default Grafana Credentials:**
- Username: `admin`
- Password: `admin123` (as configured in grafana-deployment.yaml)
- ⚠️ **Change this password immediately after first login!**

### 11.3 Configure Grafana Dashboards

**Login to Grafana:**
1. Navigate to http://localhost:3000
2. Login with default credentials
3. Change password when prompted

**Verify Datasource:**
1. Navigate to: Configuration → Data Sources
2. You should see "Prometheus" datasource
3. Click on it and verify:
   - URL: `http://prometheus:9090`
   - Access: `Server (default)`
4. Click "Save & Test" - should show "Data source is working"

**Import Dashboard:**

**Method 1: Import from File (monitoring/grafana-dashboard.json)**
1. Navigate to: Dashboards → Import
2. Click "Upload JSON file"
3. Select `monitoring/grafana-dashboard.json` from repository
4. Click "Load"
5. Select datasource: `Prometheus`
6. Click "Import"

**Method 2: Import from Grafana.com (Recommended Dashboards)**

For Kubernetes Monitoring:
1. Dashboard ID: `315` (Kubernetes Cluster Monitoring)
2. Dashboard ID: `8588` (Kubernetes Deployment Statefulset Daemonset)
3. Dashboard ID: `6417` (Kubernetes Pod Resources)

For Node/System Monitoring:
1. Dashboard ID: `1860` (Node Exporter Full)

**Steps to Import:**
1. Navigate to: Dashboards → Import
2. Enter dashboard ID (e.g., `315`)
3. Click "Load"
4. Select datasource: `Prometheus`
5. Click "Import"

**Create Custom Dashboard:**
1. Click "+" → Dashboard
2. Click "Add new panel"
3. Example queries:
   ```promql
   # CPU Usage
   sum(rate(container_cpu_usage_seconds_total{namespace="taskmanager"}[5m])) by (pod)
   
   # Memory Usage
   sum(container_memory_usage_bytes{namespace="taskmanager"}) by (pod)
   
   # Network I/O
   sum(rate(container_network_transmit_bytes_total{namespace="taskmanager"}[5m])) by (pod)
   
   # Pod Status
   kube_pod_status_phase{namespace="taskmanager"}
   ```
4. Configure visualization (Graph, Gauge, Table, etc.)
5. Click "Apply"
6. Click "Save dashboard"

### 11.4 Configure Alerting (Optional)

**Create Alert Rule in Grafana:**
1. Navigate to Alerting → Alert rules
2. Click "Create alert rule"
3. Example: High CPU Alert
   - Query: `avg(rate(container_cpu_usage_seconds_total{namespace="taskmanager"}[5m])) > 0.8`
   - Condition: `When the last value of A is above 0.8`
   - Evaluation: `every 1m for 5m`
4. Add notification channel (email, Slack, etc.)
5. Click "Save"

**Configure Notification Channel:**
1. Navigate to Alerting → Contact points
2. Click "New contact point"
3. Choose notification type (Email, Slack, Webhook, etc.)
4. Example for Email:
   - Name: `Email Alerts`
   - Addresses: `your-email@example.com`
5. Click "Test" then "Save"

### 11.5 Monitoring Application Metrics (Optional Enhancement)

To monitor application-specific metrics, add Prometheus client to your application:

**For Python Flask Backend:**
```bash
# Add to backend/requirements.txt
prometheus-client==0.19.0

# In backend/app/__init__.py, add:
from prometheus_client import make_wsgi_app
from werkzeug.middleware.dispatcher import DispatcherMiddleware

# Add metrics endpoint
app.wsgi_app = DispatcherMiddleware(app.wsgi_app, {
    '/metrics': make_wsgi_app()
})
```

**Update Prometheus Config to Scrape Application:**
```yaml
# Add to monitoring/prometheus-config.yaml
- job_name: 'taskmanager-backend'
  kubernetes_sd_configs:
  - role: pod
    namespaces:
      names:
      - taskmanager
  relabel_configs:
  - source_labels: [__meta_kubernetes_pod_label_app]
    action: keep
    regex: backend
  - source_labels: [__meta_kubernetes_pod_ip]
    target_label: __address__
    replacement: ${1}:8888
```

### 11.6 Verify Monitoring Stack

```bash
# Check all monitoring pods
kubectl get pods -n monitoring

# Expected output:
# NAME                          READY   STATUS    RESTARTS   AGE
# prometheus-xxxxxxxxxx-xxxxx   1/1     Running   0          5m
# grafana-xxxxxxxxxx-xxxxx      1/1     Running   0          5m

# Check services
kubectl get svc -n monitoring

# Test Prometheus targets
curl http://localhost:9090/api/v1/targets

# Test Grafana health
curl http://localhost:3000/api/health
```

---

## 12. Application Deployment

### 12.1 Docker Compose Deployment (EC2 Single Host)

**Prepare Application:**
```bash
cd ~/Python-DevOps

# Verify docker-compose.yml exists
cat docker-compose.yml
```

**Deploy Application:**
```bash
# Build and start all services
docker compose up -d --build

# Expected output:
# [+] Building ...
# [+] Running 4/4
#  ✔ Network python-devops_default      Created
#  ✔ Container python-devops-postgres-1 Started
#  ✔ Container python-devops-backend-1  Started
#  ✔ Container python-devops-frontend-1 Started
```

**Verify Deployment:**
```bash
# Check container status
docker compose ps

# All should show "Up" status
# NAME                          STATUS    PORTS
# python-devops-backend-1       Up        0.0.0.0:8888->8888/tcp
# python-devops-frontend-1      Up        0.0.0.0:80->80/tcp
# python-devops-postgres-1      Up        0.0.0.0:5432->5432/tcp

# Check logs
docker compose logs -f

# Test endpoints
curl -i http://localhost/
curl -i http://localhost/api/health
curl -i http://localhost/api/ready
```

### 12.2 Kubernetes Deployment (EKS)

**Update Image Names (if using your own registry):**
```bash
# Edit deployment files
vim k8s/backend-deployment.yaml
# Update image: <YOUR_DOCKERHUB_USERNAME>/taskmanager-backend:v1.0

vim k8s/frontend-deployment.yaml
# Update image: <YOUR_DOCKERHUB_USERNAME>/taskmanager-frontend:v1.0
```

**Build and Push Docker Images:**
```bash
# Login to DockerHub
docker login

# Build backend image
cd ~/Python-DevOps/backend
docker build -t <YOUR_DOCKERHUB_USERNAME>/taskmanager-backend:v1.0 .

# Build frontend image
cd ../frontend
docker build -t <YOUR_DOCKERHUB_USERNAME>/taskmanager-frontend:v1.0 .

# Push images
docker push <YOUR_DOCKERHUB_USERNAME>/taskmanager-backend:v1.0
docker push <YOUR_DOCKERHUB_USERNAME>/taskmanager-frontend:v1.0

# Return to project root
cd ..
```

**Deploy to Kubernetes:**
```bash
# Apply manifests in order
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/postgres-pvc.yaml
kubectl apply -f k8s/postgres-deployment.yaml

# Wait for postgres to be ready
kubectl wait --for=condition=available --timeout=300s deployment/postgres -n taskmanager

# Deploy backend
kubectl apply -f k8s/backend-deployment.yaml

# Wait for backend to be ready
kubectl wait --for=condition=available --timeout=300s deployment/backend -n taskmanager

# Deploy frontend
kubectl apply -f k8s/frontend-deployment.yaml

# Wait for frontend to be ready
kubectl wait --for=condition=available --timeout=300s deployment/frontend -n taskmanager

# Optional: Apply ingress (requires ingress-nginx)
# kubectl apply -f k8s/ingress.yaml
```

**Verify Deployment:**
```bash
# Check all resources in taskmanager namespace
kubectl get all -n taskmanager

# Check pod status
kubectl get pods -n taskmanager -o wide

# Check services
kubectl get svc -n taskmanager

# Get frontend LoadBalancer URL
kubectl get svc frontend -n taskmanager

# Expected output:
# NAME       TYPE           CLUSTER-IP      EXTERNAL-IP                          PORT(S)
# frontend   LoadBalancer   10.100.x.x      a1234...us-east-1.elb.amazonaws.com  80:xxxxx/TCP

# Test application (replace with actual EXTERNAL-IP)
curl http://<EXTERNAL-IP>/
curl http://<EXTERNAL-IP>/api/health
```

**View Deployment Logs:**
```bash
# Backend logs
kubectl logs -n taskmanager -l app=backend --tail=100 -f

# Frontend logs
kubectl logs -n taskmanager -l app=frontend --tail=100 -f

# Postgres logs
kubectl logs -n taskmanager -l app=postgres --tail=100 -f
```

### 12.3 Deploy with Jenkins Pipeline

**Trigger Pipeline Build:**
1. Navigate to Jenkins: http://localhost:8080
2. Click on `taskmanager-pipeline`
3. Click "Build Now"
4. Monitor build progress in "Build History"
5. Click on build number → "Console Output" for detailed logs

**Pipeline will execute:**
1. Checkout code from Git
2. Run SonarQube analysis
3. Wait for Quality Gate
4. Build Docker images
5. Run smoke tests with Docker Compose
6. Push images to DockerHub
7. Deploy to Kubernetes cluster

**Verify Pipeline Success:**
```bash
# Check latest deployment in Kubernetes
kubectl rollout status deployment/backend -n taskmanager
kubectl rollout status deployment/frontend -n taskmanager

# View deployment history
kubectl rollout history deployment/backend -n taskmanager
kubectl rollout history deployment/frontend -n taskmanager
```

---

## 13. Testing and Validation

### 13.1 Application Health Checks

**Frontend Tests:**
```bash
# Test frontend homepage
curl -I http://<APPLICATION_URL>/

# Expected: HTTP/1.1 200 OK

# Test frontend static files
curl -I http://<APPLICATION_URL>/css/style.css
curl -I http://<APPLICATION_URL>/js/app.js

# Test login page
curl http://<APPLICATION_URL>/login.html
```

**Backend API Tests:**
```bash
# Health endpoint
curl -i http://<APPLICATION_URL>/api/health

# Expected output:
# HTTP/1.1 200 OK
# {"status":"healthy"}

# Readiness endpoint
curl -i http://<APPLICATION_URL>/api/ready

# Expected output:
# HTTP/1.1 200 OK
# {"status":"ready","database":"connected"}
```

### 13.2 Database Connectivity Tests

```bash
# For Docker Compose:
docker compose exec backend python -c "from app import db; db.create_all(); print('Database connected successfully')"

# For Kubernetes:
kubectl exec -n taskmanager -it deployment/backend -- python -c "from app import db; db.create_all(); print('Database connected successfully')"

# Direct PostgreSQL connection test
docker compose exec postgres psql -U taskmanager -d taskmanager_db -c "SELECT version();"

# For Kubernetes:
kubectl exec -n taskmanager -it deployment/postgres -- psql -U taskmanager -d taskmanager_db -c "SELECT version();"
```

### 13.3 Load Testing (Optional)

**Install Apache Bench:**
```bash
sudo dnf -y install httpd-tools
```

**Run Load Tests:**
```bash
# Test frontend (100 requests, 10 concurrent)
ab -n 100 -c 10 http://<APPLICATION_URL>/

# Test backend API
ab -n 100 -c 10 http://<APPLICATION_URL>/api/health

# Sustained load test (1000 requests, 50 concurrent)
ab -n 1000 -c 50 http://<APPLICATION_URL>/
```

### 13.4 Security Scanning (Optional)

**Scan Docker Images:**
```bash
# Install Trivy (vulnerability scanner)
curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin

# Scan backend image
trivy image <YOUR_DOCKERHUB_USERNAME>/taskmanager-backend:v1.0

# Scan frontend image
trivy image <YOUR_DOCKERHUB_USERNAME>/taskmanager-frontend:v1.0
```

---

## 14. Infrastructure Destruction

### 14.1 Stop and Remove Docker Compose Deployment

```bash
# Navigate to project directory
cd ~/Python-DevOps

# Stop all containers
docker compose down

# Remove containers, networks, and volumes
docker compose down -v

# Remove images (optional)
docker compose down -v --rmi all

# Verify cleanup
docker compose ps
docker volume ls
docker network ls
```

### 14.2 Delete Kubernetes Application Resources

```bash
# Delete application resources
kubectl delete -f k8s/frontend-deployment.yaml
kubectl delete -f k8s/backend-deployment.yaml
kubectl delete -f k8s/postgres-deployment.yaml
kubectl delete -f k8s/postgres-pvc.yaml

# Delete ingress (if applied)
kubectl delete -f k8s/ingress.yaml || true

# Delete secrets and namespace
kubectl delete -f k8s/secrets.yaml
kubectl delete -f k8s/namespace.yaml

# Verify deletion
kubectl get all -n taskmanager
# Expected: No resources found
```

### 14.3 Delete Monitoring Stack

```bash
# Delete Grafana
kubectl delete -f monitoring/grafana-deployment.yaml
kubectl delete -f monitoring/grafana-dashboard-config.yaml
kubectl delete -f monitoring/grafana-datasource.yaml

# Delete Prometheus
kubectl delete -f monitoring/prometheus-deployment.yaml
kubectl delete -f monitoring/prometheus-config.yaml
kubectl delete -f monitoring/prometheus-rbac.yaml

# Delete monitoring namespace
kubectl delete namespace monitoring

# Verify deletion
kubectl get all -n monitoring
# Expected: No resources found or namespace not found
```

### 14.4 Delete Jenkins (if deployed on Kubernetes)

```bash
# Delete Jenkins resources
kubectl delete -f jenkins/jenkins-deployment.yaml
kubectl delete -f jenkins/jenkins-rbac.yaml

# Delete jenkins namespace
kubectl delete namespace jenkins

# Verify deletion
kubectl get all -n jenkins
# Expected: No resources found or namespace not found
```

### 14.5 Delete EKS Cluster

```bash
# Delete EKS cluster (this will take 10-15 minutes)
eksctl delete cluster --name taskmanager-eks --region us-east-1

# Or delete using config file
eksctl delete cluster -f eks-cluster-config.yaml

# Monitor deletion progress
aws cloudformation list-stacks --region us-east-1 --query 'StackSummaries[?contains(StackName, `eksctl-taskmanager-eks`)].{Name:StackName,Status:StackStatus}' --output table

# Verify cluster is deleted
eksctl get cluster --name taskmanager-eks --region us-east-1
# Expected: No cluster found

# Verify CloudFormation stacks are deleted
aws cloudformation list-stacks --region us-east-1 --stack-status-filter DELETE_COMPLETE --query 'StackSummaries[?contains(StackName, `eksctl`)].StackName'
```

### 14.6 Stop and Remove Docker Containers (EC2)

```bash
# Stop and remove Jenkins
docker stop jenkins
docker rm jenkins

# Stop and remove SonarQube
docker stop sonarqube
docker rm sonarqube

# List all containers
docker ps -a

# Remove all stopped containers
docker container prune -f

# Remove all unused images
docker image prune -a -f

# Remove all unused volumes
docker volume prune -f

# Remove all unused networks
docker network prune -f

# Complete Docker cleanup (removes everything)
docker system prune -a --volumes -f
```

### 14.7 Uninstall Software (Optional - Clean EC2)

```bash
# Uninstall Docker
sudo dnf remove -y docker docker-compose-plugin

# Uninstall kubectl
sudo rm -f /usr/local/bin/kubectl

# Uninstall eksctl
sudo rm -f /usr/local/bin/eksctl

# Uninstall AWS CLI
sudo rm -rf /usr/local/aws-cli
sudo rm /usr/local/bin/aws
sudo rm /usr/local/bin/aws_completer

# Uninstall Java
sudo dnf remove -y java-17-amazon-corretto-devel

# Uninstall PostgreSQL
sudo dnf remove -y postgresql15 postgresql15-server postgresql15-contrib
sudo rm -rf /var/lib/pgsql

# Uninstall Jenkins (if installed directly)
sudo dnf remove -y jenkins
sudo rm -rf /var/lib/jenkins

# Clean package cache
sudo dnf clean all
```

### 14.8 Delete AWS Resources

```bash
# Delete ECR repositories (if created)
aws ecr delete-repository --repository-name taskmanager-backend --region us-east-1 --force
aws ecr delete-repository --repository-name taskmanager-frontend --region us-east-1 --force

# Delete CloudWatch Log Groups (if created)
aws logs delete-log-group --log-group-name /aws/eks/taskmanager-eks/cluster --region us-east-1

# Delete IAM policies (if created)
aws iam delete-policy --policy-arn arn:aws:iam::<ACCOUNT_ID>:policy/AWSLoadBalancerControllerIAMPolicy

# List and delete custom IAM roles (if created)
aws iam list-roles --query 'Roles[?contains(RoleName, `taskmanager`) || contains(RoleName, `AmazonEKS`)].RoleName' --output table

# Delete specific role (example)
aws iam delete-role --role-name AmazonEKSLoadBalancerControllerRole
```

### 14.9 Terminate EC2 Instance

```bash
# Get instance ID
aws ec2 describe-instances \
  --filters "Name=tag:Name,Values=taskmanager-server" \
  --query 'Reservations[*].Instances[*].[InstanceId,State.Name]' \
  --output table

# Terminate EC2 instance (replace with actual instance ID)
aws ec2 terminate-instances --instance-ids i-xxxxxxxxxxxxxxxxx

# Verify termination
aws ec2 describe-instance-status --instance-ids i-xxxxxxxxxxxxxxxxx

# Delete security group (wait until instance is terminated)
aws ec2 delete-security-group --group-id sg-xxxxxxxxxxxxxxxxx

# Delete key pair (if no longer needed)
aws ec2 delete-key-pair --key-name your-key-name
```

### 14.10 Cleanup Local Files

```bash
# Remove project directory
cd ~
rm -rf Python-DevOps

# Remove Docker data
rm -rf ~/jenkins_home
rm -rf ~/sonarqube

# Remove AWS and kubectl configs (optional)
rm -rf ~/.aws
rm -rf ~/.kube

# Remove SSH keys (optional - be careful!)
# rm -f ~/.ssh/id_ed25519*
# rm -f ~/.ssh/id_rsa*

# Clear bash history (optional)
history -c
```

---

## 15. Common Errors and Debugging

### 15.1 Docker Issues

**Error: Cannot connect to Docker daemon**
```bash
# Check if Docker service is running
sudo systemctl status docker

# Start Docker service
sudo systemctl start docker

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Verify
docker ps
```

**Error: Port already in use**
```bash
# Find process using port
sudo netstat -tulpn | grep :80
sudo ss -tulpn | grep :80

# Or use lsof
sudo lsof -i :80

# Kill process
sudo kill -9 <PID>

# Or stop the service
docker compose down
```

**Error: Docker build fails with network timeout**
```bash
# Configure Docker DNS
sudo tee /etc/docker/daemon.json << EOF
{
  "dns": ["8.8.8.8", "8.8.4.4"]
}
EOF

sudo systemctl restart docker
```

**Error: Disk space issues**
```bash
# Check disk usage
df -h
docker system df

# Clean up Docker resources
docker system prune -a --volumes -f

# Remove specific items
docker container prune -f
docker image prune -a -f
docker volume prune -f
```

### 15.2 Kubernetes Issues

**Error: Unable to connect to EKS cluster**
```bash
# Update kubeconfig
aws eks update-kubeconfig --name taskmanager-eks --region us-east-1

# Verify context
kubectl config current-context

# Test connection
kubectl get nodes

# Check AWS credentials
aws sts get-caller-identity
```

**Error: Pods in CrashLoopBackOff**
```bash
# Get pod details
kubectl get pods -n taskmanager

# Describe pod
kubectl describe pod <POD_NAME> -n taskmanager

# Check logs
kubectl logs <POD_NAME> -n taskmanager
kubectl logs <POD_NAME> -n taskmanager --previous

# Check events
kubectl get events -n taskmanager --sort-by='.lastTimestamp'
```

**Error: ImagePullBackOff**
```bash
# Check image name and tag
kubectl describe pod <POD_NAME> -n taskmanager | grep -A 5 "Events:"

# Verify image exists
docker pull <IMAGE_NAME>:<TAG>

# Check image pull secrets (if using private registry)
kubectl get secrets -n taskmanager
kubectl describe secret <SECRET_NAME> -n taskmanager
```

**Error: Service endpoints not ready**
```bash
# Check service endpoints
kubectl get endpoints -n taskmanager

# Check pod labels match service selectors
kubectl get pods -n taskmanager --show-labels
kubectl describe svc <SERVICE_NAME> -n taskmanager

# Verify pod is ready
kubectl get pods -n taskmanager -o wide
```

**Error: PersistentVolumeClaim pending**
```bash
# Check PVC status
kubectl get pvc -n taskmanager

# Describe PVC
kubectl describe pvc <PVC_NAME> -n taskmanager

# Check StorageClass
kubectl get storageclass

# Check EBS CSI driver
kubectl get pods -n kube-system | grep ebs-csi

# Install EBS CSI driver if missing (see section 6.6)
```

### 15.3 Application Issues

**Error: Backend health check fails**
```bash
# Check backend logs
docker compose logs backend
# Or for Kubernetes:
kubectl logs -n taskmanager -l app=backend

# Test database connection
docker compose exec backend python -c "from app import db; print(db.engine.url)"

# Check environment variables
docker compose exec backend env | grep DATABASE_URL
# Or for Kubernetes:
kubectl exec -n taskmanager deployment/backend -- env | grep DATABASE_URL
```

**Error: Database connection refused**
```bash
# Check PostgreSQL is running
docker compose ps postgres
# Or for Kubernetes:
kubectl get pods -n taskmanager -l app=postgres

# Test connection
docker compose exec postgres pg_isready
# Or for Kubernetes:
kubectl exec -n taskmanager deployment/postgres -- pg_isready

# Check PostgreSQL logs
docker compose logs postgres
# Or for Kubernetes:
kubectl logs -n taskmanager -l app=postgres

# Verify credentials in secrets
kubectl get secret taskmanager-secrets -n taskmanager -o yaml
echo "<BASE64_STRING>" | base64 -d
```

**Error: Frontend shows 502 Bad Gateway**
```bash
# Check Nginx configuration
docker compose exec frontend nginx -t

# Check backend is accessible from frontend
docker compose exec frontend curl -i http://backend:8888/api/health
# Or for Kubernetes:
kubectl exec -n taskmanager deployment/frontend -- curl -i http://backend:8888/api/health

# Check Nginx logs
docker compose logs frontend
# Or for Kubernetes:
kubectl logs -n taskmanager -l app=frontend

# Verify proxy configuration
docker compose exec frontend cat /etc/nginx/conf.d/default.conf
```

### 15.4 Jenkins Issues

**Error: Cannot access Jenkins**
```bash
# Check Jenkins container status
docker ps | grep jenkins
docker logs jenkins

# Verify port mapping
docker port jenkins

# Check if port 8080 is accessible
curl http://localhost:8080

# Restart Jenkins
docker restart jenkins
```

**Error: Jenkins pipeline fails - Docker not found**
```bash
# Check Docker socket is mounted
docker inspect jenkins | grep -A 5 "Mounts"

# Install Docker in Jenkins container
docker exec -u root jenkins bash -c "apt-get update && apt-get install -y docker.io"

# Add jenkins user to docker group
docker exec -u root jenkins usermod -aG docker jenkins
docker restart jenkins
```

**Error: Jenkins cannot connect to Kubernetes**
```bash
# Verify kubeconfig credential in Jenkins
# Manage Jenkins → Credentials → kubeconfig

# Test kubectl in Jenkins
docker exec jenkins kubectl get nodes

# Copy kubeconfig to Jenkins
docker cp ~/.kube/config jenkins:/var/jenkins_home/.kube/config
docker exec jenkins chown jenkins:jenkins /var/jenkins_home/.kube/config
```

### 15.5 SonarQube Issues

**Error: SonarQube fails to start**
```bash
# Check SonarQube logs
docker logs sonarqube

# Verify system limits
sysctl vm.max_map_count
# Should be at least 524288

# Set limits if needed
sudo sysctl -w vm.max_map_count=524288

# Restart SonarQube
docker restart sonarqube
```

**Error: SonarQube analysis fails in Jenkins**
```bash
# Verify SonarQube server is accessible
curl http://localhost:9000/api/system/status

# Check SonarQube token in Jenkins credentials
# Manage Jenkins → Credentials → sonarqube-token

# Verify sonar-project.properties exists
cat sonar-project.properties

# Test analysis manually
docker run --rm \
  -e SONAR_HOST_URL="http://<EC2_IP>:9000" \
  -e SONAR_LOGIN="<TOKEN>" \
  -v "$(pwd):/usr/src" \
  sonarsource/sonar-scanner-cli
```

### 15.6 Monitoring Issues

**Error: Prometheus not scraping targets**
```bash
# Check Prometheus targets
curl http://localhost:9090/api/v1/targets

# Verify Prometheus can reach pods
kubectl exec -n monitoring deployment/prometheus -- wget -O- http://backend.taskmanager:8888/api/health

# Check Prometheus configuration
kubectl get configmap prometheus-config -n monitoring -o yaml

# Check Prometheus logs
kubectl logs -n monitoring -l app=prometheus
```

**Error: Grafana shows no data**
```bash
# Verify datasource in Grafana
curl http://localhost:3000/api/datasources

# Test Prometheus from Grafana
kubectl exec -n monitoring deployment/grafana -- wget -O- http://prometheus:9090/api/v1/query?query=up

# Check Grafana logs
kubectl logs -n monitoring -l app=grafana

# Verify dashboards are loaded
kubectl get configmap -n monitoring
```

### 15.7 Debugging Commands Cheatsheet

**Docker:**
```bash
# View all containers
docker ps -a

# View container logs
docker logs <container_name> -f --tail=100

# Execute command in container
docker exec -it <container_name> bash

# Inspect container
docker inspect <container_name>

# View container resource usage
docker stats

# Network troubleshooting
docker network ls
docker network inspect bridge
```

**Kubernetes:**
```bash
# Get all resources
kubectl get all -n <namespace>

# Describe resource
kubectl describe <resource_type> <resource_name> -n <namespace>

# View logs
kubectl logs <pod_name> -n <namespace> -f

# Execute command in pod
kubectl exec -it <pod_name> -n <namespace> -- bash

# Port forward
kubectl port-forward <pod_name> <local_port>:<remote_port> -n <namespace>

# Get events
kubectl get events -n <namespace> --sort-by='.lastTimestamp'

# Resource usage
kubectl top nodes
kubectl top pods -n <namespace>

# Debug pod
kubectl run debug --rm -it --image=busybox -- sh
```

**Network Debugging:**
```bash
# Test connectivity
ping <hostname>
telnet <hostname> <port>
nc -zv <hostname> <port>

# DNS lookup
nslookup <hostname>
dig <hostname>

# Port scanning
sudo netstat -tulpn | grep <port>
sudo ss -tulpn | grep <port>
sudo lsof -i :<port>

# Curl with debugging
curl -v http://<url>
curl -I http://<url>
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
