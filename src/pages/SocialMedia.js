// src/pages/SocialMedia.js
import React from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Paper, 
  Button, 
  Link, 
  Divider, 
  useTheme,
  Card,
  CardContent
} from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import YouTubeIcon from '@mui/icons-material/YouTube';
import ShareIcon from '@mui/icons-material/Share';
import PersonIcon from '@mui/icons-material/Person';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EventIcon from '@mui/icons-material/Event';
import SchoolIcon from '@mui/icons-material/School';
import LiveTvIcon from '@mui/icons-material/LiveTv';

const SocialMedia = () => {
  const theme = useTheme();
  
  // Social media platforms with enhanced descriptions
  const socialPlatforms = [
    {
      name: 'Facebook',
      icon: <FacebookIcon fontSize="large" />,
      color: '#1877F2',
      url: 'https://www.facebook.com/propertypro',
      description: 'Follow us on Facebook for daily property updates, market insights, exclusive announcements, and community events. Join our growing community of property enthusiasts.',
    },
    {
      name: 'Instagram',
      icon: <InstagramIcon fontSize="large" />,
      color: '#E4405F',
      url: 'https://www.instagram.com/propertypro',
      description: 'Experience beautiful property photos, virtual tours, interior design inspirations, and behind-the-scenes content from our team and featured properties across Jamaica.',
    },
    {
      name: 'Twitter',
      icon: <TwitterIcon fontSize="large" />,
      color: '#1DA1F2',
      url: 'https://www.twitter.com/propertypro',
      description: 'Get real-time updates on property market trends, breaking real estate news, policy changes, and announcements. Join the conversation about Jamaica property market.',
    },
    {
      name: 'LinkedIn',
      icon: <LinkedInIcon fontSize="large" />,
      color: '#0A66C2',
      url: 'https://www.linkedin.com/company/propertypro',
      description: 'Connect with our team and stay updated on industry news, career opportunities, professional insights, and thought leadership content about the real estate sector.',
    },
    {
      name: 'YouTube',
      icon: <YouTubeIcon fontSize="large" />,
      color: '#FF0000',
      url: 'https://www.youtube.com/c/propertypro',
      description: 'Watch comprehensive property tours, interviews with industry experts, market analysis videos, how-to guides, and webinars about buying, selling, and investing in Jamaican real estate.',
    }
  ];

  // Social media benefits with icons
  const benefits = [
    {
      text: "Get exclusive property listings before they hit the market",
      icon: <TrendingUpIcon fontSize="small" />
    },
    {
      text: "Stay updated on real estate trends and market insights",
      icon: <ShareIcon fontSize="small" />
    },
    {
      text: "Participate in our community events and webinars",
      icon: <EventIcon fontSize="small" />
    },
    {
      text: "Connect with property owners, agents, and fellow seekers",
      icon: <PersonIcon fontSize="small" />
    },
    {
      text: "Access helpful tips and guides for buying or renting properties",
      icon: <SchoolIcon fontSize="small" />
    },
    {
      text: "Join live Q&A sessions with real estate experts",
      icon: <LiveTvIcon fontSize="small" />
    }
  ];

  return (
    <Box sx={{ backgroundColor: '#f5f7fa', minHeight: '100vh' }}>
      {/* Hero Section with Modern Design */}
      <Box
        sx={{
          position: 'relative',
          height: '400px',
          backgroundImage: 'linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(https://images.unsplash.com/photo-1562577309-4932fdd64cd1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80)',
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
            Connect With Us
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
            Follow Property Pro on social media for the latest updates, exclusive content, and community engagement
          </Typography>
        </Box>
      </Box>

      <Container maxWidth="lg">
        {/* Social Platforms with Modern Cards */}
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
            Our Social Channels
          </Typography>
          
          <Grid container spacing={4}>
            {socialPlatforms.map((platform, index) => (
              <Grid item xs={12} md={6} key={index}>
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
                      p: 4, 
                      bgcolor: platform.color,
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <Box sx={{ mr: 2, fontSize: '2.5rem' }}>
                      {platform.icon}
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {platform.name}
                    </Typography>
                  </Box>
                  <Box sx={{ p: 4 }}>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        mb: 3, 
                        lineHeight: 1.8,
                        fontSize: '1.1rem'
                      }}
                    >
                      {platform.description}
                    </Typography>
                    <Button 
                      variant="contained" 
                      href={platform.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      startIcon={platform.icon}
                      sx={{ 
                        backgroundColor: platform.color,
                        '&:hover': {
                          backgroundColor: platform.color,
                          opacity: 0.9,
                          transform: 'translateY(-2px)'
                        },
                        py: 1.5,
                        px: 3,
                        borderRadius: '30px',
                        fontWeight: 600,
                        boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                        transition: 'all 0.3s'
                      }}
                    >
                      Follow Us
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Why Follow Us Section with Modern Design */}
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
            Why Follow Us?
          </Typography>
          
          <Paper 
            elevation={3}
            sx={{ 
              p: { xs: 3, md: 5 },
              borderRadius: 4,
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
            }}
          >
            <Grid container spacing={4}>
              {benefits.map((benefit, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Box 
                    sx={{ 
                      display: 'flex',
                      alignItems: 'flex-start',
                      p: 2,
                      borderRadius: 2,
                      transition: 'all 0.3s',
                      '&:hover': {
                        bgcolor: 'rgba(0,0,0,0.02)',
                        transform: 'translateY(-3px)'
                      }
                    }}
                  >
                    <Box 
                      sx={{ 
                        color: 'white',
                        bgcolor: theme.palette.primary.main,
                        borderRadius: '50%',
                        p: 1,
                        mr: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: 40,
                        height: 40
                      }}
                    >
                      {benefit.icon}
                    </Box>
                    <Typography 
                      variant="body1"
                      sx={{ 
                        fontWeight: 500,
                        fontSize: '1.05rem',
                        lineHeight: 1.6
                      }}
                    >
                      {benefit.text}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Box>

        {/* Share Your Experience Section */}
        <Box mb={10}>
          <Card 
            elevation={3}
            sx={{ 
              borderRadius: 4,
              overflow: 'hidden'
            }}
          >
            <Box 
              sx={{ 
                p: { xs: 4, md: 6 },
                background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.95)), url(https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                textAlign: 'center'
              }}
            >
              <Typography 
                variant="h3" 
                gutterBottom
                sx={{ 
                  fontWeight: 700,
                  mb: 3,
                  color: theme.palette.primary.main
                }}
              >
                Share Your Experience
              </Typography>
              <Typography 
                variant="h6" 
                paragraph
                sx={{ 
                  maxWidth: '800px',
                  mx: 'auto',
                  mb: 4,
                  fontWeight: 400
                }}
              >
                Found your dream property through Property Pro? We'd love to hear about it!
                Share your success story on social media using the hashtag 
                <Box 
                  component="span" 
                  sx={{ 
                    fontWeight: 700,
                    color: theme.palette.primary.main,
                    mx: 1
                  }}
                >
                  #PropertyProSuccess
                </Box>
              </Typography>
              <Box 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  flexWrap: 'wrap',
                  gap: 2, 
                  mt: 4
                }}
              >
                {socialPlatforms.map((platform, index) => (
                  <Button 
                    key={index}
                    variant="outlined"
                    href={platform.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ 
                      color: platform.color,
                      borderColor: platform.color,
                      borderWidth: 2,
                      p: 1.5,
                      minWidth: 60,
                      borderRadius: '50%',
                      '&:hover': {
                        borderColor: platform.color,
                        backgroundColor: `${platform.color}15`,
                        transform: 'translateY(-3px)'
                      },
                      transition: 'all 0.3s'
                    }}
                  >
                    {platform.icon}
                  </Button>
                ))}
              </Box>
            </Box>
          </Card>
        </Box>

        {/* Stay Connected Section */}
        <Box textAlign="center" mb={8} sx={{ maxWidth: '700px', mx: 'auto' }}>
          <Typography 
            variant="h3" 
            gutterBottom
            sx={{ 
              fontWeight: 700,
              fontSize: { xs: '1.75rem', md: '2.5rem' },
              color: theme.palette.primary.main
            }}
          >
            Stay Connected
          </Typography>
          <Typography 
            variant="body1"
            sx={{ 
              fontSize: '1.2rem',
              lineHeight: 1.8
            }}
          >
            Join our growing online community to receive exclusive property alerts, market insights, and special offers. 
            Don't miss out on your dream property – follow us today!
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default SocialMedia;