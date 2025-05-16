// src/pages/agent/MyProperties.js (Enhanced with Robust ID Handling)
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Button,
  Card,
  CircularProgress,
  Alert,
  Divider,
  TextField,
  MenuItem,
  Avatar,
  Chip
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import HomeIcon from '@mui/icons-material/Home';
import { useAuth } from '../../hooks/useAuth';
import { getProperties } from '../../api/properties';

const MyProperties = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('newest');
  const [debugInfo, setDebugInfo] = useState(null);

  // Debug logs to help troubleshoot
  useEffect(() => {
    console.log('MyProperties component mounted');
    console.log('Current location:', location.pathname);
    console.log('Current user:', user);
  }, [user, location]);

  // Fetch properties
  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      setError(null);
      setDebugInfo(null);
      
      console.log('Fetching properties with user ID:', user?.user_id);
      
      try {
        // Make sure we have a user ID
        if (!user?.user_id) {
          console.error('No user ID available');
          setError('User information not loaded. Please try logging in again.');
          setLoading(false);
          return;
        }

        // Get property data - providing both agent_id and user_id to handle different API implementations
        const response = await getProperties({ 
          agent_id: user.user_id,
          user_id: user.user_id 
        });
        
        console.log('Properties API response:', response);
        
        // Handle the response data based on its structure
        let propertiesData = [];
        
        if (response && response.properties) {
          propertiesData = response.properties;
        } else if (response && Array.isArray(response)) {
          propertiesData = response;
        } else if (response && response.data && Array.isArray(response.data)) {
          propertiesData = response.data;
        } else {
          console.warn('Unexpected properties data structure:', response);
          // Set a more specific error
          setError('Unexpected API response format. Please contact support with the following details: ' + JSON.stringify(response).substring(0, 100) + '...');
        }
        
        // Print the full first property to console for debugging
        if (propertiesData.length > 0) {
          console.log('First property full object:', JSON.stringify(propertiesData[0], null, 2));
          
          // Create debug info for viewing in the UI
          const firstProperty = propertiesData[0];
          const idFields = {
            id: firstProperty.id,
            property_id: firstProperty.property_id,
            _id: firstProperty._id, 
            propertyId: firstProperty.propertyId,
            uuid: firstProperty.uuid,
            guaranteed_id: firstProperty.guaranteed_id,
            allKeys: Object.keys(firstProperty).join(', ')
          };
          
          setDebugInfo(idFields);
          console.log('Debug ID fields:', idFields);
        } else {
          console.log('No properties returned from API');
        }
        
        // Ensure each property has a guaranteed ID if not already added
        const enhancedProperties = propertiesData.map(property => {
          if (property.guaranteed_id) {
            return property; // Already enhanced
          }
          
          // Create a guaranteed ID
          const guaranteedId = 
            property.id || 
            property.property_id || 
            property._id || 
            property.propertyId || 
            property.uuid || 
            `temp-${Math.random().toString().substring(2)}`;
          
          return {
            ...property,
            guaranteed_id: guaranteedId
          };
        });
        
        // Set properties with guaranteed IDs
        setProperties(enhancedProperties);
        setFilteredProperties(enhancedProperties);
      } catch (err) {
        console.error('Error fetching properties:', err);
        setError('Failed to load properties: ' + (err.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    if (user?.user_id) {
      fetchProperties();
    }
  }, [user?.user_id]);

  // Handle search and filter
  useEffect(() => {
    if (properties.length > 0) {
      let filtered = [...properties];
      
      // Apply search filter
      if (searchTerm) {
        filtered = filtered.filter(property => 
          (property.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (property.city || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (property.parish?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      // Apply sorting
      switch (sortOption) {
        case 'newest':
          filtered.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
          break;
        case 'oldest':
          filtered.sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
          break;
        case 'price_high':
          filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
          break;
        case 'price_low':
          filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
          break;
        default:
          break;
      }
      
      setFilteredProperties(filtered);
    }
  }, [properties, searchTerm, sortOption]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSortChange = (event) => {
    setSortOption(event.target.value);
  };
  
  // Direct navigation handler - use guaranteed_id for reliable navigation
  const handleViewProperty = (property) => {
    // Log the property object for debugging
    console.log('Viewing property object:', property);
    
    // Always use guaranteed_id first, then fall back to other ID fields
    const propertyId = property.guaranteed_id || 
                      property.id || 
                      property.property_id || 
                      property._id || 
                      property.propertyId || 
                      property.uuid;
    
    console.log('Selected ID for navigation:', propertyId);
    
    if (propertyId) {
      // Navigate using the first valid ID found
      navigate(`/properties/${propertyId}`);
    } else {
      // Show an error with the actual property data for debugging
      console.error('No ID found in property:', property);
      alert(`Error: Could not find property ID. Available fields: ${Object.keys(property).join(', ')}`);
    }
  };
  
  const handleEditProperty = (property) => {
    // Log the property object for debugging
    console.log('Editing property object:', property);
    
    // Always use guaranteed_id first, then fall back to other ID fields
    const propertyId = property.guaranteed_id || 
                      property.id || 
                      property.property_id || 
                      property._id || 
                      property.propertyId || 
                      property.uuid;
    
    console.log('Selected ID for navigation:', propertyId);
    
    if (propertyId) {
      // Navigate using the first valid ID found
      navigate(`/properties/${propertyId}/edit`);
    } else {
      // Show an error with the actual property data for debugging
      console.error('No ID found in property:', property);
      alert(`Error: Could not find property ID. Available fields: ${Object.keys(property).join(', ')}`);
    }
  };

  return (
    <Box sx={{ backgroundColor: '#f5f7fa', minHeight: '100vh', pt: 2, pb: 6 }}>
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1">
            My Properties
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/add-property')}
          >
            Add Property
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>}
        
        {/* Debug information box */}
        {debugInfo && (
          <Alert severity="info" sx={{ mb: 4 }}>
            <Typography variant="subtitle2">Debug Info - Property Fields:</Typography>
            <Box component="pre" sx={{ mt: 1, p: 1, bgcolor: 'background.paper', borderRadius: 1, fontSize: '0.75rem', overflowX: 'auto' }}>
              {Object.entries(debugInfo).map(([key, value]) => (
                <Box key={key}>{key}: {JSON.stringify(value)}</Box>
              ))}
            </Box>
          </Alert>
        )}

        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Search properties"
                variant="outlined"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search by title, city, or parish"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Sort by"
                value={sortOption}
                onChange={handleSortChange}
                variant="outlined"
              >
                <MenuItem value="newest">Newest first</MenuItem>
                <MenuItem value="oldest">Oldest first</MenuItem>
                <MenuItem value="price_high">Price: High to Low</MenuItem>
                <MenuItem value="price_low">Price: Low to High</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </Paper>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : filteredProperties.length > 0 ? (
          <Grid container spacing={3}>
            {filteredProperties.map((property, index) => {
              // Add debug console.log for each property's ID fields
              if (index < 3) { // Only log first 3 to avoid flooding console
                console.log(`Property ${index} ID fields:`, {
                  id: property.id,
                  property_id: property.property_id,
                  _id: property._id,
                  propertyId: property.propertyId,
                  uuid: property.uuid,
                  guaranteed_id: property.guaranteed_id
                });
              }
              
              // Always use guaranteed_id first, then fall back to other ID fields
              const propertyId = property.guaranteed_id || 
                                property.id || 
                                property.property_id || 
                                property._id || 
                                property.propertyId || 
                                property.uuid;
              
              return (
                <Grid item xs={12} sm={6} md={4} key={propertyId || `property-${index}`}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ position: 'relative', height: 200, bgcolor: 'grey.200' }}>
                      {property.main_image_url || property.image_url ? (
                        <Box
                          component="img"
                          src={property.main_image_url || property.image_url}
                          alt={property.title || 'Property'}
                          sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      ) : (
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                          }}
                        >
                          <HomeIcon sx={{ fontSize: 80, color: 'text.secondary' }} />
                        </Box>
                      )}
                      <Chip
                        label={property.status || 'Active'}
                        color="primary"
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 10,
                          right: 10,
                        }}
                      />
                    </Box>
                    
                    <Box sx={{ p: 2, flexGrow: 1 }}>
                      <Typography variant="h6" gutterBottom>
                        {property.title || 'Untitled Property'}
                      </Typography>
                      
                      <Typography variant="body1" color="text.primary" gutterBottom fontWeight="bold">
                        ${property.price ? property.price.toLocaleString() : 'Price not specified'}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {property.city || ''} {property.parish?.name ? `, ${property.parish.name}` : ''}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {property.bedrooms && (
                          <Chip size="small" label={`${property.bedrooms} ${property.bedrooms === 1 ? 'Bed' : 'Beds'}`} />
                        )}
                        {property.bathrooms && (
                          <Chip size="small" label={`${property.bathrooms} ${property.bathrooms === 1 ? 'Bath' : 'Baths'}`} />
                        )}
                        {property.square_feet && (
                          <Chip size="small" label={`${property.square_feet} sqft`} />
                        )}
                      </Box>
                      
                      {/* Show available ID for debugging */}
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                        ID: {propertyId || 'Not found'}
                      </Typography>
                    </Box>
                    
                    <Divider />
                    
                    <Box sx={{ display: 'flex', p: 1.5, justifyContent: 'space-between' }}>
                      <Button 
                        size="small"
                        variant="outlined"
                        onClick={() => handleViewProperty(property)}
                        disabled={!propertyId}
                      >
                        View
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => handleEditProperty(property)}
                        disabled={!propertyId}
                      >
                        Edit
                      </Button>
                    </Box>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        ) : (
          <Paper elevation={2} sx={{ p: 6, textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom>
              No properties found
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {searchTerm
                ? "No properties match your search criteria. Try adjusting your search."
                : "You haven't added any properties yet or there was an error loading your properties."}
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/add-property')}
              sx={{ mt: 2 }}
            >
              Add Property
            </Button>
          </Paper>
        )}
      </Container>
    </Box>
  );
};

export default MyProperties;