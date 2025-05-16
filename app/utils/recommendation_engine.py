# app/utils/recommendation_engine.py
import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import MinMaxScaler
from scipy.sparse import csr_matrix
from sklearn.neighbors import NearestNeighbors
import logging
from app.utils.ml_recommendation import MLPropertyRecommender

logger = logging.getLogger(__name__)

class PropertyRecommendationEngine:
    """Unified recommendation engine that combines multiple approaches"""
    
    def __init__(self, db_connection):
        self.db = db_connection
        self.scaler = MinMaxScaler()
        self.ml_recommender = MLPropertyRecommender(db_connection)
        
        # Try to train the ML model if needed
        try:
            self.ml_recommender.train_model()
        except Exception as e:
            logger.error(f"Error training ML model: {str(e)}")
    
    def fetch_properties(self):
        """Fetch all properties with their features from the database"""
        # Replace with your actual database query
        query = """
        SELECT p.id as property_id, p.title, p.price, p.bedrooms, p.bathrooms, p.area, 
               p.property_type, p.parish, p.latitude, p.longitude,
               ARRAY_AGG(a.name) as amenities
        FROM properties p
        LEFT JOIN property_amenities pa ON p.id = pa.property_id
        LEFT JOIN amenities a ON pa.amenity_id = a.id
        WHERE p.status = 'active'
        GROUP BY p.id;
        """
        # Execute query and convert to DataFrame
        # This is pseudocode - adapt to your actual DB connection
        properties_df = pd.DataFrame(self.db.execute_query(query))
        return properties_df
        
    def fetch_user_preferences(self, user_id):
        """Fetch user preferences including their weights"""
        # Replace with your actual database query
        query = f"""
        SELECT preference_type, value, weight
        FROM user_preferences
        WHERE user_id = {user_id};
        """
        # Execute query and convert to DataFrame
        preferences_df = pd.DataFrame(self.db.execute_query(query))
        return preferences_df
        
    def preprocess_properties(self, properties_df):
        """Preprocess property data for similarity calculations"""
        # Create feature vectors
        # Numerical features
        numerical_features = properties_df[['price', 'bedrooms', 'bathrooms', 'area']]
        scaled_numerical = self.scaler.fit_transform(numerical_features)
        
        # Categorical features (one-hot encoding)
        cat_features = pd.get_dummies(properties_df[['property_type', 'parish']])
        
        # Extract amenities (assuming amenities is a list/array column)
        all_amenities = set()
        for amenities in properties_df['amenities']:
            if amenities:
                all_amenities.update(amenities)
                
        # Create amenity features
        amenity_features = pd.DataFrame()
        for amenity in all_amenities:
            amenity_features[amenity] = properties_df['amenities'].apply(
                lambda x: 1 if amenity in x else 0
            )
            
        # Combine all features
        feature_matrix = np.hstack([
            scaled_numerical, 
            cat_features.values,
            amenity_features.values
        ])
        
        return feature_matrix, properties_df['property_id'].values
    
    def calculate_weighted_score(self, properties_df, user_preferences):
        """Calculate weighted score based on user preferences"""
        scores = np.zeros(len(properties_df))
        
        # Process each preference
        for _, pref in user_preferences.iterrows():
            pref_type = pref['preference_type']
            pref_value = pref['value']
            weight = pref['weight']
            
            if pref_type == 'price_range':
                # Price range preference (lower score for further from target)
                min_price, max_price = pref_value
                price_scores = 1 - np.minimum(
                    np.abs(properties_df['price'] - min_price),
                    np.abs(properties_df['price'] - max_price)
                ) / max(properties_df['price'].max() - properties_df['price'].min(), 1)
                scores += weight * price_scores
                
            elif pref_type == 'location':
                # Location preference (parish or coordinates)
                if isinstance(pref_value, str):
                    # Parish matching
                    location_scores = (properties_df['parish'] == pref_value).astype(float)
                else:
                    # Distance-based scoring (lat/lon)
                    pref_lat, pref_lon = pref_value
                    distances = np.sqrt(
                        (properties_df['latitude'] - pref_lat)**2 +
                        (properties_df['longitude'] - pref_lon)**2
                    )
                    max_dist = distances.max() or 1
                    location_scores = 1 - (distances / max_dist)
                scores += weight * location_scores
                
            elif pref_type == 'bedrooms':
                # Bedroom preference
                bedroom_scores = 1 - np.abs(properties_df['bedrooms'] - pref_value) / properties_df['bedrooms'].max()
                scores += weight * bedroom_scores
                
            elif pref_type == 'property_type':
                # Property type preference
                type_scores = (properties_df['property_type'] == pref_value).astype(float)
                scores += weight * type_scores
                
            elif pref_type == 'amenities':
                # Amenity preferences
                for amenity in pref_value:
                    amenity_scores = properties_df['amenities'].apply(
                        lambda x: 1 if amenity in x else 0
                    )
                    scores += (weight / len(pref_value)) * amenity_scores
        
        return scores
    
    def get_similar_properties(self, property_id, n=5):
        """Find similar properties using cosine similarity"""
        properties_df = self.fetch_properties()
        feature_matrix, property_ids = self.preprocess_properties(properties_df)
        
        # Calculate similarity matrix
        similarity_matrix = cosine_similarity(feature_matrix)
        
        # Find the index of the target property
        target_idx = np.where(property_ids == property_id)[0][0]
        
        # Get similarity scores for the target property
        similarities = similarity_matrix[target_idx]
        
        # Get indices of most similar properties (excluding self)
        similar_indices = np.argsort(similarities)[::-1][1:n+1]
        
        # Return similar property IDs and their similarity scores
        similar_properties = [
            {
                'property_id': int(property_ids[idx]),
                'similarity_score': float(similarities[idx])
            }
            for idx in similar_indices
        ]
        
        return similar_properties
    
    def collaborative_filtering(self, user_id, n=5):
        """Recommend properties based on similar users' preferences"""
        # Get user interactions (views, likes, saves)
        query = """
        SELECT user_id, property_id, 
               SUM(CASE WHEN action = 'view' THEN 1 ELSE 0 END) as views,
               SUM(CASE WHEN action = 'like' THEN 5 ELSE 0 END) as likes,
               SUM(CASE WHEN action = 'save' THEN 10 ELSE 0 END) as saves
        FROM property_interactions
        GROUP BY user_id, property_id;
        """
        interactions_df = pd.DataFrame(self.db.execute_query(query))
        
        if interactions_df.empty:
            logger.warning("No interaction data for collaborative filtering")
            return []
            
        # Create interaction strength column
        interactions_df['strength'] = interactions_df['views'] + interactions_df['likes'] + interactions_df['saves']
        
        # Create user-item matrix
        user_item_df = interactions_df.pivot(
            index='user_id', 
            columns='property_id', 
            values='strength'
        ).fillna(0)
        
        # Check if we have enough data
        if user_item_df.shape[0] < 2:  # Need at least 2 users
            logger.warning("Not enough users for collaborative filtering")
            return []
            
        # Convert to sparse matrix for efficiency
        user_item_matrix = csr_matrix(user_item_df.values)
        
        # Find similar users using k-nearest neighbors
        model = NearestNeighbors(metric='cosine', algorithm='brute')
        model.fit(user_item_matrix)
        
        # Find the index of the target user
        if user_id not in user_item_df.index:
            logger.warning(f"User {user_id} not found in interaction data")
            return []
            
        user_idx = user_item_df.index.get_loc(user_id)
        
        # Get nearest neighbors
        distances, indices = model.kneighbors(
            user_item_matrix[user_idx].reshape(1, -1), 
            n_neighbors=min(6, user_item_df.shape[0])  # +1 because it will find the user itself
        )
        
        # Skip the first result (the user itself)
        similar_user_indices = indices.flatten()[1:]
        similar_user_ids = [user_item_df.index[idx] for idx in similar_user_indices]
        
        # Get properties liked by similar users but not interacted by the target user
        user_properties = set(interactions_df[interactions_df['user_id'] == user_id]['property_id'])
        
        recommended_properties = []
        for sim_user_id in similar_user_ids:
            sim_user_properties = interactions_df[
                (interactions_df['user_id'] == sim_user_id) & 
                (interactions_df['strength'] > 5)  # Consider only strong interactions
            ]['property_id'].tolist()
            
            for prop_id in sim_user_properties:
                if prop_id not in user_properties and prop_id not in [p['property_id'] for p in recommended_properties]:
                    recommended_properties.append({
                        'property_id': int(prop_id),
                        'recommendation_type': 'collaborative'
                    })
                    
                    if len(recommended_properties) >= n:
                        return recommended_properties
        
        return recommended_properties
    
    def analyze_price_trends(self, parish=None):
        """Analyze price trends to identify investment opportunities"""
        # Get historical price data
        query = """
        SELECT parish, property_type, 
               DATE_TRUNC('month', date_added) as month,
               AVG(price) as avg_price,
               COUNT(*) as num_properties
        FROM properties
        WHERE status = 'sold' OR status = 'active'
        """
        
        if parish:
            query += f" AND parish = '{parish}'"
            
        query += """
        GROUP BY parish, property_type, DATE_TRUNC('month', date_added)
        ORDER BY parish, property_type, month;
        """
        
        price_data = pd.DataFrame(self.db.execute_query(query))
        
        if price_data.empty:
            logger.warning("No price data available for trend analysis")
            return []
            
        # Calculate 3-month rolling average and growth rate
        price_data['rolling_avg_price'] = price_data.groupby(['parish', 'property_type'])['avg_price'].transform(
            lambda x: x.rolling(window=3, min_periods=1).mean()
        )
        
        # Calculate month-over-month growth rate
        price_data['price_growth'] = price_data.groupby(['parish', 'property_type'])['rolling_avg_price'].pct_change()
        
        # Identify areas with consistent growth
        growth_areas = price_data.groupby(['parish', 'property_type']).agg({
            'price_growth': ['mean', 'std'],
            'num_properties': 'sum'
        }).reset_index()
        
        # Filter for areas with positive average growth and sufficient data
        investment_areas = growth_areas[
            (growth_areas[('price_growth', 'mean')] > 0.01) &  # >1% average growth
            (growth_areas[('num_properties', 'sum')] >= 5)     # At least 5 properties
        ]
        
        if investment_areas.empty:
            logger.warning("No growth areas identified")
            return []
            
        # Get active properties in growth areas
        growth_parishes = investment_areas['parish'].unique()
        growth_types = investment_areas['property_type'].unique()
        
        # Find properties in these growth areas
        query = """
        SELECT id as property_id, title, parish, property_type, price
        FROM properties
        WHERE status = 'active' AND (
        """
        
        conditions = []
        for parish in growth_parishes:
            for prop_type in growth_types:
                conditions.append(f"(parish = '{parish}' AND property_type = '{prop_type}')")
                
        if not conditions:
            logger.warning("No conditions for investment property query")
            return []
                
        query += " OR ".join(conditions) + ");"
        
        investment_properties = pd.DataFrame(self.db.execute_query(query))
        
        if investment_properties.empty:
            logger.warning("No active properties in growth areas")
            return []
            
        # Return as list of dicts
        results = []
        for _, prop in investment_properties.iterrows():
            parish_growth = investment_areas[
                (investment_areas['parish'] == prop['parish']) & 
                (investment_areas['property_type'] == prop['property_type'])
            ]
            
            growth_rate = float(parish_growth[('price_growth', 'mean')].iloc[0]) if not parish_growth.empty else 0
            
            results.append({
                'property_id': int(prop['property_id']),
                'title': prop['title'],
                'parish': prop['parish'],
                'property_type': prop['property_type'],
                'price': float(prop['price']),
                'growth_rate': growth_rate,
                'recommendation_type': 'investment'
            })
            
        return results
    
    def recommend_properties(self, user_id, limit=10):
        """Main recommendation function combining all approaches including ML"""
        all_recommendations = []
        
        try:
            # 1. Get ML-based recommendations
            ml_recommendations = self.ml_recommender.recommend_properties(user_id, limit=limit)
            all_recommendations.extend(ml_recommendations)
            
            # 2. Get weighted preference-based recommendations
            user_preferences = self.fetch_user_preferences(user_id)
            if not user_preferences.empty:
                properties_df = self.fetch_properties()
                preference_scores = self.calculate_weighted_score(properties_df, user_preferences)
                
                # Get top properties by preference score
                top_indices = np.argsort(preference_scores)[::-1][:limit]
                
                for idx in top_indices:
                    prop_id = int(properties_df.iloc[idx]['property_id'])
                    
                    # Check if already in recommendations
                    if not any(r['property_id'] == prop_id for r in all_recommendations):
                        all_recommendations.append({
                            'property_id': prop_id,
                            'title': properties_df.iloc[idx]['title'],
                            'price': float(properties_df.iloc[idx]['price']),
                            'parish': properties_df.iloc[idx]['parish'],
                            'bedrooms': int(properties_df.iloc[idx]['bedrooms']) if pd.notna(properties_df.iloc[idx]['bedrooms']) else None,
                            'bathrooms': int(properties_df.iloc[idx]['bathrooms']) if pd.notna(properties_df.iloc[idx]['bathrooms']) else None,
                            'property_type': properties_df.iloc[idx]['property_type'],
                            'score': float(preference_scores[idx]),
                            'recommendation_types': ['preference']
                        })
            
            # 3. Get collaborative filtering recommendations
            collaborative_recs = self.collaborative_filtering(user_id)
            
            # Get property details for collaborative recommendations
            if collaborative_recs:
                collab_prop_ids = [rec['property_id'] for rec in collaborative_recs]
                prop_ids_str = ', '.join(str(pid) for pid in collab_prop_ids)
                
                query = f"""
                SELECT id as property_id, title, price, parish, bedrooms, bathrooms, property_type
                FROM properties
                WHERE id IN ({prop_ids_str});
                """
                
                collab_props_df = pd.DataFrame(self.db.execute_query(query))
                
                for rec in collaborative_recs:
                    prop_id = rec['property_id']
                    
                    # Check if already in recommendations
                    if not any(r['property_id'] == prop_id for r in all_recommendations):
                        prop_data = collab_props_df[collab_props_df['property_id'] == prop_id]
                        
                        if not prop_data.empty:
                            all_recommendations.append({
                                'property_id': int(prop_id),
                                'title': prop_data.iloc[0]['title'],
                                'price': float(prop_data.iloc[0]['price']),
                                'parish': prop_data.iloc[0]['parish'],
                                'bedrooms': int(prop_data.iloc[0]['bedrooms']) if pd.notna(prop_data.iloc[0]['bedrooms']) else None,
                                'bathrooms': int(prop_data.iloc[0]['bathrooms']) if pd.notna(prop_data.iloc[0]['bathrooms']) else None,
                                'property_type': prop_data.iloc[0]['property_type'],
                                'recommendation_types': ['collaborative']
                            })
            
            # 4. Get investment recommendations
            investment_recs = self.analyze_price_trends()
            
            for rec in investment_recs:
                prop_id = rec['property_id']
                
                # Check if property is already in recommendations
                existing_rec = next((r for r in all_recommendations if r['property_id'] == prop_id), None)
                
                if existing_rec:
                    # Add investment tag to existing recommendation
                    if 'investment' not in existing_rec['recommendation_types']:
                        existing_rec['recommendation_types'].append('investment')
                else:
                    # Add as new recommendation
                    all_recommendations.append({
                        'property_id': prop_id,
                        'title': rec['title'],
                        'price': rec['price'],
                        'parish': rec['parish'],
                        'property_type': rec['property_type'],
                        'growth_rate': rec['growth_rate'],
                        'recommendation_types': ['investment']
                    })
            
            # Ensure we return only the requested number of recommendations
            if len(all_recommendations) > limit:
                # Prioritize properties with multiple recommendation types
                all_recommendations.sort(key=lambda x: len(x.get('recommendation_types', [])), reverse=True)
                all_recommendations = all_recommendations[:limit]
            
            return all_recommendations
            
        except Exception as e:
            logger.error(f"Error in recommendation engine: {str(e)}")
            return []

    def retrain_ml_model(self):
        """Force retraining of the ML recommendation model"""
        try:
            return self.ml_recommender.train_model(force=True)
        except Exception as e:
            logger.error(f"Error retraining ML model: {str(e)}")
            return False