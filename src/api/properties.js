// src/api/properties.js
import axios from 'axios';
import api from '../services/api';
import { logPropertyInteraction } from '../api/recommendations';

// API base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper function to get auth header
const getAuthHeader = () => {
  const token = localStorage.getItem('accessToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Get properties with optional filters, used for general property listing
 * @param {Object} params - Query parameters and filters
 * @returns {Promise} Promise resolving to properties data
 */
export const getProperties = async (params = {}) => {
  try {
    const response = await axios.get(`${API_URL}/properties`, {
      params,
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching properties:', error);
    throw error;
  }
};

/**
 * Search properties with advanced filters
 * @param {Object} filters - Search filters
 * @returns {Promise} Promise resolving to search results
 */
export const searchProperties = async (filters = {}) => {
  try {
    const response = await axios.get(`${API_URL}/properties/search`, {
      params: filters,
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error searching properties:', error);
    throw error;
  }
};

/**
 * Get a single property by ID
 * @param {String|Number} propertyId - ID of the property
 * @returns {Promise} Promise resolving to property data
 */
export const getPropertyById = async (propertyId) => {
  try {
    const response = await axios.get(`${API_URL}/properties/${propertyId}`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching property ${propertyId}:`, error);
    throw error;
  }
};

// Alias for getPropertyById for backward compatibility
export const getProperty = getPropertyById;

/**
 * Get featured properties
 * @param {Number} limit - Number of featured properties to return
 * @returns {Promise} Promise resolving to featured properties
 */
export const getFeaturedProperties = async (limit = 6) => {
  try {
    const response = await axios.get(`${API_URL}/properties/featured`, {
      params: { limit },
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching featured properties:', error);
    throw error;
  }
};

/**
 * Get most viewed properties
 * @param {Number} limit - Number of properties to return
 * @returns {Promise} Promise resolving to most viewed properties
 */
export const getMostViewedProperties = async (limit = 6) => {
  try {
    const response = await axios.get(`${API_URL}/properties/most-viewed`, {
      params: { limit },
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching most viewed properties:', error);
    throw error;
  }
};

/**
 * Get recommended properties based on user preferences
 * @param {Number} limit - Number of recommendations to return
 * @returns {Promise} Promise resolving to recommended properties
 */
export const getRecommendedProperties = async (limit = 10) => {
  try {
    const response = await axios.get(`${API_URL}/properties/recommended`, {
      params: { limit },
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching recommended properties:', error);
    // Return empty recommendations instead of throwing to prevent UI errors
    return { recommendations: [] };
  }
};

/**
 * Get similar properties to a given property
 * @param {String|Number} propertyId - Reference property ID
 * @param {Number} limit - Number of similar properties to return
 * @returns {Promise} Promise resolving to similar properties
 */
export const getSimilarProperties = async (propertyId, limit = 4) => {
  try {
    const response = await axios.get(`${API_URL}/properties/${propertyId}/similar`, {
      params: { limit },
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching similar properties for ${propertyId}:`, error);
    return { similar_properties: [] };
  }
};

/**
 * Get saved properties for the authenticated user
 * @param {Object} options - Query options
 * @returns {Promise} Promise resolving to saved properties data
 */
export const getSavedProperties = async (options = {}) => {
  try {
    const response = await axios.get(`${API_URL}/properties/saved`, {
      params: options,
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching saved properties:', error);
    throw error;
  }
};

/**
 * Save a property to user's saved list (legacy version with userId)
 * @param {String|Number} userId - ID of the user
 * @param {String|Number} propertyId - ID of the property to save
 * @returns {Promise} Promise resolving to updated saved property
 */
export const saveProperty = async (userId, propertyId) => {
  try {
    // If userId is not provided, use the new endpoint format
    if (!userId) {
      return savePropertyNew(propertyId);
    }
    
    const response = await api.post(`/api/users/${userId}/saved-properties`, {
      property_id: propertyId
    });
    
    // Log the interaction
    await logPropertyInteraction(propertyId, 'save');
    
    return response.data;
  } catch (error) {
    console.error(`Error saving property ${propertyId}:`, error);
    throw error;
  }
};

// Add this to src/api/properties.js

/**
 * Update an existing property
 * @param {String|Number} propertyId - ID of the property to update
 * @param {Object} propertyData - Updated property data
 * @returns {Promise} Promise resolving to updated property
 */
export const updateProperty = async (propertyId, propertyData) => {
  try {
    // Log the incoming data to verify it
    console.log('Property data before update:', propertyData);
    
    // Validate required fields first
    if (!propertyData.title || propertyData.title.trim() === '') {
      throw new Error('Property title is required');
    }

    const formData = new FormData();

    // Process the property data into FormData
    Object.keys(propertyData).forEach(key => {
      if (key === 'amenities' && Array.isArray(propertyData[key])) {
        propertyData[key].forEach(amenityId => {
          formData.append('amenities', amenityId);
        });
      } else if (key === 'images' && Array.isArray(propertyData[key])) {
        propertyData[key].forEach(file => {
          // Only append if it's a File object (not a string URL)
          if (file instanceof File) {
            formData.append('images', file);
          }
        });
      } else if (propertyData[key] !== null && propertyData[key] !== undefined) {
        if (typeof propertyData[key] === 'boolean') {
          formData.append(key, propertyData[key] ? 'true' : 'false');
        } else {
          formData.append(key, propertyData[key]);
        }
      }
    });

    // Log FormData contents for debugging
    console.log('FormData contents for update:');
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }

    const response = await axios.put(`${API_URL}/properties/${propertyId}`, formData, {
      headers: {
        ...getAuthHeader(),
        // Let browser set the correct Content-Type with boundary
      }
    });

    return response.data;
  } catch (error) {
    console.log('Error updating property:', error);
    
    if (error.message === 'Property title is required') {
      throw { message: 'Property title is required' };
    }
    
    console.log('Error status:', error.response?.status);
    console.log('Error response full object:', error.response);
    throw error.response?.data || { message: 'Failed to update property' };
  }
};

/**
 * Check if a property is saved by the user
 * @param {number} userId - ID of the user
 * @param {number} propertyId - ID of the property to check
 * @returns {Promise<boolean>} Promise with boolean indicating if property is saved
 */
export const checkIfSaved = async (userId, propertyId) => {
  try {
    const response = await api.get(`/api/users/${userId}/saved-properties/${propertyId}`);
    return response.data.is_saved;
  } catch (error) {
    // HTTP 404 means not saved
    if (error.response && error.response.status === 404) {
      return false;
    }
    console.error('Error checking if property is saved:', error);
    throw error;
  }
};

/**
 * Get recently viewed properties for the authenticated user
 * @param {Number} limit - Maximum number of properties to return
 * @returns {Promise} Promise resolving to recently viewed properties data
 */
export const getRecentlyViewedProperties = async (limit = 10) => {
  try {
    const response = await axios.get(`${API_URL}/properties/recently-viewed`, {
      params: { limit },
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching recently viewed properties:', error);
    throw error;
  }
};

/**
 * Clear recently viewed properties history
 * @returns {Promise} Promise resolving to success message
 */
export const clearRecentlyViewed = async () => {
  try {
    const response = await axios.delete(`${API_URL}/properties/recently-viewed`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error clearing recently viewed properties:', error);
    throw error;
  }
};

/**
 * Get all property types
 * @returns {Promise} Promise resolving to property types
 */
export const getPropertyTypes = async () => {
  try {
    const response = await axios.get(`${API_URL}/property-types`);
    return response.data;
  } catch (error) {
    console.error('Error fetching property types:', error);
    return { property_types: [] };
  }
};

/**
 * Get all parishes
 * @returns {Promise} Promise resolving to parishes
 */
export const getParishes = async () => {
  try {
    const response = await axios.get(`${API_URL}/parishes`);
    return response.data;
  } catch (error) {
    console.error('Error fetching parishes:', error);
    return { parishes: [] };
  }
};

/**
 * Get all amenities
 * @returns {Promise} Promise resolving to amenities
 */
export const getAmenities = async () => {
  try {
    const response = await axios.get(`${API_URL}/amenities`);
    return response.data;
  } catch (error) {
    console.error('Error fetching amenities:', error);
    return { amenities: [] };
  }
};

/**
 * Get property compatibility score for a user
 * @param {String|Number} propertyId - ID of the property
 * @returns {Promise} Promise resolving to compatibility data
 */
export const getPropertyCompatibility = async (propertyId) => {
  try {
    const response = await axios.get(`${API_URL}/properties/${propertyId}/compatibility`, {
      headers: getAuthHeader()
    });
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

/**
 * Track property view
 * @param {String|Number} propertyId - ID of the property viewed
 * @returns {Promise} Promise resolving to success message
 */
export const trackPropertyView = async (propertyId) => {
  try {
    const response = await axios.post(`${API_URL}/properties/${propertyId}/view`, {}, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error(`Error tracking property view for ${propertyId}:`, error);
    // Don't throw error for tracking to prevent UI disruptions
    return { success: false };
  }
};

/**
 * Create a new property
 * @param {Object} propertyData - Property data
 * @returns {Promise} Promise resolving to created property
 */
export const createProperty = async (propertyData) => {
  try {
    // Log the incoming data to verify title exists
    console.log('Property data before FormData creation:', propertyData);
    
    // Validate required fields first
    if (!propertyData.title || propertyData.title.trim() === '') {
      throw new Error('Property title is required');
    }

    const formData = new FormData();

    // Process the property data into FormData
    Object.keys(propertyData).forEach(key => {
      if (key === 'amenities' && Array.isArray(propertyData[key])) {
        propertyData[key].forEach(amenityId => {
          formData.append('amenities', amenityId);
        });
      } else if (key === 'images' && Array.isArray(propertyData[key])) {
        propertyData[key].forEach(file => {
          // Only append if it's a File object (not a string URL)
          if (file instanceof File) {
            formData.append('images', file);
          }
        });
      } else if (propertyData[key] !== null && propertyData[key] !== undefined) {
        if (typeof propertyData[key] === 'boolean') {
          formData.append(key, propertyData[key] ? 'true' : 'false');
        } else {
          formData.append(key, propertyData[key]);
        }
      }
    });

    // Log FormData contents for debugging
    console.log('FormData contents:');
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }

    const response = await axios.post(`${API_URL}/properties/`, formData, {
      headers: {
        ...getAuthHeader(),
        // Let browser set the correct Content-Type with boundary
      }
    });

    return response.data;
  } catch (error) {
    console.log('Error creating property:', error);
    
    if (error.message === 'Property title is required') {
      throw { message: 'Property title is required' };
    }
    
    console.log('Error status:', error.response?.status);
    console.log('Error response full object:', error.response);
    throw error.response?.data || { message: 'Failed to add property' };
  }
};

// Update these functions in your API service file

// Save property (add to favorites)
export const savePropertyNew = async (propertyId) => {
  try {
    // Check if propertyId is valid before making the request
    if (!propertyId || propertyId === 'undefined') {
      throw new Error('Invalid property ID');
    }
    
    const response = await api.post(`/properties/${propertyId}/save`);
    return response.data;
  } catch (error) {
    console.error('Error saving property:', error);
    throw error;
  }
};


// Remove property from saved list
export const unsaveProperty = async (propertyId) => {
  try {
    // Check if propertyId is valid before making the request
    if (!propertyId || propertyId === 'undefined') {
      throw new Error('Invalid property ID');
    }
    
    const response = await api.delete(`/properties/${propertyId}/unsave`);
    return response.data;
  } catch (error) {
    console.error('Error removing saved property:', error);
    throw error;
  }
};

/**
 * Delete property listing
 * @param {String|Number} propertyId - ID of the property
 * @returns {Promise} Promise resolving to success message
 */
export const deleteProperty = async (propertyId) => {
  try {
    const response = await axios.delete(`${API_URL}/properties/${propertyId}`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error(`Error deleting property ${propertyId}:`, error);
    throw error;
  }
};

/**
 * Upload images for an existing property
 * @param {String|Number} propertyId - ID of the property
 * @param {FormData} imageData - Image form data
 * @returns {Promise} Promise resolving to updated images data
 */
export const uploadPropertyImages = async (propertyId, imageData) => {
  try {
    const response = await axios.post(`${API_URL}/properties/${propertyId}/images`, imageData, {
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading property images:', error);
    throw error.response?.data || { message: 'Failed to upload images' };
  }
};

/**
 * Get user location using browser geolocation
 * @returns {Promise} Promise resolving to location coordinates
 */
export const getUserLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      return reject(new Error('Geolocation is not supported by your browser'));
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      }
    );
  });
};

/**
 * Get machine learning-based property recommendations
 * @param {number} userId - User ID (optional)
 * @param {number} limit - Maximum number of recommendations to retrieve
 * @returns {Promise} Promise with ML recommendations data
 */
export const getMLRecommendations = async (userId, limit = 10) => {
  try {
    const response = await api.get(`/api/recommendations/ml?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching ML recommendations:', error);
    throw error;
  }
};

/**
 * Get ML prediction for a specific property for the current user
 * @param {number} propertyId - ID of the property to get prediction for
 * @returns {Promise} Promise with prediction data
 */
export const getPropertyPrediction = async (propertyId) => {
  try {
    const response = await api.get(`/api/properties/${propertyId}/prediction`);
    return response.data;
  } catch (error) {
    console.error('Error fetching property prediction:', error);
    throw error;
  }
};

/**
 * Retrain the ML recommendation model (admin only)
 * @returns {Promise} Promise with retrain operation status
 */
export const retrainMLModel = async () => {
  try {
    const response = await api.post('/api/recommendations/ml/retrain');
    return response.data;
  } catch (error) {
    console.error('Error retraining ML model:', error);
    throw error;
  }
};

/**
 * Get statistics about the ML recommendation model (admin only)
 * @returns {Promise} Promise with ML statistics data
 */
export const getMLStats = async () => {
  try {
    const response = await api.get('/api/recommendations/ml/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching ML stats:', error);
    throw error;
  }
};

/**
 * Get statistics for properties
 * @param {string} timeframe - Time period for statistics (e.g., 'week', 'month', 'year')
 * @param {number} propertyId - Optional property ID to get stats for a single property
 * @returns {Promise} Promise with property statistics data
 */
export const getPropertyStatistics = async (timeframe = 'month', propertyId = null) => {
  try {
    let url = `${API_URL}/properties/statistics`;
    const params = { timeframe };
    
    if (propertyId) {
      params.property_id = propertyId;
    }
    
    const response = await axios.get(url, {
      params,
      headers: getAuthHeader()
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching property statistics:', error);
    // Return empty default data structure to prevent UI errors
    return {
      views: [],
      inquiries: [],
      saves: [],
      total_views: 0,
      total_inquiries: 0,
      total_saves: 0
    };
  }
};