// src/pages/Terms.js
import React from 'react';
import { Container, Typography, Box, Paper, Divider } from '@mui/material';

const Terms = () => {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Paper elevation={2} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Terms and Conditions
        </Typography>
        
        <Typography variant="subtitle1" color="text.secondary" paragraph>
          Last Updated: March 2025
        </Typography>
        
        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            1. Acceptance of Terms
          </Typography>
          
          <Typography variant="body1" paragraph>
            By accessing and using Property Pro, you accept and agree to be bound by the terms and provisions of this agreement. 
            If you do not agree to abide by the terms of this agreement, do not use or access our services.
          </Typography>
        </Box>
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            2. Property Listings
          </Typography>
          
          <Typography variant="body1" paragraph>
            Property Pro does not guarantee the accuracy of property listings. While we strive to provide accurate and up-to-date information, 
            all property details should be verified independently. Property Pro is not responsible for any inaccuracies in listings.
          </Typography>
          
          <Typography variant="body1" paragraph>
            Property owners and agents are solely responsible for the accuracy of their listings. Any disputes regarding property 
            details must be resolved directly with the property owner or agent.
          </Typography>
        </Box>
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            3. User Accounts
          </Typography>
          
          <Typography variant="body1" paragraph>
            You are responsible for maintaining the confidentiality of your account information, including your password, 
            and for all activity that occurs under your account. You agree to notify Property Pro immediately of any unauthorized 
            use of your account or password.
          </Typography>
        </Box>
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            4. User Conduct
          </Typography>
          
          <Typography variant="body1" paragraph>
            You agree not to use Property Pro for any illegal or unauthorized purpose. You must not attempt to interfere with the 
            proper functioning of our services or attempt to bypass any measures we use to prevent or restrict access.
          </Typography>
        </Box>
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            5. Intellectual Property
          </Typography>
          
          <Typography variant="body1" paragraph>
            All content included on Property Pro, such as text, graphics, logos, images, and software, is the property of 
            Property Pro or its content suppliers and is protected by Jamaican and international copyright laws.
          </Typography>
        </Box>
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            6. Limitation of Liability
          </Typography>
          
          <Typography variant="body1" paragraph>
            Property Pro shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages 
            resulting from your access to or use of, or inability to access or use, our services.
          </Typography>
        </Box>
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            7. Governing Law
          </Typography>
          
          <Typography variant="body1" paragraph>
            These terms and conditions are governed by and construed in accordance with the laws of Jamaica. Any disputes 
            relating to these terms and conditions shall be subject to the exclusive jurisdiction of the courts of Jamaica.
          </Typography>
        </Box>
        
        <Box>
          <Typography variant="h6" gutterBottom>
            8. Changes to Terms
          </Typography>
          
          <Typography variant="body1" paragraph>
            Property Pro reserves the right to modify these terms and conditions at any time. We will notify users of any 
            significant changes via email or by posting a notice on our website. Your continued use of Property Pro after any 
            changes indicates your acceptance of the new terms.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Terms;