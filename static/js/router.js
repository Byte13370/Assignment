/**
 * Router - Simple hash-based routing for SPA
 */
import apiService from './services/api-service.js';

class Router {
    constructor() {
        this.routes = {};
        this.currentRoute = null;
        
        // Listen to hash changes
        window.addEventListener('hashchange', () => this.handleRoute());
        window.addEventListener('load', () => this.handleRoute());
    }
    
    /**
     * Register a route
     */
    register(path, handler) {
        this.routes[path] = handler;
    }
    
    /**
     * Navigate to a route
     */
    navigate(path) {
        window.location.hash = path;
    }
    
    /**
     * Handle route change
     */
    async handleRoute() {
        const hash = window.location.hash.slice(1) || '/';
        
        // Split path from query string
        const [pathPart, queryPart] = hash.split('?');
        const [path, ...params] = pathPart.split('/').filter(Boolean);
        
        // Check authentication for protected routes
        const publicRoutes = ['', 'login', 'register'];
        const isPublicRoute = publicRoutes.includes(path);
        
        if (!isPublicRoute && !apiService.isAuthenticated()) {
            this.navigate('/login');
            return;
        }
        
        if (isPublicRoute && apiService.isAuthenticated() && path !== 'register') {
            this.navigate('/dashboard');
            return;
        }
        
        // Update navigation visibility
        this.updateNavigation();
        
        // Find and execute route handler
        const routePath = `/${path || ''}`;
        const handler = this.routes[routePath] || this.routes['/404'];
        
        if (handler) {
            this.currentRoute = routePath;
            await handler(params);
        }
    }
    
    /**
     * Update navigation visibility based on authentication
     */
    updateNavigation() {
        const nav = document.getElementById('main-nav');
        const logoutBtn = document.getElementById('logout-btn');
        
        if (apiService.isAuthenticated()) {
            nav.style.display = 'flex';
            
            // Setup logout handler
            if (logoutBtn && !logoutBtn.hasAttribute('data-listener')) {
                logoutBtn.setAttribute('data-listener', 'true');
                logoutBtn.addEventListener('click', () => {
                    apiService.logout();
                    this.navigate('/login');
                });
            }
        } else {
            nav.style.display = 'none';
        }
    }
    
    /**
     * Get current route
     */
    getCurrentRoute() {
        return this.currentRoute;
    }
}

// Export singleton instance
const router = new Router();
export default router;
