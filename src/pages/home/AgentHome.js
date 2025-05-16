// src/pages/agent/AgentHome.js (Updated and Fixed)
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
  List,
  ListItem,
  ListItemText,
  Avatar,
  CircularProgress,
  Alert,
  Tabs,
  Tab
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import PeopleIcon from '@mui/icons-material/People';
import SearchIcon from '@mui/icons-material/Search';
import HomeIcon from '@mui/icons-material/Home';
import { useAuth } from '../../hooks/useAuth';
import { getProperties } from '../../api/properties';
import { getClients } from '../../api/clients';

const AgentHome = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [properties, setProperties] = useState([]);
  const [clients, setClients] = useState([]);
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [loadingClients, setLoadingClients] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Fetch properties
  useEffect(() => {
    const fetchProperties = async () => {
      setLoadingProperties(true);
      try {
        // Make sure we have a user ID
        if (!user?.user_id) {
          console.error('No user ID available');
          return;
        }

        // Log the user object to debug
        console.log('Current user:', user);
        
        // Get property data - providing both agent_id and user_id 
        const response = await getProperties({ 
          agent_id: user.user_id,
          user_id: user.user_id 
        });
        
        console.log('Properties response:', response);
        
        // Handle the response data based on its structure
        let propertyData = [];
        if (response && response.properties) {
          propertyData = response.properties;
        } else if (response && Array.isArray(response)) {
          propertyData = response;
        } else if (response && response.data && Array.isArray(response.data)) {
          propertyData = response.data;
        } else {
          propertyData = [];
          console.warn('Unexpected properties data structure:', response);
        }
        
        // Enhance properties with guaranteed IDs for consistent navigation
        const enhancedProperties = propertyData.map((property) => {
          // Create a guaranteed ID field that will be present on all properties
          const guaranteedId = property.id || property.property_id || property._id || 
                              property.propertyId || property.propertyID || 
                              property.uuid || "missing-id";
          
          return {
            ...property,
            // Add guaranteed ID field to each property
            guaranteed_id: guaranteedId
          };
        });
        
        // Log the enhanced properties for debugging
        if (enhancedProperties.length > 0) {
          console.log('First property guaranteed ID:', enhancedProperties[0].guaranteed_id);
        }
        
        setProperties(enhancedProperties);
      } catch (err) {
        console.error('Error fetching properties:', err);
        setError('Failed to load properties. ' + (err.message || ''));
      } finally {
        setLoadingProperties(false);
      }
    };

    fetchProperties();
  }, [user?.user_id]);

  // Fetch clients
  useEffect(() => {
    const fetchClients = async () => {
      setLoadingClients(true);
      try {
        // Make sure we have a user ID
        if (!user?.user_id) {
          console.error('No user ID available');
          return;
        }
        
        // Get client data
        const response = await getClients();
        
        console.log('Clients response:', response);
        
        // Handle the response data based on its structure
        if (response && response.data) {
          setClients(response.data);
        } else if (response && Array.isArray(response)) {
          setClients(response);
        } else {
          // If we can't find an appropriate structure, set an empty array
          setClients([]);
          console.warn('Unexpected clients data structure:', response);
        }
      } catch (err) {
        console.error('Error fetching clients:', err);
        // Don't show this error to the user since clients tab is secondary
      } finally {
        setLoadingClients(false);
      }
    };

    fetchClients();
  }, [user?.user_id]);

  // Navigation handlers
  const handleViewProperty = (property) => {
    // Always use the guaranteed_id for navigation
    const propertyId = property.guaranteed_id;
    
    console.log("Viewing property:", property.title || 'Untitled');
    console.log("Using ID:", propertyId);
    
    if (propertyId && propertyId !== 'missing-id') {
      // Track the view if your API supports it (optional - comment out if not implemented)
      /*
      try {
        if (typeof trackPropertyView === 'function') {
          trackPropertyView(propertyId).catch(err => {
            console.warn("View tracking failed:", err);
          });
        }
      } catch (e) {
        console.warn("Error in view tracking:", e);
      }
      */
      
      // Navigate to the property details page
      navigate(`/properties/${propertyId}`);
    } else {
      console.error("Cannot navigate - property has no valid ID:", property);
      setError("Unable to view property details. Property ID not found.");
    }
  };

  // Navigate to edit property
  const handleEditProperty = (property) => {
    // Always use the guaranteed_id for navigation
    const propertyId = property.guaranteed_id;
    
    console.log("Editing property:", property.title || 'Untitled');
    console.log("Using ID:", propertyId);
    
    if (propertyId && propertyId !== 'missing-id') {
      navigate(`/properties/${propertyId}/edit`);
    } else {
      console.error("Cannot navigate - property has no valid ID:", property);
      setError("Unable to edit property. Property ID not found.");
    }
  };

  return (
    <Box sx={{ backgroundColor: '#f5f7fa', minHeight: '100vh', pt: 2 }}>
      <Container maxWidth="xl">
        <Typography variant="h4" component="h1" gutterBottom>
          Agent Dashboard
        </Typography>

        {/* Statistics Summary */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Active Listings
                </Typography>
                <Typography variant="h3">
                  {loadingProperties ? '...' : properties.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'secondary.light', color: 'secondary.contrastText' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Clients
                </Typography>
                <Typography variant="h3">
                  {loadingClients ? '...' : clients.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Inquiries
                </Typography>
                <Typography variant="h3">
                  0
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'info.light', color: 'info.contrastText' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Total Views
                </Typography>
                <Typography variant="h3">
                  0
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Grid container spacing={4} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 4, height: '100%' }}>
              <Typography variant="h5" gutterBottom>
                Property Management
              </Typography>
              <Typography variant="body1" paragraph>
                Add and manage property listings.
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
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 4, height: '100%' }}>
              <Typography variant="h5" gutterBottom>
                Client Management
              </Typography>
              <Typography variant="body1" paragraph>
                Manage your client relationships.
              </Typography>
              <Button
                variant="contained"
                startIcon={<PeopleIcon />}
                onClick={() => navigate('/manage-clients')}
                sx={{ mt: 2 }}
              >
                View Clients
              </Button>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 4, height: '100%' }}>
              <Typography variant="h5" gutterBottom>
                Property Search
              </Typography>
              <Typography variant="body1" paragraph>
                Find properties for your clients.
              </Typography>
              <Button
                variant="contained"
                startIcon={<SearchIcon />}
                onClick={() => navigate('/search')}
                sx={{ mt: 2 }}
              >
                Search
              </Button>
            </Paper>
          </Grid>
        </Grid>

        {/* Properties & Clients Tabs */}
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
            <Tab label="My Properties" />
            <Tab label="My Clients" />
          </Tabs>
          
          {activeTab === 0 && (
            <>
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
              
              {loadingProperties ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                  <CircularProgress />
                </Box>
              ) : properties.length > 0 ? (
                <List>
                  {properties.slice(0, 5).map((property) => {
                    return (
                      <ListItem 
                        key={property.guaranteed_id || Math.random().toString()} 
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
                        />
                        
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleViewProperty(property)}
                          sx={{ mr: 1 }}
                        >
                          View
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleEditProperty(property)}
                        >
                          Edit
                        </Button>
                      </ListItem>
                    );
                  })}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    You haven't added any properties yet
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    Start creating property listings for your clients.
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/add-property')}
                    sx={{ mt: 2 }}
                  >
                    Add Property
                  </Button>
                </Box>
              )}
            </>
          )}
          
          {activeTab === 1 && (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5">
                  Your Clients
                </Typography>
                <Button 
                  variant="outlined" 
                  onClick={() => navigate('/manage-clients')}
                >
                  View All
                </Button>
              </Box>
              
              {loadingClients ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                  <CircularProgress />
                </Box>
              ) : clients.length > 0 ? (
                <List>
                  {clients.slice(0, 5).map((client) => (
                    <ListItem 
                      key={client.id || Math.random().toString()}
                      sx={{ 
                        border: '1px solid', 
                        borderColor: 'divider', 
                        borderRadius: 1, 
                        mb: 2,
                        p: 2
                      }}
                    >
                      <Avatar 
                        sx={{ mr: 2 }}
                      >
                        {client.name ? client.name[0].toUpperCase() : 'C'}
                      </Avatar>
                      
                      <ListItemText 
                        primary={client.name || 'Unnamed Client'} 
                        secondary={
                          <React.Fragment>
                            {client.email || 'No email specified'}
                            <br />
                            {client.phone || 'No phone specified'}
                          </React.Fragment>
                        }
                      />
                      
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => navigate(`/clients/${client.id}`)}
                        sx={{ mr: 1 }}
                      >
                        View
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => navigate(`/clients/${client.id}/edit`)}
                      >
                        Edit
                      </Button>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    You haven't added any clients yet
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    Start adding and managing your client relationships.
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/add-client')}
                    sx={{ mt: 2 }}
                  >
                    Add Client
                  </Button>
                </Box>
              )}
            </>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default AgentHome;