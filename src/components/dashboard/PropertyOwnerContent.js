// src/components/dashboard/PropertyOwnerContent.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  CircularProgress,
  Alert,
  Chip,
  Avatar,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  IconButton,
  Badge
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import HomeIcon from '@mui/icons-material/Home';
import VisibilityIcon from '@mui/icons-material/Visibility';
import MessageIcon from '@mui/icons-material/Message';
import NotificationsIcon from '@mui/icons-material/Notifications';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import { useAuth } from '../../hooks/useAuth';
import { getProperties, getPropertyStatistics, deleteProperty } from '../../api/properties';

const PropertyOwnerContent = ({ activeTab, user }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [properties, setProperties] = useState([]);
  const [statistics, setStatistics] = useState({
    totalProperties: 0,
    totalViews: 0,
    totalInquiries: 0,
    activeProperties: 0,
    unreadNotifications: 0
  });
  const [loading, setLoading] = useState({
    properties: true,
    statistics: true
  });
  const [error, setError] = useState({
    properties: null,
    statistics: null
  });

  const [deletingId, setDeletingId] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const fetchMyProperties = async () => {
    try {
      const response = await getProperties({ owner_id: user.user_id });
      let propertiesData = [];
      if (response?.properties && Array.isArray(response.properties)) {
        propertiesData = response.properties;
      } else if (response?.data?.properties && Array.isArray(response.data.properties)) {
        propertiesData = response.data.properties;
      } else if (Array.isArray(response)) {
        propertiesData = response;
      }

      setProperties(propertiesData || []);
      
      // Update statistics based on properties data
      const activePropertiesCount = propertiesData.filter(p => p.status === 'Active').length;
      setStatistics(prev => ({
        ...prev,
        totalProperties: propertiesData?.length || 0,
        activeProperties: activePropertiesCount
      }));
    } catch (err) {
      console.error('Error fetching properties:', err);
      setError(prev => ({ ...prev, properties: 'Failed to load your properties.' }));
    } finally {
      setLoading(prev => ({ ...prev, properties: false }));
    }
  };

  useEffect(() => {
    if (!isAuthenticated || !user?.user_id) return;

    fetchMyProperties();

    if (activeTab === 'dashboard' || activeTab === 'stats') {
      const fetchStatistics = async () => {
        try {
          const response = await getPropertyStatistics(user.user_id);
          
          // Calculate active properties count
          const activePropertiesCount = properties.filter(p => p.status === 'Active').length;
          
          // Calculate property total from API response or use properties array length as fallback
          const propertyCount = response?.total_properties !== undefined ? 
            response.total_properties : 
            properties.length;
            
          setStatistics({
            totalProperties: propertyCount,
            activeProperties: activePropertiesCount,
            totalViews: response?.total_views || 0,
            totalInquiries: response?.total_inquiries || 0,
            unreadNotifications: response?.unread_notifications || 2, // Hardcoded for now
          });
        } catch (err) {
          console.error('Error fetching statistics:', err);
          setError(prev => ({ ...prev, statistics: 'Failed to load property statistics.' }));
          
          // Use properties length as fallback if API fails
          const activePropertiesCount = properties.filter(p => p.status === 'Active').length;
          setStatistics(prev => ({
            ...prev,
            totalProperties: properties.length,
            activeProperties: activePropertiesCount
          }));
        } finally {
          setLoading(prev => ({ ...prev, statistics: false }));
        }
      };
      fetchStatistics();
    }
  }, [isAuthenticated, user?.user_id, activeTab]);

  const handleDeleteClick = (propertyId) => {
    setDeletingId(propertyId);
    setConfirmDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteProperty(deletingId);
      setConfirmDialogOpen(false);
      setDeletingId(null);
      fetchMyProperties();
    } catch (error) {
      console.error('Error deleting property:', error);
    }
  };

  // Define content based on active tab
  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'properties':
        return renderMyListings();
      case 'notifications':
        return renderNotifications();
      case 'stats':
        return renderStatistics();  
      default:
        return renderDashboard(); // Default to dashboard
    }
  };

  // Dashboard view with focus on key metrics
  const renderDashboard = () => {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          {/* Summary Cards */}
          <Grid item xs={12} md={3}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                height: 140,
                bgcolor: 'primary.light',
                color: 'white',
              }}
            >
              <Typography component="h2" variant="h6" color="white" gutterBottom>
                Total Properties
              </Typography>
              {loading.statistics ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                <Typography component="p" variant="h3">
                  {statistics.totalProperties}
                </Typography>
              )}
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto' }}>
                <HomeIcon sx={{ mr: 1 }} />
                <Typography variant="body2">
                  All your listed properties
                </Typography>
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                height: 140,
                bgcolor: 'success.light',
                color: 'white',
              }}
            >
              <Typography component="h2" variant="h6" color="white" gutterBottom>
                Active Listings
              </Typography>
              {loading.statistics ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                <Typography component="p" variant="h3">
                  {statistics.activeProperties || 0}
                </Typography>
              )}
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto' }}>
                <HomeIcon sx={{ mr: 1 }} />
                <Typography variant="body2">
                  Currently active properties
                </Typography>
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                height: 140,
                bgcolor: 'info.light',
                color: 'white',
              }}
            >
              <Typography component="h2" variant="h6" color="white" gutterBottom>
                Total Views
              </Typography>
              {loading.statistics ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                <Typography component="p" variant="h3">
                  {statistics.totalViews}
                </Typography>
              )}
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto' }}>
                <VisibilityIcon sx={{ mr: 1 }} />
                <Typography variant="body2">
                  All property views
                </Typography>
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                height: 140,
                bgcolor: 'warning.light',
                color: 'white',
              }}
            >
              <Typography component="h2" variant="h6" color="white" gutterBottom>
                Total Inquiries
              </Typography>
              {loading.statistics ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                <Typography component="p" variant="h3">
                  {statistics.totalInquiries}
                </Typography>
              )}
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto' }}>
                <MessageIcon sx={{ mr: 1 }} />
                <Typography variant="body2">
                  All inquiries received
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Recent Notifications */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography component="h2" variant="h6" color="primary">
                  Recent Notifications
                </Typography>
                <Badge badgeContent={statistics.unreadNotifications} color="error">
                  <NotificationsIcon color="action" />
                </Badge>
              </Box>
              {renderRecentNotifications()}
            </Paper>
          </Grid>

          {/* Recent Inquiries */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography component="h2" variant="h6" color="primary">
                  Recent Inquiries
                </Typography>
                <Button 
                  variant="text" 
                  color="primary"
                  endIcon={<MessageIcon />}
                  onClick={() => navigate('/messages')}
                >
                  View All
                </Button>
              </Box>
              {renderRecentInquiries()}
            </Paper>
          </Grid>

          {/* Property List Preview */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography component="h2" variant="h6" color="primary">
                  Your Properties
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/add-property')}
                >
                  Add Property
                </Button>
              </Box>
              {renderPropertyList(true)}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    );
  };

  const renderRecentNotifications = () => {
    if (loading.statistics) {
      return <LinearProgress />;
    }

    return (
      <List>
        <ListItem>
          <ListItemIcon>
            <VisibilityIcon color="primary" />
          </ListItemIcon>
          <ListItemText
            primary="New property views"
            secondary="Your property at 123 Main Street was viewed 5 times today."
          />
          <ListItemSecondaryAction>
            <IconButton edge="end" aria-label="view details">
              <InfoIcon />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
        <Divider />
        <ListItem>
          <ListItemIcon>
            <MessageIcon color="primary" />
          </ListItemIcon>
          <ListItemText
            primary="New inquiry received"
            secondary="You have a new inquiry for your property at 456 Oak Avenue."
          />
          <ListItemSecondaryAction>
            <Button size="small" variant="outlined" color="primary">
              Reply
            </Button>
          </ListItemSecondaryAction>
        </ListItem>
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Button
            variant="text"
            color="primary"
            onClick={() => navigate('/notifications')}
          >
            View All Notifications
          </Button>
        </Box>
      </List>
    );
  };

  const renderRecentInquiries = () => {
    if (loading.statistics) {
      return <LinearProgress />;
    }

    return (
      <List>
        <ListItem>
          <ListItemIcon>
            <Avatar>JD</Avatar>
          </ListItemIcon>
          <ListItemText
            primary="Jane Doe"
            secondary="Hi, I'm interested in scheduling a viewing for 123 Main Street. Is it still available?"
          />
          <ListItemSecondaryAction>
            <Button size="small" variant="contained" color="primary">
              Reply
            </Button>
          </ListItemSecondaryAction>
        </ListItem>
        <Divider />
        <ListItem>
          <ListItemIcon>
            <Avatar>JS</Avatar>
          </ListItemIcon>
          <ListItemText
            primary="John Smith"
            secondary="Hello, I was wondering if the property at 456 Oak Avenue has a garage? Thank you."
          />
          <ListItemSecondaryAction>
            <Button size="small" variant="contained" color="primary">
              Reply
            </Button>
          </ListItemSecondaryAction>
        </ListItem>
      </List>
    );
  };

  const renderStatistics = () => {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Property Performance Statistics
        </Typography>
  
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, bgcolor: 'primary.light', color: 'white' }}>
              <Typography variant="h6">Total Properties</Typography>
              {loading.statistics ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                <Typography variant="h4">{statistics.totalProperties}</Typography>
              )}
            </Paper>
          </Grid>
  
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, bgcolor: 'success.light', color: 'white' }}>
              <Typography variant="h6">Active Listings</Typography>
              {loading.statistics ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                <Typography variant="h4">{statistics.activeProperties}</Typography>
              )}
            </Paper>
          </Grid>
  
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, bgcolor: 'info.light', color: 'white' }}>
              <Typography variant="h6">Total Views</Typography>
              {loading.statistics ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                <Typography variant="h4">{statistics.totalViews}</Typography>
              )}
            </Paper>
          </Grid>
  
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, bgcolor: 'warning.light', color: 'white' }}>
              <Typography variant="h6">Total Inquiries</Typography>
              {loading.statistics ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                <Typography variant="h4">{statistics.totalInquiries}</Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    );
  };
  

  // Update property status
  const updatePropertyStatus = async (propertyId, newStatus) => {
    try {
      // This is a placeholder for your actual API call to update the status
      // await updatePropertyStatusAPI(propertyId, newStatus);
      
      // For now, update the status locally
      const updatedProperties = properties.map(prop => 
        prop.property_id === propertyId ? {...prop, status: newStatus} : prop
      );
      setProperties(updatedProperties);
      
      // Update statistics after status change
      const activePropertiesCount = updatedProperties.filter(p => p.status === 'Active').length;
      setStatistics(prev => ({
        ...prev,
        activeProperties: activePropertiesCount
      }));
      
    } catch (error) {
      console.error('Error updating property status:', error);
    }
  };

  // Dashboard property list with analytics data
  const renderPropertyList = (limitCount = false) => {
    if (loading.properties) {
      return <LinearProgress />;
    }

    if (error.properties) {
      return <Alert severity="error">{error.properties}</Alert>;
    }

    if (properties.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <Typography variant="body1" gutterBottom>
            You haven't added any properties yet.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate('/add-property')}
            sx={{ mt: 2 }}
          >
            Add Your First Property
          </Button>
        </Box>
      );
    }

    const displayProperties = limitCount ? properties.slice(0, 5) : properties;

    return (
      <>
        <TableContainer>
          <Table size="medium">
            <TableHead>
              <TableRow>
                <TableCell>Property</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Views</TableCell>
                <TableCell>Inquiries</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayProperties.map((property) => (
                <TableRow key={property.property_id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar
                        src={property.main_image_url || '/static/images/property-placeholder.jpg'}
                        variant="rounded"
                        sx={{ width: 48, height: 48, mr: 2 }}
                      />
                      <Typography variant="subtitle2">{property.title}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{property.address}</TableCell>
                  <TableCell>
                    <Chip
                      label={property.status || 'Active'}
                      color={property.status === 'Inactive' ? 'default' : 
                             property.status === 'Sold' ? 'error' : 'success'}
                      size="small"
                      onClick={() => {
                        const newStatus = property.status === 'Active' ? 'Inactive' : 'Active';
                        updatePropertyStatus(property.property_id, newStatus);
                      }}
                      sx={{ cursor: 'pointer' }}
                    />
                  </TableCell>
                  <TableCell>{property.views || 0}</TableCell>
                  <TableCell>{property.inquiries || 0}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="View Property Details">
                      <IconButton
                        size="small"
                        aria-label="View property details"
                        onClick={() => navigate(`/properties/${property.property_id}`)}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit Property">
                      <IconButton
                        size="small"
                        aria-label="Edit property"
                        onClick={() => navigate(`/properties/${property.property_id}/edit`)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Property">
                      <IconButton
                        size="small"
                        aria-label="Delete property"
                        onClick={() => handleDeleteClick(property.property_id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {limitCount && properties.length > 5 && (
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Button
              variant="text"
              color="primary"
              onClick={() => navigate('/properties')}
            >
              View All Properties
            </Button>
          </Box>
        )}
      </>
    );
  };

  // My Listings tab - Shows ONLY properties listings and add button
  const renderMyListings = () => {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography component="h1" variant="h5" color="primary">
              My Listings
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => navigate('/add-property')}
            >
              Add Property
            </Button>
          </Box>
          
          {/* Simplified property listings table without dashboard elements */}
          {loading.properties ? (
            <LinearProgress />
          ) : error.properties ? (
            <Alert severity="error">{error.properties}</Alert>
          ) : properties.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <Typography variant="body1" gutterBottom>
                You haven't added any properties yet.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => navigate('/add-property')}
                sx={{ mt: 2 }}
              >
                Add Your First Property
              </Button>
            </Box>
          ) : (
            <TableContainer>
              <Table size="medium">
                <TableHead>
                  <TableRow>
                    <TableCell>Property</TableCell>
                    <TableCell>Address</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {properties.map((property) => (
                    <TableRow key={property.property_id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar
                            src={property.main_image_url || '/static/images/property-placeholder.jpg'}
                            variant="rounded"
                            sx={{ width: 48, height: 48, mr: 2 }}
                          />
                          <Typography variant="subtitle2">{property.title}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{property.address}</TableCell>
                      <TableCell>
                        <Chip
                          label={property.status || 'Active'}
                          color={property.status === 'Inactive' ? 'default' : 
                                property.status === 'Sold' ? 'error' : 'success'}
                          size="small"
                          onClick={() => {
                            const newStatus = property.status === 'Active' ? 'Inactive' : 'Active';
                            updatePropertyStatus(property.property_id, newStatus);
                          }}
                          sx={{ cursor: 'pointer' }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="View Property Details">
                          <IconButton
                            size="small"
                            aria-label="View property details"
                            onClick={() => navigate(`/property/${property.property_id}`)}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Property">
                          <IconButton
                            size="small"
                            aria-label="Edit property"
                            onClick={() => navigate(`/properties/${property.property_id}/edit`)}

                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Property">
                          <IconButton
                            size="small"
                            aria-label="Delete property"
                            onClick={() => handleDeleteClick(property.property_id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Container>
    );
  };

  const renderNotifications = () => {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography component="h1" variant="h5" color="primary">
              Notifications & Inquiries
            </Typography>
            <Badge badgeContent={statistics.unreadNotifications} color="error">
              <NotificationsIcon color="action" />
            </Badge>
          </Box>
          <Divider sx={{ mb: 3 }} />
          
          <Typography variant="h6" color="primary" gutterBottom>
            Property Notifications
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <VisibilityIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="New property view"
                secondary="Your property at 123 Main Street was viewed 5 times today."
              />
              <ListItemSecondaryAction>
                <IconButton edge="end" aria-label="property details">
                  <VisibilityIcon fontSize="small" />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
            <Divider variant="inset" component="li" />
            <ListItem>
              <ListItemIcon>
                <VisibilityIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Popular listing"
                secondary="Your property at 789 Pine Road is getting more views than 80% of similar listings."
              />
              <ListItemSecondaryAction>
                <IconButton edge="end" aria-label="property details">
                  <VisibilityIcon fontSize="small" />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          </List>
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="h6" color="primary" gutterBottom>
            Client Inquiries
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <Avatar>JD</Avatar>
              </ListItemIcon>
              <ListItemText
                primary="Jane Doe"
                secondary="Hi, I'm interested in scheduling a viewing for 123 Main Street. Is it still available?"
              />
              <ListItemSecondaryAction>
                <Button variant="contained" color="primary" size="small">
                  Reply
                </Button>
              </ListItemSecondaryAction>
            </ListItem>
            <Divider variant="inset" component="li" />
            <ListItem>
              <ListItemIcon>
                <Avatar>JS</Avatar>
              </ListItemIcon>
              <ListItemText
                primary="John Smith"
                secondary="Hello, I was wondering if the property at 456 Oak Avenue has a garage? Thank you."
              />
              <ListItemSecondaryAction>
                <Button variant="contained" color="primary" size="small">
                  Reply
                </Button>
              </ListItemSecondaryAction>
            </ListItem>
            <Divider variant="inset" component="li" />
            <ListItem>
              <ListItemIcon>
                <Avatar>AT</Avatar>
              </ListItemIcon>
              <ListItemText
                primary="Alice Thompson"
                secondary="I'd like to know if you're open to negotiation on the price of 789 Pine Road."
              />
              <ListItemSecondaryAction>
                <Button variant="contained" color="primary" size="small">
                  Reply
                </Button>
              </ListItemSecondaryAction>
            </ListItem>
          </List>
        </Paper>
      </Container>
    );
  };

  return (
    <>
      {renderContent()}
      {confirmDialogOpen && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
          }}
        >
          <Box
            sx={{
              backgroundColor: 'white',
              borderRadius: 2,
              padding: 4,
              maxWidth: 400,
              textAlign: 'center',
            }}
          >
            <Typography variant="h6" gutterBottom>
              Confirm Deletion
            </Typography>
            <Typography variant="body1" gutterBottom>
              Are you sure you want to delete this property? This action cannot be undone.
            </Typography>
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button variant="contained" color="error" onClick={confirmDelete}>
                Yes, Delete
              </Button>
              <Button variant="outlined" onClick={() => setConfirmDialogOpen(false)}>
                Cancel
              </Button>
            </Box>
          </Box>
        </Box>
      )}
    </>
  );
};

export default PropertyOwnerContent;