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
            selectedPatient: null,
            pagination: {
                page: 1,
                per_page: 10,
                total: 0,
                pages: 0,
                has_next: false,
                has_prev: false
            }
        });
    }
    
    async connectedCallback() {
        super.connectedCallback();
        await this.loadPatients();
    }
    
    async loadPatients(page = 1) {
        this.setState({ loading: true, error: null });
        
        const { searchTerm, pagination } = this.getState();
        const params = {
            page,
            per_page: pagination.per_page
        };
        
        if (searchTerm) {
            params.search = searchTerm;
        }
        
        const result = await apiService.getPatients(params);
        
        if (result.success) {
            const data = result.data;
            this.setState({
                patients: data.patients || [],
                filteredPatients: data.patients || [],
                pagination: data.pagination || pagination,
                loading: false
            });
        } else {
            this.setState({
                loading: false,
                error: result.error
            });
        }
    }
    
    async filterPatients(searchTerm) {
        this.setState({ searchTerm });
        await this.loadPatients(1); // Reset to first page when searching
    }
    
    render() {
        const { filteredPatients, loading, error, searchTerm, pagination } = this.getState();
        
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
                
                .pagination {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 1.5rem;
                    padding-top: 1rem;
                    border-top: 1px solid #e5e7eb;
                }
                
                .pagination-info {
                    color: #6b7280;
                    font-size: 0.875rem;
                }
                
                .pagination-controls {
                    display: flex;
                    gap: 0.5rem;
                    align-items: center;
                }
                
                .pagination-controls button {
                    padding: 0.5rem 1rem;
                    border: 1px solid #d1d5db;
                    background: white;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 0.875rem;
                }
                
                .pagination-controls button:hover:not(:disabled) {
                    background-color: #f9fafb;
                }
                
                .pagination-controls button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                
                .pagination-controls .page-info {
                    padding: 0.5rem 1rem;
                    font-weight: 600;
                    color: #374151;
                }
            </style>
            
            <div class="list-container">
                <div class="list-header">
                    <h3>Patients (${pagination.total})</h3>
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
                    
                    ${pagination.pages > 1 ? `
                        <div class="pagination">
                            <div class="pagination-info">
                                Showing ${((pagination.page - 1) * pagination.per_page) + 1} to ${Math.min(pagination.page * pagination.per_page, pagination.total)} of ${pagination.total}
                            </div>
                            <div class="pagination-controls">
                                <button id="prev-btn" ${!pagination.has_prev ? 'disabled' : ''}>Previous</button>
                                <span class="page-info">Page ${pagination.page} of ${pagination.pages}</span>
                                <button id="next-btn" ${!pagination.has_next ? 'disabled' : ''}>Next</button>
                            </div>
                        </div>
                    ` : ''}
                ` : ''}
            </div>
        `;
    }
    
    attachEventListeners() {
        const searchInput = this.$('#search-input');
        const vitalsBtns = this.$$('.view-vitals-btn');
        const prevBtn = this.$('#prev-btn');
        const nextBtn = this.$('#next-btn');
        
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterPatients(e.target.value);
            });
        }
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                const { pagination } = this.getState();
                if (pagination.has_prev) {
                    this.loadPatients(pagination.page - 1);
                }
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                const { pagination } = this.getState();
                if (pagination.has_next) {
                    this.loadPatients(pagination.page + 1);
                }
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
