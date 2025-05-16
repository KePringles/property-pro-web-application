// src/api/user.js
import axios from 'axios';

// Use the existing API instance instead of creating a new one
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Get user profile
 * @returns {Promise} - API response
 */
export const getUserProfile = async () => {
  try {
    const token = localStorage.getItem('accessToken');
    const response = await axios.get(`${API_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw error.response?.data || { message: 'Failed to fetch user profile' };
  }
};

/**
 * Update user profile
 * @param {Object|FormData} profileData - Updated profile data
 * @returns {Promise} - API response
 */
export const updateUserProfile = async (profileData) => {
  try {
    const token = localStorage.getItem('accessToken');
    const isFormData = profileData instanceof FormData;
    
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': isFormData ? 'multipart/form-data' : 'application/json'
      }
    };
    
    const response = await axios.put(`${API_URL}/auth/profile`, profileData, config);
    return response.data;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error.response?.data || { message: 'Failed to update profile' };
  }
};

/**
 * Get user preferences
 * @returns {Promise} - API response
 */
export const getUserPreferences = async () => {
  try {
    const token = localStorage.getItem('accessToken');
    const response = await axios.get(`${API_URL}/auth/preferences`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching preferences:', error);
    throw error.response?.data || { message: 'Failed to fetch user preferences' };
  }
};
