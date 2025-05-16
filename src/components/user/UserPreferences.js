// src/components/user/UserPreferences.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Button,
  Divider,
  InputAdornment,
  Slider,
  Chip,
  CircularProgress
} from '@mui/material';
import { getPropertyTypes, getParishes, getAmenities } from '../../api/properties';

const UserPreferences = ({ preferences, onSavePreferences }) => {
  // State
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [parishes, setParishes] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formValues, setFormValues] = useState({
    min_price: '',
    max_price: '',
    min_bedrooms: '',
    min_bathrooms: '',
    min_area_sqft: '',
    preferred_parish_id: '',
    preferred_city: '',
    property_type_id: '',
    is_for_sale: false,
    is_for_rent: false,
    preferred_amenities: []
  });
  
  // Fetch reference data
  useEffect(() => {
    const fetchReferenceData = async () => {
      setLoading(true);
      try {
        const [typesResponse, parishesResponse, amenitiesResponse] = await Promise.all([
          getPropertyTypes(),
          getParishes(),
          getAmenities()
        ]);
        
        setPropertyTypes(typesResponse.property_types || []);
        setParishes(parishesResponse.parishes || []);
        setAmenities(amenitiesResponse.amenities || []);
      } catch (error) {
        console.error('Error fetching reference data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchReferenceData();
  }, []);
  
  // Initialize form with user preferences
  useEffect(() => {
    if (preferences) {
      const values = {
        min_price: preferences.min_price || '',
        max_price: preferences.max_price || '',
        min_bedrooms: preferences.min_bedrooms || '',
        min_bathrooms: preferences.min_bathrooms || '',
        min_area_sqft: preferences.min_area_sqft || '',
        preferred_parish_id: preferences.preferred_parish_id || '',
        preferred_city: preferences.preferred_city || '',
        property_type_id: preferences.property_type_id || '',
        is_for_sale: preferences.is_for_sale || false,
        is_for_rent: preferences.is_for_rent || false,
        preferred_amenities: preferences.preferred_amenities?.map(a => a.amen_id) || []
      };
      
      setFormValues(values);
    }
  }, [preferences]);
  
  // Handle form change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value
    });
  };
  
  // Handle switch change
  const handleSwitchChange = (e) => {
    const { name, checked } = e.target;
    setFormValues({
      ...formValues,
      [name]: checked
    });
  };
  
  // Handle amenity toggle
  const handleAmenityToggle = (amenityId) => {
    const currentAmenities = [...formValues.preferred_amenities];
    const index = currentAmenities.indexOf(amenityId);
    
    if (index === -1) {
      // Add amenity
      currentAmenities.push(amenityId);
    } else {
      // Remove amenity
      currentAmenities.splice(index, 1);
    }
    
    setFormValues({
      ...formValues,
      preferred_amenities: currentAmenities
    });
  };
  
  // Handle save preferences
  const handleSavePreferences = () => {
    // Convert string numbers to actual numbers
    const formattedValues = {
      ...formValues,
      min_price: formValues.min_price ? Number(formValues.min_price) : null,
      max_price: formValues.max_price ? Number(formValues.max_price) : null,
      min_bedrooms: formValues.min_bedrooms ? Number(formValues.min_bedrooms) : null,
      min_bathrooms: formValues.min_bathrooms ? Number(formValues.min_bathrooms) : null,
      min_area_sqft: formValues.min_area_sqft ? Number(formValues.min_area_sqft) : null,
      preferred_parish_id: formValues.preferred_parish_id || null,
      property_type_id: formValues.property_type_id || null
    };
    
    onSavePreferences(formattedValues);
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Paper elevation={1} sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Budget Section */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Budget
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Minimum Price"
                name="min_price"
                type="number"
                value={formValues.min_price}
                onChange={handleChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Maximum Price"
                name="max_price"
                type="number"
                value={formValues.max_price}
                onChange={handleChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>
          </Grid>
        </Grid>
        
        {/* Location Section */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Location
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="parish-label">Preferred Parish</InputLabel>
                <Select
                  labelId="parish-label"
                  name="preferred_parish_id"
                  value={formValues.preferred_parish_id}
                  onChange={handleChange}
                  label="Preferred Parish"
                >
                  <MenuItem value="">No preference</MenuItem>
                  {parishes.map((parish) => (
                    <MenuItem key={parish.parish_id} value={parish.parish_id}>
                      {parish.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Preferred City/Town"
                name="preferred_city"
                value={formValues.preferred_city}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        </Grid>
        
        {/* Property Details Section */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Property Details
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="property-type-label">Property Type</InputLabel>
                <Select
                  labelId="property-type-label"
                  name="property_type_id"
                  value={formValues.property_type_id}
                  onChange={handleChange}
                  label="Property Type"
                >
                  <MenuItem value="">No preference</MenuItem>
                  {propertyTypes.map((type) => (
                    <MenuItem key={type.type_id} value={type.type_id}>
                      {type.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Minimum Size (sq.ft)"
                name="min_area_sqft"
                type="number"
                value={formValues.min_area_sqft}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="bedrooms-label">Minimum Bedrooms</InputLabel>
                <Select
                  labelId="bedrooms-label"
                  name="min_bedrooms"
                  value={formValues.min_bedrooms}
                  onChange={handleChange}
                  label="Minimum Bedrooms"
                >
                  <MenuItem value="">No preference</MenuItem>
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <MenuItem key={num} value={num}>{num}+</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="bathrooms-label">Minimum Bathrooms</InputLabel>
                <Select
                  labelId="bathrooms-label"
                  name="min_bathrooms"
                  value={formValues.min_bathrooms}
                  onChange={handleChange}
                  label="Minimum Bathrooms"
                >
                  <MenuItem value="">No preference</MenuItem>
                  {[1, 1.5, 2, 2.5, 3, 3.5, 4].map((num) => (
                    <MenuItem key={num} value={num}>{num}+</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Grid>
        
        {/* Listing Type Section */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Listing Type
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formValues.is_for_sale}
                    onChange={handleSwitchChange}
                    name="is_for_sale"
                    color="primary"
                  />
                }
                label="For Sale"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formValues.is_for_rent}
                    onChange={handleSwitchChange}
                    name="is_for_rent"
                    color="secondary"
                  />
                }
                label="For Rent"
              />
            </Grid>
          </Grid>
        </Grid>
        
        {/* Amenities Section */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Preferred Amenities
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
            {amenities.map((amenity) => (
              <Chip
                key={amenity.amen_id}
                label={amenity.name}
                onClick={() => handleAmenityToggle(amenity.amen_id)}
                color={formValues.preferred_amenities.includes(amenity.amen_id) ? 'primary' : 'default'}
                variant={formValues.preferred_amenities.includes(amenity.amen_id) ? 'filled' : 'outlined'}
              />
            ))}
          </Box>
        </Grid>
        
        {/* Save Button */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSavePreferences}
            >
              Save Preferences
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default UserPreferences;