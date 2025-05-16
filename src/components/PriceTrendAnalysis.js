// src/components/PriceTrendsAnalysis.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { getPriceTrends, getInvestmentProperties } from '../api/recommendations';

const parishes = [
  'All Parishes',
  'Kingston',
  'St. Andrew',
  'St. Catherine',
  'Clarendon',
  'Manchester',
  'St. Elizabeth',
  'Westmoreland',
  'Hanover',
  'St. James',
  'Trelawny',
  'St. Ann',
  'St. Mary',
  'Portland',
  'St. Thomas'
];

const propertyTypes = [
  'All Types',
  'House',
  'Apartment',
  'Villa',
  'Townhouse',
  'Land',
  'Commercial',
  'Industrial'
];

const PriceTrendsAnalysis = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [investmentProperties, setInvestmentProperties] = useState([]);
  const [selectedParish, setSelectedParish] = useState('All Parishes');
  const [selectedPropertyType, setSelectedPropertyType] = useState('All Types');

  useEffect(() => {
    const fetchPriceTrends = async () => {
      setLoading(true);
      try {
        const parish = selectedParish === 'All Parishes' ? null : selectedParish;
        const propertyType = selectedPropertyType === 'All Types' ? null : selectedPropertyType;
        
        const [trendResponse, investmentResponse] = await Promise.all([
          getPriceTrends(parish, propertyType),
          getInvestmentProperties(parish, propertyType)
        ]);
        
        setTrendData(trendResponse.trends || []);
        setInvestmentProperties(investmentResponse.properties || []);
      } catch (err) {
        console.error('Error fetching price trends:', err);
        setError('Failed to load price trend data');
      } finally {
        setLoading(false);
      }
    };

    fetchPriceTrends();
  }, [selectedParish, selectedPropertyType]);

  const formatCurrency = (value) => {
    return `$${value.toLocaleString()}`;
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  // Format trend data for chart
  const chartData = trendData.map(item => ({
    month: formatDate(item.month),
    avgPrice: item.avg_price,
    growthRate: item.price_growth * 100  // Convert to percentage
  }));

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h5" gutterBottom>
        Property Price Trends
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Analyze property price trends to identify investment opportunities.
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel id="parish-select-label">Parish</InputLabel>
            <Select
              labelId="parish-select-label"
              value={selectedParish}
              label="Parish"
              onChange={(e) => setSelectedParish(e.target.value)}
            >
              {parishes.map((parish) => (
                <MenuItem key={parish} value={parish}>{parish}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel id="property-type-select-label">Property Type</InputLabel>
            <Select
              labelId="property-type-select-label"
              value={selectedPropertyType}
              label="Property Type"
              onChange={(e) => setSelectedPropertyType(e.target.value)}
            >
              {propertyTypes.map((type) => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      ) : (
        <Grid container spacing={4}>
          {/* Price Trend Chart */}
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Average Price Trends
              </Typography>
              <Divider sx={{ mb: 3 }} />

              {chartData.length > 0 ? (
                <Box sx={{ height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={chartData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis 
                        yAxisId="left"
                        orientation="left"
                        tickFormatter={formatCurrency}
                      />
                      <YAxis 
                        yAxisId="right"
                        orientation="right"
                        tickFormatter={(value) => `${value.toFixed(1)}%`}
                      />
                      <Tooltip 
                        formatter={(value, name) => {
                          if (name === 'avgPrice') return formatCurrency(value);
                          if (name === 'growthRate') return `${value.toFixed(2)}%`;
                          return value;
                        }}
                      />
                      <Legend />
                      <Line 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="avgPrice" 
                        name="Average Price" 
                        stroke="#8884d8" 
                        activeDot={{ r: 8 }} 
                      />
                      <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="growthRate" 
                        name="Monthly Growth Rate" 
                        stroke="#82ca9d" 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              ) : (
                <Alert severity="info">
                  No trend data available for the selected filters.
                </Alert>
              )}
            </Paper>
          </Grid>

          {/* Investment Opportunities */}
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Top Investment Opportunities
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Properties in areas with consistent price growth.
              </Typography>
              <Divider sx={{ mb: 3 }} />

              {investmentProperties.length > 0 ? (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Property</TableCell>
                        <TableCell>Location</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell align="right">Price</TableCell>
                        <TableCell align="right">Growth Rate</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {investmentProperties.map((property) => (
                        <TableRow key={property.property_id}>
                          <TableCell>{property.title}</TableCell>
                          <TableCell>{property.parish}</TableCell>
                          <TableCell>{property.property_type}</TableCell>
                          <TableCell align="right">{formatCurrency(property.price)}</TableCell>
                          <TableCell align="right">
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                              {property.growth_rate > 0 ? (
                                <TrendingUpIcon color="success" fontSize="small" sx={{ mr: 0.5 }} />
                              ) : (
                                <TrendingDownIcon color="error" fontSize="small" sx={{ mr: 0.5 }} />
                              )}
                              {(property.growth_rate * 100).toFixed(2)}%
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Alert severity="info">
                  No investment opportunities found for the selected filters.
                </Alert>
              )}
            </Paper>
          </Grid>
          
          {/* Market Summary */}
          <Grid item xs={12} md={6}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Market Overview
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                {trendData.length > 0 ? (
                  <>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Current Average Price:
                      </Typography>
                      <Typography variant="h5" color="primary">
                        {formatCurrency(trendData[trendData.length - 1].avg_price)}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        6-Month Price Change:
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {trendData[trendData.length - 1].price_growth > 0 ? (
                          <>
                            <TrendingUpIcon color="success" />
                            <Typography variant="h6" color="success.main">
                              {(trendData[trendData.length - 1].price_growth * 100).toFixed(2)}%
                            </Typography>
                          </>
                        ) : (
                          <>
                            <TrendingDownIcon color="error" />
                            <Typography variant="h6" color="error">
                              {(trendData[trendData.length - 1].price_growth * 100).toFixed(2)}%
                            </Typography>
                          </>
                        )}
                      </Box>
                    </Box>
                    
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Total Properties:
                      </Typography>
                      <Typography variant="h6">
                        {trendData[trendData.length - 1].num_properties}
                      </Typography>
                    </Box>
                  </>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No market data available for the selected filters.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Investment Insights
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                {investmentProperties.length > 0 ? (
                  <>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Top Growth Area:
                      </Typography>
                      <Typography variant="h6">
                        {investmentProperties[0].parish}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Best Performing Property Type:
                      </Typography>
                      <Typography variant="h6">
                        {investmentProperties[0].property_type}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Average Growth Rate:
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <TrendingUpIcon color="success" />
                        <Typography variant="h6" color="success.main">
                          {(investmentProperties.reduce((acc, prop) => acc + prop.growth_rate, 0) / 
                            investmentProperties.length * 100).toFixed(2)}%
                        </Typography>
                      </Box>
                    </Box>
                  </>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No investment insights available for the selected filters.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default PriceTrendsAnalysis;