from flask import Blueprint

# Create main API blueprint
api_bp = Blueprint('api', __name__, url_prefix='/api')

# Import route blueprints
from app.route.properties import properties_bp
from app.route.search import search_bp
from app.route.recommendations import recommendations_bp
from app.route.users import users_bp
from app.route.auth import auth_bp
from app.route.ml_recommendations import ml_recommendations_bp

# Register blueprints with the API blueprint
api_bp.register_blueprint(properties_bp, url_prefix='/properties')
api_bp.register_blueprint(search_bp, url_prefix='/search')
api_bp.register_blueprint(recommendations_bp, url_prefix='/recommendations')
api_bp.register_blueprint(users_bp, url_prefix='/users')

# Register individual routes to match frontend expectations
from app.route.properties import get_property_types, get_parishes, get_amenities

# Add routes directly to the API blueprint
api_bp.add_url_rule('/property-types', 'get_property_types', 
                    get_property_types, methods=['GET'])
api_bp.add_url_rule('/parishes', 'get_parishes', 
                    get_parishes, methods=['GET'])
api_bp.add_url_rule('/amenities', 'get_amenities', 
                    get_amenities, methods=['GET'])

# Function to register the main API blueprint with the Flask app
def register_routes(app):
    app.register_blueprint(api_bp)
    app.register_blueprint(auth_bp)  # Auth remains at root level
    app.register_blueprint(ml_recommendations_bp)