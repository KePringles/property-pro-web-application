import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '../../hooks/useAuth';

/**
 * Protected Route component with Role Support
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {boolean} props.ownerOnly
 * @param {boolean} props.seekerOnly
 * @param {boolean} props.agentOnly
 * @param {string[]} props.allowedRoles
 */
const PrivateRoute = ({
  children,
  ownerOnly = false,
  seekerOnly = false,
  agentOnly = false,
  allowedRoles = []
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Show loading while checking auth
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  const activeRole = user?.active_user_type;  // 👈 Correctly use active role

  // Specific role protection
  if (ownerOnly && activeRole !== 'property_owner') {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5" color="error" gutterBottom>Access Denied</Typography>
        <Typography>This page is only accessible to property owners.</Typography>
      </Box>
    );
  }

  if (seekerOnly && activeRole !== 'property_seeker') {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5" color="error" gutterBottom>Access Denied</Typography>
        <Typography>This page is only accessible to property seekers.</Typography>
      </Box>
    );
  }

  if (agentOnly && activeRole !== 'property_agent') {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5" color="error" gutterBottom>Access Denied</Typography>
        <Typography>This page is only accessible to agents.</Typography>
      </Box>
    );
  }

  // Generic allowedRoles check
  if (allowedRoles.length > 0 && !allowedRoles.includes(activeRole)) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5" color="error" gutterBottom>Access Denied</Typography>
        <Typography>You don't have permission to access this page.</Typography>
      </Box>
    );
  }

  // ✅ Passed all checks
  return children;
};

export default PrivateRoute;