from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, String
from datetime import datetime
from app.models.base import Base

class Vital(Base):
    """Vital Signs Model - Data Access Layer"""
    __tablename__ = 'vitals'
    
    id = Column(Integer, primary_key=True)
    patient_id = Column(Integer, ForeignKey('patients.id'), nullable=False)
    
    # Vital signs measurements
    blood_pressure_systolic = Column(Integer)  # mmHg
    blood_pressure_diastolic = Column(Integer)  # mmHg
    heart_rate = Column(Integer)  # bpm
    temperature = Column(Float)  # Celsius
    respiratory_rate = Column(Integer)  # breaths per minute
    oxygen_saturation = Column(Float)  # %
    
    notes = Column(String(500))
    recorded_at = Column(DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'blood_pressure_systolic': self.blood_pressure_systolic,
            'blood_pressure_diastolic': self.blood_pressure_diastolic,
            'heart_rate': self.heart_rate,
            'temperature': self.temperature,
            'respiratory_rate': self.respiratory_rate,
            'oxygen_saturation': self.oxygen_saturation,
            'notes': self.notes,
            'recorded_at': self.recorded_at.isoformat() if self.recorded_at else None
        }
