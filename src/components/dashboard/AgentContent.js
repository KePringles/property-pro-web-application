// src/components/dashboard/AgentContent.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import HomeIcon from '@mui/icons-material/Home';
import { useAuth } from '../../hooks/useAuth';

// Import API functions
import { getProperties, getPropertyStatistics } from '../../api/properties';

const AgentContent = ({ activeTab, user }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [properties, setProperties] = useState([]);
  const [clients, setClients] = useState([]);
  const [statistics, setStatistics] = useState({
    totalProperties: 0,
    totalViews: 0,
    totalInquiries: 0,
    totalClients: 0,
    activeListings: 0
  });
  const [loading, setLoading] = useState({
    properties: false,
    statistics: false,
    clients: false
  });
  const [error, setError] = useState({
    properties: null,
    statistics: null,
    clients: null
  });

  // Load data based on active tab
  useEffect(() => {
    if (!isAuthenticated || !user?.user_id) return;

    if (activeTab === 'dashboard' || activeTab === 'listings') {
      // Fetch properties
      const fetchProperties = async () => {
        setLoading(prev => ({ ...prev, properties: true }));
        try {
          const response = await getProperties({ agent_id: user.user_id });
          
          // Handle different response formats
          let propertiesData = [];
          if (response?.properties && Array.isArray(response.properties)) {
            propertiesData = response.properties;
          } else if (response?.data?.properties && Array.isArray(response.data.properties)) {
            propertiesData = response.data.properties;
          } else if (Array.isArray(response)) {
            propertiesData = response;
          } else if (response?.data && Array.isArray(response.data)) {
            propertiesData = response.data;
          }
          
          setProperties(propertiesData || []);
        } catch (err) {
          console.error('Error fetching properties:', err);
          setError(prev => ({ ...prev, properties: 'Failed to load properties.' }));
        } finally {
          setLoading(prev => ({ ...prev, properties: false }));
        }
      };
      
      fetchProperties();
    }

    if (activeTab === 'dashboard' || activeTab === 'stats') {
      // Fetch property statistics
      const fetchStatistics = async () => {
        setLoading(prev => ({ ...prev, statistics: true }));
        try {
          const response = await getPropertyStatistics(user.user_id);
          
          setStatistics({
            totalProperties: response?.total_properties || 0,
            totalViews: response?.total_views || 0,
            totalInquiries: response?.total_inquiries || 0,
            totalClients: response?.total_clients || 0,
            activeListings: response?.active_listings || 0
          });
        } catch (err) {
          console.error('Error fetching statistics:', err);
          setError(prev => ({ ...prev, statistics: 'Failed to load statistics.' }));
        } finally {
          setLoading(prev => ({ ...prev, statistics: false }));
        }
      };
      
      fetchStatistics();
    }

    if (activeTab === 'dashboard' || activeTab === 'clients') {
      // Mock client data for now
      const fetchClients = async () => {
        setLoading(prev => ({ ...prev, clients: true }));
        
        try {
          // This would be replaced with an actual API call
          const mockClients = [
            {
              id: 1,
              name: 'John Doe',
              email: 'john@example.com',
              phone: '876-555-1234',
              propertyCount: 3,
              status: 'Active'
            },
            {
              id: 2,
              name: 'Sarah Smith',
              email: 'sarah@example.com',
              phone: '876-555-5678',
              propertyCount: 1,
              status: 'Active'
            },
            {
              id: 3,
              name: 'Michael Brown',
              email: 'michael@example.com',
              phone: '876-555-9012',
              propertyCount: 2,
              status: 'Inactive'
            }
          ];
          
          // Simulate API delay
          setTimeout(() => {
            setClients(mockClients);
            setLoading(prev => ({ ...prev, clients: false }));
          }, 800);
          
        } catch (err) {
          console.error('Error fetching clients:', err);
          setError(prev => ({ ...prev, clients: 'Failed to load clients.' }));
          setLoading(prev => ({ ...prev, clients: false }));
        }
      };
      
      fetchClients();
    }
  }, [activeTab, isAuthenticated, user?.user_id]);

  // Render dashboard overview
  if (activeTab === 'dashboard') {
    return (
      <Box>
        <Grid container spacing={4} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <Paper elevation={1} sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Your Account
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Typography variant="body1" paragraph>
                <strong>Account Type:</strong> Agent
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>Email:</strong> {user?.email || 'Not available'}
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>Company:</strong> {user?.profile?.company_name || 'Not set'}
              </Typography>

              <Button
                variant="outlined"
                onClick={() => navigate('/profile')}
                sx={{ mt: 2 }}
              >
                View Profile
              </Button>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper elevation={1} sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button 
                  variant="contained" 
                  startIcon={<PersonAddIcon />}
                  onClick={() => navigate('/add-client')}
                >
                  Add New Client
                </Button>
                <Button 
                  variant="contained" 
                  color="secondary"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/add-property')}
                >
                  Add New Property
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={() => navigate('/dashboard?tab=clients')}
                >
                  Manage Clients
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Statistics Overview */}
        <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
          Dashboard Overview
        </Typography>
        
        {error.statistics && <Alert severity="error" sx={{ mb: 2 }}>{error.statistics}</Alert>}
        
        {loading.statistics ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Properties
                  </Typography>
                  <Typography variant="h3">
                    {statistics.totalProperties}
                  </Typography>
                  <Typography variant="caption">
                    {statistics.activeListings} active listings
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ bgcolor: 'secondary.light', color: 'secondary.contrastText' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Clients
                  </Typography>
                  <Typography variant="h3">
                    {statistics.totalClients || clients.length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Inquiries
                  </Typography>
                  <Typography variant="h3">
                    {statistics.totalInquiries}
                  </Typography>
                  <Typography variant="caption">
                    Across all properties
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Managed Properties */}
        <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
          Managed Properties
        </Typography>

        {error.properties && <Alert severity="error" sx={{ mb: 2 }}>{error.properties}</Alert>}

        {loading.properties ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress />
          </Box>
        ) : properties.length > 0 ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Property</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Views</TableCell>
                  <TableCell>Owner</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {properties.slice(0, 5).map((property) => (
                  <TableRow key={property.property_id || property.id || Math.random().toString()}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar 
                          variant="rounded"
                          src={property.main_image_url || property.image_url}
                          sx={{ width: 40, height: 40, mr: 2 }}
                        >
                          <HomeIcon />
                        </Avatar>
                        <Typography variant="body2">
                          {property.title || 'Untitled Property'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      ${property.price ? property.price.toLocaleString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={property.status || 'Active'} 
                        color={property.status === 'Inactive' ? 'default' : 'success'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {property.view_count || 0}
                    </TableCell>
                    <TableCell>
                      {property.owner_name || property.client_name || 'Unknown'}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton 
                        size="small"
                        onClick={() => navigate(`/properties/${property.property_id || property.id}/edit`)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small"
                        onClick={() => navigate(`/properties/${property.property_id || property.id}`)}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" gutterBottom>
              No properties to manage yet
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Start adding properties for your clients.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/add-property')}
              sx={{ mt: 2 }}
            >
              Add First Property
            </Button>
          </Box>
        )}

        {properties.length > 5 && (
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Button 
              variant="outlined" 
              onClick={() => navigate('/dashboard?tab=listings')}
            >
              View All Properties ({properties.length})
            </Button>
          </Box>
        )}

        {/* Clients Preview */}
        <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
          Your Clients
        </Typography>
        
        {error.clients && <Alert severity="error" sx={{ mb: 2 }}>{error.clients}</Alert>}
        
        {loading.clients ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress />
          </Box>
        ) : clients.length > 0 ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Properties</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {clients.slice(0, 3).map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2 }}>
                          {client.name.charAt(0)}
                        </Avatar>
                        {client.name}
                      </Box>
                    </TableCell>
                    <TableCell>{client.email}</TableCell>
                    <TableCell>{client.phone}</TableCell>
                    <TableCell>{client.propertyCount}</TableCell>
                    <TableCell>
                      <Chip 
                        label={client.status} 
                        color={client.status === 'Active' ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton 
                        size="small"
                        onClick={() => navigate(`/clients/${client.id}/edit`)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small"
                        onClick={() => navigate(`/clients/${client.id}`)}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" gutterBottom>
              No clients yet
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Start adding clients to manage their properties.
            </Typography>
            <Button
              variant="contained"
              startIcon={<PersonAddIcon />}
              onClick={() => navigate('/add-client')}
              sx={{ mt: 2 }}
            >
              Add First Client
            </Button>
          </Box>
        )}
        
        {clients.length > 3 && (
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Button 
              variant="outlined" 
              onClick={() => navigate('/dashboard?tab=clients')}
            >
              View All Clients ({clients.length})
            </Button>
          </Box>
        )}
      </Box>
    );
  }

  // Property Listings Tab
  if (activeTab === 'listings') {
    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            Managed Properties
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => navigate('/add-property')}
          >
            Add Property
          </Button>
        </Box>
        
        {error.properties && <Alert severity="error" sx={{ mb: 2 }}>{error.properties}</Alert>}
        
        {loading.properties ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress />
          </Box>
        ) : properties.length > 0 ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Property</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Views</TableCell>
                  <TableCell>Owner</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {properties.map((property) => (
                  <TableRow key={property.property_id || property.id || Math.random().toString()}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar 
                          variant="rounded"
                          src={property.main_image_url || property.image_url}
                          sx={{ width: 40, height: 40, mr: 2 }}
                        >
                          <HomeIcon />
                        </Avatar>
                        <Typography variant="body2">
                          {property.title || 'Untitled Property'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      ${property.price ? property.price.toLocaleString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={property.status || 'Active'} 
                        color={property.status === 'Inactive' ? 'default' : 'success'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {property.view_count || 0}
                    </TableCell>
                    <TableCell>
                      {property.owner_name || property.client_name || 'Unknown'}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton 
                        size="small"
                        onClick={() => navigate(`/properties/${property.property_id || property.id}/edit`)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small"
                        onClick={() => navigate(`/properties/${property.property_id || property.id}`)}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" gutterBottom>
              No properties to manage yet
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Start adding properties for your clients.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/add-property')}
              sx={{ mt: 2 }}
            >
              Add First Property
            </Button>
          </Box>
        )}
      </Box>
    );
  }

  // Clients Tab
  if (activeTab === 'clients') {
    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            Your Clients
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<PersonAddIcon />}
            onClick={() => navigate('/add-client')}
          >
            Add Client
          </Button>
        </Box>
        
        {error.clients && <Alert severity="error" sx={{ mb: 2 }}>{error.clients}</Alert>}
        
        {loading.clients ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress />
          </Box>
        ) : clients.length > 0 ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Properties</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2 }}>
                          {client.name.charAt(0)}
                        </Avatar>
                        {client.name}
                      </Box>
                    </TableCell>
                    <TableCell>{client.email}</TableCell>
                    <TableCell>{client.phone}</TableCell>
                    <TableCell>{client.propertyCount}</TableCell>
                    <TableCell>
                      <Chip 
                        label={client.status} 
                        color={client.status === 'Active' ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton 
                        size="small"
                        onClick={() => navigate(`/clients/${client.id}/edit`)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small"
                        onClick={() => navigate(`/clients/${client.id}`)}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" gutterBottom>
              No clients yet
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Start adding clients to manage their properties.
            </Typography>
            <Button
              variant="contained"
              startIcon={<PersonAddIcon />}
              onClick={() => navigate('/add-client')}
              sx={{ mt: 2 }}
            >
              Add First Client
            </Button>
          </Box>
        )}
      </Box>
    );
  }

  // Statistics Tab
  if (activeTab === 'stats') {
    return (
      <Box>
        <Typography variant="h5" gutterBottom>
          Performance Statistics
        </Typography>
        
        {error.statistics && <Alert severity="error" sx={{ mb: 2 }}>{error.statistics}</Alert>}
        
        {loading.statistics ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Properties
                    </Typography>
                    <Typography variant="h3">
                      {statistics.totalProperties}
                    </Typography>
                    <Typography variant="caption">
                      {statistics.activeListings} active listings
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
                      {statistics.totalClients || clients.length}
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
                      {statistics.totalInquiries}
                    </Typography>
                    <Typography variant="caption">
                      Across all properties
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
                      {statistics.totalViews}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            
            <Alert severity="info" sx={{ mb: 3 }}>
              More detailed statistics and analytics will be available here in a future update.
            </Alert>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Most Viewed Properties
                  </Typography>
                  
                  {properties.length > 0 ? (
                    <List>
                      {properties
                        .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
                        .slice(0, 5)
                        .map((property, index) => (
                          <ListItem 
                            key={property.property_id || property.id || Math.random().toString()} 
                            sx={{ 
                              border: '1px solid', 
                              borderColor: 'divider', 
                              borderRadius: 1, 
                              mb: 2,
                              p: 2
                            }}
                          >
                            <Typography sx={{ mr: 2, fontWeight: 'bold' }}>
                              #{index + 1}
                            </Typography>
                            
                            <ListItemText 
                              primary={property.title || 'Untitled Property'} 
                              secondary={`${property.owner_name || property.client_name || 'Unknown'}`}
                            />
                            
                            <Typography variant="body2" fontWeight="bold">
                              {property.view_count || 0} views
                            </Typography>
                          </ListItem>
                        ))}
                    </List>
                  ) : (
                    <Alert severity="info">
                      You need to add properties to see their statistics.
                    </Alert>
                  )}
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Clients by Property Count
                  </Typography>
                  
                  {clients.length > 0 ? (
                    <List>
                      {clients
                        .sort((a, b) => b.propertyCount - a.propertyCount)
                        .map((client, index) => (
                          <ListItem 
                            key={client.id} 
                            sx={{ 
                              border: '1px solid', 
                              borderColor: 'divider', 
                              borderRadius: 1, 
                              mb: 2,
                              p: 2
                            }}
                          >
                            <Avatar sx={{ mr: 2 }}>
                              {client.name.charAt(0)}
                            </Avatar>
                            
                            <ListItemText 
                              primary={client.name} 
                              secondary={client.email}
                            />
                            
                            <Chip 
                              label={`${client.propertyCount} ${client.propertyCount === 1 ? 'property' : 'properties'}`}
                              color="primary"
                              size="small"
                            />
                          </ListItem>
                        ))}
                    </List>
                  ) : (
                    <Alert severity="info">
                      You need to add clients to see their statistics.
                    </Alert>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </>
        )}
      </Box>
    );
  }

  // Fallback for unknown tab
  return (
    <Box>
      <Alert severity="warning">
        Unknown tab selected. Please try another option.
      </Alert>
    </Box>
  );
};

export default AgentContent;