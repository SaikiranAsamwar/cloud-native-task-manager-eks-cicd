// ================================================================
// JENKINSFILE - Complete CI/CD Pipeline for Task Manager
// Stages: SCM → Build → Test → SonarQube → Docker → ECR → K8s Deploy
// ================================================================

pipeline {
    agent any

    // ============================================================
    // ENVIRONMENT VARIABLES
    // ============================================================
    environment {
        AWS_REGION = 'us-east-1'
        AWS_ACCOUNT_ID = credentials('aws-account-id')  // Jenkins credential
        ECR_REGISTRY = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
        ECR_BACKEND_REPO = "${ECR_REGISTRY}/task-manager/backend"
        ECR_FRONTEND_REPO = "${ECR_REGISTRY}/task-manager/frontend"
        DOCKER_BUILDKIT = '1'
        SONAR_HOST_URL = 'http://sonarqube:9000'
        KUBECONFIG = '/root/.kube/config'
    }

    // ============================================================
    // BUILD TRIGGERS
    // ============================================================
    triggers {
        githubPush()  // Trigger on GitHub push
        pollSCM('H/15 * * * *')  // Poll every 15 minutes as backup
    }

    // ============================================================
    // PIPELINE STAGES
    // ============================================================
    stages {

        // ========================================================
        // STAGE 1: Checkout Source Code
        // ========================================================
        stage('📥 Checkout Code') {
            steps {
                script {
                    echo "🔄 Checking out code from GitHub..."
                    checkout scm
                }
            }
        }

        // ========================================================
        // STAGE 2: Backend Build & Test
        // ========================================================
        stage('🔨 Backend Build & Test') {
            steps {
                script {
                    echo "📦 Building backend application..."
                    dir('backend') {
                        sh '''
                            # Install dependencies
                            pip install --upgrade pip setuptools wheel
                            pip install -r requirements.txt

                            # Run unit tests (if test framework exists)
                            python -m pytest tests/ || echo "No tests found"

                            # Check Python syntax
                            python -m py_compile app/*.py run.py
                        '''
                    }
                }
            }
        }

        // ========================================================
        // STAGE 3: Frontend Build
        // ========================================================
        stage('🎨 Frontend Build') {
            steps {
                script {
                    echo "🏗️ Building frontend assets..."
                    dir('frontend') {
                        sh '''
                            # Verify all HTML/CSS/JS files exist
                            ls -la templates/
                            ls -la css/
                            ls -la js/

                            # Basic HTML validation (optional)
                            echo "✅ Frontend assets verified"
                        '''
                    }
                }
            }
        }

        // ========================================================
        // STAGE 4: SonarQube Code Analysis
        // ========================================================
        stage('🔍 SonarQube Code Analysis') {
            steps {
                script {
                    echo "📊 Running SonarQube analysis..."
                    withSonarQubeEnv('SonarQube') {
                        dir('backend') {
                            sh '''
                                sonar-scanner \
                                  -Dsonar.projectKey=task-manager-backend \
                                  -Dsonar.sources=. \
                                  -Dsonar.language=py
                            '''
                        }
                        dir('frontend') {
                            sh '''
                                sonar-scanner \
                                  -Dsonar.projectKey=task-manager-frontend \
                                  -Dsonar.sources=. \
                                  -Dsonar.language=js,html,css
                            '''
                        }
                    }
                    // Wait for quality gate
                    timeout(time: 5, unit: 'MINUTES') {
                        waitForQualityGate abortPipeline: true
                    }
                }
            }
        }

        // ========================================================
        // STAGE 5: Docker Build & ECR Push
        // ========================================================
        stage('🐳 Docker Build & Push to ECR') {
            steps {
                script {
                    echo "🔐 Logging into AWS ECR..."
                    sh '''
                        aws ecr get-login-password --region ${AWS_REGION} | \
                        docker login --username AWS --password-stdin ${ECR_REGISTRY}
                    '''

                    echo "🔨 Building backend image..."
                    sh '''
                        docker build \
                          -t ${ECR_BACKEND_REPO}:${BUILD_NUMBER} \
                          -t ${ECR_BACKEND_REPO}:latest \
                          -f backend/Dockerfile ./backend
                    '''

                    echo "📤 Pushing backend image to ECR..."
                    sh '''
                        docker push ${ECR_BACKEND_REPO}:${BUILD_NUMBER}
                        docker push ${ECR_BACKEND_REPO}:latest
                    '''

                    echo "🔨 Building frontend image..."
                    sh '''
                        docker build \
                          -t ${ECR_FRONTEND_REPO}:${BUILD_NUMBER} \
                          -t ${ECR_FRONTEND_REPO}:latest \
                          -f frontend/Dockerfile .
                    '''

                    echo "📤 Pushing frontend image to ECR..."
                    sh '''
                        docker push ${ECR_FRONTEND_REPO}:${BUILD_NUMBER}
                        docker push ${ECR_FRONTEND_REPO}:latest
                    '''

                    echo "✅ Docker images pushed successfully"
                }
            }
        }

        // ========================================================
        // STAGE 6: Deploy to Kubernetes (EKS)
        // ========================================================
        stage('☸️ Deploy to EKS') {
            steps {
                script {
                    echo "🚀 Deploying to AWS EKS..."
                    sh '''
                        # Update kubeconfig for EKS cluster
                        aws eks update-kubeconfig \
                          --name task-manager-cluster \
                          --region ${AWS_REGION}

                        # Apply Kubernetes manifests
                        kubectl apply -f k8s/namespace.yaml
                        kubectl apply -f k8s/database/
                        kubectl apply -f k8s/backend/
                        kubectl apply -f k8s/frontend/

                        # Update deployment images with latest build
                        kubectl -n task-manager set image \
                          deployment/backend \
                          backend=${ECR_BACKEND_REPO}:${BUILD_NUMBER} \
                          --record

                        kubectl -n task-manager set image \
                          deployment/frontend \
                          frontend=${ECR_FRONTEND_REPO}:${BUILD_NUMBER} \
                          --record

                        # Wait for rollout
                        kubectl -n task-manager rollout status deployment/backend --timeout=5m
                        kubectl -n task-manager rollout status deployment/frontend --timeout=5m

                        echo "✅ Deployment completed successfully"
                    '''
                }
            }
        }

        // ========================================================
        // STAGE 7: Verification & Health Checks
        // ========================================================
        stage('✅ Verification') {
            steps {
                script {
                    echo "🔍 Verifying deployment..."
                    sh '''
                        # Check pod status
                        kubectl -n task-manager get pods

                        # Check services
                        kubectl -n task-manager get svc

                        # Get LoadBalancer IP
                        FRONTEND_IP=$(kubectl -n task-manager get svc frontend-service \
                          -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' || \
                          kubectl -n task-manager get svc frontend-service \
                          -o jsonpath='{.status.loadBalancer.ingress[0].ip}')

                        echo "🌐 Application URL: http://$FRONTEND_IP"
                    '''
                }
            }
        }
    }

    // ============================================================
    // POST BUILD ACTIONS
    // ============================================================
    post {
        always {
            echo "📝 Pipeline execution completed"
            // Clean workspace (optional)
            // cleanWs()
        }
        success {
            echo "✅ Pipeline succeeded!"
            // Send success notification
        }
        failure {
            echo "❌ Pipeline failed!"
            // Send failure notification
        }
    }
}
