// src/pages/home/OwnerHome.js
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Button,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import HomeIcon from '@mui/icons-material/Home';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { useAuth } from '../../hooks/useAuth';
import { getProperties, getPropertyStatistics } from '../../api/properties';

const OwnerHome = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [properties, setProperties] = useState([]);
  const [statistics, setStatistics] = useState({
    totalProperties: 0,
    totalViews: 0,
    totalInquiries: 0,
    activeListings: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [displayCount, setDisplayCount] = useState(3); // Default display count

  useEffect(() => {
    // Set display count based on screen size
    const handleResize = () => {
      if (window.innerWidth < 600) {
        setDisplayCount(2);
      } else if (window.innerWidth < 960) {
        setDisplayCount(3);
      } else {
        setDisplayCount(4);
      }
    };

    // Initialize on load
    handleResize();

    // Update on resize
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch properties
        const propertiesRes = await getProperties({ owner_id: user.user_id });
        
        // Normalize the response structure
        let propertiesData = [];
        if (propertiesRes?.properties && Array.isArray(propertiesRes.properties)) {
          propertiesData = propertiesRes.properties;
        } else if (propertiesRes?.data?.properties && Array.isArray(propertiesRes.data.properties)) {
          propertiesData = propertiesRes.data.properties;
        } else if (Array.isArray(propertiesRes)) {
          propertiesData = propertiesRes;
        }
        
        console.log("Fetched properties:", propertiesData);
        
        // Add debugging information to each property
        const enhancedProperties = propertiesData.map((property, index) => {
          // Check for all possible ID field names (for debugging)
          const idFields = Object.keys(property).filter(key => 
            key === 'id' || key === 'prop_id' || key === 'property_id' || key.includes('_id')
          );
          
          return {
            ...property,
            // Add a guaranteed ID for navigation purposes
            guaranteed_id: property.id || property.prop_id || property.property_id || index + 1,
            // For debugging purposes only
            _debug_id_fields: idFields
          };
        });
        
        setProperties(enhancedProperties);

        // Fetch statistics
        try {
          const statsRes = await getPropertyStatistics('month');
          setStatistics({
            totalProperties: statsRes?.total_properties || enhancedProperties.length || 0,
            totalViews: statsRes?.total_views || 0,
            totalInquiries: statsRes?.total_inquiries || 0,
            activeListings: statsRes?.active_listings || enhancedProperties.filter(p => p.status === 'Active').length || 0
          });
        } catch (statsError) {
          console.error("Error fetching statistics:", statsError);
          // Set default statistics based on properties
          setStatistics({
            totalProperties: enhancedProperties.length,
            totalViews: 0,
            totalInquiries: 0,
            activeListings: enhancedProperties.filter(p => p.status === 'Active').length
          });
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load your dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    if (user?.user_id) {
      fetchData();
    }
  }, [user?.user_id]);

  // Navigate to view property details
  const handleViewProperty = (property) => {
    // Get the most reliable ID
    const propertyId = property.guaranteed_id || property.id || property.prop_id || property.property_id;
    
    // Log for debugging
    console.log("Viewing property with data:", property);
    console.log("Using ID:", propertyId);
    console.log("Possible ID fields:", property._debug_id_fields);
    
    if (propertyId) {
      navigate(`/properties/${propertyId}`);
    } else {
      console.error("Cannot navigate - property has no valid ID:", property);
      setError("Unable to view property details. Property ID not found.");
    }
  };

  // Navigate to edit property
  const handleEditProperty = (property) => {
    // Get the most reliable ID
    const propertyId = property.guaranteed_id || property.id || property.prop_id || property.property_id;
    
    // Log for debugging
    console.log("Editing property with data:", property);
    console.log("Using ID:", propertyId);
    console.log("Possible ID fields:", property._debug_id_fields);
    
    if (propertyId) {
      navigate(`/properties/${propertyId}/edit`);
    } else {
      console.error("Cannot navigate - property has no valid ID:", property);
      setError("Unable to edit property. Property ID not found.");
    }
  };

  return (
    <Box sx={{ backgroundColor: '#f5f7fa', minHeight: '100vh', pt: 2, pb: 8 }}>
      <Container maxWidth="xl">
        <Typography variant="h4" component="h1" gutterBottom>
          Your Property Hub
        </Typography>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={6} sm={6} md={3}>
            <Card sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Total Properties
                </Typography>
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  <Typography variant="h3">
                    {statistics.totalProperties}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={6} sm={6} md={3}>
            <Card sx={{ bgcolor: 'secondary.light', color: 'secondary.contrastText' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Total Views
                </Typography>
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  <Typography variant="h3">
                    {statistics.totalViews}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={6} sm={6} md={3}>
            <Card sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Active Listings
                </Typography>
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  <Typography variant="h3">
                    {statistics.activeListings}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={6} sm={6} md={3}>
            <Card sx={{ bgcolor: 'info.light', color: 'info.contrastText' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Inquiries
                </Typography>
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  <Typography variant="h3">
                    {statistics.totalInquiries}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Grid container spacing={4} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 4, height: '100%' }}>
              <Typography variant="h5" gutterBottom>
                Property Management
              </Typography>
              <Typography variant="body1" paragraph>
                Add and manage your property listings.
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/add-property')}
                sx={{ mt: 2 }}
              >
                Add New Property
              </Button>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 4, height: '100%' }}>
              <Typography variant="h5" gutterBottom>
                Performance Analytics
              </Typography>
              <Typography variant="body1" paragraph>
                View detailed statistics on your property listings.
              </Typography>
              <Button
                variant="contained"
                startIcon={<TrendingUpIcon />}
                onClick={() => navigate('/property-stats')}
                sx={{ mt: 2 }}
              >
                View Statistics
              </Button>
            </Paper>
          </Grid>
        </Grid>

        {/* Property Listings */}
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5">
              Your Properties
            </Typography>
            <Button 
              variant="outlined" 
              onClick={() => navigate('/my-properties')}
            >
              View All
            </Button>
          </Box>
          
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress />
            </Box>
          ) : properties.length > 0 ? (
            <List>
              {properties.slice(0, displayCount).map((property) => (
                <ListItem 
                  key={property.guaranteed_id} 
                  sx={{ 
                    border: '1px solid', 
                    borderColor: 'divider', 
                    borderRadius: 1, 
                    mb: 2,
                    p: 2
                  }}
                >
                  <Avatar 
                    variant="rounded"
                    src={property.main_image_url || property.image_url}
                    sx={{ width: 60, height: 60, mr: 2 }}
                  >
                    <HomeIcon />
                  </Avatar>
                  
                  <ListItemText 
                    primary={property.title || 'Untitled Property'} 
                    secondary={
                      <React.Fragment>
                        <Typography component="span" variant="body2" color="text.primary">
                          ${property.price ? property.price.toLocaleString() : 'Price not specified'}
                        </Typography>
                        <br />
                        {property.city || ''} {property.parish?.name ? `, ${property.parish.name}` : ''}
                      </React.Fragment>
                    }
                    sx={{ flexGrow: 1 }}
                  />
                  
                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', ml: 2, gap: 1 }}>
                    <Chip 
                      label={property.status || 'Active'} 
                      color={property.status === 'Inactive' ? 'default' : 'success'}
                      size="small"
                      sx={{ mb: { xs: 1, sm: 0 }, mr: { sm: 1 } }}
                    />
                    
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="View Property Details">
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={() => handleViewProperty(property)}
                          sx={{ border: '1px solid', borderColor: 'primary.main' }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Edit Property">
                        <IconButton
                          color="secondary"
                          size="small"
                          onClick={() => handleEditProperty(property)}
                          sx={{ border: '1px solid', borderColor: 'secondary.main' }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </ListItem>
              ))}
              
              {properties.length > displayCount && (
                <Box sx={{ textAlign: 'center', mt: 3 }}>
                  <Button 
                    variant="outlined"
                    onClick={() => navigate('/my-properties')}
                  >
                    View All {properties.length} Properties
                  </Button>
                </Box>
              )}
            </List>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" gutterBottom>
                You haven't added any properties yet
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Start creating your property listings to showcase them to potential buyers or renters.
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/add-property')}
                sx={{ mt: 2 }}
              >
                Add Your First Property
              </Button>
            </Box>
          )}
        </Paper>
        
        {/* Recent Activity */}
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Recent Activity
          </Typography>
          
          {loading ? (
            <CircularProgress size={24} sx={{ mt: 2 }} />
          ) : (
            <List>
              <ListItem>
                <ListItemText 
                  primary="New inquiry received" 
                  secondary="You have a new message about your property at 123 Main St."
                />
                <Button variant="text" color="primary">View</Button>
              </ListItem>
              <Divider component="li" />
              <ListItem>
                <ListItemText 
                  primary="Property viewed" 
                  secondary="Your property at 456 Oak Ave received 5 new views today."
                />
                <Button variant="text" color="primary">Details</Button>
              </ListItem>
              <Divider component="li" />
              <ListItem>
                <ListItemText 
                  primary="Listing updated" 
                  secondary="Your property at 789 Pine Rd was updated on May 5, 2025."
                />
                <Button variant="text" color="primary">View</Button>
              </ListItem>
            </List>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default OwnerHome;