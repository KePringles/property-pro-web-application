// src/pages/Register.js
import React, { useState, useEffect } from 'react';
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
  Alert,
  IconButton,
  InputAdornment,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Card,
  CardContent,
  CardActionArea
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import HouseOutlinedIcon from '@mui/icons-material/HouseOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import { useAuth } from '../hooks/useAuth';

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { registerUser, isLoading, error, clearError } = useAuth();

  const queryParams = new URLSearchParams(location.search);
  const userTypeParam = queryParams.get('type');

  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userType, setUserType] = useState(
    userTypeParam === 'owner' ? 'property_owner' :
    userTypeParam === 'seeker' ? 'property_seeker' :
    userTypeParam === 'agent' ? 'agent' : null
  );

  useEffect(() => {
    if (userType === 'property_owner') {
      document.title = 'Register as Property Owner | Property Pro';
    } else if (userType === 'property_seeker') {
      document.title = 'Register as Property Seeker | Property Pro';
    } else if (userType === 'agent') {
      document.title = 'Register as Agent | Property Pro';
    } else {
      document.title = 'Register | Property Pro';
    }
  }, [userType]);

  const accountSchema = Yup.object({
    email: Yup.string().email('Invalid email').required('Required'),
    password: Yup.string().min(8, 'Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Include uppercase, lowercase, and number')
      .required('Required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Required')
  });

  const profileSchema = Yup.object({
    full_name: Yup.string().required('Full name is required'),
    phone_number: Yup.string()
      .matches(/^(\+\d{1,3})?\s?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/, 'Invalid phone number')
      .required('Phone number is required'),
    company_name: Yup.string().when('userType', {
      is: (type) => type === 'property_owner' || type === 'agent',
      then: () => Yup.string(), // Optional for property_owner and agent
      otherwise: () => Yup.string()
    })
  });

  const getValidationSchema = () => {
    if (!userType) return Yup.object({});
    return activeStep === 0 ? accountSchema : profileSchema;
  };

  const [validationSchema, setValidationSchema] = useState(getValidationSchema());
  
  useEffect(() => {
    setValidationSchema(getValidationSchema());
  }, [activeStep, userType]);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      confirmPassword: '',
      full_name: '',
      phone_number: '',
      company_name: '',
      userType
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      if (activeStep === 0) {
        const isValid = await accountSchema.isValid(values);
        if (isValid) setActiveStep(1);
      } else {
        try {
          // Pass the user_type for email validation
          await registerUser({
            email: values.email,
            password: values.password,
            user_type: userType, // Used by backend to validate email uniqueness per user type
            full_name: values.full_name,
            phone_number: values.phone_number,
            company_name: values.company_name
          });
          navigate('/dashboard');
        } catch (err) {
          console.error('Registration failed:', err);
        }
      }
    }
  });

  useEffect(() => {
    formik.setFieldValue('userType', userType);
  }, [userType]);

  const togglePassword = () => setShowPassword(prev => !prev);
  const toggleConfirm = () => setShowConfirmPassword(prev => !prev);
  const handleBack = () => activeStep === 1 ? setActiveStep(0) : setUserType(null);
  const handleUserTypeSelect = (type) => setUserType(type);

  // Define role cards for selection screen
  const roleCards = [
    {
      type: 'property_seeker',
      title: 'Property Seeker',
      description: 'Looking to buy or rent a property',
      icon: <PersonOutlineOutlinedIcon sx={{ fontSize: 48, color: 'primary.main' }} />,
      color: 'primary.light'
    },
    {
      type: 'property_owner',
      title: 'Property Owner',
      description: 'Looking to sell or rent out your property',
      icon: <HouseOutlinedIcon sx={{ fontSize: 48, color: 'secondary.main' }} />,
      color: 'secondary.light'
    },
    {
      type: 'agent',
      title: 'Agent',
      description: 'Help clients buy, sell or rent a property',
      icon: <SupervisorAccountIcon sx={{ fontSize: 48, color: 'success.main' }} />,
      color: 'success.light'
    }
  ];

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        {!userType && (
          <Box textAlign="center" mb={4}>
            <Typography variant="h4" gutterBottom>
              Create an Account
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Select the type of account you want to create
            </Typography>
          </Box>
        )}

        {userType && (
          <Box textAlign="center" mb={4}>
            <Typography variant="h4" gutterBottom>
              {userType === 'property_seeker' && 'Register as Property Seeker'}
              {userType === 'property_owner' && 'Register as Property Owner'}
              {userType === 'agent' && 'Register as Agent'}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Create your account to access Property Pro
            </Typography>
          </Box>
        )}

        {error && <Alert severity="error" onClose={clearError} sx={{ mb: 4 }}>{error}</Alert>}

        {userType && (
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            <Step><StepLabel>Account Details</StepLabel></Step>
            <Step><StepLabel>Profile Information</StepLabel></Step>
          </Stepper>
        )}

        <form onSubmit={formik.handleSubmit}>
          {!userType && (
            <Grid container spacing={3}>
              {roleCards.map((role) => (
                <Grid item xs={12} sm={4} key={role.type}>
                  <Card 
                    sx={{ 
                      height: '100%', 
                      cursor: 'pointer',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: 6
                      } 
                    }}
                  >
                    <CardActionArea 
                      sx={{ height: '100%' }}
                      onClick={() => handleUserTypeSelect(role.type)}
                    >
                      <CardContent sx={{ 
                        textAlign: 'center', 
                        py: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 2
                      }}>
                        <Box 
                          sx={{ 
                            p: 2, 
                            borderRadius: '50%', 
                            bgcolor: role.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 2
                          }}
                        >
                          {role.icon}
                        </Box>
                        <Typography variant="h6" gutterBottom>{role.title}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {role.description}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {userType && activeStep === 0 && (
            <Box>
              <TextField 
                fullWidth 
                label="Email" 
                id="email" 
                name="email" 
                type="email"
                margin="normal"
                {...formik.getFieldProps('email')} 
                error={formik.touched.email && !!formik.errors.email} 
                helperText={formik.touched.email && formik.errors.email} 
                disabled={isLoading} 
              />
              
              <TextField 
                fullWidth 
                label="Password" 
                id="password" 
                name="password" 
                type={showPassword ? 'text' : 'password'} 
                margin="normal"
                {...formik.getFieldProps('password')} 
                error={formik.touched.password && !!formik.errors.password} 
                helperText={formik.touched.password && formik.errors.password} 
                disabled={isLoading} 
                InputProps={{ 
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={togglePassword} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ) 
                }} 
              />
              
              <TextField 
                fullWidth 
                label="Confirm Password" 
                id="confirmPassword" 
                name="confirmPassword" 
                type={showConfirmPassword ? 'text' : 'password'} 
                margin="normal"
                {...formik.getFieldProps('confirmPassword')} 
                error={formik.touched.confirmPassword && !!formik.errors.confirmPassword} 
                helperText={formik.touched.confirmPassword && formik.errors.confirmPassword} 
                disabled={isLoading} 
                InputProps={{ 
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={toggleConfirm} edge="end">
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ) 
                }} 
              />
            </Box>
          )}

          {userType && activeStep === 1 && (
            <Box>
              <TextField 
                fullWidth 
                label="Full Name" 
                id="full_name" 
                name="full_name"
                margin="normal"
                {...formik.getFieldProps('full_name')} 
                error={formik.touched.full_name && !!formik.errors.full_name} 
                helperText={formik.touched.full_name && formik.errors.full_name} 
                disabled={isLoading} 
              />
              
              <TextField 
                fullWidth 
                label="Phone Number" 
                id="phone_number" 
                name="phone_number" 
                margin="normal"
                {...formik.getFieldProps('phone_number')} 
                error={formik.touched.phone_number && !!formik.errors.phone_number} 
                helperText={formik.touched.phone_number && formik.errors.phone_number} 
                disabled={isLoading} 
              />
              
              {(userType === 'property_owner' || userType === 'agent') && (
                <TextField 
                  fullWidth 
                  label={`Company Name ${userType === 'property_owner' ? '(Optional)' : ''}`}
                  id="company_name" 
                  name="company_name" 
                  margin="normal"
                  {...formik.getFieldProps('company_name')} 
                  error={formik.touched.company_name && !!formik.errors.company_name} 
                  helperText={formik.touched.company_name && formik.errors.company_name} 
                  disabled={isLoading} 
                />
              )}
            </Box>
          )}

          {userType && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button 
                variant="outlined" 
                onClick={handleBack} 
                disabled={isLoading}
              >
                Back
              </Button>
              
              <Button 
                type="submit" 
                variant="contained" 
                disabled={isLoading}
                startIcon={activeStep === 1 ? <PersonAddOutlinedIcon /> : null}
              >
                {isLoading ? 'Processing...' : activeStep === 0 ? 'Next' : 'Create Account'}
              </Button>
            </Box>
          )}
        </form>

        {userType && (
          <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid rgba(0,0,0,0.1)', textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Link to="/login" style={{ textDecoration: 'none' }}>
                Sign In
              </Link>
            </Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default Register;