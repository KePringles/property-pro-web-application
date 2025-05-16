// src/services/api.js
import axios from 'axios';

// API base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Helper function to get auth header
const getAuthHeader = () => {
  const token = localStorage.getItem('accessToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Add request interceptor for authentication
api.interceptors.request.use(
  config => {
    // Add auth header to every request if token exists
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Search properties with filters
// Update searchProperties function to handle parameter transformation
export const searchProperties = async (filters = {}) => {
  try {
    console.log('Original filters:', filters);
    
    // Transform parameters if needed for API compatibility
    const apiParams = {
      ...filters,
      // Add any transformations needed for your API
    };
    
    console.log('API params:', apiParams);
    
    // Try the search endpoint first
    try {
      const response = await api.get('/search', {
        params: apiParams
      });
      return response.data;
    } catch (firstError) {
      console.error('First search attempt failed:', firstError);
      
      // If that fails, try the properties/search endpoint as fallback
      const response = await api.get('/properties/search', {
        params: apiParams
      });
      return response.data;
    }
  } catch (error) {
    console.error('Error searching properties:', error);
    throw error;
  }
};

// Get similar properties
export const getSimilarProperties = async (propertyId, limit = 8) => {
  try {
    const response = await api.get(`/search/similar-properties/${propertyId}`, {
      params: { limit }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching similar properties for ${propertyId}:`, error);
    throw error;
  }
};

// Get personalized recommendations
export const getRecommendations = async (limit = 4) => {
  try {
    const response = await api.get('/recommendations', {
      params: { limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    // Return empty recommendations instead of throwing to prevent UI errors
    return { recommendations: [] };
  }
};

// Get property compatibility score for a user
export const getPropertyCompatibility = async (propertyId) => {
  try {
    const response = await api.get(`/properties/${propertyId}/compatibility`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching compatibility for property ${propertyId}:`, error);
    // Return a default compatibility object to prevent UI errors
    return {
      compatibility: {
        score: null,
        message: "Compatibility score unavailable"
      }
    };
  }
};

// Update user preferences
export const updatePreferences = async (preferences) => {
  try {
    const response = await api.put('/users/preferences', preferences);
    return response.data;
  } catch (error) {
    console.error('Error updating preferences:', error);
    throw error;
  }
};

// Get user preferences
export const getUserPreferences = async () => {
  try {
    const response = await api.get('/users/preferences');
    return response.data;
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    throw error;
  }
};

// Save property (add to favorites)
export const savePropertyNew = async (propertyId) => {
  try {
    const response = await api.post(`/users/saved-properties/${propertyId}`);
    return response.data;
  } catch (error) {
    console.error('Error saving property:', error);
    throw error;
  }
};

// Remove property from saved list
export const unsaveProperty = async (propertyId) => {
  try {
    const response = await api.delete(`/users/saved-properties/${propertyId}`);
    return response.data;
  } catch (error) {
    console.error('Error removing saved property:', error);
    throw error;
  }
};

// Get saved properties
export const getSavedProperties = async () => {
  try {
    const response = await api.get('/users/saved-properties');
    return response.data;
  } catch (error) {
    console.error('Error fetching saved properties:', error);
    // Return empty array instead of throwing to prevent UI errors
    return { properties: [] };
  }
};

export default api;