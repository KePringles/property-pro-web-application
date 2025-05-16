// Footer.js - With account switching added

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  useTheme,
  Button,
  Menu,
  MenuItem,
  ListItemIcon
} from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import PersonIcon from '@mui/icons-material/Person';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import BusinessIcon from '@mui/icons-material/Business';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { useAuth } from '../../hooks/useAuth'; // Update path as needed
import AddIcon from '@mui/icons-material/Add';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, isAuthenticated, switchUserAccount } = useAuth();
  
  const [anchorEl, setAnchorEl] = React.useState(null);
  
  // Format role display name
  const formatRoleName = (role) => {
    if (!role) return '';
    return role
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  // Get role icon
  const getRoleIcon = (role) => {
    switch (role) {
      case 'property_seeker':
        return <PersonIcon />;
      case 'property_owner':
        return <HomeWorkIcon />;
      case 'agent':
        return <BusinessIcon />;
      default:
        return <PersonIcon />;
    }
  };
  
  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };
  
  const handleSwitchAccount = async (newRole) => {
    try {
      await switchUserAccount(newRole);
      handleCloseMenu();
      
      // Navigate based on the new role
      if (newRole === 'property_seeker') {
        navigate('/');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Account switch error:', error);
    }
  };
  
  // Get user roles for account switching
  const userRoles = isAuthenticated && user?.user_type ? 
    (Array.isArray(user.user_type) ? user.user_type : [user.user_type]) : 
    [];
  
  // Check if user has multiple roles for account switching
  const hasMultipleRoles = userRoles.length > 1;
  
  // Current active role
  const activeRole = user?.active_user_type || (userRoles.length > 0 ? userRoles[0] : '');
  
  // Footer sections with links
  const sections = [
    {
      title: 'Explore',
      links: [
        { name: 'Search Properties', path: '/search' },
        { name: 'Featured Listings', path: '/' },
        { name: 'Find Agents', path: '/contact' },
        { name: 'Property News', path: '/blog' }
      ]
    },
    {
      title: 'For Property Owners',
      links: [
        { name: 'List Your Property', path: '/add-property' },
        { name: 'Owner Dashboard', path: '/dashboard' },
        { name: 'Marketing Tips', path: '/market-tips' },
        { name: 'Property Management', path: '/services' }
      ]
    },
    {
      title: 'Property Pro',
      links: [
        { name: 'About Us', path: '/about' },
        { name: 'Contact Us', path: '/contact' },
        { name: 'Terms of Service', path: '/terms' },
        { name: 'Privacy Policy', path: '/privacy' }
      ]
    }
  ];
  
  return (
    <Box
      component="footer"
      sx={{
        py: 6,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) => theme.palette.mode === 'light' 
          ? theme.palette.grey[900] 
          : theme.palette.grey[900],
        color: 'white'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Brand and description */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              PROPERTY PRO
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ color: 'grey.400' }}>
              Helping Jamaicans find their perfect home. Property Pro offers a simple way to
              search for real estate across Jamaica with powerful AI-driven recommendations.
            </Typography>
            <Box sx={{ mt: 3 }}>
              <IconButton 
                component={Link}
                to="/social"
                aria-label="Social Media"
                sx={{ 
                  color: 'grey.400',
                  '&:hover': { color: '#4267B2' }
                }}
              >
                <FacebookIcon />
              </IconButton>
              <IconButton 
                component={Link}
                to="/social"
                aria-label="Social Media"
                sx={{ 
                  color: 'grey.400',
                  '&:hover': { color: '#1DA1F2' }
                }}
              >
                <TwitterIcon />
              </IconButton>
              <IconButton 
                component={Link}
                to="/social"
                aria-label="Social Media"
                sx={{ 
                  color: 'grey.400',
                  '&:hover': { color: '#E1306C' }
                }}
              >
                <InstagramIcon />
              </IconButton>
              <IconButton 
                component={Link}
                to="/social"
                aria-label="Social Media"
                sx={{ 
                  color: 'grey.400',
                  '&:hover': { color: '#0077B5' }
                }}
              >
                <LinkedInIcon />
              </IconButton>
            </Box>
            
            {/* Account Switcher - Only show if user has multiple roles */}
            {isAuthenticated && hasMultipleRoles && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ color: 'grey.400', mb: 1 }}>
                  Your Accounts
                </Typography>
                <Button
                  onClick={handleOpenMenu}
                  variant="outlined"
                  startIcon={getRoleIcon(activeRole)}
                  endIcon={<SwapHorizIcon />}
                  sx={{
                    color: 'grey.300',
                    borderColor: 'grey.700',
                    '&:hover': {
                      borderColor: 'grey.500',
                      backgroundColor: 'rgba(255,255,255,0.05)'
                    }
                  }}
                >
                  {formatRoleName(activeRole)}
                </Button>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleCloseMenu}
                  PaperProps={{
                    elevation: 3,
                    sx: {
                      backgroundColor: theme.palette.grey[800],
                      color: 'white',
                      minWidth: 200
                    }
                  }}
                >
                  <Typography variant="subtitle2" sx={{ px: 2, py: 1, color: 'grey.400' }}>
                    Switch Account
                  </Typography>
                  <Divider sx={{ borderColor: 'grey.700' }} />
                  {userRoles.map((role) => (
                    <MenuItem
                      key={role}
                      selected={activeRole === role}
                      onClick={() => handleSwitchAccount(role)}
                      sx={{
                        py: 1.5,
                        '&.Mui-selected': {
                          backgroundColor: 'rgba(255,255,255,0.1)',
                        },
                        '&:hover': {
                          backgroundColor: 'rgba(255,255,255,0.05)',
                        }
                      }}
                    >
                      <ListItemIcon sx={{ color: 'grey.300' }}>
                        {getRoleIcon(role)}
                      </ListItemIcon>
                      <ListItemText 
                        primary={formatRoleName(role)} 
                        primaryTypographyProps={{ sx: { color: 'grey.300' } }}
                      />
                    </MenuItem>
                  ))}
                </Menu>
              </Box>
            )}
          </Grid>
          
          {/* Links sections */}
          {sections.map((section) => (
            <Grid item xs={12} sm={6} md={2.5} key={section.title}>
              <Typography variant="h6" gutterBottom>
                {section.title}
              </Typography>
              <List dense>
                {section.links.map((link) => (
                  <ListItem 
                    key={link.name} 
                    disablePadding
                    component={Link}
                    to={link.path}
                    sx={{ 
                      color: 'grey.400',
                      textDecoration: 'none',
                      py: 0.5,
                      transition: 'color 0.2s',
                      '&:hover': {
                        color: 'white',
                      }
                    }}
                  >
                    <ListItemText primary={link.name} />
                  </ListItem>
                ))}
              </List>
            </Grid>
          ))}
        </Grid>
        
        <Divider sx={{ mt: 4, mb: 4, borderColor: 'grey.800' }} />
        
        <Typography variant="body2" color="text.secondary" align="center" sx={{ color: 'grey.500' }}>
          © {currentYear} Property Pro Jamaica. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;