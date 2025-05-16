import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
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
  ListItemText,
  Card,
  CardContent,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import HomeIcon from '@mui/icons-material/Home';
import AddIcon from '@mui/icons-material/Add';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import { useAuth } from '../../hooks/useAuth';
import { getClientById, removePropertyFromClient } from '../../api/clients';

const ClientDetails = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [clientData, setClientData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Check for success messages in URL params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('property_added') === 'true') {
      setSuccessMessage('Property linked to client successfully');
      // Clear message after a few seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  }, [location]);

  // Fetch client data
  useEffect(() => {
    const fetchClientData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await getClientById(clientId);
        setClientData(data);
      } catch (err) {
        console.error('Error fetching client data:', err);
        setError('Failed to load client data: ' + (err.message || 'Unknown error'));
      } finally {
        setIsLoading(false);
      }
    };
    
    if (clientId) {
      fetchClientData();
    }
  }, [clientId]);

  /**
   * Handle removing a property from a client
   * @param {string} propertyId - The ID of the property to remove
   */
  const handleRemoveProperty = async (propertyId) => {
    // Show confirmation dialog
    const confirmRemove = window.confirm(
      "Are you sure you want to remove this property from this client? The property itself will not be deleted."
    );
    
    if (!confirmRemove) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Call the API to remove the property from the client
      await removePropertyFromClient(clientId, propertyId);
      
      // Update the local state to remove the property
      setClientData(prev => ({
        ...prev,
        properties: prev.properties.filter(p => {
          // Handle different property ID formats
          const propId = p.id || p.property_id || p._id;
          return propId !== propertyId;
        })
      }));
      
      // Show success message
      setSuccessMessage("Property removed from client successfully");
      
      // Clear success message after a few seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error("Error removing property from client:", err);
      setError(`Failed to remove property: ${err.message || "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle client deletion
  const handleDeleteClient = () => {
    setDeleteDialogOpen(true);
  };

  const confirmDeleteClient = async () => {
    // Your existing delete client logic
    setDeleteDialogOpen(false);
  };

  const cancelDeleteClient = () => {
    setDeleteDialogOpen(false);
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
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
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/manage-clients')}
        >
          Back to Clients
        </Button>
      </Container>
    );
  }

  if (!clientData) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          Client not found
        </Alert>
        <Button 
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/manage-clients')}
        >
          Back to Clients
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Back button and actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Button 
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/manage-clients')}
        >
          Back to Clients
        </Button>
        <Box>
          <Button 
            variant="outlined" 
            startIcon={<EditIcon />}
            onClick={() => navigate(`/clients/${clientId}/edit`)}
            sx={{ mr: 2 }}
          >
            Edit Client
          </Button>
          <Button 
            variant="outlined" 
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDeleteClient}
          >
            Delete Client
          </Button>
        </Box>
      </Box>

      {/* Success message */}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {successMessage}
        </Alert>
      )}

      {/* Client Details Card */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar 
                sx={{ width: 120, height: 120, mb: 2, fontSize: '3rem' }}
              >
                {clientData.name ? clientData.name[0].toUpperCase() : 'C'}
              </Avatar>
              <Typography variant="h5" gutterBottom align="center">
                {clientData.name || 'Unnamed Client'}
              </Typography>
              <Chip 
                label={clientData.status || 'Active'} 
                color="primary" 
                sx={{ mt: 1 }}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={8}>
            <Card variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                  Contact Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Email
                    </Typography>
                    <Typography variant="body1">
                      {clientData.email || 'Not provided'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Phone
                    </Typography>
                    <Typography variant="body1">
                      {clientData.phone || 'Not provided'}
                    </Typography>
                  </Grid>
                  {clientData.address && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Address
                      </Typography>
                      <Typography variant="body1">
                        {clientData.address}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>

            {clientData.notes && (
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    Notes
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="body1">
                    {clientData.notes}
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>
      </Paper>

      {/* Client Properties Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">
            Client Properties
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => navigate(`/add-property?client_id=${clientId}`)}
          >
            Add Property
          </Button>
        </Box>

        {/* Properties List */}
        {!clientData.properties || clientData.properties.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              No properties for this client yet
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Add properties to this client to help them find their dream home.
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={() => navigate(`/add-property?client_id=${clientId}`)}
              sx={{ mt: 2 }}
            >
              Add Property
            </Button>
          </Paper>
        ) : (
          <List>
            {clientData.properties.map((property) => {
              const propertyId = property.id || property.property_id || property._id;
              
              return (
                <Paper 
                  key={propertyId || `property-${Math.random()}`}
                  elevation={1} 
                  sx={{ mb: 2 }}
                >
                  <ListItem 
                    sx={{ 
                      borderLeft: '4px solid',
                      borderColor: 'primary.main' 
                    }}
                    secondaryAction={
                      <Box>
                        <IconButton 
                          edge="end" 
                          aria-label="remove"
                          onClick={() => handleRemoveProperty(propertyId)}
                          title="Remove property from client"
                        >
                          <LinkOffIcon />
                        </IconButton>
                        <IconButton 
                          edge="end" 
                          aria-label="edit"
                          onClick={() => navigate(`/properties/${propertyId}/edit`)}
                          title="Edit property"
                          sx={{ ml: 1 }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Box>
                    }
                  >
                    <Avatar 
                      variant="rounded"
                      src={property.main_image_url || property.image_url}
                      sx={{ width: 60, height: 60, mr: 2 }}
                    >
                      <HomeIcon />
                    </Avatar>
                    <ListItemText 
                      primary={
                        <Typography variant="subtitle1">
                          {property.title || 'Untitled Property'}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography component="span" variant="body2" color="text.primary">
                            ${property.price ? property.price.toLocaleString() : 'Price not specified'}
                          </Typography>
                          <Typography variant="body2" display="block">
                            {property.city || ''} {property.parish?.name ? `, ${property.parish.name}` : ''}
                          </Typography>
                          {property.bedrooms && property.bathrooms && (
                            <Typography variant="body2" color="text.secondary">
                              {property.bedrooms} {property.bedrooms === 1 ? 'Bed' : 'Beds'} • {property.bathrooms} {property.bathrooms === 1 ? 'Bath' : 'Baths'} 
                              {property.area_sqft ? ` • ${property.area_sqft.toLocaleString()} sqft` : ''}
                            </Typography>
                          )}
                        </>
                      }
                    />
                  </ListItem>
                </Paper>
              );
            })}
          </List>
        )}
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={cancelDeleteClient}
      >
        <DialogTitle>Delete Client</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this client? This action cannot be undone, and all associations with properties will be removed.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDeleteClient}>Cancel</Button>
          <Button onClick={confirmDeleteClient} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ClientDetails;