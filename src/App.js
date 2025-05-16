// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import { AuthProvider } from './hooks/useAuth';
import './styles/index.css';

// Layout components
import Header from './components/common/Header';
import Footer from './components/common/Footer';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import PropertyDetails from './pages/PropertyDetails';
import SearchPage from './pages/SearchPage';
import Dashboard from './pages/UserDashboard'; 
import AddProperty from './pages/AddProperty';
import EditProperty from './pages/EditProperty';
import Contact from './pages/Contact';
import Terms from './pages/Terms';
import NotFound from './pages/NotFound';
import PrivateRoute from './components/common/PrivateRoute'; // New component for role-based routing
import TestHome from './pages/TestHome'; // Import the test component
import HomeRouter from './components/routing/HomeRouter'; // Import the HomeRouter component
import AboutUs from './pages/AboutUs';
import SocialMedia from './pages/SocialMedia';
import PrivacyPolicy from './pages/PrivacyPolicy';
import AllProperties from './pages/AllProperties'; // Import the new AllProperties component
import FAQPage from './pages/FAQPage';
import PropertyNewsPage from './pages/PropertyNewsPage'
import PropertyManagementPage from './pages/PropertyManagementPage'
import MarketingTipsPage from './pages/MarketingTipsPage'
import MyProperties from './pages/agent/MyProperties'
// Property Owner specific pages
import PropertyList from './components/properties/PropertyList';
import PropertyStats from './pages/property-owner/PropertyStats';

// Property Seeker specific pages
import SavedProperties from './pages/property-seeker/SavedProperties';
import PropertyPreferences from './pages/property-seeker/PropertyPreferences';
import ViewedHistory from './pages/property-seeker/ViewedHistory';

// Agent specific pages
import ClientManagement from './pages/agent/ClientManagement';
import AddClient from './pages/agent/AddClient';
import ClientDetails from './pages/agent/ClientDetails';
import EditClient from './pages/agent/EditClient';

// User profile pages

import ProfileTab from './pages/user/ProfileTab';
import EditProfile from './pages/user/EditProfile';
import UserSettings from './pages/user/Settings';

const defaultShadows = createTheme().shadows;

// Create theme with modern, neutral colors
const theme = createTheme({
  palette: {
    primary: {
      main: '#2c3e50',
      light: '#3e5771',
      dark: '#1a2633',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#34495e',
      light: '#4c6781',
      dark: '#253242',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
    text: {
      primary: '#333333',
      secondary: '#5c5c5c',
    },
    grey: {
      800: '#333333',
      900: '#1e1e1e',
    },
  },
  typography: {
    fontFamily: ['Poppins', 'Roboto', 'Arial', 'sans-serif'].join(','),
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
          boxShadow: 'none',
          transition: 'all 0.2s',
        },
        contained: {
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            transform: 'translateY(-1px)',
          },
        },
        outlined: {
          borderWidth: 1.5,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: defaultShadows,
});

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header />
            <main style={{ flexGrow: 1, paddingTop: '80px' }}>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<HomeRouter />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/properties" element={<AllProperties />} /> {/* New route for all properties */}
                <Route path="/properties/:id" element={<PropertyDetails />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/test" element={<TestHome />} />
                <Route path="/about" element={<AboutUs />} />
                <Route path="/social" element={<SocialMedia />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/faq" element={<FAQPage />} />
                <Route path="/blog" element={<PropertyNewsPage />} />
                <Route path="/services" element={<PropertyManagementPage />} />
                <Route path="/market-tips" element={<MarketingTipsPage />} />
                <Route path="/my-properties" element={<MyProperties />} />



                {/* Dashboard route - now dynamically shows different content based on user role */}
                <Route path="/dashboard/:tab?" element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                } />
                
                {/* Common routes for all authenticated users */}
                <Route path="/profile" element={
                  <PrivateRoute>
                    <ProfileTab />
                  </PrivateRoute>
                } />

                <Route path="/edit-profile" element={
                    <PrivateRoute>
                     <EditProfile />
                    </PrivateRoute>
                  } />  

                <Route path="/settings" element={
                  <PrivateRoute>
                    <UserSettings />
                  </PrivateRoute>
                } />
                
                {/* Property Seeker specific routes */}
                <Route path="/saved-properties" element={
                  <PrivateRoute allowedRoles={['property_seeker']}>
                    <SavedProperties />
                  </PrivateRoute>
                } />
                <Route path="/preferences" element={
                  <PrivateRoute allowedRoles={['property_seeker']}>
                    <PropertyPreferences />
                  </PrivateRoute>
                } />
                <Route path="/viewed-history" element={
                  <PrivateRoute allowedRoles={['property_seeker']}>
                    <ViewedHistory />
                  </PrivateRoute>
                } />
                
                {/* Property Owner and Agent specific routes */}
                <Route path="/add-property" element={
                  <PrivateRoute allowedRoles={['property_owner', 'agent']}>
                    <AddProperty />
                  </PrivateRoute>
                } />
                <Route path="/my-properties" element={
                  <PrivateRoute allowedRoles={['property_owner', 'agent']}>
                    <PropertyList />
                  </PrivateRoute>
                } />
                <Route path="/properties/:id/edit" element={
                  <PrivateRoute allowedRoles={['property_owner', 'agent']}>
                    <EditProperty />
                   </PrivateRoute>
                } />
                <Route path="/property-stats" element={
                  <PrivateRoute allowedRoles={['property_owner', 'agent']}>
                    <PropertyStats />
                  </PrivateRoute>
                } />
                
                {/* Agent specific routes */}
                <Route path="/manage-clients" element={
                  <PrivateRoute allowedRoles={['agent']}>
                    <ClientManagement />
                  </PrivateRoute>
                } />
                <Route path="/add-client" element={
                  <PrivateRoute allowedRoles={['agent']}>
                    <AddClient />
                  </PrivateRoute>
                } />
                <Route path="/clients/:id" element={
                  <PrivateRoute allowedRoles={['agent']}>
                    <ClientDetails />
                  </PrivateRoute>
                } />
                <Route path="/clients/:id/edit" element={
                  <PrivateRoute allowedRoles={['agent']}>
                    <EditClient />
                  </PrivateRoute>
                } />
                
                {/* 404 route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;