from functools import wraps
from flask import request, jsonify
from app.services.auth_service import AuthService

def token_required(f):
    """Decorator to protect routes with JWT authentication"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Get token from Authorization header
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]  # Bearer <token>
            except IndexError:
                return jsonify({'error': 'Invalid token format'}), 401
        
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        # Verify token
        success, result = AuthService.verify_token(token)
        if not success:
            return jsonify({'error': result}), 401
        
        # Pass user_id to the route
        return f(user_id=result, *args, **kwargs)
    
    return decorated
