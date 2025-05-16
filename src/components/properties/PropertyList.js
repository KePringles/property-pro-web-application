// src/components/properties/PropertyList.js
import React, { useEffect } from 'react';
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
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Pagination,
  LinearProgress,
  Tooltip,
  Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import HotelIcon from '@mui/icons-material/Hotel';
import BathtubIcon from '@mui/icons-material/Bathtub';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../../hooks/useAuth';

// Format price for display
const formatPrice = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'JMD',
    maximumFractionDigits: 0
  }).format(value);
};

const PropertyList = ({ 
  properties, 
  loading, 
  error, 
  showPagination = false,
  page = 1,
  totalPages = 1, 
  onPageChange = () => {},
  savedProperties = [],
  onSaveToggle = () => {},
  onPropertyClick = () => {}, // Ensure this prop is passed from parent components
  onEditProperty = null,
  onDeleteProperty = null,
  emptyMessage = "No properties found.",
  showMatchScore = false,
  matchScoreField = "match_score",
  showOwnerControls = false
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Log properties when they change to help debug
  useEffect(() => {
    // Check for properties missing IDs
    if (properties && properties.length > 0) {
      const missingIds = properties.filter(p => !p.property_id && !p.id);
      if (missingIds.length > 0) {
        console.warn('Properties missing IDs:', missingIds);
      }
      
      // Log the first few properties for debugging
      console.log('Sample properties:', properties.slice(0, 3).map(p => ({
        id: p.id,
        property_id: p.property_id,
        title: p.title || 'Untitled'
      })));
    }
  }, [properties]);
  
  // Set of saved property IDs for quick lookup
  const savedPropertySet = new Set(savedProperties);
  
  // Helper to get property image URL
  const getPropertyImage = (property) => {
    return property.image_url || 
           property.main_image_url || 
           property.image || 
           'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80';
  };
  
  // Helper to get property location text
  const getPropertyLocation = (property) => {
    if (property.city && property.parish?.name) {
      return `${property.city}, ${property.parish.name}`;
    } else if (property.city) {
      return property.city;
    } else if (property.parish?.name) {
      return property.parish.name;
    } else if (property.location) {
      return property.location;
    } else if (property.address) {
      return property.address;
    }
    return 'Jamaica';
  };
  
  // Handle page change
  const handlePageChange = (event, value) => {
    onPageChange(value);
  };
  
  // Determine if the current user owns a property
  const isPropertyOwner = (property) => {
    if (!user || !property) return false;
    
    // Check different possible owner ID fields
    const ownerIdFromProperty = property.owner_id || property.user_id;
    const userIdFromAuth = user.user_id || user.id;
    
    return ownerIdFromProperty === userIdFromAuth;
  };
  
  // Property card component
  const PropertyCard = ({ property }) => {
    // Get the property ID safely, checking both possible fields
    const propertyId = property.property_id || property.id;
    
    // Log warning if no valid ID
    if (!propertyId) {
      console.warn('Property missing ID:', property);
    }
    
    const isSaved = savedPropertySet.has(propertyId);
    const hasMatchScore = showMatchScore && property[matchScoreField] !== undefined;
    const canEdit = showOwnerControls && isPropertyOwner(property);
    
    // Safe property click handler with validation
    const handlePropertyClick = (e) => {
      e.stopPropagation();
      
      // Validate ID before navigation
      if (!propertyId) {
        console.error('Cannot navigate: Property has no valid ID', property);
        return;
      }
      
      // Call the passed onPropertyClick handler with the ID
      onPropertyClick(propertyId);
    };
    
    // Safe toggle favorite handler with validation
    const handleToggleFavorite = (e) => {
      e.stopPropagation();
      
      if (!propertyId) {
        console.error('Cannot toggle favorite: Property has no valid ID', property);
        return;
      }
      
      onSaveToggle(propertyId, isSaved);
    };
    
    return (
      <Card 
        elevation={3}
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
            image={getPropertyImage(property)}
            alt={property.title || 'Property'}
            sx={{ objectFit: 'cover' }}
          />
          
          {!canEdit && (
            <IconButton
              aria-label={isSaved ? "remove from favorites" : "add to favorites"}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                bgcolor: 'rgba(255, 255, 255, 0.8)',
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' }
              }}
              onClick={handleToggleFavorite}
            >
              {isSaved ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
            </IconButton>
          )}
          
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              bgcolor: 'rgba(0, 0, 0, 0.6)',
              color: 'white',
              p: 1,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Typography variant="h6">
              {formatPrice(property.price || 0)}
            </Typography>
            
            {property.is_for_sale && property.is_for_rent && (
              <Chip 
                label="Sale/Rent" 
                size="small" 
                sx={{ bgcolor: 'primary.main', color: 'white' }} 
              />
            )}
            {property.is_for_sale && !property.is_for_rent && (
              <Chip 
                label="For Sale" 
                size="small" 
                sx={{ bgcolor: 'primary.main', color: 'white' }} 
              />
            )}
            {!property.is_for_sale && property.is_for_rent && (
              <Chip 
                label="For Rent" 
                size="small" 
                sx={{ bgcolor: 'secondary.main', color: 'white' }} 
              />
            )}
            {property.status && (
              <Chip 
                label={property.status} 
                size="small" 
                sx={{ 
                  bgcolor: property.status.toLowerCase() === 'active' ? 'success.main' : 'info.main', 
                  color: 'white' 
                }} 
              />
            )}
          </Box>
        </Box>
        
        <CardContent sx={{ flexGrow: 1, p: 2 }}>
          <Typography variant="h6" gutterBottom noWrap>
            {property.title || 'Untitled Property'}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <LocationOnIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
            <Typography variant="body2" color="text.secondary" noWrap>
              {getPropertyLocation(property)}
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
            
            {property.property_type?.name && (
              <Tooltip title="Property Type">
                <Chip 
                  label={property.property_type.name} 
                  size="small" 
                  variant="outlined"
                />
              </Tooltip>
            )}
          </Box>
          
          {hasMatchScore && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Typography variant="body2" color="text.secondary">
                  {matchScoreField === 'match_score' ? 'Match Score:' : 'Similarity:'}
                </Typography>
                <Typography variant="body2" fontWeight="bold" color={
                  property[matchScoreField] > 80 ? 'success.main' : 
                  property[matchScoreField] > 60 ? 'primary.main' : 
                  property[matchScoreField] > 40 ? 'warning.main' : 
                  'text.secondary'
                }>
                  {Math.round(property[matchScoreField])}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={property[matchScoreField]}
                color={
                  property[matchScoreField] > 80 ? 'success' : 
                  property[matchScoreField] > 60 ? 'primary' : 
                  property[matchScoreField] > 40 ? 'warning' : 
                  'secondary'
                }
                sx={{ height: 6, borderRadius: 3 }}
              />
            </Box>
          )}
        </CardContent>
        
        <CardActions sx={{ p: 2, pt: 0 }}>
          {canEdit ? (
            // Show owner controls
            <Box sx={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>
              <Button
                variant="outlined"
                onClick={handlePropertyClick}
                startIcon={<VisibilityIcon />}
                size="small"
              >
                View
              </Button>
              
              <Box>
                <IconButton 
                  color="primary" 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onEditProperty && propertyId) {
                      onEditProperty(property);
                    }
                  }}
                  title="Edit Property"
                  aria-label="edit property"
                >
                  <EditIcon />
                </IconButton>
                <IconButton 
                  color="error" 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onDeleteProperty && propertyId) {
                      onDeleteProperty(property);
                    }
                  }}
                  title="Delete Property"
                  aria-label="delete property"
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Box>
          ) : (
            // Show regular view button
            <Button
              variant="contained"
              fullWidth
              onClick={handlePropertyClick}
              startIcon={<VisibilityIcon />}
            >
              View Details
            </Button>
          )}
        </CardActions>
      </Card>
    );
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }
  
  if (!properties || properties.length === 0) {
    return (
      <Paper elevation={0} sx={{ p: 4, textAlign: 'center', bgcolor: 'background.default' }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {emptyMessage}
        </Typography>
      </Paper>
    );
  }
  
  return (
    <Box>
      <Grid container spacing={3}>
        {properties.map((property) => {
          // Skip properties with no ID to prevent errors
          if (!property.property_id && !property.id) {
            console.warn('Skipping property with no ID:', property);
            return null;
          }
          
          return (
            <Grid 
              item 
              xs={12} 
              sm={6} 
              md={4} 
              key={property.property_id || property.id || `temp-${Math.random().toString(36).substring(2, 9)}`}
            >
              <PropertyCard property={property} />
            </Grid>
          );
        })}
      </Grid>
      
      {showPagination && totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
          />
        </Box>
      )}
    </Box>
  );
};

export default PropertyList;