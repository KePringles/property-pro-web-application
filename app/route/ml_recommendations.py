# app/routes/ml_recommendations.py
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User
from app.models.property import Property, UserPropertyInteraction
from app import db
from app.utils.recommendation_engine import PropertyRecommendationEngine
import logging
import pandas as pd

logger = logging.getLogger(__name__)
ml_bp = Blueprint('ml_recommendations', __name__)
recommendation_engine = PropertyRecommendationEngine(db)

@ml_bp.route('/api/recommendations/ml', methods=['GET'])
@jwt_required()
def get_ml_recommendations():
    """Get machine learning-based property recommendations for the user"""
    user_id = get_jwt_identity()
    limit = request.args.get('limit', 10, type=int)
    
    try:
        # Get ML-based recommendations
        recommendations = recommendation_engine.ml_recommender.recommend_properties(user_id, limit)
        
        # Add detailed property information
        detailed_recommendations = []
        for rec in recommendations:
            property_data = Property.query.filter_by(id=rec['property_id']).first()
            if property_data:
                property_dict = property_data.to_dict()
                property_dict['ml_score'] = rec['score']
                property_dict['recommendation_types'] = rec['recommendation_types']
                detailed_recommendations.append(property_dict)
        
        # Log this interaction for future training
        UserPropertyInteraction.log_action(user_id, 'ml_recommendation_view', None)
        
        return jsonify({
            'success': True,
            'recommendations': detailed_recommendations
        }), 200
    except Exception as e:
        logger.error(f"Error in ML recommendations: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to generate ML recommendations',
            'error': str(e)
        }), 500

@ml_bp.route('/api/recommendations/ml/retrain', methods=['POST'])
@jwt_required()
def retrain_ml_model():
    """Trigger retraining of the ML recommendation model (admin only)"""
    user_id = get_jwt_identity()
    
    # Check if user is admin
    user = User.query.filter_by(id=user_id).first()
    if not user or user.user_type != 'admin':
        return jsonify({
            'success': False,
            'message': 'Only administrators can retrain the ML model'
        }), 403
    
    try:
        success = recommendation_engine.retrain_ml_model()
        
        if success:
            return jsonify({
                'success': True,
                'message': 'ML model retrained successfully'
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': 'Failed to retrain ML model'
            }), 500
    except Exception as e:
        logger.error(f"Error retraining ML model: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Error retraining ML model',
            'error': str(e)
        }), 500

@ml_bp.route('/api/recommendations/ml/stats', methods=['GET'])
@jwt_required()
def get_ml_stats():
    """Get statistics about the ML recommendation model (admin only)"""
    user_id = get_jwt_identity()
    
    # Check if user is admin
    user = User.query.filter_by(id=user_id).first()
    if not user or user.user_type != 'admin':
        return jsonify({
            'success': False,
            'message': 'Only administrators can view ML model statistics'
        }), 403
    
    try:
        # Get training data stats
        interaction_count = UserPropertyInteraction.query.count()
        user_count = db.session.query(UserPropertyInteraction.user_id.distinct()).count()
        property_count = db.session.query(UserPropertyInteraction.property_id.distinct()).count()
        
        # Get model info if available
        model_info = {}
        if hasattr(recommendation_engine.ml_recommender, 'model') and recommendation_engine.ml_recommender.model:
            model_data = recommendation_engine.ml_recommender._load_model()
            if model_data:
                model_info = {
                    'trained_at': model_data.get('trained_at', 'Unknown'),
                    'feature_count': len(model_data.get('feature_cols', [])),
                    'model_type': str(model_data.get('model', 'Unknown'))
                }
        
        return jsonify({
            'success': True,
            'stats': {
                'interaction_count': interaction_count,
                'user_count': user_count,
                'property_count': property_count,
                'model_info': model_info
            }
        }), 200
    except Exception as e:
        logger.error(f"Error getting ML stats: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Error retrieving ML statistics',
            'error': str(e)
        }), 500

@ml_bp.route('/api/properties/<int:property_id>/prediction', methods=['GET'])
@jwt_required()
def get_property_prediction(property_id):
    """Get ML prediction for a specific property for the current user"""
    user_id = get_jwt_identity()
    
    try:
        # Check if property exists
        property_data = Property.query.filter_by(id=property_id).first()
        if not property_data:
            return jsonify({
                'success': False,
                'message': 'Property not found'
            }), 404
        
        # Convert to DataFrame for prediction
        property_df = pd.DataFrame([{
            'property_id': property_data.id,
            'price': property_data.price,
            'parish': property_data.parish,
            'bedrooms': property_data.bedrooms,
            'bathrooms': property_data.bathrooms,
            'area': property_data.area,
            'property_type': property_data.property_type,
            'amenities': [a.name for a in property_data.amenities]
        }])
        
        # Get prediction
        prediction_result = recommendation_engine.ml_recommender.predict_user_interest(user_id, property_df)
        
        if prediction_result is None or prediction_result.empty:
            return jsonify({
                'success': False,
                'message': 'Unable to generate prediction'
            }), 500
        
        # Return the prediction
        prediction = float(prediction_result.iloc[0]['predicted_interest'])
        
        # Log this interaction
        UserPropertyInteraction.log_action(user_id, 'prediction_view', property_id)
        
        return jsonify({
            'success': True,
            'property_id': property_id,
            'prediction': {
                'interest_score': prediction,
                'match_percentage': min(100, max(0, prediction * 20)),  # Convert to percentage (0-100%)
                'explanation': get_prediction_explanation(prediction)
            }
        }), 200
    except Exception as e:
        logger.error(f"Error in property prediction: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to generate prediction',
            'error': str(e)
        }), 500

def get_prediction_explanation(score):
    """Generate an explanation for a prediction score"""
    if score >= 4.5:
        return "This property is an exceptional match for your preferences and browsing history."
    elif score >= 3.5:
        return "This property is a very good match based on your preferences."
    elif score >= 2.5:
        return "This property matches several of your preferences."
    elif score >= 1.5:
        return "This property matches some of your preferences."
    else:
        return "This property may not be the best match for your preferences."
    
    
ml_recommendations_bp = ml_bp
