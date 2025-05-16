# app/models/alert.py
from datetime import datetime
from app import db

class PropertyAlert(db.Model):
    """
    PropertyAlert model for storing user property search alerts
    """
    __tablename__ = 'property_alerts'
    
    alert_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'))
    alert_name = db.Column(db.String(100), nullable=False)
    search_criteria = db.Column(db.JSON, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_run_at = db.Column(db.DateTime)
    is_active = db.Column(db.Boolean, default=True)
    
    # Notification preferences
    email_notification = db.Column(db.Boolean, default=True)
    push_notification = db.Column(db.Boolean, default=True)
    sms_notification = db.Column(db.Boolean, default=False)
    
    # Add this explicit relationship
    user = db.relationship('User', back_populates='property_alerts')
    
    def __repr__(self):
        return f'<PropertyAlert {self.alert_id} - {self.alert_name}>'
    
    def to_dict(self):
        """
        Convert the model to a dictionary
        """
        return {
            'alert_id': self.alert_id,
            'user_id': self.user_id,
            'alert_name': self.alert_name,
            'search_criteria': self.search_criteria,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_run_at': self.last_run_at.isoformat() if self.last_run_at else None,
            'is_active': self.is_active,
            'email_notification': self.email_notification,
            'push_notification': self.push_notification,
            'sms_notification': self.sms_notification
        }