// src/api/recommendations.js
import api from '../services/api';
import axios from 'axios';
import { API_BASE_URL } from '../config/constants';

// In src/api/recommendations.js
export const getPersonalizedRecommendations = async (userId, filters = {}, weights = {}, limit = 10) => {
  try {
    // Log this call for debugging
    console.log('Calling getPersonalizedRecommendations with:', { userId, filters, weights, limit });
    
    // Prepare request data
    const requestData = {
      user_id: userId,
      filters: { ...filters },
      weights: { ...weights },
      limit: limit
    };
    
    // Make API call - CHANGE THIS URL TO MATCH properties.js pattern
    const response = await axios.post(`${API_BASE_URL}/recommendations/personalized`, requestData);
    
    // Check if the response has the expected format
    if (response.data && (response.data.recommendations || response.data.properties)) {
      // Return standardized format
      return {
        success: true,
        recommendations: response.data.recommendations || response.data.properties || []
      };
    } else if (Array.isArray(response.data)) {
      // Sometimes the API might return an array directly
      return {
        success: true,
        recommendations: response.data
      };
    }
    
    // Default response structure
    return {
      success: true,
      recommendations: []
    };
  } catch (error) {
    console.error('Error in getPersonalizedRecommendations:', error);
    
    // Instead of throwing, return empty results like in properties.js
    console.log('Returning fallback empty recommendations');
    return {
      success: false,
      recommendations: []
    };
  }
};
  
export const getSimilarProperties = async (propertyId, limit = 6) => {
  try {
    // Make API call
    const response = await axios.get(`${API_BASE_URL}/api/properties/${propertyId}/similar`, {
      params: { limit }
    });
    
    // Check if the response has the expected format
    if (response.data && response.data.similar_properties) {
      return {
        success: true,
        similar_properties: response.data.similar_properties
      };
    } else if (Array.isArray(response.data)) {
      // Sometimes the API might return an array directly
      return {
        success: true,
        similar_properties: response.data
      };
    }
    
    // Default response structure
    return {
      success: true,
      similar_properties: []
    };
  } catch (error) {
    console.error('Error in getSimilarProperties:', error);
    
    // Instead of throwing an error, return empty data like in properties.js
    return {
      success: false,
      similar_properties: []
    };
  }
};
/**
 * Get ML-based property recommendations
 * @param {number} limit - Maximum number of recommendations to return
 * @returns {Promise<Array>} - Array of recommended properties
 */
export const getMLRecommendations = async (limit = 10) => {
  try {
    // Make API call
    const response = await axios.get(`${API_BASE_URL}/api/recommendations/ml`, {
      params: { limit }
    });
    
    // Return standardized format
    return {
      success: true,
      recommendations: response.data.recommendations || []
    };
  } catch (error) {
    console.error('Error in getMLRecommendations:', error);
    
    // Check if it's a network error
    if (!error.response) {
      throw new Error('Network error - please check your connection');
    }
    
    throw new Error(error.response.data?.message || 'Failed to get ML recommendations');
  }
};

   
   /**
   * Get user preferences for property recommendations
   * @returns {Promise} Promise with user preferences
   */
   export const getUserPreferences = async () => {
    try {
      const response = await api.get('/api/preferences');
      return response.data;
    } catch (error) {
      console.error('Error getting user preferences:', error);
      return { 
        success: false, 
        message: 'Failed to load preferences',
        preferences: []
      };
    }
   };
   
   /**
   * Save user preferences for property recommendations
   * @param {Array} preferences - Array of preference objects
   * @returns {Promise} Promise with save operation status
   */
   export const saveUserPreferences = async (preferences) => {
    try {
      const response = await api.post('/api/preferences', preferences);
      return response.data;
    } catch (error) {
      console.error('Error saving user preferences:', error);
      return { 
        success: false, 
        message: 'Failed to save preferences'
      };
    }
   };

/**
 * Get property prediction for a specific user
 * @param {number} propertyId - The property ID to get prediction for
 * @returns {Promise<Object>} - Prediction data
 */
export const getPropertyPrediction = async (propertyId) => {
  try {
    // Make API call
    const response = await axios.get(`${API_BASE_URL}/api/properties/${propertyId}/prediction`);
    
    // Return standardized format
    return {
      success: true,
      prediction: response.data.prediction || {}
    };
  } catch (error) {
    console.error('Error in getPropertyPrediction:', error);
    
    // Check if it's a network error
    if (!error.response) {
      throw new Error('Network error - please check your connection');
    }
    
    throw new Error(error.response.data?.message || 'Failed to get property prediction');
  }
};

/**
 * Log user interaction with a property for ML training
 * @param {number} propertyId - The property ID the user interacted with
 * @param {string} action - The type of interaction (view, like, save, etc.)
 * @param {Object} metadata - Additional metadata about the interaction
 * @returns {Promise<Object>} - Response data
 */
export const logPropertyInteraction = async (propertyId, action, metadata = {}) => {
  try {
    // Prepare request data
    const requestData = {
      property_id: propertyId,
      action: action,
      metadata: metadata,
      timestamp: new Date().toISOString()
    };
    
    // Make API call
    const response = await axios.post(`${API_BASE_URL}/api/interactions/log`, requestData);
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error in logPropertyInteraction:', error);
    // We don't throw here to prevent affecting the UI if logging fails
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to log interaction'
    };
  }
};   

/**
 * Add a property to the user's saved properties list
 * @param {number} propertyId - The property ID to save
 * @returns {Promise<Object>} - Response data
 */
export const saveProperty = async (propertyId) => {
  try {
    // Make API call
    const response = await axios.post(`${API_BASE_URL}/api/properties/${propertyId}/save`);
    
    // Also log this as an interaction for ML
    await logPropertyInteraction(propertyId, 'save');
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error in saveProperty:', error);
    
    // Check if it's a network error
    if (!error.response) {
      throw new Error('Network error - please check your connection');
    }
    
    throw new Error(error.response.data?.message || 'Failed to save property');
  }
};

/**
 * Remove a property from the user's saved properties list
 * @param {number} propertyId - The property ID to unsave
 * @returns {Promise<Object>} - Response data
 */
export const unsaveProperty = async (propertyId) => {
  try {
    // Make API call
    const response = await axios.delete(`${API_BASE_URL}/api/properties/${propertyId}/save`);
    
    // Also log this as an interaction for ML
    await logPropertyInteraction(propertyId, 'unsave');
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error in unsaveProperty:', error);
    
    // Check if it's a network error
    if (!error.response) {
      throw new Error('Network error - please check your connection');
    }
    
    throw new Error(error.response.data?.message || 'Failed to unsave property');
  }
};

export default {
  getPersonalizedRecommendations,
  getSimilarProperties,
  getMLRecommendations,
  getPropertyPrediction,
  logPropertyInteraction,
  saveProperty,
  unsaveProperty
};
