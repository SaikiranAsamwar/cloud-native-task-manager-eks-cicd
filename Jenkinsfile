pipeline {
    agent any
    
    environment {
        DOCKER_REGISTRY = 'saikiranasamwar4'
        BACKEND_IMAGE = "${DOCKER_REGISTRY}/taskmanager-backend"
        FRONTEND_IMAGE = "${DOCKER_REGISTRY}/taskmanager-frontend"
    }
    
    stages {
        
        // ============================================
        // STAGE 1: GIT CHECKOUT
        // ============================================
        stage('Git Checkout') {
            steps {
                echo 'Checking out source code from Git...'
                checkout scm
            }
        }
        
        // ============================================
        // STAGE 2: SONARQUBE ANALYSIS
        // ============================================
        stage('SonarQube Analysis') {
            steps {
                withCredentials([string(credentialsId: 'sonarqube-token', variable: 'SONAR_TOKEN')]) {
                withSonarQubeEnv('SonarQube') {
                sh '''
                /usr/bin/sonar-scanner \
                -Dsonar.projectKey=taskmanager-project \
                -Dsonar.sources=. \
                -Dsonar.host.url=http://localhost:9000 \
                -Dsonar.login=$SONAR_TOKEN
                '''
            }
        }
    }
}

        
        // ============================================
        // STAGE 3: DOCKER BUILD BACKEND
        // ============================================
        stage('Docker Build - Backend') {
            steps {
                dir('backend') {
                    sh '''
                        docker build -t saikiranasamwar4/taskmanager-backend:v1.0 .
                        docker tag saikiranasamwar4/taskmanager-backend:v1.0 saikiranasamwar4/taskmanager-backend:${BUILD_NUMBER}
                        docker tag saikiranasamwar4/taskmanager-backend:v1.0 saikiranasamwar4/taskmanager-backend:latest
                    '''
                }
            }
        }
        
        // ============================================
        // STAGE 4: DOCKER BUILD FRONTEND
        // ============================================
        stage('Docker Build - Frontend') {
            steps {
                dir('frontend') {
                    sh '''
                        docker build -t saikiranasamwar4/taskmanager-frontend:v1.0 .
                        docker tag saikiranasamwar4/taskmanager-frontend:v1.0 saikiranasamwar4/taskmanager-frontend:${BUILD_NUMBER}
                        docker tag saikiranasamwar4/taskmanager-frontend:v1.0 saikiranasamwar4/taskmanager-frontend:latest
                    '''
                }
            }
        }
        
        // ============================================
        // STAGE 5: DOCKER TEST
        // ============================================
        stage('Docker Test') {
            steps {
                sh '''
                    docker compose up -d
                    sleep 30
                    curl -f http://localhost:80 || exit 1
                    curl -f http://localhost:8888 || exit 1
                    docker compose down
                '''
            }
        }
        
        // ============================================
        // STAGE 6: DOCKER PUSH
        // ============================================
        stage('Docker Push to DockerHub') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', passwordVariable: 'DOCKER_PASS', usernameVariable: 'DOCKER_USER')]) {
                    sh '''
                        echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
                        
                        docker push saikiranasamwar4/taskmanager-backend:v1.0
                        docker push saikiranasamwar4/taskmanager-backend:${BUILD_NUMBER}
                        docker push saikiranasamwar4/taskmanager-backend:latest
                        
                        docker push saikiranasamwar4/taskmanager-frontend:v1.0
                        docker push saikiranasamwar4/taskmanager-frontend:${BUILD_NUMBER}
                        docker push saikiranasamwar4/taskmanager-frontend:latest
                    '''
                }
            }
        }
    }
    
    post {
        always {
            sh 'docker logout || true'
            cleanWs()
        }
        success {
            echo 'CI Pipeline Completed Successfully!'
        }
        failure {
            echo 'Pipeline Failed! Check logs.'
        }
    }
}
