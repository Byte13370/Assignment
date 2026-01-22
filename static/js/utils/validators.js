/**
 * Frontend Validation Utility Functions
 * Provides client-side validation for forms
 */

const Validators = {
    /**
     * Email validation regex
     */
    emailRegex: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    
    /**
     * Phone validation regex (10-20 digits with optional formatting)
     */
    phoneRegex: /^[\d\s\-\+\(\)]{10,20}$/,
    
    /**
     * Name validation regex (letters, spaces, hyphens, apostrophes, periods)
     */
    nameRegex: /^[a-zA-Z\s\-'\.]+$/,
    
    /**
     * Username validation regex (alphanumeric, underscores, hyphens, 3-80 chars)
     */
    usernameRegex: /^[a-zA-Z0-9_-]{3,80}$/,
    
    /**
     * Validate required field
     */
    validateRequired(value, fieldName) {
        if (!value || (typeof value === 'string' && !value.trim())) {
            return { valid: false, error: `${fieldName} is required` };
        }
        return { valid: true };
    },
    
    /**
     * Validate email format
     */
    validateEmail(email, required = false) {
        if (!email || !email.trim()) {
            if (required) {
                return { valid: false, error: 'Email is required' };
            }
            return { valid: true };
        }
        
        if (email.length > 120) {
            return { valid: false, error: 'Email must not exceed 120 characters' };
        }
        
        if (!this.emailRegex.test(email)) {
            return { valid: false, error: 'Invalid email format' };
        }
        
        return { valid: true };
    },
    
    /**
     * Validate phone number format
     */
    validatePhone(phone, required = false) {
        if (!phone || !phone.trim()) {
            if (required) {
                return { valid: false, error: 'Phone number is required' };
            }
            return { valid: true };
        }
        
        if (phone.length > 20) {
            return { valid: false, error: 'Phone number must not exceed 20 characters' };
        }
        
        if (!this.phoneRegex.test(phone)) {
            return { valid: false, error: 'Invalid phone number format' };
        }
        
        return { valid: true };
    },
    
    /**
     * Validate name (first name, last name)
     */
    validateName(name, fieldName) {
        const result = this.validateRequired(name, fieldName);
        if (!result.valid) {
            return result;
        }
        
        if (name.length > 100) {
            return { valid: false, error: `${fieldName} must not exceed 100 characters` };
        }
        
        if (!this.nameRegex.test(name)) {
            return { valid: false, error: `${fieldName} can only contain letters, spaces, hyphens, apostrophes, and periods` };
        }
        
        return { valid: true };
    },
    
    /**
     * Validate date of birth
     */
    validateDateOfBirth(dob) {
        const result = this.validateRequired(dob, 'Date of birth');
        if (!result.valid) {
            return result;
        }
        
        const birthDate = new Date(dob);
        const today = new Date();
        
        if (isNaN(birthDate.getTime())) {
            return { valid: false, error: 'Invalid date format' };
        }
        
        if (birthDate > today) {
            return { valid: false, error: 'Date of birth cannot be in the future' };
        }
        
        const age = (today - birthDate) / (365.25 * 24 * 60 * 60 * 1000);
        if (age < 0 || age > 150) {
            return { valid: false, error: 'Please enter a valid date of birth' };
        }
        
        return { valid: true };
    },
    
    /**
     * Validate gender
     */
    validateGender(gender) {
        const result = this.validateRequired(gender, 'Gender');
        if (!result.valid) {
            return result;
        }
        
        const validGenders = ['Male', 'Female', 'Other', 'male', 'female', 'other'];
        if (!validGenders.includes(gender)) {
            return { valid: false, error: 'Gender must be Male, Female, or Other' };
        }
        
        return { valid: true };
    },
    
    /**
     * Validate text length
     */
    validateTextLength(text, maxLength, fieldName, required = false) {
        if (!text || !text.trim()) {
            if (required) {
                return { valid: false, error: `${fieldName} is required` };
            }
            return { valid: true };
        }
        
        if (text.length > maxLength) {
            return { valid: false, error: `${fieldName} must not exceed ${maxLength} characters` };
        }
        
        return { valid: true };
    },
    
    /**
     * Validate username
     */
    validateUsername(username) {
        const result = this.validateRequired(username, 'Username');
        if (!result.valid) {
            return result;
        }
        
        if (username.length < 3) {
            return { valid: false, error: 'Username must be at least 3 characters' };
        }
        
        if (username.length > 80) {
            return { valid: false, error: 'Username must not exceed 80 characters' };
        }
        
        if (!this.usernameRegex.test(username)) {
            return { valid: false, error: 'Username can only contain letters, numbers, underscores, and hyphens' };
        }
        
        return { valid: true };
    },
    
    /**
     * Validate password strength
     */
    validatePassword(password) {
        const result = this.validateRequired(password, 'Password');
        if (!result.valid) {
            return result;
        }
        
        if (password.length < 8) {
            return { valid: false, error: 'Password must be at least 8 characters' };
        }
        
        if (password.length > 128) {
            return { valid: false, error: 'Password must not exceed 128 characters' };
        }
        
        const hasUpper = /[A-Z]/.test(password);
        const hasLower = /[a-z]/.test(password);
        const hasDigit = /\d/.test(password);
        const hasSpecial = /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password);
        
        if (!hasUpper || !hasLower || !hasDigit || !hasSpecial) {
            return { 
                valid: false, 
                error: 'Password must contain uppercase, lowercase, digit, and special character' 
            };
        }
        
        return { valid: true };
    },
    
    /**
     * Get password strength level
     */
    getPasswordStrength(password) {
        if (!password) return { level: 0, label: 'None', color: '#ccc' };
        
        let strength = 0;
        
        // Length
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        
        // Character types
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) strength++;
        
        if (strength <= 2) {
            return { level: 1, label: 'Weak', color: '#dc3545' };
        } else if (strength <= 4) {
            return { level: 2, label: 'Medium', color: '#ffc107' };
        } else {
            return { level: 3, label: 'Strong', color: '#28a745' };
        }
    },
    
    /**
     * Validate vital sign value
     */
    validateVitalSign(value, min, max, fieldName, isInteger = true) {
        if (value === null || value === undefined || value === '') {
            return { valid: true }; // Optional field
        }
        
        const numValue = isInteger ? parseInt(value) : parseFloat(value);
        
        if (isNaN(numValue)) {
            return { valid: false, error: `${fieldName} must be a number` };
        }
        
        if (numValue < min || numValue > max) {
            return { valid: false, error: `${fieldName} must be between ${min} and ${max}` };
        }
        
        return { valid: true };
    },
    
    /**
     * Validate blood pressure values
     */
    validateBloodPressure(systolic, diastolic) {
        const errors = [];
        
        if (systolic !== null && systolic !== undefined && systolic !== '') {
            const result = this.validateVitalSign(systolic, 40, 300, 'Systolic BP', true);
            if (!result.valid) {
                errors.push(result.error);
            }
        }
        
        if (diastolic !== null && diastolic !== undefined && diastolic !== '') {
            const result = this.validateVitalSign(diastolic, 20, 200, 'Diastolic BP', true);
            if (!result.valid) {
                errors.push(result.error);
            }
        }
        
        // Check logical relationship
        if (systolic && diastolic) {
            const sys = parseInt(systolic);
            const dia = parseInt(diastolic);
            if (!isNaN(sys) && !isNaN(dia) && sys <= dia) {
                errors.push('Systolic BP must be greater than Diastolic BP');
            }
        }
        
        if (errors.length > 0) {
            return { valid: false, error: errors.join('; ') };
        }
        
        return { valid: true };
    },
    
    /**
     * Validate all vital signs
     */
    validateVitalSigns(vitalData) {
        const errors = {};
        
        // Validate blood pressure
        const bpResult = this.validateBloodPressure(
            vitalData.blood_pressure_systolic,
            vitalData.blood_pressure_diastolic
        );
        if (!bpResult.valid) {
            errors.blood_pressure = bpResult.error;
        }
        
        // Validate heart rate
        if (vitalData.heart_rate) {
            const result = this.validateVitalSign(vitalData.heart_rate, 20, 300, 'Heart Rate', true);
            if (!result.valid) {
                errors.heart_rate = result.error;
            }
        }
        
        // Validate temperature
        if (vitalData.temperature) {
            const result = this.validateVitalSign(vitalData.temperature, 30, 45, 'Temperature', false);
            if (!result.valid) {
                errors.temperature = result.error;
            }
        }
        
        // Validate respiratory rate
        if (vitalData.respiratory_rate) {
            const result = this.validateVitalSign(vitalData.respiratory_rate, 5, 100, 'Respiratory Rate', true);
            if (!result.valid) {
                errors.respiratory_rate = result.error;
            }
        }
        
        // Validate oxygen saturation
        if (vitalData.oxygen_saturation) {
            const result = this.validateVitalSign(vitalData.oxygen_saturation, 0, 100, 'Oxygen Saturation', false);
            if (!result.valid) {
                errors.oxygen_saturation = result.error;
            }
        }
        
        // Check that at least one vital sign measurement is provided
        const hasAnyValue = vitalData.blood_pressure_systolic || 
                            vitalData.blood_pressure_diastolic ||
                            vitalData.heart_rate || 
                            vitalData.temperature ||
                            vitalData.respiratory_rate || 
                            vitalData.oxygen_saturation;
        
        if (!hasAnyValue) {
            errors.general = 'At least one vital sign measurement is required';
        }
        
        // Validate notes length
        if (vitalData.notes) {
            const result = this.validateTextLength(vitalData.notes, 500, 'Notes', false);
            if (!result.valid) {
                errors.notes = result.error;
            }
        }
        
        return {
            valid: Object.keys(errors).length === 0,
            errors: errors
        };
    },
    
    /**
     * Validate patient form data
     */
    validatePatientData(patientData) {
        const errors = {};
        
        // Validate first name
        const firstNameResult = this.validateName(patientData.first_name, 'First name');
        if (!firstNameResult.valid) {
            errors.first_name = firstNameResult.error;
        }
        
        // Validate last name
        const lastNameResult = this.validateName(patientData.last_name, 'Last name');
        if (!lastNameResult.valid) {
            errors.last_name = lastNameResult.error;
        }
        
        // Validate date of birth
        const dobResult = this.validateDateOfBirth(patientData.date_of_birth);
        if (!dobResult.valid) {
            errors.date_of_birth = dobResult.error;
        }
        
        // Validate gender
        const genderResult = this.validateGender(patientData.gender);
        if (!genderResult.valid) {
            errors.gender = genderResult.error;
        }
        
        // Validate optional fields
        if (patientData.phone) {
            const phoneResult = this.validatePhone(patientData.phone, false);
            if (!phoneResult.valid) {
                errors.phone = phoneResult.error;
            }
        }
        
        if (patientData.email) {
            const emailResult = this.validateEmail(patientData.email, false);
            if (!emailResult.valid) {
                errors.email = emailResult.error;
            }
        }
        
        if (patientData.address) {
            const addressResult = this.validateTextLength(patientData.address, 120, 'Address', false);
            if (!addressResult.valid) {
                errors.address = addressResult.error;
            }
        }
        
        if (patientData.medical_history) {
            const historyResult = this.validateTextLength(patientData.medical_history, 5000, 'Medical history', false);
            if (!historyResult.valid) {
                errors.medical_history = historyResult.error;
            }
        }
        
        return {
            valid: Object.keys(errors).length === 0,
            errors: errors
        };
    },
    
    /**
     * Display validation error on a form field
     */
    showFieldError(fieldElement, errorMessage) {
        // Remove existing error
        this.clearFieldError(fieldElement);
        
        // Add error class
        fieldElement.classList.add('is-invalid');
        
        // Create error message element
        const errorDiv = document.createElement('div');
        errorDiv.className = 'invalid-feedback';
        errorDiv.textContent = errorMessage;
        
        // Insert after field
        fieldElement.parentNode.appendChild(errorDiv);
    },
    
    /**
     * Clear validation error from a form field
     */
    clearFieldError(fieldElement) {
        fieldElement.classList.remove('is-invalid');
        
        // Remove error message
        const errorDiv = fieldElement.parentNode.querySelector('.invalid-feedback');
        if (errorDiv) {
            errorDiv.remove();
        }
    },
    
    /**
     * Clear all validation errors from a form
     */
    clearFormErrors(formElement) {
        const invalidFields = formElement.querySelectorAll('.is-invalid');
        invalidFields.forEach(field => {
            this.clearFieldError(field);
        });
        
        // Also remove any alert-danger divs
        const alerts = formElement.querySelectorAll('.alert-danger');
        alerts.forEach(alert => alert.remove());
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Validators;
}
