// src/pages/UserDashboard.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Tabs,
  Tab,
  Typography,
  Button,
  Alert,
  Snackbar
} from '@mui/material';
import { useAuth } from '../hooks/useAuth';

import PropertySeekerContent from '../components/dashboard/PropertySeekerContent';
import PropertyOwnerContent from '../components/dashboard/PropertyOwnerContent';
import AgentContent from '../components/dashboard/AgentContent';
import ProfileTab from './user/ProfileTab';


const UserDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const { user, isAuthenticated } = useAuth();

  const urlParams = new URLSearchParams(location.search);
  const tabParam = urlParams.get('tab') || params.tab;

  const [activeTab, setActiveTab] = useState(tabParam || 'dashboard');
  const [activeRole, setActiveRole] = useState(null);
  const [error, setError] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  useEffect(() => {
    if (location.state?.error) {
      setError(location.state.error);
      setOpenSnackbar(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/dashboard' } });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  useEffect(() => {
    if (user?.active_user_type) {
      setActiveRole(user.active_user_type);
    } else if (Array.isArray(user?.user_type)) {
      setActiveRole(user.user_type[0]);
    } else if (user?.user_type) {
      setActiveRole(user.user_type);
    }
  }, [user]);
  

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    navigate(`/dashboard/${newValue}`, { replace: true });
  };

  const handleRoleChange = (role) => {
    setActiveRole(role);
    setActiveTab('dashboard');
    navigate('/dashboard/dashboard', { replace: true });
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const fullName = user?.profile?.full_name || user?.full_name || `${user?.firstName || ''} ${user?.lastName || ''}` || 'User';

  const getCommonTabs = () => [
    { label: 'Dashboard', value: 'dashboard' },
    { label: 'Profile', value: 'profile' },
  ];

  const getRoleTabs = () => {
    switch (activeRole) {
      case 'property_seeker':
        return [
          ...getCommonTabs(),
          { label: 'Saved Properties', value: 'saved' },
          { label: 'Preferences', value: 'preferences' },
          { label: 'Recently Viewed', value: 'recent' }
        ];
      case 'property_owner':
        return [
          ...getCommonTabs(),
          { label: 'My Listings', value: 'properties' },
          { label: 'Statistics', value: 'stats' }
        ];
      case 'agent':
        return [
          ...getCommonTabs(),
          { label: 'Properties', value: 'properties' },
          { label: 'Clients', value: 'clients' },
          { label: 'Statistics', value: 'stats' }
        ];
      default:
        return getCommonTabs();
    }
  };

  const renderDashboardContent = () => {
    if (activeTab === 'profile') {
      return <ProfileTab />;
    }

    switch (activeRole) {
      case 'property_seeker':
        return <PropertySeekerContent activeTab={activeTab} user={user} />;
      case 'property_owner':
        return <PropertyOwnerContent activeTab={activeTab} user={user} />;
      case 'agent':
        return <AgentContent activeTab={activeTab} user={user} />;
      default:
        return (
          <Box>
            <Alert severity="info">
              Welcome to your dashboard. Your account type is not fully configured.
            </Alert>
          </Box>
        );
    }
  };

  if (!isAuthenticated) return null;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Error snackbar */}
      <Snackbar 
        open={openSnackbar} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity="error" 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', mb: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome, {fullName}!
        </Typography>

        {/* Role Switcher */}
        {Array.isArray(user?.user_type) && user.user_type.length > 1 && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            {user.user_type.map((role) => (
              <Button
                key={role}
                variant={role === activeRole ? 'contained' : 'outlined'}
                onClick={() => handleRoleChange(role)}
                size="small"
              >
                {role.replace('property_', '').replace('_', ' ').toUpperCase()}
              </Button>
            ))}
          </Box>
        )}
      </Box>

      <Paper elevation={3}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          {getRoleTabs().map((tab) => (
            <Tab key={tab.value} label={tab.label} value={tab.value} />
          ))}
        </Tabs>

        <Box sx={{ p: 3 }}>
          {renderDashboardContent()}
        </Box>
      </Paper>
    </Container>
  );
};

export default UserDashboard;