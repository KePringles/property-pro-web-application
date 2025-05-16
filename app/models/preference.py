# app/models/preference.py
from datetime import datetime
from app import db
from sqlalchemy.dialects.postgresql import JSON
from app.models.property import UserPropertyInteraction

# Junction table for user preferences and amenities
user_preferred_amenities = db.Table('user_preferred_amenities',
    db.Column('pref_id', db.Integer, db.ForeignKey('user_preferences.pref_id'), primary_key=True),
    db.Column('amen_id', db.Integer, db.ForeignKey('amenities.amen_id'), primary_key=True)
)

class UserPreference(db.Model):
    __tablename__ = 'user_preferences'
    
    pref_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    min_price = db.Column(db.Numeric(15, 2))
    max_price = db.Column(db.Numeric(15, 2))
    min_bedrooms = db.Column(db.Integer)
    min_bathrooms = db.Column(db.Numeric(3, 1))
    min_area_sqft = db.Column(db.Numeric(10, 2))
    preferred_parish_id = db.Column(db.Integer, db.ForeignKey('parishes.parish_id'))
    preferred_city = db.Column(db.String(100))
    property_type_id = db.Column(db.Integer, db.ForeignKey('property_types.type_id'))
    is_for_sale = db.Column(db.Boolean)
    is_for_rent = db.Column(db.Boolean)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # New fields for ML recommendation system
    # Preference weights (1-5 scale)
    price_weight = db.Column(db.Integer, default=3)
    location_weight = db.Column(db.Integer, default=3)
    bedrooms_weight = db.Column(db.Integer, default=2)
    bathrooms_weight = db.Column(db.Integer, default=2)
    property_type_weight = db.Column(db.Integer, default=2)
    amenities_weight = db.Column(db.Integer, default=1)
    
    # Relationships
    user = db.relationship('User', back_populates='preferences')
    parish = db.relationship('Parish')
    property_type = db.relationship('PropertyType')
    preferred_amenities = db.relationship('Amenity', secondary=user_preferred_amenities)
    
    def to_dict(self):
        return {
            'pref_id': self.pref_id,
            'user_id': self.user_id,
            'min_price': float(self.min_price) if self.min_price else None,
            'max_price': float(self.max_price) if self.max_price else None,
            'min_bedrooms': self.min_bedrooms,
            'min_bathrooms': float(self.min_bathrooms) if self.min_bathrooms else None,
            'min_area_sqft': float(self.min_area_sqft) if self.min_area_sqft else None,
            'preferred_parish': self.parish.to_dict() if self.parish else None,
            'preferred_city': self.preferred_city,
            'property_type': self.property_type.to_dict() if self.property_type else None,
            'is_for_sale': self.is_for_sale,
            'is_for_rent': self.is_for_rent,
            'preferred_amenities': [amenity.to_dict() for amenity in self.preferred_amenities],
            # Include weights
            'weights': {
                'price': self.price_weight,
                'location': self.location_weight,
                'bedrooms': self.bedrooms_weight,
                'bathrooms': self.bathrooms_weight,
                'property_type': self.property_type_weight,
                'amenities': self.amenities_weight
            }
        }
    
    def to_ml_format(self):
        """Convert to the format expected by ML recommendation engine"""
        preferences = []
        
        # Price range preference
        if self.min_price is not None and self.max_price is not None:
            preferences.append({
                'preference_type': 'price_range',
                'value': [float(self.min_price), float(self.max_price)],
                'weight': self.price_weight
            })
        
        # Location preference
        if self.preferred_parish_id:
            parish_name = self.parish.name if self.parish else None
            if parish_name:
                preferences.append({
                    'preference_type': 'location',
                    'value': parish_name,
                    'weight': self.location_weight
                })
        elif self.preferred_city:
            preferences.append({
                'preference_type': 'location',
                'value': self.preferred_city,
                'weight': self.location_weight
            })
        
        # Bedrooms preference
        if self.min_bedrooms is not None:
            preferences.append({
                'preference_type': 'bedrooms',
                'value': self.min_bedrooms,
                'weight': self.bedrooms_weight
            })
        
        # Bathrooms preference
        if self.min_bathrooms is not None:
            preferences.append({
                'preference_type': 'bathrooms',
                'value': float(self.min_bathrooms),
                'weight': self.bathrooms_weight
            })
        
        # Property type preference
        if self.property_type_id:
            property_type_name = self.property_type.name if self.property_type else None
            if property_type_name:
                preferences.append({
                    'preference_type': 'property_type',
                    'value': property_type_name,
                    'weight': self.property_type_weight
                })
        
        # Amenities preferences
        if self.preferred_amenities:
            amenity_names = [amenity.name for amenity in self.preferred_amenities]
            if amenity_names:
                preferences.append({
                    'preference_type': 'amenities',
                    'value': amenity_names,
                    'weight': self.amenities_weight
                })
        
        return preferences
