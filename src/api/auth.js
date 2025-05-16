// src/api/auth.js
import axios from 'axios';

// Use correct API URL (matches what you're using elsewhere)
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Configure axios to include the JWT token in the headers
axios.interceptors.request.use(
  (config) => {
    // Use accessToken consistently throughout the application
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle authentication errors globally
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear tokens and redirect to login on auth errors
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const login = async (credentials) => {
  try {
    // Add /api prefix to all endpoints
    const response = await axios.post(`${API_URL}/api/auth/login`, credentials);
    
    // Handle the case where we need to specify a user_type
    if (response.status === 400 && response.data.require_user_type) {
      return {
        requireUserType: true,
        userTypes: response.data.user_types,
        message: response.data.message
      };
    }
    
    const { access_token, refresh_token, user } = response.data;
    
    // Store the tokens and user info in localStorage
    localStorage.setItem('accessToken', access_token);
    localStorage.setItem('refreshToken', refresh_token);
    localStorage.setItem('user', JSON.stringify(user));
    
    console.log('Logged in user:', user);
    console.log('User type:', user.user_type);
    
    return { token: access_token, user };
  } catch (error) {
    console.error('Login error:', error);
    throw new Error(error.response?.data?.message || 'Login failed');
  }
};

// Update all other API endpoints similarly
export const register = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/api/auth/register`, userData);
    const { access_token, refresh_token, user } = response.data;
    
    // Store the tokens and user info
    localStorage.setItem('accessToken', access_token);
    localStorage.setItem('refreshToken', refresh_token);
    localStorage.setItem('user', JSON.stringify(user));
    
    console.log('Registered user:', user);
    console.log('User type:', user.user_type);
    
    return { token: access_token, user };
  } catch (error) {
    console.error('Registration error:', error);
    throw new Error(error.response?.data?.message || 'Registration failed');
  }
};

export const logout = async () => {
  try {
    await axios.post(`${API_URL}/api/auth/logout`);
    
    // Clear all auth data from localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    // Still remove all auth data even if the API call fails
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    return { success: false, error: error.message };
  }
};

export const getCurrentUser = async () => {
  try {
    // First try to get from localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    
    // If no user in localStorage but we have a token, fetch from API
    const token = localStorage.getItem('accessToken');
    if (!token) {
      return null;
    }
    
    const response = await axios.get(`${API_URL}/api/auth/user`);
    const user = response.data.user;
    
    // Update localStorage with the latest user data
    localStorage.setItem('user', JSON.stringify(user));
    
    return user;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
};

export const updateUserProfile = async (userData) => {
  try {
    const response = await axios.put(`${API_URL}/api/users/profile`, userData);
    
    // Update user in localStorage
    const updatedUser = response.data.user;
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update profile');
  }
};

export const changePassword = async (passwordData) => {
  try {
    const response = await axios.put(`${API_URL}/api/auth/change-password`, passwordData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to change password');
  }
};

export const switchAccount = async (userType) => {
  try {
    const response = await axios.post(`${API_URL}/api/auth/switch-account`, {
      user_type: userType
    });
    
    const { access_token, refresh_token, user } = response.data;
    
    // Update tokens and user in localStorage
    localStorage.setItem('accessToken', access_token);
    localStorage.setItem('refreshToken', refresh_token);
    localStorage.setItem('user', JSON.stringify(user));
    
    console.log('Switched account user:', user);
    console.log('New user type:', user.user_type);
    
    return { token: access_token, user };
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to switch accounts');
  }
};

// Get user's role - handles both string and array user_type
export const getUserRole = () => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    const user = JSON.parse(userStr);
    
    // Handle user_type as either string or array
    if (Array.isArray(user.user_type)) {
      return user.user_type[0];
    }
    
    return user.user_type;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
};