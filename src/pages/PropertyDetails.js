// src/pages/PropertyDetails.js (Updated for Consistent ID Handling)
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Grid,
  Typography,
  Paper,
  Chip,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Alert,
  CircularProgress
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HomeIcon from '@mui/icons-material/Home';
import BedIcon from '@mui/icons-material/Bed';
import BathtubIcon from '@mui/icons-material/Bathtub';
import SquareFootIcon from '@mui/icons-material/SquareFoot';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import EditIcon from '@mui/icons-material/Edit';
import { useAuth } from '../hooks/useAuth';

// Import your EXISTING API function
import { getPropertyById } from '../api/properties';

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [property, setProperty] = useState(null);
  const [error, setError] = useState(null);

  // Fetch property details
  useEffect(() => {
    const fetchPropertyDetails = async () => {
      setLoading(true);
      try {
        console.log("Fetching property with ID:", id);
        
        // Use your existing API function
        const propertyData = await getPropertyById(id);
        console.log("Property data:", propertyData);
        
        // Add the guaranteed ID field to the property data
        // This ensures consistent ID handling across the application
        const enhancedProperty = {
          ...propertyData,
          guaranteed_id: id // Use the ID from the URL as the guaranteed ID
        };
        
        setProperty(enhancedProperty);
        setError(null);
      } catch (err) {
        console.error("Error fetching property:", err);
        setError("Failed to load property details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPropertyDetails();
    }
  }, [id]);

  // Navigate to edit property page
  const handleEdit = () => {
    // Use the guaranteed ID for consistent navigation
    const propertyId = property.guaranteed_id || id;
    navigate(`/properties/${propertyId}/edit`);
  };

  // Function to check if user has permission to edit
  const canEditProperty = () => {
    if (!isAuthenticated || !user || !property) return false;
    
    // Check if user is property owner or agent
    const isOwnerOrAgent = ['property_owner', 'agent', 'admin'].includes(user.user_type);
    
    // Check if user owns this property (handle different ID field names)
    const ownerIdField = property.owner_id || property.ownerId || property.user_id;
    const isPropertyOwner = String(ownerIdField) === String(user.user_id);
    
    // Check if user is the agent for this property (handle different ID field names)
    const agentIdField = property.agent_id || property.agentId;
    const isPropertyAgent = String(agentIdField) === String(user.user_id);
    
    return isOwnerOrAgent && (isPropertyOwner || isPropertyAgent || user.user_type === 'admin');
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button 
          variant="contained" 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate(-1)}
        >
          Go Back
        </Button>
      </Container>
    );
  }

  if (!property) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="info" sx={{ mb: 3 }}>
          Property not found
        </Alert>
        <Button 
          variant="contained" 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate(-1)}
        >
          Go Back
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Back button and actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
        >
          Back
        </Button>
        
        {canEditProperty() && (
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={handleEdit}
          >
            Edit Property
          </Button>
        )}
      </Box>
      
      <Grid container spacing={4}>
        {/* Property main content */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            {/* Property image */}
            {property.images && property.images.length > 0 ? (
              <Box 
                sx={{ 
                  height: 300,
                  mb: 3,
                  borderRadius: 1,
                  overflow: 'hidden'
                }}
              >
                <img 
                  src={property.images[0].image_url} 
                  alt={property.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              </Box>
            ) : (
              <Box 
                sx={{ 
                  height: 300, 
                  backgroundColor: 'grey.200', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  mb: 3,
                  borderRadius: 1 
                }}
              >
                <HomeIcon sx={{ fontSize: 60, color: 'grey.400' }} />
              </Box>
            )}
            
            {/* Property badges */}
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              {property.is_for_sale && (
                <Chip label="For Sale" color="primary" size="small" />
              )}
              {property.is_for_rent && (
                <Chip label="For Rent" color="secondary" size="small" />
              )}
              {property.property_type && (
                <Chip 
                  label={property.property_type.name || 'Property'} 
                  variant="outlined" 
                  size="small" 
                />
              )}
              <Chip 
                label={property.status || 'Active'} 
                color={(property.status || 'Active') === 'Active' ? 'success' : 'default'} 
                size="small" 
              />
            </Box>
            
            {/* Property title and location */}
            <Typography variant="h4" component="h1" gutterBottom>
              {property.title}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LocationOnIcon color="action" sx={{ mr: 1 }} />
              <Typography variant="body1">
                {property.address || (property.city ? `${property.city}${property.parish?.name ? `, ${property.parish.name}` : ''}` : 'Location not specified')}
              </Typography>
            </Box>
            
            {/* Property price */}
            <Typography variant="h5" color="primary" gutterBottom>
              ${property.price?.toLocaleString() || 'Price not specified'}
              {property.is_for_rent && property.monthly_rent && (
                <Typography variant="body1" color="text.secondary" component="span" sx={{ ml: 1 }}>
                  {property.is_for_sale ? ' or ' : ''}${property.monthly_rent.toLocaleString()}/month
                </Typography>
              )}
            </Typography>
            
            {/* Property features */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, my: 3 }}>
              {property.bedrooms && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <BedIcon color="action" sx={{ mr: 1 }} />
                  <Typography>
                    {property.bedrooms} {property.bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}
                  </Typography>
                </Box>
              )}
              
              {property.bathrooms && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <BathtubIcon color="action" sx={{ mr: 1 }} />
                  <Typography>
                    {property.bathrooms} {property.bathrooms === 1 ? 'Bathroom' : 'Bathrooms'}
                  </Typography>
                </Box>
              )}
              
              {property.area_sqft && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <SquareFootIcon color="action" sx={{ mr: 1 }} />
                  <Typography>
                    {property.area_sqft.toLocaleString()} sq.ft.
                  </Typography>
                </Box>
              )}
            </Box>
            
            <Divider sx={{ my: 3 }} />
            
            {/* Property description */}
            <Typography variant="h6" gutterBottom>
              Description
            </Typography>
            <Typography variant="body1" paragraph>
              {property.description || 'No description available'}
            </Typography>
            
            <Divider sx={{ my: 3 }} />
            
            {/* Property amenities */}
            <Typography variant="h6" gutterBottom>
              Amenities
            </Typography>
            
            {property.amenities && property.amenities.length > 0 ? (
              <Grid container spacing={2}>
                {property.amenities.map((amenity, index) => (
                  <Grid item xs={12} sm={6} key={amenity.amen_id || amenity.id || index}>
                    <Typography variant="body1">
                      • {amenity.name}
                    </Typography>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No amenities listed
              </Typography>
            )}
          </Paper>
        </Grid>
        
        {/* Sidebar information */}
        <Grid item xs={12} md={4}>
          {/* Contact information */}
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Contact Information
            </Typography>
            
            <List>
              {property.owner && property.owner.profile && property.owner.profile.full_name && (
                <ListItem disablePadding sx={{ mb: 2 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                      {property.owner.profile.full_name.charAt(0)}
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText 
                    primary={property.owner.profile.full_name}
                    secondary="Property Owner"
                  />
                </ListItem>
              )}
              
              {property.contact_email && (
                <ListItem disablePadding sx={{ mb: 2 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <EmailIcon color="action" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={property.contact_email}
                    secondary="Email"
                  />
                </ListItem>
              )}
              
              {property.contact_phone && (
                <ListItem disablePadding sx={{ mb: 2 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <PhoneIcon color="action" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={property.contact_phone}
                    secondary="Phone"
                  />
                </ListItem>
              )}
            </List>
            
            {property.contact_email && (
              <Button
                variant="contained"
                fullWidth
                sx={{ mt: 2 }}
                href={`mailto:${property.contact_email}?subject=Inquiry about ${property.title}`}
              >
                Contact Agent
              </Button>
            )}
          </Paper>
          
          {/* Property status */}
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Property Status
            </Typography>
            
            <Box sx={{ mt: 2 }}>
              <Chip 
                label={property.status || 'Active'} 
                color={(property.status || 'Active') === 'Active' ? 'success' : 'default'}
                sx={{ mb: 2 }}
              />
              
              {property.created_at && (
                <Typography variant="body2" color="text.secondary">
                  Listed on: {new Date(property.created_at).toLocaleDateString()}
                </Typography>
              )}
              
              {property.updated_at && (
                <Typography variant="body2" color="text.secondary">
                  Last updated: {new Date(property.updated_at).toLocaleDateString()}
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default PropertyDetails;