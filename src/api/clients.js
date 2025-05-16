// src/api/clients.js
import axios from 'axios';

// API base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Get authentication headers from local storage
 */
export const getAuthHeader = () => {
  const token = localStorage.getItem('accessToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Get all clients for the current user (agent)
 * @returns {Promise} Promise with client data
 */
export const getClients = async () => {
  try {
    const response = await axios.get(`${API_URL}/clients`, {
      headers: getAuthHeader()
    });
    
    // Add some logging to help debug
    console.log('Client API response:', response.data);
    
    return {
      data: response.data.clients || response.data || []
    };
  } catch (error) {
    console.error('Error fetching clients:', error);
    
    // Return empty data rather than throwing to prevent UI errors
    if (error.response?.status === 404) {
      console.warn('No clients found or endpoint not available');
      return { data: [] };
    }
    
    throw error;
  }
};

/**
 * Get a client by ID
 * @param {string|number} id - Client ID
 * @returns {Promise} Promise with client data
 */
export const getClientById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/clients/${id}`, {
      headers: getAuthHeader()
    });
    
    return {
      data: response.data.client || response.data || {}
    };
  } catch (error) {
    console.error(`Error fetching client ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new client
 * @param {Object} clientData - Client data object
 * @returns {Promise} Promise with created client data
 */
export const createClient = async (clientData) => {
  try {
    const response = await axios.post(`${API_URL}/clients`, clientData, {
      headers: getAuthHeader()
    });
    
    return response.data;
  } catch (error) {
    console.error('Error creating client:', error);
    throw error;
  }
};

/**
 * Update an existing client
 * @param {string|number} id - Client ID
 * @param {Object} clientData - Updated client data
 * @returns {Promise} Promise with updated client data
 */
export const updateClient = async (id, clientData) => {
  try {
    const response = await axios.put(`${API_URL}/clients/${id}`, clientData, {
      headers: getAuthHeader()
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error updating client ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a client
 * @param {string|number} id - Client ID
 * @returns {Promise} Promise with delete operation status
 */
export const deleteClient = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/clients/${id}`, {
      headers: getAuthHeader()
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error deleting client ${id}:`, error);
    throw error;
  }
};

/**
 * Get properties for a specific client
 * @param {string|number} clientId - Client ID
 * @returns {Promise} Promise with client properties data
 */
export const getClientProperties = async (clientId) => {
  try {
    const response = await axios.get(`${API_URL}/clients/${clientId}/properties`, {
      headers: getAuthHeader()
    });
    
    return {
      data: response.data.properties || response.data || []
    };
  } catch (error) {
    console.error(`Error fetching properties for client ${clientId}:`, error);
    
    // Return empty data for 404 rather than throwing
    if (error.response?.status === 404) {
      return { data: [] };
    }
    
    throw error;
  }
};

/// src/api/clients.js

/**
 * Link an existing property to a client
 * @param {string} clientId - The client ID
 * @param {string} propertyId - The property ID to link
 * @returns {Promise} - API response
 */
export const addPropertyToClient = async (clientId, propertyId) => {
  try {
    // Ensure both IDs are valid
    if (!clientId || !propertyId) {
      throw new Error('Both client ID and property ID are required');
    }
    
    // Check if property ID is temporary (starts with "temp-")
    if (propertyId.toString().startsWith('temp-')) {
      throw new Error('Cannot link a temporary property. Please save the property first.');
    }
    
    console.log(`Attempting to link property ${propertyId} to client ${clientId}`);
    
    // Get the API base URL from environment or default
    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    
    // Make the API request - using POST as our backend expects
    const response = await fetch(`${API_BASE_URL}/api/clients/${clientId}/properties`, {
      method: 'POST', // Using POST as that's what your backend expects
      headers: getAuthHeader(),
      body: JSON.stringify({
        property_id: propertyId
      }),
    });

    // Parse the response as JSON
    const data = await response.json();

    // Handle non-successful responses
    if (!response.ok) {
      throw new Error(data.error || data.details || `Failed to link property: ${response.status}`);
    }

    // Return the response data
    return data;
  } catch (error) {
    console.error('Error linking property to client:', error);
    throw error;
  }
};


/**
 * Remove a property from a client
 * @param {string} clientId - The client ID
 * @param {string} propertyId - The property ID to remove
 * @returns {Promise} - API response
 */
export const removePropertyFromClient = async (clientId, propertyId) => {
  try {
    // Ensure both IDs are valid
    if (!clientId || !propertyId) {
      throw new Error('Both client ID and property ID are required');
    }
    
    console.log(`Attempting to remove property ${propertyId} from client ${clientId}`);
    
    // Get the API base URL from environment or default
    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    
    // Make the API request
    const response = await fetch(`${API_BASE_URL}/api/clients/${clientId}/properties/${propertyId}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });

    // Try to parse the response as JSON
    let data;
    try {
      data = await response.json();
    } catch (e) {
      // If response is not JSON, create a default response
      data = { message: response.ok ? 'Property removed successfully' : 'Failed to remove property' };
    }

    // Handle non-successful responses
    if (!response.ok) {
      throw new Error(data.error || data.details || `Failed to remove property: ${response.status}`);
    }

    // Return the response data
    return data;
  } catch (error) {
    console.error('Error removing property from client:', error);
    throw error;
  }
};

export default {
  getClients,
  getClientById,
  getClientProperties,
  createClient,
  updateClient,
  deleteClient,
  addPropertyToClient,
  removePropertyFromClient
};