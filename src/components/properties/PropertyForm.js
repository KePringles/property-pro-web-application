import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Grid, TextField, FormControl, InputLabel, Select, MenuItem,
  FormControlLabel, Switch, Divider, InputAdornment, Button, Alert, CircularProgress,
  Paper, IconButton, Card, CardMedia, Stack
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import { getPropertyTypes, getParishes, getAmenities } from '../../api/properties';
import { addPropertyToClient } from '../../api/clients';

/**
 * Format a number as currency with commas
 */
const formatCurrency = (value) => {
  if (!value) return '';
  return Number(value.replace(/,/g, '')).toLocaleString('en-JM');
};

/**
 * Remove commas from currency strings
 */
const unformatCurrency = (value) => {
  if (!value) return '';
  return value.replace(/,/g, '');
};

/**
 * Property form component for adding or editing properties
 */
const PropertyForm = ({ 
  initialData = null, 
  onSubmit, 
  onCancel, 
  isLoading = false, 
  error = null, 
  isEditing = false 
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [clientId, setClientId] = useState(null);
  const [linkingError, setLinkingError] = useState(null);
  
  const [formValues, setFormValues] = useState({
    title: '', 
    description: '', 
    price: '', 
    property_type_id: '',
    bedrooms: '', 
    bathrooms: '', 
    area_sqft: '', 
    address: '', 
    city: '',
    parish_id: '', 
    is_for_sale: true, 
    is_for_rent: false, 
    monthly_rent: '',
    contact_phone: '', 
    contact_email: '', 
    amenities: [], 
    images: []
  });
  
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [parishes, setParishes] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [customAmenity, setCustomAmenity] = useState('');
  const [currency, setCurrency] = useState('JMD');
  const [exchangeRate, setExchangeRate] = useState(155);
  const [loadingReferenceData, setLoadingReferenceData] = useState(true);
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});
  const [formTouched, setFormTouched] = useState(false);

  /**
   * Check for client_id in URL parameters
   */
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const clientIdParam = queryParams.get('client_id');
    
    if (clientIdParam) {
      console.log('Property will be linked to client:', clientIdParam);
      setClientId(clientIdParam);
    }
  }, [location]);

  /**
   * Fetch reference data (property types, parishes, amenities)
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [types, parishesRes, amenitiesRes] = await Promise.all([
          getPropertyTypes(), 
          getParishes(), 
          getAmenities()
        ]);
        setPropertyTypes(types.property_types || []);
        setParishes(parishesRes.parishes || []);
        setAmenities(amenitiesRes.amenities || []);
      } catch (err) {
        console.error('Reference data error:', err);
      } finally {
        setLoadingReferenceData(false);
      }
    };
    fetchData();
  }, []);

  /**
   * Initialize form with initialData if editing
   */
  useEffect(() => {
    if (initialData) {
      console.log("Loading initial data:", initialData);
      
      const formattedData = {
        ...initialData,
        title: initialData.title || '',
        description: initialData.description || '',
        price: initialData.price ? formatCurrency(initialData.price.toString()) : '',
        monthly_rent: initialData.monthly_rent ? formatCurrency(initialData.monthly_rent.toString()) : '',
        amenities: initialData.amenities?.map(a => a.amen_id) || [],
        images: initialData.images || []
      };
      
      console.log("Formatted initial data:", formattedData);
      setFormValues(formattedData);

      // Set image previews if there are existing images
      if (initialData.images && initialData.images.length > 0) {
        const imageUrls = initialData.images.map(img => 
          typeof img === 'string' ? img : URL.createObjectURL(img)
        );
        setImagePreviewUrls(imageUrls);
      }
    }
  }, [initialData]);

  /**
   * Handle text input changes
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Mark form as touched
    if (!formTouched) setFormTouched(true);
    
    // Clear validation error for this field when user types
    setValidationErrors(prev => ({ ...prev, [name]: '' }));
    
    if (name === 'price' || name === 'monthly_rent') {
      const rawValue = value.replace(/[^\d]/g, '');
      setFormValues(prev => ({ ...prev, [name]: formatCurrency(rawValue) }));
    } else {
      setFormValues(prev => ({ ...prev, [name]: value }));
    }
  };

  /**
   * Handle switch changes (boolean values)
   */
  const handleSwitchChange = (e) => {
    const { name, checked } = e.target;
    
    // Mark form as touched
    if (!formTouched) setFormTouched(true);
    
    setFormValues(prev => ({ ...prev, [name]: checked }));
  };

  /**
   * Handle image upload
   */
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;
    
    // Mark form as touched
    if (!formTouched) setFormTouched(true);
    
    // Create object URLs for preview
    const newImageUrls = files.map(file => URL.createObjectURL(file));
    
    setImagePreviewUrls(prev => [...prev, ...newImageUrls]);
    setFormValues(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  /**
   * Remove an image
   */
  const removeImage = (index) => {
    // Mark form as touched
    if (!formTouched) setFormTouched(true);
    
    // Revoke object URL to avoid memory leaks
    if (imagePreviewUrls[index] && imagePreviewUrls[index].startsWith('blob:')) {
      URL.revokeObjectURL(imagePreviewUrls[index]);
    }
    
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
    setFormValues(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  /**
   * Toggle an amenity selection
   */
  const handleAmenityToggle = (amenityId) => {
    // Mark form as touched
    if (!formTouched) setFormTouched(true);
    
    setFormValues(prev => {
      const current = [...prev.amenities];
      const idx = current.indexOf(amenityId);
      if (idx === -1) current.push(amenityId);
      else current.splice(idx, 1);
      return { ...prev, amenities: current };
    });
  };

  /**
   * Validate the form
   */
  const validateForm = () => {
    const errors = {};
    
    // Required fields
    if (!formValues.title || formValues.title.trim() === '') {
      errors.title = 'Title is required';
    }
    
    if (!formValues.description || formValues.description.trim() === '') {
      errors.description = 'Description is required';
    }
    
    if (!formValues.price || formValues.price.trim() === '') {
      errors.price = 'Price is required';
    }
    
    if (!formValues.property_type_id) {
      errors.property_type_id = 'Property type is required';
    }
    
    if (!formValues.parish_id) {
      errors.parish_id = 'Parish is required';
    }
    
    // If for rent, require monthly rent
    if (formValues.is_for_rent && (!formValues.monthly_rent || formValues.monthly_rent.trim() === '')) {
      errors.monthly_rent = 'Monthly rent is required for rental properties';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = () => {
    // Validate form before submission
    if (!validateForm()) {
      return;
    }
    
    // Prepare data for submission
    let finalPrice = formValues.price;
    if (currency === 'USD') {
      finalPrice = (parseFloat(unformatCurrency(formValues.price)) * exchangeRate).toFixed(0);
    } else {
      finalPrice = unformatCurrency(formValues.price);
    }

    let finalAmenities = [...formValues.amenities];
    if (customAmenity.trim()) {
      finalAmenities.push(customAmenity.trim());
    }

    // Double-check title field is valid
    if (!formValues.title || formValues.title.trim() === '') {
      setValidationErrors(prev => ({...prev, title: 'Title is required'}));
      return;
    }

    const cleanedData = {
      ...formValues,
      title: formValues.title.trim(), // Ensure title is trimmed
      description: formValues.description.trim(),
      amenities: finalAmenities,
      price: finalPrice,
      monthly_rent: formValues.is_for_rent ? unformatCurrency(formValues.monthly_rent) : ''
    };
    
    // Log data for debugging
    console.log("Form data before submission:", cleanedData);
    console.log("Title value:", cleanedData.title);
    console.log("Title length:", cleanedData.title.length);
    
    // Submit form and handle client linking
    onSubmit(cleanedData, async (propertyId) => {
      // If we have a clientId, link the property to the client
      if (clientId && propertyId) {
        try {
          console.log(`Linking property ${propertyId} to client ${clientId}`);
          
          // Using the fixed addPropertyToClient function
          await addPropertyToClient(clientId, propertyId);
          
          // Redirect to client page with success parameter
          navigate(`/clients/${clientId}?property_added=true`);
        } catch (err) {
          console.error('Error linking property to client:', err);
          setLinkingError(`Failed to link property to client: ${err.message || ''}`);
          
          // Still navigate to property page but with error flag
          setTimeout(() => {
            navigate(`/properties/${propertyId}?linking_failed=true`);
          }, 3000);
        }
      } else if (propertyId) {
        // No client to link to, just navigate to the property
        navigate(`/properties/${propertyId}`);
      }
    });
  };

  // Show loading spinner while fetching reference data
  if (loadingReferenceData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        {isEditing ? 'Edit Property' : 'Add Property'}
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {linkingError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {linkingError}
        </Alert>
      )}
      
      {clientId && (
        <Alert severity="info" sx={{ mb: 2 }}>
          This property will be linked to client ID: {clientId}
        </Alert>
      )}
      
      <Divider sx={{ mb: 3 }} />

      <Grid container spacing={3}>
        {/* Title */}
        <Grid item xs={12}>
          <TextField 
            fullWidth 
            label="Title" 
            name="title" 
            value={formValues.title} 
            onChange={handleChange} 
            error={!!validationErrors.title}
            helperText={validationErrors.title || "Enter a descriptive title for your property"}
            required
            InputProps={{
              inputProps: { maxLength: 100 }
            }}
          />
        </Grid>
        
        {/* Description */}
        <Grid item xs={12}>
          <TextField 
            fullWidth 
            label="Description" 
            name="description" 
            multiline 
            rows={4} 
            value={formValues.description} 
            onChange={handleChange} 
            error={!!validationErrors.description}
            helperText={validationErrors.description || "Describe your property's features and highlights"}
            required
            InputProps={{
              inputProps: { maxLength: 2000 }
            }}
          />
        </Grid>

        {/* Currency Selection */}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Currency</InputLabel>
            <Select 
              value={currency} 
              onChange={(e) => setCurrency(e.target.value)}
            >
              <MenuItem value="JMD">Jamaican Dollar (J$)</MenuItem>
              <MenuItem value="USD">US Dollar (US$)</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Price */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label={currency === 'USD' ? 'Price (USD)' : 'Price (JMD)'}
            name="price"
            value={formValues.price}
            onChange={handleChange}
            InputProps={{ 
              startAdornment: <InputAdornment position="start">
                {currency === 'USD' ? 'US$' : 'J$'}
              </InputAdornment> 
            }}
            error={!!validationErrors.price}
            helperText={validationErrors.price}
            required
          />
          {currency === 'USD' && formValues.price && (
            <Typography variant="body2" color="textSecondary">
              ≈ {formatCurrency((parseFloat(unformatCurrency(formValues.price)) * exchangeRate).toFixed(0))} JMD
            </Typography>
          )}
        </Grid>

        {/* Property Type */}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth error={!!validationErrors.property_type_id} required>
            <InputLabel>Type</InputLabel>
            <Select 
              name="property_type_id" 
              value={formValues.property_type_id} 
              onChange={handleChange}
            >
              {propertyTypes.map(type => (
                <MenuItem key={type.type_id} value={type.type_id}>
                  {type.name}
                </MenuItem>
              ))}
            </Select>
            {validationErrors.property_type_id && (
              <Typography color="error" variant="caption">
                {validationErrors.property_type_id}
              </Typography>
            )}
          </FormControl>
        </Grid>

        {/* Sale/Rent Switches */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <FormControlLabel 
              control={
                <Switch 
                  checked={formValues.is_for_sale} 
                  onChange={handleSwitchChange} 
                  name="is_for_sale" 
                />
              } 
              label="For Sale" 
            />
            <FormControlLabel 
              control={
                <Switch 
                  checked={formValues.is_for_rent} 
                  onChange={handleSwitchChange} 
                  name="is_for_rent" 
                />
              } 
              label="For Rent" 
            />
          </Box>
        </Grid>

        {/* Monthly Rent (only if for rent) */}
        {formValues.is_for_rent && (
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Monthly Rent"
              name="monthly_rent"
              value={formValues.monthly_rent}
              onChange={handleChange}
              InputProps={{ 
                startAdornment: <InputAdornment position="start">J$</InputAdornment> 
              }}
              error={!!validationErrors.monthly_rent}
              helperText={validationErrors.monthly_rent}
              required={formValues.is_for_rent}
            />
          </Grid>
        )}

        {/* Property Details */}
        <Grid item xs={6} md={3}>
          <TextField 
            fullWidth 
            label="Bedrooms" 
            name="bedrooms" 
            value={formValues.bedrooms} 
            onChange={handleChange}
            type="number"
            InputProps={{ inputProps: { min: 0 } }}
          />
        </Grid>
        
        <Grid item xs={6} md={3}>
          <TextField 
            fullWidth 
            label="Bathrooms" 
            name="bathrooms" 
            value={formValues.bathrooms} 
            onChange={handleChange}
            type="number" 
            InputProps={{ inputProps: { min: 0, step: 0.5 } }}
          />
        </Grid>
        
        <Grid item xs={6} md={3}>
          <TextField 
            fullWidth 
            label="Area (sqft)" 
            name="area_sqft" 
            value={formValues.area_sqft} 
            onChange={handleChange}
            type="number"
            InputProps={{ inputProps: { min: 0 } }}
          />
        </Grid>

        {/* Location */}
        <Grid item xs={12} md={6}>
          <TextField 
            fullWidth 
            label="Address" 
            name="address" 
            value={formValues.address} 
            onChange={handleChange} 
          />
        </Grid>
        
        <Grid item xs={6} md={3}>
          <TextField 
            fullWidth 
            label="City" 
            name="city" 
            value={formValues.city} 
            onChange={handleChange} 
          />
        </Grid>

        <Grid item xs={6} md={3}>
          <FormControl fullWidth error={!!validationErrors.parish_id} required>
            <InputLabel>Parish</InputLabel>
            <Select 
              name="parish_id" 
              value={formValues.parish_id} 
              onChange={handleChange}
            >
              {parishes.map(p => (
                <MenuItem key={p.parish_id} value={p.parish_id}>
                  {p.name}
                </MenuItem>
              ))}
            </Select>
            {validationErrors.parish_id && (
              <Typography color="error" variant="caption">
                {validationErrors.parish_id}
              </Typography>
            )}
          </FormControl>
        </Grid>

        {/* Contact Information */}
        <Grid item xs={12} md={6}>
          <TextField 
            fullWidth 
            label="Contact Phone" 
            name="contact_phone" 
            value={formValues.contact_phone} 
            onChange={handleChange} 
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField 
            fullWidth 
            label="Contact Email" 
            name="contact_email" 
            value={formValues.contact_email} 
            onChange={handleChange}
            type="email"
          />
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
        </Grid>

        {/* Property Images Section */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>Property Images</Typography>
          <Box sx={{ mb: 2 }}>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="raised-button-file"
              multiple
              type="file"
              onChange={handleImageUpload}
            />
            <label htmlFor="raised-button-file">
              <Button
                variant="outlined"
                component="span"
                startIcon={<AddPhotoAlternateIcon />}
              >
                Add Images
              </Button>
            </label>
          </Box>
          
          {/* Image Previews Grid */}
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {imagePreviewUrls.map((url, index) => (
              <Grid item xs={6} sm={4} md={3} lg={2} key={index}>
                <Card sx={{ position: 'relative' }}>
                  <CardMedia
                    component="img"
                    height="140"
                    image={url}
                    alt={`Property image ${index + 1}`}
                  />
                  <IconButton
                    sx={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      bgcolor: 'rgba(255,255,255,0.7)',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.8)' }
                    }}
                    size="small"
                    onClick={() => removeImage(index)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
        </Grid>

        {/* Amenities Section */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>Amenities</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {amenities.map(a => (
              <Button
                key={a.amen_id}
                variant={formValues.amenities.includes(a.amen_id) ? 'contained' : 'outlined'}
                onClick={() => handleAmenityToggle(a.amen_id)}
                size="small"
                sx={{ mb: 1 }}
              >
                {a.name}
              </Button>
            ))}
          </Box>
        </Grid>

        {/* Custom Amenity */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Add Custom Amenity"
            value={customAmenity}
            onChange={(e) => setCustomAmenity(e.target.value)}
            placeholder="E.g., Solar Panels, Smart Home System"
            helperText="Add a custom amenity not in the list above"
          />
        </Grid>

        {/* Form Actions */}
        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button 
            variant="outlined" 
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSubmit} 
            disabled={isLoading}
            sx={{ minWidth: '120px' }}
          >
            {isLoading ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Saving...
              </>
            ) : isEditing ? 'Save Changes' : 'Submit'}
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default PropertyForm;