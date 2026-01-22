from flask import Blueprint, request, jsonify
from app.services.patient_service import PatientService
from app.services.vital_service import VitalService
from app.api.decorators import token_required

patients_bp = Blueprint('patients', __name__)

@patients_bp.route('/patients', methods=['POST'])
@token_required
def create_patient(user_id):
    """
    Create a new patient
    Request body: {"first_name": "John", "last_name": "Doe", "date_of_birth": "1990-01-01", "gender": "Male", ...}
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        success, result = PatientService.create_patient(data)
        
        if success:
            return jsonify({
                'message': 'Patient created successfully',
                'patient': result
            }), 201
        else:
            # Check if result is a dict of field errors or a single error message
            if isinstance(result, dict):
                return jsonify({'errors': result}), 400
            else:
                return jsonify({'error': result}), 400
    
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500


@patients_bp.route('/patients', methods=['GET'])
@token_required
def get_patients(user_id):
    """
    Get all patients or search by name with pagination
    Query params: ?search=<name>&page=<num>&per_page=<num>
    """
    try:
        search_term = request.args.get('search', '').strip()
        
        # Get pagination parameters with validation
        try:
            page = int(request.args.get('page', 1))
            per_page = int(request.args.get('per_page', 10))
            
            # Validate parameters
            if page < 1:
                return jsonify({'error': 'Page must be >= 1'}), 400
            if per_page < 1 or per_page > 100:
                return jsonify({'error': 'Per page must be between 1 and 100'}), 400
                
        except ValueError:
            return jsonify({'error': 'Invalid pagination parameters'}), 400
        
        # Call service with pagination
        if search_term:
            success, result = PatientService.search_patients(search_term, page, per_page)
        else:
            success, result = PatientService.get_all_patients(page, per_page)
        
        if success:
            return jsonify(result), 200
        else:
            return jsonify({'error': result}), 400
    
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500


@patients_bp.route('/patients/<int:patient_id>', methods=['GET'])
@token_required
def get_patient(user_id, patient_id):
    """Get a specific patient by ID"""
    try:
        success, result = PatientService.get_patient_by_id(patient_id)
        
        if success:
            return jsonify({'patient': result}), 200
        else:
            return jsonify({'error': result}), 404
    
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500


@patients_bp.route('/patients/<int:patient_id>', methods=['PUT'])
@token_required
def update_patient(user_id, patient_id):
    """Update patient information"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        success, result = PatientService.update_patient(patient_id, data)
        
        if success:
            return jsonify({
                'message': 'Patient updated successfully',
                'patient': result
            }), 200
        else:
            # Check if result is a dict of field errors or a single error message
            if isinstance(result, dict):
                return jsonify({'errors': result}), 400
            else:
                return jsonify({'error': result}), 400
    
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500


@patients_bp.route('/patients/<int:patient_id>/vitals', methods=['POST'])
@token_required
def add_vital_signs(user_id, patient_id):
    """
    Add vital signs for a patient
    Request body: {"blood_pressure_systolic": 120, "blood_pressure_diastolic": 80, "temperature": 36.6, ...}
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        success, result = VitalService.add_vital_signs(patient_id, data)
        
        if success:
            return jsonify({
                'message': 'Vital signs added successfully',
                'vital': result
            }), 201
        else:
            # Check if result is a dict of field errors or a single error message
            if isinstance(result, dict):
                return jsonify({'errors': result}), 400
            else:
                return jsonify({'error': result}), 400
    
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500


@patients_bp.route('/patients/<int:patient_id>/vitals', methods=['GET'])
@token_required
def get_patient_vitals(user_id, patient_id):
    """
    Get all vital signs for a patient
    Query params: ?latest=true (to get only the most recent)
    """
    try:
        latest_only = request.args.get('latest', '').lower() == 'true'
        
        if latest_only:
            success, result = VitalService.get_latest_vitals(patient_id)
            if success:
                return jsonify({'vital': result}), 200
        else:
            success, result = VitalService.get_patient_vitals(patient_id)
            if success:
                return jsonify({'vitals': result}), 200
        
        return jsonify({'error': result}), 404 if not success else 200
    
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500


@patients_bp.route('/patients/<int:patient_id>/vitals/stats', methods=['GET'])
@token_required
def get_vital_statistics(user_id, patient_id):
    """Get vital signs statistics for a patient"""
    try:
        success, result = VitalService.get_vital_statistics(patient_id)
        
        if success:
            return jsonify({'statistics': result}), 200
        else:
            return jsonify({'error': result}), 404
    
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500
