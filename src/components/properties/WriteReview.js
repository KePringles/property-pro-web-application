// src/components/properties/WriteReview.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Rating,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Autocomplete,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import { styled } from '@mui/material/styles';
import StarIcon from '@mui/icons-material/Star';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';

// Custom styled components for rating labels
const StyledRating = styled(Rating)(({ theme }) => ({
  '& .MuiRating-iconFilled': {
    color: theme.palette.primary.main,
  },
  '& .MuiRating-iconHover': {
    color: theme.palette.primary.light,
  },
}));

// Rating labels for each score
const ratingLabels = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Very Good',
  5: 'Excellent'
};

const WriteReview = ({ 
  propertyId, 
  propertyTitle,
  onSubmitSuccess,
  onCancel
}) => {
  const { user, isAuthenticated } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [availableAmenities, setAvailableAmenities] = useState([]);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  
  // Form state
  const [reviewData, setReviewData] = useState({
    rating: 0,
    title: '',
    content: '',
    visitDate: '',
    verified: false,
    amenities: [],
    photos: []
  });
  
  // Custom amenity input
  const [customAmenity, setCustomAmenity] = useState('');
  
  // Form validation state
  const [errors, setErrors] = useState({});
  
  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // Define steps
  const steps = ['Rate Your Experience', 'Write Your Review', 'Add Details'];
  
  // Mock API base URL
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  
  // Check if user is authenticated
  useEffect(() => {
    if (!isAuthenticated && !user) {
      setLoginDialogOpen(true);
    }
  }, [isAuthenticated, user]);
  
  // Fetch available amenities
  useEffect(() => {
    const fetchAmenities = async () => {
      try {
        const response = await axios.get(`${API_URL}/amenities`);
        if (response.data && Array.isArray(response.data.amenities)) {
          setAvailableAmenities(response.data.amenities.map(a => a.name || a));
        } else if (response.data && Array.isArray(response.data)) {
          setAvailableAmenities(response.data.map(a => a.name || a));
        } else {
          // Fallback to mock amenities
          setAvailableAmenities([
            'Swimming Pool', 'Air Conditioning', 'Garden', 'Parking', 'Security System', 
            'Internet/WiFi', 'Furnished', 'Balcony', 'Gym', 'Pet-Friendly', 
            'Beach Access', 'Mountain View', 'Solar Power', 'Backup Generator'
          ]);
        }
      } catch (error) {
        console.error('Error fetching amenities:', error);
        // Fallback to mock amenities
        setAvailableAmenities([
          'Swimming Pool', 'Air Conditioning', 'Garden', 'Parking', 'Security System', 
          'Internet/WiFi', 'Furnished', 'Balcony', 'Gym', 'Pet-Friendly', 
          'Beach Access', 'Mountain View', 'Solar Power', 'Backup Generator'
        ]);
      }
    };
    
    fetchAmenities();
  }, []);
  
  // Handle input changes
  const handleInputChange = (field, value) => {
    setReviewData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field if it exists
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };
  
  // Handle adding custom amenity
  const handleAddCustomAmenity = () => {
    if (customAmenity.trim() !== '') {
      setReviewData(prev => ({
        ...prev,
        amenities: [...prev.amenities, customAmenity.trim()]
      }));
      setCustomAmenity('');
    }
  };
  
  // Handle photo upload
  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    const newPhotos = [...reviewData.photos];
    
    files.forEach(file => {
      // Create object URL for preview
      const photoObject = {
        file,
        preview: URL.createObjectURL(file)
      };
      newPhotos.push(photoObject);
    });
    
    setReviewData(prev => ({
      ...prev,
      photos: newPhotos
    }));
  };
  
  // Handle photo removal
  const handleRemovePhoto = (index) => {
    const newPhotos = [...reviewData.photos];
    
    // Revoke object URL to prevent memory leaks
    if (newPhotos[index].preview) {
      URL.revokeObjectURL(newPhotos[index].preview);
    }
    
    newPhotos.splice(index, 1);
    setReviewData(prev => ({
      ...prev,
      photos: newPhotos
    }));
  };
  
  // Validate current step
  const validateStep = () => {
    const newErrors = {};
    
    // Step 0: Rating validation
    if (activeStep === 0) {
      if (reviewData.rating === 0) {
        newErrors.rating = 'Please provide a rating';
      }
    }
    
    // Step 1: Review content validation
    else if (activeStep === 1) {
      if (!reviewData.title.trim()) {
        newErrors.title = 'Please provide a title for your review';
      }
      if (!reviewData.content.trim()) {
        newErrors.content = 'Please provide review content';
      } else if (reviewData.content.trim().length < 20) {
        newErrors.content = 'Review content should be at least 20 characters';
      }
    }
    
    // Step 2: Visit date validation if verified
    else if (activeStep === 2 && reviewData.verified) {
      if (!reviewData.visitDate) {
        newErrors.visitDate = 'Please provide your visit date';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle next step
  const handleNext = () => {
    if (validateStep()) {
      setActiveStep(prev => prev + 1);
    }
  };
  
  // Handle back step
  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };
  
  // Handle review submission
  const handleSubmit = async () => {
    if (!validateStep()) {
      return;
    }
    
    setSubmitting(true);
    setSubmitError(null);
    
    try {
      // Create form data for file upload
      const formData = new FormData();
      formData.append('propertyId', propertyId);
      formData.append('rating', reviewData.rating);
      formData.append('title', reviewData.title);
      formData.append('content', reviewData.content);
      formData.append('verified', reviewData.verified);
      
      if (reviewData.verified && reviewData.visitDate) {
        formData.append('visitDate', reviewData.visitDate);
      }
      
      if (reviewData.amenities.length > 0) {
        formData.append('amenities', JSON.stringify(reviewData.amenities));
      }
      
      // Append photos if any
      reviewData.photos.forEach((photo, index) => {
        formData.append(`photos[${index}]`, photo.file);
      });
      
      // Send review to API
      // const response = await axios.post(`${API_URL}/properties/${propertyId}/reviews`, formData);
      
      // Simulate API call success
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSubmitSuccess(true);
      
      // Call success callback if provided
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
      
      // Reset form after 2 seconds
      setTimeout(() => {
        setReviewData({
          rating: 0,
          title: '',
          content: '',
          visitDate: '',
          verified: false,
          amenities: [],
          photos: []
        });
        setActiveStep(0);
        setSubmitSuccess(false);
      }, 2000);
      
    } catch (error) {
      console.error('Error submitting review:', error);
      setSubmitError('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Handle login redirect
  const handleLoginRedirect = () => {
    // Redirect to login page with return URL
    window.location.href = `/login?returnUrl=${encodeURIComponent(window.location.pathname)}`;
  };
  
  // Render step content
  const getStepContent = (step) => {
    switch (step) {
      case 0: // Rating step
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h6" gutterBottom align="center">
              How would you rate your experience with this property?
            </Typography>
            <Box sx={{ my: 3 }}>
              <StyledRating
                name="rating"
                value={reviewData.rating}
                onChange={(e, newValue) => handleInputChange('rating', newValue)}
                precision={1}
                size="large"
                icon={<StarIcon fontSize="inherit" />}
                emptyIcon={<StarIcon fontSize="inherit" />}
              />
              {reviewData.rating > 0 && (
                <Typography variant="body1" align="center" sx={{ mt: 1 }}>
                  {ratingLabels[reviewData.rating]}
                </Typography>
              )}
            </Box>
            {errors.rating && (
              <Alert severity="error" sx={{ mt: 1 }}>
                {errors.rating}
              </Alert>
            )}
          </Box>
        );
      
      case 1: // Review content step
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Share your thoughts about this property
            </Typography>
            <TextField
              label="Review Title"
              fullWidth
              margin="normal"
              value={reviewData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              error={Boolean(errors.title)}
              helperText={errors.title}
              placeholder="Sum up your experience in a title"
            />
            <TextField
              label="Review Content"
              fullWidth
              multiline
              rows={6}
              margin="normal"
              value={reviewData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              error={Boolean(errors.content)}
              helperText={errors.content || 'Share the details of your experience (min. 20 characters)'}
              placeholder="Tell others what you liked or disliked about this property, and why."
            />
          </Box>
        );
      
      case 2: // Additional details step
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Additional Details
            </Typography>
            
            {/* Verification section */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={reviewData.verified}
                      onChange={(e) => handleInputChange('verified', e.target.checked)}
                    />
                  }
                  label="I have actually visited or stayed at this property"
                />
                <Tooltip title="Verified reviews help others make informed decisions and increase the credibility of your review">
                  <IconButton size="small">
                    <HelpOutlineIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              
              {reviewData.verified && (
                <TextField
                  type="date"
                  label="When did you visit?"
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  margin="normal"
                  value={reviewData.visitDate}
                  onChange={(e) => handleInputChange('visitDate', e.target.value)}
                  error={Boolean(errors.visitDate)}
                  helperText={errors.visitDate}
                />
              )}
            </Box>
            
            {/* Amenities section */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Which amenities did you use or notice during your visit?
              </Typography>
              <Autocomplete
                multiple
                id="amenities-autocomplete"
                options={availableAmenities.filter(amenity => !reviewData.amenities.includes(amenity))}
                freeSolo
                value={reviewData.amenities}
                onChange={(e, newValue) => handleInputChange('amenities', newValue)}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      label={option}
                      {...getTagProps({ index })}
                      key={index}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Amenities"
                    placeholder="Select or type amenities"
                  />
                )}
              />
              
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                <TextField
                  label="Add custom amenity"
                  value={customAmenity}
                  onChange={(e) => setCustomAmenity(e.target.value)}
                  sx={{ flexGrow: 1, mr: 1 }}
                />
                <Button
                  variant="outlined"
                  onClick={handleAddCustomAmenity}
                  disabled={!customAmenity.trim()}
                  startIcon={<AddIcon />}
                >
                  Add
                </Button>
              </Box>
            </Box>
            
            {/* Photos section */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Add photos of your experience (optional)
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<PhotoCameraIcon />}
                >
                  Upload Photos
                  <input
                    type="file"
                    hidden
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                  />
                </Button>
                <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                  Max 5 photos, 10MB each
                </Typography>
              </Box>
              
              {reviewData.photos.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {reviewData.photos.map((photo, index) => (
                    <Box key={index} sx={{ position: 'relative' }}>
                      <img
                        src={photo.preview}
                        alt={`Review photo ${index + 1}`}
                        style={{
                          width: 100,
                          height: 100,
                          objectFit: 'cover',
                          borderRadius: 4
                        }}
                      />
                      <IconButton
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: -8,
                          right: -8,
                          bgcolor: 'background.paper',
                          '&:hover': {
                            bgcolor: 'error.light',
                            color: 'white'
                          }
                        }}
                        onClick={() => handleRemovePhoto(index)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <Paper sx={{ p: 3, mb: 4 }}>
      <Typography variant="h5" gutterBottom>
        Write a Review for {propertyTitle}
      </Typography>
      
      {/* Stepper */}
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      {/* Success message */}
      {submitSuccess ? (
        <Alert severity="success" sx={{ mt: 2 }}>
          Your review has been submitted successfully! Thank you for sharing your experience.
        </Alert>
      ) : (
        <>
          {/* Display error message if any */}
          {submitError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {submitError}
            </Alert>
          )}
          
          {/* Step content */}
          {getStepContent(activeStep)}
          
          {/* Navigation buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              onClick={onCancel}
              sx={{ mr: 1 }}
            >
              Cancel
            </Button>
            <Box>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                sx={{ mr: 1 }}
              >
                Back
              </Button>
              
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? <CircularProgress size={24} sx={{ mr: 1 }} /> : null}
                  Submit Review
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>
        </>
      )}
      
      {/* Login dialog */}
      <Dialog open={loginDialogOpen} onClose={() => setLoginDialogOpen(false)}>
        <DialogTitle>Login Required</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You need to be logged in to write a review. Would you like to login now?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLoginDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleLoginRedirect} variant="contained">
            Login
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default WriteReview;