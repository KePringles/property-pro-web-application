// This file provides constants used throughout the application
// Used by src/api/recommendations.js

// API Base URLs
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';
export const ML_API_URL = process.env.REACT_APP_ML_API_URL || 'http://localhost:5000/api';

// Property Types
export const PROPERTY_TYPES = {
  APARTMENT: 1,
  HOUSE: 2,
  CONDO: 3,
  LAND: 4,
  COMMERCIAL: 5,
  TOWNHOUSE: 6,
  VILLA: 7
};

// Transaction Types
export const TRANSACTION_TYPES = {
  FOR_SALE: 'is_for_sale',
  FOR_RENT: 'is_for_rent'
};

// Property Status
export const PROPERTY_STATUS = {
  AVAILABLE: 'available',
  PENDING: 'pending',
  SOLD: 'sold',
  RENTED: 'rented'
};

// Parishes (for Barbados location filtering)
export const PARISHES = [
  { id: 1, name: 'St. Michael' },
  { id: 2, name: 'Christ Church' },
  { id: 3, name: 'St. James' },
  { id: 4, name: 'St. Thomas' },
  { id: 5, name: 'St. Peter' },
  { id: 6, name: 'St. Philip' },
  { id: 7, name: 'St. John' },
  { id: 8, name: 'St. George' },
  { id: 9, name: 'St. Joseph' },
  { id: 10, name: 'St. Andrew' },
  { id: 11, name: 'St. Lucy' }
];

// Default search parameters
export const DEFAULT_SEARCH_PARAMS = {
  min_price: null,
  max_price: null,
  parish_id: null,
  property_type_id: null,
  min_bedrooms: null,
  min_bathrooms: null,
  is_for_sale: true,
  is_for_rent: false,
  amenities: []
};

// Default user preferences
export const DEFAULT_USER_PREFERENCES = {
  weights: {
    price: 5,
    location: 5,
    size: 5,
    amenities: 5
  },
  preferences: {
    preferred_parishes: [],
    preferred_property_types: [],
    preferred_min_price: null,
    preferred_max_price: null,
    preferred_min_bedrooms: null,
    preferred_min_bathrooms: null
  }
};

// Authentication
export const AUTH_TOKEN_KEY = 'auth_token';
export const USER_DATA_KEY = 'user_data';

// Time periods for analytics
export const TIME_PERIODS = {
  WEEK: 'week',
  MONTH: 'month',
  QUARTER: 'quarter',
  YEAR: 'year'
};

// Recommendation types
export const RECOMMENDATION_TYPES = {
  PERSONALIZED: 'personalized',
  SIMILAR: 'similar',
  TRENDING: 'trending',
  NEW: 'new'
};

// Alert frequency options
export const ALERT_FREQUENCIES = [
  { value: 'immediately', label: 'Immediately' },
  { value: 'daily', label: 'Daily Digest' },
  { value: 'weekly', label: 'Weekly Digest' }
];

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 12;
export const DEFAULT_PAGE = 1;