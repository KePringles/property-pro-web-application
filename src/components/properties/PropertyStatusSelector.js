// src/components/properties/PropertyStatusSelector.js
import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Chip,
  FormHelperText
} from '@mui/material';

const STATUS_OPTIONS = [
  { 
    value: 'Active', 
    label: 'Active', 
    description: 'Property is visible to all users and actively on market',
    color: 'success' 
  },
  { 
    value: 'Pending', 
    label: 'Pending', 
    description: 'Property is under contract but the sale is not finalized',
    color: 'warning' 
  },
  { 
    value: 'Sold', 
    label: 'Sold', 
    description: 'Property has been sold and is no longer available',
    color: 'error' 
  },
  { 
    value: 'Rented', 
    label: 'Rented', 
    description: 'Property has been rented and is not currently available',
    color: 'secondary' 
  },
  { 
    value: 'Reserved', 
    label: 'Reserved', 
    description: 'Property is temporarily reserved',
    color: 'info' 
  },
  { 
    value: 'Inactive', 
    label: 'Inactive', 
    description: 'Property is not visible in search results',
    color: 'default' 
  }
];

const PropertyStatusSelector = ({ 
  value = 'Active', 
  onChange, 
  error, 
  helperText, 
  disabled = false,
  showLabel = true,
  size = 'medium',
  variant = 'outlined',
  fullWidth = true,
  showChip = false  // If true, shows a chip instead of the full selector
}) => {
  // Find the status object for the current value
  const currentStatus = STATUS_OPTIONS.find(status => status.value === value) || STATUS_OPTIONS[0];

  if (showChip) {
    return (
      <Chip
        label={currentStatus.label}
        color={currentStatus.color}
        variant="outlined"
        size={size === 'small' ? 'small' : 'medium'}
        sx={{ fontWeight: 500 }}
      />
    );
  }

  return (
    <FormControl 
      fullWidth={fullWidth} 
      error={!!error} 
      disabled={disabled}
      variant={variant}
      size={size}
    >
      {showLabel && <InputLabel id="property-status-label">Status</InputLabel>}
      
      <Select
        labelId="property-status-label"
        id="property-status"
        value={value}
        label={showLabel ? "Status" : undefined}
        onChange={onChange}
      >
        {STATUS_OPTIONS.map((status) => (
          <MenuItem key={status.value} value={status.value}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Chip 
                label={status.label} 
                color={status.color} 
                size="small" 
                sx={{ mr: 1, minWidth: 70 }}
              />
              <Typography variant="body2" color="text.secondary">
                {status.description}
              </Typography>
            </Box>
          </MenuItem>
        ))}
      </Select>
      
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

// Standalone function to get a color for a status
export const getStatusColor = (status) => {
  const statusOption = STATUS_OPTIONS.find(opt => opt.value === status);
  return statusOption ? statusOption.color : 'default';
};

// Standalone component for displaying property status as a chip
export const PropertyStatusChip = ({ status, size = 'medium' }) => {
  const statusOption = STATUS_OPTIONS.find(opt => opt.value === status) || STATUS_OPTIONS[0];
  
  return (
    <Chip
      label={statusOption.label}
      color={statusOption.color}
      variant="outlined"
      size={size}
      sx={{ fontWeight: 500 }}
    />
  );
};

export default PropertyStatusSelector;