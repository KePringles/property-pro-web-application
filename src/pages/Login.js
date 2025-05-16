// src/pages/Login.js
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Divider,
  Alert,
  IconButton,
  InputAdornment,
  Grid,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useAuth } from '../hooks/useAuth';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginUser, isLoading, error, clearError } = useAuth();
  
  // Get redirect path from location state or default to home
  const from = location.state?.from || '/';
  
  const [showPassword, setShowPassword] = useState(false);
  const [requireUserType, setRequireUserType] = useState(false);
  const [availableUserTypes, setAvailableUserTypes] = useState([]);
  
  // Validation schema
  const validationSchema = Yup.object({
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    password: Yup.string()
      .required('Password is required')
  });
  
  // Form state with Formik
  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      user_type: '',
      remember: false
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        // If a user type is required and selected, add it to the request
        const loginParams = { 
          email: values.email, 
          password: values.password 
        };
        
        if (requireUserType && values.user_type) {
          loginParams.user_type = values.user_type;
        }
        
        const result = await loginUser(loginParams);
        
        // Check if we need to select a user type
        if (result?.requireUserType) {
          setRequireUserType(true);
          setAvailableUserTypes(result.userTypes || []);
          return; // Stop here - don't proceed with navigation
        }
        
        // Normal login success flow
        // Redirect based on user type
        const userType = result?.active_user_type || 'property_seeker';
        
        if (userType === 'property_seeker') {
          console.log('Property seeker logged in, navigating to home page');
          navigate('/', { replace: true });
        } else {
          // For other user types, navigate to dashboard or requested page
          const targetPath = from === '/' ? '/dashboard' : from;
          console.log(`Non-property seeker logged in, navigating to ${targetPath}`);
          navigate(targetPath, { replace: true });
        }
      } catch (err) {
        // Error is handled by the auth context
        console.error('Login error:', err);
      }
    }
  });
  // Toggle password visibility
  const handleTogglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const formatRoleName = (role) => {
    if (!role) return '';
    return role
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  {availableUserTypes.map(type => (
    <Grid item xs={12} key={type}>
      <Button
        fullWidth
        variant={formik.values.user_type === type ? "contained" : "outlined"}
        onClick={() => formik.setFieldValue('user_type', type)}
        sx={{ py: 2, mb: 1 }}
      >
        {formatRoleName(type)} {/* Use the formatting function here */}
      </Button>
    </Grid>
      ))}
            
  
  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
          <Box sx={{ 
            backgroundColor: 'primary.main', 
            color: 'white', 
            p: 1, 
            borderRadius: '50%',
            mb: 2
          }}>
            <LockOutlinedIcon fontSize="large" />
          </Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Sign In
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Access your Property Pro account
          </Typography>
        </Box>
        
        {error && (
          <Alert 
            severity="error" 
            onClose={clearError}
            sx={{ mb: 3 }}
          >
            {error}
          </Alert>
        )}
        
        <form onSubmit={formik.handleSubmit}>
          <TextField
            fullWidth
            id="email"
            name="email"
            label="Email Address"
            variant="outlined"
            margin="normal"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
            disabled={isLoading}
            autoFocus
          />
          
          <TextField
            fullWidth
            id="password"
            name="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            variant="outlined"
            margin="normal"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
            disabled={isLoading}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleTogglePasswordVisibility}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', my: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  id="remember"
                  name="remember"
                  color="primary"
                  checked={formik.values.remember}
                  onChange={formik.handleChange}
                  disabled={isLoading}
                />
              }
              label="Remember me"
            />
            
            <Link to="/forgot-password" style={{ textDecoration: 'none' }}>
              <Typography variant="body2" color="primary">
                Forgot password?
              </Typography>
            </Link>
          </Box>
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={isLoading}
            sx={{ mt: 2, mb: 3, py: 1.5 }}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>
          
          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              OR
            </Typography>
          </Divider>
          
          <Typography variant="body1" align="center" sx={{ mb: 2 }}>
            Don't have an account?
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Button
                component={Link}
                to="/register?type=seeker"
                fullWidth
                variant="outlined"
                sx={{ py: 1 }}
              >
                Register as Property Seeker
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                component={Link}
                to="/register?type=owner"
                fullWidth
                variant="outlined"
                color="secondary"
                sx={{ py: 1 }}
              >
                Register as Property Owner
              </Button>
            </Grid>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button
              component={Link}
              to="/register?type=agent"
              fullWidth
              variant="outlined"
              color="secondary"
              sx={{ py: 1}}
            >
              Register as Agent
            </Button>  
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default Login;