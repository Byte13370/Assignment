/**
 * Login Component - Handles user authentication
 */
import { BaseComponent } from './base-component.js';
import apiService from '../services/api-service.js';
import router from '../router.js';

// Load validators dynamically
let Validators;
try {
    const module = await import('../utils/validators.js');
    Validators = module.default || window.Validators;
} catch (e) {
    console.warn('Validators module not loaded', e);
}

class LoginComponent extends BaseComponent {
    constructor() {
        super();
        this.setState({
            error: null,
            loading: false,
            showRegister: false
        });
    }
    
    render() {
        const { error, loading, showRegister } = this.getState();
        
        this.shadowRoot.innerHTML = `
            ${this.getCommonStyles()}
            <style>
                .login-container {
                    max-width: 400px;
                    margin: 4rem auto;
                    padding: 2rem;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                }
                
                .login-header {
                    text-align: center;
                    margin-bottom: 2rem;
                }
                
                .login-header h2 {
                    color: #1f2937;
                    margin-bottom: 0.5rem;
                }
                
                .login-header p {
                    color: #6b7280;
                }
                
                .toggle-form {
                    text-align: center;
                    margin-top: 1rem;
                }
                
                .toggle-form button {
                    background: none;
                    border: none;
                    color: #2563eb;
                    cursor: pointer;
                    text-decoration: underline;
                }
                
                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                }
            </style>
            
            <div class="login-container">
                <div class="login-header">
                    <h2>${showRegister ? 'Create Account' : 'Welcome Back'}</h2>
                    <p>${showRegister ? 'Register for Dichir' : 'Login to Dichir Medical Dashboard'}</p>
                </div>
                
                ${error ? this.showError(error) : ''}
                ${loading ? this.showLoading('Authenticating...') : ''}
                
                <form id="auth-form">
                    ${showRegister ? `
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" id="email" required>
                        </div>
                    ` : ''}
                    
                    <div class="form-group">
                        <label>Username</label>
                        <input type="text" id="username" required>
                    </div>
                    
                    <div class="form-group">
                        <label>Password</label>
                        <input type="password" id="password" required>
                    </div>
                    
                    ${showRegister ? `
                        <div class="form-group">
                            <label>Confirm Password</label>
                            <input type="password" id="confirm-password" required>
                        </div>
                    ` : ''}
                    
                    <button type="submit" class="btn btn-primary" style="width: 100%;">
                        ${showRegister ? 'Register' : 'Login'}
                    </button>
                </form>
                
                <div class="toggle-form">
                    <p>
                        ${showRegister ? 'Already have an account?' : "Don't have an account?"}
                        <button id="toggle-btn">
                            ${showRegister ? 'Login' : 'Register'}
                        </button>
                    </p>
                </div>
            </div>
        `;
    }
    
    attachEventListeners() {
        const form = this.$('#auth-form');
        const toggleBtn = this.$('#toggle-btn');
        
        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        }
        
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                this.setState({
                    showRegister: !this.getState().showRegister,
                    error: null
                });
            });
        }
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        const { showRegister } = this.getState();
        const username = this.$('#username').value.trim();
        const password = this.$('#password').value;
        
        // Validation
        if (!username || !password) {
            this.setState({ error: 'Please fill in all fields' });
            return;
        }
        
        if (showRegister) {
            await this.handleRegister(username, password);
        } else {
            await this.handleLogin(username, password);
        }
    }
    
    async handleLogin(username, password) {
        this.setState({ loading: true, error: null });
        
        const result = await apiService.login(username, password);
        
        if (result.success) {
            // Navigate to dashboard
            router.navigate('/dashboard');
        } else {
            this.setState({ 
                loading: false, 
                error: result.error || 'Login failed'
            });
        }
    }
    
    async handleRegister(username, password) {
        const email = this.$('#email').value.trim();
        const confirmPassword = this.$('#confirm-password').value;
        
        // Validation
        if (!email) {
            this.setState({ error: 'Email is required' });
            return;
        }
        
        // Use validators if available
        if (Validators) {
            const usernameValidation = Validators.validateUsername(username);
            if (!usernameValidation.valid) {
                this.setState({ error: usernameValidation.error });
                return;
            }
            
            const emailValidation = Validators.validateEmail(email, true);
            if (!emailValidation.valid) {
                this.setState({ error: emailValidation.error });
                return;
            }
            
            const passwordValidation = Validators.validatePassword(password);
            if (!passwordValidation.valid) {
                this.setState({ error: passwordValidation.error });
                return;
            }
        }
        
        if (password !== confirmPassword) {
            this.setState({ error: 'Passwords do not match' });
            return;
        }
        
        this.setState({ loading: true, error: null });
        
        const result = await apiService.register(username, email, password);
        
        if (result.success) {
            // Auto-login after registration
            await this.handleLogin(username, password);
        } else {
            // Handle validation errors from server
            if (result.data && result.data.errors) {
                const errors = result.data.errors;
                const errorMessages = Object.values(errors).join(', ');
                this.setState({ 
                    loading: false, 
                    error: errorMessages
                });
            } else {
                this.setState({ 
                    loading: false, 
                    error: result.error || 'Registration failed'
                });
            }
        }
    }
}

// Define custom element
customElements.define('dichir-login', LoginComponent);
