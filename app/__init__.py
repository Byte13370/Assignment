from flask import Flask
from flask_cors import CORS
from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker
from config import Config

# Global database session
db_session = None

def create_app(config_class=Config):
    """Flask Application Factory"""
    app = Flask(__name__, static_folder='../static')
    app.config.from_object(config_class)
    
    # Enable CORS
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    # Initialize database
    global db_session
    engine = create_engine(app.config['SQLALCHEMY_DATABASE_URI'])
    db_session = scoped_session(sessionmaker(bind=engine))
    
    # Import and create tables
    from app.models import user, patient, vital
    from app.models.base import Base
    Base.metadata.create_all(bind=engine)
    
    # Register blueprints
    from app.api.auth import auth_bp
    from app.api.patients import patients_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api')
    app.register_blueprint(patients_bp, url_prefix='/api')
    
    # Cleanup database session
    @app.teardown_appcontext
    def shutdown_session(exception=None):
        db_session.remove()
    
    return app
