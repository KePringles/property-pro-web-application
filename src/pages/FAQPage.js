import React, { useState } from 'react';
import Tooltip from '@mui/material/Tooltip';
import {
  Container,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Divider,
  Paper,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Fade,
  Button,
  Stack
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import SearchIcon from '@mui/icons-material/Search';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import HouseIcon from '@mui/icons-material/House';
import GroupIcon from '@mui/icons-material/Group';
import ChatIcon from '@mui/icons-material/Chat';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';

const seekerFaqs = [
  {
    question: 'How can I find properties that match my preferences?',
    answer: 'Use our advanced filters to set your preferred location, price, size, and amenities. Our AI recommendation engine will suggest matching listings.',
    icon: <PersonSearchIcon color="primary" sx={{ mr: 1 }} />
  },
  {
    question: 'Can I schedule a property viewing through the platform?',
    answer: 'Yes, you can schedule viewings directly from the property details page or contact the owner or agent.',
    icon: <PersonSearchIcon color="primary" sx={{ mr: 1 }} />
  },
  {
    question: 'What if a listing seems suspicious or outdated?',
    answer: 'Use the "Report Listing" button to alert our team. We review reports promptly to maintain listing quality.',
    icon: <PersonSearchIcon color="primary" sx={{ mr: 1 }} />
  }
];

const ownerFaqs = [
  {
    question: 'How do I list my property on Property Pro?',
    answer: 'Register as a Property Owner, then go to your dashboard and use the "Add Property" button.',
    icon: <HouseIcon color="primary" sx={{ mr: 1 }} />
  },
  {
    question: 'Can I edit or remove a property listing after it’s published?',
    answer: 'Yes, manage your listings from the dashboard with options to edit or delete.',
    icon: <HouseIcon color="primary" sx={{ mr: 1 }} />
  },
  {
    question: 'Do I need to verify my property?',
    answer: 'Yes, our team will review and verify property details and media before publication.',
    icon: <HouseIcon color="primary" sx={{ mr: 1 }} />
  }
];

const agentFaqs = [
  {
    question: 'What tools are available for real estate agents?',
    answer: 'Agents get a multi-property dashboard, engagement tracking, and branding tools.',
    icon: <GroupIcon color="primary" sx={{ mr: 1 }} />
  },
  {
    question: 'Can I advertise my services as an agent?',
    answer: 'Yes! You can add your agent profile and credentials for increased trust and visibility.',
    icon: <GroupIcon color="primary" sx={{ mr: 1 }} />
  },
  {
    question: 'How do I respond to inquiries from seekers?',
    answer: 'All messages are sent to your dashboard and email—respond promptly for best results.',
    icon: <GroupIcon color="primary" sx={{ mr: 1 }} />
  }
];

const categories = [
  { label: 'Property Seekers', value: 'seekers', data: seekerFaqs, icon: <PersonSearchIcon sx={{ mr: 1 }} /> },
  { label: 'Property Owners', value: 'owners', data: ownerFaqs, icon: <HouseIcon sx={{ mr: 1 }} /> },
  { label: 'Real Estate Agents', value: 'agents', data: agentFaqs, icon: <GroupIcon sx={{ mr: 1 }} /> }
];

const FAQPage = () => {
  const [tab, setTab] = useState('seekers');
  const [search, setSearch] = useState('');
  const [question, setQuestion] = useState('');
  const [email, setEmail] = useState('');

  const handleTabChange = (e, newValue) => setTab(newValue);

  const renderFaqs = (faqs) => {
    const filtered = faqs.filter(faq =>
      faq.question.toLowerCase().includes(search.toLowerCase()) ||
      faq.answer.toLowerCase().includes(search.toLowerCase())
    );

    return filtered.map((faq, index) => (
      <Fade in={true} timeout={400} key={index}>
        <Accordion sx={{ mb: 2, borderRadius: 2, boxShadow: 1 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {faq.icon}
              <Typography variant="subtitle1" fontWeight="bold">
                {faq.question}
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1">{faq.answer}</Typography>
          </AccordionDetails>
        </Accordion>
      </Fade>
    ));
  };

  const currentFaqs = categories.find(c => c.value === tab)?.data || [];

  return (
    <Box sx={{ backgroundColor: '#f4f6f8', minHeight: '100vh', py: 6 }}>
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3, background: 'linear-gradient(135deg, #ffffff 0%, #f1f4f9 100%)' }}>
          <Typography variant="h3" fontWeight="bold" gutterBottom align="center" color="primary">
            Help & Support
          </Typography>
          <Typography variant="h6" align="center" color="text.secondary" gutterBottom>
            Search FAQs or browse by category below
          </Typography>

          <Box sx={{ mt: 4, mb: 3 }}>
            <TextField
              fullWidth
              placeholder="Search FAQs..."
              variant="outlined"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />
          </Box>

          <Tabs
            value={tab}
            onChange={handleTabChange}
            centered
            textColor="primary"
            indicatorColor="primary"
            sx={{ mb: 4 }}
          >
            {categories.map((cat) => (
              <Tab
                key={cat.value}
                value={cat.value}
                icon={cat.icon}
                iconPosition="start"
                label={cat.label}
              />
            ))}
          </Tabs>

          {renderFaqs(currentFaqs)}

          <Divider sx={{ my: 4 }} />

          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Still have questions?
          </Typography>
          <Typography variant="body1" gutterBottom>
            Submit your question below or visit our <a href="/contact" style={{ color: '#1976d2' }}>Contact Page</a> for direct support.
          </Typography>

          <Box component="form" noValidate sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Your Question"
              placeholder="Type your question here..."
              variant="outlined"
              multiline
              rows={4}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Your Email"
              placeholder="you@example.com"
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button variant="contained" color="primary" size="large" sx={{ px: 4 }}>
                Submit Question
              </Button>
              <Tooltip title="Call us at +1 (876) 123-4567">
  <Button
                variant="outlined"
                color="primary"
                size="large"
                startIcon={<SupportAgentIcon />}
                onClick={() => window.location.href = 'tel:+18761234567'}
              >
                Get Support
              </Button>
</Tooltip>
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
            </Stack>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default FAQPage;
