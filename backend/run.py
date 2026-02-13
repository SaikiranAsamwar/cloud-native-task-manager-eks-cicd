"""
Main entry point for the Flask application
Run: python run.py
"""
from app import create_app, db
import os

app = create_app()

# Initialize database tables
with app.app_context():
     

if __name__ == '__main__':
    # Development server - use debug mode only in development
    debug_mode = os.environ.get('FLASK_ENV') != 'production'
    # Using port 8888 to avoid conflicts with DevOps tools
    # (Jenkins:8080, Prometheus:9090, Grafana:3000, Flask:5000, etc.)
    app.run(
        host='0.0.0.0',
        port=8888,
        debug=debug_mode
    )
from app import create_app, db

app = create_app()

with app.app_context():
    db.create_all()
