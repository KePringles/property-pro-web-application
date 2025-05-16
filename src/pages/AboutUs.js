// src/pages/AboutUs.js
import React from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Paper, 
  Avatar, 
  Divider, 
  useTheme,
  Card,
  CardContent,
  CardMedia
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import BusinessIcon from '@mui/icons-material/Business';
import PeopleIcon from '@mui/icons-material/People';
import StarIcon from '@mui/icons-material/Star';
import HandshakeIcon from '@mui/icons-material/Handshake';
import VerifiedIcon from '@mui/icons-material/Verified';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';


const AboutUs = () => {
  const theme = useTheme();

  // Team member data
  const teamMembers = [
    {
      name: 'Chanchal Khiani',
      role: 'Lead Developer',
      bio: 'Experienced developer with expertise in frontend technologies and UI/UX design.',
      avatar: '/assets/team/chanchal.jpg', // Replace with actual image path
    },
    {
      name: 'Kelandra Pringle',
      role: 'Backend Developer',
      bio: 'Backend specialist with strong database management and API development skills.',
      avatar: '/assets/team/kelandra.jpg', // Replace with actual image path
    },
    {
      name: 'Ajonae Flemmings',
      role: 'Project Manager',
      bio: 'Experienced project manager with a focus on agile methodologies and user-centered design.',
      avatar: '/assets/team/ajonae.jpg', // Replace with actual image path
    }
  ];

  // Values section with improved icons and descriptions
  const values = [
    {
      title: 'User-Centered',
      description: 'We place our users at the heart of everything we do, designing our platform to address real needs and solve genuine problems in the property market.',
      icon: <PeopleIcon fontSize="large" style={{ fontSize: '48px' }} />,
      color: theme.palette.primary.main
    },
    {
      title: 'Quality Listings',
      description: 'Every property on our platform undergoes verification to ensure accuracy and quality, helping you make informed decisions with confidence.',
      icon: <VerifiedIcon fontSize="large" style={{ fontSize: '48px' }} />,
      color: theme.palette.secondary.main
    },
    {
      title: 'Transparency',
      description: 'We believe in complete transparency in all aspects of our business, from property details to pricing, with no hidden costs or surprises.',
      icon: <HandshakeIcon fontSize="large" style={{ fontSize: '48px' }} />,
      color: '#4caf50'
    },
    {
      title: 'Innovation',
      description: 'Our AI-powered platform continuously evolves to provide smarter recommendations and an increasingly personalized experience.',
      icon: <AutoAwesomeIcon fontSize="large" style={{ fontSize: '48px' }} />,
      color: '#ff9800'
    }
  ];

  return (
    <Box sx={{ backgroundColor: '#f5f7fa', minHeight: '100vh' }}>
      {/* Hero Section with Modern Design - Updated to use Jamaican property image */}
      <Box
        sx={{
          position: 'relative',
          height: '500px',
          backgroundImage: 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(https://images.unsplash.com/photo-1580237072617-771c3ecc4a24?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2069&q=80)',
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
            ABOUT PROPERTY PRO
          </Typography>
          <Typography 
            variant="h5" 
            sx={{ 
              fontSize: { xs: '1.1rem', md: '1.5rem' },
              fontWeight: 400,
              lineHeight: 1.6,
              textShadow: '0 2px 5px rgba(0,0,0,0.3)'
            }}
          >
            Your trusted partner in finding the perfect property in Jamaica
          </Typography>
        </Box>
      </Box>

      <Container maxWidth="lg">
        {/* Our Story Section */}
        <Box mb={10}>
          <Typography 
            variant="h2" 
            component="h2" 
            align="center" 
            gutterBottom
            sx={{ 
              fontSize: { xs: '2rem', md: '2.75rem' },
              fontWeight: 700,
              mb: 3,
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
            Our Story
          </Typography>
          
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Card elevation={0} sx={{ 
                bgcolor: 'transparent', 
                height: '100%',
                border: 'none'
              }}>
                <CardContent sx={{ px: { xs: 2, md: 4 }, py: 4 }}>
                  <Typography 
                    variant="body1" 
                    paragraph
                    sx={{ 
                      fontSize: '1.125rem', 
                      lineHeight: 1.8,
                      color: 'text.primary'
                    }}
                  >
                    Property Pro was founded in 2025 as a Capstone Project at The University of the West Indies, with the mission to revolutionize property search in Jamaica. We identified persistent challenges in the property market: information overload, complex filtering processes, and difficulty finding properties that truly match specific preferences.
                  </Typography>
                  <Typography 
                    variant="body1" 
                    paragraph
                    sx={{ 
                      fontSize: '1.125rem', 
                      lineHeight: 1.8,
                      color: 'text.primary'
                    }}
                  >
                    Our solution addresses these challenges by offering a web-based platform that streamlines the process of buying or renting properties. We provide tailored recommendations based on users' budgets, preferred sizes, geographic locations, and desired amenities.
                  </Typography>
                  <Typography 
                    variant="body1"
                    sx={{ 
                      fontSize: '1.125rem', 
                      lineHeight: 1.8,
                      color: 'text.primary' 
                    }}
                  >
                    Utilizing AI and machine learning, Property Pro ensures users can find their perfect property option with ease and confidence, transforming the property search experience in Jamaica.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src="https://images.unsplash.com/photo-1580237072617-771c3ecc4a24?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80"
                alt="Jamaican property"
                sx={{
                  width: '100%',
                  height: '400px',
                  objectFit: 'cover',
                  borderRadius: 4,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                }}
              />
            </Grid>
          </Grid>
        </Box>

        {/* The rest of the component remains unchanged */}
        {/* Our Team Section with Modern Cards */}
        <Box mb={10}>
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
            Meet Our Team
          </Typography>
          
          <Grid container spacing={4} justifyContent="center">
            {teamMembers.map((member, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
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
                  <Box sx={{ position: 'relative', height: '200px', bgcolor: theme.palette.primary.light }}>
                    <Avatar
                      src={member.avatar}
                      alt={member.name}
                      sx={{ 
                        width: 140, 
                        height: 140, 
                        border: '5px solid white',
                        position: 'absolute',
                        bottom: '-70px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
                      }}
                    />
                  </Box>
                  <Box sx={{ pt: 10, pb: 4, px: 3, textAlign: 'center' }}>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
                      {member.name}
                    </Typography>
                    <Typography 
                      variant="subtitle1" 
                      color="primary" 
                      gutterBottom
                      sx={{ fontWeight: 600, mb: 2 }}
                    >
                      {member.role}
                    </Typography>
                    <Divider sx={{ width: '50px', mx: 'auto', mb: 2, borderColor: theme.palette.primary.main }} />
                    <Typography variant="body1" color="text.secondary">
                      {member.bio}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Our Values Section with Beautiful Cards */}
        <Box mb={10}>
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
            Our Core Values
          </Typography>
          
          <Grid container spacing={4}>
            {values.map((value, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Paper 
                  elevation={2} 
                  sx={{ 
                    p: 4, 
                    height: '100%', 
                    textAlign: 'center',
                    borderRadius: 4,
                    transition: 'transform 0.3s',
                    '&:hover': {
                      transform: 'translateY(-5px)'
                    }
                  }}
                >
                  <Box 
                    sx={{ 
                      mb: 3, 
                      color: value.color,
                      display: 'inline-flex',
                      p: 2,
                      borderRadius: '50%',
                      bgcolor: `${value.color}15`
                    }}
                  >
                    {value.icon}
                  </Box>
                  <Typography 
                    variant="h5" 
                    gutterBottom
                    sx={{ fontWeight: 700, mb: 2 }}
                  >
                    {value.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {value.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Mission & Vision with Gradient Cards */}
        <Grid container spacing={5} mb={10}>
          <Grid item xs={12} md={6}>
            <Paper 
              sx={{ 
                p: 4, 
                height: '100%',
                borderRadius: 4,
                background: `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.primary.dark})`,
                color: 'white',
                boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
              }}
            >
              <Typography 
                variant="h3" 
                gutterBottom
                sx={{ 
                  fontWeight: 700,
                  mb: 3,
                  fontSize: { xs: '1.75rem', md: '2.25rem' },
                }}
              >
                Our Mission
              </Typography>
              <Typography 
                variant="body1"
                sx={{ 
                  lineHeight: 1.8,
                  fontSize: '1.1rem',
                  mb: 2
                }}
              >
                To transform the property search experience in Jamaica by providing a user-friendly platform that connects property seekers with their ideal properties through innovative technology and personalized recommendations.
              </Typography>
              <Typography 
                variant="body1"
                sx={{ 
                  lineHeight: 1.8,
                  fontSize: '1.1rem'
                }}
              >
                We strive to simplify the property hunting process, making it accessible, efficient, and enjoyable for everyone.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper 
              sx={{ 
                p: 4, 
                height: '100%',
                borderRadius: 4,
                background: `linear-gradient(135deg, ${theme.palette.secondary.light}, ${theme.palette.secondary.dark})`,
                color: 'white',
                boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
              }}
            >
              <Typography 
                variant="h3" 
                gutterBottom
                sx={{ 
                  fontWeight: 700,
                  mb: 3,
                  fontSize: { xs: '1.75rem', md: '2.25rem' },
                }}
              >
                Our Vision
              </Typography>
              <Typography 
                variant="body1"
                sx={{ 
                  lineHeight: 1.8,
                  fontSize: '1.1rem',
                  mb: 2
                }}
              >
                To become the leading property search platform in Jamaica, known for our commitment to excellence, transparency, and user satisfaction.
              </Typography>
              <Typography 
                variant="body1"
                sx={{ 
                  lineHeight: 1.8,
                  fontSize: '1.1rem'
                }}
              >
                We aim to revolutionize the real estate market by leveraging cutting-edge technology to create meaningful connections between properties and people, making property hunting an enjoyable journey rather than a daunting task.
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Call to Action Section */}
        <Paper 
          elevation={0}
          sx={{ 
            p: 6, 
            mb: 10,
            textAlign: 'center',
            borderRadius: 4,
            background: 'linear-gradient(rgba(255,255,255,0.9), rgba(255,255,255,0.9)), url(https://images.unsplash.com/photo-1580237072617-771c3ecc4a24?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2069&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            border: `1px solid ${theme.palette.grey[200]}`
          }}
        >
          <Typography 
            variant="h3" 
            component="h2" 
            gutterBottom
            sx={{ 
              fontWeight: 700,
              mb: 3,
              fontSize: { xs: '1.75rem', md: '2.5rem' },
              color: theme.palette.primary.main
            }}
          >
            Join the Property Pro Family
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              maxWidth: '800px', 
              mx: 'auto', 
              mb: 4,
              color: theme.palette.text.secondary,
              fontWeight: 400
            }}
          >
            Whether you're looking for your dream home or wanting to list your property, we're here to help you every step of the way.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Box 
              component="a" 
              href="/register"
              sx={{
                px: 4,
                py: 2,
                bgcolor: theme.palette.primary.main,
                color: 'white',
                borderRadius: 2,
                fontWeight: 600,
                fontSize: '1rem',
                textDecoration: 'none',
                display: 'inline-block',
                transition: 'all 0.3s',
                '&:hover': {
                  bgcolor: theme.palette.primary.dark,
                  transform: 'translateY(-3px)',
                  boxShadow: '0 5px 15px rgba(0,0,0,0.2)'
                }
              }}
            >
              Get Started
            </Box>
            <Box 
              component="a" 
              href="/contact"
              sx={{
                px: 4,
                py: 2,
                border: `2px solid ${theme.palette.primary.main}`,
                color: theme.palette.primary.main,
                borderRadius: 2,
                fontWeight: 600,
                fontSize: '1rem',
                textDecoration: 'none',
                display: 'inline-block',
                transition: 'all 0.3s',
                '&:hover': {
                  bgcolor: theme.palette.primary.main,
                  color: 'white',
                  transform: 'translateY(-3px)',
                  boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
                }
              }}
            >
              Contact Us
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default AboutUs;