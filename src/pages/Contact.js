// src/pages/Contact.js
import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  Paper,
  Divider,
  Alert,
  Snackbar,
  CircularProgress,
  useTheme,
  Card,
  CardContent
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import SendIcon from '@mui/icons-material/Send';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ChatIcon from '@mui/icons-material/Chat';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import Tooltip from '@mui/material/Tooltip'; // At the top if not already imported

const Contact = () => {
  const theme = useTheme();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when field is modified
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      errors.email = 'Invalid email address';
    }
    
    if (!formData.subject.trim()) {
      errors.subject = 'Subject is required';
    }
    
    if (!formData.message.trim()) {
      errors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      errors.message = 'Message should be at least 10 characters';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      // Here you would normally send the form data to your backend
      // For now, we'll just simulate a successful submission with a delay
      setTimeout(() => {
        console.log('Form data:', formData);
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        });
        
        setIsSubmitting(false);
        // Show success message
        setSubmitSuccess(true);
      }, 1500);
    }
  };
  
  const handleCloseSnackbar = () => {
    setSubmitSuccess(false);
  };

  // Contact information with enhanced details
  const contactInfo = [
    {
      icon: <LocationOnIcon fontSize="large" />,
      title: "Our Location",
      details: "30 Balmoral Avenue, Kingston 10, Jamaica",
      color: theme.palette.primary.main
    },
    {
      icon: <PhoneIcon fontSize="large" />,
      title: "Phone Number",
      details: "+1 (876) 555-1234",
      color: theme.palette.secondary.main
    },
    {
      icon: <EmailIcon fontSize="large" />,
      title: "Email Address",
      details: "info@propertypro.com",
      color: "#4caf50" // green
    },
    {
      icon: <AccessTimeIcon fontSize="large" />,
      title: "Working Hours",
      details: "Mon-Fri: 9AM-5PM, Sat: 10AM-2PM",
      color: "#ff9800" // orange
    }
  ];
  
  return (
    <Box sx={{ backgroundColor: '#f5f7fa', minHeight: '100vh' }}>
      {/* Hero Section with Modern Design */}
      <Box
        sx={{
          position: 'relative',
          height: '400px',
          backgroundImage: 'linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(https://images.unsplash.com/photo-1596524430615-b46475ddff6e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          color: 'white',
          mb: 8
        }}
      >
        <Box sx={{ maxWidth: '800px', p: 4, zIndex: 2 }}>
          <Typography 
            variant="h1" 
            component="h1" 
            sx={{ 
              fontSize: { xs: '2.5rem', md: '4rem' },
              fontWeight: 800,
              mb: 2,
              textShadow: '0 2px 10px rgba(0,0,0,0.3)'
            }}
          >
            Contact Us
          </Typography>
          <Typography 
            variant="h5" 
            sx={{ 
              fontSize: { xs: '1.1rem', md: '1.5rem' },
              fontWeight: 400,
              lineHeight: 1.6,
              textShadow: '0 2px 5px rgba(0,0,0,0.3)',
              maxWidth: '800px',
              mx: 'auto'
            }}
          >
            Have questions or feedback? We'd love to hear from you. Our team is ready to assist.
          </Typography>
        </Box>
      </Box>

      <Container maxWidth="lg">
        {/* Contact Information Cards */}
        <Box mb={8}>
          <Typography 
            variant="h2" 
            component="h2" 
            align="center" 
            gutterBottom
            sx={{ 
              fontSize: { xs: '2rem', md: '2.75rem' },
              fontWeight: 700,
              mb: 6,
              position: 'relative',
              '&:after': {
                content: '""',
                display: 'block',
                width: '80px',
                height: '4px',
                backgroundColor: theme.palette.primary.main,
                margin: '16px auto 0'
              }
            }}
          >
            Get In Touch
          </Typography>
          
          <Grid container spacing={3}>
            {contactInfo.map((info, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Paper 
                  elevation={2}
                  sx={{ 
                    p: 0,
                    height: '100%',
                    overflow: 'hidden',
                    borderRadius: 4,
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 12px 20px rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  <Box 
                    sx={{ 
                      bgcolor: info.color,
                      color: 'white',
                      p: 3,
                      textAlign: 'center'
                    }}
                  >
                    {info.icon}
                  </Box>
                  <Box 
                    sx={{ 
                      p: 3,
                      textAlign: 'center'
                    }}
                  >
                    <Typography 
                      variant="h6" 
                      gutterBottom
                      sx={{ fontWeight: 700 }}
                    >
                      {info.title}
                    </Typography>
                    <Typography variant="body1">
                      {info.details}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
        
        {/* Contact Form and Map Section */}
        <Grid container spacing={5} mb={10}>
          {/* Contact Form */}
          <Grid item xs={12} lg={6}>
            <Paper 
              elevation={3}
              sx={{ 
                p: 4,
                borderRadius: 4,
                overflow: 'hidden',
                height: '100%'
              }}
            >
              <Typography 
                variant="h4" 
                gutterBottom
                sx={{ 
                  fontWeight: 700,
                  mb: 3,
                  color: theme.palette.primary.main,
                  position: 'relative',
                  '&:after': {
                    content: '""',
                    display: 'block',
                    width: '60px',
                    height: '4px',
                    backgroundColor: theme.palette.primary.main,
                    mt: 1
                  }
                }}
              >
                Send Us a Message
              </Typography>
              
              <Typography 
                variant="body1" 
                paragraph
                sx={{ mb: 4 }}
              >
                Fill out the form below and we'll get back to you as soon as possible.
              </Typography>
              
              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Your Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      error={Boolean(formErrors.name)}
                      helperText={formErrors.name}
                      variant="outlined"
                      required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2
                        }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Your Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      error={Boolean(formErrors.email)}
                      helperText={formErrors.email}
                      variant="outlined"
                      required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2
                        }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      error={Boolean(formErrors.subject)}
                      helperText={formErrors.subject}
                      variant="outlined"
                      required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2
                        }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Message"
                      name="message"
                      multiline
                      rows={6}
                      value={formData.message}
                      onChange={handleChange}
                      error={Boolean(formErrors.message)}
                      helperText={formErrors.message}
                      variant="outlined"
                      required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2
                        }
                      }}
                    />
                  </Grid>
                </Grid>
                
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={isSubmitting}
                  endIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                  sx={{ 
                    mt: 4,
                    py: 1.5,
                    px: 4,
                    borderRadius: 3,
                    fontWeight: 600,
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 15px rgba(0,0,0,0.1)'
                    },
                    transition: 'all 0.3s'
                  }}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </Box>
            </Paper>
          </Grid>
          
          {/* Map */}
          <Grid item xs={12} lg={6}>
            <Paper 
              elevation={3}
              sx={{ 
                borderRadius: 4,
                overflow: 'hidden',
                height: '100%',
                minHeight: '500px',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Box
                component="iframe"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3794.4025887336877!2d-76.78349232469901!3d18.01227908801469!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8edb39a2f8d85cd1%3A0xa786e556f8130ec1!2s30%20Balmoral%20Ave%2C%20Kingston!5e0!3m2!1sen!2sjm!4v1713440582184!5m2!1sen!2sjm"
                sx={{ 
                  border: 0, 
                  width: '100%', 
                  height: '100%',
                  flexGrow: 1
                }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Property Pro Location"
              />
            </Paper>
          </Grid>
        </Grid>
        
        {/* Additional information */}
        <Box mb={10}>
          <Card
            elevation={3}
            sx={{ 
              borderRadius: 4,
              overflow: 'hidden',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.9)), url(https://images.unsplash.com/photo-1511376777868-611b54f68947?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              boxShadow: '0 15px 35px rgba(0,0,0,0.1)'
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Typography 
                variant="h4" 
                align="center" 
                gutterBottom
                sx={{ 
                  fontWeight: 700,
                  mb: 4,
                  color: theme.palette.primary.main
                }}
              >
                Need More Help?
              </Typography>
              <Grid container spacing={4} justifyContent="center">
                <Grid item xs={12} md={4}>
                  <Box 
                    sx={{ 
                      textAlign: 'center',
                      p: 3,
                      height: '100%',
                      borderRadius: 2,
                      transition: 'transform 0.3s',
                      '&:hover': {
                        transform: 'translateY(-3px)'
                      }
                    }}
                  >
                    <Typography 
                      variant="h5" 
                      gutterBottom
                      sx={{ fontWeight: 600 }}
                    >
                      FAQs
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3 }}>
                      Find answers to commonly asked questions in our helpful FAQ section.
                    </Typography>
                    <Button 
                      variant="outlined" 
                      color="primary"
                      href="/faq"
                      sx={{ 
                        px: 3,
                        py: 1,
                        borderRadius: 3,
                        borderWidth: 2
                      }}
                    >
                      Browse FAQs
                    </Button>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box 
                    sx={{ 
                      textAlign: 'center',
                      p: 3,
                      height: '100%',
                      borderRadius: 2,
                      transition: 'transform 0.3s',
                      '&:hover': {
                        transform: 'translateY(-3px)'
                      }
                    }}
                  >
                    <Typography 
                      variant="h5" 
                      gutterBottom
                      sx={{ fontWeight: 600 }}
                    >
                      Support
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3 }}>
                      Our dedicated support team is available to assist with any technical issues.
                    </Typography>
                  <Tooltip title="Call us at +1 (876) 123-4567"></Tooltip>
                    <Button
                      variant="outlined"
                      color="primary"
                      size="large"
                      startIcon={<SupportAgentIcon />}
                      title="Call us at +1 (876) 123-4567"
                      onClick={() => window.location.href = 'tel:+18761234567'}
                    >
                      Get Support
                    </Button>

                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box 
                    sx={{ 
                      textAlign: 'center',
                      p: 3,
                      height: '100%',
                      borderRadius: 2,
                      transition: 'transform 0.3s',
                      '&:hover': {
                        transform: 'translateY(-3px)'
                      }
                    }}
                  >
                    <Typography 
                      variant="h5" 
                      gutterBottom
                      sx={{ fontWeight: 600 }}
                    >
                      Chat with Us
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3 }}>
                      Live chat with our customer service team for immediate assistance.
                    </Typography>
                    <Button
                      variant="outlined"
                      color="secondary"
                      size="large"
                      startIcon={<ChatIcon />}
                      onClick={() => {
                        if (window.Tawk_API) {
                          window.Tawk_API.maximize();
                        } else {
                          alert('Live chat is loading... Please try again shortly.');
                        }
                       }}
                    >
                      Start Chat
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>
      </Container>
      
      <Snackbar 
        open={submitSuccess} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity="success" 
          sx={{ 
            width: '100%',
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
        >
          Your message has been sent successfully! We'll get back to you soon.
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Contact;