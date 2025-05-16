import React, { useState, useEffect } from 'react';
import { 
  Container, 
  TextField, 
  Button, 
  Typography, 
  Box, 
  Alert, 
  CircularProgress,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Divider,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondary,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import { createClient } from '../../api/clients';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import HomeIcon from '@mui/icons-material/Home';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useAuth } from '../../hooks/useAuth';

const AddClient = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [newClientId, setNewClientId] = useState(null);
  const [properties, setProperties] = useState([]);
  const [openPropertyDialog, setOpenPropertyDialog] = useState(false);

  // Check if user is an agent
  const isAgent = user?.active_user_type === 'agent';

  useEffect(() => {
    // If there's a client_id in URL query params, it means we returned from adding a property
    const queryParams = new URLSearchParams(window.location.search);
    const clientId = queryParams.get('client_id');
    const propertyAdded = queryParams.get('property_added');
    
    if (clientId && propertyAdded === 'true') {
      setNewClientId(clientId);
      setActiveStep(1); // Go to properties step
      // Fetch the newly added property details and add to properties list
      fetchClientProperties(clientId);
    }
  }, []);

  // Function to fetch client properties
  const fetchClientProperties = async (clientId) => {
    // In a real app, this would be an API call to get properties for this client
    console.log(`Fetching properties for client ${clientId}`);
    // For now, we'll just add a placeholder property
    setProperties([
      {
        id: `temp-${Date.now()}`,
        title: 'Recently Added Property',
        price: '5,000,000',
        address: 'Added via Property Form',
        bedrooms: 3,
        bathrooms: 2
      }
    ]);
  };

  if (!isAgent) {
    return (
      <Container maxWidth="sm" sx={{ py: 10, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>Access Denied</Typography>
        <Typography variant="body1" sx={{ mb: 4 }}>
          Only agents can add clients and properties on their behalf.
        </Typography>
        <Button variant="contained" component={Link} to="/">
          Go Back Home
        </Button>
      </Container>
    );
  }

  const steps = ['Client Information', 'Properties'];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleClientSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Validate client information
    if (!formData.name || !formData.email || !formData.phone) {
      setError('Please fill in all required client fields');
      setLoading(false);
      return;
    }
    
    try {
      const payload = {
        ...formData,
        properties: [] // We'll add properties separately
      };

      const response = await createClient(payload);
      console.log('Client creation response:', response);
      
      // Extract client ID from response
      let clientId;
      if (response.client && response.client.id) {
        clientId = response.client.id;
      } else if (response.id) {
        clientId = response.id;
      } else {
        // Fallback for testing
        clientId = `client-${Date.now()}`;
      }
      
      setNewClientId(clientId);
      handleNext(); // Move to properties step
    } catch (err) {
      console.error('Error creating client:', err);
      setError('Failed to create client. ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleAddPropertyQuick = () => {
    // Add a placeholder property - in a real app, you'd open a modal or form
    setProperties([
      ...properties,
      {
        id: `quick-${Date.now()}`,
        title: 'New Property',
        price: '',
        address: '',
        bedrooms: '',
        bathrooms: ''
      }
    ]);
    setOpenPropertyDialog(true);
  };

  const handleRemoveProperty = (index) => {
    const updated = [...properties];
    updated.splice(index, 1);
    setProperties(updated);
  };

  const handlePropertyFieldChange = (index, field, value) => {
    const newProperties = [...properties];
    newProperties[index][field] = value;
    setProperties(newProperties);
  };

  const handleAddExistingProperty = () => {
    // Navigate to PropertyForm with client_id parameter
    navigate(`/add-property?client_id=${newClientId}`);
  };

  const handleFinish = async () => {
    setLoading(true);
    setError(null);

    try {
      // In a real app, you would update the client with the properties here
      // For now, we'll just show a success message
      setSuccess(true);
      setTimeout(() => navigate('/manage-clients'), 2000);
    } catch (err) {
      console.error('Error updating client with properties:', err);
      setError('Failed to update client with properties. ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const renderClientForm = () => (
    <Paper sx={{ p: 4 }}>
      <Box component="form" onSubmit={handleClientSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <TextField 
          label="Client Name" 
          name="name" 
          value={formData.name} 
          onChange={handleChange} 
          fullWidth
          required 
        />
        <TextField 
          label="Email Address" 
          name="email" 
          type="email" 
          value={formData.email} 
          onChange={handleChange} 
          fullWidth
          required 
        />
        <TextField 
          label="Phone Number" 
          name="phone" 
          value={formData.phone} 
          onChange={handleChange}
          fullWidth 
          required 
        />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Continue to Properties'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );

  const renderPropertyQuickDialog = () => (
    <Dialog open={openPropertyDialog} onClose={() => setOpenPropertyDialog(false)} maxWidth="md" fullWidth>
      <DialogTitle>Quick Property Details</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              label="Property Title"
              fullWidth
              value={properties[properties.length - 1]?.title || ''}
              onChange={(e) => handlePropertyFieldChange(properties.length - 1, 'title', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Price (JMD)"
              fullWidth
              value={properties[properties.length - 1]?.price || ''}
              onChange={(e) => handlePropertyFieldChange(properties.length - 1, 'price', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Address"
              fullWidth
              value={properties[properties.length - 1]?.address || ''}
              onChange={(e) => handlePropertyFieldChange(properties.length - 1, 'address', e.target.value)}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Bedrooms"
              fullWidth
              type="number"
              value={properties[properties.length - 1]?.bedrooms || ''}
              onChange={(e) => handlePropertyFieldChange(properties.length - 1, 'bedrooms', e.target.value)}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Bathrooms"
              fullWidth
              type="number"
              value={properties[properties.length - 1]?.bathrooms || ''}
              onChange={(e) => handlePropertyFieldChange(properties.length - 1, 'bathrooms', e.target.value)}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpenPropertyDialog(false)}>Cancel</Button>
        <Button 
          variant="contained" 
          onClick={() => setOpenPropertyDialog(false)}
        >
          Add Property
        </Button>
      </DialogActions>
    </Dialog>
  );

  const renderPropertiesForm = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h6" gutterBottom>
          Properties for {formData.name}
        </Typography>
        <Divider sx={{ mb: 3 }} />

        {properties.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              No properties added yet
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button 
                variant="outlined" 
                startIcon={<AddIcon />} 
                onClick={handleAddPropertyQuick}
              >
                Quick Add Property
              </Button>
              <Button 
                variant="contained" 
                startIcon={<ArrowForwardIcon />} 
                onClick={handleAddExistingProperty}
              >
                Add Using Property Form
              </Button>
            </Box>
          </Box>
        ) : (
          <>
            <List>
              {properties.map((property, index) => (
                <Paper key={property.id} variant="outlined" sx={{ mb: 2, p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        {property.title || 'Unnamed Property'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {property.address || 'No address specified'}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                        <Chip 
                          size="small"
                          label={`J$ ${property.price || 'N/A'}`} 
                          color="primary" 
                        />
                        <Chip 
                          size="small"
                          label={`${property.bedrooms || '0'} bed`} 
                        />
                        <Chip 
                          size="small"
                          label={`${property.bathrooms || '0'} bath`} 
                        />
                      </Box>
                    </Box>
                    <Box>
                      <IconButton 
                        color="error"
                        onClick={() => handleRemoveProperty(index)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </Paper>
              ))}
            </List>
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 2, mt: 2 }}>
              <Button 
                variant="outlined" 
                startIcon={<AddIcon />} 
                onClick={handleAddPropertyQuick}
              >
                Quick Add Property
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<ArrowForwardIcon />} 
                onClick={handleAddExistingProperty}
              >
                Add Using Property Form
              </Button>
            </Box>
          </>
        )}
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        <Button onClick={handleBack}>
          Back to Client Details
        </Button>
        <Button 
          variant="contained" 
          onClick={handleFinish}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Finish'}
        </Button>
      </Box>
    </Box>
  );

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Add New Client</Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }}>Client created successfully! Redirecting...</Alert>}

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {activeStep === 0 ? (
        renderClientForm()
      ) : (
        renderPropertiesForm()
      )}

      {renderPropertyQuickDialog()}
    </Container>
  );
};

export default AddClient;