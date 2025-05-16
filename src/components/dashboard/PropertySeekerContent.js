// src/components/dashboard/PropertySeekerContent.js
import React, { useState, useEffect, useReducer } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Alert,
  CircularProgress,
  Divider,
  TextField,
  Avatar
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FavoriteIcon from '@mui/icons-material/Favorite';
import TuneIcon from '@mui/icons-material/Tune';
import { useAuth } from '../../hooks/useAuth';
import WelcomeGreeting from './WelcomeGreeting';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

// Import components
import SavedProperties from './SavedProperties';
import UserPreferences from './UserPreferences';
import RecentlyViewedProperties from './RecentlyViewed';

// Import API functions 
import { getSavedProperties, getRecentlyViewedProperties } from '../../api/properties';
import { getPersonalizedRecommendations } from '../../api/recommendations';

const PropertySeekerContent = ({ activeTab, user }) => {
  const navigate = useNavigate();
  const { isAuthenticated, updateUserProfile } = useAuth();
  
  const [, forceUpdate] = useReducer(x => x + 1, 0);

  // Shared state for all tabs
  const [savedProperties, setSavedProperties] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState({
    saved: false,
    viewed: false,
    recommended: false,
    preferences: false
  });
  const [error, setError] = useState({
    saved: null,
    viewed: null,
    recommended: null,
    preferences: null
  });

  // Profile tab state
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    bio: '',
    profileImage: null,
    profileImagePreview: null
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState(null);

  // Update profile data when user changes
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.first_name || user.firstName || user.name || '',
        lastName: user.last_name || user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        bio: user.bio || '',
        profileImage: null,
        profileImagePreview: user.profile_image || user.profileImage || null
      });
    }
  }, [user]);

  // Load data based on active tab
  useEffect(() => {
    if (!isAuthenticated) return;

    if (activeTab === 'dashboard' || activeTab === 'saved') {
      // Fetch saved properties
      const fetchSavedProperties = async () => {
        setLoading(prev => ({ ...prev, saved: true }));
        try {
          const response = await getSavedProperties();
          setSavedProperties(response.properties || response || []);
        } catch (err) {
          console.error('Error fetching saved properties:', err);
          setError(prev => ({ ...prev, saved: 'Failed to load saved properties.' }));
        } finally {
          setLoading(prev => ({ ...prev, saved: false }));
        }
      };
      
      fetchSavedProperties();
    }

    if (activeTab === 'dashboard' || activeTab === 'recent') {
      // Fetch recently viewed properties
      const fetchRecentlyViewed = async () => {
        setLoading(prev => ({ ...prev, viewed: true }));
        try {
          const response = await getRecentlyViewedProperties();
          setRecentlyViewed(response.properties || response || []);
        } catch (err) {
          console.error('Error fetching recently viewed properties:', err);
          setError(prev => ({ ...prev, viewed: 'Failed to load recently viewed properties.' }));
        } finally {
          setLoading(prev => ({ ...prev, viewed: false }));
        }
      };
      
      fetchRecentlyViewed();
    }

    if (activeTab === 'dashboard') {
      // Fetch recommended properties
      const fetchRecommendations = async () => {
        setLoading(prev => ({ ...prev, recommended: true }));
        try {
          // Get user ID from authenticated user
          const userId = user?.id || user?.user_id;
          
          // Default weights if the user hasn't set preferences yet
          const defaultWeights = {
            price: 5,
            location: 5,
            size: 5,
            amenities: 5
          };
          
          const response = await getPersonalizedRecommendations(
            userId,
            {},  // empty filters to get general recommendations
            defaultWeights,
            6 // limit to 6 recommendations for dashboard
          );
          
          setRecommendations(response.recommendations || response || []);
        } catch (err) {
          console.error('Error fetching recommendations:', err);
          setError(prev => ({ ...prev, recommended: 'Failed to load recommendations.' }));
        } finally {
          setLoading(prev => ({ ...prev, recommended: false }));
        }
      };
      
      fetchRecommendations();
    }
  }, [activeTab, isAuthenticated, user]);

  // Handle profile changes
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Create preview URL for display
      const previewUrl = URL.createObjectURL(file);
      
      // Update profile data with image
      setProfileData(prev => ({
        ...prev,
        profileImage: file,
        profileImagePreview: previewUrl
      }));
    }
  };

  // Handle profile save
  const handleSaveProfile = async () => {
    setProfileLoading(true);
    setProfileError(null);
    
    try {
      // Use FormData for proper file upload handling
      const formData = new FormData();
      
      // Append text fields
      formData.append('first_name', profileData.firstName);
      formData.append('last_name', profileData.lastName);
      formData.append('phone', profileData.phone);
      formData.append('address', profileData.address);
      formData.append('bio', profileData.bio);
      
      // Append image file if available
      if (profileData.profileImage) {
        formData.append('profile_image', profileData.profileImage);
      }
      
      // Call the auth context function to update the profile
      const result = await updateUserProfile(formData);
      
      // Show success message
      setProfileSuccess(true);
      setEditMode(false);
      
      // Force a re-render to ensure updated data is displayed
      forceUpdate();
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setProfileSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setProfileError('Failed to update profile. Please try again.');
    } finally {
      setProfileLoading(false);
    }
  };

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
                <strong>Account Type:</strong> Property Seeker
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>Email:</strong> {user?.email || 'Not available'}
              </Typography>

              <Button
                variant="outlined"
                onClick={() => navigate('/dashboard/profile')}
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
                  startIcon={<SearchIcon />}
                  onClick={() => navigate('/search')}
                >
                  Search Properties
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<FavoriteIcon />}
                  onClick={() => navigate('/dashboard/saved')}
                >
                  View Saved Properties
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<TuneIcon />}
                  onClick={() => navigate('/dashboard/preferences')}
                >
                  Update Preferences
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Recommended Properties Section */}
        <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
          Recommended For You
        </Typography>
        
        {error.recommended && <Alert severity="error" sx={{ mb: 2 }}>{error.recommended}</Alert>}
        
        {loading.recommended ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress />
          </Box>
        ) : recommendations.length > 0 ? (
          <Box sx={{ mb: 4 }}>
            <Grid container spacing={3}>
              {recommendations.slice(0, 3).map((property) => (
                <Grid item xs={12} sm={6} md={4} key={property.property_id || property.id}>
                  <PropertyCard property={property} onView={() => navigate(`/properties/${property.property_id || property.id}`)} />
                </Grid>
              ))}
            </Grid>
            
            {recommendations.length > 3 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Button variant="outlined" onClick={() => navigate('/search?tab=recommendations')}>
                  View All Recommendations
                </Button>
              </Box>
            )}
          </Box>
        ) : (
          <Alert severity="info" sx={{ mb: 4 }}>
            Update your preferences to see personalized property recommendations.
          </Alert>
        )}

        {/* Saved Properties Section */}
        <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
          Your Saved Properties
        </Typography>
        
        {error.saved && <Alert severity="error" sx={{ mb: 2 }}>{error.saved}</Alert>}
        
        {loading.saved ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress />
          </Box>
        ) : savedProperties.length > 0 ? (
          <Box sx={{ mb: 4 }}>
            <Grid container spacing={3}>
              {savedProperties.slice(0, 3).map((property) => (
                <Grid item xs={12} sm={6} md={4} key={property.property_id || property.id}>
                  <PropertyCard property={property} onView={() => navigate(`/properties/${property.property_id || property.id}`)} />
                </Grid>
              ))}
            </Grid>
            
            {savedProperties.length > 3 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Button variant="outlined" onClick={() => navigate('/dashboard/saved')}>
                  View All Saved Properties
                </Button>
              </Box>
            )}
          </Box>
        ) : (
          <Alert severity="info" sx={{ mb: 4 }}>
            You haven't saved any properties yet. Browse properties and click the heart icon to save them.
          </Alert>
        )}
        
        {/* Recently Viewed Section */}
        <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
          Recently Viewed
        </Typography>
        
        {error.viewed && <Alert severity="error" sx={{ mb: 2 }}>{error.viewed}</Alert>}
        
        {loading.viewed ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress />
          </Box>
        ) : recentlyViewed.length > 0 ? (
          <Box sx={{ mb: 4 }}>
            <Grid container spacing={3}>
              {recentlyViewed.slice(0, 3).map((property) => (
                <Grid item xs={12} sm={6} md={4} key={property.property_id || property.id}>
                  <PropertyCard property={property} onView={() => navigate(`/properties/${property.property_id || property.id}`)} />
                </Grid>
              ))}
            </Grid>
            
            {recentlyViewed.length > 3 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Button variant="outlined" onClick={() => navigate('/dashboard/recent')}>
                  View All Recently Viewed
                </Button>
              </Box>
            )}
          </Box>
        ) : (
          <Alert severity="info">
            You haven't viewed any properties yet. Start exploring properties to see your history.
          </Alert>
        )}
      </Box>
    );
  }

  // Saved Properties Tab
  if (activeTab === 'saved') {
    return (
      <SavedProperties />
    );
  }

  // Preferences Tab
  if (activeTab === 'preferences') {
    return (
      <UserPreferences />
    );
  }

  // Recently Viewed Tab
  if (activeTab === 'recent') {
    return (
      <RecentlyViewedProperties />
    );
  }

  // Profile Tab
  if (activeTab === 'profile') {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Your Profile
        </Typography>

        <Paper elevation={2} sx={{ p: 4, mb: 4 }}>
          {profileSuccess && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Profile updated successfully!
            </Alert>
          )}

          {profileError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {profileError}
            </Alert>
          )}

          <Grid container spacing={4}>
            {/* Profile Image */}
            <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar
                sx={{
                  width: 150,
                  height: 150,
                  bgcolor: 'primary.main',
                  fontSize: '3rem'
                }}
                src={profileData.profileImagePreview || user?.profile_image || user?.profileImage}
              >
                {profileData.firstName?.charAt(0) || 'U'}
              </Avatar>

              {!editMode ? (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setEditMode(true)}
                  startIcon={<EditIcon />}
                  sx={{ mt: 3 }}
                >
                  Edit Profile
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  component="label"
                  sx={{ mt: 3 }}
                >
                  Upload Photo
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </Button>
              )}
            </Grid>

            {/* Profile Details */}
            <Grid item xs={12} md={8}>
              <Typography variant="h6" gutterBottom>
                Profile Information
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  {!editMode ? (
                    <>
                      <Typography variant="subtitle2" color="text.secondary">First Name</Typography>
                      <Typography variant="body1">{profileData.firstName || 'Not provided'}</Typography>
                    </>
                  ) : (
                    <TextField
                      fullWidth
                      label="First Name"
                      name="firstName"
                      value={profileData.firstName}
                      onChange={handleProfileChange}
                    />
                  )}
                </Grid>

                <Grid item xs={12} md={6}>
                  {!editMode ? (
                    <>
                      <Typography variant="subtitle2" color="text.secondary">Last Name</Typography>
                      <Typography variant="body1">{profileData.lastName || 'Not provided'}</Typography>
                    </>
                  ) : (
                    <TextField
                      fullWidth
                      label="Last Name"
                      name="lastName"
                      value={profileData.lastName}
                      onChange={handleProfileChange}
                    />
                  )}
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                  <Typography variant="body1">{profileData.email}</Typography>
                </Grid>

                <Grid item xs={12}>
                  {!editMode ? (
                    <>
                      <Typography variant="subtitle2" color="text.secondary">Phone</Typography>
                      <Typography variant="body1">{profileData.phone || 'Not provided'}</Typography>
                    </>
                  ) : (
                    <TextField
                      fullWidth
                      label="Phone"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleProfileChange}
                    />
                  )}
                </Grid>

                <Grid item xs={12}>
                  {!editMode ? (
                    <>
                      <Typography variant="subtitle2" color="text.secondary">Address</Typography>
                      <Typography variant="body1">{profileData.address || 'Not provided'}</Typography>
                    </>
                  ) : (
                    <TextField
                      fullWidth
                      label="Address"
                      name="address"
                      value={profileData.address}
                      onChange={handleProfileChange}
                    />
                  )}
                </Grid>

                <Grid item xs={12}>
                  {!editMode ? (
                    <>
                      <Typography variant="subtitle2" color="text.secondary">Bio</Typography>
                      <Typography variant="body1">{profileData.bio || 'No bio available'}</Typography>
                    </>
                  ) : (
                    <TextField
                      fullWidth
                      label="Bio"
                      name="bio"
                      value={profileData.bio}
                      onChange={handleProfileChange}
                      multiline
                      rows={4}
                    />
                  )}
                </Grid>

                {editMode && (
                  <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setEditMode(false);
                        setProfileError(null);
                        setProfileSuccess(false);
                      }}
                      startIcon={<CancelIcon />}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleSaveProfile}
                      startIcon={profileLoading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                      disabled={profileLoading}
                    >
                      {profileLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </Grid>
                )}
              </Grid>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    );
  }

  // Simple PropertyCard component for dashboard
  const PropertyCard = ({ property, onView }) => (
    <Paper elevation={2} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ height: 140, overflow: 'hidden', mb: 2 }}>
        <img 
          src={property.image_url || property.main_image_url || '/placeholder-property.jpg'} 
          alt={property.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </Box>
      <Typography variant="h6" gutterBottom noWrap>
        {property.title || 'Unlisted Property'}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {property.location || property.parish || 'Jamaica'}
      </Typography>
      <Typography variant="h6" color="primary.main" sx={{ mt: 'auto', mb: 2 }}>
        ${property.price ? property.price.toLocaleString() : 'N/A'}
      </Typography>
      <Button 
        variant="contained" 
        fullWidth
        onClick={onView}
      >
        View Details
      </Button>
    </Paper>
  );

  // Fallback for unknown tab
  return (
    <Box>
      <Alert severity="warning">
        Unknown tab selected. Please try another option.
      </Alert>
    </Box>
  );
};

export default PropertySeekerContent;