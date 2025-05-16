// src/pages/Home.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import SeekerHome from './home/SeekerHome';
import OwnerHome from './home/OwnerHome';
import AgentHome from './home/AgentHome';
import { CircularProgress, Box } from '@mui/material';

const Home = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Determine which home page to display based on user role
  const renderHomeByRole = () => {
    if (!user || !user.role) {
      console.error('User role not found:', user);
      return <SeekerHome />; // Default to seeker home if role is missing
    }

    // Convert role to lowercase for case-insensitive comparison
    const role = user.role.toLowerCase();

    switch (role) {
      case 'owner':
      case 'property_owner':
        return <OwnerHome />;
      case 'agent':
      case 'property_agent':
        return <AgentHome />;
      case 'seeker':
      case 'property_seeker':
      default:
        return <SeekerHome />;
    }
  };

  return renderHomeByRole();
};

export default Home;