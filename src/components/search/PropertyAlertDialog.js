// src/components/search/PropertyAlertDialog.js
import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, FormControl, InputLabel, Select,
  MenuItem, FormControlLabel, Checkbox, Box, Typography,
  CircularProgress, Alert, Switch, Divider, Grid
} from '@mui/material';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import { createPropertyAlert } from '../../api/alerts';

const PropertyAlertDialog = ({ open, onClose, currentFilters }) => {
  // State for form inputs
  const [alertData, setAlertData] = useState({
    name: '',
    frequency: 'daily', // daily, weekly, instant
    email_notifications: true,
    push_notifications: true,
    criteria: {} // This will be populated from currentFilters
  });
  
  // State for UI feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // Process the current search filters when dialog opens
  useEffect(() => {
    if (open && currentFilters) {
      console.log('Current filters for alert:', currentFilters);
      
      // Extract relevant filters for the alert
      const alertCriteria = {};
      
      // Map relevant properties from currentFilters to alertCriteria
      if (currentFilters.parish) alertCriteria.parish = currentFilters.parish;
      if (currentFilters.city) alertCriteria.city = currentFilters.city;
      if (currentFilters.min_price) alertCriteria.min_price = currentFilters.min_price;
      if (currentFilters.max_price) alertCriteria.max_price = currentFilters.max_price;
      if (currentFilters.min_bedrooms) alertCriteria.min_bedrooms = currentFilters.min_bedrooms;
      if (currentFilters.min_bathrooms) alertCriteria.min_bathrooms = currentFilters.min_bathrooms;
      if (currentFilters.property_type_id) alertCriteria.property_type_id = currentFilters.property_type_id;
      if (currentFilters.amenities) alertCriteria.amenities = currentFilters.amenities;
      
      // Set a default name based on filters
      let defaultName = 'Property Alert';
      if (currentFilters.parish) {
        defaultName = `${currentFilters.parish} Properties`;
      }
      if (currentFilters.min_bedrooms) {
        defaultName = `${currentFilters.min_bedrooms}+ Bed ${defaultName}`;
      }
      
      // Update state with processed criteria
      setAlertData(prev => ({
        ...prev,
        name: defaultName,
        criteria: alertCriteria
      }));
    }
  }, [open, currentFilters]);
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setAlertData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle checkbox/switch changes
  const handleSwitchChange = (e) => {
    const { name, checked } = e.target;
    setAlertData(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  // Handle alert creation
  const handleCreateAlert = async () => {
    // Reset states
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      // Add a timestamp to the alert data
      const alertToCreate = {
        ...alertData,
        created_at: new Date().toISOString()
      };
      
      console.log('Submitting alert data:', alertToCreate);
      
      // Call API to create alert
      const response = await createPropertyAlert(alertToCreate);
      
      console.log('Alert creation response:', response);
      
      if (response.success) {
        setSuccess(true);
        
        // Close dialog after success (with delay to show success message)
        setTimeout(() => {
          onClose(true); // Pass true to indicate successful creation
        }, 1500);
      } else {
        // API returned an error
        setError(response.message || 'Failed to create alert');
      }
    } catch (err) {
      console.error('Error creating alert:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to display criteria summary
  const getCriteriaSummary = () => {
    const { criteria } = alertData;
    const summaryParts = [];
    
    if (criteria.parish) summaryParts.push(`Parish: ${criteria.parish}`);
    if (criteria.city) summaryParts.push(`City: ${criteria.city}`);
    
    if (criteria.min_price || criteria.max_price) {
      const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'JMD',
          maximumFractionDigits: 0
        }).format(price);
      };
      
      const priceRange = [];
      if (criteria.min_price) priceRange.push(`From ${formatPrice(criteria.min_price)}`);
      if (criteria.max_price) priceRange.push(`To ${formatPrice(criteria.max_price)}`);
      
      summaryParts.push(`Price: ${priceRange.join(' ')}`);
    }
    
    if (criteria.min_bedrooms) summaryParts.push(`${criteria.min_bedrooms}+ Beds`);
    if (criteria.min_bathrooms) summaryParts.push(`${criteria.min_bathrooms}+ Baths`);
    
    return summaryParts.join(', ');
  };

  return (
    <Dialog
      open={open}
      onClose={() => !loading && onClose()}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
        <NotificationsActiveIcon sx={{ mr: 1, color: 'primary.main' }} />
        Create Property Alert
      </DialogTitle>
      
      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Property alert created successfully!
          </Alert>
        )}
        
        <Box sx={{ mb: 3 }}>
          <TextField
            label="Alert Name"
            name="name"
            value={alertData.name}
            onChange={handleChange}
            fullWidth
            margin="normal"
            disabled={loading}
            required
          />
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Search Criteria
            </Typography>
            <Typography variant="body2">
              {getCriteriaSummary() || 'No criteria specified'}
            </Typography>
          </Box>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="subtitle1" gutterBottom>
          Notification Preferences
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="frequency-label">Frequency</InputLabel>
              <Select
                labelId="frequency-label"
                name="frequency"
                value={alertData.frequency}
                onChange={handleChange}
                disabled={loading}
              >
                <MenuItem value="instant">Instant</MenuItem>
                <MenuItem value="daily">Daily Digest</MenuItem>
                <MenuItem value="weekly">Weekly Digest</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Box sx={{ mt: 3 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={alertData.email_notifications}
                    onChange={handleSwitchChange}
                    name="email_notifications"
                    disabled={loading}
                  />
                }
                label="Email Notifications"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={alertData.push_notifications}
                    onChange={handleSwitchChange}
                    name="push_notifications"
                    disabled={loading}
                  />
                }
                label="Push Notifications"
              />
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ p: 2 }}>
        <Button 
          onClick={() => onClose(false)} 
          disabled={loading}
          variant="outlined"
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleCreateAlert}
          disabled={loading || !alertData.name.trim()}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          Create Alert
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PropertyAlertDialog;