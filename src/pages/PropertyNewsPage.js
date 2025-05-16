// src/pages/PropertyNewsPage.js
import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Box, Grid, Paper, CircularProgress, Alert,
  Card, CardMedia, CardContent, CardActions, Button, Divider, Chip,
  TextField, InputAdornment, Pagination, Tab, Tabs, Avatar, Link
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ShareIcon from '@mui/icons-material/Share';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useNavigate } from 'react-router-dom';
import { IconButton } from '@mui/material';
import axios from 'axios';

// Mock news data (replace with API calls in production)
const mockNewsData = [
  {
    id: 1,
    title: "Jamaican Housing Market Shows Strong Growth in 2025",
    summary: "The latest real estate trends indicate significant growth in the Jamaican property market, with rising demand in both residential and commercial sectors.",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80",
    date: "2025-04-12",
    author: "Marcus Johnson",
    authorAvatar: "https://randomuser.me/api/portraits/men/42.jpg",
    category: "Market Trends",
    readTime: 5,
    isFeatured: true
  },
  {
    id: 2,
    title: "New Beachfront Development Launches in Montego Bay",
    summary: "A luxury beachfront development with 45 units has been announced in Montego Bay, featuring state-of-the-art amenities and sustainability features.",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
    date: "2025-04-10",
    author: "Tanesha Williams",
    authorAvatar: "https://randomuser.me/api/portraits/women/63.jpg",
    category: "Development",
    readTime: 4,
    isFeatured: true
  },
  {
    id: 3,
    title: "Government Announces Tax Incentives for First-Time Homebuyers",
    summary: "The Jamaican government has introduced new tax incentives aimed at making homeownership more accessible for first-time buyers.",
    image: "https://images.unsplash.com/photo-1588702547919-26089e690ecc?auto=format&fit=crop&w=800&q=80",
    date: "2025-04-08",
    author: "Robert Chen",
    authorAvatar: "https://randomuser.me/api/portraits/men/22.jpg",
    category: "Policy",
    readTime: 6,
    isFeatured: false
  },
  {
    id: 4,
    title: "Sustainable Building Practices Gain Popularity in Jamaica",
    summary: "More developers and homeowners are embracing eco-friendly building methods, including solar power and rainwater harvesting systems.",
    image: "https://images.unsplash.com/photo-1630161861535-e1b2398b1f2f?auto=format&fit=crop&w=800&q=80",
    date: "2025-04-05",
    author: "Sarah Parker",
    authorAvatar: "https://randomuser.me/api/portraits/women/33.jpg",
    category: "Sustainability",
    readTime: 7,
    isFeatured: false
  },
  {
    id: 5,
    title: "Kingston Real Estate Prices Continue to Rise",
    summary: "Property values in Kingston have increased by 12% over the past year, with particular growth in the luxury apartment segment.",
    image: "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=800&q=80",
    date: "2025-04-02",
    author: "Daniel Brown",
    authorAvatar: "https://randomuser.me/api/portraits/men/55.jpg",
    category: "Market Trends",
    readTime: 4,
    isFeatured: false
  },
  {
    id: 6,
    title: "Digital Transformation in Jamaica's Real Estate Industry",
    summary: "Local real estate companies are investing in technology to streamline operations and improve customer experience.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
    date: "2025-03-28",
    author: "Michelle Grant",
    authorAvatar: "https://randomuser.me/api/portraits/women/86.jpg",
    category: "Technology",
    readTime: 5,
    isFeatured: false
  }
];

// Property news categories
const newsCategories = [
  "All",
  "Market Trends",
  "Development",
  "Policy",
  "Sustainability",
  "Technology",
  "Finance",
  "Lifestyle"
];

const PropertyNewsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [news, setNews] = useState(mockNewsData);
  const [featuredNews, setFeaturedNews] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const newsPerPage = 6;
  const [savedArticles, setSavedArticles] = useState([]);

  // Get featured news items
  useEffect(() => {
    const featured = mockNewsData.filter(item => item.isFeatured);
    setFeaturedNews(featured);
  }, []);

  // Handle category change
  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    setPage(1);
    
    if (category === "All") {
      setNews(mockNewsData);
    } else {
      const filtered = mockNewsData.filter(item => item.category === category);
      setNews(filtered);
    }
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setNews(mockNewsData);
      return;
    }
    
    const filtered = mockNewsData.filter(item => 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.summary.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setNews(filtered);
    setActiveCategory("All");
    setPage(1);
  };

  // Handle save/bookmark article
  const handleSaveArticle = (articleId) => {
    if (savedArticles.includes(articleId)) {
      setSavedArticles(savedArticles.filter(id => id !== articleId));
    } else {
      setSavedArticles([...savedArticles, articleId]);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Calculate pagination
  const totalPages = Math.ceil(news.length / newsPerPage);
  const displayedNews = news.slice((page - 1) * newsPerPage, page * newsPerPage);

  return (
    <Box sx={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          height: { xs: '300px', md: '350px' },
          backgroundImage: 'url(https://images.unsplash.com/photo-1504502350688-00f5d59bbdeb?auto=format&fit=crop&w=2070&q=80)',
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
        <Container sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <Typography 
            variant="h2" 
            sx={{ 
              color: 'white', 
              fontWeight: 700, 
              mb: 2,
              textShadow: '1px 1px 3px rgba(0,0,0,0.7)'
            }}
          >
            Property News
          </Typography>
          <Typography 
            variant="h5" 
            sx={{ 
              color: 'white', 
              mb: 4, 
              opacity: 0.9,
              maxWidth: '800px',
              mx: 'auto',
              textShadow: '1px 1px 2px rgba(0,0,0,0.7)'
            }}
          >
            Stay updated with the latest trends and developments in Jamaica's real estate market
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
              placeholder="Search news articles..."
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

      <Container maxWidth="xl" sx={{ py: 6 }}>
        {/* Featured News Section */}
        {featuredNews.length > 0 && (
          <Box mb={6}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Featured Stories
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={3}>
              {featuredNews.map((item) => (
                <Grid item xs={12} md={6} key={item.id}>
                  <Paper 
                    sx={{ 
                      display: 'flex', 
                      flexDirection: { xs: 'column', sm: 'row' },
                      overflow: 'hidden',
                      height: '100%',
                      borderRadius: 2,
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
                      }
                    }}
                  >
                    <Box 
                      sx={{ 
                        width: { xs: '100%', sm: '40%' },
                        position: 'relative'
                      }}
                    >
                      <Box
                        component="img"
                        src={item.image}
                        alt={item.title}
                        sx={{
                          width: '100%',
                          height: { xs: '200px', sm: '100%' },
                          objectFit: 'cover'
                        }}
                      />
                      <Chip
                        label="Featured"
                        sx={{
                          position: 'absolute',
                          top: 12,
                          left: 12,
                          bgcolor: 'primary.main',
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      />
                    </Box>
                    
                    <Box 
                      sx={{ 
                        p: 3,
                        width: { xs: '100%', sm: '60%' },
                        display: 'flex',
                        flexDirection: 'column'
                      }}
                    >
                      <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
                        <Chip 
                          label={item.category} 
                          size="small" 
                          sx={{ 
                            bgcolor: 'rgba(0,0,0,0.05)', 
                            fontWeight: 500,
                            mr: 1
                          }} 
                        />
                        <Box 
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            color: 'text.secondary', 
                            fontSize: '0.8rem' 
                          }}
                        >
                          <AccessTimeIcon fontSize="small" sx={{ mr: 0.5, fontSize: '1rem' }} />
                          {item.readTime} min read
                        </Box>
                      </Box>
                      
                      <Typography
                        variant="h5"
                        component="h2"
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
                        {item.title}
                      </Typography>
                      
                      <Typography 
                        color="text.secondary" 
                        paragraph 
                        sx={{
                          flex: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {item.summary}
                      </Typography>
                      
                      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar src={item.authorAvatar} alt={item.author} sx={{ width: 32, height: 32, mr: 1 }} />
                          <Box>
                            <Typography variant="subtitle2" sx={{ lineHeight: 1.2 }}>
                              {item.author}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(item.date)}
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Box>
                          <Button
                            variant="text"
                            size="small"
                            endIcon={<ArrowForwardIcon />}
                            onClick={() => navigate(`/news/${item.id}`)}
                          >
                            Read More
                          </Button>
                          <IconButton 
                            size="small" 
                            onClick={() => handleSaveArticle(item.id)}
                            color={savedArticles.includes(item.id) ? "primary" : "default"}
                          >
                            {savedArticles.includes(item.id) ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                          </IconButton>
                        </Box>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* News Categories Tabs */}
        <Box mb={4} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={activeCategory} 
            onChange={(e, newValue) => handleCategoryChange(newValue)}
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
            {newsCategories.map((category) => (
              <Tab 
                key={category} 
                label={category} 
                value={category}
              />
            ))}
          </Tabs>
        </Box>

        {/* News Articles Grid */}
        {error ? (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        ) : loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : displayedNews.length === 0 ? (
          <Alert severity="info" sx={{ mb: 4 }}>
            No news articles found. Please try a different search term or category.
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {displayedNews.map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item.id}>
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
                      image={item.image}
                      alt={item.title}
                    />
                    <Chip
                      label={item.category}
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
                        onClick={() => handleSaveArticle(item.id)}
                        color={savedArticles.includes(item.id) ? "primary" : "default"}
                      >
                        {savedArticles.includes(item.id) ? <BookmarkIcon /> : <BookmarkBorderIcon />}
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
                      component="h2"
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
                      {item.title}
                    </Typography>
                    
                    <Typography 
                      color="text.secondary" 
                      paragraph
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {item.summary}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar src={item.authorAvatar} alt={item.author} sx={{ width: 24, height: 24, mr: 1 }} />
                        <Typography variant="caption" color="text.secondary">
                          {item.author}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                        <AccessTimeIcon fontSize="small" sx={{ mr: 0.5, fontSize: '0.9rem' }} />
                        <Typography variant="caption">
                          {item.readTime} min read
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                  
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      size="small"
                      endIcon={<NavigateNextIcon />}
                      onClick={() => navigate(`/news/${item.id}`)}
                    >
                      Read More
                    </Button>
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                      {formatDate(item.date)}
                    </Typography>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
        
        {/* Pagination */}
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination 
              count={totalPages} 
              page={page} 
              onChange={(e, value) => setPage(value)}
              color="primary"
              size="large"
              showFirstButton
              showLastButton
            />
          </Box>
        )}
        
        {/* Subscribe to Newsletter */}
        <Paper 
          sx={{ 
            p: 4, 
            mt: 6, 
            borderRadius: 2,
            background: 'linear-gradient(to right, #f5f7fa, #e4efe9)'
          }}
        >
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={7}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Stay Updated with Property News
              </Typography>
              <Typography variant="body1" paragraph>
                Subscribe to our newsletter to receive the latest property news, market trends, and exclusive insights directly to your inbox.
              </Typography>
              <Box 
                component="form" 
                sx={{ 
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  mt: 2,
                  gap: { xs: 2, sm: 0 }
                }}
              >
                <TextField
                  fullWidth
                  placeholder="Your email address"
                  variant="outlined"
                  sx={{
                    mr: { sm: 2 },
                    backgroundColor: 'white',
                    '& .MuiOutlinedInput-root': {
                      borderRadius: { sm: '4px 0 0 4px' }
                    }
                  }}
                />
                <Button
                  variant="contained"
                  sx={{
                    py: 1.5,
                    minWidth: { sm: 150 },
                    borderRadius: { xs: 1, sm: '0 4px 4px 0' }
                  }}
                >
                  Subscribe
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={5} sx={{ display: { xs: 'none', md: 'block' } }}>
              <Box
                component="img"
                src="https://images.unsplash.com/photo-1586880244406-556ebe35f282?auto=format&fit=crop&w=800&q=80"
                alt="Newsletter"
                sx={{
                  width: '100%',
                  maxHeight: 250,
                  objectFit: 'cover',
                  borderRadius: 2,
                  boxShadow: 3
                }}
              />
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
};

export default PropertyNewsPage;