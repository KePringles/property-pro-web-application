// src/pages/NotFound.js
import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <Container maxWidth="md">
      <Box sx={{ 
        textAlign: 'center', 
        py: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh'
      }}>
        <Typography variant="h1" color="primary" sx={{ fontSize: { xs: '6rem', md: '8rem' }, fontWeight: 'bold' }}>
          404
        </Typography>
        
        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          Page Not Found
        </Typography>
        
        <Typography variant="body1" paragraph sx={{ maxWidth: 500, mb: 4 }}>
          The page you are looking for might have been removed, had its name changed, 
          or is temporarily unavailable.
        </Typography>
        
        <Button 
          component={Link} 
          to="/" 
          variant="contained" 
          size="large"
        >
          Return to Home
        </Button>
      </Box>
    </Container>
  );
};

export default NotFound;