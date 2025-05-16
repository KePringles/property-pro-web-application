import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Alert, Typography, Button, Box, CircularProgress } from '@mui/material';
import PropertyForm from '../components/properties/PropertyForm';
import { createProperty } from '../api/properties';
import { addPropertyToClient } from '../api/clients';
import { useAuth } from '../hooks/useAuth';

/**
 * AddProperty page component
 * Handles property creation workflow
 */
const AddProperty = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    user, 
    isLoading: authLoading, 
    isAuthenticated,
    isPropertyOwner,
    isAgent,
    activeRole
  } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [clientId, setClientId] = useState(null);
  const [linkingError, setLinkingError] = useState(null);
  
  // Check for client_id in URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const clientIdParam = params.get('client_id');
    
    if (clientIdParam) {
      console.log(`Property will be linked to client: ${clientIdParam}`);
      setClientId(clientIdParam);
    }
  }, [location]);
  
  // Only property_owner or agent can add property
  const canAddProperty = isPropertyOwner || isAgent;
  
  // Show loading while checking auth
  if (authLoading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <CircularProgress />
      </Container>
    );
  }
  
  // Show access denied if user cannot add property
  if (!isAuthenticated || !canAddProperty) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>Access Denied</Typography>
        <Typography variant="body1" sx={{ mb: 4 }}>
          {!isAuthenticated 
            ? "You must be logged in to add a property." 
            : "You do not have permission to add a property. Only property owners and agents can add properties."}
        </Typography>
        <Box sx={{ mt: 3 }}>
          {!isAuthenticated && (
            <Button 
              variant="contained" 
              onClick={() => navigate('/login?redirect=' + encodeURIComponent(window.location.pathname))}
              sx={{ mr: 2 }}
            >
              Login
            </Button>
          )}
          <Button 
            variant="outlined" 
            onClick={() => navigate('/')}
          >
            Go Back Home
          </Button>
        </Box>
      </Container>
    );
  }

  /**
   * Handle form submission
   * @param {Object} formData - The property form data
   * @param {Function} callback - Optional callback function
   */
  const handleSubmit = async (formData, callback) => {
    setIsLoading(true);
    setError(null);
    setLinkingError(null);
    
    console.log("Form data before submission:", formData);
    console.log("Title value:", formData.title);
    
    try {
      // Get token from localStorage - using the correct key based on your auth system
      const token = localStorage.getItem('accessToken');
      
      // Validate that we have an auth token
      if (!token) {
        throw new Error("Authentication token is missing. Please log in again.");
      }
      
      // Validate required fields again
      if (!formData.title || formData.title.trim() === '') {
        throw new Error("Property title is required");
      }
      
      // Let createProperty function handle FormData creation
      // Your existing implementation should work with this
      const response = await createProperty(formData);
      console.log('Property created successfully:', response);
      
      // Extract the property ID
      const propertyId = response.property?.prop_id || response.property?.id || response.id;
      
      if (!propertyId) {
        throw new Error("No property ID returned from the server");
      }
      
      console.log('New property ID:', propertyId);
      
      // If we have a client ID, link the property to the client
      if (clientId) {
        try {
          console.log(`Linking property ${propertyId} to client ${clientId}`);
          
          // Use the fixed addPropertyToClient function with PUT method
          await addPropertyToClient(clientId, propertyId);
          console.log('Property linked to client successfully');
          
          setSuccess(true);
          // Navigate to client details with success parameter
          setTimeout(() => {
            navigate(`/clients/${clientId}?property_added=true`);
          }, 1500);
        } catch (err) {
          console.error('Error linking property to client:', err);
          setLinkingError(`Property was created but could not be linked to client: ${err.message || 'Unknown error'}`);
          
          // Still navigate to property after a delay
          setTimeout(() => {
            navigate(`/properties/${propertyId}?linking_failed=true`);
          }, 3000);
        }
      } else {
        // No client to link to, just navigate to the property
        setSuccess(true);
        setTimeout(() => {
          navigate(`/properties/${propertyId}`);
        }, 1500);
      }
      
      // Call the callback if provided
      if (typeof callback === 'function') {
        callback(propertyId);
      }
    } catch (error) {
      console.error('Error adding property:', error);
      
      // Extract the most useful error message
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.response?.status === 401) {
        setError('Your session has expired. Please log in again.');
      } else {
        setError(error.message || 'Failed to add property. Please try again.');
      }
      
      setIsLoading(false);
    }
  };

  /**
   * Cancel property creation and go back
   */
  const handleCancel = () => {
    if (clientId) {
      // If we came from a client page, go back to that client
      navigate(`/clients/${clientId}`);
    } else {
      // Otherwise just go back
      navigate(-1);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {clientId && (
        <Alert severity="info" sx={{ mb: 3 }}>
          This property will be linked to client ID: {clientId}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Property added successfully! {clientId ? 'Linking to client and redirecting...' : 'Redirecting...'}
        </Alert>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {linkingError && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {linkingError}
        </Alert>
      )}
      
      <PropertyForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isLoading}
        error={error}
        clientId={clientId}
      />
    </Container>
  );
};

export default AddProperty;
