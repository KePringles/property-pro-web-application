-- Drop existing tables (in reverse order of dependencies)
DROP TABLE IF EXISTS user_preferred_amenities;
DROP TABLE IF EXISTS user_preferences;
DROP TABLE IF EXISTS saved_properties;
DROP TABLE IF EXISTS search_history;
DROP TABLE IF EXISTS property_amenities;
DROP TABLE IF EXISTS property_images;
DROP TABLE IF EXISTS properties;
DROP TABLE IF EXISTS amenities;
DROP TABLE IF EXISTS parishes;
DROP TABLE IF EXISTS property_types;
DROP TABLE IF EXISTS profiles;
DROP TABLE IF EXISTS users;

-- Users Table
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    user_type VARCHAR(50) NOT NULL, -- 'property_seeker' or 'property_owner'
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- User Profiles Table
CREATE TABLE profiles (
    profile_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    full_name VARCHAR(255),
    phone_number VARCHAR(50),
    profile_image_url VARCHAR(255),
    company_name VARCHAR(255), -- For property owners/agents
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Property Types Table
CREATE TABLE property_types (
    type_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- Parishes Table (for Jamaica)
CREATE TABLE parishes (
    parish_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- Properties Table
CREATE TABLE properties (
    prop_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price NUMERIC(15, 2) NOT NULL,
    property_type_id INTEGER REFERENCES property_types(type_id),
    bedrooms INTEGER,
    bathrooms NUMERIC(3, 1),
    area_sqft NUMERIC(10, 2),
    address TEXT,
    city VARCHAR(100),
    parish_id INTEGER REFERENCES parishes(parish_id),
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    is_for_sale BOOLEAN DEFAULT TRUE,
    is_for_rent BOOLEAN DEFAULT FALSE,
    monthly_rent NUMERIC(15, 2),
    owner_id INTEGER REFERENCES users(user_id),
    contact_phone VARCHAR(50),
    contact_email VARCHAR(255),
    listing_url VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Property Images Table
CREATE TABLE property_images (
    image_id SERIAL PRIMARY KEY,
    prop_id INTEGER NOT NULL REFERENCES properties(prop_id) ON DELETE CASCADE,
    image_url VARCHAR(255) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Amenities Table
CREATE TABLE amenities (
    amen_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- Property Amenities Junction Table
CREATE TABLE property_amenities (
    prop_id INTEGER NOT NULL REFERENCES properties(prop_id) ON DELETE CASCADE,
    amen_id INTEGER NOT NULL REFERENCES amenities(amen_id) ON DELETE CASCADE,
    PRIMARY KEY (prop_id, amen_id)
);

-- User Preferences Table
CREATE TABLE user_preferences (
    pref_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    min_price NUMERIC(15, 2),
    max_price NUMERIC(15, 2),
    min_bedrooms INTEGER,
    min_bathrooms NUMERIC(3, 1),
    min_area_sqft NUMERIC(10, 2),
    preferred_parish_id INTEGER REFERENCES parishes(parish_id),
    preferred_city VARCHAR(100),
    property_type_id INTEGER REFERENCES property_types(type_id),
    is_for_sale BOOLEAN,
    is_for_rent BOOLEAN,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- User Preferred Amenities Junction Table
CREATE TABLE user_preferred_amenities (
    pref_id INTEGER NOT NULL REFERENCES user_preferences(pref_id) ON DELETE CASCADE,
    amen_id INTEGER NOT NULL REFERENCES amenities(amen_id) ON DELETE CASCADE,
    PRIMARY KEY (pref_id, amen_id)
);

-- Saved Properties Junction Table
CREATE TABLE saved_properties (
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    prop_id INTEGER NOT NULL REFERENCES properties(prop_id) ON DELETE CASCADE,
    saved_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, prop_id)
);

-- Search History Table
CREATE TABLE search_history (
    search_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    search_query TEXT NOT NULL,
    search_params JSONB,
    search_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Initial Data for Reference Tables

-- Insert property types
INSERT INTO property_types (name) VALUES
('House'), ('Apartment'), ('Townhouse'), ('Villa'), ('Land'), ('Commercial');

-- Insert parishes
INSERT INTO parishes (name) VALUES
('Kingston'), ('St. Andrew'), ('St. Catherine'), ('Clarendon'), 
('Manchester'), ('St. Elizabeth'), ('Westmoreland'), ('Hanover'), 
('St. James'), ('Trelawny'), ('St. Ann'), ('St. Mary'), 
('Portland'), ('St. Thomas');

-- Insert common amenities
INSERT INTO amenities (name) VALUES
('Parking'), ('Swimming Pool'), ('Garden'), ('Security System'),
('Furnished'), ('Sea View'), ('Air Conditioning'), ('Balcony'),
('Gated Community'), ('Garage'), ('Solar Power'), ('Water Tank'),
('Beach Access'), ('Waterfront'), ('Mountain View'), ('Tennis Court'),
('Gym'), ('Laundry Room'), ('Backup Generator'), ('Internet Ready');
