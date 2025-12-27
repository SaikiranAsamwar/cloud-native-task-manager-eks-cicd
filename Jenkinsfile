pipeline {
    agent any
    
    environment {
        DOCKER_REGISTRY = 'saikiranasamwar4'
        BACKEND_IMAGE = "${DOCKER_REGISTRY}/taskmanager-backend"
        FRONTEND_IMAGE = "${DOCKER_REGISTRY}/taskmanager-frontend"
        DOCKER_CREDENTIALS = credentials('dockerhub-credentials')
        KUBECONFIG = credentials('kubeconfig')
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Build Backend') {
            steps {
                script {
                    dir('backend') {
                        sh 'docker build -t ${BACKEND_IMAGE}:${BUILD_NUMBER} .'
                        sh 'docker tag ${BACKEND_IMAGE}:${BUILD_NUMBER} ${BACKEND_IMAGE}:latest'
                    }
                }
            }
        }
        
        stage('Build Frontend') {
            steps {
                script {
                    dir('frontend') {
                        sh 'docker build -t ${FRONTEND_IMAGE}:${BUILD_NUMBER} .'
                        sh 'docker tag ${FRONTEND_IMAGE}:${BUILD_NUMBER} ${FRONTEND_IMAGE}:latest'
                    }
                }
            }
        }
        
        stage('Test') {
            steps {
                script {
                    sh 'docker-compose up -d'
                    sh 'sleep 30'
                    sh 'curl -f http://localhost:80 || exit 1'
                    sh 'docker-compose down'
                }
            }
        }
        
        stage('Push Images') {
            steps {
                script {
                    sh 'echo $DOCKER_CREDENTIALS_PSW | docker login -u $DOCKER_CREDENTIALS_USR --password-stdin'
                    sh 'docker push ${BACKEND_IMAGE}:${BUILD_NUMBER}'
                    sh 'docker push ${BACKEND_IMAGE}:latest'
                    sh 'docker push ${FRONTEND_IMAGE}:${BUILD_NUMBER}'
                    sh 'docker push ${FRONTEND_IMAGE}:latest'
                }
            }
        }
        
        stage('Deploy to Kubernetes') {
            steps {
                script {
                    sh '''
                        kubectl apply -f k8s/namespace.yaml
                        kubectl apply -f k8s/secrets.yaml
                        kubectl apply -f k8s/postgres-pvc.yaml
                        kubectl apply -f k8s/postgres-deployment.yaml
                        kubectl apply -f k8s/backend-deployment.yaml
                        kubectl apply -f k8s/frontend-deployment.yaml
                        kubectl apply -f k8s/ingress.yaml
                        kubectl rollout status deployment/backend -n taskmanager
                        kubectl rollout status deployment/frontend -n taskmanager
                    '''
                }
            }
        }
        
        stage('Deploy Monitoring') {
            steps {
                script {
                    sh '''
                        kubectl apply -f monitoring/prometheus-rbac.yaml
                        kubectl apply -f monitoring/prometheus-config.yaml
                        kubectl apply -f monitoring/prometheus-deployment.yaml
                        kubectl apply -f monitoring/grafana-datasource.yaml
                        kubectl apply -f monitoring/grafana-dashboard-config.yaml
                        kubectl apply -f monitoring/grafana-deployment.yaml
                    '''
                }
            }
        }
    }
    
    post {
        always {
            sh 'docker logout'
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
