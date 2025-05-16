# app/models/user.py
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from app import db
from app.models.property import UserPropertyInteraction
from app.models.alert import PropertyAlert

class User(db.Model):
    __tablename__ = 'users'

    user_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    email = db.Column(db.String(255), nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    user_type = db.Column(db.JSON, default=['property_seeker'])
    active_user_type = db.Column(db.String(50), nullable=False, default='property_seeker')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Updated constraint
    __table_args__ = (
        db.UniqueConstraint('email', 'active_user_type', name='uq_users_email_active_user_type'),
    )
    
    # All relationships
    roles = db.relationship('UserRole', back_populates='user', lazy=True, cascade='all, delete-orphan')
    profile = db.relationship('Profile', back_populates='user', uselist=False, cascade='all, delete-orphan')
    properties = db.relationship('Property', back_populates='owner', foreign_keys='Property.owner_id', cascade='all, delete-orphan')
    managed_properties = db.relationship('Property', back_populates='agent', foreign_keys='Property.agent_id')
    preferences = db.relationship('UserPreference', back_populates='user', uselist=False, cascade='all, delete-orphan')
    saved_properties = db.relationship('SavedProperty', back_populates='user', cascade='all, delete-orphan')
    search_history = db.relationship('SearchHistory', back_populates='user', cascade='all, delete-orphan')
    interactions = db.relationship('UserPropertyInteraction', back_populates='user', cascade='all, delete-orphan')
    account_switches = db.relationship('UserAccountSwitch', back_populates='user', cascade='all, delete-orphan')
    property_alerts = db.relationship('PropertyAlert', back_populates='user', lazy='dynamic')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password, method='pbkdf2:sha256')
        
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def get_user_types(self):
        """Returns user_type as a list of role strings"""
        if self.user_type is None:
            return ['property_seeker']
        
        if isinstance(self.user_type, list):
            # If it's already a list, return it
            if len(self.user_type) == 0:
                return ['property_seeker']
            return self.user_type
        elif isinstance(self.user_type, str):
            # If it's a string, wrap it in a list
            return [self.user_type]
        else:
            # Default fallback
            return ['property_seeker']
    
    def to_dict(self):
        return {
            'user_id': self.user_id,
            'email': self.email,
            'user_type': self.get_user_types(),
            'active_user_type': self.active_user_type,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
class Profile(db.Model):
    __tablename__ = 'profiles'
    
    profile_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    full_name = db.Column(db.String(255))
    phone_number = db.Column(db.String(50))
    profile_image_url = db.Column(db.String(255))
    company_name = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    occupation = db.Column(db.String(100))
    parish = db.Column(db.String(100))
    preferences = db.Column(db.JSON)  # dictionary of budget, amenities, etc.
    profile_image = db.Column(db.String(255))
    address = db.Column(db.String(255))
    bio = db.Column(db.Text)

    
    # Relationship - ONLY define this here, not duplicated from User model
    user = db.relationship('User', back_populates='profile')
    
    def to_dict(self):
        return {
            'full_name': self.full_name,
            'phone_number': self.phone_number,
            'address': self.address,
            'bio': self.bio,
            'occupation': self.occupation,
            'parish': self.parish,
            'preferences': self.preferences,
            'profile_image': self.profile_image
        }


class UserRole(db.Model):
    __tablename__ = 'user_role'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'))
    role = db.Column(db.String)
    
    # Define the relationship back to User
    user = db.relationship('User', back_populates='roles')

class UserAccountSwitch(db.Model):
    __tablename__ = 'user_account_switches'
    
    switch_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    from_user_type = db.Column(db.String(50), nullable=False)
    to_user_type = db.Column(db.String(50), nullable=False)
    switched_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship
    user = db.relationship('User', back_populates='account_switches')

