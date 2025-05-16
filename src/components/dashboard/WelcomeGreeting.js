// src/components/dashboard/WelcomeGreeting.js
import React from 'react';
import { Box, Typography } from '@mui/material';
import { useAuth } from '../../hooks/useAuth';

const WelcomeGreeting = () => {
  // Get user directly from auth context
  const { user } = useAuth();
  
  // Extract first name from email
  let displayName = "Kelandra";  // Hardcoded name for now
  
  // Get current time to determine greeting
  const currentHour = new Date().getHours();
  let greeting = 'Welcome';
  
  if (currentHour < 12) {
    greeting = 'Good Morning';
  } else if (currentHour < 18) {
    greeting = 'Good Afternoon';
  } else {
    greeting = 'Good Evening';
  }
  
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        {greeting}, {displayName}!
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Here's what's happening with your property journey today.
      </Typography>
    </Box>
  );
};

export default WelcomeGreeting;