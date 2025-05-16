from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
from app import db
from app.models.client import Client
from app.models.property import Property

clients_bp = Blueprint('clients', __name__, url_prefix='/clients')


@clients_bp.route('', methods=['POST'])
@cross_origin()
def create_client():
    data = request.get_json()
    client = Client(name=data['name'], email=data['email'], phone=data['phone'])

    for prop_data in data.get('properties', []):
        prop = Property(
            title=prop_data['title'],
            price=prop_data['price'],
            address=prop_data.get('address'),
            bedrooms=prop_data.get('bedrooms'),
            bathrooms=prop_data.get('bathrooms'),
            is_for_sale=prop_data.get('is_for_sale', True),
            is_for_rent=prop_data.get('is_for_rent', False),
            property_type_id=prop_data.get('property_type_id'),
            parish_id=prop_data.get('parish_id'),
            custom_amenities=prop_data.get('custom_amenities'),
            client=client
        )
        db.session.add(prop)

    db.session.add(client)
    db.session.commit()
    return jsonify(client.to_dict()), 201


@clients_bp.route('/<int:client_id>', methods=['PUT'])
@cross_origin()
def update_client(client_id):
    client = Client.query.get_or_404(client_id)
    data = request.get_json()

    client.name = data.get('name', client.name)
    client.email = data.get('email', client.email)
    client.phone = data.get('phone', client.phone)

    # Clear and replace properties
    client.properties.clear()
    for prop_data in data.get('properties', []):
        prop = Property(
            title=prop_data['title'],
            price=prop_data['price'],
            address=prop_data.get('address'),
            bedrooms=prop_data.get('bedrooms'),
            bathrooms=prop_data.get('bathrooms'),
            is_for_sale=prop_data.get('is_for_sale', True),
            is_for_rent=prop_data.get('is_for_rent', False),
            property_type_id=prop_data.get('property_type_id'),
            parish_id=prop_data.get('parish_id'),
            custom_amenities=prop_data.get('custom_amenities'),
            client=client
        )
        db.session.add(prop)

    db.session.commit()
    return jsonify({'message': 'Client updated', 'client': client.to_dict()})


@clients_bp.route('/<int:client_id>', methods=['DELETE'])
@cross_origin()
def delete_client(client_id):
    client = Client.query.get_or_404(client_id)
    db.session.delete(client)
    db.session.commit()
    return jsonify({'message': 'Client and properties deleted'})


@clients_bp.route('', methods=['GET'])
@cross_origin()
def get_clients():
    clients = Client.query.all()
    return jsonify([c.to_dict() for c in clients])

@clients_bp.route('/<int:client_id>', methods=['GET'])
@cross_origin()
def get_client_by_id(client_id):
    client = Client.query.get_or_404(client_id)
    return jsonify(client.to_dict())

@clients_bp.route('/<int:client_id>/properties', methods=['POST', 'PUT'])  # Support both POST and PUT
@cross_origin()
def add_property_to_client(client_id):
    try:
        # Log the incoming request data
        request_data = request.get_json()
        print(f"Received request to link property to client {client_id}")
        print(f"Request data: {request_data}")
        
        # Check if client exists
        client = Client.query.get(client_id)
        if not client:
            return jsonify({'error': f'Client with ID {client_id} not found'}), 404
        
        # Get property ID from request
        property_id = request_data.get('property_id')
        if not property_id:
            return jsonify({'error': 'property_id is required'}), 400
            
        # Handle temporary IDs with better error message
        if isinstance(property_id, str) and property_id.startswith('temp-'):
            return jsonify({
                'error': 'Cannot link a temporary property',
                'details': 'The property must be fully saved with a permanent ID before linking'
            }), 400
        
        # Try to find the property by various ID formats (int, string, etc.)
        property = None
        
        # First try direct lookup by ID as-is
        property = Property.query.get(property_id)
        
        # If not found and it's a string that could be a number, try converting to int
        if not property and isinstance(property_id, str) and property_id.isdigit():
            try:
                property = Property.query.get(int(property_id))
            except:
                pass
        
        # If still not found, try looking up by other common ID fields
        if not property:
            property = Property.query.filter(
                (Property.property_id == property_id) | 
                (Property.prop_id == property_id)
            ).first()
        
        # If property not found after all attempts
        if not property:
            return jsonify({
                'error': f'Property with ID {property_id} not found',
                'details': 'Ensure the property exists and the ID is correct'
            }), 404
            
        # Debug info about the property
        print(f"Found property: {property.title}, current client_id: {property.client_id}")
        
        # Add this property to the client
        property.client_id = client_id
        
        # Commit changes
        db.session.commit()
        print(f"Successfully linked property {property_id} to client {client_id}")
        
        return jsonify({
            'message': 'Property linked to client successfully',
            'property': property.to_dict() if hasattr(property, 'to_dict') else {'id': property.id, 'title': property.title},
            'client': client.to_dict() if hasattr(client, 'to_dict') else {'id': client.id, 'name': client.name}
        }), 200
    except Exception as e:
        # Roll back any changes
        db.session.rollback()
        import traceback
        print(f"Error linking property to client: {str(e)}")
        print(traceback.format_exc())  # Print the full traceback
        
        # Return detailed error information
        return jsonify({
            'error': 'Server error when linking property to client',
            'details': str(e)
        }), 500
    
@clients_bp.route('/<int:client_id>/properties/<int:property_id>', methods=['DELETE'])
@cross_origin()
def remove_property_from_client(client_id, property_id):
    try:
        # Log the request
        print(f"Received request to remove property {property_id} from client {client_id}")
        
        # Check if client exists
        client = Client.query.get(client_id)
        if not client:
            return jsonify({'error': f'Client with ID {client_id} not found'}), 404
        
        # Check if property exists
        property = Property.query.get(property_id)
        if not property:
            return jsonify({'error': f'Property with ID {property_id} not found'}), 404
            
        # Check if property belongs to client
        if property.client_id != client_id:
            return jsonify({'error': f'Property does not belong to this client'}), 400
            
        # Remove the property from the client by setting client_id to None
        property.client_id = None
        
        # Commit changes
        db.session.commit()
        print(f"Successfully removed property {property_id} from client {client_id}")
        
        return jsonify({
            'message': 'Property removed from client successfully',
            'property_id': property_id,
            'client_id': client_id
        }), 200
    except Exception as e:
        # Roll back any changes
        db.session.rollback()
        import traceback
        print(f"Error removing property from client: {str(e)}")
        print(traceback.format_exc())  # Print the full traceback
        
        # Return detailed error information
        return jsonify({
            'error': 'Server error when removing property from client',
            'details': str(e)
        }), 500    