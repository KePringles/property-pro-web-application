// src/components/PropertyImage.jsx
import React, { useState } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import ImageNotSupportedIcon from '@mui/icons-material/ImageNotSupported';

/**
 * A robust image component for displaying property images with loading states and fallbacks
 * 
 * @param {String} src - Primary image source URL
 * @param {String|Number} propertyId - Property ID for fallback image paths
 * @param {Number} index - Image index (for multiple images)
 * @param {String} alt - Alt text for the image
 * @param {Number|String} height - Image height
 * @param {Number|String} width - Image width
 * @param {Object} style - Additional style object
 * @param {String} className - Additional CSS classes
 */
const PropertyImage = ({
  src,
  propertyId,
  index = 1,
  alt = "Property",
  height = 200,
  width = "100%",
  style = {},
  className = ""
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  // The primary source image
  const primarySrc = src;
  
  // Generate fallback sources based on property ID and image index
  const fallbackSrc = `/images/property-${propertyId}-${index}.jpg`;
  const defaultSrc = '/images/property-default.jpg';
  
  const handleLoad = () => {
    setIsLoading(false);
  };
  
  const handleError = (e) => {
    const currentSrc = e.target.src;
    
    // If the primary source failed, try the fallback
    if (currentSrc === primarySrc) {
      console.log(`Primary image failed to load: ${primarySrc}. Trying fallback.`);
      e.target.src = fallbackSrc;
    }
    
    // If the fallback failed, use the default
    else if (currentSrc === fallbackSrc) {
      console.log(`Fallback image failed to load: ${fallbackSrc}. Using default.`);
      e.target.src = defaultSrc;
    }
    
    // If even the default failed, show the error state
    else {
      console.log(`All image sources failed for property ${propertyId}-${index}`);
      setHasError(true);
    }
    
    setIsLoading(false);
  };
  
  return (
    <Box
      className={`property-image-container ${className}`}
      sx={{
        position: 'relative',
        height: height,
        width: width,
        overflow: 'hidden',
        backgroundColor: '#f5f5f5',
        ...style
      }}
    >
      {/* Loading state */}
      {isLoading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <CircularProgress size={40} />
        </Box>
      )}
      
      {/* Error state */}
      {hasError && (
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
            flexDirection: 'column'
          }}
        >
          <ImageNotSupportedIcon sx={{ fontSize: 40, color: '#999' }} />
          <Typography variant="caption" sx={{ mt: 1 }}>
            Image not available
          </Typography>
        </Box>
      )}
      
      {/* The image itself */}
      <img
        id={`property-img-${propertyId}-${index}`}
        src={primarySrc}
        alt={`${alt} ${index}`}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          height: '100%',
          width: '100%',
          objectFit: 'cover',
          display: hasError ? 'none' : 'block'
        }}
      />
    </Box>
  );
};

export default PropertyImage;