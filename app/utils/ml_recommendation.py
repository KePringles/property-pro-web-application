# app/utils/ml_recommendation.py
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
import joblib
import os
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class MLPropertyRecommender:
    """Machine learning model for predicting user property preferences"""
    
    def __init__(self, db_connection, model_dir='./ml_models'):
        self.db = db_connection
        self.model_dir = model_dir
        self.model_path = os.path.join(model_dir, 'property_preference_model.joblib')
        self.feature_cols = None
        self.model = None
        
        # Create model directory if it doesn't exist
        os.makedirs(model_dir, exist_ok=True)
        
        # Try to load existing model
        self._load_model()
    
    def _load_model(self):
        """Load pre-trained model if available"""
        try:
            if os.path.exists(self.model_path):
                model_data = joblib.load(self.model_path)
                self.model = model_data['model']
                self.feature_cols = model_data['feature_cols']
                logger.info(f"Loaded ML model from {self.model_path}")
                return True
        except Exception as e:
            logger.error(f"Error loading model: {str(e)}")
        
        logger.info("No ML model found, will need to train one")
        return False
    
    def _save_model(self):
        """Save trained model to disk"""
        try:
            model_data = {
                'model': self.model,
                'feature_cols': self.feature_cols,
                'trained_at': datetime.utcnow().isoformat()
            }
            joblib.dump(model_data, self.model_path)
            logger.info(f"Saved ML model to {self.model_path}")
            return True
        except Exception as e:
            logger.error(f"Error saving model: {str(e)}")
            return False
    
    def _get_training_data(self):
        """Fetch and prepare training data from database"""
        # Get user interactions with properties (views, likes, saves)
        interactions_query = """
        SELECT 
            pi.user_id,
            pi.property_id,
            pi.action,
            COUNT(*) as interaction_count,
            MAX(pi.timestamp) as last_interaction
        FROM 
            property_interactions pi
        GROUP BY 
            pi.user_id, pi.property_id, pi.action
        """
        interactions_df = pd.DataFrame(self.db.execute_query(interactions_query))
        
        if interactions_df.empty:
            logger.warning("No interaction data available for training")
            return None, None
        
        # Create features from interactions
        # Pivot to get different interaction types as columns
        interactions_pivot = interactions_df.pivot_table(
            index=['user_id', 'property_id'],
            columns='action',
            values='interaction_count',
            fill_value=0
        ).reset_index()
        
        # Get user preferences
        preferences_query = """
        SELECT 
            up.user_id,
            up.preference_type,
            up.value,
            up.weight
        FROM 
            user_preferences up
        """
        preferences_df = pd.DataFrame(self.db.execute_query(preferences_query))
        
        # Get property features
        properties_query = """
        SELECT 
            p.id as property_id,
            p.price,
            p.parish,
            p.bedrooms,
            p.bathrooms,
            p.area,
            p.property_type,
            ARRAY_AGG(a.name) as amenities
        FROM 
            properties p
        LEFT JOIN 
            property_amenities pa ON p.id = pa.property_id
        LEFT JOIN 
            amenities a ON pa.amenity_id = a.id
        GROUP BY 
            p.id
        """
        properties_df = pd.DataFrame(self.db.execute_query(properties_query))
        
        # Create target variable - user interest score
        # Higher weights for stronger interest actions
        interactions_pivot['interest_score'] = (
            interactions_pivot.get('view', 0) * 1 +
            interactions_pivot.get('like', 0) * 3 +
            interactions_pivot.get('save', 0) * 5 +
            interactions_pivot.get('contact', 0) * 8
        )
        
        # Merge all data
        training_data = pd.merge(
            interactions_pivot[['user_id', 'property_id', 'interest_score']],
            properties_df,
            on='property_id',
            how='inner'
        )
        
        # Add user preference match features
        if not preferences_df.empty:
            # This is a simplified approach - in production, you'd create more sophisticated features
            # based on how well each property matches each user's preferences
            for user_id in training_data['user_id'].unique():
                user_prefs = preferences_df[preferences_df['user_id'] == user_id]
                
                for _, row in training_data[training_data['user_id'] == user_id].iterrows():
                    property_id = row['property_id']
                    
                    # Calculate preference match scores and add as features
                    # Example: price match
                    price_pref = user_prefs[user_prefs['preference_type'] == 'price_range']
                    if not price_pref.empty:
                        price_range = price_pref.iloc[0]['value']
                        price_weight = price_pref.iloc[0]['weight']
                        property_price = row['price']
                        
                        in_range = (property_price >= price_range[0]) and (property_price <= price_range[1])
                        training_data.loc[
                            (training_data['user_id'] == user_id) & 
                            (training_data['property_id'] == property_id),
                            'price_match'
                        ] = 1 if in_range else 0
                        
                        training_data.loc[
                            (training_data['user_id'] == user_id) & 
                            (training_data['property_id'] == property_id),
                            'price_weight'
                        ] = price_weight
        
        # Extract features (X) and target (y)
        y = training_data['interest_score']
        
        # Drop columns that shouldn't be features
        X = training_data.drop(['interest_score', 'user_id', 'property_id'], axis=1)
        
        # Save feature columns for prediction
        self.feature_cols = X.columns.tolist()
        
        return X, y
    
    def train_model(self, force=False):
        """Train the machine learning model on user interaction data"""
        if self.model is not None and not force:
            logger.info("Model already trained. Use force=True to retrain.")
            return False
        
        # Get training data
        X, y = self._get_training_data()
        
        if X is None or y is None or len(X) < 10:
            logger.warning("Insufficient data for training")
            return False
        
        logger.info(f"Training ML model with {len(X)} samples")
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # Define preprocessing for numeric features
        numeric_features = X.select_dtypes(include=['int64', 'float64']).columns.tolist()
        numeric_transformer = Pipeline(steps=[
            ('scaler', StandardScaler())
        ])
        
        # Define preprocessing for categorical features
        categorical_features = X.select_dtypes(include=['object', 'category']).columns.tolist()
        categorical_transformer = Pipeline(steps=[
            ('onehot', OneHotEncoder(handle_unknown='ignore'))
        ])
        
        # Combine preprocessing steps
        preprocessor = ColumnTransformer(
            transformers=[
                ('num', numeric_transformer, numeric_features),
                ('cat', categorical_transformer, categorical_features)
            ])
        
        # Create and train the model
        self.model = Pipeline(steps=[
            ('preprocessor', preprocessor),
            ('regressor', GradientBoostingRegressor(
                n_estimators=100, 
                learning_rate=0.1,
                max_depth=4,
                random_state=42
            ))
        ])
        
        # Train the model
        self.model.fit(X_train, y_train)
        
        # Evaluate on test set
        score = self.model.score(X_test, y_test)
        logger.info(f"Model R² score: {score:.4f}")
        
        # Save the model
        self._save_model()
        
        return True
    
    def predict_user_interest(self, user_id, properties_df):
        """Predict user interest scores for a set of properties"""
        if self.model is None:
            logger.error("Model not trained yet")
            return None
        
        # Get user preferences
        preferences_query = f"""
        SELECT 
            preference_type,
            value,
            weight
        FROM 
            user_preferences
        WHERE 
            user_id = {user_id}
        """
        user_prefs = pd.DataFrame(self.db.execute_query(preferences_query))
        
        # Create feature dataset for prediction
        pred_data = properties_df.copy()
        
        # Add preference match features
        if not user_prefs.empty:
            # Price match
            price_pref = user_prefs[user_prefs['preference_type'] == 'price_range']
            if not price_pref.empty:
                price_range = price_pref.iloc[0]['value']
                price_weight = price_pref.iloc[0]['weight']
                
                pred_data['price_match'] = pred_data['price'].apply(
                    lambda p: 1 if (p >= price_range[0] and p <= price_range[1]) else 0
                )
                pred_data['price_weight'] = price_weight
        
        # Ensure all feature columns are present
        for col in self.feature_cols:
            if col not in pred_data.columns:
                pred_data[col] = 0  # Default value for missing features
        
        # Select only the columns used during training
        X_pred = pred_data[self.feature_cols]
        
        # Predict interest scores
        try:
            interest_scores = self.model.predict(X_pred)
            
            # Add predictions to properties dataframe
            properties_df['predicted_interest'] = interest_scores
            
            # Sort by predicted interest
            result = properties_df.sort_values('predicted_interest', ascending=False)
            
            return result
        except Exception as e:
            logger.error(f"Prediction error: {str(e)}")
            return properties_df  # Return original dataframe if prediction fails
    
    def recommend_properties(self, user_id, limit=10):
        """Get ML-based property recommendations for a user"""
        # Fetch active properties
        properties_query = """
        SELECT 
            p.id as property_id,
            p.title,
            p.price,
            p.parish,
            p.bedrooms,
            p.bathrooms,
            p.area,
            p.property_type,
            ARRAY_AGG(a.name) as amenities
        FROM 
            properties p
        LEFT JOIN 
            property_amenities pa ON p.id = pa.property_id
        LEFT JOIN 
            amenities a ON pa.amenity_id = a.id
        WHERE 
            p.status = 'active'
        GROUP BY 
            p.id
        """
        properties_df = pd.DataFrame(self.db.execute_query(properties_query))
        
        if properties_df.empty:
            logger.warning("No properties available for recommendation")
            return []
        
        # Get previously interacted properties
        interactions_query = f"""
        SELECT DISTINCT property_id
        FROM property_interactions
        WHERE user_id = {user_id}
        """
        interacted_df = pd.DataFrame(self.db.execute_query(interactions_query))
        
        # Filter out properties the user has already interacted with
        if not interacted_df.empty:
            interacted_properties = set(interacted_df['property_id'])
            properties_df = properties_df[~properties_df['property_id'].isin(interacted_properties)]
        
        if properties_df.empty:
            logger.warning("No new properties available for recommendation")
            return []
        
        # Predict user interest for available properties
        ranked_properties = self.predict_user_interest(user_id, properties_df)
        
        if ranked_properties is None:
            logger.error("Failed to predict user interest")
            return []
        
        # Convert to list of dictionaries
        recommendations = []
        for _, prop in ranked_properties.head(limit).iterrows():
            recommendations.append({
                'property_id': int(prop['property_id']),
                'title': prop['title'],
                'price': float(prop['price']),
                'parish': prop['parish'],
                'bedrooms': int(prop['bedrooms']) if not pd.isna(prop['bedrooms']) else None,
                'bathrooms': int(prop['bathrooms']) if not pd.isna(prop['bathrooms']) else None,
                'property_type': prop['property_type'],
                'score': float(prop['predicted_interest']),
                'recommendation_types': ['ml_prediction']
            })
        
        return recommendations