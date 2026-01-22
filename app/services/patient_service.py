from datetime import datetime
from app.models.patient import Patient
from app import db_session

class PatientService:
    """Patient Service - Business Logic Layer"""
    
    @staticmethod
    def create_patient(patient_data):
        """
        Create a new patient
        Returns: (success: bool, patient_dict or error_message: str)
        """
        try:
            # Validate required fields
            required_fields = ['first_name', 'last_name', 'date_of_birth', 'gender']
            for field in required_fields:
                if field not in patient_data or not patient_data[field]:
                    return False, f"Missing required field: {field}"
            
            # Create patient
            patient = Patient(
                first_name=patient_data['first_name'],
                last_name=patient_data['last_name'],
                date_of_birth=patient_data['date_of_birth'],
                gender=patient_data['gender'],
                phone=patient_data.get('phone'),
                email=patient_data.get('email'),
                address=patient_data.get('address'),
                medical_history=patient_data.get('medical_history')
            )
            
            db_session.add(patient)
            db_session.commit()
            
            return True, patient.to_dict()
        except Exception as e:
            db_session.rollback()
            return False, f"Error creating patient: {str(e)}"
    
    @staticmethod
    def get_all_patients():
        """
        Get all patients
        Returns: (success: bool, list of patient_dicts or error_message: str)
        """
        try:
            patients = db_session.query(Patient).order_by(Patient.created_at.desc()).all()
            return True, [patient.to_dict() for patient in patients]
        except Exception as e:
            return False, f"Error fetching patients: {str(e)}"
    
    @staticmethod
    def get_patient_by_id(patient_id):
        """
        Get a specific patient by ID
        Returns: (success: bool, patient_dict or error_message: str)
        """
        try:
            patient = db_session.query(Patient).filter_by(id=patient_id).first()
            if not patient:
                return False, "Patient not found"
            return True, patient.to_dict()
        except Exception as e:
            return False, f"Error fetching patient: {str(e)}"
    
    @staticmethod
    def update_patient(patient_id, patient_data):
        """
        Update patient information
        Returns: (success: bool, patient_dict or error_message: str)
        """
        try:
            patient = db_session.query(Patient).filter_by(id=patient_id).first()
            if not patient:
                return False, "Patient not found"
            
            # Update fields
            updateable_fields = ['first_name', 'last_name', 'date_of_birth', 'gender', 
                               'phone', 'email', 'address', 'medical_history']
            for field in updateable_fields:
                if field in patient_data:
                    setattr(patient, field, patient_data[field])
            
            patient.updated_at = datetime.utcnow()
            db_session.commit()
            
            return True, patient.to_dict()
        except Exception as e:
            db_session.rollback()
            return False, f"Error updating patient: {str(e)}"
    
    @staticmethod
    def search_patients(search_term):
        """
        Search patients by name
        Returns: (success: bool, list of patient_dicts or error_message: str)
        """
        try:
            search_pattern = f"%{search_term}%"
            patients = db_session.query(Patient).filter(
                (Patient.first_name.ilike(search_pattern)) |
                (Patient.last_name.ilike(search_pattern))
            ).all()
            
            return True, [patient.to_dict() for patient in patients]
        except Exception as e:
            return False, f"Error searching patients: {str(e)}"
