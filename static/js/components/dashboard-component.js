/**
 * Dashboard Component - Main dashboard view
 */
import { BaseComponent } from './base-component.js';
import apiService from '../services/api-service.js';

class DashboardComponent extends BaseComponent {
    constructor() {
        super();
        this.setState({
            stats: null,
            loading: true,
            error: null
        });
    }
    
    async connectedCallback() {
        super.connectedCallback();
        await this.loadDashboardData();
    }
    
    async loadDashboardData() {
        this.setState({ loading: true, error: null });
        
        const result = await apiService.getPatients();
        
        if (result.success) {
            const patients = result.data.patients || [];
            this.setState({
                stats: {
                    totalPatients: patients.length,
                    recentPatients: patients.slice(0, 5)
                },
                loading: false
            });
        } else {
            this.setState({
                loading: false,
                error: result.error
            });
        }
    }
    
    render() {
        const { stats, loading, error } = this.getState();
        
        this.shadowRoot.innerHTML = `
            ${this.getCommonStyles()}
            <style>
                .dashboard {
                    padding: 2rem;
                }
                
                .dashboard-header {
                    margin-bottom: 2rem;
                }
                
                .dashboard-header h2 {
                    color: #1f2937;
                    margin-bottom: 0.5rem;
                }
                
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 1.5rem;
                    margin-bottom: 2rem;
                }
                
                .stat-card {
                    background: white;
                    padding: 1.5rem;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }
                
                .stat-card h3 {
                    color: #6b7280;
                    font-size: 0.875rem;
                    margin-bottom: 0.5rem;
                }
                
                .stat-card .stat-value {
                    font-size: 2rem;
                    font-weight: bold;
                    color: #2563eb;
                }
                
                .quick-actions {
                    display: flex;
                    gap: 1rem;
                    flex-wrap: wrap;
                }
                
                .recent-section {
                    margin-top: 2rem;
                    background: white;
                    padding: 1.5rem;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }
                
                .recent-section h3 {
                    margin-bottom: 1rem;
                    color: #1f2937;
                }
                
                .patient-item {
                    padding: 0.75rem;
                    border-bottom: 1px solid #e5e7eb;
                }
                
                .patient-item:last-child {
                    border-bottom: none;
                }
                
                .patient-item:hover {
                    background-color: #f9fafb;
                }
            </style>
            
            <div class="dashboard">
                <div class="dashboard-header">
                    <h2>Dashboard</h2>
                    <p>Medical Dashboard Overview</p>
                </div>
                
                ${loading ? this.showLoading() : ''}
                ${error ? this.showError(error) : ''}
                
                ${stats ? `
                    <div class="stats-grid">
                        <div class="stat-card">
                            <h3>Total Patients</h3>
                            <div class="stat-value">${stats.totalPatients}</div>
                        </div>
                    </div>
                    
                    <div class="quick-actions">
                        <button class="btn btn-primary" id="new-patient-btn">
                            Add New Patient
                        </button>
                        <button class="btn btn-secondary" id="view-patients-btn">
                            View All Patients
                        </button>
                    </div>
                    
                    ${stats.recentPatients.length > 0 ? `
                        <div class="recent-section">
                            <h3>Recent Patients</h3>
                            ${stats.recentPatients.map(patient => `
                                <div class="patient-item">
                                    <strong>${patient.first_name} ${patient.last_name}</strong>
                                    <br>
                                    <small>${patient.gender} • DOB: ${patient.date_of_birth}</small>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                ` : ''}
            </div>
        `;
    }
    
    attachEventListeners() {
        const newPatientBtn = this.$('#new-patient-btn');
        const viewPatientsBtn = this.$('#view-patients-btn');
        
        if (newPatientBtn) {
            newPatientBtn.addEventListener('click', () => {
                window.location.hash = '/patients?action=new';
            });
        }
        
        if (viewPatientsBtn) {
            viewPatientsBtn.addEventListener('click', () => {
                window.location.hash = '/patients';
            });
        }
    }
}

// Define custom element
customElements.define('dichir-dashboard', DashboardComponent);
