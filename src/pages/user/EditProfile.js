// src/pages/user/EditProfile.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  TextField,
  Button,
  Avatar,
  IconButton,
  Divider,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Container
} from '@mui/material';
import { styled } from '@mui/material/styles';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

// List of parishes in Jamaica
const parishes = [
  'Kingston', 'St. Andrew', 'St. Catherine', 'Clarendon', 
  'Manchester', 'St. Elizabeth', 'Westmoreland', 'Hanover', 
  'St. James', 'Trelawny', 'St. Ann', 'St. Mary', 
  'Portland', 'St. Thomas'
];

// Styled components
const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: 120,
  height: 120,
  border: `4px solid ${theme.palette.background.paper}`,
  boxShadow: theme.shadows[2],
}));

const UploadInput = styled('input')({
  display: 'none',
});

const EditProfile = () => {
  const { user, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    address: '',
    parish: '',
    occupation: '',
    bio: '',
    company_name: '',
    profile_image: null
  });
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  
  // Load user data on component mount
  useEffect(() => {
    if (user) {
      // Extract profile data from user object
      const profile = user.profile || {};
      
      setFormData({
        full_name: profile.full_name || '',
        phone_number: profile.phone_number || '',
        address: profile.address || '',
        parish: profile.parish || '',
        occupation: profile.occupation || '',
        bio: profile.bio || '',
        company_name: profile.company_name || '',
        profile_image: null
      });
      
      // Set preview image if user has a profile image
      if (profile.profile_image) {
        setPreviewImage(profile.profile_image);
      }
    }
  }, [user]);
  
  // Handle text input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle image upload
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Create a preview URL
      const previewUrl = URL.createObjectURL(file);
      setPreviewImage(previewUrl);
      
      // Save file to state
      setFormData(prev => ({
        ...prev,
        profile_image: file
      }));
    }
  };
  
  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Create form data for file upload
      const formDataObj = new FormData();
      
      // Add all fields to FormData
      Object.entries(formData).forEach(([key, value]) => {
        // Only add the image if it's been selected
        if (key === 'profile_image' && value) {
          formDataObj.append(key, value);
        } 
        // Add all other fields that have values
        else if (value !== null && value !== undefined && key !== 'profile_image') {
          formDataObj.append(key, value);
        }
      });
      
      // Update profile via auth context
      await updateUserProfile(formDataObj);
      
      // Navigate back to dashboard profile tab with success message
      navigate('/dashboard/profile', { 
        state: { success: 'Profile updated successfully' } 
      });
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Cancel edit and go back
  const handleCancel = () => {
    navigate('/dashboard/profile');
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Edit Your Profile
      </Typography>
      
      <Paper elevation={2} sx={{ p: 4, borderRadius: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={4}>
            {/* Profile Image */}
            <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box position="relative">
                <ProfileAvatar 
                  src={previewImage}
                  alt={formData.full_name}
                >
                  {!previewImage && formData.full_name?.charAt(0)}
                </ProfileAvatar>
                
                <Box position="absolute" bottom={0} right={0}>
                  <label htmlFor="upload-profile-image">
                    <UploadInput
                      accept="image/*"
                      id="upload-profile-image"
                      type="file"
                      onChange={handleImageChange}
                    />
                    <IconButton
                      color="primary"
                      aria-label="upload picture"
                      component="span"
                      sx={{
                        bgcolor: 'background.paper',
                        '&:hover': { bgcolor: 'background.default' }
                      }}
                    >
                      <PhotoCameraIcon />
                    </IconButton>
                  </label>
                </Box>
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Click the camera icon to upload a new profile picture
              </Typography>
            </Grid>
            
            {/* Profile Form */}
            <Grid item xs={12} md={8}>
              <Typography variant="h6" gutterBottom>
                Profile Information
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel id="parish-label">Parish</InputLabel>
                    <Select
                      labelId="parish-label"
                      id="parish"
                      name="parish"
                      value={formData.parish}
                      onChange={handleChange}
                      label="Parish"
                    >
                      <MenuItem value="">None</MenuItem>
                      {parishes.map(parish => (
                        <MenuItem key={parish} value={parish}>
                          {parish}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    multiline
                    rows={2}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Occupation"
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleChange}
                  />
                </Grid>
                
                {(user?.user_type === 'property_owner' || user?.user_type === 'agent') && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Company Name"
                      name="company_name"
                      value={formData.company_name}
                      onChange={handleChange}
                    />
                  </Grid>
                )}
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    multiline
                    rows={4}
                    placeholder="Tell us a bit about yourself..."
                  />
                </Grid>
                
                <Grid item xs={12} sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={handleCancel}
                    startIcon={<CancelIcon />}
                  >
                    Cancel
                  </Button>
                  
                  <Button
                    variant="contained"
                    type="submit"
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default EditProfile;