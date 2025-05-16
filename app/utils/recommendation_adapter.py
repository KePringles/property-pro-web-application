# app/utils/recommendation_adapter.py
import pandas as pd
import numpy as np
from app.models.property import Property, PropertyImage, Amenity
from app.models.preference import UserPreference, UserPropertyInteraction
from app.models.property import Parish, PropertyType
from sqlalchemy import func, desc
from app import db

class DatabaseAdapter:
    """
    Adapter class to connect the recommendation engine with your database models.
    This handles database queries and converts data to the format needed by the ML recommender.
    """
    
    @staticmethod
    def execute_query(query_string, params=None):
        """Execute raw SQL query and return results as a list of dictionaries"""
        if params:
            result = db.session.execute(query_string, params).fetchall()
        else:
            result = db.session.execute(query_string).fetchall()
            
        # Convert to list of dictionaries
        column_names = result.keys() if result else []
        return [dict(zip(column_names, row)) for row in result]
    
    @staticmethod
    def get_user_preferences(user_id):
        """Get user preferences in format needed for ML recommendation"""
        user_pref = UserPreference.query.filter_by(user_id=user_id).first()
        
        if not user_pref:
            return pd.DataFrame()  # Empty DataFrame if no preferences
            
        # Convert to format expected by recommender
        preferences = user_pref.to_ml_format()
        return pd.DataFrame(preferences)
    
    @staticmethod
    def get_property_data(property_id=None, limit=None):
        """Get property data in format needed for ML recommendation"""
        query = db.session.query(
            Property.prop_id.label('property_id'),
            Property.title,
            Property.description,
            Property.price,
            Property.bedrooms,
            Property.bathrooms,
            Property.area_sqft.label('area'),
            PropertyType.name.label('property_type'),
            Parish.name.label('parish'),
            Property.latitude,
            Property.longitude,
            func.array_agg(Amenity.name).label('amenities')
        ).join(
            PropertyType, Property.property_type_id == PropertyType.type_id
        ).outerjoin(
            Parish, Property.parish_id == Parish.parish_id
        ).outerjoin(
            Property.amenities
        ).group_by(
            Property.prop_id,
            PropertyType.name,
            Parish.name
        )
        
        if property_id:
            query = query.filter(Property.prop_id == property_id)
            
        if limit:
            query = query.limit(limit)
            
        result = query.all()
        
        # Convert SQLAlchemy result to pandas DataFrame
        if not result:
            return pd.DataFrame()
            
        data = [{
            'property_id': row.property_id,
            'title': row.title,
            'price': float(row.price) if row.price else 0,
            'bedrooms': row.bedrooms,
            'bathrooms': float(row.bathrooms) if row.bathrooms else None,
            'area': float(row.area) if row.area else None,
            'property_type': row.property_type,
            'parish': row.parish,
            'latitude': float(row.latitude) if row.latitude else None,
            'longitude': float(row.longitude) if row.longitude else None,
            'amenities': [a for a in row.amenities if a is not None]
        } for row in result]
        
        return pd.DataFrame(data)
    
    @staticmethod
    def get_user_interactions(user_id=None, limit=None):
        """Get user interaction data for collaborative filtering"""
        query = db.session.query(
            UserPropertyInteraction.user_id,
            UserPropertyInteraction.prop_id.label('property_id'),
            UserPropertyInteraction.action,
            func.count(UserPropertyInteraction.id).label('interaction_count'),
            func.max(UserPropertyInteraction.timestamp).label('last_interaction')
        ).group_by(
            UserPropertyInteraction.user_id,
            UserPropertyInteraction.prop_id,
            UserPropertyInteraction.action
        )
        
        if user_id:
            query = query.filter(UserPropertyInteraction.user_id == user_id)
            
        if limit:
            query = query.limit(limit)
            
        result = query.all()
        
        # Convert to DataFrame
        if not result:
            return pd.DataFrame()
            
        data = [{
            'user_id': row.user_id,
            'property_id': row.property_id,
            'action': row.action,
            'interaction_count': row.interaction_count,
            'last_interaction': row.last_interaction
        } for row in result]
        
        return pd.DataFrame(data)
    
    @staticmethod
    def get_price_trend_data(parish=None):
        """Get price trend data for investment recommendation"""
        # This is an approximation - adapt to your actual database schema
        query = db.session.query(
            Parish.name.label('parish'),
            PropertyType.name.label('property_type'),
            func.date_trunc('month', Property.created_at).label('month'),
            func.avg(Property.price).label('avg_price'),
            func.count(Property.prop_id).label('num_properties')
        ).join(
            PropertyType, Property.property_type_id == PropertyType.type_id
        ).join(
            Parish, Property.parish_id == Parish.parish_id
        ).group_by(
            Parish.name,
            PropertyType.name,
            func.date_trunc('month', Property.created_at)
        ).order_by(
            Parish.name,
            PropertyType.name,
            func.date_trunc('month', Property.created_at)
        )
        
        if parish:
            query = query.filter(Parish.name == parish)
            
        result = query.all()
        
        # Convert to DataFrame
        if not result:
            return pd.DataFrame()
            
        data = [{
            'parish': row.parish,
            'property_type': row.property_type,
            'month': row.month,
            'avg_price': float(row.avg_price) if row.avg_price else 0,
            'num_properties': row.num_properties
        } for row in result]
        
        return pd.DataFrame(data)
    
    @staticmethod
    def prepare_recommendations_response(recommendations):
        """Convert recommendations from ML engine to API response format"""
        if not recommendations:
            return []
            
        property_ids = [rec['property_id'] for rec in recommendations]
        
        # Get full property details
        properties = Property.query.filter(Property.prop_id.in_(property_ids)).all()
        
        # Create mapping for quick lookup
        property_map = {p.prop_id: p for p in properties}
        
        # Create response with full property details
        result = []
        for rec in recommendations:
            prop_id = rec['property_id']
            prop = property_map.get(prop_id)
            
            if prop:
                # Convert property to dict
                prop_dict = prop.to_dict()
                
                # Add recommendation data
                prop_dict['ml_score'] = rec.get('score')
                prop_dict['recommendation_types'] = rec.get('recommendation_types', [])
                prop_dict['growth_rate'] = rec.get('growth_rate')
                
                result.append(prop_dict)
        
        return result