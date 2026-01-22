/**
 * Patient Form Component - Add/Edit patient
 */
import { BaseComponent } from './base-component.js';
import apiService from '../services/api-service.js';

// Load validators dynamically
let Validators;
try {
    const module = await import('../utils/validators.js');
    Validators = module.default || window.Validators;
} catch (e) {
    console.warn('Validators module not loaded', e);
}

class PatientForm extends BaseComponent {
    constructor() {
        super();
        this.setState({
            loading: false,
            error: null,
            success: null,
            fieldErrors: {}
        });
    }
    
    render() {
        const { loading, error, success } = this.getState();
        
        this.shadowRoot.innerHTML = `
            ${this.getCommonStyles()}
            <style>
                .form-container {
                    background: white;
                    padding: 2rem;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    max-width: 800px;
                    margin: 0 auto;
                }
                
                .form-header {
                    margin-bottom: 2rem;
                }
                
                .form-header h3 {
                    color: #1f2937;
                    margin-bottom: 0.5rem;
                }
                
                .form-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                }
                
                .form-group.full-width {
                    grid-column: 1 / -1;
                }
                
                .form-actions {
                    display: flex;
                    gap: 1rem;
                    margin-top: 1.5rem;
                }
            </style>
            
            <div class="form-container">
                <div class="form-header">
                    <h3>Add New Patient</h3>
                    <p>Enter patient information below</p>
                </div>
                
                ${error ? this.showError(error) : ''}
                ${success ? this.showSuccess(success) : ''}
                ${loading ? this.showLoading('Saving patient...') : ''}
                
                <form id="patient-form">
                    <div class="form-grid">
                        <div class="form-group">
                            <label>First Name *</label>
                            <input type="text" id="first-name" required>
                        </div>
                        
                        <div class="form-group">
                            <label>Last Name *</label>
                            <input type="text" id="last-name" required>
                        </div>
                        
                        <div class="form-group">
                            <label>Date of Birth *</label>
                            <input type="date" id="dob" required>
                        </div>
                        
                        <div class="form-group">
                            <label>Gender *</label>
                            <select id="gender" required>
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>Phone</label>
                            <input type="tel" id="phone">
                        </div>
                        
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" id="email">
                        </div>
                        
                        <div class="form-group full-width">
                            <label>Address</label>
                            <textarea id="address" rows="3"></textarea>
                        </div>
                        
                        <div class="form-group full-width">
                            <label>Medical History</label>
                            <textarea id="medical-history" rows="4"></textarea>
                        </div>
                    </div>
                    
                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary">
                            Save Patient
                        </button>
                        <button type="button" class="btn btn-secondary" id="cancel-btn">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        `;
    }
    
    attachEventListeners() {
        const form = this.$('#patient-form');
        const cancelBtn = this.$('#cancel-btn');
        
        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.emit('cancel');
            });
        }
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        const patientData = {
            first_name: this.$('#first-name').value.trim(),
            last_name: this.$('#last-name').value.trim(),
            date_of_birth: this.$('#dob').value,
            gender: this.$('#gender').value,
            phone: this.$('#phone').value.trim(),
            email: this.$('#email').value.trim(),
            address: this.$('#address').value.trim(),
            medical_history: this.$('#medical-history').value.trim()
        };
        
        // Clear previous errors
        this.clearFieldErrors();
        
        // Client-side validation if validators are loaded
        if (Validators) {
            const validation = Validators.validatePatientData(patientData);
            if (!validation.valid) {
                this.showFieldErrors(validation.errors);
                return;
            }
        }
        
        this.setState({ loading: true, error: null, success: null });
        
        const result = await apiService.createPatient(patientData);
        
        if (result.success) {
            this.setState({ 
                loading: false, 
                success: 'Patient added successfully!'
            });
            
            // Emit success event with patient data
            this.emit('patient-created', { patient: result.data.patient });
            
            // Reset form after short delay
            setTimeout(() => {
                this.$('#patient-form').reset();
                this.setState({ success: null });
            }, 2000);
        } else {
            // Handle validation errors from server
            if (result.data && result.data.errors) {
                this.showFieldErrors(result.data.errors);
            } else {
                this.setState({ 
                    loading: false, 
                    error: result.error || 'Failed to add patient'
                });
            }
        }
    }
    
    clearFieldErrors() {
        const form = this.$('#patient-form');
        if (form && Validators) {
            Validators.clearFormErrors(form);
        }
    }
    
    showFieldErrors(errors) {
        this.setState({ loading: false });
        
        // Display errors next to fields
        const fieldMap = {
            'first_name': 'first-name',
            'last_name': 'last-name',
            'date_of_birth': 'dob',
            'gender': 'gender',
            'phone': 'phone',
            'email': 'email',
            'address': 'address',
            'medical_history': 'medical-history'
        };
        
        for (const [fieldKey, errorMsg] of Object.entries(errors)) {
            const inputId = fieldMap[fieldKey];
            if (inputId) {
                const inputElement = this.$(`#${inputId}`);
                if (inputElement && Validators) {
                    Validators.showFieldError(inputElement, errorMsg);
                }
            }
        }
        
        // Also show general error message
        const errorMessage = Object.values(errors).join(', ');
        this.setState({ error: `Validation errors: ${errorMessage}` });
    }
}

// Define custom element
customElements.define('patient-form', PatientForm);
