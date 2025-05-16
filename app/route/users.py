from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User
from app.utils.validators import validate_email, validate_password
from app import db
from app.models.property import SavedProperty, Property

users_bp = Blueprint('users', __name__)

@users_bp.route('/', methods=['GET'])
def get_users():
    """Get a list of all users"""
    try:
        # This is a placeholder - implement according to your data access pattern
        users = User.query.all()
        
        # Convert users to a list of dictionaries
        users_list = [user.to_dict() for user in users]
        
        return jsonify({
            'success': True,
            'users': users_list
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error retrieving users: {str(e)}'
        }), 500

@users_bp.route('/<int:user_id>', methods=['GET'])
def get_user(user_id):
    """Get a specific user by ID"""
    try:
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({
                'success': False,
                'message': f'User with ID {user_id} not found'
            }), 404
            
        return jsonify({
            'success': True,
            'user': user.to_dict()
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error retrieving user: {str(e)}'
        }), 500

@users_bp.route('/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    """Update a user's information"""
    try:
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({
                'success': False,
                'message': f'User with ID {user_id} not found'
            }), 404
            
        data = request.get_json()
        
        # Validate email if provided
        if 'email' in data:
            is_valid, error = validate_email(data['email'])
            if not is_valid:
                return jsonify({
                    'success': False,
                    'message': error
                }), 400
            user.email = data['email']
            
        # Add other fields to update as needed
        if 'first_name' in data:
            user.first_name = data['first_name']
            
        if 'last_name' in data:
            user.last_name = data['last_name']
            
        # Commit changes to database
        db.session.commit()
            
        return jsonify({
            'success': True,
            'message': 'User updated successfully',
            'user': user.to_dict()
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error updating user: {str(e)}'
        }), 500

@users_bp.route('/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    """Delete a user"""
    try:
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({
                'success': False,
                'message': f'User with ID {user_id} not found'
            }), 404
            
        # Delete the user
        db.session.delete(user)
        db.session.commit()
            
        return jsonify({
            'success': True,
            'message': 'User deleted successfully'
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error deleting user: {str(e)}'
        }), 500

@users_bp.route('/saved-properties', methods=['GET'])
@jwt_required()
def get_saved_properties():
    current_user_id = get_jwt_identity()
    
    saved = SavedProperty.query.filter_by(user_id=current_user_id).all()
    
    properties = []
    for saved_property in saved:
        property = Property.query.get(saved_property.property_id)
        if property:
            properties.append(property.to_dict())
    
    return jsonify({'properties': properties}), 200

@users_bp.route('/saved-properties/<int:prop_id>', methods=['POST'])
@jwt_required()
def save_property(prop_id):
    current_user_id = get_jwt_identity()
    
    # Check if property exists
    property = Property.query.get_or_404(prop_id)
    
    # Check if already saved
    if SavedProperty.query.filter_by(user_id=current_user_id, property_id=prop_id).first():
        return jsonify({'message': 'Property already saved'}), 400
    
    # Create new saved property
    saved = SavedProperty(user_id=current_user_id, property_id=prop_id)
    db.session.add(saved)
    db.session.commit()
    
    return jsonify({'message': 'Property saved successfully'}), 201

@users_bp.route('/saved-properties/<int:prop_id>', methods=['DELETE'])
@jwt_required()
def unsave_property(prop_id):
    current_user_id = get_jwt_identity()
    
    saved = SavedProperty.query.filter_by(
        user_id=current_user_id, 
        property_id=prop_id
    ).first_or_404()
    
    db.session.delete(saved)
    db.session.commit()
    
    return jsonify({'message': 'Property removed from saved list'}), 200

