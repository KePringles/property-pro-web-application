# app/route/properties.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import os
import json
from datetime import datetime
from werkzeug.utils import secure_filename
from app import db, create_app
from app.models.property import Property, PropertyImage, PropertyType, Parish, Amenity, UserPropertyInteraction
from app.models.user import User
from sqlalchemy import desc, or_, func
import random
import math


# Create blueprint without url_prefix
properties_bp = Blueprint('properties', __name__)

# Safe conversion helpers
def safe_float(value):
    try:
        return float(value.strip()) if value and value.strip() else None
    except (ValueError, AttributeError):
        return None

def safe_int(value):
    try:
        return int(value.strip()) if value and value.strip() else None
    except (ValueError, AttributeError):
        return None

# Helper function to save uploaded images
def save_property_image(file, prop_id):
    app = create_app()
    
    if file.filename == '':
        return None
        
    upload_dir = os.path.join(app.config['UPLOAD_FOLDER'], 'property_images')
    os.makedirs(upload_dir, exist_ok=True)

    filename = secure_filename(f"{prop_id}_{file.filename}")
    file_path = os.path.join(upload_dir, filename)

    # Create directory if it doesn't exist
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    
    file.save(file_path)
    
    # Return the relative URL to access the image
    return f"/uploads/property_images/{filename}"

@properties_bp.route('/<int:prop_id>', methods=['GET'])
@jwt_required(optional=True)  # This allows anonymous users too
def get_property(prop_id):
    property = Property.query.get_or_404(prop_id)
    
    user_id = get_jwt_identity()
    
    if user_id:
        from app.models.property import UserPropertyInteraction

        interaction = UserPropertyInteraction.query.filter_by(
            user_id=user_id, 
            prop_id=prop_id
        ).first()

        if interaction:
            interaction.view_count += 1
            interaction.last_viewed = datetime.utcnow()
        else:
            interaction = UserPropertyInteraction(
                user_id=user_id,
                prop_id=prop_id,
                view_count=1,
                last_viewed=datetime.utcnow()
            )
            db.session.add(interaction)

        db.session.commit()

    return jsonify(property.to_dict(include_owner=True)), 200

# Create property
# Create property
@properties_bp.route('/', methods=['POST', 'OPTIONS'])
@properties_bp.route('', methods=['POST', 'OPTIONS'])
@jwt_required(optional=True)
def create_property():
    if request.method == 'OPTIONS':
        return '', 200

    print("=== REQUEST FORM ===")
    print(request.form)
    print("Raw JSON body:", request.get_json(silent=True))  # will be None for form-data

    try:
        current_user_id = get_jwt_identity()
        print("User ID from JWT:", current_user_id) 

        if request.method == 'POST':
            if not current_user_id:
                return jsonify({'message': 'Authentication required'}), 401

            user = User.query.get(current_user_id)
            if not user:
                return jsonify({'message': 'User not found'}), 404

            # Get the user_type and normalize it for better compatibility
            user_type = user.user_type
            print("Original user_type:", user_type, "Type:", type(user_type).__name__)
            
            # Handle various formats of user_type that might come from frontend
            normalized_user_type = None
            
            # Case 1: String format
            if isinstance(user_type, str):
                # Handle potential JSON string format
                if '[' in user_type or '{' in user_type:
                    try:
                        import json
                        parsed = json.loads(user_type)
                        if isinstance(parsed, list) and len(parsed) > 0:
                            normalized_user_type = str(parsed[0])
                        elif isinstance(parsed, str):
                            normalized_user_type = parsed
                        else:
                            normalized_user_type = str(parsed)
                    except:
                        # If parsing fails, clean up the string manually
                        normalized_user_type = user_type.replace('[', '').replace(']', '').replace('"', '').strip()
                else:
                    normalized_user_type = user_type
            
            # Case 2: List format
            elif isinstance(user_type, list) and len(user_type) > 0:
                normalized_user_type = str(user_type[0])
            
            # Case 3: Other formats - try string conversion
            else:
                normalized_user_type = str(user_type)
            
            # Check for common variations of property_owner and agent
            is_authorized = False
            
            if normalized_user_type:
                normalized_user_type = normalized_user_type.lower()
                if 'owner' in normalized_user_type or normalized_user_type == 'property_owner':
                    is_authorized = True
                elif 'agent' in normalized_user_type or normalized_user_type == 'agent':
                    is_authorized = True
            
            print("Normalized user_type:", normalized_user_type, "Is authorized:", is_authorized)
            
            # Check if user is authorized
            if not is_authorized:
                return jsonify({'message': 'Only property owners and agents can create listings'}), 403

            # Rest of your existing function
            data = request.form.to_dict()
            print("Form keys received:", list(data.keys()))

            required_fields = ['title', 'price', 'property_type_id', 'parish_id']
            for field in required_fields:
                if field not in data:
                    return jsonify({'message': f'Missing required field: {field}'}), 400

            price = safe_float(data.get('price')) or 0
            property_type_id = safe_int(data.get('property_type_id'))
            parish_id = safe_int(data.get('parish_id'))
            bedrooms = safe_int(data.get('bedrooms'))
            bathrooms = safe_float(data.get('bathrooms'))
            area_sqft = safe_float(data.get('area_sqft'))
            latitude = safe_float(data.get('latitude'))
            longitude = safe_float(data.get('longitude'))
            monthly_rent = safe_float(data.get('monthly_rent'))

            if not property_type_id or not parish_id:
                return jsonify({'message': 'Invalid property_type_id or parish_id'}), 422

            # Set the owner and agent IDs based on normalized user type
            owner_id = None
            agent_id = None
            
            if 'owner' in normalized_user_type:
                owner_id = current_user_id
                # If the owner specifies an agent
                if 'agent_id' in data and data.get('agent_id'):
                    agent_id = safe_int(data.get('agent_id'))
            elif 'agent' in normalized_user_type:
                agent_id = current_user_id
                # If the agent specifies an owner
                if 'owner_id' in data and data.get('owner_id'):
                    owner_id = safe_int(data.get('owner_id'))
            
            # Get status or default to 'Active'
            status = data.get('status', 'Active')

            property = Property(
                title=data['title'],
                description=data.get('description', ''),
                price=price,
                property_type_id=property_type_id,
                bedrooms=bedrooms,
                bathrooms=bathrooms,
                area_sqft=area_sqft,
                address=data.get('address', ''),
                city=data.get('city', ''),
                parish_id=parish_id,
                latitude=latitude,
                longitude=longitude,
                is_for_sale=data.get('is_for_sale', 'true').lower() == 'true',
                is_for_rent=data.get('is_for_rent', 'false').lower() == 'true',
                monthly_rent=monthly_rent,
                owner_id=owner_id,
                agent_id=agent_id,
                contact_phone=data.get('contact_phone', ''),
                contact_email=data.get('contact_email', ''),
                listing_url=data.get('listing_url', ''),
                status=status  # Add status field
            )

            try:
                db.session.add(property)
                db.session.flush()
            except Exception as e:
                db.session.rollback()
                print("Error adding property to database:", str(e))
                return jsonify({'message': f'Database error: {str(e)}'}), 422

            # Process standard amenities
            # Process amenities safely (mixed IDs and names)
            raw_amenities = request.form.getlist('amenities')
            standard_ids = []
            custom_names = []

            for a in raw_amenities:
                try:
                    standard_ids.append(int(a))
                except ValueError:
                    custom_names.append(a.strip())

            # Attach standard amenities
            if standard_ids:
                standard_amenities = Amenity.query.filter(Amenity.amen_id.in_(standard_ids)).all()
                property.amenities = standard_amenities

            # Attach custom amenities
            for name in custom_names:
                if not name:
                    continue  # Fixed indentation here
                
                # Check if amenity already exists
                existing_amenity = Amenity.query.filter(func.lower(Amenity.name) == func.lower(name)).first()
                if existing_amenity:
                    property.amenities.append(existing_amenity)
                else:
                    new_amenity = Amenity(name=name)
                    db.session.add(new_amenity)
                    db.session.flush()
                    property.amenities.append(new_amenity)

            images = request.files.getlist('images')
            print(f"Processing {len(images)} images")
            try:
                for i, image_file in enumerate(images):
                    if image_file.filename:
                        print(f"Processing image {i+1}: {image_file.filename}")
                        image_url = save_property_image(image_file, property.prop_id)
                        if image_url:
                            property_image = PropertyImage(
                                prop_id=property.prop_id,
                                image_url=image_url,
                                is_primary=(i == 0)
                            )
                            db.session.add(property_image)
                        else:
                            print(f"Failed to save image {i+1}")
            except Exception as e:
                db.session.rollback()
                print("Error processing images:", str(e))
                return jsonify({'message': f'Error processing images: {str(e)}'}), 422

            try:
                db.session.commit()
            except Exception as e:
                db.session.rollback()
                print("Error committing to database:", str(e))
                return jsonify({'message': f'Database commit error: {str(e)}'}), 422

            return jsonify({
                'message': 'Property created successfully',
                'property': property.to_dict()
            }), 201

    except Exception as e:
        db.session.rollback()
        import traceback
        traceback.print_exc()
        return jsonify({
            "message": "Error creating property",
            "error": str(e),
            "stack": traceback.format_exc()
        }), 422

@properties_bp.route('/types', methods=['GET'])
def get_property_types():
    property_types = PropertyType.query.all()
    return jsonify({'property_types': [pt.to_dict() for pt in property_types]}), 200

@properties_bp.route('/parishes', methods=['GET'])
def get_parishes():
    parishes = Parish.query.all()
    return jsonify({'parishes': [p.to_dict() for p in parishes]}), 200

@properties_bp.route('/amenities', methods=['GET'])
def get_amenities():
    amenities = Amenity.query.all()
    return jsonify({'amenities': [a.to_dict() for a in amenities]}), 200

@properties_bp.route('/amenities/add', methods=['POST'])
@jwt_required()
def create_amenity():
    """Add a new amenity to the predefined list"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    # Only admin, property_owner, and agent can add global amenities
    if not user or user.user_type not in ['admin', 'property_owner', 'agent']:
        return jsonify({'message': 'Unauthorized to add amenities'}), 403
    
    data = request.get_json()
    
    if not data or 'name' not in data:
        return jsonify({'message': 'Amenity name is required'}), 400
    
    # Check if amenity already exists
    existing = Amenity.query.filter(func.lower(Amenity.name) == func.lower(data['name'])).first()
    if existing:
        return jsonify({'message': 'This amenity already exists', 'amenity': existing.to_dict()}), 400
    
    # Create new amenity
    amenity = Amenity(name=data['name'])
    db.session.add(amenity)
    db.session.commit()
    
    return jsonify({'message': 'Amenity created successfully', 'amenity': amenity.to_dict()}), 201

@properties_bp.route('/featured', methods=['GET'])
def get_featured_properties():
    limit = request.args.get('limit', 6, type=int)
    
    # Logic to get featured properties
    featured_properties = Property.query.limit(limit).all()
    
    return jsonify({
        'featured_properties': [p.to_dict() for p in featured_properties]
    }), 200

@properties_bp.route('/most-viewed', methods=['GET'])
def get_most_viewed_properties():
    limit = request.args.get('limit', 6, type=int)
    
    # Logic to get most viewed properties
    properties = Property.query.limit(limit).all()
    
    return jsonify({
        'properties': [p.to_dict() for p in properties]
    }), 200

@properties_bp.route('/<int:prop_id>/similar', methods=['GET'])
def get_similar_properties(prop_id):
    """Get properties similar to the specified property"""
    try:
        limit = int(request.args.get('limit', 4))
        
        # Find the target property
        property = Property.query.filter_by(prop_id=prop_id).first()
        
        if not property:
            return jsonify({"error": "Property not found"}), 404
        
        # Find similar properties based on various attributes
        similar_properties = Property.query.filter(
            Property.prop_id != prop_id,  # Exclude the current property
            Property.property_type_id == property.property_type_id  # Same property type
        )
        
        # Additional filters if available
        if property.parish_id:
            similar_properties = similar_properties.filter(
                or_(
                    Property.parish_id == property.parish_id,  # Same parish
                    Property.city == property.city  # Or same city
                )
            )
        
        if property.bedrooms:
            # Similar number of bedrooms (+/- 1)
            similar_properties = similar_properties.filter(
                or_(
                    Property.bedrooms == property.bedrooms,
                    Property.bedrooms == property.bedrooms + 1,
                    Property.bedrooms == property.bedrooms - 1
                )
            )
        
        if property.price:
            # Price range within 25% of the target property's price
            price_min = property.price * 0.75
            price_max = property.price * 1.25
            similar_properties = similar_properties.filter(
                Property.price.between(price_min, price_max)
            )
        
        # Get all matching properties
        similar_properties = similar_properties.all()
        
        # If we don't have enough, get random properties of the same type
        if len(similar_properties) < limit:
            fallback_properties = Property.query.filter(
                Property.prop_id != prop_id,
                Property.property_type_id == property.property_type_id,
                ~Property.prop_id.in_([p.prop_id for p in similar_properties])
            ).all()
            
            # Add fallback properties until we reach the limit or run out
            while len(similar_properties) < limit and fallback_properties:
                random_property = random.choice(fallback_properties)
                similar_properties.append(random_property)
                fallback_properties.remove(random_property)
        
        # Limit to requested number and convert to list of dictionaries
        result = []
        for prop in similar_properties[:limit]:
            # Get property images
            images = []
            property_images = PropertyImage.query.filter_by(prop_id=prop.prop_id).all()
            for img in property_images:
                images.append({
                    "image_url": img.image_url,
                    "is_primary": img.is_primary
                })
                
            # Get property type name
            property_type = PropertyType.query.get(prop.property_type_id)
            property_type_name = property_type.name if property_type else None
            
            # Get parish name
            parish = Parish.query.get(prop.parish_id) if prop.parish_id else None
            parish_name = parish.name if parish else None
            
            # Build property data
            property_data = {
                "prop_id": prop.prop_id,
                "property_id": prop.prop_id,  # For compatibility
                "title": prop.title,
                "description": prop.description,
                "price": prop.price,
                "bedrooms": prop.bedrooms,
                "bathrooms": prop.bathrooms,
                "area_sqft": prop.area_sqft,
                "city": prop.city,
                "address": prop.address,
                "property_type": {
                    "id": prop.property_type_id,
                    "name": property_type_name
                },
                "parish": {
                    "id": prop.parish_id,
                    "name": parish_name
                },
                "property_images": images,
                "status": prop.status
            }
            
            result.append(property_data)
        
        return jsonify(result)
        
    except Exception as e:
        print(f"Error getting similar properties: {e}")
        return jsonify({"error": str(e)}), 500
    
@properties_bp.route('/<int:prop_id>/images', methods=['POST'])
@jwt_required()
def add_property_images(prop_id):
    """Add images to an existing property"""
    current_user_id = get_jwt_identity()
    
    # Get the property and verify ownership
    property = Property.query.get_or_404(prop_id)
    
    # Check authorization - owner, agent, or admin
    if (property.owner_id != current_user_id and 
        property.agent_id != current_user_id and 
        User.query.get(current_user_id).user_type != 'admin'):
        return jsonify({'message': 'Not authorized to modify this property'}), 403
    
    try:
        # Process uploaded images
        images = request.files.getlist('images')
        print(f"Processing {len(images)} images for property {prop_id}")
        
        for i, image_file in enumerate(images):
            if image_file.filename:
                print(f"Processing image {i+1}: {image_file.filename}")
                image_url = save_property_image(image_file, property.prop_id)
                if image_url:
                    # First image is primary if no primary exists
                    is_primary = (i == 0 and not PropertyImage.query.filter_by(
                        prop_id=prop_id, is_primary=True).first())
                    
                    property_image = PropertyImage(
                        prop_id=property.prop_id,
                        image_url=image_url,
                        is_primary=is_primary
                    )
                    db.session.add(property_image)
                else:
                    print(f"Failed to save image {i+1}")
        
        db.session.commit()
        return jsonify({
            'message': 'Images added successfully', 
            'property': property.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print("Error processing images:", str(e))
        return jsonify({'message': f'Error processing images: {str(e)}'}), 422
    
@properties_bp.route('/', methods=['GET'])
def get_properties():
    try:
        owner_id = request.args.get('owner_id', type=int)
        agent_id = request.args.get('agent_id', type=int)
        parish_id = request.args.get('parish_id', type=int)
        property_type_id = request.args.get('property_type_id', type=int)
        status = request.args.get('status')

        query = Property.query

        if owner_id:
            print("Filtering by owner_id:", owner_id)
            query = query.filter_by(owner_id=owner_id)
        if agent_id:
            print("Filtering by agent_id:", agent_id)
            query = query.filter_by(agent_id=agent_id)
        if parish_id:
            print("Filtering by parish_id:", parish_id)
            query = query.filter_by(parish_id=parish_id)
        if property_type_id:
            print("Filtering by property_type_id:", property_type_id)
            query = query.filter_by(property_type_id=property_type_id)
        if status:
            print("Filtering by status:", status)
            query = query.filter_by(status=status)

        properties = query.order_by(Property.created_at.desc()).all()

        print("Returned properties:", [p.prop_id for p in properties])

        return jsonify({
            'properties': [p.to_dict(include_owner=True) for p in properties]
        }), 200

    except Exception as e:
        print("Error in get_properties:", str(e))
        return jsonify({'message': 'Failed to fetch properties'}), 500

@properties_bp.route('/<int:prop_id>/custom-amenities', methods=['PUT'])
@jwt_required()
def update_property_custom_amenities(prop_id):
    """Update custom amenities for a property"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    property_item = Property.query.get_or_404(prop_id)
    
    # Only owner, assigned agent, or admin can update
    if (property_item.owner_id != user_id and 
        property_item.agent_id != user_id and 
        user.user_type != 'admin'):
        return jsonify({'message': 'Unauthorized to update this property'}), 403
    
    data = request.get_json()
    
    if not data or 'custom_amenities' not in data:
        return jsonify({'message': 'Custom amenities list is required'}), 400
    
    # Update custom amenities
    property_item.set_custom_amenities(data['custom_amenities'])
    
    # Update last modified timestamp
    property_item.updated_at = datetime.utcnow()
    
    db.session.commit()
    
    return jsonify({
        'message': 'Property custom amenities updated successfully',
        'custom_amenities': property_item.get_custom_amenities()
    }), 200

@properties_bp.route('/<int:prop_id>/standard-amenities', methods=['PUT'])
@jwt_required()
def update_property_standard_amenities(prop_id):
    """Update standard amenities for a property"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    property_item = Property.query.get_or_404(prop_id)
    
    # Only owner, assigned agent, or admin can update
    if (property_item.owner_id != user_id and 
        property_item.agent_id != user_id and 
        user.user_type != 'admin'):
        return jsonify({'message': 'Unauthorized to update this property'}), 403
    
    data = request.get_json()
    
    if not data or 'amenity_ids' not in data:
        return jsonify({'message': 'Amenity IDs list is required'}), 400
    
    try:
        amenity_ids = [int(id) for id in data['amenity_ids']]
        amenities = Amenity.query.filter(Amenity.amen_id.in_(amenity_ids)).all()
        property_item.amenities = amenities
        
        # Update last modified timestamp
        property_item.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'message': 'Property standard amenities updated successfully',
            'amenities': [a.to_dict() for a in property_item.amenities]
        }), 200
    except Exception as e:
        return jsonify({'message': f'Error processing standard amenities: {str(e)}'}), 400

@properties_bp.route('/<int:prop_id>/amenities', methods=['PUT'])
@jwt_required()
def update_property_amenities(prop_id):
    """Update both standard and custom amenities for a property"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    property_item = Property.query.get_or_404(prop_id)
    
    # Only owner, assigned agent, or admin can update
    if (property_item.owner_id != user_id and 
        property_item.agent_id != user_id and 
        user.user_type != 'admin'):
        return jsonify({'message': 'Unauthorized to update this property'}), 403
    
    data = request.get_json()
    
    # Update standard amenities if provided
    if 'amenity_ids' in data:
        try:
            amenity_ids = [int(id) for id in data['amenity_ids']]
            amenities = Amenity.query.filter(Amenity.amen_id.in_(amenity_ids)).all()
            property_item.amenities = amenities
        except Exception as e:
            return jsonify({'message': f'Error processing standard amenities: {str(e)}'}), 400
    
    # Update custom amenities if provided
    if 'custom_amenities' in data:
        property_item.set_custom_amenities(data['custom_amenities'])
    
    # Update last modified timestamp
    property_item.updated_at = datetime.utcnow()
    
    db.session.commit()
    
    return jsonify({
        'message': 'Property amenities updated successfully',
        'amenities': [a.to_dict() for a in property_item.amenities],
        'custom_amenities': property_item.get_custom_amenities()
    }), 200

@properties_bp.route('/<int:prop_id>/status', methods=['PUT'])
@jwt_required()
def update_property_status(prop_id):
    """Update the status of a property"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    property_item = Property.query.get_or_404(prop_id)
    
    # Only owner, assigned agent, or admin can update status
    if (property_item.owner_id != user_id and 
        property_item.agent_id != user_id and 
        user.user_type != 'admin'):
        return jsonify({'message': 'Unauthorized to update this property status'}), 403
    
    data = request.get_json()
    
    if not data or 'status' not in data:
        return jsonify({'message': 'Status is required'}), 400
    
    # Validate the status
    valid_statuses = ['Active', 'Pending', 'Sold', 'Rented', 'Reserved', 'Inactive']
    if data['status'] not in valid_statuses:
        return jsonify({'message': f'Invalid status. Must be one of: {", ".join(valid_statuses)}'}), 400
    
    # Update the status
    property_item.status = data['status']
    property_item.updated_at = datetime.utcnow()
    
    db.session.commit()
    
    return jsonify({
        'message': 'Property status updated successfully',
        'status': property_item.status
    }), 200

@properties_bp.route('/<int:prop_id>/assign-agent', methods=['PUT'])
@jwt_required()
def assign_agent(prop_id):
    """Assign an agent to a property"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    property_item = Property.query.get_or_404(prop_id)
    
    # Only the property owner or admin can assign an agent
    if property_item.owner_id != user_id and user.user_type != 'admin':
        return jsonify({'message': 'Unauthorized to assign an agent to this property'}), 403
    
    data = request.get_json()
    
    if not data or 'agent_id' not in data:
        return jsonify({'message': 'Agent ID is required'}), 400
    
    # Verify the agent exists and is an agent
    agent = User.query.get(data['agent_id'])
    if not agent or agent.user_type != 'agent':
        return jsonify({'message': 'Invalid agent ID'}), 400
    
    # Assign the agent
    property_item.agent_id = agent.user_id
    property_item.updated_at = datetime.utcnow()
    
    db.session.commit()
    
    return jsonify({
        'message': 'Agent assigned successfully',
        'agent_id': property_item.agent_id
    }), 200

# Add this to app/route/properties.py if it doesn't exist

@properties_bp.route('/<int:prop_id>', methods=['PUT'])
@jwt_required()
def update_property(prop_id):
    current_user_id = get_jwt_identity()
    
    # Get property
    property = Property.query.get_or_404(prop_id)
    
    # Check if user is the owner
    if property.owner_id != current_user_id:
        return jsonify({'message': 'You do not have permission to update this property'}), 403
    
    # Get property data from form
    data = request.form.to_dict()
    
    # Basic validation
    if 'title' not in data or not data['title'].strip():
        return jsonify({'message': 'Property title is required'}), 400
    
    # Update property fields
    property.title = data.get('title', property.title)
    property.description = data.get('description', property.description)
    property.price = float(data.get('price', property.price))
    property.property_type_id = int(data.get('property_type_id', property.property_type_id))
    
    if 'bedrooms' in data and data['bedrooms']:
        property.bedrooms = int(data['bedrooms'])
    
    if 'bathrooms' in data and data['bathrooms']:
        property.bathrooms = float(data['bathrooms'])
    
    if 'area_sqft' in data and data['area_sqft']:
        property.area_sqft = float(data['area_sqft'])
    
    property.address = data.get('address', property.address)
    property.city = data.get('city', property.city)
    
    if 'parish_id' in data and data['parish_id']:
        property.parish_id = int(data['parish_id'])
    
    if 'latitude' in data and data['latitude']:
        property.latitude = float(data['latitude'])
    
    if 'longitude' in data and data['longitude']:
        property.longitude = float(data['longitude'])
    
    property.is_for_sale = data.get('is_for_sale', '').lower() == 'true'
    property.is_for_rent = data.get('is_for_rent', '').lower() == 'true'
    
    if data.get('is_for_rent', '').lower() == 'true' and 'monthly_rent' in data:
        property.monthly_rent = float(data['monthly_rent'])
    
    property.contact_phone = data.get('contact_phone', property.contact_phone)
    property.contact_email = data.get('contact_email', property.contact_email)
    property.listing_url = data.get('listing_url', property.listing_url)
    
    # Process amenities
    amenity_ids = request.form.getlist('amenities')
    if amenity_ids:
        amenities = Amenity.query.filter(Amenity.amenity_id.in_(amenity_ids)).all()
        property.amenities = amenities
    
    # Process uploaded images
    images = request.files.getlist('images')
    for image_file in images:
        if image_file.filename:
            image_url = save_property_image(image_file, property.property_id)
            if image_url:
                # Create new image
                property_image = PropertyImage(
                    prop_id=property.property_id,
                    image_url=image_url,
                    is_primary=False  # Set as non-primary by default
                )
                db.session.add(property_image)
    
    # Update modification date
    property.updated_at = datetime.utcnow()
    
    try:
        db.session.commit()
        return jsonify({
            'message': 'Property updated successfully',
            'property': property.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error updating property: {str(e)}'}), 500
@properties_bp.route('/<int:prop_id>', methods=['DELETE'])
@jwt_required()
def delete_property(prop_id):
    """Delete a property"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    property_item = Property.query.get_or_404(prop_id)
    
    # Only owner or admin can delete a property
    if property_item.owner_id != user_id and user.user_type != 'admin':
        return jsonify({'message': 'Not authorized to delete this property'}), 403
    
    try:
        # Delete property images from storage
        for image in property_item.images:
            # Extract the file path from the URL
            file_path = os.path.join(
                create_app().root_path, 
                image.image_url.lstrip('/')
            )
            # Try to delete the file if it exists
            if os.path.exists(file_path):
                os.remove(file_path)
        
        # Delete property from database
        db.session.delete(property_item)
        db.session.commit()
        
        return jsonify({
            'message': 'Property deleted successfully'
        }), 200
    except Exception as e:
        db.session.rollback()
        print("Error deleting property:", str(e))
        return jsonify({'message': f'Error deleting property: {str(e)}'}), 500
    
@properties_bp.route('/debug-user-type', methods=['GET'])
@jwt_required()
def debug_user_type():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    # Debug information
    return jsonify({
        'user_id': user_id,
        'user_type': user.user_type,
        'type_of_user_type': type(user.user_type).__name__,
        'raw_user_data': str(user.__dict__)
    }), 200

# Add these routes to your properties_bp blueprint

@properties_bp.route('/<int:prop_id>/save', methods=['POST'])
@jwt_required()
def save_property(prop_id):
    current_user_id = get_jwt_identity()
    
    try:
        # Check if already saved
        interaction = UserPropertyInteraction.query.filter_by(
            user_id=current_user_id,
            prop_id=prop_id
        ).first()
        
        if interaction:
            # Update existing interaction
            interaction.is_saved = True
            interaction.last_saved = datetime.utcnow()
        else:
            # Create new interaction
            interaction = UserPropertyInteraction(
                user_id=current_user_id,
                prop_id=prop_id,
                is_saved=True,
                last_saved=datetime.utcnow(),
                view_count=1,
                last_viewed=datetime.utcnow()
            )
            db.session.add(interaction)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Property saved successfully',
            'property_id': prop_id
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': 'Failed to save property',
            'message': str(e)
        }), 500

@properties_bp.route('/<int:prop_id>/unsave', methods=['DELETE'])
@jwt_required()
def unsave_property(prop_id):
    current_user_id = get_jwt_identity()
    
    try:
        # Find the interaction
        interaction = UserPropertyInteraction.query.filter_by(
            user_id=current_user_id,
            prop_id=prop_id
        ).first()
        
        if interaction:
            # Update the interaction
            interaction.is_saved = False
            db.session.commit()
        
        return jsonify({
            'message': 'Property removed from saved list',
            'property_id': prop_id
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': 'Failed to remove property from saved list',
            'message': str(e)
        }), 500
    
@properties_bp.route('/user/saved', methods=['GET'])
@jwt_required()
def get_user_saved_properties():
    current_user_id = get_jwt_identity()
    
    try:
        # Get all saved property interactions
        saved_interactions = UserPropertyInteraction.query.filter_by(
            user_id=current_user_id,
            is_saved=True
        ).all()
        
        # Get the property IDs
        property_ids = [interaction.prop_id for interaction in saved_interactions]
        
        # Get the properties
        properties = Property.query.filter(Property.property_id.in_(property_ids)).all()
        
        return jsonify({
            'properties': [prop.to_dict() for prop in properties]
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': 'Failed to get saved properties',
            'message': str(e)
        }), 500    

@properties_bp.route('/search', methods=['GET'])
def search_properties():
    """Search properties with advanced filters"""
    try:
        # Extract filters from query parameters
        min_price = request.args.get('min_price', type=float)
        max_price = request.args.get('max_price', type=float)
        parish_id = request.args.get('parish_id', type=int)
        parish_name = request.args.get('parish')  # String parameter for parish name
        property_type_id = request.args.get('property_type_id', type=int)
        min_bedrooms = request.args.get('min_bedrooms', type=int)
        min_bathrooms = request.args.get('min_bathrooms', type=float)
        is_for_sale = request.args.get('is_for_sale', '').lower() == 'true'
        is_for_rent = request.args.get('is_for_rent', '').lower() == 'true'
        city = request.args.get('city')
        keyword = request.args.get('keyword')
        
        # Get pagination parameters
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 12, type=int)
        
        # Log the search parameters
        print(f"Search params: min_price={min_price}, max_price={max_price}, parish_id={parish_id}, "
              f"parish={parish_name}, property_type_id={property_type_id}, min_bedrooms={min_bedrooms}, "
              f"min_bathrooms={min_bathrooms}, is_for_sale={is_for_sale}, is_for_rent={is_for_rent}, "
              f"city={city}, keyword={keyword}, page={page}, limit={limit}")
        
        # Start building the query
        query = Property.query
        
        # Apply filters
        if min_price:
            query = query.filter(Property.price >= min_price)
        if max_price:
            query = query.filter(Property.price <= max_price)
        if parish_id:
            query = query.filter(Property.parish_id == parish_id)
        elif parish_name:
            # Get parish ID from name
            parish = Parish.query.filter(Parish.name.ilike(f"%{parish_name}%")).first()
            if parish:
                query = query.filter(Property.parish_id == parish.parish_id)
        if property_type_id:
            query = query.filter(Property.property_type_id == property_type_id)
        if min_bedrooms:
            query = query.filter(Property.bedrooms >= min_bedrooms)
        if min_bathrooms:
            query = query.filter(Property.bathrooms >= min_bathrooms)
        if is_for_sale is not None:
            query = query.filter(Property.is_for_sale == is_for_sale)
        if is_for_rent is not None:
            query = query.filter(Property.is_for_rent == is_for_rent)
        if city:
            query = query.filter(Property.city.ilike(f"%{city}%"))
        if keyword:
            search_term = f"%{keyword}%"
            query = query.filter(
                or_(
                    Property.title.ilike(search_term),
                    Property.description.ilike(search_term),
                    Property.city.ilike(search_term),
                    Property.address.ilike(search_term)
                )
            )
        
        # Process amenities filter - more complex because it's an array parameter
        amenities = request.args.getlist('amenities[]')
        if amenities and len(amenities) > 0:
            print(f"Filtering by amenities: {amenities}")
            
            # For each amenity, join with amenities table to filter
            for amenity in amenities:
                # Try to parse as int for ID-based filter
                try:
                    amenity_id = int(amenity)
                    query = query.join(Property.amenities).filter(Amenity.amen_id == amenity_id)
                except ValueError:
                    # If not an ID, filter by name
                    query = query.join(Property.amenities).filter(Amenity.name.ilike(f"%{amenity}%"))
        
        # Count total results
        total_count = query.count()
        
        # Apply pagination
        query = query.order_by(Property.created_at.desc())
        paginated_query = query.offset((page - 1) * limit).limit(limit)
        
        # Execute query
        properties = paginated_query.all()
        
        # Convert to dict
        properties_data = [p.to_dict(include_images=True) for p in properties]
        
        # Create response
        response = {
            'properties': properties_data,
            'total': total_count,
            'pages': math.ceil(total_count / limit) if limit > 0 else 1,
            'page': page
        }
        
        print(f"Found {len(properties_data)} properties matching filters (page {page} of {response['pages']})")
        
        return jsonify(response), 200
        
    except Exception as e:
        print(f"Error in search_properties: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Error searching properties', 'message': str(e)}), 500