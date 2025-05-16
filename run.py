# run.py
import os
from app import create_app, db
from flask_migrate import Migrate
import click
from flask.cli import with_appcontext
from apscheduler.schedulers.background import BackgroundScheduler
from app.services.recommendation_service import update_property_interaction_scores

app = create_app(os.getenv('FLASK_CONFIG') or 'development')
migrate = Migrate(app, db)

# Set up background scheduler for ML model training
scheduler = BackgroundScheduler()
scheduler.add_job(
    update_property_interaction_scores, 
    'cron', 
    hour=3,  # Run at 3 AM daily
    id='train_recommendation_model'
)

# Start scheduler with the app
if not app.debug or os.environ.get('WERKZEUG_RUN_MAIN') == 'true':
    scheduler.start()

@app.shell_context_processor
def make_shell_context():
    """
    Configure Flask shell command to automatically import database models
    """
    from app.models.user import User, Profile
    from app.models.property import (
        Property, PropertyImage, PropertyType, Parish, 
        Amenity, SavedProperty, UserPropertyInteraction
    )
    from app.models.preference import UserPreference
    from app.models.search import SearchHistory
    
    return dict(
        db=db, 
        User=User,
        Profile=Profile,
        Property=Property,
        PropertyImage=PropertyImage,
        PropertyType=PropertyType,
        Parish=Parish,
        Amenity=Amenity,
        SavedProperty=SavedProperty,
        UserPropertyInteraction=UserPropertyInteraction,
        UserPreference=UserPreference,
        SearchHistory=SearchHistory
    )

@app.cli.command("init-db")
def init_db():
    """Initialize the database with schema and initial data"""
    from app.models.property import PropertyType, Parish, Amenity
    
    # Create tables
    db.create_all()
    
    # Check if initial data already exists
    if PropertyType.query.count() == 0:
        # Insert property types
        property_types = [
            'House', 'Apartment', 'Townhouse', 'Villa', 'Land', 'Commercial'
        ]
        for name in property_types:
            db.session.add(PropertyType(name=name))
    
    if Parish.query.count() == 0:
        # Insert parishes
        parishes = [
            'Kingston', 'St. Andrew', 'St. Catherine', 'Clarendon', 
            'Manchester', 'St. Elizabeth', 'Westmoreland', 'Hanover', 
            'St. James', 'Trelawny', 'St. Ann', 'St. Mary', 
            'Portland', 'St. Thomas'
        ]
        for name in parishes:
            db.session.add(Parish(name=name))
    
    if Amenity.query.count() == 0:
        # Insert common amenities
        amenities = [
            'Parking', 'Swimming Pool', 'Garden', 'Security System',
            'Furnished', 'Sea View', 'Air Conditioning', 'Balcony',
            'Gated Community', 'Garage', 'Solar Power', 'Water Tank',
            'Beach Access', 'Waterfront', 'Mountain View', 'Tennis Court',
            'Gym', 'Laundry Room', 'Backup Generator', 'Internet Ready'
        ]
        for name in amenities:
            db.session.add(Amenity(name=name))
    
    db.session.commit()
    print("Database initialized with initial data.")

@app.cli.command("train-model")
def train_model():
    """Manually train the recommendation model"""
    from app.ml.recommendation_model import recommendation_model
    from app.services.recommendation_service import update_property_interaction_scores
    
    print("Updating interaction scores...")
    update_property_interaction_scores()
    
    print("Training recommendation model...")
    success = recommendation_model.train_model()
    
    if success:
        print("Model training completed successfully!")
    else:
        print("Model training skipped - insufficient data")

@app.cli.command("sample-data")
def add_sample_data():
    """Add sample properties for testing"""
    from app.models.user import User, Profile
    from app.models.property import Property, PropertyImage, PropertyType, Parish, Amenity
    import random
    import json
    
    # Create a sample property owner
    if User.query.filter_by(email='owner@example.com').first() is None:
        owner = User(
            email='owner@example.com',
            user_type='property_owner'
        )
        owner.set_password('password123')
        
        profile = Profile(
            user=owner,
            full_name='Sample Owner',
            phone_number='876-555-1234',
            company_name='Property Pro Realty'
        )
        
        db.session.add(owner)
        db.session.add(profile)
        db.session.flush()
        
        # Get reference data
        property_types = PropertyType.query.all()
        parishes = Parish.query.all()
        amenities = Amenity.query.all()
        
        # Sample property data - based on Jamaican real estate listings
        sample_properties = [
            {
                "title": "Luxury Beachfront Villa",
                "description": "Beautiful beachfront villa with stunning views of the Caribbean Sea. Features include a private pool, outdoor dining area, and direct beach access.",
                "price": 2500000,
                "type": "Villa",
                "bedrooms": 4,
                "bathrooms": 3.5,
                "area_sqft": 3200,
                "parish": "St. Ann",
                "city": "Runaway Bay",
                "address": "766 Peak Way",
                "lat": 18.4561,
                "lng": -77.3135,
                "for_sale": True,
                "for_rent": False,
                "amenities": ["Swimming Pool", "Beach Access", "Security System", "Furnished", "Sea View"]
            },
            {
                "title": "Modern Apartment in Kingston",
                "description": "Spacious apartment in the heart of Kingston with city views, modern appliances, and 24-hour security.",
                "price": 850000,
                "type": "Apartment",
                "bedrooms": 2,
                "bathrooms": 2,
                "area_sqft": 1200,
                "parish": "Kingston",
                "city": "Kingston",
                "address": "1-3 Ocean Boulevard, Unit 4H",
                "lat": 17.9772,
                "lng": -76.7674,
                "for_sale": True,
                "for_rent": True,
                "monthly_rent": 2500,
                "amenities": ["Security System", "Parking", "Air Conditioning", "Balcony"]
            },
            {
                "title": "Historic House in Montego Bay",
                "description": "Charming historic house with character, located close to Montego Bay's attractions. Features a garden and veranda.",
                "price": 1200000,
                "type": "House",
                "bedrooms": 3,
                "bathrooms": 2,
                "area_sqft": 2100,
                "parish": "St. James",
                "city": "Montego Bay",
                "address": "321 Sixth Ave, Montego Hills",
                "lat": 18.4762,
                "lng": -77.9311,
                "for_sale": True,
                "for_rent": False,
                "amenities": ["Garden", "Parking", "Security System"]
            },
            {
                "title": "Waterfront Cottage in Portland",
                "description": "Idyllic cottage with direct access to Blue Lagoon. Perfect for nature lovers seeking tranquility and water activities.",
                "price": 950000,
                "type": "House",
                "bedrooms": 2,
                "bathrooms": 1,
                "area_sqft": 1100,
                "parish": "Portland",
                "city": "San San",
                "address": "105 San San Estate",
                "lat": 18.1708,
                "lng": -76.4147,
                "for_sale": True,
                "for_rent": True,
                "monthly_rent": 3200,
                "amenities": ["Waterfront", "Furnished", "Garden"]
            },
            {
                "title": "Luxurious Penthouse in New Kingston",
                "description": "Exquisite penthouse with panoramic views of the city and Blue Mountains. Features high-end finishes and a private rooftop terrace.",
                "price": 1800000,
                "type": "Apartment",
                "bedrooms": 3,
                "bathrooms": 3,
                "area_sqft": 2800,
                "parish": "St. Andrew",
                "city": "Kingston",
                "address": "138 Orange Street",
                "lat": 18.0179,
                "lng": -76.8099,
                "for_sale": True,
                "for_rent": False,
                "amenities": ["Air Conditioning", "Security System", "Parking", "Balcony", "Gym"]
            },
            {
                "title": "Gated Community Townhouse",
                "description": "Modern townhouse in a secure gated community with amenities including a shared pool, tennis court, and 24/7 security.",
                "price": 750000,
                "type": "Townhouse",
                "bedrooms": 3,
                "bathrooms": 2.5,
                "area_sqft": 1800,
                "parish": "St. Catherine",
                "city": "Old Harbour",
                "address": "30 St. Paul's Way, Green Acres",
                "lat": 17.9414,
                "lng": -77.1085,
                "for_sale": True,
                "for_rent": False,
                "amenities": ["Gated Community", "Swimming Pool", "Tennis Court", "Security System", "Parking"]
            },
            {
                "title": "Mountain View Villa in Mandeville",
                "description": "Spacious villa with breathtaking mountain views. Features include a garden, covered patio, and modern amenities.",
                "price": 1100000,
                "type": "Villa",
                "bedrooms": 4,
                "bathrooms": 3,
                "area_sqft": 2600,
                "parish": "Manchester",
                "city": "Mandeville",
                "address": "Lot 2, Caledonia Lane",
                "lat": 18.0367,
                "lng": -77.5012,
                "for_sale": True,
                "for_rent": True,
                "monthly_rent": 3000,
                "amenities": ["Mountain View", "Garden", "Security System", "Parking", "Furnished"]
            },
            {
                "title": "Beachfront Apartment in Negril",
                "description": "Beautiful apartment with direct access to Negril's famous Seven Mile Beach. Perfect for vacation rental investment.",
                "price": 680000,
                "type": "Apartment",
                "bedrooms": 2,
                "bathrooms": 2,
                "area_sqft": 1150,
                "parish": "Westmoreland",
                "city": "Negril",
                "address": "Little Bay Country Club, Unit 75",
                "lat": 18.2949,
                "lng": -78.3470,
                "for_sale": True,
                "for_rent": True,
                "monthly_rent": 4500,
                "amenities": ["Beach Access", "Sea View", "Swimming Pool", "Security System", "Furnished"]
            },
            {
                "title": "Rural Land with Development Potential",
                "description": "Large plot of land with excellent development potential. Features fruit trees, a small stream, and mountain views.",
                "price": 380000,
                "type": "Land",
                "bedrooms": 0,
                "bathrooms": 0,
                "area_sqft": 90000,
                "parish": "St. Elizabeth",
                "city": "Dunder Hill",
                "address": "Dunder Hill Junction",
                "lat": 18.0568,
                "lng": -77.6723,
                "for_sale": True,
                "for_rent": False,
                "amenities": ["Mountain View", "Waterfront"]
            },
            {
                "title": "Commercial Property in Falmouth",
                "description": "Prime commercial property near the Falmouth cruise port. Excellent opportunity for retail or tourism-related business.",
                "price": 1250000,
                "type": "Commercial",
                "bedrooms": 0,
                "bathrooms": 2,
                "area_sqft": 3500,
                "parish": "Trelawny",
                "city": "Falmouth",
                "address": "Stonebrook Vista",
                "lat": 18.4953,
                "lng": -77.6521,
                "for_sale": True,
                "for_rent": True,
                "monthly_rent": 6000,
                "amenities": ["Parking", "Air Conditioning", "Security System", "Internet Ready"]
            }
        ]
        
        # Create properties
        for prop_data in sample_properties:
            # Find property type
            prop_type = next((pt for pt in property_types if pt.name == prop_data["type"]), None)
            
            # Find parish
            parish = next((p for p in parishes if p.name == prop_data["parish"]), None)
            
            # Skip if required references not found
            if not prop_type or not parish:
                continue
                
            # Create property
            property = Property(
                title=prop_data["title"],
                description=prop_data["description"],
                price=prop_data["price"],
                property_type_id=prop_type.type_id,
                bedrooms=prop_data["bedrooms"],
                bathrooms=prop_data["bathrooms"],
                area_sqft=prop_data["area_sqft"],
                address=prop_data["address"],
                city=prop_data["city"],
                parish_id=parish.parish_id,
                latitude=prop_data["lat"],
                longitude=prop_data["lng"],
                is_for_sale=prop_data["for_sale"],
                is_for_rent=prop_data["for_rent"],
                monthly_rent=prop_data.get("monthly_rent"),
                owner_id=owner.user_id,
                contact_phone="876-555-1234",
                contact_email="owner@example.com"
            )
            
            db.session.add(property)
            db.session.flush()
            
            # Add amenities
            for amenity_name in prop_data["amenities"]:
                amenity = next((a for a in amenities if a.name == amenity_name), None)
                if amenity:
                    property.amenities.append(amenity)
            
            # Add dummy image for property
            property_image = PropertyImage(
                prop_id=property.prop_id,
                image_url=f"/api/placeholder/{property.prop_id}.jpg",
                is_primary=True
            )
            db.session.add(property_image)
        
        # Create a sample property seeker with preferences
        if User.query.filter_by(email='user@example.com').first() is None:
            seeker = User(
                email='user@example.com',
                user_type='property_seeker'
            )
            seeker.set_password('password123')
            
            profile = Profile(
                user=seeker,
                full_name='Sample User',
                phone_number='876-555-5678'
            )
            
            db.session.add(seeker)
            db.session.add(profile)
            db.session.flush()
            
            # Create preferences
            from app.models.preference import UserPreference
            
            kingston_parish = next((p for p in parishes if p.name == 'Kingston'), None)
            apartment_type = next((t for t in property_types if t.name == 'Apartment'), None)
            
            if kingston_parish and apartment_type:
                preferences = UserPreference(
                    user_id=seeker.user_id,
                    min_price=500000,
                    max_price=1500000,
                    min_bedrooms=2,
                    min_bathrooms=1.5,
                    min_area_sqft=1000,
                    preferred_parish_id=kingston_parish.parish_id,
                    property_type_id=apartment_type.type_id,
                    is_for_sale=True,
                    is_for_rent=False
                )
                
                db.session.add(preferences)
                
                # Add preferred amenities
                pref_amenity_names = ['Parking', 'Security System', 'Air Conditioning']
                for amenity_name in pref_amenity_names:
                    amenity = next((a for a in amenities if a.name == amenity_name), None)
                    if amenity:
                        preferences.preferred_amenities.append(amenity)
        
        db.session.commit()
        print("Sample data added successfully!")
    else:
        print("Sample data already exists (owner@example.com found)")

if __name__ == '__main__':
    app.run(debug=True)