# app/routes/recommendations.py
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User
from app.models.property import Property
from app.models.preference import UserPreference  # Instead of app.models.user_preference
from app.models.property import UserPropertyInteraction  # Instead of app.models.property_interaction
from app.utils.recommendation_engine import PropertyRecommendationEngine
from app import db
import logging

logger = logging.getLogger(__name__)
recommendations_bp = Blueprint('recommendations', __name__)
recommendation_engine = PropertyRecommendationEngine(db)

@recommendations_bp.route('/api/recommendations', methods=['GET'])
@jwt_required()
def get_recommendations():
    """Get personalized property recommendations for the user"""
    user_id = get_jwt_identity()
    limit = request.args.get('limit', 10, type=int)
    
    try:
        # Get recommendations from engine
        recommendations = recommendation_engine.recommend_properties(user_id, limit)
        
        # Log user interaction for analytics
        UserPropertyInteraction.log_action(user_id, 'recommendation_view', None)
        
        return jsonify({
            'success': True,
            'recommendations': recommendations
        }), 200
    except Exception as e:
        logger.error(f"Error in recommendations: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to generate recommendations',
            'error': str(e)
        }), 500

@recommendations_bp.route('/api/properties/<int:property_id>/similar', methods=['GET'])
def get_similar_properties(property_id):
    """Get similar properties to the specified property"""
    limit = request.args.get('limit', 5, type=int)
    
    try:
        # Check if property exists
        property_exists = Property.query.filter_by(id=property_id).first()
        if not property_exists:
            return jsonify({
                'success': False,
                'message': 'Property not found'
            }), 404
            
        # Get similar properties
        similar_properties = recommendation_engine.get_similar_properties(property_id, limit)
        
        # Add property details to each similar property
        detailed_properties = []
        for similar in similar_properties:
            property_data = Property.query.filter_by(id=similar['property_id']).first()
            if property_data:
                property_dict = property_data.to_dict()
                property_dict['similarity_score'] = similar['similarity_score']
                detailed_properties.append(property_dict)
        
        return jsonify({
            'success': True,
            'similar_properties': detailed_properties
        }), 200
    except Exception as e:
        logger.error(f"Error finding similar properties: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to find similar properties',
            'error': str(e)
        }), 500

@recommendations_bp.route('/api/trends/prices', methods=['GET'])
def get_price_trends():
    """Get price trends for properties, optionally filtered by parish or property type"""
    parish = request.args.get('parish')
    property_type = request.args.get('property_type')
    
    try:
        # Get price trends
        trends = recommendation_engine.analyze_price_trends(parish)
        
        return jsonify({
            'success': True,
            'trends': trends
        }), 200
    except Exception as e:
        logger.error(f"Error analyzing price trends: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to analyze price trends',
            'error': str(e)
        }), 500

@recommendations_bp.route('/api/properties/investment', methods=['GET'])
def get_investment_properties():
    """Get properties recommended for investment based on price trends"""
    parish = request.args.get('parish')
    property_type = request.args.get('property_type')
    limit = request.args.get('limit', 10, type=int)
    
    try:
        # Get investment properties
        investment_properties = recommendation_engine.analyze_price_trends(parish)
        
        # Sort by growth rate and limit results
        sorted_properties = sorted(
            investment_properties, 
            key=lambda x: x['growth_rate'], 
            reverse=True
        )[:limit]
        
        return jsonify({
            'success': True,
            'properties': sorted_properties
        }), 200
    except Exception as e:
        logger.error(f"Error finding investment properties: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to find investment properties',
            'error': str(e)
        }), 500

@recommendations_bp.route('/api/preferences', methods=['POST'])
@jwt_required()
def save_preferences():
    """Save user preferences with weights for property recommendations"""
    user_id = get_jwt_identity()
    preferences_data = request.json
    
    try:
        # Delete existing preferences
        UserPreference.query.filter_by(user_id=user_id).delete()
        
        # Save new preferences
        for pref in preferences_data:
            new_pref = UserPreference(
                user_id=user_id,
                preference_type=pref['preference_type'],
                value=pref['value'],
                weight=pref['weight']
            )
            db.session.add(new_pref)
            
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Preferences saved successfully'
        }), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error saving preferences: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to save preferences',
            'error': str(e)
        }), 500

@recommendations_bp.route('/api/preferences', methods=['GET'])
@jwt_required()
def get_preferences():
    """Get user preferences for property recommendations"""
    user_id = get_jwt_identity()
    
    try:
        preferences = UserPreference.query.filter_by(user_id=user_id).all()
        
        return jsonify({
            'success': True,
            'preferences': [pref.to_dict() for pref in preferences]
        }), 200
    except Exception as e:
        logger.error(f"Error fetching preferences: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to fetch preferences',
            'error': str(e)
        }), 500

@recommendations_bp.route('/api/properties/<int:property_id>/interaction', methods=['POST'])
@jwt_required()
def log_property_interaction(property_id):
    """Log user interaction with a property for collaborative filtering"""
    user_id = get_jwt_identity()
    action = request.json.get('action')  # view, like, save, etc.
    
    if not action:
        return jsonify({
            'success': False,
            'message': 'Action is required'
        }), 400
        
    try:
        # Check if property exists
        property_exists = Property.query.filter_by(id=property_id).first()
        if not property_exists:
            return jsonify({
                'success': False,
                'message': 'Property not found'
            }), 404
            
        # Log interaction
        UserPropertyInteraction.log_action(user_id, action, property_id)
        
        return jsonify({
            'success': True,
            'message': 'Interaction logged successfully'
        }), 200
    except Exception as e:
        logger.error(f"Error logging interaction: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to log interaction',
            'error': str(e)
        }), 500