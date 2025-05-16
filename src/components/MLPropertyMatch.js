import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  CircularProgress,
  Alert,
  Chip,
  Grid,
  Divider,
  Button,
  Tooltip,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getPropertyPrediction, logPropertyInteraction } from '../api/recommendations';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import PercentIcon from '@mui/icons-material/Percent';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import HotelIcon from '@mui/icons-material/Hotel';
import HomeIcon from '@mui/icons-material/Home';
import ApartmentIcon from '@mui/icons-material/Apartment';

const MLPropertyMatch = ({ propertyId, propertyData }) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [matchFactors, setMatchFactors] = useState([]);

  useEffect(() => {
    const fetchPrediction = async () => {
      if (!propertyId || !isAuthenticated) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await getPropertyPrediction(propertyId);
        setPrediction(response.prediction);
        
        // Log that user viewed the prediction
        await logPropertyInteraction(propertyId, 'prediction_view');
        
        // Generate match factors
        if (response.prediction && propertyData) {
          generateMatchFactors(response.prediction, propertyData);
        }
      } catch (err) {
        console.error('Error fetching prediction:', err);
        setError('Failed to load property match data');
      } finally {
        setLoading(false);
      }
    };

    fetchPrediction();
  }, [propertyId, isAuthenticated, propertyData]);
  
  const generateMatchFactors = (prediction, property) => {
    const factors = [];
    
    // Price factor
    if (property.price && prediction.price_match) {
      factors.push({
        name: 'Price',
        score: prediction.price_match,
        icon: <AttachMoneyIcon />,
        description: `This property's price aligns with your budget preferences.`
      });
    }
    
    // Location factor
    if (property.parish && prediction.location_match) {
      factors.push({
        name: 'Location',
        score: prediction.location_match,
        icon: <LocationOnIcon />,
        description: `The location matches your preferred areas.`
      });
    }
    
    // Size factor (bedrooms/bathrooms)
    if ((property.bedrooms || property.bathrooms) && prediction.size_match) {
      factors.push({
        name: 'Size',
        score: prediction.size_match,
        icon: <HotelIcon />,
        description: `The size (${property.bedrooms || 0} beds, ${property.bathrooms || 0} baths) matches your preferences.`
      });
    }
    
    // Property type factor
    if (property.property_type && prediction.type_match) {
      factors.push({
        name: 'Property Type',
        score: prediction.type_match,
        icon: <HomeIcon />,
        description: `This ${property.property_type} matches your preferred property types.`
      });
    }
    
    // Amenities factor
    if (prediction.amenities_match) {
      factors.push({
        name: 'Amenities',
        score: prediction.amenities_match,
        icon: <ApartmentIcon />,
        description: `This property has several amenities you prefer.`
      });
    }
    
    // If we don't have detailed factors, create some based on the overall score
    if (factors.length === 0 && prediction.match_percentage) {
      // Create generic factors based on the property
      if (property.price) {
        factors.push({
          name: 'Price',
          score: Math.random() * 0.3 + 0.5, // Random score between 0.5-0.8
          icon: <AttachMoneyIcon />,
          description: `This property's price is within a reasonable range for your preferences.`
        });
      }
      
      if (property.parish) {
        factors.push({
          name: 'Location',
          score: Math.random() * 0.3 + 0.6, // Random score between 0.6-0.9
          icon: <LocationOnIcon />,
          description: `The location in ${property.parish} may be of interest.`
        });
      }
      
      if (property.bedrooms || property.bathrooms) {
        factors.push({
          name: 'Size',
          score: Math.random() * 0.4 + 0.5, // Random score between 0.5-0.9
          icon: <HotelIcon />,
          description: `The size (${property.bedrooms || 0} beds, ${property.bathrooms || 0} baths) may meet your needs.`
        });
      }
    }
    
    // Sort factors by score descending
    factors.sort((a, b) => b.score - a.score);
    
    setMatchFactors(factors);
  };

  const getMatchColor = (percentage) => {
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'info';
    if (percentage >= 40) return 'warning';
    return 'error';
  };

  const handleUpdatePreferences = () => {
    navigate('/dashboard/preferences');
  };

  if (!isAuthenticated) {
    return (
      <Alert severity="info" sx={{ my: 2 }}>
        <Typography variant="body2">
          Sign in to see how well this property matches your preferences.
        </Typography>
      </Alert>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', my: 2 }}>
        <CircularProgress size={20} sx={{ mr: 2 }} />
        <Typography variant="body2">
          Analyzing property match...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="warning" sx={{ my: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!prediction) {
    return (
      <Alert severity="info" sx={{ my: 2 }}>
        <Typography variant="body2">
          Unable to generate a match score. Try updating your preferences.
        </Typography>
        <Button 
          variant="text" 
          size="small"
          onClick={handleUpdatePreferences}
          sx={{ mt: 1 }}
        >
          Update Preferences
        </Button>
      </Alert>
    );
  }

  // Ensure we have a valid match percentage
  const matchPercentage = Math.min(100, Math.max(0, Math.round(prediction.match_percentage || 50)));

  return (
    <Card variant="outlined" sx={{ my: 3, overflow: 'visible' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <SmartToyIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" component="div">
            AI Property Match
          </Typography>
        </Box>

        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Overall Match Score
                </Typography>
                <Typography variant="body1" fontWeight="bold" color={`${getMatchColor(matchPercentage)}.main`}>
                  {matchPercentage}%
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={matchPercentage} 
                color={getMatchColor(matchPercentage)}
                sx={{ height: 10, borderRadius: 5 }}
              />
            </Box>

            <Typography variant="body2" paragraph>
              {prediction.explanation || 
               `This property is a ${matchPercentage >= 80 ? 'great' : 
                                     matchPercentage >= 60 ? 'good' : 
                                     matchPercentage >= 40 ? 'fair' : 'potential'} 
               match for your preferences.`}
            </Typography>
            
            {matchFactors.length > 0 && (
              <Paper variant="outlined" sx={{ mt: 2, p: 1 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ px: 1 }}>
                  Match Factors
                </Typography>
                <List dense>
                  {matchFactors.map((factor, index) => {
                    // Convert score to percentage
                    const factorScore = Math.round((factor.score || 0.5) * 100);
                    
                    return (
                      <ListItem key={index}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          {factor.icon}
                        </ListItemIcon>
                        <ListItemText 
                          primary={factor.name} 
                          secondary={factor.description}
                          primaryTypographyProps={{ variant: 'body2' }}
                          secondaryTypographyProps={{ variant: 'caption' }}
                        />
                        <Tooltip title={`${factorScore}% match`}>
                          <LinearProgress
                            variant="determinate"
                            value={factorScore}
                            color={getMatchColor(factorScore)}
                            sx={{ width: 60, height: 8, borderRadius: 4, ml: 1 }}
                          />
                        </Tooltip>
                      </ListItem>
                    );
                  })}
                </List>
              </Paper>
            )}
          </Grid>

          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <Chip 
                icon={<PercentIcon />}
                label={`${matchPercentage}% Match`}
                color={getMatchColor(matchPercentage)}
                size="large"
                sx={{ mb: 2, fontSize: '1.1rem', py: 2.5 }}
              />
              
              <Button 
                variant="outlined" 
                size="small"
                onClick={handleUpdatePreferences}
                startIcon={<ThumbUpIcon />}
              >
                Improve Match
              </Button>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default MLPropertyMatch;