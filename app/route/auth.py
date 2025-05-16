from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from app import db
from app.models.user import User, Profile, UserAccountSwitch
from app.utils.validators import validate_email, validate_password
from werkzeug.utils import secure_filename
from flask import current_app
import os
import json

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Validate required fields
    if not all(k in data for k in ('email', 'password', 'user_type')):
        return jsonify({'message': 'Missing required fields'}), 400
    
    # Validate email format and password strength...
    
    # Process user_type to ensure it's in the correct format
    user_type = data['user_type']
    if isinstance(user_type, str):
        user_type = [user_type]
    
    # Set active_user_type to the requested user_type
    active_user_type = user_type[0] if user_type else 'property_seeker'
    
    # Check if user already exists with the same email AND active_user_type
    existing_user = User.query.filter_by(
        email=data['email'],
        active_user_type=active_user_type
    ).first()
    
    if existing_user:
        user_type_display = active_user_type.replace('_', ' ').title()
        return jsonify({'message': f'This email is already registered as a {user_type_display}'}), 409
    
    # Check if user exists with any role
    any_user = User.query.filter_by(email=data['email']).first()
    
    if any_user:
        # User exists with a different role - update their roles
        existing_types = any_user.user_type
        
        # Handle different formats of user_type
        if isinstance(existing_types, str):
            existing_types = [existing_types]
        elif not isinstance(existing_types, list):
            existing_types = []
        
        # Add the new role if it doesn't exist
        if active_user_type not in existing_types:
            existing_types.append(active_user_type)
        
        # Update the user with the new role and active role
        any_user.user_type = existing_types
        any_user.active_user_type = active_user_type
        db.session.commit()
        
        # Generate tokens for the existing user
        access_token = create_access_token(identity=str(any_user.user_id))
        refresh_token = create_refresh_token(identity=str(any_user.user_id))
        
        return jsonify({
            'message': 'Account role added successfully',
            'user': any_user.to_dict(),
            'access_token': access_token,
            'refresh_token': refresh_token
        }), 200
    else:
        # Create new user
        user = User(
            email=data['email'],
            user_type=user_type,
            active_user_type=active_user_type
        )
        user.set_password(data['password'])
        
        # Create user profile
        profile = Profile(
            user=user,
            full_name=data.get('full_name', ''),
            phone_number=data.get('phone_number', ''),
            company_name=data.get('company_name', '')
        )
        
        db.session.add(user)
        db.session.add(profile)
        db.session.commit()
        
        # Generate tokens
        access_token = create_access_token(identity=str(user.user_id))
        refresh_token = create_refresh_token(identity=str(user.user_id))
        
        return jsonify({
            'message': 'User registered successfully',
            'user': user.to_dict(),
            'access_token': access_token,
            'refresh_token': refresh_token
        }), 201
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data or not all(k in data for k in ('email', 'password')):
        return jsonify({'message': 'Missing email or password'}), 400
    
    # Check for user_type in the request
    user_type = data.get('user_type')
    
    # If user_type is provided, try to find that specific account
    if user_type:
        user = User.query.filter_by(email=data['email'], active_user_type=user_type).first()
        if not user or not user.check_password(data['password']):
            return jsonify({'message': 'Invalid email or password'}), 401
    else:
        # If no user_type specified, find all users with this email
        users = User.query.filter_by(email=data['email']).all()
        
        if len(users) > 1:
            # Multiple accounts found - ask user to specify which one
            user_types = []
            for user in users:
                if hasattr(user, 'get_user_types'):
                    types = user.get_user_types()
                else:
                    types = user.user_type if isinstance(user.user_type, list) else [user.user_type]
                
                for type in types:
                    if type and type not in user_types:
                        user_types.append(type)
            
            return jsonify({
                'message': 'Multiple accounts found with this email',
                'user_types': user_types,
                'require_user_type': True
            }), 400
        
        # Single account or no account
        user = users[0] if users else None
        if not user or not user.check_password(data['password']):
            return jsonify({'message': 'Invalid email or password'}), 401
    
    # Generate tokens
    access_token = create_access_token(identity=str(user.user_id))
    refresh_token = create_refresh_token(identity=str(user.user_id))
    
    return jsonify({
        'message': 'Login successful',
        'user': user.to_dict(),
        'access_token': access_token,
        'refresh_token': refresh_token
    }), 200

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    current_user_id = get_jwt_identity()
    access_token = create_access_token(identity=str(current_user_id))

    return jsonify({
        'access_token': access_token
    }), 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_user_info():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    # Get user data with properly formatted user_type
    user_data = user.to_dict()
    
    # Add profile data if available
    if user.profile:
        user_data['profile'] = user.profile.to_dict()
    
    return jsonify(user_data), 200

@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user or not user.profile:
        return jsonify({'message': 'User or profile not found'}), 404

    profile = user.profile

    # Support form-data or JSON
    form = request.form if request.content_type.startswith('multipart/form-data') else request.json
    file = request.files.get('profile_image') if 'profile_image' in request.files else None

    # Update profile fields
    if 'full_name' in form:
        profile.full_name = form.get('full_name')
    if 'phone_number' in form:
        profile.phone_number = form.get('phone_number')
    if 'address' in form:
        profile.address = form.get('address')
    if 'bio' in form:
        profile.bio = form.get('bio')
    if 'occupation' in form:
        profile.occupation = form.get('occupation')
    if 'parish' in form:
        profile.parish = form.get('parish')
    if 'company_name' in form and hasattr(profile, 'company_name'):
        profile.company_name = form.get('company_name')

    # Preferences as JSON (if sent)
    if 'preferences' in form:
        import json
        try:
            if isinstance(form.get('preferences'), str):
                profile.preferences = json.loads(form.get('preferences'))
            else:
                profile.preferences = form.get('preferences')
        except json.JSONDecodeError:
            return jsonify({'message': 'Invalid preferences format'}), 400

    # Save profile image if provided
    if file:
        filename = secure_filename(file.filename)
        upload_folder = os.path.join(current_app.root_path, 'static/uploads/profiles')
        os.makedirs(upload_folder, exist_ok=True)
        filepath = os.path.join(upload_folder, filename)
        file.save(filepath)
        profile.profile_image = f'/static/uploads/profiles/{filename}'
    elif 'profile_image_url' in form:
        profile.profile_image = form.get('profile_image_url')

    db.session.commit()

    # Return complete user data including updated profile
    user_data = user.to_dict()
    if user.profile:
        user_data['profile'] = user.profile.to_dict()

    return jsonify({'message': 'Profile updated successfully', 'user': user_data}), 200

@auth_bp.route('/switch-account', methods=['POST'])
@jwt_required()
def switch_account():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json()
    requested_role = data.get('user_type')

    valid_roles = user.user_type if isinstance(user.user_type, list) else [user.user_type]

    if requested_role not in valid_roles:
        return jsonify({"error": "Requested role is not assigned to the user."}), 403

    user.active_user_type = requested_role
    db.session.commit()

    access_token = create_access_token(identity=current_user_id)
    refresh_token = create_refresh_token(identity=current_user_id)

    return jsonify({
        "message": "Account switched successfully",
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user": user.to_dict()
    }), 200