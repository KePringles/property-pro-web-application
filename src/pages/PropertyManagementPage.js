// src/pages/PropertyManagementPage.js
import React, { useState } from 'react';
import { 
  Container, Typography, Box, Grid, Paper, Button, 
  Card, CardMedia, CardContent, CardActions, Divider,
  Accordion, AccordionSummary, AccordionDetails, 
  List, ListItem, ListItemIcon, ListItemText,
  TextField, Stepper, Step, StepLabel, StepContent,
  IconButton, Avatar, Chip, Tab, Tabs
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import SettingsIcon from '@mui/icons-material/Settings';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import PersonIcon from '@mui/icons-material/Person';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import HandshakeIcon from '@mui/icons-material/Handshake';
import PaymentsIcon from '@mui/icons-material/Payments';
import ConstructionIcon from '@mui/icons-material/Construction';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import StarIcon from '@mui/icons-material/Star';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import { useNavigate } from 'react-router-dom';

// Service packages data
const servicePackages = [
  {
    title: "Basic",
    price: "5%",
    subtitle: "of monthly rent",
    features: [
      "Tenant screening",
      "Rent collection",
      "Monthly financial statements",
      "Online owner portal",
      "24/7 emergency maintenance"
    ],
    notIncluded: [
      "Property marketing",
      "Lease preparation",
      "Regular inspections",
      "Legal compliance updates",
      "Tax preparation assistance"
    ],
    isPopular: false,
    color: "#4b6cb7"
  },
  {
    title: "Standard",
    price: "8%",
    subtitle: "of monthly rent",
    features: [
      "All Basic features",
      "Property marketing",
      "Lease preparation",
      "Regular inspections (2x year)",
      "Legal compliance updates",
      "Maintenance coordination",
      "Move-in/Move-out coordination"
    ],
    notIncluded: [
      "Advanced financial reporting",
      "Tax preparation assistance",
      "Property improvement consultation"
    ],
    isPopular: true,
    color: "#1e3c72"
  },
  {
    title: "Premium",
    price: "12%",
    subtitle: "of monthly rent",
    features: [
      "All Standard features",
      "Regular inspections (4x year)",
      "Advanced financial reporting",
      "Tax preparation assistance",
      "Property improvement consultation",
      "Dedicated property manager",
      "Annual rental market analysis",
      "Eviction handling",
      "Professional photography"
    ],
    notIncluded: [],
    isPopular: false,
    color: "#2c3e50"
  }
];

// Testimonials data
const testimonials = [
  {
    id: 1,
    name: "Andrew Thompson",
    role: "Property Owner, Kingston",
    comment: "I've been using Property Pro's management services for two years now for my portfolio of three rental properties. The team handles everything from finding quality tenants to maintenance issues, making my life so much easier. The online portal gives me clear visibility into my finances and their team is always responsive.",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    rating: 5
  },
  {
    id: 2,
    name: "Rachel Morgan",
    role: "Property Owner, Montego Bay",
    comment: "After struggling with managing my rental property myself, I decided to try Property Pro. The difference has been night and day! They found a reliable tenant within two weeks, handle all the paperwork, and their maintenance network is excellent. I'm earning more with less stress.",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    rating: 5
  },
  {
    id: 3,
    name: "Marcus Chen",
    role: "Property Investor, Ocho Rios",
    comment: "As someone with multiple investment properties across Jamaica, I needed a management company that could scale with my portfolio. Property Pro's comprehensive services and detailed reporting give me the confidence to continue expanding my investments.",
    avatar: "https://randomuser.me/api/portraits/men/86.jpg",
    rating: 4.5
  }
];

// FAQ data
const faqData = [
  {
    question: "What services do you offer for property owners?",
    answer: "We offer comprehensive property management services including tenant screening and selection, rent collection, property maintenance, financial reporting, legal compliance, inspections, and more. We have three service tiers (Basic, Standard, and Premium) to match your specific needs and budget."
  },
  {
    question: "How do you screen potential tenants?",
    answer: "Our thorough screening process includes credit checks, employment verification, income verification, rental history, criminal background checks, and personal references. We ensure that only qualified tenants who meet our strict criteria are placed in your property."
  },
  {
    question: "How quickly can you find tenants for my property?",
    answer: "On average, we place qualified tenants within 21 days. This timeline can vary based on property location, condition, and market conditions. Our marketing strategies include professional photography, virtual tours, online listings on multiple platforms, social media promotion, and our extensive network of potential tenants."
  },
  {
    question: "How do you handle maintenance and repairs?",
    answer: "We have a network of licensed, insured, and pre-vetted contractors who provide quality service at competitive rates. For routine maintenance, we handle everything without bothering you. For larger repairs exceeding your specified threshold (typically J$20,000), we'll contact you for approval before proceeding."
  },
  {
    question: "What financial reports will I receive?",
    answer: "All property owners receive monthly financial statements detailing income, expenses, and net proceeds. Our Standard and Premium plans include more detailed reporting including maintenance records, occupancy rates, and market comparisons. All reports are available through our secure owner portal."
  },
  {
    question: "Can I terminate the property management agreement?",
    answer: "Yes, our management agreements typically have a 60-day notice period for termination. Please refer to your specific contract for details. We pride ourselves on excellent service and hope you'll stay with us, but we understand circumstances change."
  }
];

// Process steps
const managementProcess = [
  {
    label: "Initial Consultation",
    description: "We begin with a thorough consultation to understand your property and investment goals. We'll conduct a property assessment and provide recommendations tailored to your specific situation."
  },
  {
    label: "Agreement & Onboarding",
    description: "Once you decide to work with us, we'll prepare a management agreement, collect all necessary property information, and set up your owner portal for transparent communication."
  },
  {
    label: "Property Preparation",
    description: "We'll assess your property condition, recommend any necessary improvements, arrange professional photography, and prepare comprehensive marketing materials."
  },
  {
    label: "Tenant Acquisition",
    description: "Our team will market your property across multiple channels, screen potential tenants, conduct viewings, and handle all paperwork for the lease agreement."
  },
  {
    label: "Ongoing Management",
    description: "We collect rent, handle maintenance requests, conduct regular inspections, provide detailed financial reports, and ensure legal compliance on your behalf."
  }
];

const PropertyManagementPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [contactFormData, setContactFormData] = useState({
    name: '',
    email: '',
    phone: '',
    propertyType: '',
    message: ''
  });

  // Handle form change
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setContactFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // Handle form submit
  const handleFormSubmit = (e) => {
    e.preventDefault();
    // Process form submission logic here
    console.log('Form submitted:', contactFormData);
    // Reset form or show success message
  };

  return (
    <Box sx={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          height: { xs: '450px', md: '550px' },
          backgroundImage: 'url(https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=2070&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            zIndex: 0,
          }
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <Typography 
            variant="h2" 
            sx={{ 
              color: 'white', 
              fontWeight: 700, 
              mb: 2,
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
            }}
          >
            Property Management Services
          </Typography>
          <Typography 
            variant="h5" 
            sx={{ 
              color: 'white', 
              mb: 4, 
              maxWidth: '800px',
              mx: 'auto',
              textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
            }}
          >
            Maximize your property investment with our professional management solutions
          </Typography>
          
          <Grid container spacing={3} justifyContent="center" sx={{ mt: 3 }}>
            <Grid item xs={12} sm={4}>
              <Paper
                sx={{
                  p: 3,
                  height: '100%',
                  bgcolor: 'rgba(255,255,255,0.95)',
                  borderRadius: 2,
                  textAlign: 'center',
                  transition: 'transform 0.3s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 12px 20px rgba(0,0,0,0.2)'
                  }
                }}
              >
                <Box 
                  sx={{ 
                    bgcolor: 'primary.main', 
                    width: 60, 
                    height: 60, 
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2
                  }}
                >
                  <MonetizationOnIcon sx={{ fontSize: 32, color: 'white' }} />
                </Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Maximize Returns
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Our proven strategies help optimize your rental income and minimize vacancies.
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <Paper
                sx={{
                  p: 3,
                  height: '100%',
                  bgcolor: 'rgba(255,255,255,0.95)',
                  borderRadius: 2,
                  textAlign: 'center',
                  transition: 'transform 0.3s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 12px 20px rgba(0,0,0,0.2)'
                  }
                }}
              >
                <Box 
                  sx={{ 
                    bgcolor: 'primary.main', 
                    width: 60, 
                    height: 60, 
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2
                  }}
                >
                  <VerifiedUserIcon sx={{ fontSize: 32, color: 'white' }} />
                </Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Qualified Tenants
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Rigorous screening ensures reliable, responsible tenants for your property.
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <Paper
                sx={{
                  p: 3,
                  height: '100%',
                  bgcolor: 'rgba(255,255,255,0.95)',
                  borderRadius: 2,
                  textAlign: 'center',
                  transition: 'transform 0.3s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 12px 20px rgba(0,0,0,0.2)'
                  }
                }}
              >
                <Box 
                  sx={{ 
                    bgcolor: 'primary.main', 
                    width: 60, 
                    height: 60, 
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2
                  }}
                >
                  <SettingsIcon sx={{ fontSize: 32, color: 'white' }} />
                </Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Hassle-Free Maintenance
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Our trusted contractor network handles all maintenance issues promptly and efficiently.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* Services Overview */}
        <Box mb={8}>
          <Typography variant="h4" fontWeight="bold" gutterBottom align="center">
            Comprehensive Property Management Solutions
          </Typography>
          <Typography variant="subtitle1" align="center" color="text.secondary" paragraph sx={{ maxWidth: 800, mx: 'auto', mb: 5 }}>
            We take care of everything so you can enjoy passive income without the stress of day-to-day property management.
          </Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', borderRadius: 2, boxShadow: 3 }}>
                <CardMedia
                  component="img"
                  height="200"
                  image="https://images.unsplash.com/photo-1560518883-f5764594a8d1?auto=format&fit=crop&w=800&q=80"
                  alt="Tenant Management"
                />
                <CardContent>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      mb: 2 
                    }}
                  >
                    <PersonIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" fontWeight="bold">
                      Tenant Management
                    </Typography>
                  </Box>
                  <List dense disablePadding>
                    <ListItem>
                      <ListItemIcon sx={{ minWidth: 35 }}>
                        <CheckCircleIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="Comprehensive tenant screening" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon sx={{ minWidth: 35 }}>
                        <CheckCircleIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="Efficient rent collection" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon sx={{ minWidth: 35 }}>
                        <CheckCircleIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="Lease preparation & enforcement" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon sx={{ minWidth: 35 }}>
                        <CheckCircleIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="Tenant communication & relations" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon sx={{ minWidth: 35 }}>
                        <CheckCircleIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="Move-in/move-out coordination" />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', borderRadius: 2, boxShadow: 3 }}>
                <CardMedia
                  component="img"
                  height="200"
                  image="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80"
                  alt="Property Maintenance"
                />
                <CardContent>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      mb: 2 
                    }}
                  >
                    <ConstructionIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" fontWeight="bold">
                      Property Maintenance
                    </Typography>
                  </Box>
                  <List dense disablePadding>
                    <ListItem>
                      <ListItemIcon sx={{ minWidth: 35 }}>
                        <CheckCircleIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="24/7 emergency maintenance" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon sx={{ minWidth: 35 }}>
                        <CheckCircleIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="Preventive maintenance scheduling" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon sx={{ minWidth: 35 }}>
                        <CheckCircleIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="Vetted contractor network" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon sx={{ minWidth: 35 }}>
                        <CheckCircleIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="Regular property inspections" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon sx={{ minWidth: 35 }}>
                        <CheckCircleIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="Repair cost optimization" />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', borderRadius: 2, boxShadow: 3 }}>
                <CardMedia
                  component="img"
                  height="200"
                  image="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80"
                  alt="Financial Management"
                />
                <CardContent>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      mb: 2 
                    }}
                  >
                    <AccountBalanceIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" fontWeight="bold">
                      Financial Management
                    </Typography>
                  </Box>
                  <List dense disablePadding>
                    <ListItem>
                      <ListItemIcon sx={{ minWidth: 35 }}>
                        <CheckCircleIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="Detailed monthly statements" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon sx={{ minWidth: 35 }}>
                        <CheckCircleIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="Rent collection & disbursement" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon sx={{ minWidth: 35 }}>
                        <CheckCircleIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="Expense tracking & management" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon sx={{ minWidth: 35 }}>
                        <CheckCircleIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="Annual financial reports" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon sx={{ minWidth: 35 }}>
                        <CheckCircleIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="Online owner portal access" />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Management Process */}
        <Box mb={8}>
          <Typography variant="h4" fontWeight="bold" gutterBottom align="center">
            Our Management Process
          </Typography>
          <Typography variant="subtitle1" align="center" color="text.secondary" paragraph sx={{ maxWidth: 800, mx: 'auto', mb: 5 }}>
            A proven approach to managing your property investment
          </Typography>
          
          <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: 2 }}>
            <Stepper orientation="vertical" nonLinear>
              {managementProcess.map((step, index) => (
                <Step key={index} active={true}>
                  <StepLabel 
                    StepIconProps={{ 
                      sx: { 
                        color: 'primary.main',
                        '& .MuiStepIcon-text': { fill: 'white' }
                      } 
                    }}
                  >
                    <Typography variant="h6" fontWeight="bold">
                      {step.label}
                    </Typography>
                  </StepLabel>
                  <StepContent>
                    <Typography paragraph sx={{ ml: 1, borderLeft: '2px solid #e0e0e0', pl: 2, py: 1 }}>
                      {step.description}
                    </Typography>
                  </StepContent>
                </Step>
              ))}
            </Stepper>
          </Paper>
        </Box>

        {/* Service Packages */}
        <Box mb={8}>
          <Typography variant="h4" fontWeight="bold" gutterBottom align="center">
            Management Packages
          </Typography>
          <Typography variant="subtitle1" align="center" color="text.secondary" paragraph sx={{ maxWidth: 800, mx: 'auto', mb: 5 }}>
            Choose the package that best fits your property management needs
          </Typography>
          
          <Grid container spacing={3} justifyContent="center">
            {servicePackages.map((pkg, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    borderRadius: 2, 
                    position: 'relative',
                    transition: 'transform 0.3s',
                    boxShadow: pkg.isPopular ? 8 : 3,
                    transform: pkg.isPopular ? 'scale(1.05)' : 'scale(1)',
                    zIndex: pkg.isPopular ? 1 : 0,
                    border: pkg.isPopular ? `2px solid ${pkg.color}` : 'none',
                    '&:hover': {
                      transform: pkg.isPopular ? 'scale(1.08)' : 'scale(1.03)',
                    }
                  }}
                >
                  {pkg.isPopular && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 15,
                        right: 0,
                        backgroundColor: pkg.color,
                        color: 'white',
                        py: 0.5,
                        px: 2,
                        fontWeight: 'bold',
                        fontSize: '0.75rem',
                        borderRadius: '4px 0 0 4px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        zIndex: 1
                      }}
                    >
                      MOST POPULAR
                    </Box>
                  )}
                  
                  <Box
                    sx={{
                      backgroundColor: pkg.color,
                      color: 'white',
                      p: 3,
                      textAlign: 'center'
                    }}
                  >
                    <Typography variant="h5" fontWeight="bold">
                      {pkg.title}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h3" fontWeight="bold" sx={{ color: pkg.color }}>
                      {pkg.price}
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                      {pkg.subtitle}
                    </Typography>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <List disablePadding>
                      {pkg.features.map((feature, idx) => (
                        <ListItem key={idx} disablePadding sx={{ py: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 35 }}>
                            <CheckCircleIcon sx={{ color: pkg.color }} fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary={feature} 
                            primaryTypographyProps={{ 
                              align: 'left',
                              fontSize: '0.9rem'
                            }} 
                          />
                        </ListItem>
                      ))}
                      
                      {pkg.notIncluded.map((feature, idx) => (
                        <ListItem key={`not-${idx}`} disablePadding sx={{ py: 0.5, opacity: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 35 }}>
                            <CheckCircleIcon color="disabled" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary={feature} 
                            primaryTypographyProps={{ 
                              align: 'left',
                              fontSize: '0.9rem'
                            }} 
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                  
                  <Box sx={{ p: 3, pt: 0, textAlign: 'center' }}>
                    <Button
                      variant="contained"
                      fullWidth
                      sx={{
                        py: 1.5,
                        bgcolor: pkg.color,
                        '&:hover': {
                          bgcolor: pkg.color,
                          filter: 'brightness(90%)'
                        }
                      }}
                      onClick={() => navigate('/contact')}
                    >
                      Get Started
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant="body1" paragraph>
              Not sure which package is right for you? Contact us for a personalized recommendation.
            </Typography>
            <Button
              variant="outlined"
              size="large"
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate('/contact')}
              sx={{ mt: 1 }}
            >
              Request a Consultation
            </Button>
          </Box>
        </Box>

        {/* Testimonials */}
        <Box mb={8}>
          <Typography variant="h4" fontWeight="bold" gutterBottom align="center">
            What Our Clients Say
          </Typography>
          <Typography variant="subtitle1" align="center" color="text.secondary" paragraph sx={{ maxWidth: 800, mx: 'auto', mb: 5 }}>
            Join hundreds of satisfied property owners
          </Typography>
          
          <Grid container spacing={3}>
            {testimonials.map((testimonial) => (
              <Grid item xs={12} md={4} key={testimonial.id}>
                <Paper
                  sx={{
                    p: 3,
                    height: '100%',
                    borderRadius: 2,
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <Box sx={{ display: 'flex', mb: 2 }}>
                    {Array(5).fill().map((_, idx) => (
                      <StarIcon
                        key={idx}
                        sx={{
                          color: idx < Math.floor(testimonial.rating) ? 'gold' : 'grey.300',
                          fontSize: '1.2rem',
                          mr: 0.5
                        }}
                      />
                    ))}
                    {testimonial.rating % 1 !== 0 && (
                      <StarIcon
                        sx={{
                          color: 'gold',
                          fontSize: '1.2rem',
                          mr: 0.5,
                          clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)'
                        }}
                      />
                    )}
                  </Box>
                  
                  <Typography variant="body1" paragraph sx={{ flexGrow: 1, fontStyle: 'italic' }}>
                    "{testimonial.comment}"
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar src={testimonial.avatar} alt={testimonial.name} sx={{ mr: 2 }} />
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {testimonial.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {testimonial.role}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* FAQ Section */}
        <Box mb={8}>
          <Typography variant="h4" fontWeight="bold" gutterBottom align="center">
            Frequently Asked Questions
          </Typography>
          <Typography variant="subtitle1" align="center" color="text.secondary" paragraph sx={{ maxWidth: 800, mx: 'auto', mb: 5 }}>
            Answers to common questions about our property management services
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              {faqData.map((faq, index) => (
                <Accordion 
                  key={index}
                  sx={{ 
                    mb: 1,
                    '&:before': { display: 'none' },
                    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                    borderRadius: '4px !important',
                    overflow: 'hidden'
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{
                      '&.Mui-expanded': {
                        bgcolor: 'rgba(0,0,0,0.03)'
                      }
                    }}
                  >
                    <Typography fontWeight="600">{faq.question}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography color="text.secondary">{faq.answer}</Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
              
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography variant="body1" mb={2}>
                  Don't see the answer to your question?
                </Typography>
                <Button
                  variant="outlined"
                  endIcon={<ContactSupportIcon />}
                  onClick={() => navigate('/contact')}
                >
                  Contact Our Team
                </Button>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <CardMedia
                  component="img"
                  height="200"
                  image="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=800&q=80"
                  alt="Contact Us"
                />
                <CardContent sx={{ bgcolor: 'primary.main', color: 'white', p: 3 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Get a Free Property Assessment
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Find out how much your property could earn and how our management services can help maximize your returns.
                  </Typography>
                  <Button
                    variant="contained"
                    fullWidth
                    sx={{
                      bgcolor: 'white',
                      color: 'primary.main',
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.9)'
                      }
                    }}
                    onClick={() => navigate('/contact')}
                  >
                    Request Assessment
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Contact Form */}
        <Box mb={6}>
          <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <Grid container></Grid>
            // The continuation of the Contact Form section
<Grid container spacing={0}>
  <Grid item xs={12} md={6}>
    <Box
      sx={{
        backgroundImage:
          'url(https://images.unsplash.com/photo-1581091870622-cb8f3c8e8d64?auto=format&fit=crop&w=800&q=80)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        height: '100%',
        minHeight: 400,
      }}
    />
  </Grid>

  <Grid item xs={12} md={6}>
    <Box sx={{ p: { xs: 3, md: 4 } }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Contact Us
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Ready to take the next step? Fill out the form and we’ll get in touch shortly.
      </Typography>

      <Box component="form" onSubmit={handleFormSubmit} noValidate>
        <TextField
          fullWidth
          label="Name"
          name="name"
          value={contactFormData.name}
          onChange={handleFormChange}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Email"
          name="email"
          type="email"
          value={contactFormData.email}
          onChange={handleFormChange}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Phone Number"
          name="phone"
          value={contactFormData.phone}
          onChange={handleFormChange}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Property Type"
          name="propertyType"
          value={contactFormData.propertyType}
          onChange={handleFormChange}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Message"
          name="message"
          value={contactFormData.message}
          onChange={handleFormChange}
          multiline
          rows={4}
          margin="normal"
        />

        <Button
          type="submit"
          variant="contained"
          size="large"
          sx={{ mt: 2 }}
        >
          Submit
        </Button>
      </Box>
    </Box>
  </Grid>
</Grid>

</Paper>
</Box>
</Container>

</Box>
);
};

export default PropertyManagementPage;
