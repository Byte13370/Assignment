from datetime import datetime
from app.models.vital import Vital
from app.models.patient import Patient
from app import db_session
from app.services.validators import Validator

class VitalService:
    """Vital Signs Service - Business Logic Layer"""
    
    @staticmethod
    def add_vital_signs(patient_id, vital_data):
        """
        Add vital signs for a patient
        Returns: (success: bool, vital_dict or error_message: str)
        """
        try:
            # Verify patient exists
            patient = db_session.query(Patient).filter_by(id=patient_id).first()
            if not patient:
                return False, "Patient not found"
            
            # Validate vital signs data
            is_valid, errors = Validator.validate_vital_data(vital_data)
            if not is_valid:
                return False, errors
            
            # Sanitize notes field
            notes = vital_data.get('notes')
            if notes:
                notes = Validator.sanitize_text(notes)
            
            # Create vital record
            vital = Vital(
                patient_id=patient_id,
                blood_pressure_systolic=vital_data.get('blood_pressure_systolic'),
                blood_pressure_diastolic=vital_data.get('blood_pressure_diastolic'),
                heart_rate=vital_data.get('heart_rate'),
                temperature=vital_data.get('temperature'),
                respiratory_rate=vital_data.get('respiratory_rate'),
                oxygen_saturation=vital_data.get('oxygen_saturation'),
                notes=notes
            )
            
            db_session.add(vital)
            db_session.commit()
            
            return True, vital.to_dict()
        except Exception as e:
            db_session.rollback()
            return False, f"Error adding vital signs: {str(e)}"
    
    @staticmethod
    def get_patient_vitals(patient_id):
        """
        Get all vital signs for a patient
        Returns: (success: bool, list of vital_dicts or error_message: str)
        """
        try:
            # Verify patient exists
            patient = db_session.query(Patient).filter_by(id=patient_id).first()
            if not patient:
                return False, "Patient not found"
            
            vitals = db_session.query(Vital).filter_by(
                patient_id=patient_id
            ).order_by(Vital.recorded_at.desc()).all()
            
            return True, [vital.to_dict() for vital in vitals]
        except Exception as e:
            return False, f"Error fetching vital signs: {str(e)}"
    
    @staticmethod
    def get_latest_vitals(patient_id):
        """
        Get the most recent vital signs for a patient
        Returns: (success: bool, vital_dict or error_message: str)
        """
        try:
            vital = db_session.query(Vital).filter_by(
                patient_id=patient_id
            ).order_by(Vital.recorded_at.desc()).first()
            
            if not vital:
                return False, "No vital signs recorded"
            
            return True, vital.to_dict()
        except Exception as e:
            return False, f"Error fetching latest vitals: {str(e)}"
    
    @staticmethod
    def get_vital_statistics(patient_id):
        """
        Calculate statistics for patient vital signs
        Returns: (success: bool, stats_dict or error_message: str)
        """
        try:
            vitals = db_session.query(Vital).filter_by(patient_id=patient_id).all()
            
            if not vitals:
                return False, "No vital signs recorded"
            
            # Calculate averages for available data
            stats = {
                'total_records': len(vitals),
                'avg_blood_pressure_systolic': None,
                'avg_blood_pressure_diastolic': None,
                'avg_heart_rate': None,
                'avg_temperature': None,
                'avg_respiratory_rate': None,
                'avg_oxygen_saturation': None
            }
            
            # Helper function to calculate average
            def calc_avg(field_name):
                values = [getattr(v, field_name) for v in vitals if getattr(v, field_name) is not None]
                return round(sum(values) / len(values), 2) if values else None
            
            stats['avg_blood_pressure_systolic'] = calc_avg('blood_pressure_systolic')
            stats['avg_blood_pressure_diastolic'] = calc_avg('blood_pressure_diastolic')
            stats['avg_heart_rate'] = calc_avg('heart_rate')
            stats['avg_temperature'] = calc_avg('temperature')
            stats['avg_respiratory_rate'] = calc_avg('respiratory_rate')
            stats['avg_oxygen_saturation'] = calc_avg('oxygen_saturation')
            
            return True, stats
        except Exception as e:
            return False, f"Error calculating statistics: {str(e)}"
