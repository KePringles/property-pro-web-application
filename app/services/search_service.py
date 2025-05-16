# app/services/search_service.py
from sqlalchemy import and_, or_, func
from app.models.property import Property, Amenity

def search_properties(params, page=1, per_page=10):
    """
    Search for properties based on filter parameters
    Returns: (results, total, pages)
    """
    query = Property.query
    
    # Apply filters
    if params.get('min_price'):
        query = query.filter(Property.price >= params['min_price'])
    
    if params.get('max_price'):
        query = query.filter(Property.price <= params['max_price'])
    
    if params.get('parish_id'):
        query = query.filter(Property.parish_id == params['parish_id'])
    
    if params.get('city'):
        query = query.filter(Property.city.ilike(f"%{params['city']}%"))
    
    if params.get('property_type_id'):
        query = query.filter(Property.property_type_id == params['property_type_id'])
    
    if params.get('min_bedrooms'):
        query = query.filter(Property.bedrooms >= params['min_bedrooms'])
    
    if params.get('min_bathrooms'):
        query = query.filter(Property.bathrooms >= params['min_bathrooms'])
    
    if params.get('is_for_sale') is not None:
        query = query.filter(Property.is_for_sale == params['is_for_sale'])
    
    if params.get('is_for_rent') is not None:
        query = query.filter(Property.is_for_rent == params['is_for_rent'])
    
    # Filter by amenities if provided
    if params.get('amenities') and len(params['amenities']) > 0:
        for amenity_id in params['amenities']:
            query = query.filter(Property.amenities.any(Amenity.amenity_id == amenity_id))
    
    # Get sort parameters
    sort_by = params.get('sort_by', 'created_at')
    sort_order = params.get('sort_order', 'desc')
    
    # Apply sorting
    if sort_by == 'price':
        if sort_order == 'desc':
            query = query.order_by(Property.price.desc())
        else:
            query = query.order_by(Property.price.asc())
    elif sort_by == 'created_at':
        if sort_order == 'desc':
            query = query.order_by(Property.created_at.desc())
        else:
            query = query.order_by(Property.created_at.asc())
    
    # Get paginated results
    paginated = query.paginate(page=page, per_page=per_page, error_out=False)
    
    return paginated.items, paginated.total, paginated.pages

def find_similar_properties(property, limit=5):
    """
    Find properties similar to the given property
    """
    # Build a query to find similar properties
    query = Property.query.filter(Property.property_id != property.property_id)
    
    # Filter by the same property type
    query = query.filter(Property.property_type_id == property.property_type_id)
    
    # Filter by similar price range (±20%)
    price_lower = property.price * 0.8
    price_upper = property.price * 1.2
    query = query.filter(Property.price.between(price_lower, price_upper))
    
    # Filter by similar bedrooms (±1)
    if property.bedrooms:
        bed_lower = max(1, property.bedrooms - 1)
        bed_upper = property.bedrooms + 1
        query = query.filter(Property.bedrooms.between(bed_lower, bed_upper))
    
    # Filter by same parish if available
    if property.parish_id:
        query = query.filter(Property.parish_id == property.parish_id)
    
    # Return limited results
    return query.limit(limit).all()