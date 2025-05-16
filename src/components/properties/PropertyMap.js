// src/components/properties/PropertyMap.js
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Popper,
  Fade,
  Card,
  CardContent,
  CardMedia,
  Button,
  Divider,
  Chip
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import CloseIcon from '@mui/icons-material/Close';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import HotelIcon from '@mui/icons-material/Hotel';
import BathtubIcon from '@mui/icons-material/Bathtub';
import { useNavigate } from 'react-router-dom';
import { getUserLocation } from '../../api/properties';

// Format price for display
const formatPrice = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'JMD',
    maximumFractionDigits: 0
  }).format(value);
};

// Default center coordinates for Kingston, Jamaica
const KINGSTON_COORDS = { lat: 18.017, lng: -76.809 };

const PropertyMap = ({ 
  properties,
  interactive = true,
  height = 400,
  zoom = 12,
  savedProperties = [],
  onSaveToggle = () => {}
}) => {
  const navigate = useNavigate();
  
  // State for map
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [center, setCenter] = useState(KINGSTON_COORDS);
  const [mapZoom, setMapZoom] = useState(zoom);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for popups
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  
  // Set of saved property IDs for quick lookup
  const savedPropertySet = new Set(savedProperties);
  
  // Initialize map
  const initMap = useCallback(() => {
    // Check if Google Maps is loaded
    if (!window.google || !window.google.maps) {
      setError('Google Maps failed to load. Please refresh the page.');
      setLoading(false);
      return;
    }
    
    // Create map
    const mapInstance = new window.google.maps.Map(document.getElementById('property-map'), {
      center: center,
      zoom: mapZoom,
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true,
      zoomControl: true,
      mapTypeId: window.google.maps.MapTypeId.ROADMAP,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'on' }]
        }
      ]
    });
    
    setMap(mapInstance);
    setLoading(false);
  }, [center, mapZoom]);
  
  // Try to get user location for initial center
  useEffect(() => {
    const getUserPos = async () => {
      try {
        const location = await getUserLocation();
        setCenter({ lat: location.latitude, lng: location.longitude });
      } catch (err) {
        console.log('Could not get user location, using default', err);
        // Keep the default Kingston center
      }
    };
    
    getUserPos();
  }, []);
  
  // Initialize map when component mounts
  useEffect(() => {
    // Create script tag if it doesn't exist
    if (!document.querySelector('script[src*="maps.googleapis.com/maps/api"]')) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      script.onerror = () => {
        setError('Failed to load Google Maps. Please check your internet connection.');
        setLoading(false);
      };
      document.head.appendChild(script);
      
      return () => {
        // Clean up script on unmount if it hasn't loaded yet
        const loadingScript = document.querySelector('script[src*="maps.googleapis.com/maps/api"]');
        if (loadingScript && !window.google) {
          document.head.removeChild(loadingScript);
        }
      };
    } else if (window.google && window.google.maps) {
      // Google Maps already loaded
      initMap();
    } else {
      // Script is loading, wait for it
      const existingScript = document.querySelector('script[src*="maps.googleapis.com/maps/api"]');
      existingScript.addEventListener('load', initMap);
      
      return () => {
        existingScript.removeEventListener('load', initMap);
      };
    }
  }, [initMap]);
  
  // Add markers when properties change
  useEffect(() => {
    if (!map || !properties || properties.length === 0) return;
    
    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    setMarkers([]);
    
    // Function to create marker with info window for a property
    const createMarker = (property) => {
      // Skip if no coordinates
      if (!property.latitude || !property.longitude) return null;
      
      // Get coordinates
      const position = {
        lat: parseFloat(property.latitude),
        lng: parseFloat(property.longitude)
      };
      
      // Skip if invalid coordinates
      if (isNaN(position.lat) || isNaN(position.lng)) return null;
      
      // Determine marker icon based on property type and saved status
      const isSaved = savedPropertySet.has(property.property_id || property.id);
      let markerIcon = {
        path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
        fillColor: isSaved ? '#f44336' : '#2196F3',
        fillOpacity: 1,
        strokeWeight: 2,
        strokeColor: '#ffffff',
        scale: 1.5,
        anchor: new window.google.maps.Point(12, 22)
      };
      
      // Create the marker
      const marker = new window.google.maps.Marker({
        position: position,
        map: map,
        title: property.title,
        icon: markerIcon,
        animation: window.google.maps.Animation.DROP,
        optimized: true
      });
      
      // Add click event to marker
      if (interactive) {
        marker.addListener('click', (event) => {
          // Close any open popup first
          setSelectedProperty(null);
          setAnchorEl(null);
          
          // Set timeout to prevent flickering
          setTimeout(() => {
            setSelectedProperty(property);
            setAnchorEl(marker);
          }, 100);
        });
      }
      
      return marker;
    };
    
    // Create markers for all properties and filter out null values
    const newMarkers = properties
      .map(property => createMarker(property))
      .filter(marker => marker !== null);
    
    setMarkers(newMarkers);
    
    // Auto-fit bounds if we have markers
    if (newMarkers.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      newMarkers.forEach(marker => bounds.extend(marker.getPosition()));
      map.fitBounds(bounds);
      
      // Don't zoom in too far on small areas
      const listener = window.google.maps.event.addListener(map, 'idle', () => {
        if (map.getZoom() > 16) {
          map.setZoom(16);
        }
        window.google.maps.event.removeListener(listener);
      });
    }
  }, [map, properties, interactive, savedPropertySet]);
  
  // Close the property popup when clicking elsewhere on the map
  useEffect(() => {
    if (!map || !interactive) return;
    
    const clickListener = map.addListener('click', () => {
      setSelectedProperty(null);
      setAnchorEl(null);
    });
    
    return () => {
      window.google.maps.event.removeListener(clickListener);
    };
  }, [map, interactive]);
  
  // Center map on user location
  const handleUserLocation = async () => {
    try {
      const location = await getUserLocation();
      const position = { lat: location.latitude, lng: location.longitude };
      map.setCenter(position);
      map.setZoom(14);
      
      // Add a pulsing marker for user location
      const userMarker = new window.google.maps.Marker({
        position: position,
        map: map,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#4285F4',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2
        },
        title: 'Your Location'
      });
      
      // Add animation
      let opacity = 1;
      const pulse = setInterval(() => {
        opacity = opacity === 1 ? 0.5 : 1;
        userMarker.setOptions({
          icon: {
            ...userMarker.getIcon(),
            fillOpacity: opacity
          }
        });
      }, 500);
      
      // Clear the animation after 5 seconds
      setTimeout(() => {
        clearInterval(pulse);
        userMarker.setMap(null);
      }, 5000);
      
    } catch (err) {
      console.error('Error getting user location:', err);
    }
  };
  
  // Handle toggle save from popup
  const handleSaveToggle = (event, property) => {
    event.stopPropagation();
    const propertyId = property.property_id || property.id;
    const isSaved = savedPropertySet.has(propertyId);
    onSaveToggle(propertyId, isSaved);
    
    // Update marker icon
    markers.forEach(marker => {
      if (marker.getTitle() === property.title) {
        const newIsSaved = !isSaved;
        marker.setIcon({
          ...marker.getIcon(),
          fillColor: newIsSaved ? '#f44336' : '#2196F3'
        });
      }
    });
  };
  
  // Format the property location string
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
  
  // Property popup/info window
  const PropertyPopup = () => {
    if (!selectedProperty) return null;
    
    const propertyId = selectedProperty.property_id || selectedProperty.id;
    const isSaved = savedPropertySet.has(propertyId);
    
    return (
      <Popper
        open={Boolean(anchorEl && selectedProperty)}
        anchorEl={anchorEl}
        placement="top"
        transition
        modifiers={[
          {
            name: 'offset',
            options: {
              offset: [0, -30]
            }
          }
        ]}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={350}>
            <Paper 
              elevation={5}
              sx={{ 
                width: 280,
                maxWidth: '90vw',
                overflow: 'hidden',
                borderRadius: 2
              }}
            >
              <Card sx={{ boxShadow: 'none' }}>
                <Box sx={{ position: 'relative' }}>
                  <CardMedia
                    component="img"
                    height="140"
                    image={selectedProperty.image_url || selectedProperty.main_image_url || 'https://via.placeholder.com/400x200?text=Property+Image'}
                    alt={selectedProperty.title}
                  />
                  <IconButton
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      bgcolor: 'rgba(255,255,255,0.8)',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }
                    }}
                    onClick={() => {
                      setSelectedProperty(null);
                      setAnchorEl(null);
                    }}
                  >
                    <CloseIcon />
                  </IconButton>
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      bgcolor: 'rgba(0,0,0,0.6)',
                      color: 'white',
                      p: 1
                    }}
                  >
                    <Typography variant="subtitle1">
                      {formatPrice(selectedProperty.price || 0)}
                    </Typography>
                  </Box>
                </Box>
                
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom noWrap>
                    {selectedProperty.title || 'Untitled Property'}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationOnIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {getPropertyLocation(selectedProperty)}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <HotelIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                      <Typography variant="body2">
                        {selectedProperty.bedrooms || 0} Beds
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <BathtubIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                      <Typography variant="body2">
                        {selectedProperty.bathrooms || 0} Baths
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Divider sx={{ mb: 2 }} />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => navigate(`/properties/${propertyId}`)}
                    >
                      View Details
                    </Button>
                    
                    <Tooltip title={isSaved ? "Remove from Saved" : "Save Property"}>
                      <IconButton
                        color={isSaved ? "error" : "default"}
                        onClick={(e) => handleSaveToggle(e, selectedProperty)}
                      >
                        {isSaved ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                      </IconButton>
                    </Tooltip>
                  </Box>
                </CardContent>
              </Card>
            </Paper>
          </Fade>
        )}
      </Popper>
    );
  };
  
  return (
    <Box sx={{ width: '100%', height, position: 'relative' }}>
      {loading && (
        <Box 
          sx={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            zIndex: 10,
            bgcolor: 'rgba(255,255,255,0.7)'
          }}
        >
          <CircularProgress />
        </Box>
      )}
      
      {error && (
        <Box 
          sx={{ 
            position: 'absolute', 
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 10
          }}
        >
          <Alert severity="error" variant="filled">
            {error}
          </Alert>
        </Box>
      )}
      
      {interactive && (
        <Tooltip title="Find My Location">
          <IconButton
            sx={{
              position: 'absolute',
              bottom: 24,
              right: 10,
              bgcolor: 'white',
              boxShadow: 2,
              zIndex: 10,
              '&:hover': { bgcolor: 'white' }
            }}
            onClick={handleUserLocation}
          >
            <MyLocationIcon />
          </IconButton>
        </Tooltip>
      )}
      
      <div 
        id="property-map" 
        style={{ width: '100%', height: '100%', borderRadius: 4 }}
      ></div>
      
      <PropertyPopup />
    </Box>
  );
};

export default PropertyMap;