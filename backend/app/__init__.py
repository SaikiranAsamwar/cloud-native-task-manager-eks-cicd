import sys
# Python 3.13 compatibility fix for SQLAlchemy
if sys.version_info >= (3, 13):
    import typing
    if not hasattr(typing, 'TypingOnly'):
        # Create a dummy TypingOnly for compatibility
        class TypingOnly:
            pass
        typing.TypingOnly = TypingOnly

from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import os

db = SQLAlchemy()

def create_app():
    """Application factory function"""
    # Set paths for separated frontend directory
    base_dir = os.path.abspath(os.path.dirname(__file__))
    frontend_dir = os.path.abspath(os.path.join(base_dir, '../../frontend'))
    template_dir = os.path.join(frontend_dir, 'templates')
    
    app = Flask(__name__, 
                template_folder=template_dir,
                static_folder=frontend_dir,
                static_url_path='/static')
    
    # Configure the app
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get(
        'DATABASE_URL',
        'sqlite:///app.db'
    )
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JSON_SORT_KEYS'] = False
    
    # Initialize extensions
    db.init_app(app)
    CORS(app)
    
    # Register blueprints
    from app.routes import main_bp, api_bp
    app.register_blueprint(main_bp)
    app.register_blueprint(api_bp, url_prefix='/api')
    
    # Create database tables
    with app.app_context():
        db.create_all()
    
    return app
