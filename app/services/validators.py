"""
Centralized validation module for the application.
Contains reusable validation functions for various data types.
"""

import re
from datetime import datetime, date
from typing import Tuple, Optional, Dict, Any


class ValidationError(Exception):
    """Custom exception for validation errors"""
    def __init__(self, field: str, message: str):
        self.field = field
        self.message = message
        super().__init__(f"{field}: {message}")


class Validator:
    """Centralized validator with reusable validation methods"""
    
    # Regular expressions for common validations
    EMAIL_REGEX = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
    PHONE_REGEX = re.compile(r'^[\d\s\-\+\(\)]{10,20}$')
    NAME_REGEX = re.compile(r'^[a-zA-Z\s\-\'\.]+$')
    USERNAME_REGEX = re.compile(r'^[a-zA-Z0-9_-]{3,80}$')
    
    # Validation constants
    MIN_PASSWORD_LENGTH = 8
    MAX_PASSWORD_LENGTH = 128
    MIN_AGE = 0
    MAX_AGE = 150
    
    # Vital signs ranges
    VITAL_RANGES = {
        'blood_pressure_systolic': (40, 300),
        'blood_pressure_diastolic': (20, 200),
        'heart_rate': (20, 300),
        'temperature': (30.0, 45.0),
        'respiratory_rate': (5, 100),
        'oxygen_saturation': (0, 100)
    }
    
    @staticmethod
    def validate_required_field(value: Any, field_name: str) -> Tuple[bool, Optional[str]]:
        """Validate that a required field is present and not empty"""
        if value is None or (isinstance(value, str) and not value.strip()):
            return False, f"{field_name} is required"
        return True, None
    
    @staticmethod
    def validate_email(email: str, field_name: str = "Email") -> Tuple[bool, Optional[str]]:
        """Validate email format"""
        if not email:
            return True, None  # Optional field
        
        if not isinstance(email, str):
            return False, f"{field_name} must be a string"
        
        email = email.strip()
        if len(email) > 120:
            return False, f"{field_name} must not exceed 120 characters"
        
        if not Validator.EMAIL_REGEX.match(email):
            return False, f"{field_name} format is invalid"
        
        return True, None
    
    @staticmethod
    def validate_phone(phone: str, field_name: str = "Phone") -> Tuple[bool, Optional[str]]:
        """Validate phone number format"""
        if not phone:
            return True, None  # Optional field
        
        if not isinstance(phone, str):
            return False, f"{field_name} must be a string"
        
        phone = phone.strip()
        if len(phone) > 20:
            return False, f"{field_name} must not exceed 20 characters"
        
        if not Validator.PHONE_REGEX.match(phone):
            return False, f"{field_name} format is invalid (must contain 10-20 digits)"
        
        return True, None
    
    @staticmethod
    def validate_name(name: str, field_name: str) -> Tuple[bool, Optional[str]]:
        """Validate name fields (first name, last name)"""
        is_valid, error = Validator.validate_required_field(name, field_name)
        if not is_valid:
            return False, error
        
        if not isinstance(name, str):
            return False, f"{field_name} must be a string"
        
        name = name.strip()
        if len(name) < 1:
            return False, f"{field_name} cannot be empty"
        
        if len(name) > 100:
            return False, f"{field_name} must not exceed 100 characters"
        
        if not Validator.NAME_REGEX.match(name):
            return False, f"{field_name} can only contain letters, spaces, hyphens, apostrophes, and periods"
        
        return True, None
    
    @staticmethod
    def validate_date_of_birth(dob: str, field_name: str = "Date of birth") -> Tuple[bool, Optional[str]]:
        """Validate date of birth (format and realistic range)"""
        is_valid, error = Validator.validate_required_field(dob, field_name)
        if not is_valid:
            return False, error
        
        if not isinstance(dob, str):
            return False, f"{field_name} must be a string in YYYY-MM-DD format"
        
        # Validate format
        try:
            birth_date = datetime.strptime(dob.strip(), '%Y-%m-%d').date()
        except ValueError:
            return False, f"{field_name} must be in YYYY-MM-DD format"
        
        # Validate not in future
        today = date.today()
        if birth_date > today:
            return False, f"{field_name} cannot be in the future"
        
        # Validate realistic age range
        age = (today - birth_date).days / 365.25
        if age < Validator.MIN_AGE or age > Validator.MAX_AGE:
            return False, f"{field_name} must represent an age between {Validator.MIN_AGE} and {Validator.MAX_AGE} years"
        
        return True, None
    
    @staticmethod
    def validate_gender(gender: str, field_name: str = "Gender") -> Tuple[bool, Optional[str]]:
        """Validate gender field (enum validation)"""
        is_valid, error = Validator.validate_required_field(gender, field_name)
        if not is_valid:
            return False, error
        
        valid_genders = ['Male', 'Female', 'Other', 'male', 'female', 'other']
        if gender not in valid_genders:
            return False, f"{field_name} must be one of: Male, Female, Other"
        
        return True, None
    
    @staticmethod
    def validate_text_length(text: str, max_length: int, field_name: str, required: bool = False) -> Tuple[bool, Optional[str]]:
        """Validate text field length"""
        if not text or (isinstance(text, str) and not text.strip()):
            if required:
                return False, f"{field_name} is required"
            return True, None  # Optional field
        
        if not isinstance(text, str):
            return False, f"{field_name} must be a string"
        
        if len(text) > max_length:
            return False, f"{field_name} must not exceed {max_length} characters"
        
        return True, None
    
    @staticmethod
    def validate_username(username: str, field_name: str = "Username") -> Tuple[bool, Optional[str]]:
        """Validate username format and length"""
        is_valid, error = Validator.validate_required_field(username, field_name)
        if not is_valid:
            return False, error
        
        if not isinstance(username, str):
            return False, f"{field_name} must be a string"
        
        username = username.strip()
        if len(username) < 3:
            return False, f"{field_name} must be at least 3 characters"
        
        if len(username) > 80:
            return False, f"{field_name} must not exceed 80 characters"
        
        if not Validator.USERNAME_REGEX.match(username):
            return False, f"{field_name} can only contain letters, numbers, underscores, and hyphens"
        
        return True, None
    
    @staticmethod
    def validate_password(password: str, field_name: str = "Password") -> Tuple[bool, Optional[str]]:
        """Validate password strength"""
        is_valid, error = Validator.validate_required_field(password, field_name)
        if not is_valid:
            return False, error
        
        if not isinstance(password, str):
            return False, f"{field_name} must be a string"
        
        if len(password) < Validator.MIN_PASSWORD_LENGTH:
            return False, f"{field_name} must be at least {Validator.MIN_PASSWORD_LENGTH} characters"
        
        if len(password) > Validator.MAX_PASSWORD_LENGTH:
            return False, f"{field_name} must not exceed {Validator.MAX_PASSWORD_LENGTH} characters"
        
        # Check password complexity
        has_upper = any(c.isupper() for c in password)
        has_lower = any(c.islower() for c in password)
        has_digit = any(c.isdigit() for c in password)
        has_special = any(c in '!@#$%^&*()_+-=[]{}|;:,.<>?' for c in password)
        
        if not (has_upper and has_lower and has_digit and has_special):
            return False, f"{field_name} must contain at least one uppercase letter, one lowercase letter, one digit, and one special character"
        
        return True, None
    
    @staticmethod
    def validate_vital_sign(value: Any, vital_type: str, field_name: str) -> Tuple[bool, Optional[str]]:
        """Validate vital sign measurement"""
        if value is None:
            return True, None  # Optional field
        
        # Get valid range
        if vital_type not in Validator.VITAL_RANGES:
            return False, f"Unknown vital sign type: {vital_type}"
        
        min_val, max_val = Validator.VITAL_RANGES[vital_type]
        
        # Validate type
        if vital_type == 'temperature' or vital_type == 'oxygen_saturation':
            # Float values
            try:
                value = float(value)
            except (TypeError, ValueError):
                return False, f"{field_name} must be a number"
        else:
            # Integer values
            try:
                value = int(value)
            except (TypeError, ValueError):
                return False, f"{field_name} must be an integer"
        
        # Validate range
        if value < min_val or value > max_val:
            return False, f"{field_name} must be between {min_val} and {max_val}"
        
        return True, None
    
    @staticmethod
    def validate_blood_pressure_logic(systolic: Optional[int], diastolic: Optional[int]) -> Tuple[bool, Optional[str]]:
        """Validate that systolic BP is greater than diastolic BP"""
        if systolic is not None and diastolic is not None:
            if systolic <= diastolic:
                return False, "Systolic blood pressure must be greater than diastolic blood pressure"
        
        return True, None
    
    @staticmethod
    def sanitize_text(text: str) -> str:
        """Basic XSS prevention - remove/escape HTML tags"""
        if not text:
            return text
        
        # Replace common HTML characters
        text = text.replace('<', '&lt;')
        text = text.replace('>', '&gt;')
        text = text.replace('"', '&quot;')
        text = text.replace("'", '&#x27;')
        
        return text.strip()
    
    @staticmethod
    def validate_patient_data(patient_data: Dict[str, Any]) -> Tuple[bool, Dict[str, str]]:
        """Validate all patient data fields"""
        errors = {}
        
        # Validate first name
        is_valid, error = Validator.validate_name(
            patient_data.get('first_name', ''), 
            'First name'
        )
        if not is_valid:
            errors['first_name'] = error
        
        # Validate last name
        is_valid, error = Validator.validate_name(
            patient_data.get('last_name', ''), 
            'Last name'
        )
        if not is_valid:
            errors['last_name'] = error
        
        # Validate date of birth
        is_valid, error = Validator.validate_date_of_birth(
            patient_data.get('date_of_birth', ''), 
            'Date of birth'
        )
        if not is_valid:
            errors['date_of_birth'] = error
        
        # Validate gender
        is_valid, error = Validator.validate_gender(
            patient_data.get('gender', ''), 
            'Gender'
        )
        if not is_valid:
            errors['gender'] = error
        
        # Validate optional fields
        if 'phone' in patient_data and patient_data['phone']:
            is_valid, error = Validator.validate_phone(
                patient_data['phone'], 
                'Phone'
            )
            if not is_valid:
                errors['phone'] = error
        
        if 'email' in patient_data and patient_data['email']:
            is_valid, error = Validator.validate_email(
                patient_data['email'], 
                'Email'
            )
            if not is_valid:
                errors['email'] = error
        
        if 'address' in patient_data and patient_data['address']:
            is_valid, error = Validator.validate_text_length(
                patient_data['address'], 
                120, 
                'Address'
            )
            if not is_valid:
                errors['address'] = error
        
        if 'medical_history' in patient_data and patient_data['medical_history']:
            is_valid, error = Validator.validate_text_length(
                patient_data['medical_history'], 
                5000, 
                'Medical history'
            )
            if not is_valid:
                errors['medical_history'] = error
        
        if errors:
            return False, errors
        
        return True, {}
    
    @staticmethod
    def validate_vital_data(vital_data: Dict[str, Any]) -> Tuple[bool, Dict[str, str]]:
        """Validate all vital sign data fields"""
        errors = {}
        
        # Validate each vital sign
        vital_fields = {
            'blood_pressure_systolic': 'blood_pressure_systolic',
            'blood_pressure_diastolic': 'blood_pressure_diastolic',
            'heart_rate': 'heart_rate',
            'temperature': 'temperature',
            'respiratory_rate': 'respiratory_rate',
            'oxygen_saturation': 'oxygen_saturation'
        }
        
        for field, vital_type in vital_fields.items():
            if field in vital_data and vital_data[field] is not None:
                # Format field name for display
                display_name = field.replace('_', ' ').title()
                is_valid, error = Validator.validate_vital_sign(
                    vital_data[field], 
                    vital_type, 
                    display_name
                )
                if not is_valid:
                    errors[field] = error
        
        # Validate blood pressure logic
        if 'blood_pressure_systolic' in vital_data and 'blood_pressure_diastolic' in vital_data:
            is_valid, error = Validator.validate_blood_pressure_logic(
                vital_data.get('blood_pressure_systolic'),
                vital_data.get('blood_pressure_diastolic')
            )
            if not is_valid:
                errors['blood_pressure'] = error
        
        # Check that at least one vital sign measurement is provided
        vital_measurements = [
            vital_data.get('blood_pressure_systolic'),
            vital_data.get('blood_pressure_diastolic'),
            vital_data.get('heart_rate'),
            vital_data.get('temperature'),
            vital_data.get('respiratory_rate'),
            vital_data.get('oxygen_saturation')
        ]
        if all(v is None for v in vital_measurements):
            errors['general'] = 'At least one vital sign measurement is required'
        
        # Validate notes length
        if 'notes' in vital_data and vital_data['notes']:
            is_valid, error = Validator.validate_text_length(
                vital_data['notes'], 
                500, 
                'Notes'
            )
            if not is_valid:
                errors['notes'] = error
        
        if errors:
            return False, errors
        
        return True, {}
    
    @staticmethod
    def validate_user_registration(user_data: Dict[str, Any]) -> Tuple[bool, Dict[str, str]]:
        """Validate user registration data"""
        errors = {}
        
        # Validate username
        is_valid, error = Validator.validate_username(
            user_data.get('username', ''), 
            'Username'
        )
        if not is_valid:
            errors['username'] = error
        
        # Validate email
        is_valid, error = Validator.validate_email(
            user_data.get('email', ''), 
            'Email'
        )
        if not is_valid:
            errors['email'] = error
        elif not user_data.get('email'):
            errors['email'] = 'Email is required'
        
        # Validate password
        is_valid, error = Validator.validate_password(
            user_data.get('password', ''), 
            'Password'
        )
        if not is_valid:
            errors['password'] = error
        
        if errors:
            return False, errors
        
        return True, {}
