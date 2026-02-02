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
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
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

### Option A: Using Amazon EKS (Recommended for Production)

#### Step 1A: Install AWS CLI

Download and install AWS CLI v2:

```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

Verify installation:

```bash
aws --version
```

#### Step 2A: Configure AWS Credentials

Configure AWS CLI with your credentials:

```bash
aws configure
```

When prompted, enter:
- AWS Access Key ID: (your access key)
- AWS Secret Access Key: (your secret key)
- Default region name: us-east-1 (or your preferred region)
- Default output format: json

Verify configuration:

```bash
aws sts get-caller-identity
```

Should display your AWS account information.

#### Step 3A: Install eksctl

Install the EKS cluster management tool:

```bash
curl --silent --location "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_$(uname -s)_amd64.tar.gz" | tar xz -C /tmp
sudo mv /tmp/eksctl /usr/local/bin
```

Verify installation:

```bash
eksctl version
```

#### Step 4A: Create EKS Cluster

Create a new EKS cluster:

```bash
eksctl create cluster \
  --name devops-app-cluster \
  --version 1.27 \
  --region us-east-1 \
  --nodegroup-name devops-nodes \
  --node-type t3.medium \
  --nodes 2 \
  --nodes-min 2 \
  --nodes-max 4
```

This command will:
- Create an EKS cluster named `devops-app-cluster`
- Use Kubernetes version 1.27
- In us-east-1 region
- Create a node group with minimum 2 and maximum 4 t3.medium instances
- Configure IAM roles and VPC automatically

This process takes 15-20 minutes. Wait for completion.

Verify cluster creation:

```bash
aws eks describe-cluster --name devops-app-cluster --region us-east-1
eksctl get clusters --region us-east-1
```

#### Step 5A: Update kubeconfig

Configure kubectl to access the EKS cluster:

```bash
aws eks update-kubeconfig --name devops-app-cluster --region us-east-1
```

Verify kubectl access:

```bash
kubectl get nodes
kubectl get svc
```

Should show the nodes in your EKS cluster.

#### Step 6A: Configure RBAC and IAM

Create an IAM OIDC provider for the cluster:

```bash
eksctl utils associate-iam-oidc-provider \
  --cluster devops-app-cluster \
  --region us-east-1 \
  --approve
```

This enables IAM roles for service accounts (IRSA).

#### Step 7A: Install AWS Load Balancer Controller

The AWS Load Balancer Controller manages Ingress and Service resources.

First, create an IAM policy:

```bash
curl -o iam_policy.json https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/v2.4.7/docs/install/iam_policy.json

aws iam create-policy \
  --policy-name AWSLoadBalancerControllerIAMPolicy \
  --policy-document file://iam_policy.json
```

Create a service account:

```bash
eksctl create iamserviceaccount \
  --cluster devops-app-cluster \
  --namespace kube-system \
  --name aws-load-balancer-controller \
  --attach-policy-arn arn:aws:iam::YOUR-AWS-ACCOUNT-ID:policy/AWSLoadBalancerControllerIAMPolicy \
  --approve \
  --region us-east-1
```

Replace `YOUR-AWS-ACCOUNT-ID` with your actual AWS account ID. Get it from:

```bash
aws sts get-caller-identity --query Account --output text
```

Add the EKS chart repository:

```bash
helm repo add eks https://aws.github.io/eks-charts
helm repo update
```

Install the controller:

```bash
helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=devops-app-cluster \
  --set serviceAccount.create=false \
  --set serviceAccount.name=aws-load-balancer-controller
```

Verify installation:

```bash
kubectl get deployment -n kube-system aws-load-balancer-controller
```

#### Step 8A: Set Up Container Registry (ECR)

Create an ECR repository for your Docker images:

```bash
aws ecr create-repository \
  --repository-name devops-app/backend \
  --region us-east-1

aws ecr create-repository \
  --repository-name devops-app/frontend \
  --region us-east-1
```

Get the ECR login credentials:

```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR-ACCOUNT-ID.dkr.ecr.us-east-1.amazonaws.com
```

Replace `YOUR-ACCOUNT-ID` with your AWS account ID.

#### Step 9A: Create Kubernetes Namespace for EKS

```bash
kubectl create namespace devops-app
```

Create image pull secret for ECR:

```bash
kubectl create secret docker-registry ecr-secret \
  --docker-server=YOUR-ACCOUNT-ID.dkr.ecr.us-east-1.amazonaws.com \
  --docker-username=AWS \
  --docker-password=$(aws ecr get-login-password --region us-east-1) \
  -n devops-app
```

#### Step 10A: Update Kubernetes Manifests for EKS

Modify your Kubernetes manifests to use ECR images. Update [backend-deployment.yaml](k8s/backend-deployment.yaml):

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: devops-app
spec:
  replicas: 2
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      imagePullSecrets:
      - name: ecr-secret
      containers:
      - name: backend
        image: YOUR-ACCOUNT-ID.dkr.ecr.us-east-1.amazonaws.com/devops-app/backend:latest
        ports:
        - containerPort: 5000
        env:
        - name: DB_HOST
          value: postgres.devops-app.svc.cluster.local
        - name: DB_USER
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: username
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: password
```

Similarly update [frontend-deployment.yaml](k8s/frontend-deployment.yaml):

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  namespace: devops-app
spec:
  replicas: 2
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      imagePullSecrets:
      - name: ecr-secret
      containers:
      - name: frontend
        image: YOUR-ACCOUNT-ID.dkr.ecr.us-east-1.amazonaws.com/devops-app/frontend:latest
        ports:
        - containerPort: 80
```

#### Step 11A: Push Images to ECR

Build and push your Docker images:

```bash
# Build backend image
docker build -t devops-app/backend:latest backend/

# Tag for ECR
docker tag devops-app/backend:latest YOUR-ACCOUNT-ID.dkr.ecr.us-east-1.amazonaws.com/devops-app/backend:latest

# Push to ECR
docker push YOUR-ACCOUNT-ID.dkr.ecr.us-east-1.amazonaws.com/devops-app/backend:latest

# Build and push frontend
docker build -t devops-app/frontend:latest frontend/

docker tag devops-app/frontend:latest YOUR-ACCOUNT-ID.dkr.ecr.us-east-1.amazonaws.com/devops-app/frontend:latest

docker push YOUR-ACCOUNT-ID.dkr.ecr.us-east-1.amazonaws.com/devops-app/frontend:latest
```

#### Step 12A: Deploy to EKS Cluster

Create secrets for database credentials:

```bash
kubectl create secret generic db-credentials \
  --from-literal=username=appuser \
  --from-literal=password=your-secure-password \
  -n devops-app
```

Deploy PostgreSQL:

```bash
kubectl apply -f k8s/postgres-deployment.yaml -n devops-app
kubectl apply -f k8s/postgres-pvc.yaml -n devops-app
```

Wait for PostgreSQL to be ready:

```bash
kubectl wait --for=condition=ready pod -l app=postgres -n devops-app --timeout=300s
```

Deploy backend and frontend:

```bash
kubectl apply -f k8s/backend-deployment.yaml -n devops-app
kubectl apply -f k8s/frontend-deployment.yaml -n devops-app
```

Wait for deployments:

```bash
kubectl wait --for=condition=available --timeout=300s deployment/backend -n devops-app
kubectl wait --for=condition=available --timeout=300s deployment/frontend -n devops-app
```

#### Step 13A: Configure AWS Application Load Balancer (ALB)

Update [ingress.yaml](k8s/ingress.yaml) for AWS ALB:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: devops-app-ingress
  namespace: devops-app
  annotations:
    alb.ingress.kubernetes.io/load-balancer-type: alb
    alb.ingress.kubernetes.io/scheme: internet-facing
    alb.ingress.kubernetes.io/target-type: ip
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  ingressClassName: alb
  rules:
  - host: your-domain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend
            port:
              number: 80
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: backend
            port:
              number: 5000
  tls:
  - hosts:
    - your-domain.com
    secretName: tls-secret
```

Apply the Ingress:

```bash
kubectl apply -f k8s/ingress.yaml -n devops-app
```

Get the ALB DNS name:

```bash
kubectl get ingress -n devops-app
```

#### Step 14A: Set Up Auto-Scaling

Enable Cluster Autoscaler:

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/autoscaler/master/cluster-autoscaler/cloudprovider/aws/examples/cluster-autoscaler-autodiscover.yaml
```

Configure Horizontal Pod Autoscaler for backend:

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: backend-hpa
  namespace: devops-app
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: backend
  minReplicas: 2
  maxReplicas: 5
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

Apply HPA:

```bash
kubectl apply -f hpa-backend.yaml
```

#### Step 15A: Monitor EKS Cluster

View cluster metrics:

```bash
kubectl top nodes
kubectl top pods -n devops-app
```

Check EKS cluster health:

```bash
aws eks describe-cluster --name devops-app-cluster --region us-east-1 --query 'cluster.health'
```

---

### Option B: Using Local Minikube (For Development/Testing)

### Step 1B: Start Kubernetes Cluster

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

Jenkins credentials are used to authenticate with external services. This is critical for CI/CD pipelines.

#### Step 3.1: Access Credentials Page

1. Open Jenkins Dashboard: http://your-instance-ip:8080
2. Click "Manage Jenkins" (gear icon in left sidebar)
3. Click "Manage Credentials"
4. Click on "(global)" under "Stores scoped to Jenkins"

#### Step 3.2: Create SSH Key Credential (For Git Access)

This credential is used to clone Git repositories.

**Generate SSH Key (if you don't have one):**

```bash
ssh-keygen -t rsa -b 4096 -f ~/.ssh/jenkins_key -N ""
```

This creates:
- `~/.ssh/jenkins_key` - Private key
- `~/.ssh/jenkins_key.pub` - Public key

Add public key to GitHub/GitLab:

1. Copy the public key:
   ```bash
   cat ~/.ssh/jenkins_key.pub
   ```

2. Go to your Git repository settings
3. Add deploy key or add to user SSH keys
4. Paste the public key

**Add SSH Credentials in Jenkins:**

1. Click "Add Credentials" in Jenkins
2. Choose "Kind": **SSH Username with private key**
3. Fill in the following fields:

   - **Scope**: Global (Jenkins, nodes, items, all child items, etc)
   - **ID**: `git-ssh-key` (use this in Jenkinsfile)
   - **Description**: Git SSH Key for repository access
   - **Username**: `git` (for GitHub/GitLab)
   - **Private Key**: 
     - Select "Enter directly"
     - Paste the entire content of `~/.ssh/jenkins_key`
   - **Passphrase**: (leave empty if you used empty passphrase above)

4. Click "Create"

**Verify SSH Credential:**

Click on the credential you created, then click "Test Connection":

```bash
ssh -i ~/.ssh/jenkins_key git@github.com
```

Should show: "Hi username! You've successfully authenticated..."

#### Step 3.3: Create Docker Hub Credential

This credential is used to push Docker images to Docker Hub.

**Create Docker Hub Account (if needed):**

1. Go to https://hub.docker.com
2. Sign up or log in
3. Create a Personal Access Token (better than password):
   - Click your profile → Account Settings → Security
   - Click "New Access Token"
   - Name it: `jenkins-token`
   - Copy the token

**Add Docker Hub Credentials in Jenkins:**

1. Click "Add Credentials"
2. Choose "Kind": **Username with password**
3. Fill in:

   - **Scope**: Global
   - **ID**: `dockerhub` (use in Jenkinsfile)
   - **Description**: Docker Hub Registry Credentials
   - **Username**: Your Docker Hub username
   - **Password**: The access token you created above
   - **Create**: Jenkins Credential Provider

4. Click "Create"

#### Step 3.4: Create ECR Credential (For AWS)

For pushing images to Amazon ECR.

**Create AWS IAM User for ECR (if needed):**

1. Go to AWS IAM console
2. Create new user: `jenkins-ecr`
3. Attach policy: `AmazonEC2ContainerRegistryPowerUser`
4. Create Access Key:
   - Click user → Security credentials → Create access key
   - Copy Access Key ID and Secret Access Key

**Add ECR Credentials in Jenkins:**

1. Click "Add Credentials"
2. Choose "Kind": **AWS Credentials**
3. Fill in:

   - **Scope**: Global
   - **ID**: `aws-ecr-credentials` (use in Jenkinsfile)
   - **Description**: AWS ECR Push Credentials
   - **Access Key ID**: Your AWS access key
   - **Secret Access Key**: Your AWS secret key
   - **Create**: Jenkins Credential Provider

4. Click "Create"

#### Step 3.5: Create GitHub/GitLab Token Credential

For accessing repositories via HTTPS instead of SSH.

**Generate GitHub Personal Token:**

1. Go to GitHub → Settings → Developer settings → Personal access tokens
2. Click "Generate new token"
3. Name: `jenkins-token`
4. Select scopes:
   - `repo` (full control of private repositories)
   - `workflow` (update GitHub Actions and workflows)
5. Click "Generate token"
6. Copy the token

**Add GitHub Token in Jenkins:**

1. Click "Add Credentials"
2. Choose "Kind": **Secret text**
3. Fill in:

   - **Scope**: Global
   - **ID**: `github-token` (use in Jenkinsfile)
   - **Description**: GitHub Personal Access Token
   - **Secret**: Paste your GitHub token

4. Click "Create"

#### Step 3.6: Create Kubernetes Config Credential

For deploying to Kubernetes clusters.

**Get kubeconfig:**

```bash
cat ~/.kube/config
```

Copy the entire content.

**Add Kubernetes Credentials in Jenkins:**

1. Click "Add Credentials"
2. Choose "Kind**: **Secret file**
3. Fill in:

   - **Scope**: Global
   - **ID**: `kubeconfig` (use in Jenkinsfile)
   - **Description**: Kubernetes Config File
   - **File**: Upload your kubeconfig file (or use content from above)

4. Click "Create"

For EKS specifically:

```bash
aws eks update-kubeconfig --name devops-app-cluster --region us-east-1
```

Then upload the generated kubeconfig file.

#### Step 3.7: Create PostgreSQL Credentials

For database access in scripts.

**Add Database Credentials:**

1. Click "Add Credentials"
2. Choose "Kind**: **Username with password**
3. Fill in:

   - **Scope**: Global
   - **ID**: `postgres-credentials` (use in Jenkinsfile)
   - **Description**: PostgreSQL Database Credentials
   - **Username**: `appuser`
   - **Password**: Your secure database password

4. Click "Create"

#### Step 3.8: Create Slack Webhook (For Notifications)

To receive build notifications in Slack.

**Create Slack Webhook:**

1. Go to Slack → Apps & integrations
2. Search for "Incoming WebHooks"
3. Click "Add to Slack"
4. Select channel (e.g., #devops)
5. Copy the Webhook URL

**Add Webhook in Jenkins:**

1. Click "Add Credentials"
2. Choose "Kind**: **Secret text**
3. Fill in:

   - **Scope**: Global
   - **ID**: `slack-webhook` (use in Jenkinsfile)
   - **Description**: Slack Webhook for Build Notifications
   - **Secret**: Paste the webhook URL

4. Click "Create"

#### Step 3.9: Create Email Credentials

For sending email notifications.

**Add Email Credentials:**

1. Click "Add Credentials"
2. Choose "Kind**: **Username with password**
3. Fill in:

   - **Scope**: Global
   - **ID**: `email-credentials` (use in Jenkinsfile)
   - **Description**: Email SMTP Credentials
   - **Username**: Your email address
   - **Password**: Your email password or app password

4. Click "Create"

#### Step 3.10: Verify All Credentials

View all created credentials:

```bash
# List all credentials in Jenkins
curl -u admin:your-password http://localhost:8080/credentials/store/system/domain/_/api/json
```

Click on each credential to verify they're correct and working.

---

### Step 4: Create Pipeline Job with Detailed Jenkinsfile

#### Step 4.1: Create New Pipeline Job

1. Click "New Item"
2. Enter job name: `Python-DevOps-Pipeline`
3. Select "Pipeline"
4. Click "OK"

#### Step 4.2: Configure Pipeline

In the Pipeline section, select:
- **Definition**: Pipeline script from SCM
- **SCM**: Git
- **Repository URL**: `https://github.com/your-username/Python-DevOps.git`
- **Credentials**: Select the GitHub token or SSH key created above
- **Branch Specifier**: `*/main` or `*/master`
- **Script Path**: `Jenkinsfile`

#### Step 4.3: Create Comprehensive Jenkinsfile

Create a detailed Jenkinsfile in your project root:

```groovy
pipeline {
    agent any
    
    environment {
        // Docker Registry
        DOCKER_REGISTRY = 'YOUR-ACCOUNT-ID.dkr.ecr.us-east-1.amazonaws.com'
        DOCKER_REGISTRY_CREDENTIALS = 'aws-ecr-credentials'
        
        // ECR Repository Names
        BACKEND_IMAGE = "${DOCKER_REGISTRY}/devops-app/backend"
        FRONTEND_IMAGE = "${DOCKER_REGISTRY}/devops-app/frontend"
        
        // Kubernetes
        KUBE_NAMESPACE = 'devops-app'
        KUBE_CLUSTER = 'devops-app-cluster'
        KUBECONFIG = credentials('kubeconfig')
        
        // Git
        GIT_CREDENTIALS = 'git-ssh-key'
        
        // Slack
        SLACK_WEBHOOK = credentials('slack-webhook')
        
        // Version
        BUILD_VERSION = "${BUILD_NUMBER}"
        BUILD_TIMESTAMP = "${new Date().format('yyyyMMdd-HHmmss')}"
    }
    
    options {
        // Keep last 10 builds
        buildDiscarder(logRotator(numToKeepStr: '10'))
        
        // Timeout after 1 hour
        timeout(time: 1, unit: 'HOURS')
        
        // Disable concurrent builds
        disableConcurrentBuilds()
        
        // Add timestamps to console output
        timestamps()
    }
    
    triggers {
        // Trigger on Git push
        githubPush()
        
        // Poll SCM every 15 minutes
        pollSCM('H/15 * * * *')
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo "========== Checking out code from repository =========="
                checkout(
                    [
                        $class: 'GitSCM',
                        branches: [[name: '*/main']],
                        userRemoteConfigs: [[
                            url: 'https://github.com/your-username/Python-DevOps.git',
                            credentialsId: 'github-token'
                        ]]
                    ]
                )
                
                echo "Current commit: ${GIT_COMMIT}"
                echo "Branch: ${GIT_BRANCH}"
            }
        }
        
        stage('Validate') {
            steps {
                echo "========== Validating configuration files =========="
                
                // Validate Docker Compose syntax
                sh 'docker-compose config > /dev/null'
                echo "✓ Docker Compose configuration is valid"
                
                // Validate Kubernetes manifests
                sh '''
                    for file in k8s/*.yaml; do
                        echo "Validating $file..."
                        kubectl apply -f $file --dry-run=client --namespace=${KUBE_NAMESPACE} || exit 1
                    done
                '''
                echo "✓ Kubernetes manifests are valid"
                
                // Lint Jenkinsfile
                sh 'groovy -c "echo 'Jenkinsfile syntax is valid'"'
                echo "✓ Jenkinsfile syntax is valid"
            }
        }
        
        stage('Build Backend') {
            steps {
                echo "========== Building backend Docker image =========="
                
                dir('backend') {
                    sh '''
                        docker build \
                            --build-arg BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ') \
                            --build-arg VCS_REF=${GIT_COMMIT:0:8} \
                            --build-arg VERSION=${BUILD_VERSION} \
                            -t ${BACKEND_IMAGE}:${BUILD_VERSION} \
                            -t ${BACKEND_IMAGE}:latest \
                            .
                    '''
                    echo "✓ Backend image built successfully"
                }
            }
        }
        
        stage('Build Frontend') {
            steps {
                echo "========== Building frontend Docker image =========="
                
                dir('frontend') {
                    sh '''
                        docker build \
                            --build-arg BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ') \
                            --build-arg VCS_REF=${GIT_COMMIT:0:8} \
                            --build-arg VERSION=${BUILD_VERSION} \
                            -t ${FRONTEND_IMAGE}:${BUILD_VERSION} \
                            -t ${FRONTEND_IMAGE}:latest \
                            .
                    '''
                    echo "✓ Frontend image built successfully"
                }
            }
        }
        
        stage('Test Backend') {
            steps {
                echo "========== Running backend unit tests =========="
                
                dir('backend') {
                    sh '''
                        # Create virtual environment
                        python3 -m venv test-venv
                        source test-venv/bin/activate
                        
                        # Install dependencies
                        pip install -r requirements.txt pytest pytest-cov
                        
                        # Run tests with coverage
                        pytest --cov=app --cov-report=xml --cov-report=html tests/ || exit 1
                    '''
                    echo "✓ Backend tests passed"
                }
            }
        }
        
        stage('Security Scan') {
            steps {
                echo "========== Running security scans =========="
                
                // Scan for vulnerabilities in dependencies
                sh '''
                    cd backend
                    pip install bandit safety
                    
                    # Bandit: Check for security issues in Python code
                    bandit -r app/ -f json -o bandit-report.json || echo "Vulnerabilities found, continuing..."
                    
                    # Safety: Check for known vulnerabilities in dependencies
                    safety check --json > safety-report.json || echo "Unsafe packages found, continuing..."
                '''
                
                // Scan Docker images for vulnerabilities
                sh '''
                    echo "Scanning backend image for vulnerabilities..."
                    trivy image --severity HIGH,CRITICAL ${BACKEND_IMAGE}:${BUILD_VERSION} || echo "Vulnerabilities found in image"
                    
                    echo "Scanning frontend image for vulnerabilities..."
                    trivy image --severity HIGH,CRITICAL ${FRONTEND_IMAGE}:${BUILD_VERSION} || echo "Vulnerabilities found in image"
                '''
                
                echo "✓ Security scans completed (check reports for details)"
            }
        }
        
        stage('Push to Registry') {
            when {
                branch 'main'
            }
            steps {
                echo "========== Pushing images to AWS ECR =========="
                
                withAWS(credentials: 'aws-ecr-credentials', region: 'us-east-1') {
                    sh '''
                        # Login to ECR
                        aws ecr get-login-password --region us-east-1 | \
                        docker login --username AWS --password-stdin ${DOCKER_REGISTRY}
                        
                        # Push backend image
                        docker push ${BACKEND_IMAGE}:${BUILD_VERSION}
                        docker push ${BACKEND_IMAGE}:latest
                        echo "✓ Backend image pushed to ECR"
                        
                        # Push frontend image
                        docker push ${FRONTEND_IMAGE}:${BUILD_VERSION}
                        docker push ${FRONTEND_IMAGE}:latest
                        echo "✓ Frontend image pushed to ECR"
                    '''
                }
            }
        }
        
        stage('Deploy to EKS') {
            when {
                branch 'main'
            }
            steps {
                echo "========== Deploying to EKS cluster =========="
                
                withAWS(credentials: 'aws-ecr-credentials', region: 'us-east-1') {
                    sh '''
                        # Update kubeconfig for EKS
                        aws eks update-kubeconfig --name ${KUBE_CLUSTER} --region us-east-1
                        
                        # Create namespace if it doesn't exist
                        kubectl create namespace ${KUBE_NAMESPACE} --dry-run=client -o yaml | kubectl apply -f -
                        
                        # Create image pull secret
                        kubectl create secret docker-registry ecr-secret \
                            --docker-server=${DOCKER_REGISTRY} \
                            --docker-username=AWS \
                            --docker-password=$(aws ecr get-login-password --region us-east-1) \
                            -n ${KUBE_NAMESPACE} \
                            --dry-run=client -o yaml | kubectl apply -f -
                        
                        # Apply Kubernetes manifests
                        kubectl apply -f k8s/postgres-pvc.yaml -n ${KUBE_NAMESPACE}
                        kubectl apply -f k8s/postgres-deployment.yaml -n ${KUBE_NAMESPACE}
                        
                        # Wait for PostgreSQL to be ready
                        kubectl wait --for=condition=ready pod -l app=postgres -n ${KUBE_NAMESPACE} --timeout=300s
                        
                        # Update image tags in deployment manifests
                        kubectl set image deployment/backend \
                            backend=${BACKEND_IMAGE}:${BUILD_VERSION} \
                            -n ${KUBE_NAMESPACE} || \
                        kubectl apply -f k8s/backend-deployment.yaml -n ${KUBE_NAMESPACE}
                        
                        kubectl set image deployment/frontend \
                            frontend=${FRONTEND_IMAGE}:${BUILD_VERSION} \
                            -n ${KUBE_NAMESPACE} || \
                        kubectl apply -f k8s/frontend-deployment.yaml -n ${KUBE_NAMESPACE}
                        
                        # Apply ingress
                        kubectl apply -f k8s/ingress.yaml -n ${KUBE_NAMESPACE}
                        
                        # Wait for deployments
                        kubectl rollout status deployment/backend -n ${KUBE_NAMESPACE} --timeout=5m
                        kubectl rollout status deployment/frontend -n ${KUBE_NAMESPACE} --timeout=5m
                        
                        echo "✓ Deployment completed successfully"
                        
                        # Display deployment status
                        echo "========== Deployment Status =========="
                        kubectl get all -n ${KUBE_NAMESPACE}
                        
                        echo "========== Service Details =========="
                        kubectl describe svc -n ${KUBE_NAMESPACE}
                    '''
                }
            }
        }
        
        stage('Health Check') {
            steps {
                echo "========== Performing health checks =========="
                
                sh '''
                    # Wait a bit for services to stabilize
                    sleep 10
                    
                    # Check backend health
                    BACKEND_POD=$(kubectl get pods -n ${KUBE_NAMESPACE} -l app=backend -o jsonpath='{.items[0].metadata.name}')
                    if [ ! -z "$BACKEND_POD" ]; then
                        echo "Testing backend pod: $BACKEND_POD"
                        kubectl exec -it $BACKEND_POD -n ${KUBE_NAMESPACE} -- curl -f http://localhost:5000/health || echo "Health check endpoint not available"
                    fi
                    
                    # Check frontend health
                    FRONTEND_POD=$(kubectl get pods -n ${KUBE_NAMESPACE} -l app=frontend -o jsonpath='{.items[0].metadata.name}')
                    if [ ! -z "$FRONTEND_POD" ]; then
                        echo "Testing frontend pod: $FRONTEND_POD"
                        kubectl exec -it $FRONTEND_POD -n ${KUBE_NAMESPACE} -- curl -f http://localhost || echo "Frontend health check failed"
                    fi
                    
                    echo "✓ Health checks completed"
                '''
            }
        }
        
        stage('Notification') {
            steps {
                echo "========== Sending notifications =========="
                
                script {
                    // Prepare message based on status
                    def status = currentBuild.result ?: 'SUCCESS'
                    def color = status == 'SUCCESS' ? 'good' : 'danger'
                    def emoji = status == 'SUCCESS' ? '✓' : '✗'
                    
                    // Send to Slack
                    sh '''
                        curl -X POST -H 'Content-type: application/json' \
                        --data "{
                            \"text\": \"${emoji} Build ${BUILD_NUMBER} ${status}\",
                            \"attachments\": [{
                                \"color\": \"${color}\",
                                \"fields\": [
                                    {\"title\": \"Project\", \"value\": \"Python-DevOps\", \"short\": true},
                                    {\"title\": \"Build\", \"value\": \"${BUILD_NUMBER}\", \"short\": true},
                                    {\"title\": \"Status\", \"value\": \"${status}\", \"short\": true},
                                    {\"title\": \"Branch\", \"value\": \"${GIT_BRANCH}\", \"short\": true},
                                    {\"title\": \"Commit\", \"value\": \"${GIT_COMMIT:0:8}\", \"short\": true},
                                    {\"title\": \"Duration\", \"value\": \"${currentBuild.durationString}\", \"short\": true}
                                ],
                                \"actions\": [{
                                    \"type\": \"button\",
                                    \"text\": \"View Build\",
                                    \"url\": \"${BUILD_URL}\"
                                }]
                            }]
                        }" ${SLACK_WEBHOOK}
                    '''
                    
                    echo "✓ Notifications sent"
                }
            }
        }
    }
    
    post {
        always {
            echo "========== Pipeline Cleanup =========="
            
            // Archive test reports
            junit allowEmptyResults: true, testResults: 'backend/test-results.xml'
            
            // Publish coverage reports
            publishHTML(
                allowMissing: false,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'backend/htmlcov',
                reportFiles: 'index.html',
                reportName: 'Coverage Report'
            )
            
            // Clean workspace
            cleanWs()
        }
        
        success {
            echo "========== Pipeline Succeeded =========="
            
            // Send success notification (already done in Notification stage)
            script {
                sh '''
                    echo "Build completed successfully!"
                    echo "Application deployed to: ${KUBE_CLUSTER}"
                    echo "Namespace: ${KUBE_NAMESPACE}"
                '''
            }
        }
        
        failure {
            echo "========== Pipeline Failed =========="
            
            // Send failure notification
            script {
                sh '''
                    echo "Build failed!"
                    echo "Check logs for details: ${BUILD_URL}console"
                '''
            }
        }
        
        unstable {
            echo "========== Pipeline Unstable =========="
            
            // Send warning notification
            script {
                sh '''
                    echo "Build is unstable!"
                    echo "Review test results: ${BUILD_URL}testReport"
                '''
            }
        }
    }
}
```

#### Step 4.4: Save and Test Pipeline

1. Click "Save" in Jenkins
2. Click "Build Now" to trigger first build
3. Monitor build progress in "Console Output"

---

### Step 5: Configure Pipeline Triggers

#### Step 5.1: GitHub Webhook Setup

For automatic builds on Git push:

1. Go to your GitHub repository → Settings → Webhooks
2. Click "Add webhook"
3. Configure:

   - **Payload URL**: `http://your-jenkins-ip:8080/github-webhook/`
   - **Content type**: `application/json`
   - **Events**: Select "Push events" and "Pull Requests"
   - **Active**: Yes

4. Click "Add webhook"

#### Step 5.2: Verify Webhook

In Jenkins, go to:
1. Manage Jenkins → System
2. Search for "GitHub"
3. Set up "GitHub Server"
4. Test connection

---

### Step 6: Pipeline Job Configuration Options

#### Step 6.1: Build Triggers

Configure automatic build triggers:

1. In Jenkins job, click "Configure"
2. Go to "Build Triggers" section
3. Options:

   - **GitHub hook trigger for GITScm polling**: Trigger on Git push
   - **Poll SCM**: `H/15 * * * *` (every 15 minutes)
   - **Build periodically**: `H H * * *` (daily)

#### Step 6.2: Post-Build Actions

Configure post-build notifications:

1. Add "Slack Notification"
2. Add "Email Notification"
3. Add "Archive artifacts"
4. Add "Publish test results"

#### Step 6.3: Pipeline Options

In Jenkinsfile, configure:

```groovy
options {
    // Keep builds
    buildDiscarder(logRotator(numToKeepStr: '10', artifactNumToKeepStr: '5'))
    
    // Timeout
    timeout(time: 1, unit: 'HOURS')
    
    // Disable concurrent builds
    disableConcurrentBuilds()
    
    // Timestamps
    timestamps()
}
```

---

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
