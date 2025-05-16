# app/models/__init__.py
from app.models.user import User
from app.models.property import Property, PropertyType, Parish, Amenity, PropertyImage, UserPropertyInteraction
from app.models.preference import UserPreference
from app.models.search import SearchHistory
from app.models.alert import PropertyAlert  # Add this line to import PropertyAlert