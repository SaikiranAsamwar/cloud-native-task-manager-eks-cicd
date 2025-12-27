# Monitoring Setup Guide

## Components
- **Prometheus**: Metrics collection and storage
- **Grafana**: Metrics visualization and dashboards

## Deployment Steps

### 1. Create Monitoring Namespace
```bash
kubectl apply -f prometheus-deployment.yaml
```

### 2. Setup Prometheus RBAC
```bash
kubectl apply -f prometheus-rbac.yaml
```

### 3. Deploy Prometheus Configuration
```bash
kubectl apply -f prometheus-config.yaml
```

### 4. Deploy Grafana
```bash
kubectl apply -f grafana-datasource.yaml
kubectl apply -f grafana-dashboard-config.yaml
kubectl apply -f grafana-deployment.yaml
```

## Access Services

### Prometheus
```bash
# Get NodePort
kubectl get svc prometheus -n monitoring

# Or use port-forward
kubectl port-forward -n monitoring svc/prometheus 9090:9090
```
Access at: http://localhost:9090

### Grafana
```bash
# Get NodePort
kubectl get svc grafana -n monitoring

# Or use port-forward
kubectl port-forward -n monitoring svc/grafana 3000:3000
```
Access at: http://localhost:3000
- **Username**: admin
- **Password**: admin123

## Configure Grafana

1. Login to Grafana
2. Prometheus datasource should be auto-configured
3. Import dashboards or create custom ones
4. Monitor your TaskManager application metrics

## Useful Queries

### Prometheus Queries
```promql
# CPU Usage
rate(container_cpu_usage_seconds_total{namespace="taskmanager"}[5m])

# Memory Usage
container_memory_usage_bytes{namespace="taskmanager"}

# HTTP Request Rate
rate(http_requests_total[5m])

# Pod Status
kube_pod_status_phase{namespace="taskmanager"}
```

## Cleanup
```bash
kubectl delete namespace monitoring
```
