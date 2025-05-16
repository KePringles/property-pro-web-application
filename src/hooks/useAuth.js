// src/hooks/useAuth.js - Updated to handle complex role structures
import { useState, useEffect, useCallback, useContext, createContext } from 'react';
import api from '../services/api';
import { updateUserProfile as apiUpdateUserProfile } from '../api/user';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Normalize role name for consistency
  const normalizeRoleName = (role) => {
    if (!role) return '';
    
    // If it's not a string, try to convert it
    let roleStr = typeof role === 'string' ? role : String(role);
    
    // Try to parse JSON if it looks like JSON
    if (roleStr.includes('[') || roleStr.includes('{')) {
      try {
        const parsed = JSON.parse(roleStr);
        if (Array.isArray(parsed) && parsed.length > 0) {
          roleStr = parsed[0];
        } else if (typeof parsed === 'string') {
          roleStr = parsed;
        } else if (typeof parsed === 'object' && parsed !== null) {
          roleStr = JSON.stringify(parsed);
        }
      } catch (e) {
        // If parsing fails, clean up the string manually
        roleStr = roleStr.replace(/[\[\]"\\]/g, '');
      }
    }
    
    // Convert to lowercase for comparison
    const lowerRole = roleStr.toLowerCase();
    
    // Standardize naming conventions
    if (lowerRole.includes('seeker')) return 'property_seeker';
    if (lowerRole.includes('owner')) return 'property_owner';
    if (lowerRole.includes('agent')) return 'property_agent';
    
    return lowerRole;
  };

  // Format role for display
  const formatRoleName = (role) => {
    if (!role) return '';
    
    // Get the base role without prefix
    let baseName = role.replace('property_', '');
    
    // Capitalize each word
    return baseName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Process user data to ensure consistent structure
  const processUserData = (userData) => {
    if (!userData) return null;
    
    console.log('Processing user data:', userData);
    
    // Extract roles correctly even when they're nested in strings
    let processedRoles = [];
    
    if (userData.user_type) {
      // Handle different data structures
      if (Array.isArray(userData.user_type)) {
        // Process each element in the array
        processedRoles = userData.user_type.map(role => {
          if (typeof role === 'string') {
            // Try to parse if it looks like a JSON string
            if (role.includes('[') && role.includes(']')) {
              try {
                const parsed = JSON.parse(role);
                if (Array.isArray(parsed) && parsed.length > 0) {
                  return normalizeRoleName(parsed[0]);
                }
                return normalizeRoleName(parsed);
              } catch (e) {
                // If parsing fails, cleanup the string
                return normalizeRoleName(role.replace(/[\[\]"\\]/g, ''));
              }
            }
            return normalizeRoleName(role);
          }
          return normalizeRoleName(role);
        });
      } else if (typeof userData.user_type === 'string') {
        // Handle single string user_type
        processedRoles = [normalizeRoleName(userData.user_type)];
      }
    } else if (userData.role) {
      // Using single role field
      processedRoles = [normalizeRoleName(userData.role)];
    } else if (userData.roles) {
      // Using roles array field
      processedRoles = Array.isArray(userData.roles)
        ? userData.roles.map(normalizeRoleName)
        : [normalizeRoleName(userData.roles)];
    }
    
    // Filter out any invalid or empty roles
    processedRoles = processedRoles.filter(Boolean);
    
    // Ensure unique roles only
    processedRoles = [...new Set(processedRoles)];
    
    console.log('Processed roles:', processedRoles);
    
    // Determine active role
    let activeUserType = userData.active_user_type;
    
    // If no active_user_type, check active_role
    if (!activeUserType && userData.active_role) {
      activeUserType = normalizeRoleName(userData.active_role);
    }
    
    // If still no active role, use preferredUserRole from localStorage or first role
    if (!activeUserType && processedRoles.length > 0) {
      const preferredRole = localStorage.getItem('preferredUserRole');
      const normalizedPreferred = preferredRole ? normalizeRoleName(preferredRole) : null;
      
      activeUserType = (normalizedPreferred && processedRoles.includes(normalizedPreferred))
        ? normalizedPreferred
        : processedRoles[0];
    }
    
    // Make sure profile data is preserved
    const profile = userData.profile || {};
    
    // Create processed user object with clean roles
    const processedUser = {
      ...userData,
      user_type: processedRoles,
      active_user_type: activeUserType,
      profile
    };
    
    console.log('Final processed user:', processedUser);
    
    return processedUser;
  };

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('accessToken');
        const storedUser = localStorage.getItem('userData');
        
        if (storedUser) {
          // Immediately set user from localStorage to avoid UI flickering
          try {
            const parsedUser = JSON.parse(storedUser);
            setUser(processUserData(parsedUser));
          } catch (e) {
            console.error('Error parsing stored user data', e);
            localStorage.removeItem('userData');
          }
        }
        
        if (token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Fetch fresh user data from API
          const response = await api.get('/auth/me');
          const userData = processUserData(response.data);
          
          // Update localStorage with fresh data
          localStorage.setItem('userData', JSON.stringify(userData));
          setUser(userData);
        }
      } catch (err) {
        console.error('Auth init failed:', err);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userData');
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  // Clear error state
  const clearError = useCallback(() => setError(null), []);

  // Refresh user data
  const refreshUser = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/auth/me');
      const userData = processUserData(response.data);
      
      // Update localStorage
      localStorage.setItem('userData', JSON.stringify(userData));
      setUser(userData);
      
      return userData;
    } catch (err) {
      console.error('Failed to refresh user data:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Login user
  const loginUser = useCallback(async (credentials) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Login attempt with:', credentials.email);
      
      const { data } = await api.post('/auth/login', credentials);
      const { access_token, refresh_token, user } = data;
      
      console.log('Login successful, raw user data:', user);
  
      localStorage.setItem('accessToken', access_token);
      localStorage.setItem('refreshToken', refresh_token);
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      // Process user data for consistent structure
      const processedUser = processUserData(user);
      
      // Store in localStorage for persistence
      localStorage.setItem('userData', JSON.stringify(processedUser));
      setUser(processedUser);
      
      return processedUser;
    } catch (err) {
      // Check if this is the multiple accounts response
      if (err.response?.status === 400 && 
          err.response?.data?.require_user_type) {
        // Instead of treating this as an error, return the user types
        return {
          requireUserType: true,
          userTypes: err.response.data.user_types || []
        };
      }
  
      const message = err.response?.data?.message || 'Unable to connect to server.';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Register user
  const registerUser = useCallback(async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data: res } = await api.post('/auth/register', data);
      const { access_token, refresh_token, user } = res;

      localStorage.setItem('accessToken', access_token);
      localStorage.setItem('refreshToken', refresh_token);
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      // Process user data for consistent structure
      const processedUser = processUserData(user);
      
      // Store in localStorage for persistence
      localStorage.setItem('userData', JSON.stringify(processedUser));
      setUser(processedUser);
      
      return processedUser;
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Register additional account
  const registerAdditionalAccount = useCallback(async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      // Normalize role type
      const normalizedData = {
        ...data,
        role_type: normalizeRoleName(data.role_type)
      };

      console.log('Registering additional account with:', normalizedData);

      // API endpoint might vary based on your backend
      const { data: res } = await api.post('/auth/register-additional', normalizedData);
      
      console.log('Additional account registration response:', res);
      
      // API might return a new token or updated user data
      if (res.access_token) {
        localStorage.setItem('accessToken', res.access_token);
        api.defaults.headers.common['Authorization'] = `Bearer ${res.access_token}`;
      }
      
      // Get the updated user data
      const updatedUser = res.user || await refreshUser();
      const processedUser = processUserData(updatedUser);
      
      // Update localStorage
      localStorage.setItem('userData', JSON.stringify(processedUser));
      setUser(processedUser);
      
      return processedUser;
    } catch (err) {
      console.error('Additional account registration error:', err);
      const message = err.response?.data?.message || 'Failed to register additional account';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, [refreshUser]);

  // Logout user
  const logoutUser = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('preferredUserRole');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  }, []);

  // Switch user account with fixed role handling
  const switchUserAccount = useCallback(async (userType) => {
    console.log('Attempting to switch account to:', userType);
    setIsLoading(true);
    setError(null);
    
    try {
      // Clean up the role value before sending to API
      let cleanRole = userType;
      
      // Handle complex JSON role structures
      if (typeof userType === 'string' && (userType.includes('[') || userType.includes('"'))) {
        try {
          // Try to parse it if it's a JSON string
          const parsed = JSON.parse(userType);
          if (Array.isArray(parsed) && parsed.length > 0) {
            cleanRole = parsed[0];
          } else if (typeof parsed === 'string') {
            cleanRole = parsed;
          }
        } catch (e) {
          // If parsing fails, just clean the string manually
          cleanRole = userType.replace(/[\[\]"\\]/g, '');
        }
      }
      
      // Normalize the role type
      const normalizedRoleType = normalizeRoleName(cleanRole);
      
      console.log('Sending normalized role to API:', normalizedRoleType);
      
      // API endpoint might vary based on your backend
      const { data } = await api.post('/auth/switch-account', { 
        user_type: normalizedRoleType 
      });
      
      console.log('Switch account API response:', data);
      
      const { access_token, refresh_token, user } = data;
  
      localStorage.setItem('accessToken', access_token);
      localStorage.setItem('refreshToken', refresh_token);
      localStorage.setItem('preferredUserRole', normalizedRoleType);
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      // Create updated user with active role
      const updatedUser = {
        ...user,
        active_user_type: normalizedRoleType
      };
      
      // Process user data for consistent structure
      const processedUser = processUserData(updatedUser);
      
      // Store in localStorage for persistence
      localStorage.setItem('userData', JSON.stringify(processedUser));
      setUser(processedUser);
      
      console.log('Account switched successfully to:', normalizedRoleType);
      console.log('Updated user data:', processedUser);
      
      return processedUser;
    } catch (err) {
      console.error('Account switch error:', err);
      console.error('Error details:', err.response?.data);
      const message = err.response?.data?.message || 'Unable to switch accounts.';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update user profile
  const updateUserProfile = useCallback(async (profileData) => {
    console.log('Starting profile update with data:', profileData);
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiUpdateUserProfile(profileData);
      console.log('API response for profile update:', data);
      
      // Update user state with the complete user object from response
      if (data.user) {
        const processedUser = processUserData(data.user);
        
        // Store in localStorage for persistence
        localStorage.setItem('userData', JSON.stringify(processedUser));
        setUser(processedUser);
      } else {
        // If the API doesn't return the updated user, refresh user data
        await refreshUser();
      }
      
      return data;
    } catch (err) {
      console.error('Profile update error:', err);
      const message = err.message || 'Profile update failed';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, [refreshUser]);

  // Get user roles - extract into a function to be used in multiple places
  const getUserRoles = (userData = user) => {
    if (!userData) return [];
    
    return userData.user_type || [];
  };

  // Check if user has multiple roles
  const hasMultipleRoles = (userData = user) => {
    const roles = getUserRoles(userData);
    return roles.length > 1;
  };

  // Get active role
  const getActiveRole = (userData = user) => {
    if (!userData) return '';
    
    return userData.active_user_type || '';
  };

  // Get available roles that user doesn't already have
  const getAvailableRoles = (userData = user) => {
    const currentRoles = getUserRoles(userData).map(normalizeRoleName);
    
    // All possible roles - adjust based on your system's allowed roles
    const allRoles = ['property_seeker', 'property_owner', 'agent'];
    
    return allRoles.filter(role => !currentRoles.includes(role));
  };

  // Helper function to check if user is authenticated
  const isUserAuthenticated = useCallback(() => {
    return !!user;
  }, [user]);

  // Helper functions to check user roles
  const isAgent = useCallback(() => {
    if (!user) return false;
    
    // Check active_user_type
    const activeType = getActiveRole();
    return activeType === 'agent' || activeType === 'property_agent';
  }, [user]);

  const isPropertyOwner = useCallback(() => {
    if (!user) return false;
    
    // Check active_user_type
    const activeType = getActiveRole();
    return activeType === 'property_owner';
  }, [user]);

  const isPropertySeeker = useCallback(() => {
    if (!user) return false;
    
    // Check active_user_type
    const activeType = getActiveRole();
    return activeType === 'property_seeker';
  }, [user]);

  // Get current user roles array (filtered and normalized)
  const userRoles = user ? getUserRoles(user) : [];
  
  // Check if user has multiple roles (boolean value)
  const userHasMultipleRoles = userRoles.length > 1;
  
  // Get current active role
  const activeRole = getActiveRole(user);
  
  // Get available roles the user can add
  const availableRoles = getAvailableRoles(user);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        clearError,
        loginUser,
        registerUser,
        registerAdditionalAccount,
        logoutUser,
        updateUserProfile,
        refreshUser,
        switchUserAccount,
        isInitialized,
        isAuthenticated: !!user,
        isAgent: isAgent(),
        isPropertyOwner: isPropertyOwner(),
        isPropertySeeker: isPropertySeeker(),
        // Updated role management properties
        formatRoleName,
        normalizeRoleName,
        userRoles,
        availableRoles,
        hasMultipleRoles: userHasMultipleRoles,
        activeRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;