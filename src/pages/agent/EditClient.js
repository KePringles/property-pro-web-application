import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, 
  TextField, 
  Button, 
  Typography, 
  Box, 
  Alert, 
  CircularProgress,
  Paper,
  Grid,
  Divider,
  IconButton,
  InputAdornment
} from '@mui/material';
import { getClientById, updateClient } from '../../api/clients';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';

const EditClient = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    phone: '',
    notes: '',
    address: '',
    preferences: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const response = await getClientById(id);
        console.log('Client data for editing:', response);
        
        // Handle different response formats
        let clientData;
        if (response.data) {
          clientData = response.data;
        } else if (response.client) {
          clientData = response.client;
        } else {
          clientData = response;
        }
        
        // Initialize form with client data, with empty string fallbacks
        setFormData({
          name: clientData.name || '',
          email: clientData.email || '',
          phone: clientData.phone || '',
          notes: clientData.notes || '',
          address: clientData.address || '',
          preferences: clientData.preferences || ''
        });
      } catch (err) {
        console.error('Error fetching client data:', err);
        setError('Failed to fetch client data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchClient();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    
    try {
      // Input validation
      if (!formData.name || !formData.email) {
        throw new Error('Name and email are required fields.');
      }
      
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error('Please enter a valid email address.');
      }
      
      // Phone validation (optional field)
      if (formData.phone && !/^[+\d\s()-]{10,20}$/.test(formData.phone)) {
        throw new Error('Please enter a valid phone number.');
      }
      
      // Make API call to update client
      const result = await updateClient(id, formData);
      console.log('Update result:', result);
      
      setSuccess(true);
      
      // Navigate back to client details after successful update
      setTimeout(() => {
        navigate(`/clients/${id}`);
      }, 1500);
    } catch (err) {
      console.error('Error updating client:', err);
      setError(err.message || 'Failed to update client. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(`/clients/${id}`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton 
          edge="start" 
          onClick={handleCancel} 
          sx={{ mr: 2 }}
          aria-label="Back"
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4">Edit Client</Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Client updated successfully! Redirecting...
        </Alert>
      )}

      <Paper elevation={2} sx={{ p: 4 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                fullWidth
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                fullWidth
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                fullWidth
                placeholder="Client's address (optional)"
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Additional Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Property Preferences"
                name="preferences"
                value={formData.preferences}
                onChange={handleChange}
                multiline
                rows={3}
                fullWidth
                placeholder="Client's property preferences, budget range, etc."
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                multiline
                rows={4}
                fullWidth
                placeholder="Additional notes about the client"
              />
            </Grid>

            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Button
                variant="outlined"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={saving}
                startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default EditClient;