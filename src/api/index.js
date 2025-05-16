// src/api/index.js
import axios from 'axios';

// Create a base API client
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If token is expired and we haven't already tried to refresh it
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          // No refresh token available, user needs to login again
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
          return Promise.reject(error);
        }
        
        // Call the refresh token endpoint
        const response = await axios.post('/api/refresh', {}, {
          headers: {
            'Authorization': `Bearer ${refreshToken}`
          }
        });
        
        const { access_token } = response.data;
        
        // Update the token in localStorage
        localStorage.setItem('token', access_token);
        
        // Retry the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return axios(originalRequest);
      } catch (refreshError) {
        // If refresh fails, redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;