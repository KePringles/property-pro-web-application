// src/services/recommendationService.js
import axios from 'axios';
import { API_BASE_URL, ML_API_URL } from '../config/constants';

/**
 * Get personalized property recommendations for a user
 * @param {number|string} userId - User ID
 * @param {Object} filters - Property filters
 * @param {Object} weights - Preference weights
 * @param {number} limit - Maximum number of recommendations
 * @returns {Promise<Array>} - Array of recommended properties
 */
export const getPersonalizedRecommendations = async (userId, filters = {}, weights = {}, limit = 8) => {
  try {
    const token = localStorage.getItem('auth_token');
    const response = await axios.post(
      `${ML_API_URL}/recommendations/personalized`,
      {
        user_id: userId,
        filters,
        weights,
        limit
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching personalized recommendations:', error);
    throw error;
  }
};

/**
 * Get similar properties to a reference property
 * @param {number|string} propertyId - Reference property ID
 * @param {number} limit - Maximum number of similar properties
 * @returns {Promise<Array>} - Array of similar properties
 */
export const getSimilarProperties = async (propertyId, limit = 8) => {
  try {
    const token = localStorage.getItem('auth_token');
    const response = await axios.get(
      `${ML_API_URL}/recommendations/similar/${propertyId}?limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching similar properties:', error);
    throw error;
  }
};

/**
 * Calculate a match score between a user and a property
 * @param {number|string} userId - User ID
 * @param {number|string} propertyId - Property ID
 * @returns {Promise<Object>} - Match score data
 */
export const calculateMatchScore = async (userId, propertyId) => {
  try {
    const token = localStorage.getItem('auth_token');
    const response = await axios.get(
      `${ML_API_URL}/recommendations/match-score?user_id=${userId}&property_id=${propertyId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error calculating match score:', error);
    throw error;
  }
};

/**
 * Create a property alert
 * @param {Object} alertData - Alert data
 * @returns {Promise<Object>} - Response data
 */
export const createPropertyAlert = async (alertData) => {
  try {
    const token = localStorage.getItem('auth_token');
    const response = await axios.post(
      `${API_BASE_URL}/alerts`,
      alertData,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error creating property alert:', error);
    throw error;
  }
};

/**
 * Get user's property alerts
 * @returns {Promise<Array>} - Array of property alerts
 */
export const getPropertyAlerts = async () => {
  try {
    const token = localStorage.getItem('auth_token');
    const response = await axios.get(
      `${API_BASE_URL}/alerts`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching property alerts:', error);
    throw error;
  }
};

/**
 * Delete a property alert
 * @param {number|string} alertId - Alert ID
 * @returns {Promise<Object>} - Response data
 */
export const deletePropertyAlert = async (alertId) => {
  try {
    const token = localStorage.getItem('auth_token');
    const response = await axios.delete(
      `${API_BASE_URL}/alerts/${alertId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error deleting property alert:', error);
    throw error;
  }
};

/**
 * Get user preferences for recommendations
 * @param {number|string} userId - User ID
 * @returns {Promise<Object>} - User preferences
 */
export const getUserPreferences = async (userId) => {
  try {
    const token = localStorage.getItem('auth_token');
    const response = await axios.get(
      `${API_BASE_URL}/user/${userId}/preferences`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    throw error;
  }
};

/**
 * Update user preferences
 * @param {number|string} userId - User ID
 * @param {Object} preferences - User preferences data
 * @returns {Promise<Object>} - Updated preferences
 */
export const updatePreferences = async (userId, preferences) => {
  try {
    const token = localStorage.getItem('auth_token');
    const response = await axios.put(
      `${API_BASE_URL}/user/${userId}/preferences`,
      preferences,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating user preferences:', error);
    throw error;
  }
};

export default {
  getPersonalizedRecommendations,
  getSimilarProperties,
  calculateMatchScore,
  createPropertyAlert,
  getPropertyAlerts,
  deletePropertyAlert,
  getUserPreferences,
  updatePreferences
};