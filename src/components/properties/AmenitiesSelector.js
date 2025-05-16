// src/components/properties/AmenitiesSelector.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Chip,
  TextField,
  Button,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Paper,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import { API_URL } from '../../config';

const AmenitiesSelector = ({ 
  selectedAmenities = [], 
  customAmenities = [],
  onChange,
  disabled = false
}) => {
  const [standardAmenities, setStandardAmenities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newCustomAmenity, setNewCustomAmenity] = useState('');
  const [selected, setSelected] = useState({
    standard: selectedAmenities.map(a => typeof a === 'object' ? a.amen_id : a),
    custom: customAmenities
  });

  // Fetch standard amenities from API
  useEffect(() => {
    const fetchAmenities = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_URL}/properties/amenities`);
        setStandardAmenities(response.data.amenities || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching amenities:', err);
        setError('Failed to load amenities list');
      } finally {
        setLoading(false);
      }
    };

    fetchAmenities();
  }, []);

  // Update parent component when selections change
  useEffect(() => {
    if (onChange) {
      onChange({
        standardAmenities: selected.standard,
        customAmenities: selected.custom
      });
    }
  }, [selected, onChange]);

  const handleStandardAmenityToggle = (amenityId) => {
    if (disabled) return;
    
    setSelected(prev => {
      const newStandard = prev.standard.includes(amenityId)
        ? prev.standard.filter(id => id !== amenityId)
        : [...prev.standard, amenityId];
      
      return {
        ...prev,
        standard: newStandard
      };
    });
  };

  const handleAddCustomAmenity = () => {
    if (disabled || !newCustomAmenity.trim()) return;
    
    const amenityToAdd = newCustomAmenity.trim();
    
    // Check if it already exists in custom amenities
    if (selected.custom.some(a => a.toLowerCase() === amenityToAdd.toLowerCase())) {
      return;
    }
    
    setSelected(prev => ({
      ...prev,
      custom: [...prev.custom, amenityToAdd]
    }));
    
    setNewCustomAmenity('');
  };

  const handleRemoveCustomAmenity = (amenity) => {
    if (disabled) return;
    
    setSelected(prev => ({
      ...prev,
      custom: prev.custom.filter(a => a !== amenity)
    }));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={2}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      <Paper elevation={0} variant="outlined" sx={{ p: 3, mb: 3 }}>
        <FormControl component="fieldset" fullWidth disabled={disabled}>
          <FormLabel component="legend">
            <Typography variant="h6" gutterBottom>Standard Amenities</Typography>
          </FormLabel>
          <FormGroup>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {standardAmenities.map((amenity) => (
                <FormControlLabel
                  key={amenity.amen_id}
                  control={
                    <Checkbox
                      checked={selected.standard.includes(amenity.amen_id)}
                      onChange={() => handleStandardAmenityToggle(amenity.amen_id)}
                    />
                  }
                  label={amenity.name}
                />
              ))}
            </Box>
          </FormGroup>
        </FormControl>
      </Paper>

      <Paper elevation={0} variant="outlined" sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Custom Amenities</Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Add any additional amenities that aren't on the standard list.
        </Typography>

        <Box display="flex" mb={2}>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            label="Add a custom amenity"
            value={newCustomAmenity}
            onChange={(e) => setNewCustomAmenity(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && newCustomAmenity.trim()) {
                e.preventDefault();
                handleAddCustomAmenity();
              }
            }}
            disabled={disabled}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddCustomAmenity}
            disabled={disabled || !newCustomAmenity.trim()}
            sx={{ ml: 1 }}
          >
            Add
          </Button>
        </Box>

        {selected.custom.length > 0 && (
          <Box display="flex" flexWrap="wrap" gap={1} mt={2}>
            {selected.custom.map((amenity, index) => (
              <Chip
                key={`${amenity}-${index}`}
                label={amenity}
                onDelete={disabled ? undefined : () => handleRemoveCustomAmenity(amenity)}
                color="primary"
                variant="outlined"
              />
            ))}
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default AmenitiesSelector;