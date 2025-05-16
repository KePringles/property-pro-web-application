// Updated solution for HomeRouter.js
import React, { useEffect } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '../../hooks/useAuth';

// Import home pages for different user types
import SeekerHome from '../../pages/home/SeekerHome';
import OwnerHome from '../../pages/home/OwnerHome';
import AgentHome from '../../pages/home/AgentHome';

/**
 * Router component that directs users to the appropriate homepage based on their role
 * If not authenticated, shows the general homepage
 */
const HomeRouter = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  
  // Enhanced debugging to check user information
  useEffect(() => {
    console.log('HomeRouter - Auth state:', {
      isAuthenticated,
      isLoading,
      user: user ? {
        ...user,
        user_type: user.user_type,
        active_user_type: user.active_user_type,
        user_type_type: typeof user.user_type,
        isArray: Array.isArray(user.user_type)
      } : null
    });
    
    // Log the raw user object for debugging
    if (user) {
      console.log('Raw user object:', JSON.stringify(user, null, 2));
    }
  }, [isAuthenticated, isLoading, user]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // If not authenticated, show the main home page
  if (!isAuthenticated || !user) {
    console.log('HomeRouter - User not authenticated, showing default home');
    return <SeekerHome isPublic={true} />;
  }

  try {
    // FIXED: Always prioritize active_user_type first
    let effectiveUserType = '';
    
    // First check active_user_type as the primary source of truth
    if (user.active_user_type) {
      effectiveUserType = user.active_user_type;
      console.log('HomeRouter - Using active_user_type:', effectiveUserType);
    }
    // Only if active_user_type isn't available, try to determine from user_type
    else if (typeof user.user_type === 'string') {
      effectiveUserType = user.user_type;
      console.log('HomeRouter - user_type is a string:', effectiveUserType);
    } else if (Array.isArray(user.user_type) && user.user_type.length > 0) {
      effectiveUserType = user.user_type[0];
      console.log('HomeRouter - Using first element from user_type array:', effectiveUserType);
    }
    
    console.log('HomeRouter - Final effective user type:', effectiveUserType);
    
    // Normalize the userType for matching by making it lowercase and removing spaces
    const normalizedUserType = effectiveUserType.toLowerCase().replace(/\s+/g, '');
    
    // Direct to the appropriate home page based on user role
    if (normalizedUserType.includes('owner')) {
      console.log('HomeRouter - Routing to Owner Home');
      return <OwnerHome />;
    } else if (normalizedUserType.includes('agent')) {
      console.log('HomeRouter - Routing to Agent Home');
      return <AgentHome />;
    } else if (normalizedUserType.includes('seeker')) {
      console.log('HomeRouter - Routing to Seeker Home');
      return <SeekerHome />;
    } else {
      // Default to seeker home as a last resort
      console.log('HomeRouter - Unable to determine user type, defaulting to Seeker Home');
      return <SeekerHome />;
    }
  } catch (error) {
    console.error('HomeRouter - Error rendering home page:', error);
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5" color="error" gutterBottom>
          Error Loading Home Page
        </Typography>
        <Typography variant="body1">
          There was a problem loading your home page. Please try refreshing the page.
        </Typography>
      </Box>
    );
  }
};

export default HomeRouter;