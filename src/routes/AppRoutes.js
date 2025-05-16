// src/routes/AppRoutes.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Import pages
import Home from '../pages/Home';
import PropertySearch from '../pages/PropertySearch';
import PropertyDetails from '../pages/PropertyDetails';
import AddProperty from '../pages/AddProperty';
import EditProperty from '../pages/EditProperty';
import UserDashboard from '../pages/UserDashboard';
import Login from '../pages/Login';
import Register from '../pages/Register';
import NotFound from '../pages/NotFound';
import MLAdminPanel from '../pages/MLAdminPanel';

// Import property seeker specific pages
import SavedProperties from '../pages/property-seeker/SavedProperties';
import PropertyPreferences from '../pages/property-seeker/PropertyPreferences';
import ViewedHistory from '../pages/property-seeker/ViewedHistory';

/**
 * Protected route component that redirects to login if user is not authenticated
 */
const ProtectedRoute = ({ children, userTypes = null }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  // Show loading state while auth is being checked
  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: window.location.pathname }} />;
  }
  
  // Check user type restrictions if provided
  if (userTypes && Array.isArray(userTypes) && userTypes.length > 0) {
    // Only allow access if user has one of the required user types
    if (!userTypes.includes(user?.user_type)) {
      return <Navigate to="/dashboard" replace />;
    }
  }
  
  return children;
};

/**
 * Home route component that handles different user types
 */
const HomeRoute = () => {
  const { user, isAuthenticated } = useAuth();
  
  // If not authenticated, show the public home page
  if (!isAuthenticated) {
    return <Home />;
  }
  
  // If user is a property seeker, show the home page
  if (user?.user_type === 'property_seeker') {
    return <Home />;
  }
  
  // For other user types (property_owner, agent), redirect to dashboard
  return <Navigate to="/dashboard" replace />;
};

/**
 * Main application routes configuration
 */
const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<HomeRoute />} />
      <Route path="/search" element={<PropertySearch />} />
      <Route path="/properties/:id" element={<PropertyDetails />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Protected routes - require authentication */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/:tab" 
        element={
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        } 
      />
      
      {/* Property seeker only routes */}
      <Route 
        path="/saved-properties" 
        element={
          <ProtectedRoute userTypes={['property_seeker']}>
            <SavedProperties />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/preferences" 
        element={
          <ProtectedRoute userTypes={['property_seeker']}>
            <PropertyPreferences />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/viewed-history" 
        element={
          <ProtectedRoute userTypes={['property_seeker']}>
            <ViewedHistory />
          </ProtectedRoute>
        } 
      />
      
      {/* Property owner only routes */}
      <Route 
        path="/add-property" 
        element={
          <ProtectedRoute userTypes={['property_owner', 'agent']}>
            <AddProperty />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/properties/:id/edit" 
        element={
          <ProtectedRoute userTypes={['property_owner', 'agent']}>
            <EditProperty />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/ml-system" 
        element={
          <ProtectedRoute userTypes={['admin']}>
            <MLAdminPanel />
          </ProtectedRoute>
        } 
      />
      
      {/* 404 Not Found */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;