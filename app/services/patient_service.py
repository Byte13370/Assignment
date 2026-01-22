from datetime import datetime
from app.models.patient import Patient
from app import db_session
from app.services.validators import Validator

class PatientService:
    """Patient Service - Business Logic Layer"""
    
    @staticmethod
    def create_patient(patient_data):
        """
        Create a new patient
        Returns: (success: bool, patient_dict or error_message: str)
        """
        try:
            # Validate all patient data
            is_valid, errors = Validator.validate_patient_data(patient_data)
            if not is_valid:
                # Return first error or all errors as a dict
                return False, errors
            
            # Sanitize text fields to prevent XSS
            sanitized_data = {
                'first_name': patient_data['first_name'].strip(),
                'last_name': patient_data['last_name'].strip(),
                'date_of_birth': patient_data['date_of_birth'].strip(),
                'gender': patient_data['gender'].strip(),
                'phone': patient_data.get('phone', '').strip() if patient_data.get('phone') else None,
                'email': patient_data.get('email', '').strip() if patient_data.get('email') else None,
                'address': Validator.sanitize_text(patient_data.get('address')) if patient_data.get('address') else None,
                'medical_history': Validator.sanitize_text(patient_data.get('medical_history')) if patient_data.get('medical_history') else None
            }
            
            # Create patient
            patient = Patient(
                first_name=sanitized_data['first_name'],
                last_name=sanitized_data['last_name'],
                date_of_birth=sanitized_data['date_of_birth'],
                gender=sanitized_data['gender'],
                phone=sanitized_data['phone'],
                email=sanitized_data['email'],
                address=sanitized_data['address'],
                medical_history=sanitized_data['medical_history']
            )
            
            db_session.add(patient)
            db_session.commit()
            
            return True, patient.to_dict()
        except Exception as e:
            db_session.rollback()
            return False, f"Error creating patient: {str(e)}"
    
    @staticmethod
    def get_all_patients(page=1, per_page=10):
        """
        Get all patients with pagination
        Args:
            page: Page number (default: 1)
            per_page: Number of results per page (default: 10)
        Returns: (success: bool, dict with patients and pagination or error_message: str)
        """
        try:
            # Build base query
            query = db_session.query(Patient).order_by(Patient.created_at.desc())
            
            # Get total count
            total = query.count()
            
            # Apply pagination
            offset = (page - 1) * per_page
            patients = query.limit(per_page).offset(offset).all()
            
            # Build response with pagination metadata
            result = {
                'patients': [patient.to_dict() for patient in patients],
                'pagination': PatientService._build_pagination_metadata(page, per_page, total)
            }
            
            return True, result
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
            
            # Validate all patient data
            is_valid, errors = Validator.validate_patient_data(patient_data)
            if not is_valid:
                return False, errors
            
            # Sanitize and update fields
            updateable_fields = ['first_name', 'last_name', 'date_of_birth', 'gender', 
                               'phone', 'email', 'address', 'medical_history']
            for field in updateable_fields:
                if field in patient_data:
                    value = patient_data[field]
                    # Sanitize text fields
                    if field in ['address', 'medical_history'] and value:
                        value = Validator.sanitize_text(value)
                    elif isinstance(value, str) and value:
                        value = value.strip()
                    setattr(patient, field, value)
            
            patient.updated_at = datetime.utcnow()
            db_session.commit()
            
            return True, patient.to_dict()
        except Exception as e:
            db_session.rollback()
            return False, f"Error updating patient: {str(e)}"
    
    @staticmethod
    def search_patients(search_term, page=1, per_page=10):
        """
        Search patients by name with pagination
        Args:
            search_term: Search query for first/last name
            page: Page number (default: 1)
            per_page: Number of results per page (default: 10)
        Returns: (success: bool, dict with patients and pagination or error_message: str)
        """
        try:
            search_pattern = f"%{search_term}%"
            
            # Build base query
            query = db_session.query(Patient).filter(
                (Patient.first_name.ilike(search_pattern)) |
                (Patient.last_name.ilike(search_pattern))
            ).order_by(Patient.created_at.desc())
            
            # Get total count
            total = query.count()
            
            # Apply pagination
            offset = (page - 1) * per_page
            patients = query.limit(per_page).offset(offset).all()
            
            # Build response with pagination metadata
            result = {
                'patients': [patient.to_dict() for patient in patients],
                'pagination': PatientService._build_pagination_metadata(page, per_page, total)
            }
            
            return True, result
        except Exception as e:
            return False, f"Error searching patients: {str(e)}"
    
    @staticmethod
    def _build_pagination_metadata(page, per_page, total):
        """
        Build pagination metadata
        Args:
            page: Current page number
            per_page: Results per page
            total: Total number of results
        Returns: dict with pagination information
        """
        import math
        pages = math.ceil(total / per_page) if per_page > 0 else 0
        
        return {
            'page': page,
            'per_page': per_page,
            'total': total,
            'pages': pages,
            'has_next': page < pages,
            'has_prev': page > 1
        }
