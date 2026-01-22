/**
 * Vital Signs Component - Display and add vital signs for a patient
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

class VitalSigns extends BaseComponent {
    constructor() {
        super();
        this.setState({
            patientId: null,
            patient: null,
            vitals: [],
            statistics: null,
            loading: true,
            error: null,
            showForm: false,
            formLoading: false,
            formError: null,
            formSuccess: null
        });
    }
    
    static get observedAttributes() {
        return ['patient-id'];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'patient-id' && newValue) {
            this.setState({ patientId: parseInt(newValue) });
            this.loadPatientData();
        }
    }
    
    async connectedCallback() {
        super.connectedCallback();
        const patientId = this.getAttribute('patient-id');
        if (patientId) {
            this.setState({ patientId: parseInt(patientId) });
            await this.loadPatientData();
        }
    }
    
    async loadPatientData() {
        const { patientId } = this.getState();
        if (!patientId) return;
        
        this.setState({ loading: true, error: null });
        
        // Load patient info, vitals, and statistics in parallel
        const [patientResult, vitalsResult, statsResult] = await Promise.all([
            apiService.getPatient(patientId),
            apiService.getPatientVitals(patientId),
            apiService.getVitalStatistics(patientId)
        ]);
        
        if (patientResult.success) {
            this.setState({
                patient: patientResult.data.patient,
                vitals: vitalsResult.success ? vitalsResult.data.vitals : [],
                statistics: statsResult.success ? statsResult.data.statistics : null,
                loading: false
            });
        } else {
            this.setState({
                loading: false,
                error: patientResult.error
            });
        }
    }
    
    render() {
        const { patient, vitals, statistics, loading, error, showForm, formLoading, formError, formSuccess } = this.getState();
        
        this.shadowRoot.innerHTML = `
            ${this.getCommonStyles()}
            <style>
                .vitals-container {
                    padding: 2rem;
                }
                
                .patient-info {
                    background: white;
                    padding: 1.5rem;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    margin-bottom: 2rem;
                }
                
                .patient-info h3 {
                    color: #1f2937;
                    margin-bottom: 0.5rem;
                }
                
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1rem;
                    margin: 2rem 0;
                }
                
                .stat-box {
                    background: #f9fafb;
                    padding: 1rem;
                    border-radius: 6px;
                    border-left: 4px solid #2563eb;
                }
                
                .stat-box h4 {
                    color: #6b7280;
                    font-size: 0.875rem;
                    margin-bottom: 0.25rem;
                }
                
                .stat-box .value {
                    font-size: 1.5rem;
                    font-weight: bold;
                    color: #1f2937;
                }
                
                .vitals-section {
                    background: white;
                    padding: 1.5rem;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }
                
                .section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                }
                
                .section-header h3 {
                    color: #1f2937;
                    margin: 0;
                }
                
                .vitals-list {
                    display: grid;
                    gap: 1rem;
                }
                
                .vital-card {
                    border: 1px solid #e5e7eb;
                    border-radius: 6px;
                    padding: 1rem;
                }
                
                .vital-card .vital-date {
                    color: #6b7280;
                    font-size: 0.875rem;
                    margin-bottom: 0.75rem;
                }
                
                .vital-values {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 0.75rem;
                }
                
                .vital-item {
                    font-size: 0.875rem;
                }
                
                .vital-item strong {
                    color: #374151;
                }
                
                .form-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }
                
                .vital-form {
                    background: white;
                    padding: 2rem;
                    border-radius: 8px;
                    max-width: 600px;
                    width: 90%;
                    max-height: 90vh;
                    overflow-y: auto;
                }
                
                .form-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                }
                
                .form-actions {
                    display: flex;
                    gap: 1rem;
                    margin-top: 1.5rem;
                }
            </style>
            
            <div class="vitals-container">
                ${loading ? this.showLoading() : ''}
                ${error ? this.showError(error) : ''}
                
                ${patient ? `
                    <div class="patient-info">
                        <h3>${patient.first_name} ${patient.last_name}</h3>
                        <p>${patient.gender} • DOB: ${patient.date_of_birth}</p>
                    </div>
                    
                    ${statistics && statistics.total_records > 0 ? `
                        <div class="stats-grid">
                            ${statistics.avg_blood_pressure_systolic ? `
                                <div class="stat-box">
                                    <h4>Avg Blood Pressure</h4>
                                    <div class="value">${statistics.avg_blood_pressure_systolic}/${statistics.avg_blood_pressure_diastolic}</div>
                                </div>
                            ` : ''}
                            ${statistics.avg_heart_rate ? `
                                <div class="stat-box">
                                    <h4>Avg Heart Rate</h4>
                                    <div class="value">${statistics.avg_heart_rate} bpm</div>
                                </div>
                            ` : ''}
                            ${statistics.avg_temperature ? `
                                <div class="stat-box">
                                    <h4>Avg Temperature</h4>
                                    <div class="value">${statistics.avg_temperature}°C</div>
                                </div>
                            ` : ''}
                            ${statistics.avg_oxygen_saturation ? `
                                <div class="stat-box">
                                    <h4>Avg O2 Saturation</h4>
                                    <div class="value">${statistics.avg_oxygen_saturation}%</div>
                                </div>
                            ` : ''}
                        </div>
                    ` : ''}
                    
                    <div class="vitals-section">
                        <div class="section-header">
                            <h3>Vital Signs History</h3>
                            <button class="btn btn-primary" id="add-vital-btn">
                                Add Vital Signs
                            </button>
                        </div>
                        
                        ${vitals.length === 0 ? `
                            <p style="text-align: center; color: #6b7280; padding: 2rem;">
                                No vital signs recorded yet
                            </p>
                        ` : `
                            <div class="vitals-list">
                                ${vitals.map(vital => `
                                    <div class="vital-card">
                                        <div class="vital-date">
                                            ${new Date(vital.recorded_at).toLocaleString()}
                                        </div>
                                        <div class="vital-values">
                                            ${vital.blood_pressure_systolic ? `
                                                <div class="vital-item">
                                                    <strong>BP:</strong> ${vital.blood_pressure_systolic}/${vital.blood_pressure_diastolic} mmHg
                                                </div>
                                            ` : ''}
                                            ${vital.heart_rate ? `
                                                <div class="vital-item">
                                                    <strong>HR:</strong> ${vital.heart_rate} bpm
                                                </div>
                                            ` : ''}
                                            ${vital.temperature ? `
                                                <div class="vital-item">
                                                    <strong>Temp:</strong> ${vital.temperature}°C
                                                </div>
                                            ` : ''}
                                            ${vital.respiratory_rate ? `
                                                <div class="vital-item">
                                                    <strong>RR:</strong> ${vital.respiratory_rate} /min
                                                </div>
                                            ` : ''}
                                            ${vital.oxygen_saturation ? `
                                                <div class="vital-item">
                                                    <strong>O2:</strong> ${vital.oxygen_saturation}%
                                                </div>
                                            ` : ''}
                                        </div>
                                        ${vital.notes ? `
                                            <div style="margin-top: 0.75rem; font-size: 0.875rem; color: #6b7280;">
                                                <strong>Notes:</strong> ${vital.notes}
                                            </div>
                                        ` : ''}
                                    </div>
                                `).join('')}
                            </div>
                        `}
                    </div>
                ` : ''}
                
                ${showForm ? `
                    <div class="form-overlay">
                        <div class="vital-form">
                            <h3>Add Vital Signs</h3>
                            
                            ${formError ? this.showError(formError) : ''}
                            ${formSuccess ? this.showSuccess(formSuccess) : ''}
                            ${formLoading ? this.showLoading('Saving...') : ''}
                            
                            <form id="vital-form">
                                <div class="form-grid">
                                    <div class="form-group">
                                        <label>Systolic BP (mmHg)</label>
                                        <input type="number" id="bp-systolic" min="0" max="300">
                                    </div>
                                    
                                    <div class="form-group">
                                        <label>Diastolic BP (mmHg)</label>
                                        <input type="number" id="bp-diastolic" min="0" max="200">
                                    </div>
                                    
                                    <div class="form-group">
                                        <label>Heart Rate (bpm)</label>
                                        <input type="number" id="heart-rate" min="0" max="300">
                                    </div>
                                    
                                    <div class="form-group">
                                        <label>Temperature (°C)</label>
                                        <input type="number" id="temperature" step="0.1" min="30" max="45">
                                    </div>
                                    
                                    <div class="form-group">
                                        <label>Respiratory Rate (/min)</label>
                                        <input type="number" id="respiratory-rate" min="0" max="100">
                                    </div>
                                    
                                    <div class="form-group">
                                        <label>O2 Saturation (%)</label>
                                        <input type="number" id="oxygen-saturation" min="0" max="100">
                                    </div>
                                </div>
                                
                                <div class="form-group">
                                    <label>Notes</label>
                                    <textarea id="notes" rows="3"></textarea>
                                </div>
                                
                                <div class="form-actions">
                                    <button type="submit" class="btn btn-primary">Save</button>
                                    <button type="button" class="btn btn-secondary" id="cancel-form-btn">Cancel</button>
                                </div>
                            </form>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    attachEventListeners() {
        const addVitalBtn = this.$('#add-vital-btn');
        const vitalForm = this.$('#vital-form');
        const cancelFormBtn = this.$('#cancel-form-btn');
        
        if (addVitalBtn) {
            addVitalBtn.addEventListener('click', () => {
                this.setState({ showForm: true, formError: null, formSuccess: null });
            });
        }
        
        if (vitalForm) {
            vitalForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
            
            // Clear field errors on input change
            if (Validators) {
                const inputs = vitalForm.querySelectorAll('input, textarea');
                inputs.forEach(input => {
                    input.addEventListener('input', () => {
                        Validators.clearFieldError(input);
                    });
                });
            }
        }
        
        if (cancelFormBtn) {
            cancelFormBtn.addEventListener('click', () => {
                this.setState({ showForm: false });
            });
        }
    }
    
    async handleFormSubmit(e) {
        e.preventDefault();
        
        const { patientId } = this.getState();
        
        // Clear previous errors
        if (Validators) {
            Validators.clearFormErrors(this.$('#vital-form'));
        }
        this.setState({ formError: null, formSuccess: null });
        
        const vitalData = {
            blood_pressure_systolic: this.$('#bp-systolic').value ? parseInt(this.$('#bp-systolic').value) : null,
            blood_pressure_diastolic: this.$('#bp-diastolic').value ? parseInt(this.$('#bp-diastolic').value) : null,
            heart_rate: this.$('#heart-rate').value ? parseInt(this.$('#heart-rate').value) : null,
            temperature: this.$('#temperature').value ? parseFloat(this.$('#temperature').value) : null,
            respiratory_rate: this.$('#respiratory-rate').value ? parseInt(this.$('#respiratory-rate').value) : null,
            oxygen_saturation: this.$('#oxygen-saturation').value ? parseFloat(this.$('#oxygen-saturation').value) : null,
            notes: this.$('#notes').value.trim()
        };
        
        // Client-side validation if validators are loaded
        if (Validators) {
            const validation = Validators.validateVitalSigns(vitalData);
            if (!validation.valid) {
                this.showVitalFieldErrors(validation.errors);
                return;
            }
        }
        
        this.setState({ formLoading: true, formError: null, formSuccess: null });
        
        const result = await apiService.addVitalSigns(patientId, vitalData);
        
        if (result.success) {
            this.setState({ 
                formLoading: false, 
                formSuccess: 'Vital signs added successfully!',
                showForm: false
            });
            
            // Reload patient data
            await this.loadPatientData();
        } else {
            // Handle validation errors from server
            if (result.data && result.data.errors) {
                this.showVitalFieldErrors(result.data.errors);
            } else {
                this.setState({ 
                    formLoading: false, 
                    formError: result.error || 'Failed to add vital signs'
                });
            }
        }
    }
    
    showVitalFieldErrors(errors) {
        this.setState({ formLoading: false });
        
        // Clear any previous errors first
        const vitalForm = this.$('#vital-form');
        if (vitalForm && Validators) {
            Validators.clearFormErrors(vitalForm);
        }
        
        // Display errors next to fields
        const fieldMap = {
            'blood_pressure_systolic': 'bp-systolic',
            'blood_pressure_diastolic': 'bp-diastolic',
            'blood_pressure': 'bp-systolic', // Logical validation error - show on systolic field
            'heart_rate': 'heart-rate',
            'temperature': 'temperature',
            'respiratory_rate': 'respiratory-rate',
            'oxygen_saturation': 'oxygen-saturation',
            'notes': 'notes'
        };
        
        // Track which fields have errors
        let errorCount = 0;
        const errorMessages = [];
        let generalError = null;
        
        for (const [fieldKey, errorMsg] of Object.entries(errors)) {
            // Handle general form-level errors
            if (fieldKey === 'general') {
                generalError = errorMsg;
                continue;
            }
            
            errorMessages.push(errorMsg);
            const inputId = fieldMap[fieldKey];
            if (inputId) {
                const inputElement = this.$(`#${inputId}`);
                if (inputElement && Validators) {
                    Validators.showFieldError(inputElement, errorMsg);
                    errorCount++;
                }
            }
        }
        
        // Show general error message at the top
        if (generalError) {
            this.setState({ formError: generalError });
        } else if (errorCount > 0) {
            const errorSummary = errorCount === 1 
                ? 'Please fix the validation error below.' 
                : `Please fix the ${errorCount} validation errors below.`;
            this.setState({ formError: errorSummary });
        }
    }
}

// Define custom element
customElements.define('vital-signs', VitalSigns);
