/**
 * Main Application Entry Point
 * Initializes router and sets up routes
 */
import router from './router.js';

// Define routes
router.register('/', () => renderView('login'));
router.register('/login', () => renderView('login'));
router.register('/dashboard', () => renderView('dashboard'));
router.register('/patients', () => renderView('patients'));
router.register('/404', () => renderView('404'));

// Render view based on route
function renderView(viewName) {
    const mainContent = document.getElementById('main-content');
    
    switch (viewName) {
        case 'login':
            mainContent.innerHTML = '<dichir-login></dichir-login>';
            break;
            
        case 'dashboard':
            mainContent.innerHTML = '<dichir-dashboard></dichir-dashboard>';
            break;
            
        case 'patients':
            renderPatientsView();
            break;
            
        case '404':
            mainContent.innerHTML = `
                <div style="text-align: center; padding: 4rem;">
                    <h2>404 - Page Not Found</h2>
                    <p>The page you're looking for doesn't exist.</p>
                    <button onclick="window.location.hash='/dashboard'" style="margin-top: 1rem; padding: 0.75rem 1.5rem; background: #2563eb; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        Go to Dashboard
                    </button>
                </div>
            `;
            break;
    }
}

// Render patients view with list and form
function renderPatientsView() {
    const mainContent = document.getElementById('main-content');
    
    // Check if we should show form
    const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
    const action = urlParams.get('action');
    const patientId = urlParams.get('patientId');
    
    if (patientId) {
        // Show vital signs for specific patient
        mainContent.innerHTML = `
            <div style="padding: 2rem;">
                <button id="back-to-patients" style="margin-bottom: 1rem; padding: 0.5rem 1rem; background: #64748b; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    ← Back to Patients
                </button>
                <vital-signs patient-id="${patientId}"></vital-signs>
            </div>
        `;
        
        const backBtn = document.getElementById('back-to-patients');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                window.location.hash = '/patients';
            });
        }
    } else {
        mainContent.innerHTML = `
            <div style="padding: 2rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <h2 style="margin: 0;">Patient Management</h2>
                    <button id="toggle-form-btn" class="btn btn-primary">
                        ${action === 'new' ? 'Hide Form' : 'Add New Patient'}
                    </button>
                </div>
                
                <div id="patient-form-container" style="display: ${action === 'new' ? 'block' : 'none'}; margin-bottom: 2rem;">
                    <patient-form></patient-form>
                </div>
                
                <patient-list></patient-list>
            </div>
        `;
        
        // Setup event listeners
        const toggleBtn = document.getElementById('toggle-form-btn');
        const formContainer = document.getElementById('patient-form-container');
        const patientForm = document.querySelector('patient-form');
        const patientList = document.querySelector('patient-list');
        
        if (toggleBtn && formContainer) {
            toggleBtn.addEventListener('click', () => {
                const isVisible = formContainer.style.display === 'block';
                formContainer.style.display = isVisible ? 'none' : 'block';
                toggleBtn.textContent = isVisible ? 'Add New Patient' : 'Hide Form';
                
                if (!isVisible) {
                    window.location.hash = '/patients?action=new';
                } else {
                    window.location.hash = '/patients';
                }
            });
        }
        
        // Listen for patient created event
        if (patientForm) {
            patientForm.addEventListener('patient-created', () => {
                // Reload patient list
                if (patientList && patientList.loadPatients) {
                    patientList.loadPatients();
                }
                
                // Hide form after a delay
                setTimeout(() => {
                    if (formContainer) {
                        formContainer.style.display = 'none';
                    }
                    if (toggleBtn) {
                        toggleBtn.textContent = 'Add New Patient';
                    }
                    window.location.hash = '/patients';
                }, 2000);
            });
            
            patientForm.addEventListener('cancel', () => {
                formContainer.style.display = 'none';
                toggleBtn.textContent = 'Add New Patient';
                window.location.hash = '/patients';
            });
        }
        
        // Listen for view vitals event
        if (patientList) {
            patientList.addEventListener('view-vitals', (e) => {
                const { patientId } = e.detail;
                window.location.hash = `/patients?patientId=${patientId}`;
            });
        }
    }
}

// Initialize app
console.log('Dichir Medical Dashboard initialized');
