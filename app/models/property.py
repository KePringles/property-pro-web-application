from datetime import datetime
from app import db
import json
from sqlalchemy.dialects.postgresql import JSONB

# Existing reference tables
class PropertyType(db.Model):
    __tablename__ = 'property_types'
    
    type_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    
    # Relationships
    properties = db.relationship('Property', back_populates='property_type')
    
    def to_dict(self):
        return {
            'type_id': self.type_id,
            'name': self.name
        }


class Parish(db.Model):
    __tablename__ = 'parishes'
    
    parish_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    
    # Relationships
    properties = db.relationship('Property', back_populates='parish')
    
    def to_dict(self):
        return {
            'parish_id': self.parish_id,
            'name': self.name
        }


class Amenity(db.Model):
    __tablename__ = 'amenities'
    
    amen_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    
    def to_dict(self):
        return {
            'amen_id': self.amen_id,
            'name': self.name
        }


# Junction table for property-amenities many-to-many relationship
property_amenities = db.Table('property_amenities',
    db.Column('prop_id', db.Integer, db.ForeignKey('properties.prop_id'), primary_key=True),
    db.Column('amen_id', db.Integer, db.ForeignKey('amenities.amen_id'), primary_key=True)
)


# Updated Property model with status and custom amenities

class Property(db.Model):
    __tablename__ = 'properties'
    
    prop_id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    price = db.Column(db.Numeric(15, 2), nullable=False)
    property_type_id = db.Column(db.Integer, db.ForeignKey('property_types.type_id'))
    bedrooms = db.Column(db.Integer)
    bathrooms = db.Column(db.Numeric(3, 1))
    area_sqft = db.Column(db.Numeric(10, 2))
    address = db.Column(db.Text)
    city = db.Column(db.String(100))
    parish_id = db.Column(db.Integer, db.ForeignKey('parishes.parish_id'))
    latitude = db.Column(db.Numeric(10, 7))
    longitude = db.Column(db.Numeric(10, 7))
    is_for_sale = db.Column(db.Boolean, default=True)
    is_for_rent = db.Column(db.Boolean, default=False)
    monthly_rent = db.Column(db.Numeric(15, 2))
    owner_id = db.Column(db.Integer, db.ForeignKey('users.user_id'))
    agent_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=True)  # Added agent_id relationship
    contact_phone = db.Column(db.String(50))
    contact_email = db.Column(db.String(255))
    listing_url = db.Column(db.String(255))
    client_id = db.Column(db.Integer, db.ForeignKey('clients.id', ondelete='CASCADE'), nullable=True)
    client = db.relationship('Client', back_populates='properties')

    
    # New fields
    status = db.Column(db.String(20), default='Active')  # Active, Pending, Sold, Rented, Inactive, etc.
    custom_amenities = db.Column(JSONB, nullable=True)  # Store custom amenities as JSON string
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    property_type = db.relationship('PropertyType', back_populates='properties')
    parish = db.relationship('Parish', back_populates='properties')
    owner = db.relationship('User', foreign_keys=[owner_id], back_populates='properties')
    agent = db.relationship('User', foreign_keys=[agent_id], back_populates='managed_properties')
    images = db.relationship('PropertyImage', back_populates='property', cascade='all, delete-orphan')
    amenities = db.relationship('Amenity', secondary='property_amenities')
    saved_by = db.relationship('SavedProperty', back_populates='property', cascade='all, delete-orphan')
    interactions = db.relationship('UserPropertyInteraction', back_populates='property', cascade='all, delete-orphan')
    
    def get_custom_amenities(self):
        """Get the property's custom amenities as a list"""
        if not self.custom_amenities:
            return []
        return self.custom_amenities  # JSONB already handles the serialization

    def set_custom_amenities(self, amenities_list):
        """Set the property's custom amenities from a list"""
        if isinstance(amenities_list, list):
            self.custom_amenities = amenities_list
        else:
            self.custom_amenities = [str(amenities_list)]
    
    def to_dict(self, include_owner=False):
        result = {
            'prop_id': self.prop_id,
            'title': self.title,
            'description': self.description,
            'price': float(self.price) if self.price else None,
            'property_type': self.property_type.to_dict() if self.property_type else None,
            'bedrooms': self.bedrooms,
            'bathrooms': float(self.bathrooms) if self.bathrooms else None,
            'area_sqft': float(self.area_sqft) if self.area_sqft else None,
            'address': self.address,
            'city': self.city,
            'parish': self.parish.to_dict() if self.parish else None,
            'latitude': float(self.latitude) if self.latitude else None,
            'longitude': float(self.longitude) if self.longitude else None,
            'is_for_sale': self.is_for_sale,
            'is_for_rent': self.is_for_rent,
            'monthly_rent': float(self.monthly_rent) if self.monthly_rent else None,
            'contact_phone': self.contact_phone,
            'contact_email': self.contact_email,
            'listing_url': self.listing_url,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'images': [img.to_dict() for img in self.images],
            'amenities': [amenity.to_dict() for amenity in self.amenities],
            'custom_amenities': self.get_custom_amenities(),
            'status': self.status,
            'agent_id': self.agent_id
        }
        
        if include_owner and self.owner:
            result['owner'] = self.owner.to_dict()
            
        return result

class PropertyImage(db.Model):
    __tablename__ = 'property_images'
    
    image_id = db.Column(db.Integer, primary_key=True)
    prop_id = db.Column(db.Integer, db.ForeignKey('properties.prop_id'), nullable=False)
    image_url = db.Column(db.String(255), nullable=False)
    is_primary = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    property = db.relationship('Property', back_populates='images')
    
    def to_dict(self):
        return {
            'image_id': self.image_id,
            'prop_id': self.prop_id,
            'image_url': self.image_url,
            'is_primary': self.is_primary,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class SavedProperty(db.Model):
    __tablename__ = 'saved_properties'
    
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), primary_key=True)
    prop_id = db.Column(db.Integer, db.ForeignKey('properties.prop_id'), primary_key=True)
    saved_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', back_populates='saved_properties')
    property = db.relationship('Property', back_populates='saved_by')


class UserPropertyInteraction(db.Model):
    __tablename__ = 'user_property_interactions'
    
    interaction_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    prop_id = db.Column(db.Integer, db.ForeignKey('properties.prop_id'), nullable=False)
    view_count = db.Column(db.Integer, default=0)
    last_viewed = db.Column(db.DateTime)
    interaction_score = db.Column(db.Numeric(5, 2), default=0)  # For ML recommendation
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', back_populates='interactions')
    property = db.relationship('Property', back_populates='interactions')