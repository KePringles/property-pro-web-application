// Enhanced UserPreferences.js implementation - continued

import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Grid, Slider, FormControl, InputLabel,
  Select, MenuItem, Chip, Button, TextField, Autocomplete,
  CircularProgress, Alert, Divider
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import TuneIcon from '@mui/icons-material/Tune';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import HotelIcon from '@mui/icons-material/Hotel';
import BathtubIcon from '@mui/icons-material/Bathtub';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { useSnackbar } from 'notistack';
import { useAuth } from '../../hooks/useAuth';

// Import API functions
import { getUserPreferences, updatePreferences } from '../../services/recommendationService';
import { getPropertyTypes, getParishes, getAmenities } from '../../api/properties';

// Helper to format price for display
const formatPrice = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'JMD',
    maximumFractionDigits: 0
  }).format(value);
};

const UserPreferences = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuth();
  
  // Reference data
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [parishes, setParishes] = useState([]);
  const [amenities, setAmenities] = useState([]);
  
  // Preference state
  const [preferences, setPreferences] = useState({
    min_price: 5000000,
    max_price: 50000000,
    parish_id: '',
    city: '',
    min_bedrooms: '',
    min_bathrooms: '',
    property_type_id: '',
    amenities: [],
    is_for_sale: true,
    is_for_rent: false,
    weights: {
      price: 5,
      location: 5,
      size: 5,
      amenities: 5
    }
  });
  
  // UI state
  const [loading, setLoading] = useState({
    init: true,
    save: false
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [customAmenity, setCustomAmenity] = useState('');
  
  // Cities for selected parish
  const [cityOptions, setCityOptions] = useState([]);
  
  // Fetch all initial data
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(prev => ({ ...prev, init: true }));
      setError(null);
      
      try {
        // Fetch reference data in parallel
        const [typesRes, parishesRes, amenitiesRes, preferencesRes] = await Promise.all([
          getPropertyTypes(),
          getParishes(),
          getAmenities(),
          getUserPreferences(user?.user_id || user?.id)
        ]);
        
        // Set reference data
        setPropertyTypes(typesRes.property_types || []);
        setParishes(parishesRes.parishes || []);
        setAmenities(amenitiesRes.amenities || []);
        
        // Set user preferences
        if (preferencesRes && preferencesRes.preferences) {
          const userPrefs = preferencesRes.preferences;
          
          // Set preferences with proper defaults for any missing values
          setPreferences({
            min_price: userPrefs.min_price || preferences.min_price,
            max_price: userPrefs.max_price || preferences.max_price,
            parish_id: userPrefs.parish_id || '',
            city: userPrefs.city || '',
            min_bedrooms: userPrefs.min_bedrooms || '',
            min_bathrooms: userPrefs.min_bathrooms || '',
            property_type_id: userPrefs.property_type_id || '',
            amenities: userPrefs.amenities || [],
            is_for_sale: userPrefs.is_for_sale !== undefined ? userPrefs.is_for_sale : true,
            is_for_rent: userPrefs.is_for_rent !== undefined ? userPrefs.is_for_rent : false,
            weights: {
              price: userPrefs.weights?.price || 5,
              location: userPrefs.weights?.location || 5,
              size: userPrefs.weights?.size || 5,
              amenities: userPrefs.weights?.amenities || 5
            }
          });
          
          // If parish is set, fetch cities for that parish
          if (userPrefs.parish_id) {
            // In a real app, you'd fetch cities for the parish
            // For now, we'll simulate with a placeholder
            setCityOptions(['Kingston', 'Montego Bay', 'Ocho Rios', 'Port Antonio']);
          }
          
          // Save preferences to local storage for use in other components
          localStorage.setItem('userPreferences', JSON.stringify({
            ...userPrefs,
            timestamp: new Date().toISOString()
          }));
        }
      } catch (err) {
        console.error('Error fetching preferences data:', err);
        setError('Failed to load preferences. Please try again.');
      } finally {
        setLoading(prev => ({ ...prev, init: false }));
      }
    };
    
    fetchAllData();
  }, [user]);
  
  // Update city options when parish changes
  useEffect(() => {
    if (preferences.parish_id) {
      // In a real app, you'd fetch cities for the selected parish
      // For now, we'll simulate with a placeholder
      setCityOptions(['Kingston', 'Montego Bay', 'Ocho Rios', 'Port Antonio']);
    } else {
      setCityOptions([]);
      // Reset city when parish changes
      setPreferences(prev => ({
        ...prev,
        city: ''
      }));
    }
  }, [preferences.parish_id]);
  
  // Handle preference changes
  const handleChange = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  // Handle weight changes
  const handleWeightChange = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      weights: {
        ...prev.weights,
        [key]: value
      }
    }));
  };
  
  // Handle amenity toggle
  const handleAmenityToggle = (amenityId) => {
    const currentAmenities = [...preferences.amenities];
    const index = currentAmenities.indexOf(amenityId);
    
    if (index === -1) {
      // Add amenity
      currentAmenities.push(amenityId);
    } else {
      // Remove amenity
      currentAmenities.splice(index, 1);
    }
    
    handleChange('amenities', currentAmenities);
  };
  
  // Add custom amenity
  const handleAddCustomAmenity = () => {
    if (customAmenity.trim() && !preferences.amenities.includes(customAmenity.trim())) {
      handleChange('amenities', [...preferences.amenities, customAmenity.trim()]);
      setCustomAmenity('');
    }
  };
  
  // Save preferences
  const handleSave = async () => {
    setLoading(prev => ({ ...prev, save: true }));
    setError(null);
    setSuccess(false);
    
    try {
      // Make a copy of preferences for API call
      const preferencesData = {
        ...preferences,
        user_id: user?.user_id || user?.id  // Add user_id to the request
      };
      
      await updatePreferences(preferencesData);
      setSuccess(true);
      enqueueSnackbar('Preferences saved successfully!', { variant: 'success' });
      
      // Save to local storage for use in other components
      localStorage.setItem('userPreferences', JSON.stringify({
        ...preferencesData,
        timestamp: new Date().toISOString()
      }));
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error saving preferences:', err);
      setError('Failed to save preferences. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, save: false }));
    }
  };
  
  // Reset to defaults
  const handleReset = () => {
    setPreferences({
      min_price: 5000000,
      max_price: 50000000,
      parish_id: '',
      city: '',
      min_bedrooms: '',
      min_bathrooms: '',
      property_type_id: '',
      amenities: [],
      is_for_sale: true,
      is_for_rent: false,
      weights: {
        price: 5,
        location: 5,
        size: 5,
        amenities: 5
      }
    });
    setError(null);
    setSuccess(false);
  };
  
  if (loading.init) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Your Property Preferences
      </Typography>
      <Typography variant="body1" paragraph color="text.secondary">
        Set your preferences to get personalized property recommendations. We'll use these
        preferences to find properties that match your criteria.
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Your preferences have been saved successfully!
        </Alert>
      )}
      
      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <TuneIcon sx={{ mr: 1 }} /> Preference Settings
        </Typography>
        
        <Grid container spacing={3}>
          {/* Property Type */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="property-type-label">Property Type</InputLabel>
              <Select
                labelId="property-type-label"
                value={preferences.property_type_id}
                onChange={(e) => handleChange('property_type_id', e.target.value)}
                label="Property Type"
              >
                <MenuItem value="">Any Property Type</MenuItem>
                {propertyTypes.map((type) => (
                  <MenuItem key={type.type_id} value={type.type_id}>
                    {type.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          {/* Parish */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="parish-label">Preferred Parish</InputLabel>
              <Select
                labelId="parish-label"
                value={preferences.parish_id}
                onChange={(e) => handleChange('parish_id', e.target.value)}
                label="Preferred Parish"
              >
                <MenuItem value="">Any Parish</MenuItem>
                {parishes.map((parish) => (
                  <MenuItem key={parish.parish_id} value={parish.parish_id}>
                    {parish.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          {/* City */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth disabled={!preferences.parish_id}>
              <InputLabel id="city-label">Preferred City/Area</InputLabel>
              <Select
                labelId="city-label"
                value={preferences.city}
                onChange={(e) => handleChange('city', e.target.value)}
                label="Preferred City/Area"
              >
                <MenuItem value="">Any City/Area</MenuItem>
                {cityOptions.map((city) => (
                  <MenuItem key={city} value={city}>
                    {city}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          {/* Property Status */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="property-status-label">Property Status</InputLabel>
              <Select
                labelId="property-status-label"
                value={
                  preferences.is_for_sale && preferences.is_for_rent
                    ? 'both'
                    : preferences.is_for_sale
                    ? 'sale'
                    : preferences.is_for_rent
                    ? 'rent'
                    : ''
                }
                onChange={(e) => {
                  const value = e.target.value;
                  handleChange('is_for_sale', value === 'sale' || value === 'both');
                  handleChange('is_for_rent', value === 'rent' || value === 'both');
                }}
                label="Property Status"
              >
                <MenuItem value="">No Preference</MenuItem>
                <MenuItem value="sale">For Sale Only</MenuItem>
                <MenuItem value="rent">For Rent Only</MenuItem>
                <MenuItem value="both">Both Sale and Rent</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          {/* Bedrooms */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <HotelIcon color="action" sx={{ mr: 1 }} />
              <Typography variant="body1">Minimum Bedrooms</Typography>
            </Box>
            <FormControl fullWidth>
              <Select
                value={preferences.min_bedrooms}
                onChange={(e) => handleChange('min_bedrooms', e.target.value)}
                displayEmpty
              >
                <MenuItem value="">No Minimum</MenuItem>
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <MenuItem key={num} value={num}>{num}+ Bedrooms</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          {/* Bathrooms */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <BathtubIcon color="action" sx={{ mr: 1 }} />
              <Typography variant="body1">Minimum Bathrooms</Typography>
            </Box>
            <FormControl fullWidth>
              <Select
                value={preferences.min_bathrooms}
                onChange={(e) => handleChange('min_bathrooms', e.target.value)}
                displayEmpty
              >
                <MenuItem value="">No Minimum</MenuItem>
                {[1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map((num) => (
                  <MenuItem key={num} value={num}>{num}+ Bathrooms</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          {/* Price Range */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <AttachMoneyIcon color="action" sx={{ mr: 1 }} />
              <Typography variant="body1">Price Range</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                ({formatPrice(preferences.min_price)} - {formatPrice(preferences.max_price)})
              </Typography>
            </Box>
            <Slider
              value={[preferences.min_price, preferences.max_price]}
              onChange={(e, newValue) => {
                handleChange('min_price', newValue[0]);
                handleChange('max_price', newValue[1]);
              }}
              min={1000000}
              max={100000000}
              step={1000000}
              marks={[
                { value: 1000000, label: '$1M' },
                { value: 25000000, label: '$25M' },
                { value: 50000000, label: '$50M' },
                { value: 75000000, label: '$75M' },
                { value: 100000000, label: '$100M' }
              ]}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => formatPrice(value)}
            />
          </Grid>
          
          {/* Amenities */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Preferred Amenities
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {amenities.map((amenity) => (
                <Chip
                  key={amenity.amen_id}
                  label={amenity.name}
                  onClick={() => handleAmenityToggle(amenity.amen_id)}
                  color={preferences.amenities.includes(amenity.amen_id) ? 'primary' : 'default'}
                  variant={preferences.amenities.includes(amenity.amen_id) ? 'filled' : 'outlined'}
                />
              ))}
            </Box>
            
            <Box sx={{ display: 'flex' }}>
              <TextField
                label="Add Custom Amenity"
                value={customAmenity}
                onChange={(e) => setCustomAmenity(e.target.value)}
                fullWidth
                variant="outlined"
                size="small"
              />
              <Button
                variant="contained"
                onClick={handleAddCustomAmenity}
                disabled={!customAmenity.trim()}
                sx={{ ml: 1 }}
              >
                Add
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Importance Weights for Recommendations
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Adjust these sliders to control how much each factor matters when calculating recommendations.
          Higher values mean the factor is more important to you.
        </Typography>
        
        <Grid container spacing={4}>
          {/* Price Weight */}
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body1">Price Importance</Typography>
                <Typography variant="body2" color="primary.main" fontWeight="bold">
                  {preferences.weights.price} / 10
                </Typography>
              </Box>
              <Slider
                value={preferences.weights.price}
                onChange={(e, newValue) => handleWeightChange('price', newValue)}
                min={1}
                max={10}
                step={1}
                marks
                valueLabelDisplay="auto"
              />
              <Typography variant="body2" color="text.secondary">
                Higher weight means price range is more important in recommendations.
              </Typography>
            </Box>
          </Grid>
          
          {/* Location Weight */}
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body1">Location Importance</Typography>
                <Typography variant="body2" color="primary.main" fontWeight="bold">
                  {preferences.weights.location} / 10
                </Typography>
              </Box>
              <Slider
                value={preferences.weights.location}
                onChange={(e, newValue) => handleWeightChange('location', newValue)}
                min={1}
                max={10}
                step={1}
                marks
                valueLabelDisplay="auto"
              />
              <Typography variant="body2" color="text.secondary">
                Higher weight means parish and city location are more important in recommendations.
              </Typography>
            </Box>
          </Grid>
          
          {/* Size Weight */}
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body1">Size Importance</Typography>
                <Typography variant="body2" color="primary.main" fontWeight="bold">
                  {preferences.weights.size} / 10
                </Typography>
              </Box>
              <Slider
                value={preferences.weights.size}
                onChange={(e, newValue) => handleWeightChange('size', newValue)}
                min={1}
                max={10}
                step={1}
                marks
                valueLabelDisplay="auto"
              />
              <Typography variant="body2" color="text.secondary">
                Higher weight means number of bedrooms and bathrooms are more important in recommendations.
              </Typography>
            </Box>
          </Grid>
          
          {/* Amenities Weight */}
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body1">Amenities Importance</Typography>
                <Typography variant="body2" color="primary.main" fontWeight="bold">
                  {preferences.weights.amenities} / 10
                </Typography>
              </Box>
              <Slider
                value={preferences.weights.amenities}
                onChange={(e, newValue) => handleWeightChange('amenities', newValue)}
                min={1}
                max={10}
                step={1}
                marks
                valueLabelDisplay="auto"
              />
              <Typography variant="body2" color="text.secondary">
                Higher weight means preferred amenities are more important in recommendations.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button 
          variant="outlined"
          onClick={handleReset}
          disabled={loading.save}
        >
          Reset to Defaults
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={loading.save}
          startIcon={loading.save ? <CircularProgress size={20} /> : <SaveIcon />}
        >
          {loading.save ? 'Saving...' : 'Save Preferences'}
        </Button>
      </Box>
    </Box>
  );
};

export default UserPreferences;