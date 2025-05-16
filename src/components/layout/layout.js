// src/components/layout/Layout.js
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  AppBar, 
  Box, 
  Toolbar, 
  IconButton, 
  Typography, 
  Menu, 
  Container, 
  Avatar, 
  Button, 
  Tooltip, 
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import PersonIcon from '@mui/icons-material/Person';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LogoutIcon from '@mui/icons-material/Logout';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useAuth } from '../../hooks/useAuth';

const drawerWidth = 240;

const Layout = ({ children }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleMenuItemClick = (path) => {
    navigate(path);
    handleCloseUserMenu();
    setMobileOpen(false);
  };

  // Define navigation items based on user role
  const getNavigationItems = () => {
    const commonItems = [
      { text: 'Home', icon: <HomeIcon />, path: '/' },
      { text: 'Search', icon: <SearchIcon />, path: '/search' }
    ];

    if (!isAuthenticated) {
      return commonItems;
    }

    const roleSpecificItems = [];
    const userRole = user?.role?.toLowerCase() || '';

    // Add role-specific navigation items
    if (userRole.includes('owner') || userRole.includes('agent')) {
      roleSpecificItems.push(
        { text: 'Add Property', icon: <AddIcon />, path: '/add-property' },
        { text: 'Manage Properties', icon: <DashboardIcon />, path: '/manage-properties' }
      );
      
      if (userRole.includes('agent')) {
        roleSpecificItems.push(
          { text: 'Manage Clients', icon: <PersonIcon />, path: '/manage-clients' }
        );
      }
    }
    
    if (userRole.includes('seeker') || userRole === '') {
      roleSpecificItems.push(
        { text: 'Saved Properties', icon: <FavoriteIcon />, path: '/saved-properties' }
      );
    }
    
    return [...commonItems, ...roleSpecificItems];
  };

  const navigationItems = getNavigationItems();

  const drawer = (
    <div>
      <Toolbar sx={{ justifyContent: 'center' }}>
        <Typography variant="h6" noWrap component="div">
          Property Pro
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {navigationItems.map((item) => (
          <ListItem 
            button 
            key={item.text} 
            onClick={() => handleMenuItemClick(item.path)}
            selected={location.pathname === item.path}
          >
            <ListItemIcon>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem button onClick={() => handleMenuItemClick('/profile')}>
          <ListItemIcon>
            <PersonIcon />
          </ListItemIcon>
          <ListItemText primary="Profile" />
        </ListItem>
        {isAuthenticated && (
          <ListItem button onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        )}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ mr: 2, display: { xs: 'none', md: 'flex' } }}
            >
              Property Pro
            </Typography>

            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
              {navigationItems.map((item) => (
                <Button
                  key={item.text}
                  onClick={() => handleMenuItemClick(item.path)}
                  sx={{ 
                    my: 2, 
                    color: 'white', 
                    display: 'block',
                    fontWeight: location.pathname === item.path ? 'bold' : 'normal',
                    borderBottom: location.pathname === item.path ? '2px solid white' : 'none'
                  }}
                >
                  {item.text}
                </Button>
              ))}
            </Box>

            {/* Responsive title */}
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}
            >
              Property Pro
            </Typography>

            <Box sx={{ flexGrow: 0 }}>
              {isAuthenticated ? (
                <>
                  <Tooltip title="Open settings">
                    <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                      <Avatar 
                        alt={user?.name || 'User'} 
                        src={user?.profile_image || '/static/images/avatar/default.jpg'}
                      />
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
                    <MenuItem onClick={() => handleMenuItemClick('/profile')}>
                      <ListItemIcon>
                        <PersonIcon fontSize="small" />
                      </ListItemIcon>
                      <Typography textAlign="center">Profile</Typography>
                    </MenuItem>
                    <MenuItem onClick={handleLogout}>
                      <ListItemIcon>
                        <LogoutIcon fontSize="small" />
                      </ListItemIcon>
                      <Typography textAlign="center">Logout</Typography>
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <Box sx={{ display: 'flex' }}>
                  <Button 
                    variant="outlined" 
                    color="inherit" 
                    sx={{ mr: 1 }}
                    onClick={() => navigate('/login')}
                  >
                    Login
                  </Button>
                  <Button 
                    variant="contained" 
                    color="secondary"
                    onClick={() => navigate('/register')}
                  >
                    Register
                  </Button>
                </Box>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      
      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: '1px solid rgba(0, 0, 0, 0.12)'
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` }
        }}
      >
        <Toolbar /> {/* Add space below app bar */}
        {children}
      </Box>
    </Box>
  );
};

export default Layout;