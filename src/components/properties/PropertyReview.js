// src/components/properties/PropertyReview.js
import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Rating,
  Avatar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Divider,
  Chip,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import FlagIcon from '@mui/icons-material/Flag';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import HomeIcon from '@mui/icons-material/Home';
import { useAuth } from '../../hooks/useAuth';

// Custom styled components
const ReviewPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[3],
  },
}));

const PropertyReview = ({ 
  review, 
  onHelpful, 
  onReport, 
  propertyId,
  compact = false,
  allowActions = true
}) => {
  const { user, isAuthenticated } = useAuth();
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportError, setReportError] = useState(null);
  const [reportSuccess, setReportSuccess] = useState(false);

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  // Handle helpful button click
  const handleHelpfulClick = () => {
    if (!isAuthenticated) {
      // Redirect to login or show login dialog
      return;
    }
    
    if (onHelpful) {
      onHelpful(review.review_id, !review.userMarkedHelpful);
    }
  };

  // Handle report button click
  const handleReportClick = () => {
    if (!isAuthenticated) {
      // Redirect to login or show login dialog
      return;
    }
    
    setReportDialogOpen(true);
  };

  // Handle report submission
  const handleReportSubmit = async () => {
    if (!reportReason.trim()) {
      setReportError('Please provide a reason for reporting this review.');
      return;
    }

    setReportSubmitting(true);
    setReportError(null);

    try {
      // Call API to submit report
      if (onReport) {
        await onReport(review.review_id, reportReason);
      }
      
      setReportSuccess(true);
      // Close dialog after 2 seconds
      setTimeout(() => {
        setReportDialogOpen(false);
        setReportSuccess(false);
        setReportReason('');
      }, 2000);
    } catch (error) {
      setReportError('Failed to submit report. Please try again.');
    } finally {
      setReportSubmitting(false);
    }
  };

  return (
    <ReviewPaper elevation={1}>
      {/* Review Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar 
            src={review.user?.avatar_url || review.avatar_url} 
            alt={review.user?.name || review.name || 'User'}
            sx={{ width: 48, height: 48, mr: 2 }}
          />
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">
              {review.user?.name || review.name || 'Anonymous User'}
              {review.verified && (
                <Chip 
                  icon={<VerifiedUserIcon />} 
                  label="Verified Visit" 
                  size="small" 
                  color="primary" 
                  sx={{ ml: 1 }}
                />
              )}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formatDate(review.created_at || review.date || new Date())}
            </Typography>
          </Box>
        </Box>
        <Box>
          <Rating value={review.rating} readOnly precision={0.5} />
        </Box>
      </Box>
      
      {/* Property Info - only show in compact mode */}
      {compact && propertyId && (
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <HomeIcon color="action" sx={{ mr: 1 }} />
          <Typography 
            variant="body2" 
            color="primary"
            component="a"
            href={`/properties/${propertyId}`}
            sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
          >
            {review.property_title || 'View Property'}
          </Typography>
        </Box>
      )}
      
      {/* Review Title */}
      {review.title && (
        <Typography variant="h6" gutterBottom>
          {review.title}
        </Typography>
      )}
      
      {/* Review Content */}
      <Typography variant="body1" paragraph>
        {review.content || review.comment || 'No comment provided.'}
      </Typography>
      
      {/* Review Photos */}
      {review.photos && review.photos.length > 0 && (
        <Box sx={{ display: 'flex', gap: 1, mb: 2, overflowX: 'auto', py: 1 }}>
          {review.photos.map((photo, index) => (
            <Box
              key={index}
              component="img"
              src={photo.url || photo}
              alt={`Review photo ${index + 1}`}
              sx={{ 
                width: 100, 
                height: 100, 
                objectFit: 'cover',
                borderRadius: 1,
                cursor: 'pointer'
              }}
              onClick={() => window.open(photo.url || photo, '_blank')}
            />
          ))}
        </Box>
      )}
      
      {/* Review Amenities mentioned */}
      {review.amenities && review.amenities.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Amenities Mentioned:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {review.amenities.map((amenity, index) => (
              <Chip 
                key={index} 
                label={amenity} 
                size="small" 
                variant="outlined" 
              />
            ))}
          </Box>
        </Box>
      )}
      
      {/* Review Actions */}
      {allowActions && (
        <>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Button 
                size="small" 
                startIcon={review.userMarkedHelpful ? <ThumbUpIcon color="primary" /> : <ThumbUpIcon />}
                onClick={handleHelpfulClick}
                sx={{ mr: 1 }}
              >
                Helpful ({review.helpful_count || 0})
              </Button>
              <Button 
                size="small" 
                startIcon={<FlagIcon />}
                onClick={handleReportClick}
                color="error"
              >
                Report
              </Button>
            </Box>
            {review.property_manager_response && (
              <Chip label="Property Manager Responded" size="small" color="success" />
            )}
          </Box>
          
          {/* Property Manager Response */}
          {review.property_manager_response && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Typography variant="subtitle2" fontWeight="bold">
                Response from Property Manager:
              </Typography>
              <Typography variant="body2" paragraph>
                {review.property_manager_response}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {review.property_manager_response_date && formatDate(review.property_manager_response_date)}
              </Typography>
            </Box>
          )}
        </>
      )}
      
      {/* Report Dialog */}
      <Dialog open={reportDialogOpen} onClose={() => setReportDialogOpen(false)}>
        <DialogTitle>Report Review</DialogTitle>
        <DialogContent>
          {reportSuccess ? (
            <Alert severity="success" sx={{ mt: 2 }}>
              Your report has been submitted successfully. Thank you for helping us maintain quality reviews.
            </Alert>
          ) : (
            <>
              <Typography variant="body2" paragraph>
                Please let us know why you're reporting this review. Reports are anonymous and help us maintain a trustworthy platform.
              </Typography>
              {reportError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {reportError}
                </Alert>
              )}
              <TextField
                autoFocus
                multiline
                rows={4}
                margin="dense"
                label="Reason for reporting"
                fullWidth
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                disabled={reportSubmitting}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportDialogOpen(false)} disabled={reportSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleReportSubmit} 
            color="primary" 
            disabled={reportSubmitting || reportSuccess}
          >
            {reportSubmitting ? <CircularProgress size={24} /> : 'Submit Report'}
          </Button>
        </DialogActions>
      </Dialog>
    </ReviewPaper>
  );
};

export default PropertyReview;