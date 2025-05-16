// src/pages/home/SeekerHome.js
import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Box, Grid, Button, Paper, CircularProgress, Alert,
  TextField, InputAdornment, FormControl, InputLabel, Select, MenuItem, Slider,
  Autocomplete, Chip, Card, CardMedia, CardContent, CardActions, Avatar, Rating,
  Divider, Tab, Tabs, Tooltip, Badge, IconButton, Dialog, DialogContent, DialogTitle,
  DialogActions, AppBar, Toolbar, useMediaQuery, useTheme
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import FeaturedPlayListIcon from '@mui/icons-material/FeaturedPlayList';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import RecommendIcon from '@mui/icons-material/Recommend';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import TuneIcon from '@mui/icons-material/Tune';
import HomeIcon from '@mui/icons-material/Home';
import BathtubIcon from '@mui/icons-material/Bathtub';
import HotelIcon from '@mui/icons-material/Hotel';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import DownloadIcon from '@mui/icons-material/Download';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '../../hooks/useAuth';
import { getPropertyId } from '../../utils/propertyUtils';

import axios from 'axios';
import AppleIcon from '@mui/icons-material/Apple';
import AndroidIcon from '@mui/icons-material/Android';

// List of parishes in Jamaica
const parishes = [
  'Kingston', 'St. Andrew', 'St. Catherine', 'Clarendon', 
  'Manchester', 'St. Elizabeth', 'Westmoreland', 'Hanover', 
  'St. James', 'Trelawny', 'St. Ann', 'St. Mary', 
  'Portland', 'St. Thomas'
];

// Cities for each parish (simplified - expand with actual data)
const citiesByParish = {
  'Kingston': ['Downtown Kingston', 'New Kingston', 'Half Way Tree'],
  'St. Andrew': ['Liguanea', 'Constant Spring', 'Stony Hill', 'Barbican'],
  'St. Catherine': ['Portmore', 'Spanish Town', 'Old Harbour', 'Linstead'],
  // Add more cities for other parishes
};

// Common amenities
const commonAmenities = [
  'Swimming Pool', 'Air Conditioning', 'Garden', 'Parking', 'Security System',
  'Internet/WiFi', 'Furnished', 'Balcony', 'Gym', 'Pet-Friendly',
  'Beach Access', 'Mountain View', 'Solar Power', 'Backup Generator'
];

// Testimonials data
const testimonials = [
  {
    id: 1,
    name: 'Sarah Johnson',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    role: 'Property Seeker',
    rating: 5,
    comment: 'Property Pro helped me find my dream home in just two weeks! The AI recommendations were spot on and the virtual tours saved me so much time.',
    date: '2025-03-15'
  },
  {
    id: 2,
    name: 'Marcus Brown',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    role: 'Property Owner',
    rating: 4.5,
    comment: 'As a property owner, I was able to find qualified tenants within days. The platform is incredibly user-friendly and the support team is responsive.',
    date: '2025-03-02'
  },
  {
    id: 3,
    name: 'Tanesha Williams',
    avatar: 'https://randomuser.me/api/portraits/women/63.jpg',
    role: 'Property Seeker',
    rating: 5,
    comment: 'I love how I could specify exactly what I wanted and get personalized recommendations. Found my perfect apartment in St. Andrew with all the amenities I needed.',
    date: '2025-02-20'
  }
];

// App features for marketing section
const appFeatures = [
  {
    title: 'AI-Powered Recommendations',
    description: 'Get personalized property suggestions based on your preferences',
    icon: <RecommendIcon fontSize="large" />
  },
  {
    title: 'Virtual Tours',
    description: 'Tour properties from the comfort of your home',
    icon: <HomeIcon fontSize="large" />
  },
  {
    title: 'Verified Listings',
    description: 'All properties are verified by our team',
    icon: <VerifiedUserIcon fontSize="large" />
  },
  {
    title: 'Neighborhood Insights',
    description: 'Discover amenities and services near each property',
    icon: <LocationOnIcon fontSize="large" />
  }
];

const SeekerHome = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  // States for loading and data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [properties, setProperties] = useState([]);
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [recommendedProperties, setRecommendedProperties] = useState([]);
  
  // States for search UI
  const [advancedSearchOpen, setAdvancedSearchOpen] = useState(false);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [appDownloadOpen, setAppDownloadOpen] = useState(false);
  
  // City options based on selected parish
  const [cityOptions, setCityOptions] = useState([]);
  
  // Advanced search filters
  const [searchFilters, setSearchFilters] = useState({
    keyword: '',
    parish: '',
    city: '',
    minPrice: 5000000,
    maxPrice: 50000000,
    bedrooms: 0,
    bathrooms: 0,
    amenities: [],
    customAmenity: ''
  });
  
  // Preference weights for AI recommendations
  const [preferenceWeights, setPreferenceWeights] = useState({
    price: 5,
    location: 5,
    size: 5,
    amenities: 5
  });

  // Format price for display
  const formatPrice = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'JMD',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Update city options when parish changes
  useEffect(() => {
    if (searchFilters.parish && citiesByParish[searchFilters.parish]) {
      setCityOptions(citiesByParish[searchFilters.parish]);
    } else {
      setCityOptions([]);
    }
    
    // Reset city when parish changes
    setSearchFilters(prev => ({
      ...prev,
      city: ''
    }));
  }, [searchFilters.parish]);
  
  // Auto-rotate testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setTestimonialIndex((prevIndex) => 
        prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
      );
    }, 8000);
    
    return () => clearInterval(timer);
  }, []);

  // Handle search form submission
  // In SeekerHome.js, update handleSearch function
const handleSearch = (e) => {
  if (e) e.preventDefault();
  
  // Construct query params
  const queryParams = new URLSearchParams();
  
  // Add all filter parameters to query with CORRECTED PARAMETER NAMES
  if (searchFilters.keyword) queryParams.set('keyword', searchFilters.keyword);
  if (searchFilters.parish) queryParams.set('parish', searchFilters.parish); // Keep original for now
  if (searchFilters.city) queryParams.set('city', searchFilters.city);
  
  // Fix parameter names to match what SearchPage expects
  queryParams.set('min_price', searchFilters.minPrice.toString());
  queryParams.set('max_price', searchFilters.maxPrice.toString());
  
  if (searchFilters.bedrooms > 0) queryParams.set('min_bedrooms', searchFilters.bedrooms.toString());
  if (searchFilters.bathrooms > 0) queryParams.set('min_bathrooms', searchFilters.bathrooms.toString());
  
  // Add amenities as comma-separated list
  if (searchFilters.amenities.length > 0) {
    queryParams.set('amenities', searchFilters.amenities.join(','));
  }
  
  // Add preference weights for AI recommendations
  Object.entries(preferenceWeights).forEach(([key, value]) => {
    queryParams.set(`weight_${key}`, value.toString());
  });
  
  // Navigate to search results page
  navigate(`/search?${queryParams.toString()}`);
};

  // Handle toggling advanced search - used by both the search box and the quick actions
  const toggleAdvancedSearch = () => {
    setAdvancedSearchOpen(!advancedSearchOpen);
    // If the advanced search is being opened and it's not visible in the viewport,
    // scroll to it to ensure visibility
    if (!advancedSearchOpen) {
      setTimeout(() => {
        const searchBox = document.getElementById('main-search-box');
        if (searchBox) {
          searchBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  };

  // Handle navigation actions
  const handleViewAllProperties = () => navigate('/properties');
  const handleViewAllFeatured = () => navigate('/properties?featured=true');
  const handleViewAllRecommended = () => navigate('/properties?recommended=true');

  // Update search filter values
  const handleFilterChange = (field, value) => {
    setSearchFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Update preference weights
  const handleWeightChange = (field, value) => {
    setPreferenceWeights(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Handle adding custom amenity
  const handleAddCustomAmenity = () => {
    if (searchFilters.customAmenity.trim() !== '' && 
        !searchFilters.amenities.includes(searchFilters.customAmenity.trim())) {
      setSearchFilters(prev => ({
        ...prev,
        amenities: [...prev.amenities, prev.customAmenity.trim()],
        customAmenity: ''
      }));
    }
  };

  // Define the API base URL
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Mock properties for development (fallback)
  const mockProperties = [
    {
      id: 1,
      title: 'Modern Beachfront Villa',
      price: 45000000,
      location: 'Montego Bay, St. James',
      bedrooms: 4,
      bathrooms: 3,
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 2,
      title: 'Downtown Apartment',
      price: 18500000,
      location: 'Kingston',
      bedrooms: 2,
      bathrooms: 1,
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 3,
      title: 'Luxury Family Home',
      price: 32000000,
      location: 'Mandeville, Manchester',
      bedrooms: 3,
      bathrooms: 2.5,
      image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 4,
      title: 'Oceanfront Property',
      price: 65000000,
      location: 'Ocho Rios, St. Ann',
      bedrooms: 5,
      bathrooms: 4,
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
    }
  ];

  // Load properties on component mount
  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        // First, try to get all properties
        const allPropsResponse = await axios.get(`${API_URL}/properties`);
        
        if (allPropsResponse.data && Array.isArray(allPropsResponse.data.properties)) {
          setProperties(allPropsResponse.data.properties);
        } else if (allPropsResponse.data && Array.isArray(allPropsResponse.data)) {
          setProperties(allPropsResponse.data);
        } else {
          // Fallback to mock data
          setProperties(mockProperties);
        }
        
        // Try to get featured properties 
        try {
          const featuredResponse = await axios.get(`${API_URL}/properties/featured`);
          
          if (featuredResponse.data && Array.isArray(featuredResponse.data.properties)) {
            setFeaturedProperties(featuredResponse.data.properties);
          } else if (featuredResponse.data && Array.isArray(featuredResponse.data.featured_properties)) {
            setFeaturedProperties(featuredResponse.data.featured_properties);
          } else if (featuredResponse.data && Array.isArray(featuredResponse.data)) {
            setFeaturedProperties(featuredResponse.data);
          } else {
            // If no featured properties, use the first few from all properties
            setFeaturedProperties(properties.slice(0, 4));
          }
        } catch (featuredError) {
          console.error('Error fetching featured properties:', featuredError);
          // Use the first few properties as featured
          setFeaturedProperties(properties.slice(0, 4));
        }
        
        // Only try to get recommended properties if the user is authenticated
        if (user) {
          try {
            const recommendedResponse = await axios.get(`${API_URL}/properties/recommended`);
            
            if (recommendedResponse.data && Array.isArray(recommendedResponse.data.properties)) {
              setRecommendedProperties(recommendedResponse.data.properties);
            } else if (recommendedResponse.data && Array.isArray(recommendedResponse.data)) {
              setRecommendedProperties(recommendedResponse.data);
            } else {
              // If no recommended properties, use a subset of all properties
              setRecommendedProperties(properties.slice(0, 4).reverse());
            }
          } catch (recommendedError) {
            console.error('Error fetching recommended properties:', recommendedError);
            // Use a different subset of properties as recommendations
            setRecommendedProperties(properties.slice(0, 4).reverse());
          }
        }
      } catch (error) {
        console.error('Error fetching properties:', error);
        setError('Failed to load properties. Please try again later.');
        // Fallback to mock data
        setProperties(mockProperties);
        setFeaturedProperties(mockProperties);
        setRecommendedProperties(mockProperties);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  // Utility function to get the property image URL
  const getPropertyImage = (property) => {
    return property.image_url || 
           property.main_image_url || 
           property.image || 
           'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80';
  };

  // Utility function to get the property location
  const getPropertyLocation = (property) => {
    if (property.city && property.parish?.name) {
      return `${property.city}, ${property.parish.name}`;
    } else if (property.city) {
      return property.city;
    } else if (property.parish?.name) {
      return property.parish.name;
    } else if (property.location) {
      return property.location;
    }
    return 'Jamaica';
  };

  // Property card component for reuse
  const PropertyCard = ({ property, featured = false }) => (
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
      
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="200"
          image={getPropertyImage(property)}
          alt={property.title}
          sx={{ objectFit: 'cover' }}
        />
        
        <IconButton
          aria-label="add to favorites"
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            bgcolor: 'rgba(255, 255, 255, 0.8)',
            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' }
          }}
          onClick={(e) => {
            e.stopPropagation();
            // Handle favorite logic
          }}
        >
          <FavoriteIcon color="error" />
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
        </Box>
      </CardContent>
      
      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button
          variant="contained"
          fullWidth
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/properties/${property.prop_id || property.property_id}`);
          }}
        >
          View Details
        </Button>
      </CardActions>
    </Card>
  );

  // Testimonial card component
  const TestimonialCard = ({ testimonial }) => (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Box sx={{ 
        position: 'absolute', 
        top: -10, 
        left: -10, 
        color: 'grey.200',
        fontSize: '6rem',
        opacity: 0.3,
        zIndex: 0
      }}>
        <FormatQuoteIcon fontSize="inherit" />
      </Box>
      
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, position: 'relative', zIndex: 1 }}>
        <Avatar
          src={testimonial.avatar}
          alt={testimonial.name}
          sx={{ width: 56, height: 56, mr: 2 }}
        />
        <Box>
          <Typography variant="h6">{testimonial.name}</Typography>
          <Typography variant="body2" color="text.secondary">{testimonial.role}</Typography>
          <Rating value={testimonial.rating} readOnly size="small" precision={0.5} />
        </Box>
      </Box>
      
      <Typography variant="body1" paragraph sx={{ position: 'relative', zIndex: 1, flexGrow: 1 }}>
        "{testimonial.comment}"
      </Typography>
      
      <Typography variant="caption" color="text.secondary" sx={{ position: 'relative', zIndex: 1 }}>
        {new Date(testimonial.date).toLocaleDateString(undefined, { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}
      </Typography>
    </Paper>
  );

  // App download dialog
  const AppDownloadDialog = () => (
    <Dialog 
      open={appDownloadOpen} 
      onClose={() => setAppDownloadOpen(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ pb: 0 }}>
        Download Property Pro Mobile App
        <IconButton
          aria-label="close"
          onClick={() => setAppDownloadOpen(false)}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'grey.500'
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Get all these features on your phone
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                {appFeatures.slice(0, 3).map((feature, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CheckCircleIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="body2">{feature.title}</Typography>
                  </Box>
                ))}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CheckCircleIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body2">Real-time notifications</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CheckCircleIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body2">AR property viewing</Typography>
                </Box>
              </Box>
              
              <Box sx={{ mt: 'auto', display: 'flex', gap: 2, flexDirection: isMobile ? 'column' : 'row' }}>
                <Button 
                  variant="contained" 
                  fullWidth 
                  startIcon={<DownloadIcon />}
                  onClick={() => window.open('https://play.google.com', '_blank')}
                >
                  Google Play
                </Button>
                <Button 
                  variant="contained" 
                  fullWidth 
                  startIcon={<DownloadIcon />}
                  onClick={() => window.open('https://apps.apple.com', '_blank')}
                >
                  App Store
                </Button>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box
              component="img"
              src="https://via.placeholder.com/300x500?text=Property+Pro+App"
              alt="Property Pro App"
              sx={{
                maxWidth: '100%',
                height: 'auto',
                display: 'block',
                margin: '0 auto',
                borderRadius: 2,
                boxShadow: 3
              }}
            />
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );

  return (
    <Box sx={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Hero Section with Main Search */}
      <Box
        sx={{
          position: 'relative',
          height: { xs: '700px', md: '750px' }, // Reduced height to shift search box upward
          backgroundImage: 'url(https://images.unsplash.com/photo-1580237072617-771c3ecc4a24?auto=format&fit=crop&w=2070&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pt: { xs: 4, md: 6 }, // Reduced top padding to shift content upward
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 0,
          }
        }}
      >
        <Container sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={3} justifyContent="center" alignItems="center">
            <Grid item xs={12} md={10} lg={8}>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography 
                  variant="h1" 
                  sx={{ 
                    color: 'white', 
                    fontWeight: 700, 
                    mb: 2,
                    fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.2rem' },
                    textShadow: '2px 2px 8px rgba(0,0,0,0.5)',
                    letterSpacing: '1px'
                  }}
                >
                  Find Your Dream Home in Jamaica
                </Typography>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    color: 'white', 
                    mb: 4, 
                    opacity: 0.9,
                    fontWeight: 400,
                    maxWidth: '800px',
                    mx: 'auto',
                    textShadow: '1px 1px 4px rgba(0,0,0,0.7)',
                    letterSpacing: '0.5px',
                    lineHeight: 1.5
                  }}
                >
                  Personalized property search with AI recommendations
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Paper
                id="main-search-box"
                sx={{
                  width: '100%',
                  maxWidth: '1000px',
                  mx: 'auto',
                  p: { xs: 3, md: 4 },
                  borderRadius: 3,
                  boxShadow: '0 12px 25px rgba(0,0,0,0.18)',
                  backdropFilter: 'blur(8px)',
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  overflow: 'hidden',
                  position: 'relative',
                  zIndex: 2,
                  transform: 'translateY(-30px)', // Shifted upward
                }}
              >
                <Typography 
                  variant="h5" 
                  sx={{ 
                    mb: 3, 
                    textAlign: 'center',
                    fontWeight: 600, 
                    color: 'primary.main'
                  }}
                >
                  Discover Your Perfect Property
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth>
                      <InputLabel id="parish-label">Parish</InputLabel>
                      <Select
                        labelId="parish-label"
                        id="parish"
                        value={searchFilters.parish}
                        label="Parish"
                        onChange={(e) => handleFilterChange('parish', e.target.value)}
                      >
                        <MenuItem value="">Any Parish</MenuItem>
                        {parishes.map((parish) => (
                          <MenuItem key={parish} value={parish}>{parish}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth disabled={!searchFilters.parish}>
                      <InputLabel id="city-label">City/Area</InputLabel>
                      <Select
                        labelId="city-label"
                        id="city"
                        value={searchFilters.city}
                        label="City/Area"
                        onChange={(e) => handleFilterChange('city', e.target.value)}
                      >
                        <MenuItem value="">Any City/Area</MenuItem>
                        {cityOptions.map((city) => (
                          <MenuItem key={city} value={city}>{city}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth>
                      <InputLabel id="bedrooms-label">Bedrooms</InputLabel>
                      <Select
                        labelId="bedrooms-label"
                        id="bedrooms"
                        value={searchFilters.bedrooms}
                        label="Bedrooms"
                        onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
                      >
                        <MenuItem value={0}>Any</MenuItem>
                        <MenuItem value={1}>1+</MenuItem>
                        <MenuItem value={2}>2+</MenuItem>
                        <MenuItem value={3}>3+</MenuItem>
                        <MenuItem value={4}>4+</MenuItem>
                        <MenuItem value={5}>5+</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth>
                      <InputLabel id="bathrooms-label">Bathrooms</InputLabel>
                      <Select
                        labelId="bathrooms-label"
                        id="bathrooms"
                        value={searchFilters.bathrooms}
                        label="Bathrooms"
                        onChange={(e) => handleFilterChange('bathrooms', e.target.value)}
                      >
                        <MenuItem value={0}>Any</MenuItem>
                        <MenuItem value={1}>1+</MenuItem>
                        <MenuItem value={2}>2+</MenuItem>
                        <MenuItem value={3}>3+</MenuItem>
                        <MenuItem value={4}>4+</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
                
                <Box sx={{ mt: 2, px: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Price Range: {formatPrice(searchFilters.minPrice)} - {formatPrice(searchFilters.maxPrice)}
                  </Typography>
                  <Slider
                    value={[searchFilters.minPrice, searchFilters.maxPrice]}
                    onChange={(e, newValue) => {
                      handleFilterChange('minPrice', newValue[0]);
                      handleFilterChange('maxPrice', newValue[1]);
                    }}
                    min={1000000}
                    max={100000000}
                    step={1000000}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => formatPrice(value)}
                    getAriaValueText={(value) => formatPrice(value)}
                    sx={{
                      width: '100%', 
                      '& .MuiSlider-thumb': {
                        width: 20,
                        height: 20,
                      }
                    }}
                  />
                </Box>
                  
                <Grid container spacing={2} sx={{ mt: 2 }}>
                  <Grid item xs={12} sm={6} md={8}>
                    <TextField
                      fullWidth
                      placeholder="Keywords, property name, features..."
                      variant="outlined"
                      value={searchFilters.keyword}
                      onChange={(e) => handleFilterChange('keyword', e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        width: '100%',
                        '& .MuiOutlinedInput-root': {
                          height: '100%',
                        }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={4}>
                    <Box sx={{ display: 'flex', gap: 1, height: '100%' }}>
                      <Button
                        variant="contained"
                        fullWidth
                        sx={{ 
                          height: '100%',
                          fontWeight: 600,
                          fontSize: '1rem',
                          boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
                        }}
                        onClick={handleSearch}
                      >
                        Search
                      </Button>
                      
                      <Button
                        variant="outlined"
                        sx={{ 
                          height: '100%',
                          minWidth: '120px' // Increased width to accommodate text and icon
                        }}
                        onClick={toggleAdvancedSearch}
                        startIcon={<TuneIcon />}
                      >
                        Advanced
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
                  
                                  {/* Advanced Search Panel - Improved Sizing and Styling */}
                {advancedSearchOpen && (
                  <Box 
                    sx={{ 
                      mt: 3,
                      px: 2,
                      py: 3,
                      width: '100%',
                      maxWidth: '100%',
                      borderRadius: 2,
                      backgroundColor: 'rgba(245, 247, 250, 0.85)',
                      boxShadow: 'inset 0 0 15px rgba(0,0,0,0.05)',
                      border: '1px solid rgba(0,0,0,0.08)',
                      transition: 'all 0.3s ease',
                      overflow: 'hidden' // Changed from 'visible' to 'hidden' to contain everything
                    }}
                  >
                    <Divider sx={{ mb: 3 }}>
                      <Chip 
                        label="Advanced Search Options" 
                        sx={{ 
                          fontWeight: 600, 
                          px: 2, 
                          backgroundColor: 'primary.light',
                          color: 'white'
                        }} 
                      />
                    </Divider>
                    
                    <Grid container spacing={2}>
                      {/* Amenities Selection */}
                      <Grid item xs={12} md={8}>
                        <Typography variant="subtitle2" gutterBottom fontWeight="600">
                          Desired Amenities
                        </Typography>
                        <Autocomplete
                          multiple
                          id="amenities-select"
                          options={commonAmenities.filter(
                            amenity => !searchFilters.amenities.includes(amenity)
                          )}
                          value={searchFilters.amenities}
                          onChange={(e, newValue) => handleFilterChange('amenities', newValue)}
                          renderInput={(params) => (
                            <TextField {...params} variant="outlined" placeholder="Select amenities" />
                          )}
                          renderTags={(value, getTagProps) =>
                            value.map((option, index) => (
                              <Chip 
                                label={option} 
                                {...getTagProps({ index })} 
                                key={index}
                                size="small" // Make chips smaller to fit better
                              />
                            ))
                          }
                          sx={{
                            width: '100%',
                            '& .MuiOutlinedInput-root': {
                              padding: '2px 8px'
                            },
                            '& .MuiAutocomplete-endAdornment': {
                              top: '50%',
                              transform: 'translateY(-50%)'
                            }
                          }}
                        />
                          
                        <Box sx={{ display: 'flex', mt: 2 }}>
                          <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Add custom amenity"
                            value={searchFilters.customAmenity}
                            onChange={(e) => handleFilterChange('customAmenity', e.target.value)}
                            size="small" // Smaller text field
                          />
                          <Button
                            variant="outlined"
                            onClick={handleAddCustomAmenity}
                            disabled={!searchFilters.customAmenity.trim()}
                            sx={{ ml: 1 }}
                            size="small" // Smaller button
                          >
                            <AddIcon />
                          </Button>
                        </Box>
                      </Grid>
                      
                      {/* Preference Weights */}
                      <Grid item xs={12} md={4}>
                        <Typography variant="subtitle2" gutterBottom fontWeight="600">
                          Preference Importance (for AI)
                        </Typography>
                        
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" fontWeight="500" noWrap>Price</Typography>
                            <Typography variant="body2" color="primary.main" fontWeight="bold">
                              {preferenceWeights.price}
                            </Typography>
                          </Box>
                          <Slider
                            size="small"
                            value={preferenceWeights.price}
                            min={1}
                            max={10}
                            step={1}
                            onChange={(e, newValue) => handleWeightChange('price', newValue)}
                          />
                        </Box>
                        
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" fontWeight="500" noWrap>Location</Typography>
                            <Typography variant="body2" color="primary.main" fontWeight="bold">
                              {preferenceWeights.location}
                            </Typography>
                          </Box>
                          <Slider
                            size="small"
                            value={preferenceWeights.location}
                            min={1}
                            max={10}
                            step={1}
                            onChange={(e, newValue) => handleWeightChange('location', newValue)}
                          />
                        </Box>
                        
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" fontWeight="500" noWrap>Size (Beds/Baths)</Typography>
                            <Typography variant="body2" color="primary.main" fontWeight="bold">
                              {preferenceWeights.size}
                            </Typography>
                          </Box>
                          <Slider
                            size="small"
                            value={preferenceWeights.size}
                            min={1}
                            max={10}
                            step={1}
                            onChange={(e, newValue) => handleWeightChange('size', newValue)}
                          />
                        </Box>
                        
                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" fontWeight="500" noWrap>Amenities</Typography>
                            <Typography variant="body2" color="primary.main" fontWeight="bold">
                              {preferenceWeights.amenities}
                            </Typography>
                          </Box>
                          <Slider
                            size="small"
                            value={preferenceWeights.amenities}
                            min={1}
                            max={10}
                            step={1}
                            onChange={(e, newValue) => handleWeightChange('amenities', newValue)}
                          />
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Main Content - Modified to fix responsiveness */}
      <Container maxWidth="xl" sx={{ pt: { xs: 0, md: 2 }, pb: 6 }}> {/* Reduced padding to adjust for the shifted search box */}
        {/* AI-Recommended Properties Section (if user is logged in) */}
        {user && (
          <Box mb={6}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
              <Box display="flex" alignItems="center">
                <RecommendIcon color="primary" sx={{ mr: 1, fontSize: 32 }} />
                <Typography variant="h4" fontWeight="bold">
                  Recommended For You
                </Typography>
              </Box>
              <Button 
                variant="outlined" 
                endIcon={<ArrowForwardIcon />}
                onClick={handleViewAllRecommended}
              >
                View All
              </Button>
            </Box>
            
            {error ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            ) : loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : recommendedProperties.length === 0 ? (
              <Alert severity="info" sx={{ mb: 2 }}>
                Update your preferences to get personalized property recommendations.
              </Alert>
            ) : (
              <Grid container spacing={3}>
                {recommendedProperties.slice(0, 4).map((property, index) => (
                  <Grid item xs={12} sm={6} md={3} key={property.prop_id || property.property_id}>
                    <PropertyCard property={property} />
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}

        {/* Featured Properties Section */}
        <Box mb={6}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
            <Box display="flex" alignItems="center">
              <FeaturedPlayListIcon color="primary" sx={{ mr: 1, fontSize: 32 }} />
              <Typography variant="h4" fontWeight="bold">
                Featured Properties
              </Typography>
            </Box>
            <Button 
              variant="outlined" 
              endIcon={<ArrowForwardIcon />}
              onClick={handleViewAllFeatured}
            >
              View All
            </Button>
          </Box>
          
          {error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          ) : loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : featuredProperties.length === 0 ? (
            <Alert severity="info" sx={{ mb: 2 }}>
              No featured properties available.
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {featuredProperties.slice(0, 4).map((property, index) => (
                <Grid item xs={12} sm={6} md={3} key={property.prop_id || property.property_id}>
                  <PropertyCard property={property} featured={true} />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>

        {/* All Properties Section */}
        <Box mb={6}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
            <Box display="flex" alignItems="center">
              <HomeIcon color="primary" sx={{ mr: 1, fontSize: 32 }} />
              <Typography variant="h4" fontWeight="bold">
                Latest Properties
              </Typography>
            </Box>
            <Button 
              variant="outlined" 
              endIcon={<ArrowForwardIcon />}
              onClick={handleViewAllProperties}
            >
              View All
            </Button>
          </Box>
          
          {error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          ) : loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : properties.length === 0 ? (
            <Alert severity="info" sx={{ mb: 2 }}>
              No properties found.
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {properties.slice(0, 8).map((property, index) => (
                <Grid item xs={12} sm={6} md={3} key={property.prop_id || property.property_id}>
                  <PropertyCard property={property} />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
        
        {/* Testimonials Section */}
        <Box mb={6}>
          <Typography variant="h4" align="center" fontWeight="bold" gutterBottom>
            What Our Users Say
          </Typography>
          <Typography variant="subtitle1" align="center" color="text.secondary" mb={4}>
            Join thousands of satisfied users finding their perfect properties
          </Typography>
          
          <Grid container spacing={3} justifyContent="center">
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={4} key={testimonial.id}>
                <Box sx={{ 
                  opacity: testimonialIndex === index ? 1 : 0.7,
                  transform: testimonialIndex === index ? 'scale(1)' : 'scale(0.95)',
                  transition: 'all 0.3s ease-in-out',
                }}>
                  <TestimonialCard testimonial={testimonial} />
                </Box>
              </Grid>
            ))}
          </Grid>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            {testimonials.map((_, index) => (
              <Box
                key={index}
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  bgcolor: testimonialIndex === index ? 'primary.main' : 'grey.300',
                  mx: 0.5,
                  cursor: 'pointer',
                  transition: 'background-color 0.3s'
                }}
                onClick={() => setTestimonialIndex(index)}
              />
            ))}
          </Box>
        </Box>
        
        {/* App Features Section - Modern Redesign */}
        <Box mb={6}>
          <Paper 
            sx={{ 
              p: { xs: 3, md: 5 }, 
              borderRadius: 3,
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e8f4f8 100%)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
              overflow: 'hidden',
              position: 'relative'
            }}
          >
            {/* Background decorative elements */}
            <Box 
              sx={{ 
                position: 'absolute',
                top: -100,
                right: -100,
                width: 300,
                height: 300,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(66,133,244,0.1) 0%, rgba(66,133,244,0) 70%)',
              }}
            />
            <Box 
              sx={{ 
                position: 'absolute',
                bottom: -80,
                left: -80,
                width: 200,
                height: 200,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(15,157,88,0.08) 0%, rgba(15,157,88,0) 70%)',
              }}
            />
            
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={7}>
                <Typography 
                  variant="h3" 
                  fontWeight="bold" 
                  gutterBottom
                  sx={{ 
                    background: 'linear-gradient(to right, #2c3e50, #4a6491)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 3
                  }}
                >
                  Download the Property Pro App
                </Typography>
                <Typography variant="subtitle1" paragraph sx={{ mb: 4, color: '#555', maxWidth: '90%' }}>
                  Take your property search on the go. Our mobile app offers all the features of the website plus exclusive mobile features.
                </Typography>
                
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  {appFeatures.map((feature, index) => (
                    <Grid item xs={12} sm={6} key={index}>
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          mb: 2,
                          transition: 'transform 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-5px)'
                          }
                        }}
                      >
                        <Box sx={{ 
                          p: 1.5, 
                          borderRadius: '16px', 
                          background: (() => {
                            const colors = [
                              'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                              'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                              'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                              'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                            ];
                            return colors[index % colors.length];
                          })(),
                          color: 'white',
                          mr: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                          minWidth: '52px',
                          minHeight: '52px'
                        }}>
                          {React.cloneElement(feature.icon, { fontSize: 'large' })}
                        </Box>
                        <Box>
                          <Typography 
                            variant="h6" 
                            fontWeight="bold" 
                            sx={{ 
                              fontSize: '1.1rem', 
                              color: '#2c3e50',
                              mb: 0.5 
                            }}
                          >
                            {feature.title}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ lineHeight: 1.5 }}
                          >
                            {feature.description}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
                
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 4 }}>
                  <Button 
                    variant="contained" 
                    size="large"
                    startIcon={<AppleIcon />}
                    sx={{ 
                      px: 4,
                      py: 1.5,
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #000000 0%, #434343 100%)',
                      color: '#fff',
                      boxShadow: '0 6px 15px rgba(0,0,0,0.25)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #1c1c1c 0%, #333 100%)',
                        boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
                        transform: 'translateY(-2px)'
                      },
                      transition: 'all 0.3s ease',
                      flexGrow: { xs: 1, sm: 0 }
                    }}  
                    onClick={() => window.open('https://apps.apple.com', '_blank')}
                  >
                    App Store
                  </Button>

                  <Button
                    variant="contained"
                    startIcon={<AndroidIcon />}
                    sx={{
                      px: 4,
                      py: 1.5,
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #34A853 0%, #0F9D58 100%)',
                      color: '#fff',
                      boxShadow: '0 6px 15px rgba(15, 157, 88, 0.3)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #2C8C4B 0%, #0C7A47 100%)',
                        boxShadow: '0 8px 20px rgba(15, 157, 88, 0.4)',
                        transform: 'translateY(-2px)'
                      },
                      transition: 'all 0.3s ease',
                      flexGrow: { xs: 1, sm: 0 }
                    }}
                    onClick={() => window.open('https://play.google.com', '_blank')}
                  >
                    Google Play
                  </Button>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={5}>
                <Box 
                  sx={{ 
                    position: 'relative',
                    display: 'flex',
                    justifyContent: 'center',
                    mt: { xs: 4, md: 0 }
                  }}
                >
                  {/* Decorative phone frame */}
                  <Box
                    sx={{
                      position: 'absolute',
                      width: '90%',
                      height: '106%',
                      top: '-3%',
                      border: '12px solid #333',
                      borderRadius: '36px',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                      zIndex: 1
                    }}
                  />
                  
                  {/* Actual app screenshot/mockup */}
                  <Box
                    component="img"
                    src="assets/images/download.png"
                    alt="Property Pro Mobile App"
                    sx={{
                      width: '85%',
                      maxWidth: 300,
                      height: 'auto',
                      objectFit: 'cover',
                      display: 'block',
                      borderRadius: '24px',
                      boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
                      position: 'relative',
                      zIndex: 2
                    }}
                  />
                  
                  {/* App badge/verification icon */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -15,
                      right: { xs: 'calc(50% - 130px)', md: 20 },
                      bgcolor: '#fff',
                      width: 70,
                      height: 70,
                      borderRadius: '50%',
                      boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 3
                    }}
                  >
                    <VerifiedUserIcon sx={{ fontSize: 36, color: '#4285F4' }} />
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Box>
        
        {/* Quick Actions - Link Advanced Search to main search functionality */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%', borderRadius: 2 }}>
              <Typography variant="h5" gutterBottom>
                Need Assistance?
              </Typography>
              <Typography variant="body1" paragraph>
                Our team of real estate experts is ready to help you find your perfect property.
              </Typography>
              <Button
                variant="contained"
                fullWidth
                startIcon={<LocalPhoneIcon />}
                sx={{ mt: 2 }}
                onClick={() => navigate('/contact')}
              >
                Contact Us
              </Button>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%', borderRadius: 2 }}>
              <Typography variant="h5" gutterBottom>
                Save Properties
              </Typography>
              <Typography variant="body1" paragraph>
                Keep track of properties you're interested in by saving them to your account.
              </Typography>
              <Button
                variant="contained"
                fullWidth
                startIcon={<FavoriteIcon />}
                sx={{ mt: 2 }}
                onClick={() => navigate('/saved-properties')}
              >
                Saved Properties
              </Button>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%', borderRadius: 2 }}>
              <Typography variant="h5" gutterBottom>
                Advanced Search
              </Typography>
              <Typography variant="body1" paragraph>
                Fine-tune your property search with our advanced filters and AI recommendations.
              </Typography>
              <Button
                variant="contained"
                fullWidth
                startIcon={<SearchIcon />}
                sx={{ mt: 2 }}
                onClick={() => {
                  // Scroll to main search box and open advanced search
                  const searchBox = document.getElementById('main-search-box');
                  if (searchBox) {
                    searchBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // Open advanced search after scroll
                    setTimeout(() => {
                      setAdvancedSearchOpen(true);
                    }, 500);
                  } else {
                    // If element not found, fallback to regular search page
                    navigate('/search');
                  }
                }}
              >
                Advanced Search
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Container>
      
      {/* App Download Dialog */}
      <AppDownloadDialog />
    </Box>
  );
};

export default SeekerHome;