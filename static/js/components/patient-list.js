/**
 * Patient List Component - Display and manage patients
 */
import { BaseComponent } from './base-component.js';
import apiService from '../services/api-service.js';

class PatientList extends BaseComponent {
    constructor() {
        super();
        this.setState({
            patients: [],
            filteredPatients: [],
            loading: true,
            error: null,
            searchTerm: '',
            selectedPatient: null
        });
    }
    
    async connectedCallback() {
        super.connectedCallback();
        await this.loadPatients();
    }
    
    async loadPatients() {
        this.setState({ loading: true, error: null });
        
        const result = await apiService.getPatients();
        
        if (result.success) {
            const patients = result.data.patients || [];
            this.setState({
                patients,
                filteredPatients: patients,
                loading: false
            });
        } else {
            this.setState({
                loading: false,
                error: result.error
            });
        }
    }
    
    filterPatients(searchTerm) {
        const { patients } = this.getState();
        
        if (!searchTerm) {
            this.setState({ filteredPatients: patients, searchTerm: '' });
            return;
        }
        
        const term = searchTerm.toLowerCase();
        const filtered = patients.filter(patient => 
            patient.first_name.toLowerCase().includes(term) ||
            patient.last_name.toLowerCase().includes(term) ||
            patient.email?.toLowerCase().includes(term)
        );
        
        this.setState({ filteredPatients: filtered, searchTerm });
    }
    
    render() {
        const { filteredPatients, loading, error, searchTerm } = this.getState();
        
        this.shadowRoot.innerHTML = `
            ${this.getCommonStyles()}
            <style>
                .list-container {
                    background: white;
                    padding: 2rem;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }
                
                .list-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                    flex-wrap: wrap;
                    gap: 1rem;
                }
                
                .list-header h3 {
                    color: #1f2937;
                    margin: 0;
                }
                
                .search-box {
                    flex: 1;
                    max-width: 400px;
                }
                
                .search-box input {
                    width: 100%;
                    padding: 0.75rem;
                    border: 1px solid #d1d5db;
                    border-radius: 4px;
                    font-size: 1rem;
                }
                
                .patient-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 1rem;
                }
                
                .patient-table th {
                    background-color: #f9fafb;
                    padding: 0.75rem;
                    text-align: left;
                    font-weight: 600;
                    color: #374151;
                    border-bottom: 2px solid #e5e7eb;
                }
                
                .patient-table td {
                    padding: 0.75rem;
                    border-bottom: 1px solid #e5e7eb;
                }
                
                .patient-table tr:hover {
                    background-color: #f9fafb;
                }
                
                .actions {
                    display: flex;
                    gap: 0.5rem;
                }
                
                .btn-small {
                    padding: 0.5rem 1rem;
                    font-size: 0.875rem;
                }
                
                .empty-state {
                    text-align: center;
                    padding: 3rem;
                    color: #6b7280;
                }
            </style>
            
            <div class="list-container">
                <div class="list-header">
                    <h3>Patients (${filteredPatients.length})</h3>
                    <div class="search-box">
                        <input 
                            type="text" 
                            id="search-input" 
                            placeholder="Search patients..."
                            value="${searchTerm}"
                        >
                    </div>
                </div>
                
                ${error ? this.showError(error) : ''}
                ${loading ? this.showLoading() : ''}
                
                ${!loading && filteredPatients.length === 0 ? `
                    <div class="empty-state">
                        <p>No patients found</p>
                    </div>
                ` : ''}
                
                ${!loading && filteredPatients.length > 0 ? `
                    <table class="patient-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>DOB</th>
                                <th>Gender</th>
                                <th>Contact</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${filteredPatients.map(patient => `
                                <tr data-patient-id="${patient.id}">
                                    <td><strong>${patient.first_name} ${patient.last_name}</strong></td>
                                    <td>${patient.date_of_birth}</td>
                                    <td>${patient.gender}</td>
                                    <td>
                                        ${patient.phone ? `📞 ${patient.phone}<br>` : ''}
                                        ${patient.email ? `✉️ ${patient.email}` : ''}
                                    </td>
                                    <td class="actions">
                                        <button class="btn btn-primary btn-small view-vitals-btn" data-id="${patient.id}">
                                            Vitals
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                ` : ''}
            </div>
        `;
    }
    
    attachEventListeners() {
        const searchInput = this.$('#search-input');
        const vitalsBtns = this.$$('.view-vitals-btn');
        
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterPatients(e.target.value);
            });
        }
        
        vitalsBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const patientId = btn.getAttribute('data-id');
                this.emit('view-vitals', { patientId: parseInt(patientId) });
            });
        });
    }
}

// Define custom element
customElements.define('patient-list', PatientList);
