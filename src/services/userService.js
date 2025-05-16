// src/services/userService.js
import axios from 'axios';
import { API_BASE_URL } from '../config/constants';

/**
 * Track a property view
 * @param {number|string} propertyId - The ID of the property
 * @returns {Promise<Object>} - Response data
 */
export const trackPropertyView = async (propertyId) => {
  try {
    const token = localStorage.getItem('auth_token');
    const response = await axios.post(
      `${API_BASE_URL}/properties/${propertyId}/view`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error tracking property view:', error);
    throw error;
  }
};

/**
 * Get recently viewed properties for the current user
 * @param {number} limit - Maximum number of properties to return
 * @returns {Promise<Array>} - Array of recently viewed properties
 */
export const getRecentlyViewedProperties = async (limit = 10) => {
  try {
    const token = localStorage.getItem('auth_token');
    const response = await axios.get(
      `${API_BASE_URL}/user/recently-viewed?limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching recently viewed properties:', error);
    throw error;
  }
};

/**
 * Clear recently viewed properties history
 * @returns {Promise<Object>} - Response data
 */
export const clearRecentlyViewed = async () => {
  try {
    const token = localStorage.getItem('auth_token');
    const response = await axios.delete(
      `${API_BASE_URL}/user/recently-viewed`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error clearing recently viewed properties:', error);
    throw error;
  }
};

/**
 * Remove a property from recently viewed list
 * @param {number|string} propertyId - The ID of the property to remove
 * @returns {Promise<Object>} - Response data
 */
export const removeFromRecentlyViewed = async (propertyId) => {
  try {
    const token = localStorage.getItem('auth_token');
    const response = await axios.delete(
      `${API_BASE_URL}/user/recently-viewed/${propertyId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error removing property from recently viewed:', error);
    throw error;
  }
};

/**
 * Save a property to user's saved properties
 * @param {number|string} propertyId - The ID of the property to save
 * @returns {Promise<Object>} - Response data
 */
export const saveProperty = async (propertyId) => {
  try {
    const token = localStorage.getItem('auth_token');
    const response = await axios.post(
      `${API_BASE_URL}/user/saved-properties`,
      { property_id: propertyId },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error saving property:', error);
    throw error;
  }
};

/**
 * Unsave a property
 * @param {number|string} propertyId - The ID of the property to unsave
 * @returns {Promise<Object>} - Response data
 */
export const unsaveProperty = async (propertyId) => {
  try {
    const token = localStorage.getItem('auth_token');
    const response = await axios.delete(
      `${API_BASE_URL}/user/saved-properties/${propertyId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error unsaving property:', error);
    throw error;
  }
};

/**
 * Get user's saved properties
 * @returns {Promise<Array>} - Array of saved properties
 */
export const getSavedProperties = async () => {
  try {
    const token = localStorage.getItem('auth_token');
    const response = await axios.get(
      `${API_BASE_URL}/user/saved-properties`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching saved properties:', error);
    throw error;
  }
};

/**
 * Create a property collection
 * @param {string} name - Collection name
 * @param {string} description - Collection description
 * @returns {Promise<Object>} - Response data
 */
export const createPropertyCollection = async (name, description = '') => {
  try {
    const token = localStorage.getItem('auth_token');
    const response = await axios.post(
      `${API_BASE_URL}/user/collections`,
      { name, description },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error creating property collection:', error);
    throw error;
  }
};

/**
 * Get user's property collections
 * @returns {Promise<Array>} - Array of property collections
 */
export const getPropertyCollections = async () => {
  try {
    const token = localStorage.getItem('auth_token');
    const response = await axios.get(
      `${API_BASE_URL}/user/collections`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching property collections:', error);
    throw error;
  }
};

/**
 * Delete a property collection
 * @param {number|string} collectionId - The ID of the collection to delete
 * @returns {Promise<Object>} - Response data
 */
export const deletePropertyCollection = async (collectionId) => {
  try {
    const token = localStorage.getItem('auth_token');
    const response = await axios.delete(
      `${API_BASE_URL}/user/collections/${collectionId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error deleting property collection:', error);
    throw error;
  }
};

/**
 * Add a property to a collection
 * @param {number|string} collectionId - The ID of the collection
 * @param {number|string} propertyId - The ID of the property to add
 * @returns {Promise<Object>} - Response data
 */
export const addToCollection = async (collectionId, propertyId) => {
  try {
    const token = localStorage.getItem('auth_token');
    const response = await axios.post(
      `${API_BASE_URL}/user/collections/${collectionId}/properties`,
      { property_id: propertyId },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error adding property to collection:', error);
    throw error;
  }
};

/**
 * Remove a property from a collection
 * @param {number|string} collectionId - The ID of the collection
 * @param {number|string} propertyId - The ID of the property to remove
 * @returns {Promise<Object>} - Response data
 */
export const removeFromCollection = async (collectionId, propertyId) => {
  try {
    const token = localStorage.getItem('auth_token');
    const response = await axios.delete(
      `${API_BASE_URL}/user/collections/${collectionId}/properties/${propertyId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error removing property from collection:', error);
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
      `${API_BASE_URL}/user/alerts`,
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
      `${API_BASE_URL}/user/alerts`,
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

export default {
  trackPropertyView,
  getRecentlyViewedProperties,
  clearRecentlyViewed,
  removeFromRecentlyViewed,
  saveProperty,
  unsaveProperty,
  getSavedProperties,
  createPropertyCollection,
  getPropertyCollections,
  deletePropertyCollection,
  addToCollection,
  removeFromCollection,
  createPropertyAlert,
  getPropertyAlerts
};