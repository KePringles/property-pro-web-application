# app/routes/property_alerts.py
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.alert import PropertyAlert
from app import db
import logging

logger = logging.getLogger(__name__)
property_alerts_bp = Blueprint('property_alerts', __name__)

@property_alerts_bp.route('/api/property-alerts', methods=['POST'])
@jwt_required()
def create_property_alert():
    """Create a new property alert for the user"""
    user_id = get_jwt_identity()
    alert_data = request.json
    
    try:
        # Basic validation
        if not alert_data.get('name'):
            return jsonify({
                'success': False,
                'message': 'Alert name is required'
            }), 400
            
        # Create new alert
        new_alert = PropertyAlert(
            user_id=user_id,
            name=alert_data.get('name'),
            criteria=alert_data.get('criteria', {}),
            frequency=alert_data.get('frequency', 'daily'),
            email_notifications=alert_data.get('email_notifications', True),
            push_notifications=alert_data.get('push_notifications', False)
        )
        
        db.session.add(new_alert)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Property alert created successfully',
            'alert': new_alert.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error creating property alert: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to create property alert',
            'error': str(e)
        }), 500

@property_alerts_bp.route('/api/property-alerts', methods=['GET'])
@jwt_required()
def get_user_property_alerts():
    """Get all property alerts for the user"""
    user_id = get_jwt_identity()
    
    try:
        alerts = PropertyAlert.query.filter_by(user_id=user_id).all()
        
        return jsonify({
            'success': True,
            'alerts': [alert.to_dict() for alert in alerts]
        }), 200
    except Exception as e:
        logger.error(f"Error fetching property alerts: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to fetch property alerts',
            'error': str(e)
        }), 500