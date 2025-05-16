import React, { useState, useEffect } from 'react';
import {
  Typography, Grid, Card, CardMedia, CardContent, CardActions, Button,
  CircularProgress, Box, Alert, LinearProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getSimilarProperties } from '../../api/recommendations';
import { useAuth } from '../../hooks/useAuth';
import { logPropertyInteraction } from '../../api/recommendations';

const SimilarProperties = ({ propertyId, searchParams }) => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [similarProperties, setSimilarProperties] = useState([]);

  useEffect(() => {
    const fetchSimilarProperties = async () => {
      if (!propertyId) return;

      setLoading(true);
      try {
        // Get user preferences from local storage or API
        const userPreferences = JSON.parse(localStorage.getItem('userPreferences')) || {};
        
        // Prepare weights (either from searchParams, userPreferences, or defaults)
        const weights = searchParams?.weights || userPreferences?.weights || {
          price: 5,
          location: 5,
          size: 5,
          amenities: 5
        };
        
        // Get similar properties with user preferences & filters
        const response = await getSimilarProperties(
          propertyId, 
          4, // Limit to 4 properties
          searchParams || {}, // Pass any search filters
          weights // Pass weights
        );
        
        // Process the response
        let similarProps = [];
        if (response?.similar_properties && Array.isArray(response.similar_properties)) {
          similarProps = response.similar_properties;
        } else if (Array.isArray(response)) {
          similarProps = response;
        }
        
        setSimilarProperties(similarProps);
        
        // Log this interaction for ML training
        if (isAuthenticated && user?.user_id) {
          await logPropertyInteraction(propertyId, 'similar_viewed');
        }
      } catch (err) {
        console.error('Error fetching similar properties:', err);
        setError('Failed to load similar properties');
      } finally {
        setLoading(false);
      }
    };

    fetchSimilarProperties();
  }, [propertyId, searchParams, isAuthenticated, user]);

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 2, mb: 2 }}>
        <CircularProgress size={24} sx={{ mr: 2 }} />
        <Typography variant="body2" component="span">
          Finding similar properties...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (similarProperties.length === 0) {
    return (
      <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
        No similar properties found.
      </Alert>
    );
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Similar Properties
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        These properties have similar features and characteristics.
      </Typography>

      <Grid container spacing={3}>
        {similarProperties.map((property) => (
          <Grid item xs={12} sm={6} md={4} key={property.property_id || property.id}>
            <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardMedia
                component="img"
                height="140"
                image={property.image_url || property.main_image_url || "/placeholder-property.jpg"}
                alt={property.title}
              />
              
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom>
                  {property.title}
                </Typography>
                
                <Typography variant="body2" color="text.secondary">
                  {property.parish}, Jamaica
                </Typography>
                
                <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                  ${property.price ? property.price.toLocaleString() : 'N/A'}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                  <Typography variant="body2" sx={{ mr: 1 }}>
                    Similarity:
                  </Typography>
                  <Box sx={{ width: '100%', mr: 1 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={(property.similarity_score || 0.75) * 100} 
                      color="success"
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {Math.round((property.similarity_score || 0.75) * 100)}%
                  </Typography>
                </Box>
                
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {property.bedrooms} beds • {property.bathrooms} baths • {property.property_type}
                  </Typography>
                </Box>
              </CardContent>
              
              <CardActions>
                <Button 
                  size="small" 
                  fullWidth
                  variant="outlined"
                  onClick={() => {
                    if (isAuthenticated && user?.user_id) {
                      logPropertyInteraction(property.property_id || property.id, 'view', {
                        source: 'similar_properties',
                        reference_property: propertyId
                      });
                    }
                    navigate(`/properties/${property.property_id || property.id}`);
                  }}
                >
                  View Details
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default SimilarProperties;