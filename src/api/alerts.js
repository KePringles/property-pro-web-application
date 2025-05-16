// src/api/alerts.js
import api from '../services/api';

/**
 * Create a new property alert based on search criteria
 * @param {object} alertData - Alert data with name, criteria, and notification preferences
 * @returns {Promise} Promise with creation status
 */
export const createPropertyAlert = async (alertData) => {
  try {
    console.log('Creating property alert with data:', alertData);
    
    // Try multiple possible endpoint variations
    const endpoints = [
      '/api/property-alerts',
      '/property-alerts',
      '/api/alerts',
      '/alerts'
    ];
    
    let lastError = null;
    
    // Try each endpoint until one works
    for (const endpoint of endpoints) {
      try {
        console.log(`Trying alert endpoint: ${endpoint}`);
        const response = await api.post(endpoint, alertData);
        console.log(`Success with alert endpoint ${endpoint}:`, response.data);
        return response.data;
      } catch (endpointError) {
        console.warn(`Alert endpoint ${endpoint} failed:`, endpointError.message);
        lastError = endpointError;
        
        // If it's not a 404, break out (might be another issue)
        if (endpointError.response && endpointError.response.status !== 404) {
          break;
        }
      }
    }
    
    // If API calls fail, use localStorage as fallback
    console.warn('Using localStorage fallback for property alert');
    const alerts = JSON.parse(localStorage.getItem('propertyAlerts') || '[]');
    
    // Add a new alert with unique ID
    const newAlert = {
      ...alertData,
      id: Date.now(),
      created_at: new Date().toISOString()
    };
    
    alerts.push(newAlert);
    localStorage.setItem('propertyAlerts', JSON.stringify(alerts));
    
    return {
      success: true,
      message: 'Property alert created (locally)',
      alert: newAlert
    };
  } catch (error) {
    console.error('Error creating property alert:', error);
    return { 
      success: false, 
      message: 'Failed to create property alert. Please try again.' 
    };
  }
};

/**
 * Get all property alerts for the current user
 * @returns {Promise} Promise with user's property alerts
 */
export const getUserPropertyAlerts = async () => {
  try {
    // Try multiple possible endpoint variations
    const endpoints = [
      '/api/property-alerts',
      '/property-alerts',
      '/api/alerts',
      '/alerts'
    ];
    
    let lastError = null;
    
    // Try each endpoint until one works
    for (const endpoint of endpoints) {
      try {
        console.log(`Trying get alerts endpoint: ${endpoint}`);
        const response = await api.get(endpoint);
        console.log(`Success with get alerts endpoint ${endpoint}:`, response.data);
        return response.data;
      } catch (endpointError) {
        lastError = endpointError;
        
        // If it's not a 404, break out
        if (endpointError.response && endpointError.response.status !== 404) {
          break;
        }
      }
    }
    
    // Fallback to localStorage
    const alerts = JSON.parse(localStorage.getItem('propertyAlerts') || '[]');
    
    return {
      success: true,
      alerts: alerts
    };
  } catch (error) {
    console.error('Error fetching property alerts:', error);
    return { 
      success: false, 
      alerts: [] 
    };
  }
};

/**
 * Update an existing property alert
 * @param {number} alertId - ID of the alert to update
 * @param {object} alertData - Updated alert data
 * @returns {Promise} Promise with update status
 */
export const updatePropertyAlert = async (alertId, alertData) => {
  try {
    // Try API update first
    try {
      const response = await api.put(`/api/property-alerts/${alertId}`, alertData);
      return response.data;
    } catch (apiError) {
      console.warn('API update failed, using localStorage fallback:', apiError.message);
      
      // Fallback to localStorage
      const alerts = JSON.parse(localStorage.getItem('propertyAlerts') || '[]');
      const alertIndex = alerts.findIndex(a => a.id === alertId);
      
      if (alertIndex === -1) {
        throw new Error('Alert not found');
      }
      
      alerts[alertIndex] = {
        ...alerts[alertIndex],
        ...alertData,
        updated_at: new Date().toISOString()
      };
      
      localStorage.setItem('propertyAlerts', JSON.stringify(alerts));
      
      return {
        success: true,
        message: 'Property alert updated (locally)',
        alert: alerts[alertIndex]
      };
    }
  } catch (error) {
    console.error('Error updating property alert:', error);
    return { 
      success: false, 
      message: 'Failed to update property alert' 
    };
  }
};

/**
 * Delete a property alert
 * @param {number} alertId - ID of the alert to delete
 * @returns {Promise} Promise with deletion status
 */
export const deletePropertyAlert = async (alertId) => {
  try {
    // Try API delete first
    try {
      const response = await api.delete(`/api/property-alerts/${alertId}`);
      return response.data;
    } catch (apiError) {
      console.warn('API delete failed, using localStorage fallback:', apiError.message);
      
      // Fallback to localStorage
      const alerts = JSON.parse(localStorage.getItem('propertyAlerts') || '[]');
      const filteredAlerts = alerts.filter(a => a.id !== alertId);
      
      localStorage.setItem('propertyAlerts', JSON.stringify(filteredAlerts));
      
      return {
        success: true,
        message: 'Property alert deleted (locally)'
      };
    }
  } catch (error) {
    console.error('Error deleting property alert:', error);
    return { 
      success: false, 
      message: 'Failed to delete property alert' 
    };
  }
};