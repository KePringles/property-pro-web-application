// src/components/layout/Navbar.js
import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
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
  Divider,
  ListItemIcon,
  ListItemText,
  Chip,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  useMediaQuery,
  useTheme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LogoutIcon from '@mui/icons-material/Logout';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PersonIcon from '@mui/icons-material/Person';
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import FavoriteIcon from '@mui/icons-material/Favorite';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpIcon from '@mui/icons-material/Help';
import AddIcon from '@mui/icons-material/Add';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

import { useAuth } from '../../hooks/useAuth';

// Logo component - replace with your actual logo
const Logo = () => (
  <Box
    component={RouterLink}
    to="/"
    sx={{
      display: 'flex',
      alignItems: 'center',
      textDecoration: 'none',
      color: 'inherit'
    }}
  >
    <Avatar
      src="/logo.svg"
      alt="Property Pro"
      variant="rounded"
      sx={{ width: 40, height: 40, mr: 1 }}
    />
    <Typography
      variant="h6"
      noWrap
      sx={{
        fontWeight: 700,
        letterSpacing: '.1rem',
        color: 'inherit',
        textDecoration: 'none'
      }}
    >
      PROPERTY PRO
    </Typography>
  </Box>
);

const Navbar = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const { user, logoutUser, isAuthenticated, switchActiveRole } = useAuth();
  
  // Menu states
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [anchorElNotifications, setAnchorElNotifications] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  
  // Handle opening/closing menus
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };
  
  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };
  
  const handleOpenNotificationsMenu = (event) => {
    setAnchorElNotifications(event.currentTarget);
  };
  
  const handleCloseNotificationsMenu = () => {
    setAnchorElNotifications(null);
  };
  
  const handleOpenMobileMenu = () => {
    setMobileMenuOpen(true);
  };
  
  const handleCloseMobileMenu = () => {
    setMobileMenuOpen(false);
  };
  
  // Handle logout
  const handleLogout = () => {
    logoutUser();
    handleCloseUserMenu();
    navigate('/');
  };
  
  // Handle role dialog
  const handleOpenRoleDialog = () => {
    setRoleDialogOpen(true);
    handleCloseUserMenu();
  };
  
  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };
  
  const handleSwitchRole = async () => {
    if (!selectedRole) return;
    
    try {
      await switchActiveRole(selectedRole);
      setRoleDialogOpen(false);
      navigate('/dashboard');
    } catch (err) {
      console.error('Error switching role:', err);
    }
  };
  
  // Navigation items based on user role
  const getNavItems = () => {
    // Default navigation items for non-authenticated users
    if (!isAuthenticated || !user) {
      return [
        { label: 'Search', path: '/search', icon: <SearchIcon /> },
        { label: 'About', path: '/about', icon: <HelpIcon /> },
        { label: 'Contact', path: '/contact', icon: <PersonIcon /> }
      ];
    }
    
    // Navigation items based on user role
    switch (user.user_type) {
      case 'property_seeker':
        return [
          { label: 'Search', path: '/search', icon: <SearchIcon /> },
          { label: 'Saved Properties', path: '/saved-properties', icon: <FavoriteIcon /> },
          { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> }
        ];
      case 'property_owner':
        return [
          { label: 'My Properties', path: '/my-properties', icon: <HomeIcon /> },
          { label: 'Add Property', path: '/add-property', icon: <AddIcon /> },
          { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> }
        ];
      case 'agent':
        return [
          { label: 'Properties', path: '/manage-properties', icon: <HomeIcon /> },
          { label: 'Clients', path: '/manage-clients', icon: <PeopleIcon /> },
          { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> }
        ];
      default:
        return [
          { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> }
        ];
    }
  };
  
  // User menu items based on user role
  const getUserMenuItems = () => {
    const commonItems = [
      { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
      { label: 'Profile', path: '/profile', icon: <AccountCircleIcon /> },
      { label: 'Settings', path: '/settings', icon: <SettingsIcon /> }
    ];
    
    // Add "Saved Properties" only for property seekers
    if (user?.user_type === 'property_seeker') {
      return [
        ...commonItems,
        { label: 'Saved Properties', path: '/saved-properties', icon: <FavoriteIcon /> }
      ];
    }
    
    return commonItems;
  };
  
  // Check if user has multiple roles
  const hasMultipleRoles = user?.roles && user.roles.length > 1;
  
  // Get role display name
  const getRoleDisplayName = (roleType) => {
    switch (roleType) {
      case 'property_seeker':
        return 'Property Seeker';
      case 'property_owner':
        return 'Property Owner';
      case 'agent':
        return 'Agent';
      default:
        return roleType;
    }
  };
  
  // Role badge color
  const getRoleBadgeColor = (roleType) => {
    switch (roleType) {
      case 'property_seeker':
        return 'primary';
      case 'property_owner':
        return 'secondary';
      case 'agent':
        return 'success';
      default:
        return 'default';
    }
  };
  
  // Navigation items
  const navItems = getNavItems();
  
  // User menu items
  const userMenuItems = getUserMenuItems();
  
  return (
    <AppBar position="sticky" color="default" elevation={1} sx={{ bgcolor: 'background.paper' }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Mobile menu icon */}
          {isMobile && (
            <IconButton
              size="large"
              aria-label="menu"
              color="inherit"
              edge="start"
              onClick={handleOpenMobileMenu}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          {/* Logo */}
          <Logo />
          
          {/* Desktop navigation */}
          {!isMobile && (
            <Box sx={{ flexGrow: 1, display: 'flex', ml: 4 }}>
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  component={RouterLink}
                  to={item.path}
                  sx={{ 
                    my: 2, 
                    color: 'text.primary',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  startIcon={item.icon}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          )}
          
          {/* Right section with notifications and user menu */}
          <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center' }}>
            {/* Login/Register buttons for non-authenticated users */}
            {!isAuthenticated ? (
              <>
                <Button
                  variant="outlined"
                  component={RouterLink}
                  to="/login"
                  sx={{ mr: 1 }}
                  size={isMobile ? 'small' : 'medium'}
                >
                  Login
                </Button>
                <Button
                  variant="contained"
                  component={RouterLink}
                  to="/register"
                  size={isMobile ? 'small' : 'medium'}
                >
                  Register
                </Button>
              </>
            ) : (
              <>
                {/* Notifications */}
                <Tooltip title="Notifications">
                  <IconButton
                    onClick={handleOpenNotificationsMenu}
                    sx={{ mr: 1 }}
                  >
                    <Badge badgeContent={3} color="error">
                      <NotificationsIcon />
                    </Badge>
                  </IconButton>
                </Tooltip>
                
                {/* User role indicator */}
                {!isMobile && (
                  <Chip
                    label={getRoleDisplayName(user.user_type)}
                    color={getRoleBadgeColor(user.user_type)}
                    size="small"
                    sx={{ mr: 2 }}
                  />
                )}
                
                {/* User menu */}
                <Tooltip title="Account settings">
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar
                      alt={user?.profile?.full_name || 'User'}
                      src={user?.profile?.avatar_url}
                      sx={{ bgcolor: 'primary.main' }}
                    >
                      {user?.profile?.full_name?.[0] || <AccountCircleIcon />}
                    </Avatar>
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
      
      {/* User dropdown menu */}
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
        <Box sx={{ py: 1, px: 2, minWidth: 200 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            {user?.profile?.full_name || 'User'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.email}
          </Typography>
        </Box>
        
        <Divider />
        
        {userMenuItems.map((item) => (
          <MenuItem
            key={item.path}
            onClick={() => {
              handleCloseUserMenu();
              navigate(item.path);
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText>{item.label}</ListItemText>
          </MenuItem>
        ))}
        
        {/* Switch Role option if user has multiple roles */}
        {hasMultipleRoles && (
          <MenuItem onClick={handleOpenRoleDialog}>
            <ListItemIcon><ArrowDropDownIcon /></ListItemIcon>
            <ListItemText>Switch Role</ListItemText>
          </MenuItem>
        )}
        
        <Divider />
        
        <MenuItem onClick={handleLogout}>
          <ListItemIcon><LogoutIcon /></ListItemIcon>
          <ListItemText>Logout</ListItemText>
        </MenuItem>
      </Menu>
      
      {/* Notifications menu */}
      <Menu
        sx={{ mt: '45px' }}
        id="menu-notifications"
        anchorEl={anchorElNotifications}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorElNotifications)}
        onClose={handleCloseNotificationsMenu}
      >
        <Box sx={{ py: 1, px: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            Notifications
          </Typography>
        </Box>
        
        <Divider />
        
        <MenuItem onClick={handleCloseNotificationsMenu}>
          <ListItemText 
            primary="New property matching your criteria"
            secondary="2 hours ago"
          />
        </MenuItem>
        
        <MenuItem onClick={handleCloseNotificationsMenu}>
          <ListItemText 
            primary="Price drop on saved property"
            secondary="Yesterday"
          />
        </MenuItem>
        
        <MenuItem onClick={handleCloseNotificationsMenu}>
          <ListItemText 
            primary="Message from agent"
            secondary="2 days ago"
          />
        </MenuItem>
        
        <Divider />
        
        <MenuItem 
          onClick={() => {
            handleCloseNotificationsMenu();
            navigate('/notifications');
          }}
          sx={{ justifyContent: 'center' }}
        >
          <Typography variant="body2" color="primary">
            View all notifications
          </Typography>
        </MenuItem>
      </Menu>
      
      {/* Mobile drawer menu */}
      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={handleCloseMobileMenu}
      >
        <Box
          sx={{ width: 250 }}
          role="presentation"
          onClick={handleCloseMobileMenu}
        >
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
            <Logo />
          </Box>
          
          <Divider />
          
          {isAuthenticated && user && (
            <>
              <Box sx={{ p: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {user?.profile?.full_name || 'User'}
                </Typography>
                <Chip
                  label={getRoleDisplayName(user.user_type)}
                  color={getRoleBadgeColor(user.user_type)}
                  size="small"
                  sx={{ mt: 1 }}
                />
              </Box>
              
              <Divider />
            </>
          )}
          
          <List>
            {navItems.map((item) => (
              <ListItem key={item.path} disablePadding>
                <ListItemButton
                  component={RouterLink}
                  to={item.path}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}
            
            {!isAuthenticated && (
              <>
                <Divider />
                
                <ListItem disablePadding>
                  <ListItemButton
                    component={RouterLink}
                    to="/login"
                  >
                    <ListItemIcon><AccountCircleIcon /></ListItemIcon>
                    <ListItemText primary="Login" />
                  </ListItemButton>
                </ListItem>
                
                <ListItem disablePadding>
                  <ListItemButton
                    component={RouterLink}
                    to="/register"
                  >
                    <ListItemIcon><PersonIcon /></ListItemIcon>
                    <ListItemText primary="Register" />
                  </ListItemButton>
                </ListItem>
              </>
            )}
          </List>
        </Box>
      </Drawer>
      
      {/* Role switching dialog */}
      <Dialog open={roleDialogOpen} onClose={() => setRoleDialogOpen(false)}>
        <DialogTitle>Switch User Role</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Select which role you want to use:
          </DialogContentText>
          
          <List sx={{ pt: 1 }}>
            {user?.roles?.map((role) => (
              <ListItem 
                key={role.role_id} 
                disablePadding
                sx={{ 
                  mb: 1,
                  border: selectedRole?.role_id === role.role_id ? '1px solid' : '1px solid transparent',
                  borderColor: 'primary.main',
                  borderRadius: 1
                }}
              >
                <ListItemButton onClick={() => handleRoleSelect(role)}>
                  <ListItemIcon>
                    {role.role_type === 'property_seeker' && <PersonIcon color="primary" />}
                    {role.role_type === 'property_owner' && <HomeIcon color="secondary" />}
                    {role.role_type === 'agent' && <PeopleIcon color="success" />}
                  </ListItemIcon>
                  <ListItemText 
                    primary={getRoleDisplayName(role.role_type)}
                    secondary={role.role_id === user.active_role_id ? '(Current)' : ''}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRoleDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSwitchRole} 
            variant="contained" 
            disabled={!selectedRole || selectedRole.role_id === user.active_role_id}
          >
            Switch
          </Button>
        </DialogActions>
      </Dialog>
    </AppBar>
  );
};

export default Navbar;