# Jenkins CI/CD Setup Guide

## Prerequisites
- Kubernetes cluster
- Docker Hub account
- GitHub repository

## Deployment Steps

### 1. Deploy Jenkins
```bash
kubectl apply -f jenkins-rbac.yaml
kubectl apply -f jenkins-deployment.yaml
```

### 2. Get Initial Admin Password
```bash
kubectl exec -n jenkins $(kubectl get pods -n jenkins -l app=jenkins -o jsonpath='{.items[0].metadata.name}') -- cat /var/jenkins_home/secrets/initialAdminPassword
```

### 3. Access Jenkins
```bash
# Get NodePort
kubectl get svc jenkins -n jenkins

# Or use port-forward
kubectl port-forward -n jenkins svc/jenkins 8080:8080
```
Access at: http://localhost:8080

## Jenkins Configuration

### 1. Install Required Plugins
- Docker Pipeline
- Kubernetes CLI
- GitHub Integration
- Pipeline

### 2. Add Credentials

#### Docker Hub Credentials
1. Manage Jenkins → Credentials → Global → Add Credentials
2. Type: Username with password
3. ID: `dockerhub-credentials`
4. Username: Your Docker Hub username
5. Password: Your Docker Hub token

#### Kubeconfig
1. Manage Jenkins → Credentials → Global → Add Credentials
2. Type: Secret file
3. ID: `kubeconfig`
4. File: Upload your kubeconfig file

### 3. Create Pipeline Job
1. New Item → Pipeline
2. Configure GitHub repository
3. Pipeline script from SCM
4. SCM: Git
5. Repository URL: Your GitHub repo
6. Script Path: `Jenkinsfile`

### 4. Configure Webhooks (Optional)
1. GitHub repo → Settings → Webhooks
2. Add webhook
3. Payload URL: `http://your-jenkins-url/github-webhook/`
4. Content type: application/json
5. Events: Push events

## Pipeline Stages

The Jenkinsfile includes:
1. **Checkout**: Clone repository
2. **Build Backend**: Build backend Docker image
3. **Build Frontend**: Build frontend Docker image
4. **Test**: Run basic smoke tests
5. **Push Images**: Push to Docker Hub
6. **Deploy to Kubernetes**: Deploy to k8s cluster
7. **Deploy Monitoring**: Deploy Prometheus & Grafana

## Manual Pipeline Trigger
```bash
# From Jenkins UI, click "Build Now"
```

## View Build Logs
```bash
kubectl logs -n jenkins $(kubectl get pods -n jenkins -l app=jenkins -o jsonpath='{.items[0].metadata.name}')
```

## Cleanup
```bash
kubectl delete namespace jenkins
```
