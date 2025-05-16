// src/components/common/Header.js - With force-removal of search for non-seekers

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Container,
  Avatar,
  Button,
  Tooltip,
  useTheme,
  Divider,
  ListItemIcon,
  ListItemText,
  Badge
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { useAuth } from '../../hooks/useAuth';
import AddIcon from '@mui/icons-material/Add';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { 
    user, 
    isAuthenticated, 
    logoutUser, 
    switchUserAccount,
    userRoles,
    hasMultipleRoles,
    activeRole,
    formatRoleName
  } = useAuth();
  
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [anchorElAccounts, setAnchorElAccounts] = useState(null);
  
  // Log component rendering (debugging)
  console.log('HEADER COMPONENT RENDERING:', new Date().toISOString(), { activeRole, userType: user?.user_type });
  
  // Role detection - FORCE check using a safer approach
  const getUserType = () => {
    if (!user) return null;
    
    let userType = null;
    
    // Try using active_user_type first (most reliable)
    if (user.active_user_type) {
      userType = user.active_user_type;
    }
    // Fallback to user_type if we can't get active_user_type
    else if (user.user_type) {
      if (typeof user.user_type === 'string') {
        userType = user.user_type;
      } 
      // If it's an array, use the first element
      else if (Array.isArray(user.user_type) && user.user_type.length > 0) {
        userType = user.user_type[0];
      }
    }
    
    // Last fallback - use activeRole
    if (!userType && activeRole) {
      userType = activeRole;
    }
    
    console.log('Detected user type:', userType);
    return userType;
  };
  
  const userType = getUserType();
  
  // Strict role checking
  const isPropertySeeker = userType ? 
    userType.toLowerCase().includes('seeker') : false;
    
  const isPropertyOwner = userType ? 
    userType.toLowerCase().includes('owner') : false;
    
  const isAgent = userType ? 
    userType.toLowerCase().includes('agent') : false;
  
  console.log('Role detection results:', {
    userType,
    isPropertySeeker,
    isPropertyOwner,
    isAgent,
  });

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };
  
  const handleOpenAccountsMenu = (event) => {
    setAnchorElAccounts(event.currentTarget);
  };
  
  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };
  
  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };
  
  const handleCloseAccountsMenu = () => {
    setAnchorElAccounts(null);
  };
  
  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
    handleCloseUserMenu();
  };

  const handleSwitchAccount = async (newRole) => {
    console.log('Attempting to switch to role:', newRole);
    try {
      const response = await switchUserAccount(newRole);
      
      handleCloseAccountsMenu();
      
      // Navigate to appropriate page based on new role
      if (newRole.toLowerCase().includes('seeker')) {
        navigate('/');
      } else {
        navigate('/dashboard');
      }
      
      // Use a small timeout before reload to allow navigation to complete
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } catch (error) {
      console.error('Account switch error:', error);
      alert('Failed to switch accounts: ' + (error.message || 'Unknown error'));
    }
  };

  const handleNavigation = (path) => {
    handleCloseNavMenu();
    navigate(path);
    
    if (path === '/' && location.pathname === '/') {
      window.location.reload();
    }
  };
  
  // IMPORTANT: Force-filter the navigation links
  const getNavLinks = () => {
    console.log('Building navigation links for user type:', userType);
    
    // Base links that everyone gets
    const links = [
      { name: 'Home', path: '/' },
      { name: 'Contact', path: '/contact' }
    ];
    
    // Only show Search for property seekers or non-authenticated users
    if (!isAuthenticated || isPropertySeeker) {
      links.splice(1, 0, { name: 'Search', path: '/search' });
      console.log('Added Search link');
    } else {
      console.log('NOT adding Search link - user type is:', userType);
    }
    
    // Add Property only for property owners and agents
    if (isPropertyOwner || isAgent) {
      links.push({ name: 'Add Property', path: '/add-property' });
      console.log('Added Add Property link');
    }
    
    console.log('Final links:', links);
    return links;
  };
  
  // Force-filter the user menu items
  const getUserMenuItems = () => {
    const baseItems = [
      { name: 'Dashboard', path: '/dashboard' },
      { name: 'Profile', path: '/dashboard/profile' }
    ];
    
    // Only add Saved Properties for property seekers
    if (isPropertySeeker) {
      baseItems.push({ name: 'Saved Properties', path: '/saved-properties' });
      console.log('Added Saved Properties to menu');
    } else {
      console.log('NOT adding Saved Properties to menu - user type is:', userType);
    }
    
    baseItems.push({ name: 'Logout', action: handleLogout });
    return baseItems;
  };
  
  const pages = getNavLinks();
  const userMenuItems = getUserMenuItems();
  
  // Helper function to get cleaned user roles
  const getCleanedRoles = () => {
    if (!user || !user.user_type) return [];
    
    // Handle if user_type is a string
    if (typeof user.user_type === 'string') {
      return [user.user_type];
    }
    
    // Handle if user_type is an array
    if (Array.isArray(user.user_type)) {
      return user.user_type.map(role => {
        if (typeof role === 'string' && (role.includes('[') || role.includes('"'))) {
          try {
            const parsed = JSON.parse(role);
            if (Array.isArray(parsed) && parsed.length > 0) {
              return parsed[0];
            } else if (typeof parsed === 'string') {
              return parsed;
            }
          } catch (e) {
            return role.replace(/[\[\]"\\]/g, '');
          }
        }
        return role;
      });
    }
    
    return [];
  };
  
  // Get role icon
  const getRoleIcon = (role) => {
    const roleLower = typeof role === 'string' ? role.toLowerCase() : '';
    
    if (roleLower.includes('seeker')) {
      return <PersonIcon />;
    } else if (roleLower.includes('owner')) {
      return <HomeWorkIcon />;
    } else if (roleLower.includes('agent')) {
      return <BusinessIcon />;
    }
    
    return <PersonIcon />;
  };

  // Get cleaned roles array for role switcher
  const cleanedRoles = getCleanedRoles();
  const hasRoles = cleanedRoles.length > 0;
  const canSwitchRoles = cleanedRoles.length > 1;
  
  return (
    <AppBar position="fixed" sx={{ 
      backgroundColor: theme.palette.primary.main,
      zIndex: (theme) => theme.zIndex.drawer + 1,
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
    
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Logo with slogan - Desktop */}
          <img 
            src="/images/logo.png" 
            alt="Property Pro Logo" 
            style={{ width: 40, height: 40, marginRight: '10px', display: { xs: 'none', md: 'flex' } }} 
          />
          <Box sx={{ display: { xs: 'none', md: 'flex' }, flexDirection: 'column', marginRight: '24px' }}>
            <Typography variant="h6" component={Link} to="/" sx={{ 
              fontWeight: 'bold', 
              letterSpacing: '1px',
              textDecoration: 'none',
              color: 'white'
            }}>
              PROPERTY PRO
            </Typography>
            <Typography variant="body2" component="div" sx={{ fontSize: '0.8rem' }}>
              "Your Ideal Property Awaits"
            </Typography>
          </Box>

          {/* Mobile menu */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              {pages.map((page) => (
                <MenuItem 
                  key={page.name} 
                  onClick={() => handleNavigation(page.path)}
                >
                  <Typography textAlign="center">{page.name}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
          
          {/* Logo with slogan - Mobile */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', alignItems: 'center', flexGrow: 1 }}>
            <img 
              src="/images/logo.png" 
              alt="Property Pro Logo" 
              style={{ width: 30, height: 30, marginBottom: '2px' }} 
            />
            <Typography
              variant="h6"
              noWrap
              component={Link}
              to="/"
              sx={{
                fontFamily: 'monospace',
                fontWeight: 700,
                color: 'inherit',
                textDecoration: 'none',
                fontSize: '1rem'
              }}
            >
              PROPERTY PRO
            </Typography>
            <Typography variant="caption" sx={{ fontSize: '0.6rem' }}>
              "Your Ideal Property Awaits"
            </Typography>
          </Box>
          
          {/* Desktop menu */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {pages.map((page) => (
              <Button
                key={page.name}
                onClick={() => handleNavigation(page.path)}
                sx={{
                  my: 2,
                  mx: 1,
                  color: 'white',
                  display: 'block',
                  opacity: 0.9,
                  '&:hover': {
                    opacity: 1,
                    backgroundColor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                {page.name}
              </Button>
            ))}
          </Box>

          {/* Quick action buttons - Desktop */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, mr: 2 }}>
            <IconButton
              color="inherit"
              onClick={() => handleNavigation('/')}
              sx={{ '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}
            >
              <HomeIcon />
            </IconButton>

            {/* DIRECT CHECK - Only show search icon for property seekers or non-authenticated users */}
            {(!isAuthenticated || isPropertySeeker) && (
              <IconButton
                color="inherit"
                onClick={() => handleNavigation('/search')}
                sx={{ '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}
              >
                <SearchIcon />
              </IconButton>
            )}
          </Box>
          
          {/* Account Switcher */}
          {isAuthenticated && (
            <Box sx={{ flexGrow: 0, mr: 1 }}>
              {canSwitchRoles && (
                <Tooltip title="Switch Account Type">
                  <Button
                    onClick={handleOpenAccountsMenu}
                    color="inherit"
                    startIcon={getRoleIcon(activeRole)}
                    endIcon={<SwapHorizIcon />}
                    sx={{
                      borderRadius: '16px',
                      padding: '4px 12px',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.2)',
                      }
                    }}
                  >
                    {activeRole && activeRole.includes('property_') 
                      ? formatRoleName(activeRole)
                      : activeRole
                    }
                  </Button>
                </Tooltip>
              )}
              
              <Menu
                sx={{ mt: '45px' }}
                id="accounts-menu"
                anchorEl={anchorElAccounts}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorElAccounts)}
                onClose={handleCloseAccountsMenu}
              >
                <Typography variant="subtitle2" sx={{ px: 2, py: 1, color: 'text.secondary' }}>
                  Switch Account
                </Typography>
                <Divider />
                {cleanedRoles.map((role, index) => {
                  // Format display name
                  let displayName = role;
                  if (typeof role === 'string') {
                    if (role.includes('property_')) {
                      displayName = formatRoleName(role);
                    } else if (role.includes('owner')) {
                      displayName = 'Property Owner';
                    } else if (role.includes('seeker')) {
                      displayName = 'Property Seeker';
                    } else if (role.includes('agent')) {
                      displayName = 'Agent';
                    }
                  }
                  
                  return (
                    <MenuItem
                      key={index}
                      selected={activeRole === role}
                      onClick={() => handleSwitchAccount(role)}
                      sx={{
                        py: 1.5,
                        '&.Mui-selected': {
                          backgroundColor: 'action.selected',
                        }
                      }}
                    >
                      <ListItemIcon>
                        {getRoleIcon(role)}
                      </ListItemIcon>
                      <ListItemText primary={displayName} />
                    </MenuItem>
                  );
                })}
              </Menu>
            </Box>
          )}
          
          {/* User menu */}
          <Box sx={{ flexGrow: 0 }}>
            {isAuthenticated ? (
              <>
                <Tooltip title="Open settings">
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    {user?.profile?.profile_image ? (
                      <Avatar 
                        alt={user.profile.full_name} 
                        src={user.profile.profile_image}
                      />
                    ) : (
                      <Badge 
                        badgeContent={cleanedRoles.length > 1 ? cleanedRoles.length : 0} 
                        color="secondary"
                        invisible={!(cleanedRoles.length > 1)}
                      >
                        <Avatar>
                          <AccountCircleIcon />
                        </Avatar>
                      </Badge>
                    )}
                  </IconButton>
                </Tooltip>
                <Menu
                  sx={{ mt: '45px' }}
                  id="menu-appbar"
                  anchorEl={anchorElUser}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  {userMenuItems.map((item) => (
                    <MenuItem
                      key={item.name}
                      onClick={() => {
                        if (item.action) {
                          item.action();
                        } else {
                          navigate(item.path);
                          handleCloseUserMenu();
                        }
                      }}
                    >
                      <Typography textAlign="center">{item.name}</Typography>
                    </MenuItem>
                  ))}
                  
                  {/* Add role switcher to user menu as well for convenience */}
                  {cleanedRoles.length > 1 && (
                    <>
                      <Divider />
                      <MenuItem
                        onClick={handleOpenAccountsMenu}
                      >
                        <ListItemIcon>
                          <SwapHorizIcon />
                        </ListItemIcon>
                        <ListItemText primary="Switch Account Type" />
                      </MenuItem>
                    </>
                  )}
                </Menu>
              </>
            ) : (
              <>
                <Button 
                  color="inherit" 
                  component={Link} 
                  to="/login"
                  sx={{
                    '&:hover': { 
                      backgroundColor: 'rgba(255,255,255,0.1)',
                    }
                  }}
                >
                  Login
                </Button>
                <Button 
                  color="inherit" 
                  component={Link} 
                  to="/register"
                  variant="outlined"
                  sx={{ 
                    ml: 1, 
                    borderRadius: '2rem', 
                    border: '1.5px solid rgba(255,255,255,0.8)',
                    '&:hover': { 
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      borderColor: 'white'
                    }
                  }}
                >
                  Register
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;