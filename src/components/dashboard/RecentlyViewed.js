// Enhanced RecentlyViewedProperties.js implementation

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  IconButton,
  Divider,
  CircularProgress,
  Alert,
  Tooltip,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import HotelIcon from '@mui/icons-material/Hotel';
import BathtubIcon from '@mui/icons-material/Bathtub';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ShareIcon from '@mui/icons-material/Share';
import { useSnackbar } from 'notistack';
import { useAuth } from '../../hooks/useAuth';
import {useLocation } from 'react-router-dom';


// Import API functions
import { 
  getRecentlyViewedProperties, 
  clearRecentlyViewed, 
  removeFromRecentlyViewed 
} from '../../services/userService';
import { saveProperty, unsaveProperty } from '../../api/properties';
import { logPropertyInteraction } from '../../api/recommendations';

// Format price for display
const formatPrice = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'JMD',
    maximumFractionDigits: 0
  }).format(value);
};

// Format time elapsed
const formatTimeElapsed = (timestamp) => {
  if (!timestamp) return 'Recently';
  
  const now = new Date();
  const viewedTime = new Date(timestamp);
  const diffMs = now - viewedTime;
  
  // Convert to seconds, minutes, hours, days
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffDays > 0) {
    return diffDays === 1 ? 'Yesterday' : `${diffDays} days ago`;
  } else if (diffHours > 0) {
    return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  } else if (diffMins > 0) {
    return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
  } else {
    return 'Just now';
  }
};

const RecentlyViewedProperties = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  
  // State
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savedPropertyIds, setSavedPropertyIds] = useState(new Set());
  
  // Menu state
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [currentPropertyId, setCurrentPropertyId] = useState(null);
  
  // Load recently viewed properties
  useEffect(() => {
    const fetchRecentlyViewed = async () => {
      if (!isAuthenticated) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await getRecentlyViewedProperties();
        
        // Normalize response data
        let propertiesData = [];
        if (response?.properties && Array.isArray(response.properties)) {
          propertiesData = response.properties;
        } else if (Array.isArray(response)) {
          propertiesData = response;
        }
        
        setProperties(propertiesData);
        
        // Extract saved property IDs
        const savedIds = new Set();
        propertiesData.forEach(property => {
          if (property.is_saved) {
            savedIds.add(property.property_id || property.id);
          }
        });
        setSavedPropertyIds(savedIds);
      } catch (err) {
        console.error('Error fetching recently viewed properties:', err);
        setError('Failed to load your recently viewed properties. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecentlyViewed();
  }, [isAuthenticated]);
  
  // Handle clear all
  const handleClearAll = async () => {
    try {
      await clearRecentlyViewed();
      setProperties([]);
      enqueueSnackbar('Recently viewed history cleared', { variant: 'success' });
    } catch (err) {
      console.error('Error clearing recently viewed properties:', err);
      enqueueSnackbar('Failed to clear history', { variant: 'error' });
    }
  };
  
  // Handle remove individual
  const handleRemoveItem = async (propertyId) => {
    // Update local state immediately for better UX
    setProperties(prevProperties => 
      prevProperties.filter(property => (property.property_id || property.id) !== propertyId)
    );
    
    try {
      await removeFromRecentlyViewed(propertyId);
      enqueueSnackbar('Property removed from history', { variant: 'success' });
    } catch (err) {
      console.error('Error removing property from history:', err);
      enqueueSnackbar('Failed to remove from history', { variant: 'error' });
      
      // Revert the change on error
      const fetchRecentlyViewed = async () => {
        const response = await getRecentlyViewedProperties();
        
        let propertiesData = [];
        if (response?.properties && Array.isArray(response.properties)) {
          propertiesData = response.properties;
        } else if (Array.isArray(response)) {
          propertiesData = response;
        }
        
        setProperties(propertiesData);
      };
      fetchRecentlyViewed();
    } finally {
      setMenuAnchorEl(null);
      setCurrentPropertyId(null);
    }
  };
  
  // Handle save/unsave
  const handleSaveToggle = async (propertyId, isSaved) => {
    if (!isAuthenticated) {
      enqueueSnackbar('Please log in to save properties', { variant: 'info' });
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    
    try {
      if (isSaved) {
        await unsaveProperty(propertyId);
        // Log this interaction
        logPropertyInteraction(propertyId, 'unsave');
        setSavedPropertyIds(prev => {
          const updated = new Set(prev);
          updated.delete(propertyId);
          return updated;
        });
        enqueueSnackbar('Property removed from saved list', { variant: 'success' });
      } else {
        await saveProperty(propertyId);
        // Log this interaction
        logPropertyInteraction(propertyId, 'save');
        setSavedPropertyIds(prev => {
          const updated = new Set(prev);
          updated.add(propertyId);
          return updated;
        });
        enqueueSnackbar('Property saved successfully', { variant: 'success' });
      }
    } catch (err) {
      console.error('Error toggling saved property:', err);
      enqueueSnackbar('Failed to update saved properties', { variant: 'error' });
    }
  };
  
  // Handle menu open
  const handleMenuOpen = (event, propertyId) => {
    setMenuAnchorEl(event.currentTarget);
    setCurrentPropertyId(propertyId);
  };
  
  // Handle property view
  const handleViewProperty = async (propertyId) => {
    // Log interaction for ML training
    if (isAuthenticated) {
      await logPropertyInteraction(propertyId, 'view', {
        source: 'recently_viewed'
      });
    }
    navigate(`/properties/${propertyId}`);
  };
  
  // Property card component
  const PropertyCard = ({ property }) => {
    const propertyId = property.property_id || property.id;
    const isSaved = savedPropertyIds.has(propertyId);
    
    return (
      <Card 
        sx={{ 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
          },
          position: 'relative',
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        <Box sx={{ position: 'relative' }}>
          <CardMedia
            component="img"
            height="200"
            image={property.image_url || property.main_image_url || property.images?.[0]?.url || 'https://via.placeholder.com/400x200?text=Property+Image'}
            alt={property.title}
            sx={{ objectFit: 'cover' }}
          />
          
          <IconButton
            aria-label="property menu"
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              bgcolor: 'rgba(255, 255, 255, 0.8)',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' }
            }}
            onClick={(e) => handleMenuOpen(e, propertyId)}
          >
            <MoreVertIcon />
          </IconButton>
          
          <IconButton
            aria-label={isSaved ? "remove from favorites" : "add to favorites"}
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              bgcolor: 'rgba(255, 255, 255, 0.8)',
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' }
            }}
            onClick={() => handleSaveToggle(propertyId, isSaved)}
          >
            {isSaved ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
          </IconButton>
          
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              bgcolor: 'rgba(0, 0, 0, 0.6)',
              color: 'white',
              p: 1
            }}
          >
            <Typography variant="h6">
              {formatPrice(property.price || 0)}
            </Typography>
          </Box>
        </Box>
        
        <CardContent sx={{ flexGrow: 1, p: 2 }}>
          <Typography variant="h6" gutterBottom noWrap>
            {property.title || 'Unlisted Property'}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <LocationOnIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
            <Typography variant="body2" color="text.secondary" noWrap>
              {property.parish?.name ? 
                `${property.city || ''} ${property.city ? ',' : ''} ${property.parish.name}` : 
                property.location || 'Jamaica'}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <HotelIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
              <Typography variant="body2">
                {property.bedrooms || 0} Beds
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <BathtubIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
              <Typography variant="body2">
                {property.bathrooms || 0} Baths
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ mt: 2 }}>
            <Divider sx={{ mb: 1 }} />
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AccessTimeIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
              <Typography variant="body2" color="text.secondary">
                Viewed: {formatTimeElapsed(property.viewed_at)}
              </Typography>
            </Box>
          </Box>
        </CardContent>
        
        <CardActions sx={{ p: 2, pt: 0 }}>
          <Button
            variant="contained"
            fullWidth
            onClick={() => handleViewProperty(propertyId)}
            startIcon={<VisibilityIcon />}
          >
            View Details
          </Button>
        </CardActions>
      </Card>
    );
  };
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">
          Recently Viewed Properties
        </Typography>
        
        {properties.length > 0 && (
          <Tooltip title="Clear viewing history">
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleClearAll}
              startIcon={<DeleteIcon />}
            >
              Clear All
            </Button>
          </Tooltip>
        )}
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : properties.length === 0 ? (
        <Alert severity="info" sx={{ mb: 3 }}>
          You haven't viewed any properties yet. Start exploring properties to build your history.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {properties.map((property) => (
            <Grid item xs={12} sm={6} md={4} key={property.property_id || property.id}>
              <PropertyCard property={property} />
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Property Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={() => setMenuAnchorEl(null)}
      >
        <MenuItem onClick={() => {
          handleViewProperty(currentPropertyId);
          setMenuAnchorEl(null);
        }}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          const isSaved = savedPropertyIds.has(currentPropertyId);
          handleSaveToggle(currentPropertyId, isSaved);
          setMenuAnchorEl(null);
        }}>
          <ListItemIcon>
            {savedPropertyIds.has(currentPropertyId) 
              ? <FavoriteIcon fontSize="small" color="error" /> 
              : <FavoriteBorderIcon fontSize="small" />
            }
          </ListItemIcon>
          <ListItemText>
            {savedPropertyIds.has(currentPropertyId) ? 'Remove from Saved' : 'Add to Saved'}
          </ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          // Here you would implement share functionality
          // For now, just close the menu
          setMenuAnchorEl(null);
          enqueueSnackbar('Share functionality coming soon', { variant: 'info' });
        }}>
          <ListItemIcon>
            <ShareIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Share</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleRemoveItem(currentPropertyId)}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText sx={{ color: 'error.main' }}>Remove from History</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default RecentlyViewedProperties;