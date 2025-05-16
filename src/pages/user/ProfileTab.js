import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  TextField,
  Button,
  Avatar,
  Divider,
  Container,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  IconButton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import { useAuth } from '../../hooks/useAuth';

// Styled components
const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: 120,
  height: 120,
  border: `4px solid ${theme.palette.background.paper}`,
  boxShadow: theme.shadows[2],
}));

const parishes = [
  'Kingston', 'St. Andrew', 'St. Catherine', 'Clarendon',
  'Manchester', 'St. Elizabeth', 'Westmoreland', 'Hanover',
  'St. James', 'Trelawny', 'St. Ann', 'St. Mary',
  'Portland', 'St. Thomas'
];

const ProfileTab = () => {
  const { user, updateUserProfile, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      const profile = user.profile || {};
      setFormData({
        full_name: profile.full_name || '',
        phone_number: profile.phone_number || '',
        address: profile.address || '',
        parish: profile.parish || '',
        occupation: profile.occupation || '',
        company_name: profile.company_name || '',
        bio: profile.bio || '',
        profile_image: null
      });
      if (profile.profile_image) {
        setPreviewImage(profile.profile_image);
      }
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        profile_image: file
      }));
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'profile_image' && value instanceof File) {
          formDataToSend.append(key, value);
        } else {
          formDataToSend.append(key, value);
        }
      });

      await updateUserProfile(formDataToSend);
      await refreshUser();
      setIsEditing(false);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      console.error(err);
      setError('Failed to update profile. Try again.');
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (user) {
      const profile = user.profile || {};
      setFormData({
        full_name: profile.full_name || '',
        phone_number: profile.phone_number || '',
        address: profile.address || '',
        parish: profile.parish || '',
        occupation: profile.occupation || '',
        company_name: profile.company_name || '',
        bio: profile.bio || '',
        profile_image: null
      });
      if (profile.profile_image) {
        setPreviewImage(profile.profile_image);
      }
    }
  };

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
      )}

      <Typography variant="h4" gutterBottom>
        {isEditing ? 'Edit Your Profile' : 'Your Profile'}
      </Typography>

      <Paper elevation={2} sx={{ p: 4, borderRadius: 2 }}>
        <Grid container spacing={4}>
          {/* Avatar and Upload */}
          <Grid item xs={12} md={3} sx={{ textAlign: 'center' }}>
            <Box sx={{ position: 'relative', display: 'inline-block' }}>
              <ProfileAvatar
                src={previewImage}
                alt={formData.full_name}
              >
                {!previewImage && formData.full_name?.charAt(0)}
              </ProfileAvatar>
              {isEditing && (
                <>
                  <input
                    type="file"
                    accept="image/*"
                    id="profile-image-upload"
                    style={{ display: 'none' }}
                    onChange={handleImageChange}
                  />
                  <label htmlFor="profile-image-upload">
                    <IconButton
                      color="primary"
                      component="span"
                      sx={{
                        bgcolor: 'background.paper',
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        boxShadow: 1
                      }}
                    >
                      <PhotoCamera />
                    </IconButton>
                  </label>
                </>
              )}
            </Box>

            {!isEditing && (
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => setIsEditing(true)}
                sx={{ mt: 2 }}
              >
                Edit Profile
              </Button>
            )}
          </Grid>

          {/* Profile Details */}
          <Grid item xs={12} md={9}>
            <Grid container spacing={3}>
              {/* Full Name */}
              <Grid item xs={12}>
                {isEditing ? (
                  <TextField
                    fullWidth
                    label="Full Name"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                  />
                ) : (
                  <>
                    <Typography variant="h6">Full Name</Typography>
                    <Typography>{formData.full_name || 'Not set'}</Typography>
                  </>
                )}
              </Grid>

              {/* Phone Number */}
              <Grid item xs={12} md={6}>
                {isEditing ? (
                  <TextField
                    fullWidth
                    label="Phone Number"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                  />
                ) : (
                  <>
                    <Typography variant="h6">Phone Number</Typography>
                    <Typography>{formData.phone_number || 'Not set'}</Typography>
                  </>
                )}
              </Grid>

              {/* Parish */}
              <Grid item xs={12} md={6}>
                {isEditing ? (
                  <FormControl fullWidth>
                    <InputLabel>Parish</InputLabel>
                    <Select
                      name="parish"
                      value={formData.parish}
                      onChange={handleChange}
                    >
                      {parishes.map((parish) => (
                        <MenuItem key={parish} value={parish}>{parish}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : (
                  <>
                    <Typography variant="h6">Parish</Typography>
                    <Typography>{formData.parish || 'Not set'}</Typography>
                  </>
                )}
              </Grid>

              {/* Address */}
              <Grid item xs={12}>
                {isEditing ? (
                  <TextField
                    fullWidth
                    label="Address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                  />
                ) : (
                  <>
                    <Typography variant="h6">Address</Typography>
                    <Typography>{formData.address || 'Not set'}</Typography>
                  </>
                )}
              </Grid>

              {/* Occupation */}
              <Grid item xs={12}>
                {isEditing ? (
                  <TextField
                    fullWidth
                    label="Occupation"
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleChange}
                  />
                ) : (
                  <>
                    <Typography variant="h6">Occupation</Typography>
                    <Typography>{formData.occupation || 'Not set'}</Typography>
                  </>
                )}
              </Grid>

              {/* Company Name */}
              {(user.active_user_type === 'property_owner' || user.active_user_type === 'property_agent') && (
                <Grid item xs={12}>
                  {isEditing ? (
                    <TextField
                      fullWidth
                      label="Company Name"
                      name="company_name"
                      value={formData.company_name}
                      onChange={handleChange}
                    />
                  ) : (
                    <>
                      <Typography variant="h6">Company Name</Typography>
                      <Typography>{formData.company_name || 'Not set'}</Typography>
                    </>
                  )}
                </Grid>
              )}

              {/* Bio */}
              <Grid item xs={12}>
                {isEditing ? (
                  <TextField
                    fullWidth
                    label="Bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    multiline
                    rows={3}
                  />
                ) : (
                  <>
                    <Typography variant="h6">Bio</Typography>
                    <Typography>{formData.bio || 'Not set'}</Typography>
                  </>
                )}
              </Grid>
            </Grid>

            {/* Action Buttons */}
            {isEditing && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4, gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                  onClick={handleSave}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </Box>
            )}
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default ProfileTab;
