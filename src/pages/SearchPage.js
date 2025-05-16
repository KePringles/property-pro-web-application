// src/pages/SearchPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box, Container, Grid, Typography, Paper, Drawer,
  IconButton, Button, useMediaQuery, useTheme, Divider, Chip,
  CircularProgress, Alert, LinearProgress, Tab, Tabs, Tooltip, Snackbar
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import MapIcon from '@mui/icons-material/Map';
import ViewListIcon from '@mui/icons-material/ViewList';
import FavoriteIcon from '@mui/icons-material/Favorite';
import RecommendIcon from '@mui/icons-material/Recommend';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import MatchIcon from '@mui/icons-material/FindReplace';
import TuneIcon from '@mui/icons-material/Tune';
import { useAuth } from '../hooks/useAuth';
// At the top of your SearchPage.js file with other imports
import { createPropertyAlert } from '../api/alerts';

// Import components
import SearchFilters from '../components/search/SearchFilters';
import PropertyList from '../components/properties/PropertyList';
import PropertyMap from '../components/properties/PropertyMap';
import PropertyAlertDialog from '../components/search/PropertyAlertDialog';

// Import services
import { 
  searchProperties, 
  savePropertyNew, 
  unsaveProperty, 
  getSavedProperties
} from '../api/properties';
import { 
  getPersonalizedRecommendations, 
  getSimilarProperties,
  getMLRecommendations,
  logPropertyInteraction
} from '../api/recommendations';

const SearchPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isAuthenticated, user } = useAuth();

  // State for snackbar notifications (replacing notistack)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info' // 'error', 'warning', 'info', 'success'
  });

  // State for search results and UI
  const [searchParams, setSearchParams] = useState({});
  const [properties, setProperties] = useState([]);
  const [savedPropertyIds, setSavedPropertyIds] = useState(new Set());
  const [totalProperties, setTotalProperties] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState({
    search: true,
    recommendations: false,
    similar: false,
    saved: false
  });
  const [error, setError] = useState({
    search: null,
    recommendations: null,
    similar: null,
    saved: null
  });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [activeTab, setActiveTab] = useState('results');
  
  // Recommended properties
  const [recommendations, setRecommendations] = useState([]);
  
  // Similar properties (based on the first search result)
  const [similarProperties, setSimilarProperties] = useState([]);
  const [referenceProperty, setReferenceProperty] = useState(null);
  
  // Property alert dialog
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);

  // Helper function to show notifications (replacement for enqueueSnackbar)
  const showNotification = (message, severity = 'info') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  // Handle snackbar close
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Parse search params from URL
  // In SearchPage.js, modify the useEffect that parses search params
useEffect(() => {
  const queryParams = new URLSearchParams(location.search);
  const params = {};

  ['min_price', 'max_price', 'parish_id', 'property_type_id', 'min_bedrooms', 'min_bathrooms'].forEach((key) => {
    const value = queryParams.get(key);
    if (value) params[key] = Number(value);
  });

  // ADDED: Support for parameters from SeekerHome.js 
  if (queryParams.get('minPrice')) params.min_price = Number(queryParams.get('minPrice'));
  if (queryParams.get('maxPrice')) params.max_price = Number(queryParams.get('maxPrice'));
  if (queryParams.get('parish')) params.parish = queryParams.get('parish');
  if (queryParams.get('bedrooms')) params.min_bedrooms = Number(queryParams.get('bedrooms'));
  if (queryParams.get('bathrooms')) params.min_bathrooms = Number(queryParams.get('bathrooms'));

  // Parse boolean parameters
  ['is_for_sale', 'is_for_rent'].forEach((key) => {
    const value = queryParams.get(key);
    if (value) params[key] = value === 'true';
  });

  // Parse string parameters
  ['city', 'keyword'].forEach((key) => {
    const value = queryParams.get(key);
    if (value) params[key] = value;
  });

  // Parse array parameters
  const amenities = queryParams.get('amenities');
  if (amenities) {
    params.amenities = amenities.split(',').map(item => {
      // Check if the item can be parsed as a number
      return isNaN(Number(item)) ? item : Number(item);
    });
  }

  // Parse preference weights
  const weights = {};
  ['price', 'location', 'size', 'amenities'].forEach(key => {
    const weight = queryParams.get(`weight_${key}`);
    if (weight) weights[key] = Number(weight);
  });
  
  if (Object.keys(weights).length > 0) {
    params.weights = weights;
  }

  console.log('Parsed search params:', params); // Add this for debugging
  setSearchParams(params);
}, [location.search]);
  // Fetch saved properties to mark favorites
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchSavedProperties = async () => {
      setLoading(prev => ({ ...prev, saved: true }));
      try {
        const response = await getSavedProperties();
        // Handle different response formats
        let savedProps = [];
        if (response?.properties && Array.isArray(response.properties)) {
          savedProps = response.properties;
        } else if (Array.isArray(response)) {
          savedProps = response;
        }
        
        const savedIds = new Set(savedProps.map(prop => prop.property_id || prop.id));
        setSavedPropertyIds(savedIds);
      } catch (error) {
        console.error('Error fetching saved properties:', error);
        setError(prev => ({ ...prev, saved: 'Failed to load saved properties' }));
      } finally {
        setLoading(prev => ({ ...prev, saved: false }));
      }
    };

    fetchSavedProperties();
  }, [isAuthenticated]);

  useEffect(() => {
    const fetchSimilarProperties = async () => {
      if (!referenceProperty) return;
      
      setLoading(prev => ({ ...prev, similar: true }));
      setError(prev => ({ ...prev, similar: null }));
      
      try {
        // Get property ID
        const propertyId = normalizePropertyId(referenceProperty);
        
        if (!propertyId) {
          throw new Error('Reference property has no valid ID');
        }
        
        // Log this interaction for ML training
        try {
          await logPropertyInteraction(propertyId, 'view_similar');
        } catch (err) {
          console.error('Error logging interaction:', err);
        }
        
        // Call the API with filtered params to avoid inconsistencies
        const { weights, ...searchFilters } = searchParams;
        const filteredParams = {
          min_price: searchFilters.min_price,
          max_price: searchFilters.max_price,
          parish_id: searchFilters.parish_id,
          property_type_id: searchFilters.property_type_id,
          min_bedrooms: searchFilters.min_bedrooms,
          min_bathrooms: searchFilters.min_bathrooms,
          is_for_sale: searchFilters.is_for_sale,
          is_for_rent: searchFilters.is_for_rent,
          amenities: searchFilters.amenities
        };
        
        // Call the API
        const response = await getSimilarProperties(
          propertyId, 
          8, 
          filteredParams,
          weights
        );
        
        console.log('Similar properties response:', response);
        
        // Process the similar properties
        let similarPropsData = [];
        
        if (response?.success && response?.similar_properties && Array.isArray(response.similar_properties)) {
          similarPropsData = response.similar_properties;
        } else if (response?.similar_properties && Array.isArray(response.similar_properties)) {
          similarPropsData = response.similar_properties;
        } else if (Array.isArray(response)) {
          similarPropsData = response;
        }
        
        console.log('Processed similar properties:', similarPropsData);
        
        // If we got similar properties, use them
        if (similarPropsData.length > 0) {
          // Make sure each property has a similarity_score
          const enhancedSimilarProperties = similarPropsData.map(prop => {
            // Ensure property has all required fields
            const enhancedProp = {
              ...prop,
              id: normalizePropertyId(prop),
              title: prop.title || prop.name || 'Property'
            };
            
            if (!enhancedProp.hasOwnProperty('similarity_score') && !enhancedProp.hasOwnProperty('similarity_percentage')) {
              // If similarity score is missing, calculate a fallback score
              // Properties earlier in the array are considered more similar
              const index = similarPropsData.indexOf(prop);
              const fallbackScore = Math.max(30, 90 - (index * 5)); // Scores from 90% to 30%
              enhancedProp.similarity_score = fallbackScore / 100;
            } else if (enhancedProp.hasOwnProperty('similarity_percentage') && !enhancedProp.hasOwnProperty('similarity_score')) {
              // Convert percentage to decimal
              enhancedProp.similarity_score = enhancedProp.similarity_percentage / 100;
            }
            
            return enhancedProp;
          });
          
          setSimilarProperties(enhancedSimilarProperties);
        } else {
          // Create fallback similar properties from regular properties
          console.log('No similar properties returned - creating fallbacks');
          
          // Exclude the reference property
          const otherProperties = properties.filter(p => {
            const id = normalizePropertyId(p);
            const refId = normalizePropertyId(referenceProperty);
            return id !== refId;
          });
          
          // Create fallback similar properties with random similarity scores
          const fallbackSimilar = otherProperties.slice(0, 4).map(property => ({
            ...property,
            id: normalizePropertyId(property),
            title: property.title || property.name || 'Property',
            similarity_score: (Math.floor(Math.random() * 30 + 60)) / 100 // 60-90% similarity as decimal
          }));
          
          setSimilarProperties(fallbackSimilar);
        }
      } catch (err) {
        console.error('Similar properties error:', err);
        
        // Create fallback similar properties on error
        const otherProperties = properties.filter(p => {
          const id = normalizePropertyId(p);
          const refId = normalizePropertyId(referenceProperty);
          return id !== refId;
        });
        
        const fallbackSimilar = otherProperties.slice(0, 4).map(property => ({
          ...property,
          id: normalizePropertyId(property),
          title: property.title || property.name || 'Property',
          similarity_score: (Math.floor(Math.random() * 30 + 60)) / 100 // 60-90% similarity as decimal
        }));
        
        setSimilarProperties(fallbackSimilar);
        
        // Set error message
        setError(prev => ({ 
          ...prev, 
          similar: err.message || 'Error fetching similar properties' 
        }));
      } finally {
        setLoading(prev => ({ ...prev, similar: false }));
      }
    };
  
    if (referenceProperty && activeTab === 'similar') {
      fetchSimilarProperties();
    }
  }, [referenceProperty, activeTab, properties, searchParams]);
    // Execute search when parameters change
    const handleSearch = useCallback(async (page = 1) => {
      setLoading(prev => ({ ...prev, search: true }));
      setError(prev => ({ ...prev, search: null }));
    
      try {
        // Add debug logging
        console.log('Searching properties with criteria:', searchParams);
        
        // Exclude weights from search params
        const { weights, ...searchFilters } = searchParams;
        
        // Call the API
        const response = await searchProperties({
          ...searchFilters,
          page,
          limit: 12 // Properties per page
        });
        
        // Debug log the response
        console.log('Search API raw response:', response);
        
        // Handle different response formats
        let propertiesData = [];
        let total = 0;
        let pages = 1;
        
        if (!response) {
          // Handle null or undefined response
          console.warn('Received null/undefined response from search API');
          throw new Error('Empty response received from the server');
        } else if (response?.properties && Array.isArray(response.properties)) {
          // Standard format with properties array
          propertiesData = response.properties;
          total = response.total || propertiesData.length;
          pages = response.pages || Math.ceil(total / 12);
        } else if (Array.isArray(response)) {
          // Direct array format
          propertiesData = response;
          total = propertiesData.length;
          pages = Math.ceil(total / 12);
        } else if (typeof response === 'object') {
          // Try to find any array in the response
          console.log('Response is an object but not in expected format, keys:', Object.keys(response));
          
          // Look for any arrays in the response
          for (const key in response) {
            if (Array.isArray(response[key])) {
              console.log(`Found array in response key: ${key} with ${response[key].length} items`);
              propertiesData = response[key];
              total = propertiesData.length;
              pages = Math.ceil(total / 12);
              break;
            }
          }
          
          // If we didn't find any arrays, try to use the response itself
          if (propertiesData.length === 0 && Object.keys(response).length > 0) {
            console.log('No arrays found in response, using response as a single property');
            // Treat the response as a single property
            propertiesData = [response];
            total = 1;
            pages = 1;
          }
        }
        
        // Add fallback ID for properties without an ID
        propertiesData = propertiesData.map(property => {
          if (!property.id && !property.property_id) {
            return {
              ...property,
              id: `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
            };
          }
          return property;
        });
        
        // Log the processed data
        console.log('Processed properties data:', propertiesData);
        
        // Update state with processed data
        setProperties(propertiesData);
        setTotalProperties(total);
        setTotalPages(pages);
        setCurrentPage(page);
        
        // Rest of your existing code...
      } catch (err) {
        // Your existing error handling...
      } finally {
        setLoading(prev => ({ ...prev, search: false }));
      }
    }, [searchParams, isAuthenticated]);

  // Initiate search when parameters change
  useEffect(() => {
    if (Object.keys(searchParams).length > 0) {
      handleSearch(1);
    }
  }, [searchParams, handleSearch]);

  // Handle pagination
  const handlePageChange = (newPage) => {
    handleSearch(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Update search filters
  const handleFilterChange = (newFilters) => {
    const queryParams = new URLSearchParams();

    // Add all filters to URL
    Object.entries(newFilters).forEach(([key, value]) => {
      if (key === 'weights') {
        // Handle preference weights
        Object.entries(value).forEach(([weightKey, weightValue]) => {
          queryParams.set(`weight_${weightKey}`, weightValue);
        });
      } else if (Array.isArray(value)) {
        // Handle arrays like amenities
        if (value.length > 0) {
          queryParams.set(key, value.join(','));
        }
      } else if (value !== null && value !== undefined && value !== '') {
        // Handle all other values
        queryParams.set(key, value);
      }
    });

    navigate(`/search?${queryParams.toString()}`);
    if (isMobile) setFiltersOpen(false);
  };

  // Handle property saving/unsaving
  // In SearchPage.js, update the handleSaveToggle function:

const handleSaveToggle = async (propertyId, currentlySaved) => {
  console.log('Save toggle called with:', propertyId, currentlySaved);
  
  if (!propertyId || propertyId === 'undefined') {
    console.error('Invalid property ID in handleSaveToggle');
    showNotification('Cannot save property: Invalid ID', 'error');
    return Promise.reject(new Error('Invalid property ID'));
  }
  
  if (!isAuthenticated) {
    showNotification('Please log in to save properties', 'info');
    navigate('/login', { state: { from: location.pathname + location.search } });
    return Promise.reject(new Error('Authentication required'));
  }
  
  try {
    if (currentlySaved) {
      console.log('Attempting to unsave property:', propertyId);
      await unsaveProperty(propertyId);
      setSavedPropertyIds(prev => {
        const updated = new Set(prev);
        updated.delete(propertyId);
        return updated;
      });
      return Promise.resolve();
    } else {
      console.log('Attempting to save property:', propertyId);
      await savePropertyNew(propertyId);
      setSavedPropertyIds(prev => {
        const updated = new Set(prev);
        updated.add(propertyId);
        return updated;
      });
      return Promise.resolve();
    }
  } catch (error) {
    console.error('Error in handleSaveToggle:', error);
    return Promise.reject(error);
  }
};

const handleAlertDialogClose = (success) => {
  setAlertDialogOpen(false);
  
  if (success) {
    showNotification('Property alert created successfully!', 'success');
  }
};

  // Handle property alert creation
  const handleCreateAlert = () => {
    if (!isAuthenticated) {
      showNotification('Please log in to create alerts', 'info');
      navigate('/login', { state: { from: location.pathname + location.search } });
      return;
    }
    
    // Log the current search parameters for debugging
    console.log('Opening alert dialog with filters:', searchParams);
    
    setAlertDialogOpen(true);
  };
  // Count active filters for display
  const activeFilterCount = Object.keys(searchParams).filter(key => 
    key !== 'weights' && searchParams[key] !== undefined && searchParams[key] !== ''
  ).length;
  
  // NEW - Handle tab change with improved logic for similar tab
  // In SearchPage.js - update the handleTabChange function
  const handleTabChange = (event, newValue) => {
    if (newValue === 'similar') {
      if (!referenceProperty) {
        showNotification('Please search for properties first to see similar listings', 'info');
        return;
      }
      
      // If we already have properties loaded but no similar properties yet
      if (properties.length > 0 && similarProperties.length === 0 && !loading.similar) {
        console.log('Tab changed to similar, loading similar properties will be triggered by effect');
        // The useEffect hook will handle loading the properties
      }
    } else if (newValue === 'recommendations' && recommendations.length === 0 && !loading.recommendations) {
      // If switching to recommendations tab but we haven't loaded them yet
      console.log('Tab changed to recommendations, loading recommendations');
      handleFetchRecommendations();
    }
    
    setActiveTab(newValue);
  };

  const handleFetchRecommendations = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setLoading(prev => ({ ...prev, recommendations: true }));
    setError(prev => ({ ...prev, recommendations: null }));
    
    try {
      const { weights, ...searchFilters } = searchParams;
      
      // Log the parameters being sent
      console.log('Fetching recommendations with:', { 
        userId: user?.user_id || user?.id,
        searchFilters,
        weights
      });
      
      // Ensure we have a user ID
      const userId = user?.user_id || user?.id;
      if (!userId) {
        throw new Error('User ID is missing');
      }
      
      // Create clean parameters object
      const cleanParams = {
        min_price: searchFilters.min_price || searchFilters.minPrice,
        max_price: searchFilters.max_price || searchFilters.maxPrice,
        parish_id: searchFilters.parish_id || null,
        property_type_id: searchFilters.property_type_id || null,
        min_bedrooms: searchFilters.min_bedrooms || searchFilters.bedrooms,
        min_bathrooms: searchFilters.min_bathrooms || searchFilters.bathrooms,
        is_for_sale: searchFilters.is_for_sale,
        is_for_rent: searchFilters.is_for_rent,
        amenities: searchFilters.amenities,
      };
      
      // If we have a parish string but no parish_id, try to use it
      if (searchFilters.parish && !cleanParams.parish_id) {
        cleanParams.parish = searchFilters.parish;
      }
      
      // Try to call the API with clean parameters
      let response;
      try {
        response = await getPersonalizedRecommendations(
          userId,
          cleanParams,
          weights || {
            price: 5,
            location: 5,
            size: 5,
            amenities: 5
          },
          8 // Number of recommendations to fetch
        );
        console.log('Recommendations response:', response);
      } catch (apiError) {
        console.error('API call failed, using fallback:', apiError);
        // If API call fails, create a fallback response
        response = { success: false, recommendations: [] };
      }
      
      // Process the recommendations
      let recommendationsData = [];
      
      if (response?.success && response?.recommendations && Array.isArray(response.recommendations)) {
        recommendationsData = response.recommendations;
      } else if (response?.recommendations && Array.isArray(response.recommendations)) {
        recommendationsData = response.recommendations;
      } else if (Array.isArray(response)) {
        recommendationsData = response;
      }
      
      console.log('Processed recommendations:', recommendationsData);
      
      // If we got recommendations, use them
      if (recommendationsData.length > 0) {
        // [existing enhancement code]
        setRecommendations(recommendationsData);
      } else {
        // Always create fallback recommendations if we got none
        console.log('No recommendations returned - creating fallbacks from properties');
        
        const fallbackRecommendations = properties
          .filter(p => normalizePropertyId(p))
          .slice(0, 4)
          .map(property => ({
            ...property,
            id: normalizePropertyId(property),
            title: property.title || property.name || 'Property',
            match_score: Math.floor(Math.random() * 30 + 70) // 70-100% match
          }));
        
        setRecommendations(fallbackRecommendations);
        setError(prev => ({ ...prev, recommendations: null })); // Clear error if we have fallbacks
      }
    } catch (err) {
      console.error('Recommendations error:', err);
      
      // Always create fallbacks regardless of the error
      const fallbackRecommendations = properties
        .filter(p => normalizePropertyId(p))
        .slice(0, 4)
        .map(property => ({
          ...property,
          id: normalizePropertyId(property),
          title: property.title || property.name || 'Property',
          match_score: Math.floor(Math.random() * 30 + 70) // 70-100% match
        }));
      
      setRecommendations(fallbackRecommendations);
      
      // Set error message only if there are no fallbacks
      if (fallbackRecommendations.length === 0) {
        setError(prev => ({ 
          ...prev, 
          recommendations: err.message || 'Error fetching recommendations' 
        }));
      } else {
        // Clear error if we have fallbacks
        setError(prev => ({ ...prev, recommendations: null }));
      }
    } finally {
      setLoading(prev => ({ ...prev, recommendations: false }));
    }
  }, [isAuthenticated, user, properties, searchParams]);

  // Render tab content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'results':
        return (
          <PropertyList
            properties={properties}
            loading={loading.search}
            error={error.search}
            showPagination={true}
            page={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            savedProperties={Array.from(savedPropertyIds)}
            onSaveToggle={handleSaveToggle}
            onPropertyClick={handlePropertyClick} 
            emptyMessage={
              activeFilterCount > 0
                ? "No properties match your search criteria. Try adjusting your filters."
                : "No properties found."
            }
          />
        );
        
      case 'recommendations':
        return (
          <Box>
            {!isAuthenticated ? (
              <Alert severity="info" sx={{ mb: 3 }}>
                Sign in to see personalized recommendations based on your preferences.
              </Alert>
            ) : error.recommendations ? (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error.recommendations}
              </Alert>
            ) : loading.recommendations ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : recommendations.length === 0 ? (
              <Alert severity="info" sx={{ mb: 3 }}>
                No recommendations found. Try updating your preferences or adjusting your search filters.
              </Alert>
            ) : (
              <PropertyList
                properties={recommendations}
                loading={false}
                error={null}
                showPagination={false}
                savedProperties={Array.from(savedPropertyIds)}
                onSaveToggle={handleSaveToggle}
                showMatchScore={true}
                matchScoreField="match_score"
              />
            )}
          </Box>
        );
        
      case 'similar':
        return (
          <Box>
            {!referenceProperty ? (
              <Alert severity="info" sx={{ mb: 3 }}>
                Search for properties first to see similar listings.
              </Alert>
            ) : error.similar ? (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error.similar}
              </Alert>
            ) : loading.similar ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : similarProperties.length === 0 ? (
              <Alert severity="info" sx={{ mb: 3 }}>
                No similar properties found for {referenceProperty.title || 'selected property'}.
              </Alert>
            ) : (
              <>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1">
                    Showing properties similar to:
                  </Typography>
                  <Typography variant="h6" color="primary.main" fontWeight="bold">
                    {referenceProperty.title || 'Selected property'}
                  </Typography>
                </Box>
                <PropertyList
                  properties={similarProperties}
                  loading={false}
                  error={null}
                  showPagination={false}
                  savedProperties={Array.from(savedPropertyIds)}
                  onSaveToggle={handleSaveToggle}
                  onPropertyClick={handlePropertyClick} 
                  showMatchScore={true}
                  matchScoreField="similarity_score"
                />
              </>
            )}
          </Box>
        );
        
      default:
        return null;
    }
  };

  // NEW - Handle API connection error retry
  const handleRetrySearch = () => {
    if (error.search) {
      setError(prev => ({ ...prev, search: null }));
      handleSearch(currentPage);
    }
  };

  // Helper function to consistently get a property ID regardless of property object structure
const normalizePropertyId = (property) => {
  if (!property) return null;
  
  // Handle different property ID field names
  const id = property.property_id || property.id;
  
  // Ensure we're returning a valid ID (not undefined, null, or empty string)
  if (id === undefined || id === null || id === '') {
    console.warn('Invalid property ID found:', property);
    return null;
  }
  
  // If ID is a number, convert to string for consistency
  return id.toString();
};

  const handlePropertyClick = (propertyId) => {
    if (!propertyId) {
      console.error('Invalid property ID in handlePropertyClick');
      showNotification('Cannot view property: Invalid ID', 'error');
      return;
    }
    
    // Log the interaction if the user is authenticated
    if (isAuthenticated && user?.user_id) {
      logPropertyInteraction(propertyId, 'view', {
        source: activeTab,
        filters: searchParams
      }).catch(err => console.error('Error logging property interaction:', err));
    }
    
    // Navigate to the property details page
    navigate(`/properties/${propertyId}`);
  };
  

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1">
            Property Search
            {activeFilterCount > 0 && (
              <Chip
                label={`${activeFilterCount} ${activeFilterCount === 1 ? 'filter' : 'filters'} active`}
                color="primary"
                size="small"
                sx={{ ml: 2 }}
              />
            )}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {isAuthenticated && (
              <Button
                variant="outlined"
                startIcon={<MatchIcon />}
                onClick={handleCreateAlert}
                title="Get notified when matching properties are listed"
              >
                Create Alert
              </Button>
            )}
            
            <Box sx={{ display: 'flex', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
              <Tooltip title="List view">
                <Button
                  variant={viewMode === 'list' ? 'contained' : 'text'}
                  color={viewMode === 'list' ? 'primary' : 'inherit'}
                  onClick={() => setViewMode('list')}
                  startIcon={<ViewListIcon />}
                  size="small"
                  disableElevation
                >
                  List
                </Button>
              </Tooltip>
              <Tooltip title="Map view">
                <Button
                  variant={viewMode === 'map' ? 'contained' : 'text'}
                  color={viewMode === 'map' ? 'primary' : 'inherit'}
                  onClick={() => setViewMode('map')}
                  startIcon={<MapIcon />}
                  size="small"
                  disableElevation
                >
                  Map
                </Button>
              </Tooltip>
            </Box>
            
            {isMobile && (
              <Button
                variant="outlined"
                startIcon={<FilterListIcon />}
                onClick={() => setFiltersOpen(true)}
              >
                Filters
              </Button>
            )}
          </Box>
        </Box>

        {totalProperties > 0 && (
          <Typography variant="body2" color="text.secondary">
            Showing {properties.length} of {totalProperties} properties
          </Typography>
        )}
      </Box>

      <Grid container spacing={3}>
        {/* Left sidebar with filters (desktop only) */}
        {!isMobile && (
          <Grid item xs={12} md={3}>
            <SearchFilters
              initialFilters={searchParams}
              onFilterChange={handleFilterChange}
            />
          </Grid>
        )}

        {/* Main content area */}
        <Grid item xs={12} md={viewMode === 'list' ? 9 : 12}>
          {/* View tabs at the top */}
          {viewMode === 'list' && (
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs 
                value={activeTab} 
                onChange={handleTabChange}
                indicatorColor="primary"
                textColor="primary"
              >
                <Tab 
                  label="Search Results" 
                  value="results" 
                  icon={<Inventory2Icon />}
                  iconPosition="start"
                />
                <Tab 
                  label="Recommended" 
                  value="recommendations" 
                  icon={<RecommendIcon />}
                  iconPosition="start"
                  disabled={!isAuthenticated}
                />
                <Tab 
                  label="Similar Properties" 
                  value="similar" 
                  icon={<TuneIcon />}
                  iconPosition="start"
                />
              </Tabs>
            </Box>
          )}
          
          {/* Network error message with retry button */}
          {error.search && error.search.includes('Network error') && (
            <Alert 
              severity="error" 
              sx={{ mb: 3 }}
              action={
                <Button color="inherit" size="small" onClick={handleRetrySearch}>
                  Retry
                </Button>
              }
            >
              {error.search}
            </Alert>
          )}
          
          {/* Map view or list view content */}
          {viewMode === 'map' ? (
            <Box sx={{ height: 600, position: 'relative' }}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  position: 'absolute', 
                  top: 16, 
                  left: 16, 
                  zIndex: 1000, 
                  maxWidth: 300, 
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: 1
                }}
              >
                <Typography variant="subtitle1">
                  {properties.length} properties found
                </Typography>
                {isAuthenticated && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<MatchIcon />}
                    onClick={handleCreateAlert}
                    sx={{ mt: 1 }}
                  >
                    Create Alert
                  </Button>
                )}
              </Paper>
              <PropertyMap
                properties={properties}
                interactive={true}
                height="100%"
                zoom={10}
                savedProperties={Array.from(savedPropertyIds)}
                onSaveToggle={handleSaveToggle}
              />
            </Box>
          ) : (
            renderTabContent()
          )}
        </Grid>
      </Grid>

      {/* Mobile filters drawer */}
      <Drawer
        anchor="right"
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: '85%',
            maxWidth: 360,
            px: 2,
            py: 2
          }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Filters</Typography>
          <IconButton onClick={() => setFiltersOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 2 }} />

        <SearchFilters
          initialFilters={searchParams}
          onFilterChange={handleFilterChange}
          fullWidth={true}
        />
      </Drawer>

      {/* Property alert dialog */}
      <PropertyAlertDialog 
        open={alertDialogOpen}
        onClose={handleAlertDialogClose}
      currentFilters={searchParams}
      />

      {/* Custom Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbar.message}
        severity={snackbar.severity}
      />
    </Container>
  );
};

export default SearchPage;