// src/pages/AllProperties.js
import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Box, Grid, Button, Paper, CircularProgress, Alert,
  TextField, InputAdornment, FormControl, InputLabel, Select, MenuItem, Pagination
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';
import PropertyCard from '../components/properties/PropertyCard';

const AllProperties = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const queryParams = new URLSearchParams(location.search);
  
  // Extract query parameters
  const isFeatured = queryParams.get('featured') === 'true';
  const isRecommended = queryParams.get('recommended') === 'true';
  
  // States for data and UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [properties, setProperties] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [savedProperties, setSavedProperties] = useState([]);
  
  // Search filters state
  const [filters, setFilters] = useState({
    keyword: queryParams.get('keyword') || '',
    location: queryParams.get('location') || '',
    minPrice: queryParams.get('min_price') || '',
    maxPrice: queryParams.get('max_price') || '',
    bedrooms: queryParams.get('bedrooms') || '',
    bathrooms: queryParams.get('bathrooms') || '',
    propertyType: queryParams.get('property_type') || ''
  });

  // Format price for display
  const formatPrice = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'JMD',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Define the API base URL
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page
    fetchProperties(1);
  };
  
  // Handle page change
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    fetchProperties(value);
  };

  // Fetch properties from API
  const fetchProperties = async (page = 1) => {
    setLoading(true);
    
    // Build query parameters
    const params = new URLSearchParams();
    params.append('page', page);
    
    if (filters.keyword) params.append('keyword', filters.keyword);
    if (filters.location) params.append('location', filters.location);
    if (filters.minPrice) params.append('min_price', filters.minPrice);
    if (filters.maxPrice) params.append('max_price', filters.maxPrice);
    if (filters.bedrooms) params.append('bedrooms', filters.bedrooms);
    if (filters.bathrooms) params.append('bathrooms', filters.bathrooms);
    if (filters.propertyType) params.append('property_type', filters.propertyType);
    
    // Add special filters
    if (isFeatured) params.append('featured', 'true');
    if (isRecommended) params.append('recommended', 'true');
    
    try {
      let endpoint = `${API_URL}/properties`;
      
      // Choose appropriate endpoint based on filters
      if (isFeatured) {
        endpoint = `${API_URL}/properties/featured`;
      } else if (isRecommended && user) {
        endpoint = `${API_URL}/properties/recommended`;
      }
      
      console.log('Fetching properties from:', `${endpoint}?${params.toString()}`);
      
      const response = await axios.get(`${endpoint}?${params.toString()}`);
      console.log('Properties response:', response.data);
      
      if (response.data) {
        if (Array.isArray(response.data.properties)) {
          setProperties(response.data.properties);
          setTotalPages(response.data.total_pages || 1);
        } else if (Array.isArray(response.data)) {
          setProperties(response.data);
          setTotalPages(Math.ceil(response.data.length / 12) || 1); // Assuming 12 properties per page
        } else {
          console.warn('Unexpected data structure:', response.data);
          setProperties([]);
          setTotalPages(1);
        }
      } else {
        setProperties([]);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Error fetching properties:', err);
      setError('Failed to load properties. Please try again later.');
      setProperties([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user's saved properties if logged in
  const fetchSavedProperties = async () => {
    if (!user) return;
    
    try {
      const response = await axios.get(`${API_URL}/user/saved-properties`);
      console.log('Saved properties response:', response.data);
      
      if (response.data && Array.isArray(response.data.properties)) {
        setSavedProperties(response.data.properties.map(p => p.property_id || p.prop_id));
      } else if (response.data && Array.isArray(response.data)) {
        setSavedProperties(response.data.map(p => p.property_id || p.prop_id));
      }
    } catch (err) {
      console.error('Error fetching saved properties:', err);
      // Non-critical error, don't display to user
    }
  };

  // Handle save/unsave
  const handleSaveToggle = async (propertyId, isSaved) => {
    if (isSaved) {
      setSavedProperties(prev => [...prev, propertyId]);
    } else {
      setSavedProperties(prev => prev.filter(id => id !== propertyId));
    }
  };

  // Fetch properties on component mount and when filters/page change
  useEffect(() => {
    fetchProperties(currentPage);
    if (user) fetchSavedProperties();
  }, [isFeatured, isRecommended]);

  // Generate title based on filters
  const getPageTitle = () => {
    if (isFeatured) return 'Featured Properties';
    if (isRecommended) return 'Recommended Properties';
    return 'All Properties';
  };

  return (
    <Box sx={{ backgroundColor: '#f5f7fa', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4" component="h1" fontWeight="bold">
            {getPageTitle()}
          </Typography>
          
          <Button 
            variant="outlined" 
            startIcon={<FavoriteIcon />}
            onClick={() => navigate('/saved-properties')}
          >
            Saved Properties
          </Button>
        </Box>

        {/* Search Filters */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <form onSubmit={handleSearch}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Keywords"
                  placeholder="Property name, description..."
                  variant="outlined"
                  value={filters.keyword}
                  onChange={(e) => handleFilterChange('keyword', e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Location"
                  placeholder="Parish, city, area..."
                  variant="outlined"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOnIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Property Type</InputLabel>
                  <Select
                    value={filters.propertyType}
                    onChange={(e) => handleFilterChange('propertyType', e.target.value)}
                    label="Property Type"
                  >
                    <MenuItem value="">All Types</MenuItem>
                    <MenuItem value="house">House</MenuItem>
                    <MenuItem value="apartment">Apartment</MenuItem>
                    <MenuItem value="villa">Villa</MenuItem>
                    <MenuItem value="land">Land</MenuItem>
                    <MenuItem value="commercial">Commercial</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={6} md={2}>
                <TextField
                  fullWidth
                  label="Min Price (JMD)"
                  variant="outlined"
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                />
              </Grid>

              <Grid item xs={6} md={2}>
                <TextField
                  fullWidth
                  label="Max Price (JMD)"
                  variant="outlined"
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                />
              </Grid>

              <Grid item xs={6} md={2}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Bedrooms</InputLabel>
                  <Select
                    value={filters.bedrooms}
                    onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
                    label="Bedrooms"
                  >
                    <MenuItem value="">Any</MenuItem>
                    <MenuItem value="1">1+</MenuItem>
                    <MenuItem value="2">2+</MenuItem>
                    <MenuItem value="3">3+</MenuItem>
                    <MenuItem value="4">4+</MenuItem>
                    <MenuItem value="5">5+</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={6} md={2}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Bathrooms</InputLabel>
                  <Select
                    value={filters.bathrooms}
                    onChange={(e) => handleFilterChange('bathrooms', e.target.value)}
                    label="Bathrooms"
                  >
                    <MenuItem value="">Any</MenuItem>
                    <MenuItem value="1">1+</MenuItem>
                    <MenuItem value="2">2+</MenuItem>
                    <MenuItem value="3">3+</MenuItem>
                    <MenuItem value="4">4+</MenuItem>
                    <MenuItem value="5">5+</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                <Button 
                  type="submit" 
                  variant="contained" 
                  fullWidth 
                  size="large"
                  startIcon={<SearchIcon />}
                  sx={{ height: '56px' }}
                >
                  Search Properties
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>

        {/* Properties List */}
        {error ? (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        ) : loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : properties.length === 0 ? (
          <Alert severity="info" sx={{ mb: 4 }}>
            No properties found matching your criteria.
          </Alert>
        ) : (
          <>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {properties.map((property, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={property.property_id || property.prop_id || index}>
                  <PropertyCard 
                    property={property}
                    isSaved={savedProperties.includes(property.property_id || property.prop_id)}
                    onSaveToggle={handleSaveToggle}
                  />
                </Grid>
              ))}
            </Grid>

            {/* Pagination */}
            {totalPages > 1 && (
              <Box display="flex" justifyContent="center" mt={4}>
                <Pagination 
                  count={totalPages} 
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                />
              </Box>
            )}
          </>
        )}
      </Container>
    </Box>
  );
};

export default AllProperties;