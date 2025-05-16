# app/services/recommendation_service.py
from datetime import datetime
from sqlalchemy import func
from app import db
from app.models.property import Property, UserPropertyInteraction
from app.models.user import User
from app.models.preference import UserPreference  # Updated import path
from app.models.alert import PropertyAlert

def update_property_interaction_scores():
    """
    Update interaction scores for properties based on user interactions.
    This function calculates the popularity scores of properties based on views,
    saves, and other interactions.
    """
    try:
        # Get all properties with interactions
        properties_with_interactions = db.session.query(
            Property.property_id,
            func.count(UserPropertyInteraction.interaction_id).label('total_interactions'),
            func.sum(UserPropertyInteraction.view_count).label('total_views'),
            func.sum(UserPropertyInteraction.is_saved.cast(db.Integer)).label('total_saves')
        ).join(
            UserPropertyInteraction,
            Property.property_id == UserPropertyInteraction.prop_id
        ).group_by(
            Property.property_id
        ).all()
        
        # Update popularity scores
        for prop_id, total_interactions, total_views, total_saves in properties_with_interactions:
            property = Property.query.get(prop_id)
            if property:
                # Calculate popularity score (simple algorithm, can be improved)
                popularity_score = (total_views or 0) + ((total_saves or 0) * 5)
                
                # Update property
                property.popularity_score = popularity_score
                property.total_views = total_views or 0
                property.total_saves = total_saves or 0
        
        # Commit changes
        db.session.commit()
        print(f"Updated interaction scores for {len(properties_with_interactions)} properties")
        
    except Exception as e:
        db.session.rollback()
        print(f"Error updating property interaction scores: {str(e)}")

def get_personalized_recommendations(user_id, filters=None, limit=10):
    """
    Get personalized property recommendations for a user
    """
    try:
        # Get user preferences
        user_preferences = UserPreference.query.filter_by(user_id=user_id).first()
        
        # Start with base query
        query = Property.query
        
        # Apply user preferences if available
        if user_preferences:
            # Price range preference
            if user_preferences.max_price:
                query = query.filter(Property.price <= user_preferences.max_price)
            
            # Property type preference
            if user_preferences.preferred_property_type_id:
                query = query.filter(Property.property_type_id == user_preferences.preferred_property_type_id)
            
            # Location preference
            if user_preferences.preferred_parish_id:
                query = query.filter(Property.parish_id == user_preferences.preferred_parish_id)
            
            # Size preference
            if user_preferences.min_bedrooms:
                query = query.filter(Property.bedrooms >= user_preferences.min_bedrooms)
            
            if user_preferences.min_bathrooms:
                query = query.filter(Property.bathrooms >= user_preferences.min_bathrooms)
        
        # Apply additional filters if provided
        if filters:
            if filters.get('min_price'):
                query = query.filter(Property.price >= filters['min_price'])
            if filters.get('max_price'):
                query = query.filter(Property.price <= filters['max_price'])
            if filters.get('parish_id'):
                query = query.filter(Property.parish_id == filters['parish_id'])
            if filters.get('property_type_id'):
                query = query.filter(Property.property_type_id == filters['property_type_id'])
            if filters.get('min_bedrooms'):
                query = query.filter(Property.bedrooms >= filters['min_bedrooms'])
            if filters.get('is_for_sale') is not None:
                query = query.filter(Property.is_for_sale == filters['is_for_sale'])
            if filters.get('is_for_rent') is not None:
                query = query.filter(Property.is_for_rent == filters['is_for_rent'])
        
        # Filter out properties the user has already interacted with significantly
        user_interactions = UserPropertyInteraction.query.filter(
            UserPropertyInteraction.user_id == user_id,
            UserPropertyInteraction.view_count > 3  # User has viewed multiple times
        ).all()
        
        interacted_property_ids = [interaction.prop_id for interaction in user_interactions]
        if interacted_property_ids:
            query = query.filter(~Property.property_id.in_(interacted_property_ids))
        
        # Order by match score (could be more sophisticated)
        # For now, just order by newest properties
        query = query.order_by(Property.created_at.desc())
        
        # Get results with limit
        properties = query.limit(limit).all()
        
        # Calculate match scores and format results
        recommendations = []
        for prop in properties:
            match_score = calculate_match_score(prop, user_preferences)
            recommendations.append({
                'property': prop,
                'match_score': match_score
            })
        
        # Sort by match score
        recommendations.sort(key=lambda x: x['match_score'], reverse=True)
        
        return recommendations
        
    except Exception as e:
        print(f"Error getting personalized recommendations: {str(e)}")
        return []

def calculate_match_score(property, user_preferences):
    """
    Calculate match score between a property and user preferences
    Returns a score from 0-100
    """
    if not user_preferences:
        return 50  # Default middle score if no preferences
    
    score = 50  # Start with neutral score
    
    # Price match
    if user_preferences.max_price and property.price <= user_preferences.max_price:
        # Better score the closer to preference
        price_ratio = property.price / user_preferences.max_price
        if price_ratio <= 0.8:  # At least 20% under budget
            score += 15
        elif price_ratio <= 0.9:  # At least 10% under budget
            score += 10
        else:  # Within budget
            score += 5
    elif user_preferences.max_price:
        # Over budget, decrease score
        price_excess = (property.price - user_preferences.max_price) / user_preferences.max_price
        if price_excess <= 0.1:  # Up to 10% over budget
            score -= 5
        elif price_excess <= 0.2:  # Up to 20% over budget
            score -= 10
        else:  # More than 20% over budget
            score -= 15
    
    # Property type match
    if user_preferences.preferred_property_type_id and property.property_type_id == user_preferences.preferred_property_type_id:
        score += 15
    
    # Location match
    if user_preferences.preferred_parish_id and property.parish_id == user_preferences.preferred_parish_id:
        score += 15
    
    # Size match
    if user_preferences.min_bedrooms and property.bedrooms >= user_preferences.min_bedrooms:
        # Exact match is best
        if property.bedrooms == user_preferences.min_bedrooms:
            score += 10
        elif property.bedrooms == user_preferences.min_bedrooms + 1:
            score += 7  # One more bedroom is good
        elif property.bedrooms > user_preferences.min_bedrooms + 1:
            score += 5  # Much larger is ok but not ideal
    
    # Ensure score is within 0-100 range
    return max(0, min(100, score))

def create_property_alert(search_criteria, alert_name, user_id):
    """
    Create a property alert for a user based on search criteria
    """
    
    try:
        # Create the alert
        alert = PropertyAlert(
            user_id=user_id,
            alert_name=alert_name,
            search_criteria=search_criteria,
            created_at=datetime.utcnow(),
            is_active=True
        )
        
        db.session.add(alert)
        db.session.commit()
        
        return alert
        
    except Exception as e:
        db.session.rollback()
        raise Exception(f"Failed to create property alert: {str(e)}")