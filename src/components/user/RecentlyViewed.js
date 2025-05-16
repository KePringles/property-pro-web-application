// src/components/user/RecentlyViewed.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Skeleton,
  Alert,
  Button,
  Chip
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { getRecentlyViewed } from '../../api/user';

const RecentlyViewed = ({ limit = 3 }) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchRecentlyViewed = async () => {
      setLoading(true);
      try {
        const response = await getRecentlyViewed(limit);
        setProperties(response.properties || []);
      } catch (err) {
        console.error('Error fetching recently viewed properties:', err);
        setError('Failed to load recently viewed properties.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecentlyViewed();
  }, [limit]);
  
  // Format price with commas
  const formatPrice = (price) => {
    return price ? `$${price.toLocaleString()}` : 'Price on request';
  };
  
  if (loading) {
    return (
      <Grid container spacing={3}>
        {[...Array(limit)].map((_, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card>
              <Skeleton variant="rectangular" height={140} />
              <CardContent>
                <Skeleton variant="text" width="70%" />
                <Skeleton variant="text" width="40%" />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }
  
  if (error) {
    return (
      <Alert severity="error">
        {error}
      </Alert>
    );
  }
  
  if (properties.length === 0) {
    return (
      <Alert severity="info">
        You haven't viewed any properties yet. Start browsing to see your history here.
      </Alert>
    );
  }
  
  return (
    <Box>
      <Grid container spacing={3}>
        {properties.map((property) => {
          // Get primary image or use placeholder
          const primaryImage = property.images?.find(img => img.is_primary)?.image_url || 
            '/assets/images/placeholder.jpg';
          
          return (
            <Grid item xs={12} sm={6} md={4} key={property.prop_id}>
              <Card 
                component={Link}
                to={`/properties/${property.prop_id}`}
                sx={{ 
                  height: '100%',
                  display: 'flex', 
                  flexDirection: 'column',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                  }
                }}
              >
                <Box sx={{ position: 'relative' }}>
                  <CardMedia
                    component="img"
                    height={140}
                    image={primaryImage}
                    alt={property.title}
                  />
                  
                  {/* For Sale/Rent Tags */}
                  <Box sx={{ position: 'absolute', top: 8, left: 8 }}>
                    {property.is_for_sale && (
                      <Chip 
                        label="Sale" 
                        color="primary" 
                        size="small"
                        sx={{ marginRight: 0.5, fontSize: '0.7rem' }}
                      />
                    )}
                    {property.is_for_rent && (
                      <Chip 
                        label="Rent" 
                        color="secondary" 
                        size="small"
                        sx={{ fontSize: '0.7rem' }}
                      />
                    )}
                  </Box>
                </Box>
                
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle1" component="div" noWrap>
                    {property.title}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {property.address || `${property.city}, ${property.parish?.name || ''}`}
                  </Typography>
                  
                  <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                    {formatPrice(property.price)}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary">
                    {property.bedrooms} bd • {property.bathrooms} ba • {property.area_sqft?.toLocaleString() || '?'} sq.ft.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
      
      {properties.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Button 
            component={Link}
            to="/search"
            variant="outlined"
            endIcon={<ArrowForwardIcon />}
          >
            Browse More Properties
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default RecentlyViewed;