// src/components/properties/PropertyCard.js
import React, { useState } from 'react';
import {
  Card, CardMedia, CardContent, CardActions, Box, 
  Typography, Button, IconButton, Tooltip, Chip,
  Skeleton, LinearProgress, CircularProgress
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BathtubIcon from '@mui/icons-material/Bathtub';
import HotelIcon from '@mui/icons-material/Hotel';
import HomeIcon from '@mui/icons-material/Home';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import { useNavigate } from 'react-router-dom';
import { logPropertyInteraction } from '../../api/recommendations';

const PropertyCard = ({ 
  property, 
  isSaved = false, 
  onSaveToggle, 
  featured = false,
  showMatchScore = false,
  matchScoreField = 'match_score',
  loading = false 
}) => {
  const navigate = useNavigate();
  const [savingStatus, setSavingStatus] = useState({
    loading: false,
    error: null
  });
  
  // Helper function to format price
  const formatPrice = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'JMD',
      maximumFractionDigits: 0
    }).format(value || 0);
  };
  
  // Get property ID safely from various possible formats
  const getPropertyId = () => {
    return property?.property_id || property?.id || property?.prop_id;
  };
  
  // Get the property image URL
  const getPropertyImage = () => {
    return property?.image_url || 
           property?.main_image_url || 
           property?.image || 
           'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80';
  };
  
  // Get the property location
  const getPropertyLocation = () => {
    if (property?.city && property?.parish?.name) {
      return `${property.city}, ${property.parish.name}`;
    } else if (property?.city) {
      return property.city;
    } else if (property?.parish?.name) {
      return property.parish.name;
    } else if (property?.location) {
      return property.location;
    }
    return 'Jamaica';
  };
  
  // Calculate match score color based on value
  const getMatchScoreColor = (score) => {
    if (score >= 90) return 'success'; // Green
    if (score >= 70) return 'primary'; // Blue
    if (score >= 50) return 'warning'; // Orange
    return 'error'; // Red
  };
  
  // Handle view details click
  const handleViewDetails = () => {
    // Log the interaction for recommendation improvement
    const propertyId = getPropertyId();
    
    if (propertyId) {
      logPropertyInteraction(propertyId, 'view').catch(error => {
        console.error('Failed to log view interaction:', error);
      });
    }
    
    // Navigate to property details page
    navigate(`/properties/${propertyId}`);
  };
  
  // Handle save/unsave toggle
  const handleSaveToggle = async (e) => {
    e.stopPropagation();
    
    const propertyId = getPropertyId();
    if (!propertyId) {
      console.error('Property has no valid ID');
      return;
    }
    
    setSavingStatus({ loading: true, error: null });
    
    try {
      // Log interaction type based on current saved status
      logPropertyInteraction(propertyId, isSaved ? 'unsave' : 'save').catch(error => {
        console.error('Failed to log save interaction:', error);
      });
      
      // Call the onSaveToggle callback
      if (onSaveToggle) {
        await onSaveToggle(propertyId, isSaved);
      }
      
      setSavingStatus({ loading: false, error: null });
    } catch (error) {
      console.error('Save toggle error:', error);
      setSavingStatus({ loading: false, error: error.message });
    }
  };
  
  // If loading, show skeleton
  if (loading) {
    return (
      <Card sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        overflow: 'hidden'
      }}>
        <Skeleton variant="rectangular" height={200} />
        <CardContent>
          <Skeleton variant="text" height={30} width="80%" />
          <Skeleton variant="text" height={20} width="60%" />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Skeleton variant="text" height={20} width="40%" />
            <Skeleton variant="text" height={20} width="40%" />
          </Box>
        </CardContent>
        <CardActions sx={{ p: 2, pt: 0 }}>
          <Skeleton variant="rectangular" height={36} width="100%" />
        </CardActions>
      </Card>
    );
  }
  
  const propertyId = getPropertyId();
  const propertyTitle = property?.title || property?.name || 'Unlisted Property';
  const matchScore = property?.[matchScoreField] || 0;
  
  return (
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 12px 20px rgba(0,0,0,0.15)',
        },
        position: 'relative',
        borderRadius: 2,
        overflow: 'hidden'
      }}
    >
      {/* Match Score Badge (if enabled) */}
      {showMatchScore && matchScore > 0 && (
        <Box
          sx={{
            position: 'absolute',
            top: 12,
            left: 12,
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            bgcolor: 'background.paper',
            borderRadius: 3,
            px: 1,
            py: 0.5,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: `1px solid`,
            borderColor: getMatchScoreColor(matchScore) + '.main',
          }}
        >
          <ThumbUpIcon sx={{ 
            fontSize: 16, 
            mr: 0.5, 
            color: getMatchScoreColor(matchScore) + '.main' 
          }} />
          <Typography 
            variant="caption" 
            fontWeight="bold"
            color={getMatchScoreColor(matchScore) + '.main'}
          >
            {Math.round(matchScore)}% Match
          </Typography>
        </Box>
      )}
      
      {/* Featured Badge */}
      {featured && (
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            bgcolor: 'primary.main',
            color: 'white',
            py: 0.5,
            px: 1.5,
            borderRadius: 1,
            zIndex: 1,
            fontWeight: 'bold',
            fontSize: '0.75rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          FEATURED
        </Box>
      )}
      
      {/* Property Image */}
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="200"
          image={getPropertyImage()}
          alt={propertyTitle}
          sx={{ objectFit: 'cover' }}
          onClick={handleViewDetails}
        />
        
        {/* Save/Favorite Button */}
        <IconButton
          aria-label={isSaved ? "remove from favorites" : "add to favorites"}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            bgcolor: 'rgba(255, 255, 255, 0.9)',
            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.95)' }
          }}
          onClick={handleSaveToggle}
          disabled={savingStatus.loading}
        >
          {savingStatus.loading ? (
            <CircularProgress size={20} color="error" />
          ) : isSaved ? (
            <FavoriteIcon color="error" />
          ) : (
            <FavoriteBorderIcon color="error" />
          )}
        </IconButton>
        
        {/* Price Banner */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            bgcolor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            p: 1
          }}
        >
          <Typography variant="h6">
            {formatPrice(property?.price || 0)}
          </Typography>
        </Box>
      </Box>
      
      {/* Property Details */}
      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        <Typography variant="h6" gutterBottom noWrap>
          {propertyTitle}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <LocationOnIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
          <Typography variant="body2" color="text.secondary" noWrap>
            {getPropertyLocation()}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <HotelIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
            <Typography variant="body2">
              {property?.bedrooms || 0} Beds
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <BathtubIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
            <Typography variant="body2">
              {property?.bathrooms || 0} Baths
            </Typography>
          </Box>
        </Box>
      </CardContent>
      
      {/* Actions */}
      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button
          variant="contained"
          fullWidth
          onClick={handleViewDetails}
        >
          View Details
        </Button>
      </CardActions>
    </Card>
  );
 };
 
 export default PropertyCard;