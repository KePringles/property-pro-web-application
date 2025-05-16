# app/route/search.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import and_, or_, func
import json
from app import db
from app.models.property import Property, Parish, PropertyType, Amenity
from app.models.search import SearchHistory
from app.services.search_service import search_properties

search_bp = Blueprint('search', __name__)

# Add OPTIONS handler for the main search endpoint
@search_bp.route('', methods=['OPTIONS'])
def options_search():
    return '', 200

# Main search endpoint
@search_bp.route('', methods=['GET'])
def search():
    # Extract search parameters from query string
    min_price = request.args.get('min_price', type=float)
    max_price = request.args.get('max_price', type=float)
    parish_id = request.args.get('parish_id', type=int)
    city = request.args.get('city')
    property_type_id = request.args.get('property_type_id', type=int)
    min_bedrooms = request.args.get('min_bedrooms', type=int)
    min_bathrooms = request.args.get('min_bathrooms', type=float)
    amenities = request.args.getlist('amenities')
    is_for_sale = request.args.get('is_for_sale', 'false').lower() == 'true'
    is_for_rent = request.args.get('is_for_rent', 'false').lower() == 'true'
    sort_by = request.args.get('sort_by', 'created_at')
    sort_order = request.args.get('sort_order', 'desc')
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    # Construct search parameters dictionary for history
    search_params = {
        'min_price': min_price,
        'max_price': max_price,
        'parish_id': parish_id,
        'city': city,
        'property_type_id': property_type_id,
        'min_bedrooms': min_bedrooms,
        'min_bathrooms': min_bathrooms,
        'amenities': amenities,
        'is_for_sale': is_for_sale,
        'is_for_rent': is_for_rent,
        'sort_by': sort_by,
        'sort_order': sort_order
    }
    
    # Remove None values for cleaner JSON
    search_params = {k: v for k, v in search_params.items() if v is not None}
    
    # Get current user ID if available
    user_id = None
    if request.headers.get('Authorization'):
        try:
            user_id = get_jwt_identity()
        except:
            pass
    
    try:
        # Call search service
        results, total, pages = search_properties(
            search_params, 
            page=page, 
            per_page=per_page
        )
        
        # Save search history if user is logged in
        if user_id:
            search_query = " ".join([
                city or '',
                f"{min_bedrooms} bedrooms" if min_bedrooms else '',
                f"{min_bathrooms} bathrooms" if min_bathrooms else '',
                f"${min_price}-${max_price}" if min_price and max_price else '',
                "For Sale" if is_for_sale else '',
                "For Rent" if is_for_rent else ''
            ]).strip()
            
            # Save to search history
            search_history = SearchHistory(
                user_id=user_id,
                search_query=search_query,
                search_params=search_params
            )
            
            db.session.add(search_history)
            db.session.commit()
        
        return jsonify({
            'properties': [prop.to_dict() for prop in results],
            'total': total,
            'pages': pages,
            'page': page,
            'search_params': search_params
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': 'Search failed',
            'message': str(e)
        }), 500

# Add OPTIONS handler for search history
@search_bp.route('/search-history', methods=['OPTIONS'])
def options_search_history():
    return '', 200

@search_bp.route('/search-history', methods=['GET'])
@jwt_required()
def get_search_history():
    user_id = get_jwt_identity()
    
    # Get recent searches with pagination
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 5, type=int)
    
    searches = SearchHistory.query.filter_by(user_id=user_id)\
        .order_by(SearchHistory.search_date.desc())\
        .paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        'searches': [s.to_dict() for s in searches.items],
        'total': searches.total,
        'pages': searches.pages,
        'page': page
    }), 200

# Add OPTIONS handler for similar properties
@search_bp.route('/similar-properties/<int:prop_id>', methods=['OPTIONS'])
def options_similar_properties(prop_id):
    return '', 200

@search_bp.route('/similar-properties/<int:prop_id>', methods=['GET'])
def get_similar_properties(prop_id):
    try:
        # Get property details to find similar ones
        property = Property.query.get_or_404(prop_id)
        
        # Get search service to find similar properties
        from app.services.search_service import find_similar_properties
        
        limit = request.args.get('limit', 5, type=int)
        similar_properties = find_similar_properties(property, limit=limit)
        
        return jsonify({
            'similar_properties': [p.to_dict() for p in similar_properties]
        }), 200
    except Exception as e:
        return jsonify({
            'error': 'Failed to get similar properties',
            'message': str(e)
        }), 500