from sqlalchemy import Column, Integer, String, DateTime, Float, Text
from datetime import datetime
from app.models.base import Base

class Patient(Base):
    """Patient Model - Data Access Layer"""
    __tablename__ = 'patients'
    
    id = Column(Integer, primary_key=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    date_of_birth = Column(String(10), nullable=False)  # YYYY-MM-DD format
    gender = Column(String(10), nullable=False)
    phone = Column(String(20))
    email = Column(String(120))
    address = Column(Text)
    medical_history = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            'id': self.id,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'date_of_birth': self.date_of_birth,
            'gender': self.gender,
            'phone': self.phone,
            'email': self.email,
            'address': self.address,
            'medical_history': self.medical_history,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
