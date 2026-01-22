import jwt
from datetime import datetime, timedelta
from flask import current_app
from app.models.user import User
from app import db_session

class AuthService:
    """Authentication Service - Business Logic Layer"""
    
    @staticmethod
    def login(username, password):
        """
        Authenticate user and generate JWT token
        Returns: (success: bool, result: dict or error_message: str)
        """
        try:
            # Find user by username
            user = db_session.query(User).filter_by(username=username).first()
            
            if not user:
                return False, "Invalid username or password"
            
            # Verify password
            if not user.check_password(password):
                return False, "Invalid username or password"
            
            # Generate JWT token
            token = AuthService.generate_token(user.id)
            
            return True, {
                'token': token,
                'user': user.to_dict()
            }
        except Exception as e:
            return False, f"Login error: {str(e)}"
    
    @staticmethod
    def generate_token(user_id):
        """Generate JWT token for user"""
        expiration = datetime.utcnow() + timedelta(
            hours=current_app.config.get('JWT_EXPIRATION_HOURS', 24)
        )
        
        payload = {
            'user_id': user_id,
            'exp': expiration,
            'iat': datetime.utcnow()
        }
        
        token = jwt.encode(
            payload,
            current_app.config['SECRET_KEY'],
            algorithm='HS256'
        )
        
        return token
    
    @staticmethod
    def verify_token(token):
        """
        Verify JWT token and extract user_id
        Returns: (success: bool, user_id: int or error_message: str)
        """
        try:
            payload = jwt.decode(
                token,
                current_app.config['SECRET_KEY'],
                algorithms=['HS256']
            )
            return True, payload['user_id']
        except jwt.ExpiredSignatureError:
            return False, "Token has expired"
        except jwt.InvalidTokenError:
            return False, "Invalid token"
    
    @staticmethod
    def register_user(username, email, password):
        """
        Register a new user
        Returns: (success: bool, user_dict or error_message: str)
        """
        try:
            # Check if username already exists
            existing_user = db_session.query(User).filter_by(username=username).first()
            if existing_user:
                return False, "Username already exists"
            
            # Check if email already exists
            existing_email = db_session.query(User).filter_by(email=email).first()
            if existing_email:
                return False, "Email already registered"
            
            # Create new user
            user = User(username=username, email=email)
            user.set_password(password)
            
            db_session.add(user)
            db_session.commit()
            
            return True, user.to_dict()
        except Exception as e:
            db_session.rollback()
            return False, f"Registration error: {str(e)}"
