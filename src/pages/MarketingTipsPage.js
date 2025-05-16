// src/pages/MarketingTipsPage.js
import React, { useState } from 'react';
import { 
  Container, Typography, Box, Grid, Paper, Button, 
  Card, CardMedia, CardContent, CardActions, Divider,
  List, ListItem, ListItemIcon, ListItemText, ListItemButton,
  TextField, InputAdornment, Chip, Tab, Tabs, Avatar,
  IconButton, Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CameraEnhanceIcon from '@mui/icons-material/CameraEnhance';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import SpeedIcon from '@mui/icons-material/Speed';
import PeopleIcon from '@mui/icons-material/People';
import StarIcon from '@mui/icons-material/Star';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ShareIcon from '@mui/icons-material/Share';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import BusinessIcon from '@mui/icons-material/Business';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import { useNavigate } from 'react-router-dom';

// Marketing tip categories
const tipCategories = [
  "All",
  "Photography",
  "Listing Description",
  "Pricing Strategy",
  "Social Media",
  "Virtual Tours",
  "Email Marketing",
  "Staging"
];

// Featured marketing tips
const featuredTips = [
  {
    id: 1,
    title: "Professional Photography: The Foundation of Effective Property Marketing",
    summary: "Learn how professional photography can dramatically improve your property listing's engagement and reduce time on market.",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
    category: "Photography",
    readTime: 5,
    views: 2458,
    likes: 186,
    author: "Sarah Johnson",
    authorAvatar: "https://randomuser.me/api/portraits/women/44.jpg",
    date: "2025-04-10"
  },
  {
    id: 2,
    title: "Strategic Pricing: How to Position Your Property for Maximum Interest",
    summary: "Discover pricing strategies that attract the right buyers and create a sense of urgency without undervaluing your property.",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80",
    category: "Pricing Strategy",
    readTime: 6,
    views: 1893,
    likes: 142,
    author: "David Chen",
    authorAvatar: "https://randomuser.me/api/portraits/men/32.jpg",
    date: "2025-04-05"
  },
  {
    id: 3,
    title: "Creating Virtual Tours That Convert Viewers into Buyers",
    summary: "Step-by-step guide to creating engaging virtual tours that give potential buyers the confidence to make an offer.",
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80",
    category: "Virtual Tours",
    readTime: 7,
    views: 1756,
    likes: 129,
    author: "Tanesha Williams",
    authorAvatar: "https://randomuser.me/api/portraits/women/63.jpg",
    date: "2025-03-28"
  }
];

// All marketing tips
const allMarketingTips = [
  ...featuredTips,
  {
    id: 4,
    title: "Crafting Property Descriptions That Sell",
    summary: "Learn the art of writing compelling property descriptions that highlight key features and create an emotional connection with potential buyers.",
    image: "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=800&q=80",
    category: "Listing Description",
    readTime: 4,
    views: 1245,
    likes: 98,
    author: "Marcus Brown",
    authorAvatar: "https://randomuser.me/api/portraits/men/11.jpg",
    date: "2025-03-20"
  },
  {
    id: 5,
    title: "Instagram for Real Estate: Building Your Property Brand",
    summary: "Discover how to leverage Instagram to showcase properties, build your brand, and connect with potential clients.",
    image: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=800&q=80",
    category: "Social Media",
    readTime: 5,
    views: 1532,
    likes: 124,
    author: "Rachel Morgan",
    authorAvatar: "https://randomuser.me/api/portraits/women/22.jpg",
    date: "2025-03-15"
  },
  {
    id: 6,
    title: "Home Staging on a Budget: Maximum Impact, Minimum Cost",
    summary: "Practical tips for staging your property to impress buyers without breaking the bank.",
    image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb3?auto=format&fit=crop&w=800&q=80",
    category: "Staging",
    readTime: 6,
    views: 1189,
    likes: 112,
    author: "Anthony Richards",
    authorAvatar: "https://randomuser.me/api/portraits/men/53.jpg",
    date: "2025-03-08"
  },
  {
    id: 7,
    title: "Email Campaigns That Drive Property Inquiries",
    summary: "Learn how to create targeted email campaigns that nurture leads and convert them into serious property inquiries.",
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80",
    category: "Email Marketing",
    readTime: 5,
    views: 1078,
    likes: 89,
    author: "Sarah Johnson",
    authorAvatar: "https://randomuser.me/api/portraits/women/44.jpg",
    date: "2025-03-01"
  },
  {
    id: 8,
    title: "Lighting Techniques for Stunning Property Photography",
    summary: "Master the art of lighting to make your property photos stand out and showcase spaces at their absolute best.",
    image: "https://images.unsplash.com/photo-1565538810643-b5bdb714032a?auto=format&fit=crop&w=800&q=80",
    category: "Photography",
    readTime: 6,
    views: 987,
    likes: 94,
    author: "David Chen",
    authorAvatar: "https://randomuser.me/api/portraits/men/32.jpg",
    date: "2025-02-22"
  }
];

// Quick tips data
const quickTips = [
  {
    title: "Use wide-angle lenses for interior photos",
    description: "Wide-angle lenses (16-24mm) help showcase spacious rooms while capturing more details in a single frame.",
    icon: <CameraEnhanceIcon />
  },
  {
    title: "Price just below psychological thresholds",
    description: "List at J$19,995,000 instead of J$20,000,000 to appear in more search results and create the perception of a better deal.",
    icon: <MonetizationOnIcon />
  },
  {
    title: "Respond to inquiries within 5 minutes",
    description: "Quick response time significantly increases your chances of converting leads into viewings and eventual sales.",
    icon: <SpeedIcon />
  },
  {
    title: "Target specific buyer personas",
    description: "Create marketing materials that speak directly to the lifestyle and needs of your ideal buyer demographic.",
    icon: <PeopleIcon />
  }
];

// Success stories data
const successStories = [
  {
    id: 1,
    title: "From 60 Days to 5 Days on Market",
    description: "After implementing our photography and staging tips, this Kingston property sold in just 5 days after being on the market for 60 days with traditional marketing.",
    image: "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=800&q=80",
    result: "Sold 12% above asking price"
  },
  {
    id: 2,
    title: "Virtual Tours Drive International Buyer Interest",
    description: "A luxury property in Montego Bay received 3 competing offers from international buyers who had only seen the property through our virtual tour strategy.",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
    result: "Sold to overseas buyer sight-unseen"
  },
  {
    id: 3,
    title: "Strategic Social Media Campaign",
    description: "A targeted Instagram campaign for this unique property in Ocho Rios reached over 50,000 qualified leads and resulted in 25 showing requests in one week.",
    image: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=800&q=80",
    result: "Sold within 2 weeks at full asking price"
  }
];

// FAQ data
const faqData = [
  {
    question: "How important is professional photography for my property listing?",
    answer: "Professional photography is extremely important, as listings with professional photos receive up to 61% more views and can sell for 20% more than properties with amateur or no photos. First impressions are crucial in real estate marketing."
  },
  {
    question: "Should I invest in virtual tours for my property?",
    answer: "Yes, especially in today's market. Virtual tours have been shown to increase listing interest by up to 87% and are particularly valuable for attracting international buyers or those who cannot easily visit in person. They also help pre-qualify buyers as those who request in-person viewings are typically more serious."
  },
  {
    question: "How can I make my property stand out in a competitive market?",
    answer: "Focus on professional photography, compelling listing descriptions that tell a story, appropriate pricing, and highlighting unique features. Staging the property, even minimally, can also dramatically improve buyer interest and perceived value."
  },
  {
    question: "What's the best time to list my property?",
    answer: "In Jamaica, January through April tends to be the best time to list properties, especially for those targeting international buyers. However, well-marketed properties can sell at any time of year. The best strategy is to be ready when the market is active in your area."
  },
  {
    question: "How do I determine the right asking price for my property?",
    answer: "Pricing strategy should be based on recent comparable sales, current market conditions, property condition, and unique features. A slightly below-market price can create more interest and potentially lead to multiple offers, while overpricing can lead to longer time on market and eventual price reductions."
  }
];

const MarketingTipsPage = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [savedTips, setSavedTips] = useState([]);
  
  // Handle category change
  const handleCategoryChange = (event, newValue) => {
    setActiveCategory(newValue);
  };
  
  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    // Search implementation would go here
    console.log("Searching for:", searchTerm);
  };
  
  // Handle save/bookmark tip
  const handleSaveTip = (tipId) => {
    if (savedTips.includes(tipId)) {
      setSavedTips(savedTips.filter(id => id !== tipId));
    } else {
      setSavedTips([...savedTips, tipId]);
    }
  };
  
  // Filter tips based on active category
  const filteredTips = activeCategory === "All" 
    ? allMarketingTips 
    : allMarketingTips.filter(tip => tip.category === activeCategory);
  
  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <Box sx={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          height: { xs: '450px', md: '500px' },
          backgroundImage: 'url(https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?auto=format&fit=crop&w=2070&q=80)',
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
            backgroundColor: 'rgba(0,0,0,0.65)',
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
            Property Marketing Tips
          </Typography>
          <Typography 
            variant="h5" 
            sx={{ 
              color: 'white', 
              mb: 4, 
              opacity: 0.9,
              maxWidth: '800px',
              mx: 'auto',
              textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
            }}
          >
            Expert strategies to market your property effectively and maximize your selling potential
          </Typography>
          
          <Box 
            component="form" 
            onSubmit={handleSearch}
            sx={{
              display: 'flex',
              maxWidth: '600px',
              mx: 'auto'
            }}
          >
            <TextField
              fullWidth
              placeholder="Search marketing tips..."
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'white' }} />
                  </InputAdornment>
                ),
                sx: {
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(5px)',
                  borderRadius: '4px',
                  color: 'white',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255,255,255,0.3)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255,255,255,0.5)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'white',
                  },
                  '& .MuiInputAdornment-root': {
                    color: 'white',
                  },
                  '&::placeholder': {
                    color: 'rgba(255,255,255,0.7)',
                  },
                }
              }}
            />
            <Button
              type="submit"
              variant="contained"
              sx={{
                ml: 1,
                px: 3,
                backgroundColor: 'primary.main',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                }
              }}
            >
              Search
            </Button>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* Featured Tips Section */}
        <Box mb={8}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Featured Marketing Strategies
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={3}>
            {featuredTips.map((tip) => (
              <Grid item xs={12} md={4} key={tip.id}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    borderRadius: 2,
                    overflow: 'hidden',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
                    }
                  }}
                >
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={tip.image}
                      alt={tip.title}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 12,
                        left: 12,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1
                      }}
                    >
                      <Chip
                        label="Featured"
                        sx={{
                          bgcolor: 'primary.main',
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                        size="small"
                      />
                      <Chip
                        label={tip.category}
                        sx={{
                          bgcolor: 'rgba(255,255,255,0.85)',
                          fontWeight: 500
                        }}
                        size="small"
                      />
                    </Box>
                    <IconButton
                      sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        bgcolor: 'rgba(255,255,255,0.85)',
                        '&:hover': {
                          bgcolor: 'rgba(255,255,255,0.95)',
                        }
                      }}
                      size="small"
                      onClick={() => handleSaveTip(tip.id)}
                      color={savedTips.includes(tip.id) ? "primary" : "default"}
                    >
                      {savedTips.includes(tip.id) ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                    </IconButton>
                  </Box>
                  
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 'bold',
                        mb: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {tip.title}
                    </Typography>
                    
                    <Typography 
                      color="text.secondary" 
                      variant="body2"
                      paragraph
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {tip.summary}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AccessTimeIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          {tip.readTime} min read
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <VisibilityIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          {tip.views}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                  
                  <Box sx={{ px: 3, pb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar src={tip.authorAvatar} alt={tip.author} sx={{ width: 32, height: 32, mr: 1 }} />
                      <Box>
                        <Typography variant="caption" fontWeight="medium">
                          {tip.author}
                        </Typography>
                        <Typography variant="caption" display="block" color="text.secondary">
                          {formatDate(tip.date)}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Button
                      size="small"
                      endIcon={<ArrowForwardIcon />}
                      onClick={() => navigate(`/marketing-tips/${tip.id}`)}
                    >
                      Read More
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Quick Tips Section */}
        <Box mb={8}>
          <Paper 
            sx={{ 
              p: { xs: 3, md: 4 }, 
              borderRadius: 2,
              backgroundImage: 'linear-gradient(to right, #f8f9fa, #e9ecef)'
            }}
          >
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Quick Marketing Tips
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" paragraph>
              Actionable strategies you can implement today
            </Typography>
            
            <Grid container spacing={3} sx={{ mt: 2 }}>
              {quickTips.map((tip, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      height: '100%',
                      p: 2,
                      bgcolor: 'white',
                      borderRadius: 2,
                      boxShadow: 1,
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: 2
                      }
                    }}
                  >
                    <Box 
                      sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: 1.5,
                        bgcolor: 'primary.main',
                        color: 'white',
                        borderRadius: '50%',
                        width: 50,
                        height: 50,
                        mb: 2
                      }}
                    >
                      {tip.icon}
                    </Box>
                    <Typography variant="h6" gutterBottom fontWeight="bold">
                      {tip.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {tip.description}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Box>

        {/* All Marketing Tips */}
        <Box mb={8}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs
              value={activeCategory}
              onChange={handleCategoryChange}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              sx={{
                '& .MuiTab-root': {
                  fontWeight: 600,
                  minWidth: 'auto',
                  px: 2
                }
              }}
            >
              {tipCategories.map((category) => (
                <Tab 
                  key={category} 
                  label={category} 
                  value={category}
                />
              ))}
            </Tabs>
          </Box>
          
          <Grid container spacing={3}>
            {filteredTips.map((tip) => (
              <Grid item xs={12} sm={6} md={4} key={tip.id}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    borderRadius: 2,
                    overflow: 'hidden',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
                    }
                  }}
                >
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      height="180"
                      image={tip.image}
                      alt={tip.title}
                    />
                    <Chip
                      label={tip.category}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 12,
                        left: 12,
                        bgcolor: 'rgba(255,255,255,0.85)',
                        fontWeight: 500
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        display: 'flex',
                        gap: 1
                      }}
                    >
                      <IconButton
                        size="small"
                        sx={{
                          bgcolor: 'rgba(255,255,255,0.85)',
                          '&:hover': {
                            bgcolor: 'rgba(255,255,255,0.95)',
                          }
                        }}
                        onClick={() => handleSaveTip(tip.id)}
                        color={savedTips.includes(tip.id) ? "primary" : "default"}
                      >
                        {savedTips.includes(tip.id) ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                      </IconButton>
                      <IconButton
                        size="small"
                        sx={{
                          bgcolor: 'rgba(255,255,255,0.85)',
                          '&:hover': {
                            bgcolor: 'rgba(255,255,255,0.95)',
                          }
                        }}
                      >
                        <ShareIcon />
                      </IconButton>
                    </Box>
                  </Box>
                  
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 'bold',
                        mb: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {tip.title}
                    </Typography>
                    
                    <Typography 
                      color="text.secondary" 
                      variant="body2"
                      paragraph
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {tip.summary}
                    </Typography>
                  </CardContent>
                  
                  <CardActions sx={{ p: 3, pt: 0, justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ThumbUpIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        {tip.likes}
                      </Typography>
                    </Box>
                    
                    <Button
                      size="small"
                      endIcon={<ArrowForwardIcon />}
                      onClick={() => navigate(`/marketing-tips/${tip.id}`)}
                    >
                      Read More
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Success Stories */}
        <Box mb={8}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Success Stories
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" paragraph>
            Real results from implementing our marketing strategies
          </Typography>
          
          <Grid container spacing={3}>
            {successStories.map((story) => (
              <Grid item xs={12} md={4} key={story.id}>
                <Card 
                  sx={{ 
                    height: '100%',
                    position: 'relative',
                    borderRadius: 2,
                    overflow: 'hidden'
                  }}
                >
                  <CardMedia
                    component="img"
                    height="220"
                    image={story.image}
                    alt={story.title}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      bgcolor: 'rgba(0,0,0,0.75)',
                      color: 'white',
                      p: 3
                    }}
                  >
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {story.title}
                    </Typography>
                    <Typography variant="body2" paragraph sx={{ opacity: 0.9 }}>
                      {story.description}
                    </Typography>
                    <Chip
                      icon={<VerifiedUserIcon />}
                      label={story.result}
                      sx={{ 
                        bgcolor: 'success.main', 
                        color: 'white',
                        fontWeight: 'bold',
                        '& .MuiChip-icon': {
                          color: 'white'
                        }
                      }}
                    />
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Expert Tips & FAQ */}
        <Grid container spacing={4} sx={{ mb: 8 }}>
          <Grid item xs={12} md={6}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Expert Advice
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
              <Box sx={{ position: 'relative', mb: 3 }}>
                <FormatQuoteIcon 
                  sx={{ 
                    position: 'absolute', 
                    top: -10, 
                    left: -5, 
                    fontSize: '4rem', 
                    opacity: 0.1 
                  }} 
                />
                <Typography 
                  variant="h6" 
                  paragraph 
                  sx={{ 
                    fontStyle: 'italic',
                    pl: 4
                  }}
                >
                  "The first 48 hours after listing are critical. We typically see 5x more views during this period. Make sure your property is 100% ready before listing - professional photos, detailed description, and strategic pricing all in place."
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar 
                  src="https://randomuser.me/api/portraits/men/86.jpg" 
                  alt="Michael Thompson"
                  sx={{ width: 64, height: 64, mr: 2 }}
                />
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    Michael Thompson
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Director of Sales, Kingston Luxury Realty
                  </Typography>
                  <Box sx={{ display: 'flex', mt: 0.5 }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarIcon key={star} sx={{ fontSize: '1rem', color: 'gold' }} />
                    ))}
                  </Box>
                </Box>
              </Box>
              
              <Divider sx={{ my: 3 }} />
              
              <List disablePadding>
                <ListItem disablePadding sx={{ mb: 2 }}>
                  <ListItemIcon sx={{ minWidth: 35 }}>
                    <CheckCircleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Focus on the lifestyle, not just the property features"
                    secondary="Help buyers visualize themselves living in the space"
                  />
                </ListItem>
                <ListItem disablePadding sx={{ mb: 2 }}>
                  <ListItemIcon sx={{ minWidth: 35 }}>
                    <CheckCircleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Highlight neighborhood and community benefits"
                    secondary="Schools, amenities, safety, and local attractions matter"
                  />
                </ListItem>
                <ListItem disablePadding>
                  <ListItemIcon sx={{ minWidth: 35 }}>
                    <CheckCircleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Be transparent about property details"
                    secondary="Building trust leads to faster sales and fewer issues"
                  />
                </ListItem>
              </List>
              
              <Button 
                variant="outlined" 
                endIcon={<ArrowForwardIcon />}
                fullWidth
                sx={{ mt: 3 }}
                onClick={() => navigate('/blog/expert-advice')}
              >
                More Expert Tips
              </Button>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Frequently Asked Questions
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Paper sx={{ borderRadius: 2 }}>
              {faqData.map((faq, index) => (
                <Accordion 
                  key={index} 
                  disableGutters 
                  elevation={0}
                  sx={{ 
                    '&:not(:last-child)': { 
                      borderBottom: '1px solid rgba(0, 0, 0, 0.08)' 
                    },
                    '&:before': { display: 'none' }
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                  >
                    <Typography fontWeight="600">{faq.question}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" color="text.secondary">
                      {faq.answer}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Paper>
          </Grid>
        </Grid>

        {/* Call-to-Action Section */}
        <Paper 
          sx={{ 
            p: { xs: 3, md: 5 }, 
            borderRadius: 2,
            backgroundImage: 'linear-gradient(135deg, #2c3e50 0%, #4a6491 100%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: -30,
              right: -30,
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: -40,
              left: -40,
              width: '250px',
              height: '250px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 70%)',
            }}
          />
          
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Typography variant="h3" fontWeight="bold" gutterBottom>
                Ready to Market Your Property?
              </Typography>
              <Typography variant="h6" paragraph sx={{ opacity: 0.9, mb: 4 }}>
                Get expert help from our team of real estate marketing professionals. We'll help you showcase your property's best features and reach qualified buyers.
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    startIcon={<HomeWorkIcon />}
                    sx={{
                      py: 1.5,
                      bgcolor: 'white',
                      color: 'primary.main',
                      fontWeight: 'bold',
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.9)'
                      }
                    }}
                    onClick={() => navigate('/contact')}
                  >
                    List Your Property
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button
                    variant="outlined"
                    fullWidth
                    size="large"
                    startIcon={<BusinessIcon />}
                    sx={{
                      py: 1.5,
                      borderColor: 'white',
                      color: 'white',
                      fontWeight: 'bold',
                      '&:hover': {
                        borderColor: 'white',
                        bgcolor: 'rgba(255,255,255,0.1)'
                      }
                    }}
                    onClick={() => navigate('/consultation')}
                  >
                    Free Consultation
                  </Button>
                </Grid>
              </Grid>
            </Grid>
            
            <Grid item xs={12} md={5} sx={{ display: { xs: 'none', md: 'block' } }}>
              <Box 
                component="img"
                src="https://images.unsplash.com/photo-1560520031-3a4dc4e9de0c?auto=format&fit=crop&w=800&q=80"
                alt="Property Marketing"
                sx={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: 2,
                  boxShadow: '0 15px 35px rgba(0,0,0,0.2)'
                }}
              />
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
};

export default MarketingTipsPage;