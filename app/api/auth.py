from flask import Blueprint, request, jsonify
from app.services.auth_service import AuthService

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Login endpoint - authenticates user and returns JWT token
    Request body: {"username": "user", "password": "pass"}
    """
    try:
        data = request.get_json()
        
        # Validate input
        if not data or 'username' not in data or 'password' not in data:
            return jsonify({'error': 'Username and password are required'}), 400
        
        username = data['username']
        password = data['password']
        
        # Call service layer
        success, result = AuthService.login(username, password)
        
        if success:
            return jsonify(result), 200
        else:
            return jsonify({'error': result}), 401
    
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500


@auth_bp.route('/register', methods=['POST'])
def register():
    """
    Register endpoint - creates new user account
    Request body: {"username": "user", "email": "user@example.com", "password": "pass"}
    """
    try:
        data = request.get_json()
        
        # Validate input
        required_fields = ['username', 'email', 'password']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'{field} is required'}), 400
        
        username = data['username']
        email = data['email']
        password = data['password']
        
        # Call service layer
        success, result = AuthService.register_user(username, email, password)
        
        if success:
            return jsonify({
                'message': 'User registered successfully',
                'user': result
            }), 201
        else:
            # Check if result is a dict of field errors or a single error message
            if isinstance(result, dict):
                return jsonify({'errors': result}), 400
            else:
                return jsonify({'error': result}), 400
    
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500
