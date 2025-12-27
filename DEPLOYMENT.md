# TaskManager Application - Complete Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Local Development with Docker Compose](#local-development-with-docker-compose)
3. [Kubernetes Deployment](#kubernetes-deployment)
4. [Monitoring Setup (Prometheus & Grafana)](#monitoring-setup-prometheus--grafana)
5. [CI/CD Pipeline (Jenkins)](#cicd-pipeline-jenkins)
6. [Verification & Testing](#verification--testing)
7. [Troubleshooting](#troubleshooting)
8. [Cleanup](#cleanup)

---

## Prerequisites

### Required Software
- **Docker**: Version 20.10 or higher
- **Docker Compose**: Version 2.0 or higher
- **Kubernetes**: Minikube, Kind, or Cloud Provider (EKS, AKS, GKE)
- **kubectl**: Version 1.24 or higher
- **Git**: Latest version

### Verify Installations
```bash
# Check Docker
docker --version
docker compose version

# Check kubectl
kubectl version --client

# Check Kubernetes cluster
kubectl cluster-info
kubectl get nodes
```

### Docker Hub Account
1. Sign up at https://hub.docker.com
2. Create access token: Account Settings → Security → New Access Token
3. Login locally:
   ```bash
   docker login
   # Enter your username and access token
   ```

---

## Local Development with Docker Compose

### Step 1: Clone Repository
```bash
git clone <your-repository-url>
cd Python-DevOps
```

### Step 2: Review Configuration Files
```bash
# Check docker-compose.yml
cat docker-compose.yml

# Check backend Dockerfile
cat backend/Dockerfile

# Check frontend Dockerfile
cat frontend/Dockerfile
```

### Step 3: Build Images
```bash
# Build all images
docker compose build

# Or build individually
docker compose build backend
docker compose build frontend
```

### Step 4: Start Services
```bash
# Start all services in detached mode
docker compose up -d

# Or start with logs
docker compose up

# Check running containers
docker compose ps
```

### Step 5: Verify Local Deployment
```bash
# Check container status
docker compose ps

# View logs
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres

# Test backend API
curl http://localhost:8888/api/health

# Test frontend
curl http://localhost:80
```

### Step 6: Access Application
- **Frontend**: http://localhost:80
- **Backend API**: http://localhost:8888
- **PostgreSQL**: localhost:5432 (username: taskmanager, password: taskmanager123)

### Step 7: Stop Services
```bash
# Stop containers but keep volumes
docker compose stop

# Stop and remove containers
docker compose down

# Stop, remove containers and volumes
docker compose down -v
```

---

## Kubernetes Deployment

### Step 1: Setup Kubernetes Cluster

#### Option A: Using Minikube
```bash
# Start Minikube
minikube start --cpus=4 --memory=8192 --driver=docker

# Enable ingress addon
minikube addons enable ingress

# Verify cluster
kubectl get nodes
```

#### Option B: Using Kind
```bash
# Create cluster
kind create cluster --name taskmanager

# Verify cluster
kubectl cluster-info --context kind-taskmanager
```

#### Option C: Using Cloud Provider
```bash
# AWS EKS
aws eks update-kubeconfig --region us-east-1 --name my-cluster

# Azure AKS
az aks get-credentials --resource-group myResourceGroup --name myAKSCluster

# Google GKE
gcloud container clusters get-credentials my-cluster --region us-central1
```

### Step 2: Build and Push Docker Images

```bash
# Set your Docker Hub username
export DOCKER_USERNAME=saikiranasamwar4

# Build backend image
cd backend
docker build -t ${DOCKER_USERNAME}/taskmanager-backend:v1.0 .
docker tag ${DOCKER_USERNAME}/taskmanager-backend:v1.0 ${DOCKER_USERNAME}/taskmanager-backend:latest

# Build frontend image
cd ../frontend
docker build -t ${DOCKER_USERNAME}/taskmanager-frontend:v1.0 .
docker tag ${DOCKER_USERNAME}/taskmanager-frontend:v1.0 ${DOCKER_USERNAME}/taskmanager-frontend:latest

# Return to root
cd ..

# Push images to Docker Hub
docker push ${DOCKER_USERNAME}/taskmanager-backend:v1.0
docker push ${DOCKER_USERNAME}/taskmanager-backend:latest
docker push ${DOCKER_USERNAME}/taskmanager-frontend:v1.0
docker push ${DOCKER_USERNAME}/taskmanager-frontend:latest
```

### Step 3: Update Image Names in K8s Manifests (if needed)

```bash
# Update backend-deployment.yaml
sed -i 's|saikiranasamwar4|'${DOCKER_USERNAME}'|g' k8s/backend-deployment.yaml

# Update frontend-deployment.yaml
sed -i 's|saikiranasamwar4|'${DOCKER_USERNAME}'|g' k8s/frontend-deployment.yaml

# For Windows PowerShell, use:
# (Get-Content k8s/backend-deployment.yaml) -replace 'saikiranasamwar4', $env:DOCKER_USERNAME | Set-Content k8s/backend-deployment.yaml
# (Get-Content k8s/frontend-deployment.yaml) -replace 'saikiranasamwar4', $env:DOCKER_USERNAME | Set-Content k8s/frontend-deployment.yaml
```

### Step 4: Create Namespace

```bash
# Create taskmanager namespace
kubectl apply -f k8s/namespace.yaml

# Verify namespace
kubectl get namespaces
kubectl get ns taskmanager
```

### Step 5: Create Secrets

```bash
# Apply secrets
kubectl apply -f k8s/secrets.yaml

# Verify secrets
kubectl get secrets -n taskmanager
kubectl describe secret postgres-secret -n taskmanager
kubectl describe secret backend-secret -n taskmanager
```

### Step 6: Deploy PostgreSQL Database

```bash
# Create Persistent Volume Claim
kubectl apply -f k8s/postgres-pvc.yaml

# Verify PVC
kubectl get pvc -n taskmanager

# Deploy PostgreSQL
kubectl apply -f k8s/postgres-deployment.yaml

# Wait for deployment
kubectl wait --for=condition=ready pod -l app=postgres -n taskmanager --timeout=300s

# Verify PostgreSQL
kubectl get deployment postgres -n taskmanager
kubectl get pods -n taskmanager -l app=postgres
kubectl get svc postgres -n taskmanager

# Check logs
kubectl logs -n taskmanager deployment/postgres
```

### Step 7: Deploy Backend Application

```bash
# Deploy backend
kubectl apply -f k8s/backend-deployment.yaml

# Wait for deployment
kubectl wait --for=condition=ready pod -l app=backend -n taskmanager --timeout=300s

# Verify backend
kubectl get deployment backend -n taskmanager
kubectl get pods -n taskmanager -l app=backend
kubectl get svc backend -n taskmanager

# Check logs
kubectl logs -n taskmanager deployment/backend --tail=50 -f
```

### Step 8: Deploy Frontend Application

```bash
# Deploy frontend
kubectl apply -f k8s/frontend-deployment.yaml

# Wait for deployment
kubectl wait --for=condition=ready pod -l app=frontend -n taskmanager --timeout=300s

# Verify frontend
kubectl get deployment frontend -n taskmanager
kubectl get pods -n taskmanager -l app=frontend
kubectl get svc frontend -n taskmanager

# Check logs
kubectl logs -n taskmanager deployment/frontend --tail=50 -f
```

### Step 9: Setup Ingress (Optional but Recommended)

```bash
# Install Nginx Ingress Controller (if not already installed)
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml

# Wait for ingress controller to be ready
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=120s

# Apply application ingress
kubectl apply -f k8s/ingress.yaml

# Verify ingress
kubectl get ingress -n taskmanager
kubectl describe ingress taskmanager-ingress -n taskmanager
```

### Step 10: Access Application in Kubernetes

#### Option A: Using LoadBalancer (Cloud providers)
```bash
# Get external IP
kubectl get svc frontend -n taskmanager

# Wait for EXTERNAL-IP to be assigned
# Access: http://<EXTERNAL-IP>
```

#### Option B: Using NodePort (Minikube/Kind)
```bash
# Get NodePort
kubectl get svc frontend -n taskmanager

# For Minikube
minikube service frontend -n taskmanager

# Get URL
minikube service frontend -n taskmanager --url

# Access the URL shown
```

#### Option C: Using Port Forward
```bash
# Forward frontend port
kubectl port-forward -n taskmanager svc/frontend 8080:80

# Access: http://localhost:8080

# In another terminal, forward backend port
kubectl port-forward -n taskmanager svc/backend 8888:8888

# Access API: http://localhost:8888
```

### Step 11: Verify Full Deployment

```bash
# Check all resources
kubectl get all -n taskmanager

# Check pods status
kubectl get pods -n taskmanager -o wide

# Check services
kubectl get svc -n taskmanager

# Check persistent volumes
kubectl get pvc -n taskmanager

# Check detailed pod information
kubectl describe pods -n taskmanager

# Check events
kubectl get events -n taskmanager --sort-by='.lastTimestamp'
```

---

## Monitoring Setup (Prometheus & Grafana)

### Step 1: Create Monitoring Namespace

```bash
# The namespace is created in prometheus-deployment.yaml
kubectl apply -f monitoring/prometheus-deployment.yaml

# Verify namespace
kubectl get namespace monitoring
```

### Step 2: Setup Prometheus RBAC

```bash
# Create service account and permissions
kubectl apply -f monitoring/prometheus-rbac.yaml

# Verify RBAC
kubectl get serviceaccount -n monitoring
kubectl get clusterrole prometheus
kubectl get clusterrolebinding prometheus
```

### Step 3: Deploy Prometheus Configuration

```bash
# Apply Prometheus config
kubectl apply -f monitoring/prometheus-config.yaml

# Verify ConfigMap
kubectl get configmap -n monitoring
kubectl describe configmap prometheus-config -n monitoring
```

### Step 4: Deploy Prometheus

```bash
# Deploy Prometheus (if not already done in Step 1)
kubectl apply -f monitoring/prometheus-deployment.yaml

# Wait for Prometheus to be ready
kubectl wait --for=condition=ready pod -l app=prometheus -n monitoring --timeout=300s

# Verify Prometheus
kubectl get deployment prometheus -n monitoring
kubectl get pods -n monitoring -l app=prometheus
kubectl get svc prometheus -n monitoring
kubectl get pvc -n monitoring

# Check logs
kubectl logs -n monitoring deployment/prometheus --tail=50
```

### Step 5: Access Prometheus

#### Option A: Using NodePort
```bash
# Get NodePort
kubectl get svc prometheus -n monitoring

# For Minikube
minikube service prometheus -n monitoring --url

# Access the URL shown
```

#### Option B: Using Port Forward
```bash
# Forward Prometheus port
kubectl port-forward -n monitoring svc/prometheus 9090:9090

# Access: http://localhost:9090
```

### Step 6: Verify Prometheus Targets

1. Open Prometheus UI: http://localhost:9090
2. Go to Status → Targets
3. Verify all targets are UP
4. Go to Status → Configuration to see config
5. Try sample query: `up` or `kube_pod_info`

### Step 7: Deploy Grafana Data Source Configuration

```bash
# Apply Grafana datasource
kubectl apply -f monitoring/grafana-datasource.yaml

# Verify ConfigMap
kubectl get configmap grafana-datasources -n monitoring
kubectl describe configmap grafana-datasources -n monitoring
```

### Step 8: Deploy Grafana Dashboard Configuration

```bash
# Apply dashboard config
kubectl apply -f monitoring/grafana-dashboard-config.yaml

# Verify ConfigMap
kubectl get configmap grafana-dashboards-config -n monitoring
```

### Step 9: Deploy Grafana

```bash
# Deploy Grafana
kubectl apply -f monitoring/grafana-deployment.yaml

# Wait for Grafana to be ready
kubectl wait --for=condition=ready pod -l app=grafana -n monitoring --timeout=300s

# Verify Grafana
kubectl get deployment grafana -n monitoring
kubectl get pods -n monitoring -l app=grafana
kubectl get svc grafana -n monitoring
kubectl get pvc -n monitoring

# Check logs
kubectl logs -n monitoring deployment/grafana --tail=50
```

### Step 10: Access Grafana

#### Option A: Using NodePort
```bash
# Get NodePort
kubectl get svc grafana -n monitoring

# For Minikube
minikube service grafana -n monitoring --url

# Access the URL shown
```

#### Option B: Using Port Forward
```bash
# Forward Grafana port
kubectl port-forward -n monitoring svc/grafana 3000:3000

# Access: http://localhost:3000
```

### Step 11: Configure Grafana

1. **Login to Grafana**
   - URL: http://localhost:3000
   - Username: `admin`
   - Password: `admin123`
   - (Change password on first login if prompted)

2. **Verify Data Source**
   - Go to Configuration → Data Sources
   - Prometheus should be auto-configured
   - Click on Prometheus → Test → Should see "Data source is working"

3. **Import Dashboard**
   - Go to Dashboards → Import
   - Upload `monitoring/grafana-dashboard.json` or paste content
   - Select Prometheus as data source
   - Click Import

4. **Explore Metrics**
   - Go to Explore
   - Select Prometheus
   - Try queries:
     ```promql
     # CPU Usage
     rate(container_cpu_usage_seconds_total{namespace="taskmanager"}[5m])
     
     # Memory Usage
     container_memory_usage_bytes{namespace="taskmanager"}
     
     # Pod Status
     kube_pod_status_phase{namespace="taskmanager"}
     
     # HTTP Requests (if instrumented)
     rate(http_requests_total[5m])
     ```

### Step 12: Create Custom Dashboards

1. **Create New Dashboard**
   - Click + → Dashboard → Add new panel
   
2. **Add CPU Panel**
   - Query: `rate(container_cpu_usage_seconds_total{namespace="taskmanager"}[5m])`
   - Title: "CPU Usage by Pod"
   - Visualization: Time series
   
3. **Add Memory Panel**
   - Query: `container_memory_usage_bytes{namespace="taskmanager"} / 1024 / 1024`
   - Title: "Memory Usage (MB)"
   - Visualization: Time series
   
4. **Add Pod Count Panel**
   - Query: `count(kube_pod_info{namespace="taskmanager"})`
   - Title: "Running Pods"
   - Visualization: Stat
   
5. **Save Dashboard**
   - Click Save → Name it "TaskManager Overview"

---

## CI/CD Pipeline (Jenkins)

### Step 1: Deploy Jenkins RBAC

```bash
# Create Jenkins service account and permissions
kubectl apply -f jenkins/jenkins-rbac.yaml

# Verify RBAC
kubectl get serviceaccount -n jenkins
kubectl get clusterrole jenkins
kubectl get clusterrolebinding jenkins
```

### Step 2: Deploy Jenkins

```bash
# Deploy Jenkins
kubectl apply -f jenkins/jenkins-deployment.yaml

# Wait for Jenkins to be ready (may take 2-3 minutes)
kubectl wait --for=condition=ready pod -l app=jenkins -n jenkins --timeout=600s

# Verify Jenkins
kubectl get deployment jenkins -n jenkins
kubectl get pods -n jenkins -l app=jenkins
kubectl get svc jenkins -n jenkins
kubectl get pvc -n jenkins

# Check logs
kubectl logs -n jenkins deployment/jenkins --tail=100 -f
```

### Step 3: Get Jenkins Initial Password

```bash
# Get the Jenkins pod name
export JENKINS_POD=$(kubectl get pods -n jenkins -l app=jenkins -o jsonpath='{.items[0].metadata.name}')

# Get initial admin password
kubectl exec -n jenkins $JENKINS_POD -- cat /var/jenkins_home/secrets/initialAdminPassword

# Or for PowerShell:
# $JENKINS_POD = kubectl get pods -n jenkins -l app=jenkins -o jsonpath='{.items[0].metadata.name}'
# kubectl exec -n jenkins $JENKINS_POD -- cat /var/jenkins_home/secrets/initialAdminPassword
```

### Step 4: Access Jenkins

#### Option A: Using NodePort
```bash
# Get NodePort
kubectl get svc jenkins -n jenkins

# For Minikube
minikube service jenkins -n jenkins --url

# Access the URL shown
```

#### Option B: Using Port Forward
```bash
# Forward Jenkins port
kubectl port-forward -n jenkins svc/jenkins 8080:8080

# Access: http://localhost:8080
```

### Step 5: Initial Jenkins Setup

1. **Unlock Jenkins**
   - Paste the initial admin password from Step 3
   - Click Continue

2. **Install Plugins**
   - Select "Install suggested plugins"
   - Wait for installation to complete

3. **Create Admin User**
   - Username: admin
   - Password: (choose a secure password)
   - Full Name: Admin
   - Email: your-email@example.com
   - Click Save and Continue

4. **Jenkins URL**
   - Keep default or set your custom URL
   - Click Save and Finish
   - Click "Start using Jenkins"

### Step 6: Install Required Plugins

1. **Go to Manage Jenkins → Plugins → Available Plugins**

2. **Search and Install**:
   - Docker Pipeline
   - Kubernetes CLI Plugin
   - Kubernetes Plugin
   - Git Plugin (usually pre-installed)
   - Pipeline Plugin (usually pre-installed)
   - GitHub Integration Plugin

3. **Restart Jenkins**
   ```bash
   kubectl rollout restart deployment/jenkins -n jenkins
   kubectl wait --for=condition=ready pod -l app=jenkins -n jenkins --timeout=300s
   ```

### Step 7: Configure Docker Hub Credentials

1. **Go to**: Manage Jenkins → Credentials → System → Global credentials → Add Credentials

2. **Add Docker Hub Credentials**:
   - Kind: Username with password
   - Scope: Global
   - Username: (your Docker Hub username)
   - Password: (your Docker Hub access token)
   - ID: `dockerhub-credentials`
   - Description: Docker Hub Credentials
   - Click Create

### Step 8: Configure Kubeconfig

1. **Get your kubeconfig**:
   ```bash
   # View current config
   kubectl config view --flatten
   
   # Or get specific context
   kubectl config view --flatten --minify > /tmp/kubeconfig
   ```

2. **Add to Jenkins**:
   - Go to: Manage Jenkins → Credentials → System → Global credentials → Add Credentials
   - Kind: Secret file
   - Scope: Global
   - File: Upload your kubeconfig file
   - ID: `kubeconfig`
   - Description: Kubernetes Config
   - Click Create

### Step 9: Create Pipeline Job

1. **Create New Item**
   - Click "New Item"
   - Name: taskmanager-pipeline
   - Type: Pipeline
   - Click OK

2. **Configure Pipeline**
   - **General**:
     - Description: TaskManager CI/CD Pipeline
   
   - **Build Triggers** (Optional):
     - Check "GitHub hook trigger for GITScm polling" (if using webhooks)
   
   - **Pipeline**:
     - Definition: Pipeline script from SCM
     - SCM: Git
     - Repository URL: (your GitHub repository URL)
     - Credentials: (add GitHub credentials if private repo)
     - Branch: */main (or your branch name)
     - Script Path: Jenkinsfile
   
   - Click Save

### Step 10: Configure GitHub Webhooks (Optional)

1. **Get Jenkins URL**
   ```bash
   # For Minikube
   minikube service jenkins -n jenkins --url
   
   # Or use external URL if available
   kubectl get svc jenkins -n jenkins
   ```

2. **In GitHub Repository**:
   - Go to Settings → Webhooks → Add webhook
   - Payload URL: `http://your-jenkins-url/github-webhook/`
   - Content type: application/json
   - Events: Just the push event
   - Active: ✓
   - Click Add webhook

### Step 11: Run Pipeline Manually

1. **Go to Pipeline Job**
   - Click on "taskmanager-pipeline"

2. **Build Now**
   - Click "Build Now"
   - Wait for build to start

3. **Monitor Build**
   - Click on build number (e.g., #1)
   - Click "Console Output"
   - Watch the build progress

4. **Verify Stages**
   - Checkout
   - Build Backend
   - Build Frontend
   - Test
   - Push Images
   - Deploy to Kubernetes
   - Deploy Monitoring

### Step 12: Verify Pipeline Deployment

```bash
# Check if new images were pushed
docker pull ${DOCKER_USERNAME}/taskmanager-backend:latest
docker pull ${DOCKER_USERNAME}/taskmanager-frontend:latest

# Check Kubernetes deployments
kubectl get deployments -n taskmanager

# Check if pods were updated
kubectl get pods -n taskmanager

# Check rollout status
kubectl rollout status deployment/backend -n taskmanager
kubectl rollout status deployment/frontend -n taskmanager

# View deployment history
kubectl rollout history deployment/backend -n taskmanager
kubectl rollout history deployment/frontend -n taskmanager
```

---

## Verification & Testing

### Complete System Verification

```bash
# 1. Check all namespaces
kubectl get namespaces

# 2. Check all resources in taskmanager namespace
kubectl get all -n taskmanager

# 3. Check monitoring namespace
kubectl get all -n monitoring

# 4. Check Jenkins namespace
kubectl get all -n jenkins

# 5. Check all pods across namespaces
kubectl get pods --all-namespaces

# 6. Check all services
kubectl get svc --all-namespaces

# 7. Check all persistent volumes
kubectl get pvc --all-namespaces
kubectl get pv
```

### Application Testing

```bash
# 1. Test Backend API
# Using port-forward
kubectl port-forward -n taskmanager svc/backend 8888:8888

# In another terminal
curl http://localhost:8888/api/health
curl http://localhost:8888/api/tasks

# 2. Test Frontend
kubectl port-forward -n taskmanager svc/frontend 8080:80

# Open browser: http://localhost:8080

# 3. Test Database Connection
kubectl exec -it -n taskmanager deployment/postgres -- psql -U taskmanager -d taskmanager_db -c "\dt"
```

### Monitoring Verification

```bash
# 1. Access Prometheus
kubectl port-forward -n monitoring svc/prometheus 9090:9090
# Open: http://localhost:9090
# Check Status → Targets

# 2. Access Grafana
kubectl port-forward -n monitoring svc/grafana 3000:3000
# Open: http://localhost:3000
# Login with admin/admin123
# Check dashboards

# 3. Run sample queries in Prometheus
# - up
# - kube_pod_info
# - container_memory_usage_bytes{namespace="taskmanager"}
```

### CI/CD Verification

```bash
# 1. Access Jenkins
kubectl port-forward -n jenkins svc/jenkins 8080:8080
# Open: http://localhost:8080

# 2. Check Pipeline Build
# Go to taskmanager-pipeline
# Check last build status

# 3. Verify automated deployment
kubectl get events -n taskmanager --sort-by='.lastTimestamp'
```

### Performance Testing

```bash
# Install hey (HTTP load generator)
# For Linux/Mac:
go install github.com/rakyll/hey@latest

# For Windows:
# Download from: https://github.com/rakyll/hey/releases

# Run load test
hey -n 1000 -c 10 http://localhost:8080

# Monitor in Grafana while running load test
```

### Health Checks

```bash
# Create a health check script
cat > check-health.sh << 'EOF'
#!/bin/bash

echo "=== Checking TaskManager Health ==="

# Check pods
echo -e "\n1. Pod Status:"
kubectl get pods -n taskmanager

# Check services
echo -e "\n2. Services:"
kubectl get svc -n taskmanager

# Check deployments
echo -e "\n3. Deployments:"
kubectl get deployments -n taskmanager

# Check monitoring
echo -e "\n4. Monitoring Status:"
kubectl get pods -n monitoring

# Check Jenkins
echo -e "\n5. Jenkins Status:"
kubectl get pods -n jenkins

echo -e "\n=== Health Check Complete ==="
EOF

chmod +x check-health.sh
./check-health.sh
```

---

## Troubleshooting

### Common Issues and Solutions

#### 1. Pods Not Starting

```bash
# Check pod status
kubectl get pods -n taskmanager

# Describe problematic pod
kubectl describe pod <pod-name> -n taskmanager

# Check logs
kubectl logs <pod-name> -n taskmanager

# Check events
kubectl get events -n taskmanager --sort-by='.lastTimestamp'

# Common fixes:
# - Image pull errors: Check image name and Docker Hub credentials
# - Resource constraints: Check available cluster resources
# - PVC binding: Check if PVC is bound to PV
```

#### 2. Database Connection Issues

```bash
# Check PostgreSQL pod
kubectl get pods -n taskmanager -l app=postgres

# Check PostgreSQL logs
kubectl logs -n taskmanager deployment/postgres

# Verify service
kubectl get svc postgres -n taskmanager

# Test connection from backend pod
kubectl exec -it -n taskmanager deployment/backend -- sh
# Inside pod:
# apk add postgresql-client (if not installed)
# psql -h postgres -U taskmanager -d taskmanager_db

# Check secrets
kubectl get secret -n taskmanager
kubectl describe secret postgres-secret -n taskmanager
kubectl describe secret backend-secret -n taskmanager
```

#### 3. Image Pull Errors

```bash
# Check exact error
kubectl describe pod <pod-name> -n taskmanager

# Verify image exists
docker pull saikiranasamwar4/taskmanager-backend:latest

# Check image name in deployment
kubectl get deployment backend -n taskmanager -o yaml | grep image

# Update image if needed
kubectl set image deployment/backend backend=saikiranasamwar4/taskmanager-backend:latest -n taskmanager

# Create Docker registry secret (if using private repo)
kubectl create secret docker-registry dockerhub-secret \
  --docker-server=https://index.docker.io/v1/ \
  --docker-username=<your-username> \
  --docker-password=<your-token> \
  --docker-email=<your-email> \
  -n taskmanager

# Update deployment to use secret
kubectl patch deployment backend -n taskmanager -p '{"spec":{"template":{"spec":{"imagePullSecrets":[{"name":"dockerhub-secret"}]}}}}'
```

#### 4. Service Not Accessible

```bash
# Check service
kubectl get svc -n taskmanager

# Describe service
kubectl describe svc frontend -n taskmanager

# Check endpoints
kubectl get endpoints -n taskmanager

# Test internal connectivity
kubectl run test-pod --image=busybox --rm -it --restart=Never -- wget -O- http://backend.taskmanager.svc.cluster.local:8888

# Check ingress (if using)
kubectl get ingress -n taskmanager
kubectl describe ingress taskmanager-ingress -n taskmanager
```

#### 5. Persistent Volume Issues

```bash
# Check PVC status
kubectl get pvc -n taskmanager

# Describe PVC
kubectl describe pvc postgres-pvc -n taskmanager

# Check PV
kubectl get pv

# If PVC is pending, check StorageClass
kubectl get storageclass

# For Minikube, enable default storage
minikube addons enable storage-provisioner
```

#### 6. Monitoring Not Working

```bash
# Check Prometheus targets
kubectl port-forward -n monitoring svc/prometheus 9090:9090
# Go to: http://localhost:9090/targets

# Check Prometheus config
kubectl get configmap prometheus-config -n monitoring -o yaml

# Reload Prometheus config
kubectl delete pod -n monitoring -l app=prometheus

# Check Grafana datasource
kubectl exec -it -n monitoring deployment/grafana -- cat /etc/grafana/provisioning/datasources/datasources.yaml

# Check Grafana logs
kubectl logs -n monitoring deployment/grafana
```

#### 7. Jenkins Build Failures

```bash
# Check Jenkins logs
kubectl logs -n jenkins deployment/jenkins

# Check Jenkins pod resources
kubectl describe pod -n jenkins -l app=jenkins

# Increase Jenkins resources if needed
kubectl edit deployment jenkins -n jenkins
# Increase memory and CPU limits

# Check Docker access in Jenkins
kubectl exec -it -n jenkins deployment/jenkins -- docker ps

# Check kubectl access
kubectl exec -it -n jenkins deployment/jenkins -- kubectl get nodes
```

#### 8. Resource Constraints

```bash
# Check node resources
kubectl top nodes

# Check pod resources
kubectl top pods -n taskmanager
kubectl top pods -n monitoring
kubectl top pods -n jenkins

# Check resource requests and limits
kubectl describe deployment backend -n taskmanager

# Adjust resources if needed
kubectl edit deployment backend -n taskmanager
```

#### 9. Networking Issues

```bash
# Check network policies
kubectl get networkpolicies -n taskmanager

# Test pod-to-pod communication
kubectl run test --image=busybox --rm -it --restart=Never -- sh
# Inside pod:
# nslookup backend.taskmanager.svc.cluster.local
# wget -O- http://backend.taskmanager.svc.cluster.local:8888

# Check DNS
kubectl run -it --rm debug --image=busybox --restart=Never -- nslookup kubernetes.default

# Check kube-dns/CoreDNS
kubectl get pods -n kube-system -l k8s-app=kube-dns
```

#### 10. Application Errors

```bash
# Check application logs
kubectl logs -n taskmanager deployment/backend --tail=100 -f
kubectl logs -n taskmanager deployment/frontend --tail=100 -f

# Check previous logs (if pod restarted)
kubectl logs -n taskmanager deployment/backend --previous

# Get logs from all pods
kubectl logs -n taskmanager -l app=backend --all-containers=true

# Debug inside pod
kubectl exec -it -n taskmanager deployment/backend -- sh
# Check environment variables
# env | grep DATABASE
# Check files
# ls -la /app
```

### Quick Debug Commands

```bash
# Get everything in namespace
kubectl get all -n taskmanager

# Describe all pods
kubectl describe pods -n taskmanager

# Get events
kubectl get events -n taskmanager --sort-by='.lastTimestamp'

# Check logs for all pods
for pod in $(kubectl get pods -n taskmanager -o name); do
  echo "=== $pod ==="
  kubectl logs -n taskmanager $pod --tail=20
done

# Force delete stuck pod
kubectl delete pod <pod-name> -n taskmanager --force --grace-period=0

# Restart deployment
kubectl rollout restart deployment/backend -n taskmanager

# Scale deployment
kubectl scale deployment backend --replicas=3 -n taskmanager

# Check cluster info
kubectl cluster-info
kubectl cluster-info dump
```

---

## Cleanup

### Remove Application

```bash
# Delete TaskManager application
kubectl delete namespace taskmanager

# Verify deletion
kubectl get all -n taskmanager
```

### Remove Monitoring

```bash
# Delete monitoring stack
kubectl delete namespace monitoring

# Verify deletion
kubectl get all -n monitoring
```

### Remove Jenkins

```bash
# Delete Jenkins
kubectl delete namespace jenkins

# Verify deletion
kubectl get all -n jenkins
```

### Remove Ingress Controller (Optional)

```bash
# Delete nginx ingress controller
kubectl delete -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml
```

### Clean Docker Images

```bash
# Remove local images
docker rmi saikiranasamwar4/taskmanager-backend:latest
docker rmi saikiranasamwar4/taskmanager-frontend:latest

# Clean up unused images
docker image prune -a

# Clean up everything
docker system prune -a --volumes
```

### Stop Kubernetes Cluster

```bash
# For Minikube
minikube stop
minikube delete

# For Kind
kind delete cluster --name taskmanager
```

### Complete Cleanup

```bash
# Delete all namespaces
kubectl delete namespace taskmanager monitoring jenkins

# Clean Docker
docker system prune -a --volumes -f

# Stop cluster
minikube delete
# or
kind delete cluster --name taskmanager
```

---

## Summary of URLs

| Service | Local (Port Forward) | Minikube | Description |
|---------|---------------------|----------|-------------|
| Frontend | http://localhost:8080 | `minikube service frontend -n taskmanager --url` | Web Application |
| Backend API | http://localhost:8888 | `minikube service backend -n taskmanager --url` | REST API |
| Prometheus | http://localhost:9090 | `minikube service prometheus -n monitoring --url` | Metrics Database |
| Grafana | http://localhost:3000 | `minikube service grafana -n monitoring --url` | Dashboards (admin/admin123) |
| Jenkins | http://localhost:8080 | `minikube service jenkins -n jenkins --url` | CI/CD Pipeline |

---

## Additional Resources

### Useful Commands Reference

```bash
# Context switching
kubectl config get-contexts
kubectl config use-context <context-name>

# Resource usage
kubectl top nodes
kubectl top pods -n taskmanager

# Port forwarding multiple services
kubectl port-forward -n taskmanager svc/frontend 8080:80 &
kubectl port-forward -n taskmanager svc/backend 8888:8888 &
kubectl port-forward -n monitoring svc/prometheus 9090:9090 &
kubectl port-forward -n monitoring svc/grafana 3000:3000 &

# Export resources
kubectl get deployment backend -n taskmanager -o yaml > backend-backup.yaml

# Apply from directory
kubectl apply -f k8s/
kubectl apply -f monitoring/
kubectl apply -f jenkins/

# Watch resources
kubectl get pods -n taskmanager -w

# Stream logs
kubectl logs -n taskmanager deployment/backend -f --tail=100
```

### Next Steps

1. **Setup SSL/TLS**: Configure HTTPS with cert-manager
2. **Add Monitoring Alerts**: Configure Alertmanager
3. **Setup Log Aggregation**: Deploy EFK/ELK stack
4. **Implement Auto-scaling**: Configure HPA
5. **Add Service Mesh**: Implement Istio or Linkerd
6. **Improve Security**: Add Network Policies, Pod Security Policies
7. **Backup Strategy**: Implement Velero for backups
8. **Cost Optimization**: Setup resource quotas and limits

---

**Deployment Guide Version**: 1.0  
**Last Updated**: December 28, 2025  
**Maintainer**: TaskManager DevOps Team
