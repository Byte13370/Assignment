"""Database configuration and session management"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session
from config import Config
from app.models.base import Base

# Create engine
engine = create_engine(Config.SQLALCHEMY_DATABASE_URI, echo=False)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_session():
    """Get a new database session"""
    return SessionLocal()

def init_db():
    """Initialize database - create all tables"""
    Base.metadata.create_all(bind=engine)
