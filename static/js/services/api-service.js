/**
 * ApiService - Singleton pattern for handling all HTTP requests
 * Manages JWT token and Authorization headers automatically
 */
class ApiService {
    constructor() {
        if (ApiService.instance) {
            return ApiService.instance;
        }
        
        this.baseURL = '/api';
        this.token = localStorage.getItem('token') || null;
        
        ApiService.instance = this;
    }
    
    /**
     * Set authentication token
     */
    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
    }
    
    /**
     * Get authentication token
     */
    getToken() {
        return this.token;
    }
    
    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return !!this.token;
    }
    
    /**
     * Clear authentication
     */
    clearAuth() {
        this.token = null;
        localStorage.removeItem('token');
    }
    
    /**
     * Get default headers with authorization
     */
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        
        return headers;
    }
    
    /**
     * Generic fetch method with error handling
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            ...options,
            headers: {
                ...this.getHeaders(),
                ...options.headers
            }
        };
        
        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || `HTTP ${response.status}`);
            }
            
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    /**
     * GET request
     */
    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }
    
    /**
     * POST request
     */
    async post(endpoint, body) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(body)
        });
    }
    
    /**
     * PUT request
     */
    async put(endpoint, body) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body)
        });
    }
    
    /**
     * DELETE request
     */
    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
    
    // API Methods
    
    /**
     * Login user
     */
    async login(username, password) {
        const result = await this.post('/login', { username, password });
        if (result.success && result.data.token) {
            this.setToken(result.data.token);
        }
        return result;
    }
    
    /**
     * Register new user
     */
    async register(username, email, password) {
        return this.post('/register', { username, email, password });
    }
    
    /**
     * Logout user
     */
    logout() {
        this.clearAuth();
    }
    
    /**
     * Get all patients
     */
    async getPatients(searchTerm = '') {
        const endpoint = searchTerm ? `/patients?search=${encodeURIComponent(searchTerm)}` : '/patients';
        return this.get(endpoint);
    }
    
    /**
     * Get patient by ID
     */
    async getPatient(patientId) {
        return this.get(`/patients/${patientId}`);
    }
    
    /**
     * Create new patient
     */
    async createPatient(patientData) {
        return this.post('/patients', patientData);
    }
    
    /**
     * Update patient
     */
    async updatePatient(patientId, patientData) {
        return this.put(`/patients/${patientId}`, patientData);
    }
    
    /**
     * Add vital signs for patient
     */
    async addVitalSigns(patientId, vitalData) {
        return this.post(`/patients/${patientId}/vitals`, vitalData);
    }
    
    /**
     * Get patient vital signs
     */
    async getPatientVitals(patientId, latestOnly = false) {
        const endpoint = latestOnly 
            ? `/patients/${patientId}/vitals?latest=true`
            : `/patients/${patientId}/vitals`;
        return this.get(endpoint);
    }
    
    /**
     * Get vital signs statistics
     */
    async getVitalStatistics(patientId) {
        return this.get(`/patients/${patientId}/vitals/stats`);
    }
}

// Export singleton instance
const apiService = new ApiService();
export default apiService;
