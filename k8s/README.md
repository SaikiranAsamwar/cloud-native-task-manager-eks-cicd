# Kubernetes Deployment Guide

## Prerequisites
- Kubernetes cluster (minikube, kind, or cloud provider)
- kubectl configured
- Docker images built and pushed to registry

## Deployment Steps

### 1. Create Namespace
```bash
kubectl apply -f namespace.yaml
```

### 2. Create Secrets
```bash
kubectl apply -f secrets.yaml
```

### 3. Deploy PostgreSQL
```bash
kubectl apply -f postgres-pvc.yaml
kubectl apply -f postgres-deployment.yaml
```

### 4. Deploy Backend
```bash
kubectl apply -f backend-deployment.yaml
```

### 5. Deploy Frontend
```bash
kubectl apply -f frontend-deployment.yaml
```

### 6. Setup Ingress (Optional)
```bash
# Install nginx ingress controller first
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml

# Apply ingress
kubectl apply -f ingress.yaml
```

## Verify Deployment
```bash
kubectl get all -n taskmanager
kubectl get pvc -n taskmanager
kubectl logs -n taskmanager deployment/backend
kubectl logs -n taskmanager deployment/frontend
```

## Access Application
```bash
# If using LoadBalancer
kubectl get svc frontend -n taskmanager

# If using port-forward
kubectl port-forward -n taskmanager svc/frontend 8080:80
```

## Update Images
```bash
kubectl set image deployment/backend backend=saikiranasamwar4/taskmanager-backend:new-tag -n taskmanager
kubectl set image deployment/frontend frontend=saikiranasamwar4/taskmanager-frontend:new-tag -n taskmanager
```

## Cleanup
```bash
kubectl delete namespace taskmanager
```
