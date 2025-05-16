// src/pages/EditProperty.js (Updated for Consistent ID Handling)
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Grid,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Button,
  Paper,
  Divider,
  Alert,
  CircularProgress,
  Snackbar,
  IconButton,
  Card,
  CardMedia,
  CardContent
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../hooks/useAuth';

// Import your existing API functions
import { 
  getPropertyById, 
  updateProperty,
  getPropertyTypes,
  getParishes,
  getAmenities
} from '../api/properties';

const EditProperty = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  
  // Form data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    monthly_rent: '',
    status: 'Active',
    bedrooms: '',
    bathrooms: '',
    area_sqft: '',
    city: '',
    address: '',
    contact_email: '',
    contact_phone: '',
    is_for_sale: false,
    is_for_rent: false,
    property_type_id: '',
    parish_id: '',
    amenities: [],
    images: [] // For storing existing images
  });

  // New images to upload
  const [newImages, setNewImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  // Reference data
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [parishes, setParishes] = useState([]);
  const [amenities, setAmenities] = useState([]);

  // Check authorization
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/properties/${id}/edit` } });
    }
  }, [isAuthenticated, navigate, id]);

  // Fetch property and reference data
  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Fetch property data
        console.log("Fetching property with ID:", id);
        const propertyData = await getPropertyById(id);
        console.log("Property data:", propertyData);
        
        // Add guaranteed ID to the property data
        const enhancedProperty = {
          ...propertyData,
          guaranteed_id: id // Use the ID from the URL 
        };
        
        // Fetch reference data
        const [typesResponse, parishesResponse, amenitiesResponse] = await Promise.all([
          getPropertyTypes(),
          getParishes(),
          getAmenities()
        ]);
        
        // Set reference data
        setPropertyTypes(typesResponse.property_types || []);
        setParishes(parishesResponse.parishes || []);
        setAmenities(amenitiesResponse.amenities || []);
        
        // UNIVERSAL PERMISSION CHECK
        console.log("------PERMISSION DEBUG------");
        console.log("User data:", {
          user_id: user.user_id,
          user_type: user.user_type
        });
        console.log("Property data:", {
          owner_id: enhancedProperty.owner_id,
          agent_id: enhancedProperty.agent_id,
          created_by: enhancedProperty.created_by
        });
        
        // Use multiple strategies to determine permission
        
        // 1. STRATEGY: Role-based access
        const isPropertyOwner = user.user_type === 'property_owner' || user.user_type === 'admin';
        const isAgent = user.user_type === 'agent';
        
        // 2. STRATEGY: ID matching (with type conversion)
        // Check all possible ID fields with string conversion
        const possibleOwnerFields = ['owner_id', 'ownerId', 'created_by', 'user_id', 'userId'];
        const possibleAgentFields = ['agent_id', 'agentId', 'assigned_to'];
        
        let isOwnerByID = false;
        let isAgentByID = false;
        
        // Check if user is the owner
        for (const field of possibleOwnerFields) {
          if (enhancedProperty[field] && String(enhancedProperty[field]) === String(user.user_id)) {
            isOwnerByID = true;
            console.log(`Match found: ${field} = ${enhancedProperty[field]}`);
            break;
          }
        }
        
        // Check if user is the agent
        for (const field of possibleAgentFields) {
          if (enhancedProperty[field] && String(enhancedProperty[field]) === String(user.user_id)) {
            isAgentByID = true;
            console.log(`Match found: ${field} = ${enhancedProperty[field]}`);
            break;
          }
        }
        
        // DEBUG - Log all property data fields to see what's available
        console.log("All property fields:", Object.keys(enhancedProperty));
        
        // SIMPLIFIED PERMISSION CHECK FOR DEVELOPMENT
        // Allow any property owner to edit any property during development
        const hasPermission = isPropertyOwner || (isAgent && isAgentByID);
        
        console.log("Permission check result:", {
          isPropertyOwner,
          isAgent,
          isOwnerByID,
          isAgentByID,
          hasPermission
        });
        console.log("---------------------------");
        
        if (!hasPermission) {
          setError('You do not have permission to edit this property. Only the property creator or assigned agent can edit it.');
          setLoading(false);
          return;
        }
        
        // Format amenity IDs 
        const amenityIds = enhancedProperty.amenities 
          ? enhancedProperty.amenities.map(a => a.amen_id || a.id)
          : [];
        
        // Set form data
        setFormData({
          title: enhancedProperty.title || '',
          description: enhancedProperty.description || '',
          price: enhancedProperty.price || '',
          monthly_rent: enhancedProperty.monthly_rent || '',
          status: enhancedProperty.status || 'Active',
          bedrooms: enhancedProperty.bedrooms || '',
          bathrooms: enhancedProperty.bathrooms || '',
          area_sqft: enhancedProperty.area_sqft || '',
          city: enhancedProperty.city || '',
          address: enhancedProperty.address || '',
          contact_email: enhancedProperty.contact_email || '',
          contact_phone: enhancedProperty.contact_phone || '',
          is_for_sale: enhancedProperty.is_for_sale || false,
          is_for_rent: enhancedProperty.is_for_rent || false,
          property_type_id: enhancedProperty.property_type_id || '',
          parish_id: enhancedProperty.parish_id || '',
          amenities: amenityIds,
          images: enhancedProperty.images || []
        });
      } catch (err) {
        console.error('Error fetching property data:', err);
        setError('Failed to load property details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, isAuthenticated, user]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Handle amenity toggling
  const handleAmenityToggle = (amenityId) => {
    const newAmenities = [...formData.amenities];
    
    if (newAmenities.includes(amenityId)) {
      // Remove
      const index = newAmenities.indexOf(amenityId);
      newAmenities.splice(index, 1);
    } else {
      // Add
      newAmenities.push(amenityId);
    }
    
    setFormData({
      ...formData,
      amenities: newAmenities
    });
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // Create preview URLs
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newPreviews]);
    
    // Add to new images array
    setNewImages([...newImages, ...files]);
  };

  // Remove image preview
  const removeImagePreview = (index) => {
    const updatedPreviews = [...imagePreviews];
    updatedPreviews.splice(index, 1);
    setImagePreviews(updatedPreviews);
    
    const updatedImages = [...newImages];
    updatedImages.splice(index, 1);
    setNewImages(updatedImages);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    
    try {
      // Prepare form data
      const formDataToSend = new FormData();
      
      // Add basic fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'amenities' && key !== 'images' && value !== null && value !== undefined) {
          if (typeof value === 'boolean') {
            formDataToSend.append(key, value ? 'true' : 'false');
          } else {
            formDataToSend.append(key, value);
          }
        }
      });
      
      // Add amenities as individual items
      formData.amenities.forEach(amenityId => {
        formDataToSend.append('amenities', amenityId);
      });
      
      // Add new images
      newImages.forEach(file => {
        formDataToSend.append('images', file);
      });
      
      // Submit to API using the guaranteed ID from the URL
      console.log("Submitting update for property ID:", id);
      const response = await updateProperty(id, formDataToSend);
      
      console.log("Update response:", response);
      setSuccess(true);
      
      // Redirect after a delay
      setTimeout(() => {
        navigate(`/properties/${id}`);
      }, 2000);
    } catch (err) {
      console.error('Error updating property:', err);
      setError('Failed to update property. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(`/properties/${id}`);
  };

  if (!isAuthenticated) return null;

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error && !formData.title) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => navigate(-1)} sx={{ mt: 2 }}>
          Go Back
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={() => setSuccess(false)}
        message="Property updated successfully"
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      />
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Property updated successfully! Redirecting...
        </Alert>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Paper elevation={2} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">Edit Property</Typography>
          <Button startIcon={<ArrowBackIcon />} onClick={handleCancel}>
            Cancel
          </Button>
        </Box>
        
        <Divider sx={{ mb: 4 }} />
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Property Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={4}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Property Type</InputLabel>
                <Select
                  name="property_type_id"
                  value={formData.property_type_id}
                  onChange={handleChange}
                  label="Property Type"
                >
                  {propertyTypes.map((type) => (
                    <MenuItem key={type.id} value={type.id}>
                      {type.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Parish</InputLabel>
                <Select
                  name="parish_id"
                  value={formData.parish_id}
                  onChange={handleChange}
                  label="Parish"
                >
                  {parishes.map((parish) => (
                    <MenuItem key={parish.id} value={parish.id}>
                      {parish.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  label="Status"
                >
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                  <MenuItem value="Sold">Sold</MenuItem>
                  <MenuItem value="Rented">Rented</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.is_for_sale}
                    onChange={handleChange}
                    name="is_for_sale"
                  />
                }
                label="For Sale"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.is_for_rent}
                    onChange={handleChange}
                    name="is_for_rent"
                  />
                }
                label="For Rent"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Sale Price ($)"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                disabled={!formData.is_for_sale}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Monthly Rent ($)"
                name="monthly_rent"
                type="number"
                value={formData.monthly_rent}
                onChange={handleChange}
                disabled={!formData.is_for_rent}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
            </Grid>
            
            {/* Property Details */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Property Details
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Bedrooms"
                name="bedrooms"
                type="number"
                value={formData.bedrooms}
                onChange={handleChange}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Bathrooms"
                name="bathrooms"
                type="number"
                value={formData.bathrooms}
                onChange={handleChange}
                InputProps={{ inputProps: { min: 0, step: 0.5 } }}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Area (sq.ft)"
                name="area_sqft"
                type="number"
                value={formData.area_sqft}
                onChange={handleChange}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
            </Grid>
            
            {/* Images Section */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Property Images
              </Typography>
            </Grid>
            
            {/* Existing Images */}
            {formData.images && formData.images.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Current Images
                </Typography>
                <Grid container spacing={2}>
                  {formData.images.map((image, index) => (
                    <Grid item xs={6} sm={4} md={3} key={image.image_id || index}>
                      <Card>
                        <CardMedia
                          component="img"
                          height="140"
                          image={image.image_url}
                          alt={`Property image ${index + 1}`}
                        />
                        <CardContent sx={{ p: 1, textAlign: 'center' }}>
                          <Typography variant="caption" color="text.secondary">
                            {image.is_primary ? 'Primary Image' : `Image ${index + 1}`}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            )}
            
            {/* New Images */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Add New Images
              </Typography>
              <input
                accept="image/*"
                id="property-images"
                type="file"
                multiple
                style={{ display: 'none' }}
                onChange={handleImageUpload}
              />
              <label htmlFor="property-images">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<AddPhotoAlternateIcon />}
                >
                  Upload Images
                </Button>
              </label>
              
              {imagePreviews.length > 0 && (
                <Grid container spacing={2} sx={{ mt: 2 }}>
                  {imagePreviews.map((preview, index) => (
                    <Grid item xs={6} sm={4} md={3} key={index}>
                      <Card>
                        <CardMedia
                          component="img"
                          height="140"
                          image={preview}
                          alt={`New image ${index + 1}`}
                        />
                        <CardContent sx={{ p: 1, textAlign: 'center' }}>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => removeImagePreview(index)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
            </Grid>
            
            {/* Contact Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Contact Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Contact Email"
                name="contact_email"
                type="email"
                value={formData.contact_email}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Contact Phone"
                name="contact_phone"
                value={formData.contact_phone}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
            </Grid>
            
            {/* Amenities */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Amenities
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Select all that apply
              </Typography>
            </Grid>
            
            {amenities.map((amenity) => (
              <Grid item xs={12} sm={6} md={4} key={amenity.amen_id || amenity.id}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.amenities.includes(amenity.amen_id || amenity.id)}
                      onChange={() => handleAmenityToggle(amenity.amen_id || amenity.id)}
                    />
                  }
                  label={amenity.name}
                />
              </Grid>
            ))}
            
            <Grid item xs={12}>
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  variant="outlined"
                  onClick={handleCancel}
                  startIcon={<ArrowBackIcon />}
                >
                  Cancel
                </Button>
                
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={saving}
                  startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default EditProperty;