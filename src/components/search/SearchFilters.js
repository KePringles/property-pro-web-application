// src/components/search/SearchFilters.js
import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Divider, TextField, InputAdornment, 
  Slider, FormControl, InputLabel, Select, MenuItem,
  Autocomplete, Chip, Button, Accordion, AccordionSummary,
  AccordionDetails, Grid
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TuneIcon from '@mui/icons-material/Tune';
import HotelIcon from '@mui/icons-material/Hotel';
import BathtubIcon from '@mui/icons-material/Bathtub';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PriceChangeIcon from '@mui/icons-material/PriceChange';
import HomeIcon from '@mui/icons-material/Home';
import ApartmentIcon from '@mui/icons-material/Apartment';
import RecommendIcon from '@mui/icons-material/Recommend';

// List of parishes in Jamaica (for the dropdown)
const parishes = [
  'Kingston', 'St. Andrew', 'St. Catherine', 'Clarendon', 
  'Manchester', 'St. Elizabeth', 'Westmoreland', 'Hanover', 
  'St. James', 'Trelawny', 'St. Ann', 'St. Mary', 
  'Portland', 'St. Thomas'
];

// Cities for each parish (simplified - add more as needed)
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

// Property types
const propertyTypes = [
  { id: 1, name: 'House' },
  { id: 2, name: 'Apartment' },
  { id: 3, name: 'Townhouse' },
  { id: 4, name: 'Villa' },
  { id: 5, name: 'Land' },
  { id: 6, name: 'Commercial' }
];

const SearchFilters = ({ initialFilters = {}, onFilterChange, fullWidth = false }) => {
  // Format price for display
  const formatPrice = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'JMD',
      maximumFractionDigits: 0
    }).format(value);
  };
  
  // Process initial filters to match the component's state structure
  const processInitialFilters = () => {
    const processed = { ...initialFilters };
    
    // Handle price range
    if (processed.min_price !== undefined) {
      processed.minPrice = processed.min_price;
      delete processed.min_price;
    }
    
    if (processed.max_price !== undefined) {
      processed.maxPrice = processed.max_price;
      delete processed.max_price;
    }
    
    // Handle bedrooms & bathrooms
    if (processed.min_bedrooms !== undefined) {
      processed.bedrooms = processed.min_bedrooms;
      delete processed.min_bedrooms;
    }
    
    if (processed.min_bathrooms !== undefined) {
      processed.bathrooms = processed.min_bathrooms;
      delete processed.min_bathrooms;
    }
    
    // Set defaults if not provided
    return {
      keyword: '',
      parish: '',
      city: '',
      propertyType: '',
      minPrice: 5000000,
      maxPrice: 50000000,
      bedrooms: 0,
      bathrooms: 0,
      amenities: [],
      isForSale: true,
      isForRent: false,
      weights: {
        price: 5,
        location: 5,
        size: 5,
        amenities: 5
      },
      ...processed
    };
  };
  
  // State for all filter values
  const [filters, setFilters] = useState(processInitialFilters());
  
  // State for UI elements
  const [cityOptions, setCityOptions] = useState([]);
  const [customAmenity, setCustomAmenity] = useState('');
  const [weightsExpanded, setWeightsExpanded] = useState(false);
  
  // Update city options when parish changes
  useEffect(() => {
    if (filters.parish && citiesByParish[filters.parish]) {
      setCityOptions(citiesByParish[filters.parish]);
    } else {
      setCityOptions([]);
    }
    
    // Reset city when parish changes
    if (filters.city && filters.parish && !citiesByParish[filters.parish]?.includes(filters.city)) {
      handleFilterChange('city', '');
    }
  }, [filters.parish]);
  
  // Handle filter changes
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle weight changes
  const handleWeightChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      weights: {
        ...prev.weights,
        [name]: value
      }
    }));
  };
  
  // Handle price range changes
  const handlePriceRangeChange = (event, newValue) => {
    setFilters(prev => ({
      ...prev,
      minPrice: newValue[0],
      maxPrice: newValue[1]
    }));
  };
  
  // Handle adding custom amenity
  const handleAddCustomAmenity = () => {
    if (customAmenity.trim() !== '' && !filters.amenities.includes(customAmenity.trim())) {
      handleFilterChange('amenities', [...filters.amenities, customAmenity.trim()]);
      setCustomAmenity('');
    }
  };
  
  // Handle form submission
  const handleSubmit = () => {
    // Convert filter structure to the format expected by the backend
    const backendFilters = {
      keyword: filters.keyword,
      parish: filters.parish,
      city: filters.city,
      property_type_id: filters.propertyType,
      min_price: filters.minPrice,
      max_price: filters.maxPrice,
      min_bedrooms: filters.bedrooms > 0 ? filters.bedrooms : undefined,
      min_bathrooms: filters.bathrooms > 0 ? filters.bathrooms : undefined,
      amenities: filters.amenities.length > 0 ? filters.amenities : undefined,
      is_for_sale: filters.isForSale,
      is_for_rent: filters.isForRent,
      // Add weights as a separate object
      weights: {
        price: filters.weights.price,
        location: filters.weights.location,
        size: filters.weights.size,
        amenities: filters.weights.amenities
      }
    };
    
    // Remove undefined values
    Object.keys(backendFilters).forEach(key => 
      backendFilters[key] === undefined && delete backendFilters[key]
    );
    
    onFilterChange(backendFilters);
  };
  
  // Handle clear all filters
  const handleClearFilters = () => {
    const defaultFilters = {
      keyword: '',
      parish: '',
      city: '',
      propertyType: '',
      minPrice: 5000000,
      maxPrice: 50000000,
      bedrooms: 0,
      bathrooms: 0,
      amenities: [],
      isForSale: true,
      isForRent: false,
      weights: {
        price: 5,
        location: 5,
        size: 5,
        amenities: 5
      }
    };
    
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };
  
  return (
    <Box sx={{ width: fullWidth ? '100%' : '300px' }}>
      <Typography variant="h6" gutterBottom>
        <TuneIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Search Filters
      </Typography>
      
      {/* Keyword Search */}
      <TextField
        fullWidth
        margin="normal"
        label="Keyword Search"
        placeholder="Property name, features..."
        value={filters.keyword}
        onChange={(e) => handleFilterChange('keyword', e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <HomeIcon />
            </InputAdornment>
          ),
        }}
      />
      
      <Divider sx={{ my: 2 }} />
      
      {/* Location Filters */}
      <Typography variant="subtitle1" gutterBottom>
        <LocationOnIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Location
      </Typography>
      
      <FormControl fullWidth margin="normal">
        <InputLabel id="parish-label">Parish</InputLabel>
        <Select
          labelId="parish-label"
          value={filters.parish}
          label="Parish"
          onChange={(e) => handleFilterChange('parish', e.target.value)}
        >
          <MenuItem value="">Any Parish</MenuItem>
          {parishes.map((parish) => (
            <MenuItem key={parish} value={parish}>{parish}</MenuItem>
          ))}
        </Select>
      </FormControl>
      
      <FormControl fullWidth margin="normal" disabled={!filters.parish}>
        <InputLabel id="city-label">City/Area</InputLabel>
        <Select
          labelId="city-label"
          value={filters.city}
          label="City/Area"
          onChange={(e) => handleFilterChange('city', e.target.value)}
        >
          <MenuItem value="">Any City/Area</MenuItem>
          {cityOptions.map((city) => (
            <MenuItem key={city} value={city}>{city}</MenuItem>
          ))}
        </Select>
      </FormControl>
      
      <Divider sx={{ my: 2 }} />
      
      {/* Property Type */}
      <Typography variant="subtitle1" gutterBottom>
        <ApartmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Property Type
      </Typography>
      
      <FormControl fullWidth margin="normal">
        <InputLabel id="property-type-label">Property Type</InputLabel>
        <Select
          labelId="property-type-label"
          value={filters.propertyType}
          label="Property Type"
          onChange={(e) => handleFilterChange('propertyType', e.target.value)}
        >
          <MenuItem value="">Any Type</MenuItem>
          {propertyTypes.map((type) => (
            <MenuItem key={type.id} value={type.id}>{type.name}</MenuItem>
          ))}
        </Select>
      </FormControl>
      
      <Divider sx={{ my: 2 }} />
      
      {/* Price Range */}
      <Typography variant="subtitle1" gutterBottom>
        <PriceChangeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Price Range
      </Typography>
      
      <Box sx={{ px: 1, mt: 3, mb: 2 }}>
        <Typography variant="body2" gutterBottom>
          {formatPrice(filters.minPrice)} - {formatPrice(filters.maxPrice)}
        </Typography>
        <Slider
          value={[filters.minPrice, filters.maxPrice]}
          onChange={handlePriceRangeChange}
          min={1000000}
          max={100000000}
          step={1000000}
          valueLabelDisplay="auto"
          valueLabelFormat={(value) => formatPrice(value)}
        />
      </Box>
      
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <FormControl fullWidth size="small">
            <InputLabel id="min-price-label">Min Price</InputLabel>
            <Select
              labelId="min-price-label"
              value={filters.minPrice}
              label="Min Price"
              onChange={(e) => handleFilterChange('minPrice', e.target.value)}
            >
              <MenuItem value={1000000}>$1M</MenuItem>
              <MenuItem value={5000000}>$5M</MenuItem>
              <MenuItem value={10000000}>$10M</MenuItem>
              <MenuItem value={20000000}>$20M</MenuItem>
              <MenuItem value={30000000}>$30M</MenuItem>
              <MenuItem value={50000000}>$50M</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6}>
          <FormControl fullWidth size="small">
            <InputLabel id="max-price-label">Max Price</InputLabel>
            <Select
              labelId="max-price-label"
              value={filters.maxPrice}
              label="Max Price"
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
            >
              <MenuItem value={10000000}>$10M</MenuItem>
              <MenuItem value={20000000}>$20M</MenuItem>
              <MenuItem value={30000000}>$30M</MenuItem>
              <MenuItem value={50000000}>$50M</MenuItem>
              <MenuItem value={75000000}>$75M</MenuItem>
              <MenuItem value={100000000}>$100M</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      
      <Divider sx={{ my: 2 }} />
      
      {/* Bedrooms & Bathrooms */}
      <Typography variant="subtitle1" gutterBottom>
        <HotelIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Bedrooms & Bathrooms
      </Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <FormControl fullWidth margin="normal">
            <InputLabel id="bedrooms-label">Bedrooms</InputLabel>
            <Select
              labelId="bedrooms-label"
              value={filters.bedrooms}
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
        <Grid item xs={6}>
          <FormControl fullWidth margin="normal">
            <InputLabel id="bathrooms-label">Bathrooms</InputLabel>
            <Select
              labelId="bathrooms-label"
              value={filters.bathrooms}
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
      
      <Divider sx={{ my: 2 }} />
      
      {/* Amenities */}
      <Typography variant="subtitle1" gutterBottom>
        Amenities
      </Typography>
      
      <Autocomplete
        multiple
        id="amenities-select"
        options={commonAmenities.filter(
          amenity => !filters.amenities.includes(amenity)
        )}
        value={filters.amenities}
        onChange={(e, newValue) => handleFilterChange('amenities', newValue)}
        renderInput={(params) => (
          <TextField {...params} variant="outlined" placeholder="Select amenities" margin="normal" />
        )}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip
              label={option}
              {...getTagProps({ index })}
              key={index}
              size="small"
            />
          ))
        }
      />
      
      <Box sx={{ display: 'flex', mt: 1, mb: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Add custom amenity"
          value={customAmenity}
          onChange={(e) => setCustomAmenity(e.target.value)}
        />
        <Button
          variant="outlined"
          onClick={handleAddCustomAmenity}
          disabled={!customAmenity.trim()}
          sx={{ ml: 1 }}
        >
          Add
        </Button>
      </Box>
      
      <Divider sx={{ my: 2 }} />
      
      {/* Preference Weights for AI Recommendations */}
      <Accordion
        expanded={weightsExpanded}
        onChange={() => setWeightsExpanded(!weightsExpanded)}
        sx={{ 
          mb: 2,
          '&.MuiAccordion-root': {
            boxShadow: 'none',
            border: '1px solid',
            borderColor: 'divider',
            '&:before': {
              display: 'none',
            },
          }
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="preference-weights-content"
          id="preference-weights-header"
        >
          <Typography sx={{ display: 'flex', alignItems: 'center' }}>
            <RecommendIcon sx={{ mr: 1 }} />
            Recommendation Preferences
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" color="text.secondary" paragraph>
            Adjust these weights to prioritize different factors in your personalized recommendations.
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2">Price Importance</Typography>
              <Typography variant="body2" color="primary.main" fontWeight="bold">
                {filters.weights.price}
              </Typography>
            </Box>
            <Slider
              size="small"
              value={filters.weights.price}
              min={1}
              max={10}
              step={1}
              onChange={(e, newValue) => handleWeightChange('price', newValue)}
            />
          </Box>
          
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2">Location Importance</Typography>
              <Typography variant="body2" color="primary.main" fontWeight="bold">
                {filters.weights.location}
              </Typography>
            </Box>
            <Slider
              size="small"
              value={filters.weights.location}
              min={1}
              max={10}
              step={1}
              onChange={(e, newValue) => handleWeightChange('location', newValue)}
            />
          </Box>
          
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2">Size Importance (Beds/Baths)</Typography>
              <Typography variant="body2" color="primary.main" fontWeight="bold">
                {filters.weights.size}
              </Typography>
            </Box>
            <Slider
              size="small"
              value={filters.weights.size}
              min={1}
              max={10}
              step={1}
              onChange={(e, newValue) => handleWeightChange('size', newValue)}
            />
          </Box>
          
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2">Amenities Importance</Typography>
              <Typography variant="body2" color="primary.main" fontWeight="bold">
                {filters.weights.amenities}
              </Typography>
            </Box>
            <Slider
              size="small"
              value={filters.weights.amenities}
              min={1}
              max={10}
              step={1}
              onChange={(e, newValue) => handleWeightChange('amenities', newValue)}
            />
          </Box>
        </AccordionDetails>
      </Accordion>
      
      {/* Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button
          variant="outlined"
          onClick={handleClearFilters}
          sx={{ flexGrow: 1, mr: 1 }}
        >
          Clear All
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          sx={{ flexGrow: 2 }}
        >
          Apply Filters
        </Button>
      </Box>
    </Box>
  );
};

export default SearchFilters;