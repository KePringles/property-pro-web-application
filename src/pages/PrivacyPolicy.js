// src/pages/PrivacyPolicy.js
import React from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Divider, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  useTheme,
  Grid
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SecurityIcon from '@mui/icons-material/Security';
import PrivacyTipIcon from '@mui/icons-material/PrivacyTip';
import DataUsageIcon from '@mui/icons-material/DataUsage';
import GavelIcon from '@mui/icons-material/Gavel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const PrivacyPolicy = () => {
  const theme = useTheme();

  // Last updated date
  const lastUpdated = "April 18, 2025";

  // Privacy policy sections
  const sections = [
    {
      id: 'information-collection',
      title: "1. Information We Collect",
      content: `We collect several types of information to provide and improve our services:

**Personal Information**: Name, email address, phone number, and physical address.

**Property Preferences**: Information about the types of properties you're interested in, budget range, and preferred locations.

**Usage Data**: Information on how you use our platform, including browsing history, property views, and search patterns.

**Technical Data**: IP address, browser type, device information, and cookies.

**User Content**: Property listings, reviews, and comments you create on our platform.`
    },
    {
      id: 'information-use',
      title: "2. How We Use Your Information",
      content: `We use the collected information for the following purposes:

**Service Provision**: To provide and maintain our platform, including user authentication and property matching.

**Personalization**: To tailor our services to your preferences and provide relevant property recommendations.

**Communication**: To contact you regarding your account, properties you're interested in, or platform updates.

**Analytics**: To understand how our platform is used and improve our services.

**Legal Compliance**: To comply with legal obligations and enforce our terms of service.`
    },
    {
      id: 'information-sharing',
      title: "3. Information Sharing and Disclosure",
      content: `We may share your information with:

**Property Owners and Agents**: If you express interest in a property, your contact information may be shared with the relevant property owner or agent.

**Service Providers**: Third-party companies that help us operate our platform, such as hosting providers, analytics services, and payment processors.

**Legal Authorities**: When required by law or in response to legal process.

We do not sell your personal information to third parties.`
    },
    {
      id: 'data-security',
      title: "4. Data Security",
      content: `We implement appropriate security measures to protect your personal information from unauthorized access, disclosure, alteration, or destruction. These measures include:

**Encryption**: All data transmitted between your device and our servers is encrypted using SSL technology.

**Access Control**: Only authorized personnel have access to your personal information.

**Regular Audits**: We conduct regular security audits and vulnerability assessments.

However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.`
    },
    {
      id: 'user-rights',
      title: "5. Your Rights and Choices",
      content: `You have the following rights regarding your personal information:

**Access**: You can request a copy of the personal information we hold about you.

**Correction**: You can request that we correct any inaccurate information about you.

**Deletion**: You can request that we delete your personal information in certain circumstances.

**Opt-Out**: You can opt out of receiving marketing communications from us.

**Data Portability**: You can request a copy of your data in a structured, commonly used, and machine-readable format.

To exercise these rights, please contact us at privacy@propertypro.com.`
    },
    {
      id: 'cookies',
      title: "6. Cookies and Tracking Technologies",
      content: `We use cookies and similar tracking technologies to track activity on our platform and to hold certain information. Cookies are files with a small amount of data that may include an anonymous unique identifier.

**Types of Cookies We Use**:
- Essential cookies: necessary for the platform to function properly.
- Preference cookies: remember your preferences and settings.
- Analytics cookies: help us understand how you use our platform.
- Marketing cookies: used to deliver relevant advertisements.

You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our platform.`
    },
    {
      id: 'children-privacy',
      title: "7. Children's Privacy",
      content: `Our services are not directed to individuals under the age of 18. We do not knowingly collect personal information from children. If you are a parent or guardian and you believe your child has provided us with personal information, please contact us, and we will take steps to delete such information.`
    },
    {
      id: 'international-transfers',
      title: "8. International Data Transfers",
      content: `Your information may be transferred to and processed in countries other than the country in which you reside. These countries may have different data protection laws than your country.

We take appropriate measures to ensure that your personal information receives an adequate level of protection when transferred internationally, including using standard contractual clauses or other approved transfer mechanisms.`
    },
    {
      id: 'policy-changes',
      title: "9. Changes to This Policy",
      content: `We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.

We will provide more prominent notice if the changes are significant, including email notification for registered users.

We encourage you to review our Privacy Policy periodically for any changes.`
    },
    {
      id: 'contact-us',
      title: "10. Contact Us",
      content: `If you have any questions about this Privacy Policy or our data practices, please contact us at:

**Email**: privacy@propertypro.com

**Postal Address**:
Property Pro
30 Balmoral Avenue
Kingston 10, Jamaica

We will respond to your inquiry within 30 days.`
    }
  ];

  // Privacy principles
  const principles = [
    {
      title: "Transparency",
      description: "We clearly explain what data we collect and how we use it.",
      icon: <PrivacyTipIcon sx={{ fontSize: 48 }} />
    },
    {
      title: "Security",
      description: "We implement robust measures to keep your information safe.",
      icon: <SecurityIcon sx={{ fontSize: 48 }} />
    },
    {
      title: "Control",
      description: "You have control over your data and how it's used.",
      icon: <DataUsageIcon sx={{ fontSize: 48 }} />
    },
    {
      title: "Compliance",
      description: "We adhere to applicable data protection laws and regulations.",
      icon: <GavelIcon sx={{ fontSize: 48 }} />
    }
  ];

  return (
    <Box sx={{ backgroundColor: '#f5f7fa', minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          height: '300px',
          backgroundImage: 'linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(https://images.unsplash.com/photo-1510511459019-5dda7724fd87?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80)',
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
            Privacy Policy
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
            Your privacy is important to us. This policy outlines how we collect, use, and protect your information.
          </Typography>
        </Box>
      </Box>

      <Container maxWidth="lg">
        {/* Effective Date */}
        <Box mb={6} sx={{ textAlign: 'center' }}>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            Last Updated: {lastUpdated}
          </Typography>
        </Box>

        {/* Introduction */}
        <Paper elevation={3} sx={{ p: 4, mb: 6, borderRadius: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
            Introduction
          </Typography>
          <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
            Property Pro ("we," "us," or "our") respects your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services (collectively, the "Platform").
          </Typography>
          <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
            By accessing or using our Platform, you consent to the collection, use, and disclosure of your information as described in this Privacy Policy. If you do not agree with our policies and practices, please do not use our Platform.
          </Typography>
        </Paper>

        {/* Privacy Principles */}
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
            Our Privacy Principles
          </Typography>
          
          <Grid container spacing={4}>
            {principles.map((principle, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Paper 
                  elevation={2}
                  sx={{ 
                    p: 4,
                    height: '100%',
                    borderRadius: 4,
                    textAlign: 'center',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 12px 20px rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  <Box 
                    sx={{ 
                      color: theme.palette.primary.main,
                      mb: 2
                    }}
                  >
                    {principle.icon}
                  </Box>
                  <Typography 
                    variant="h5" 
                    gutterBottom
                    sx={{ fontWeight: 700 }}
                  >
                    {principle.title}
                  </Typography>
                  <Typography variant="body1">
                    {principle.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Privacy Policy Details */}
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
            Privacy Policy Details
          </Typography>
          
          {sections.map((section, index) => (
            <Accordion 
              key={section.id} 
              elevation={2}
              sx={{ 
                mb: 2,
                borderRadius: '8px !important',
                overflow: 'hidden',
                '&:before': {
                  display: 'none',
                },
                '&.Mui-expanded': {
                  boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                }
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`${section.id}-content`}
                id={`${section.id}-header`}
                sx={{ 
                  backgroundColor: index % 2 === 0 ? 'rgba(0,0,0,0.02)' : 'white',
                  '&.Mui-expanded': {
                    backgroundColor: theme.palette.primary.main,
                    color: 'white',
                    '& .MuiSvgIcon-root': {
                      color: 'white'
                    }
                  }
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {section.title}
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 4 }}>
                <Typography 
                  variant="body1" 
                  component="div"
                  sx={{ 
                    whiteSpace: 'pre-line', 
                    '& strong': {
                      fontWeight: 700,
                      color: theme.palette.primary.main
                    } 
                  }}
                  dangerouslySetInnerHTML={{ __html: section.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
                />
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>

        {/* Compliance Notice */}
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            mb: 8, 
            borderRadius: 4,
            backgroundColor: theme.palette.primary.light,
            color: theme.palette.primary.contrastText
          }}
        >
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
            Compliance with Data Protection Laws
          </Typography>
          <Typography variant="body1" paragraph>
            Property Pro is committed to complying with applicable data protection laws, including the Data Protection Act of Jamaica. We regularly review our privacy practices to ensure they meet or exceed legal requirements.
          </Typography>
          <Box sx={{ mt: 3 }}>
            <List>
              {[
                "We only collect the personal information necessary for our services.",
                "We process personal information lawfully, fairly, and transparently.",
                "We implement appropriate technical and organizational measures to secure personal information.",
                "We respect and facilitate your rights regarding your personal information."
              ].map((item, index) => (
                <ListItem key={index} sx={{ padding: 0, mb: 1 }}>
                  <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
                    <CheckCircleIcon />
                  </ListItemIcon>
                  <ListItemText primary={item} />
                </ListItem>
              ))}
            </List>
          </Box>
        </Paper>

        {/* Contact Information */}
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4,
            mb: 8, 
            borderRadius: 4,
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.9)), url(https://images.unsplash.com/photo-1516156008625-3a9d6067fab5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
            Privacy Questions?
          </Typography>
          <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', maxWidth: '800px', mx: 'auto', mb: 3 }}>
            If you have any questions or concerns about our Privacy Policy or data practices, please contact our Privacy Team.
          </Typography>
          <Box sx={{ 
            display: 'inline-block', 
            bgcolor: 'white', 
            p: 3, 
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            mt: 2
          }}>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              Email: <Box component="span" sx={{ color: theme.palette.primary.main }}>privacy@propertypro.com</Box>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default PrivacyPolicy;