# app/__init__.py
import os
from flask import Flask, Blueprint, request, jsonify, send_from_directory, abort, Response
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from app.middleware.static_middleware import serve_static_with_fallback
import logging

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

def create_app(config_name=None):
    app = Flask(__name__)
    
    # Enable detailed logging
    logging.basicConfig(level=logging.DEBUG)
    app.logger.setLevel(logging.DEBUG)
    
    # Disable strict trailing slash redirect
    app.url_map.strict_slashes = False
    
    # Load config
    if config_name is None:
        config_name = os.environ.get('FLASK_CONFIG', 'development')

    app.config.from_object(f'app.config.{config_name.capitalize()}Config')
    
    # Register extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    
    # Register blueprints
    from app.route.auth import auth_bp
    from app.route.properties import properties_bp
    from app.route.search import search_bp
    from app.route.users import users_bp
    from app.route.recommendations import recommendations_bp
    from app.route.clients import clients_bp

    # Create the main API blueprint to contain all routes
    api_bp = Blueprint('api', __name__, url_prefix='/api')
    
    # Register auth blueprint under /api/auth
    api_bp.register_blueprint(auth_bp, url_prefix='/auth')
    
    # Register all other blueprints with the API blueprint
    api_bp.register_blueprint(properties_bp, url_prefix='/properties')
    api_bp.register_blueprint(search_bp, url_prefix='/search')
    api_bp.register_blueprint(users_bp, url_prefix='/users')
    api_bp.register_blueprint(recommendations_bp, url_prefix='/recommendations')
    api_bp.register_blueprint(clients_bp, url_prefix= '/clients')
    
    # Register specific routes directly on the API blueprint
    from app.route.properties import get_parishes, get_property_types, get_amenities
    api_bp.add_url_rule('/parishes', 'get_parishes', get_parishes, methods=['GET'])
    api_bp.add_url_rule('/property-types', 'get_property_types', get_property_types, methods=['GET'])
    api_bp.add_url_rule('/amenities', 'get_amenities', get_amenities, methods=['GET'])
    
    # Add compatibility route for properties/search
    from app.route.search import search
    api_bp.add_url_rule('/properties/search', 'properties_search', search, methods=['GET', 'OPTIONS'])
    
    # Register the API blueprint with the app
    app.register_blueprint(api_bp)
    
    # Create static folders if they don't exist
    os.makedirs(os.path.join(app.static_folder, 'images'), exist_ok=True)
    os.makedirs(os.path.join(app.static_folder, 'styles'), exist_ok=True)
    os.makedirs(os.path.join(app.static_folder, 'js'), exist_ok=True)
    
    # Register static file handlers with fallbacks
    @app.route('/images/<path:filename>')
    def serve_image(filename):
        return serve_static_with_fallback('images', filename)
    
    @app.route('/styles/<path:filename>')
    def serve_style(filename):
        return serve_static_with_fallback('styles', filename)
    
    @app.route('/js/<path:filename>')
    def serve_script(filename):
        return serve_static_with_fallback('js', filename)
    
    # Add pre-request logger
    @app.before_request
    def log_request_info():
        app.logger.debug('Headers: %s', request.headers)
        app.logger.debug('Body: %s', request.get_data())
        app.logger.debug('URL: %s', request.url)
        app.logger.debug('Method: %s', request.method)
    
    # Serve uploaded files
    @app.route('/uploads/<path:filename>')
    def uploaded_file(filename):
        upload_folder = os.path.join(app.root_path, 'uploads')
        return send_from_directory(upload_folder, filename)
    
    # Serve uploaded property images
    @app.route('/uploads/property_images/<filename>')
    def uploaded_property_image(filename):
        upload_dir = os.path.join(app.config['UPLOAD_FOLDER'], 'property_images')
        file_path = os.path.join(upload_dir, filename)

        if not os.path.exists(file_path):
            abort(404)
    
        return send_from_directory(upload_dir, filename)
    
    # Special handler for OPTIONS requests to auth routes
    @app.route('/api/auth/<path:path>', methods=['OPTIONS'])
    def handle_auth_options(path):
        response = Response('', 200)
        origin = request.headers.get('Origin', '')
        allowed_origins = app.config.get('CORS_ORIGINS', ["http://localhost:3000"])
        
        if origin in allowed_origins or '*' in allowed_origins:
            response.headers.add('Access-Control-Allow-Origin', origin)
        else:
            response.headers.add('Access-Control-Allow-Origin', allowed_origins[0] if allowed_origins else "http://localhost:3000")
            
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response
    
    # Generic handler for all OPTIONS requests
    @app.route('/<path:path>', methods=['OPTIONS'])
    def handle_all_options(path):
        response = Response('', 200)
        origin = request.headers.get('Origin', '')
        allowed_origins = app.config.get('CORS_ORIGINS', ["http://localhost:3000"])
        
        if origin in allowed_origins or '*' in allowed_origins:
            response.headers.add('Access-Control-Allow-Origin', origin)
        else:
            response.headers.add('Access-Control-Allow-Origin', allowed_origins[0] if allowed_origins else "http://localhost:3000")
            
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response
    
    # Root OPTIONS handler
    @app.route('/', methods=['OPTIONS'])
    def handle_root_options():
        response = Response('', 200)
        origin = request.headers.get('Origin', '')
        allowed_origins = app.config.get('CORS_ORIGINS', ["http://localhost:3000"])
        
        if origin in allowed_origins or '*' in allowed_origins:
            response.headers.add('Access-Control-Allow-Origin', origin)
        else:
            response.headers.add('Access-Control-Allow-Origin', allowed_origins[0] if allowed_origins else "http://localhost:3000")
            
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response
    
    # Now setup CORS after our route handlers
    CORS(app, 
         resources={r"/api/*": {"origins": app.config.get('CORS_ORIGINS', ["http://localhost:3000"])}},
         supports_credentials=True,
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
         allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
         expose_headers=["Content-Type", "Authorization"])
    
    # Error handlers
    @app.errorhandler(404)
    def handle_404(error):
        app.logger.warning(f"404 error: {error}")
        response = jsonify({
            'error': 'Not Found', 
            'message': str(error)
        })
        response.status_code = 404
        return response
    
    @app.errorhandler(500)
    def handle_500(error):
        app.logger.error(f"500 error: {error}")
        response = jsonify({
            'error': 'Internal Server Error', 
            'message': str(error)
        })
        response.status_code = 500
        return response

    return app