/**
 * BaseComponent - Abstract base class for Web Components
 * Provides common functionality for all custom elements
 */
export class BaseComponent extends HTMLElement {
    constructor() {
        super();
        
        // Attach shadow DOM
        this.attachShadow({ mode: 'open' });
        
        // Component state
        this._state = {};
        
        // Bind methods
        this.render = this.render.bind(this);
        this.setState = this.setState.bind(this);
    }
    
    /**
     * Lifecycle: Called when component is added to DOM
     */
    connectedCallback() {
        this.render();
        this.attachEventListeners();
    }
    
    /**
     * Lifecycle: Called when component is removed from DOM
     */
    disconnectedCallback() {
        this.cleanup();
    }
    
    /**
     * Get component state
     */
    getState() {
        return { ...this._state };
    }
    
    /**
     * Set component state and trigger re-render
     */
    setState(newState) {
        const oldState = { ...this._state };
        this._state = { ...this._state, ...newState };
        
        // Call state change hook
        this.onStateChange(oldState, this._state);
        
        // Re-render
        this.render();
        // Reattach event listeners after render
        this.attachEventListeners();
    }
    
    /**
     * Hook: Called when state changes (override in child classes)
     */
    onStateChange(oldState, newState) {
        // Override in child classes
    }
    
    /**
     * Render component (must be implemented in child classes)
     */
    render() {
        throw new Error('render() must be implemented in child class');
    }
    
    /**
     * Attach event listeners (override in child classes)
     */
    attachEventListeners() {
        // Override in child classes
    }
    
    /**
     * Cleanup (override in child classes)
     */
    cleanup() {
        // Override in child classes
    }
    
    /**
     * Helper: Query element in shadow DOM
     */
    $(selector) {
        return this.shadowRoot.querySelector(selector);
    }
    
    /**
     * Helper: Query all elements in shadow DOM
     */
    $$(selector) {
        return this.shadowRoot.querySelectorAll(selector);
    }
    
    /**
     * Helper: Dispatch custom event
     */
    emit(eventName, detail = {}) {
        this.dispatchEvent(new CustomEvent(eventName, {
            detail,
            bubbles: true,
            composed: true
        }));
    }
    
    /**
     * Helper: Show loading state
     */
    showLoading(message = 'Loading...') {
        const loadingHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <p>${message}</p>
            </div>
        `;
        return loadingHTML;
    }
    
    /**
     * Helper: Show error message
     */
    showError(message) {
        const errorHTML = `
            <div class="error-message">
                <p>❌ ${message}</p>
            </div>
        `;
        return errorHTML;
    }
    
    /**
     * Helper: Show success message
     */
    showSuccess(message) {
        const successHTML = `
            <div class="success-message">
                <p>✓ ${message}</p>
            </div>
        `;
        return successHTML;
    }
    
    /**
     * Helper: Get common styles for components
     */
    getCommonStyles() {
        return `
            <style>
                * {
                    box-sizing: border-box;
                    margin: 0;
                    padding: 0;
                }
                
                .loading {
                    text-align: center;
                    padding: 2rem;
                }
                
                .spinner {
                    border: 4px solid #f3f3f3;
                    border-top: 4px solid #2563eb;
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 1rem;
                }
                
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                .error-message {
                    background-color: #fee;
                    color: #c33;
                    padding: 1rem;
                    border-radius: 4px;
                    margin: 1rem 0;
                }
                
                .success-message {
                    background-color: #efe;
                    color: #3c3;
                    padding: 1rem;
                    border-radius: 4px;
                    margin: 1rem 0;
                }
                
                .btn {
                    padding: 0.75rem 1.5rem;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 1rem;
                    transition: all 0.3s;
                }
                
                .btn-primary {
                    background-color: #2563eb;
                    color: white;
                }
                
                .btn-primary:hover {
                    background-color: #1d4ed8;
                }
                
                .btn-secondary {
                    background-color: #64748b;
                    color: white;
                }
                
                .btn-secondary:hover {
                    background-color: #475569;
                }
                
                .form-group {
                    margin-bottom: 1rem;
                }
                
                .form-group label {
                    display: block;
                    margin-bottom: 0.5rem;
                    font-weight: 500;
                }
                
                .form-group input,
                .form-group select,
                .form-group textarea {
                    width: 100%;
                    padding: 0.75rem;
                    border: 1px solid #d1d5db;
                    border-radius: 4px;
                    font-size: 1rem;
                }
                
                .form-group input:focus,
                .form-group select:focus,
                .form-group textarea:focus {
                    outline: none;
                    border-color: #2563eb;
                    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
                }
            </style>
        `;
    }
}
