// src/pages/TestHome.js
import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const TestHome = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  return (
    <Container maxWidth="md" sx={{ mt: 10, p: 4 }}>
      <Box sx={{ textAlign: 'center', p: 4, border: '1px solid #ccc', borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom>
          Test Home Page
        </Typography>
        
        <Typography variant="body1" paragraph>
          Authentication Status: <strong>{isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</strong>
        </Typography>
        
        {isAuthenticated && (
          <Typography variant="body1" paragraph>
            User Type: <strong>{user?.user_type || 'Unknown'}</strong>
          </Typography>
        )}
        
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => window.location.href = '/'}
          >
            Go to Home (Hard Refresh)
          </Button>
          
          <Button 
            variant="outlined" 
            onClick={() => navigate('/dashboard')}
          >
            Go to Dashboard
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default TestHome;
