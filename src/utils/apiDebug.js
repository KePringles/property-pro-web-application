// SOLUTION PART 1: API DEBUGGING UTILITY
// Add this file as src/utils/apiDebug.js

export const debugApiResponse = (response, source) => {
    console.log(`==== API RESPONSE DEBUG [${source}] ====`);
    console.log('Raw response:', response);
    
    if (!response) {
      console.log('Response is null or undefined');
      return;
    }
    
    console.log('Response type:', typeof response);
    console.log('Response keys:', Object.keys(response));
    
    // Check for common data structures
    const possibleDataPaths = [
      'properties',
      'featured_properties', 
      'data', 
      'data.properties', 
      'results',
      'items'
    ];
    
    console.log('Checking possible data paths:');
    
    possibleDataPaths.forEach(path => {
      const parts = path.split('.');
      let value = response;
      
      for (const part of parts) {
        value = value?.[part];
        if (!value) break;
      }
      
      if (value) {
        console.log(`✅ Found data at '${path}':`);
        console.log('  Type:', typeof value);
        console.log('  Is array?', Array.isArray(value));
        console.log('  Length:', Array.isArray(value) ? value.length : 'N/A');
        if (Array.isArray(value) && value.length > 0) {
          console.log('  First item sample:', value[0]);
        }
      } else {
        console.log(`❌ No data at '${path}'`);
      }
    });
    
    console.log('==============================');
    return response;
  };
  
  // SOLUTION PART 2: MODIFY API FUNCTIONS
  // Update your api/properties.js file with these changes
  
  // Import the debug utility
  import { debugApiResponse } from '../utils/apiDebug';
  
  // Modify the getFeaturedProperties function
  export const getFeaturedProperties = async (limit = 8) => {
    try {
      const response = await api.get(`/properties/featured?limit=${limit}`);
      return debugApiResponse(response.data, 'getFeaturedProperties');
    } catch (error) {
      console.error('Error in getFeaturedProperties:', error);
      throw error;
    }
  };
  
  // Modify the getProperties function
  export const getProperties = async (params = {}) => {
    try {
      const response = await api.get('/properties', { params });
      return debugApiResponse(response.data, 'getProperties');
    } catch (error) {
      console.error('Error in getProperties:', error);
      throw error;
    }
  };
  
  // SOLUTION PART 3: MODIFY HOME.JS COMPONENT
  // Update your Home.js component with these data extraction helpers
  
  // Add this helper function to extract properties from various response formats
  const extractProperties = (response, fallback = []) => {
    if (!response) return fallback;
    
    // Try different possible structures
    if (Array.isArray(response)) {
      return response.length > 0 ? response : fallback;
    }
    
    if (response.featured_properties && Array.isArray(response.featured_properties)) {
      return response.featured_properties.length > 0 ? response.featured_properties : fallback;
    }
    
    if (response.properties && Array.isArray(response.properties)) {
      return response.properties.length > 0 ? response.properties : fallback;
    }
    
    if (response.data) {
      if (Array.isArray(response.data)) {
        return response.data.length > 0 ? response.data : fallback;
      }
      
      if (response.data.properties && Array.isArray(response.data.properties)) {
        return response.data.properties.length > 0 ? response.data.properties : fallback;
      }
      
      if (response.data.featured_properties && Array.isArray(response.data.featured_properties)) {
        return response.data.featured_properties.length > 0 ? response.data.featured_properties : fallback;
      }
    }
    
    // If we get here, try to extract any array property
    for (const key in response) {
      if (Array.isArray(response[key]) && response[key].length > 0) {
        // Check if it looks like a property array
        if (response[key][0].title || response[key][0].property_id || response[key][0].price) {
          console.log(`Found potential property array in key: ${key}`);
          return response[key];
        }
      }
    }
    
    console.warn('Could not extract properties from response:', response);
    return fallback;
  };
  
  // SOLUTION PART 4: UPDATE PROPERTY LIST COMPONENT
  // If you have access to your PropertyList.js component, add this debugging:
  
  const PropertyList = ({ properties = [], loading, error, showPagination = true }) => {
    // Add debugging
    console.log('PropertyList received props:', { 
      properties,
      propertiesLength: properties?.length, 
      isArray: Array.isArray(properties),
      firstItem: properties?.[0],
      loading, 
      error 
    });
    
    // Ensure properties is always an array with a fallback
    const safeProperties = Array.isArray(properties) ? properties : [];
    
    // Rest of your component...
    
    return (
      <div className="property-list">
        {/* Your property list rendering */}
      </div>
    );
  };
  
  // SOLUTION PART 5: FIX USER DASHBOARD'S MY PROPERTIES SECTION
  // Replace this in UserDashboard.js
  
  // Make sure this conditional exists around the My Listings tab
  {user?.user_type === 'property_owner' && (
    <Tab label="My Listings" value="listings" />
  )}
  
  // And add this check in the section rendering:
  {user?.user_type === 'property_owner' && activeTab === 'listings' && (
    <Box>
      {/* My Listings content */}
    </Box>
  )}
  
  // SOLUTION PART 6: FIX PROPERTY LISTINGS COMPONENT
  // Update the PropertyListings component with these changes
  
  const PropertyListings = () => {
    // Existing code...
    
    // Add this at the beginning of your component
    useEffect(() => {
      // Only allow property owners to access this page
      if (isAuthenticated && user && user.user_type !== 'property_owner' && user.user_type !== 'agent') {
        console.log('Non-property owner attempted to access PropertyListings');
        navigate('/dashboard'); // Redirect to dashboard
      }
    }, [isAuthenticated, user, navigate]);
    
    // Keep your existing code...
    
    // Modify your return statement
    // Instead of: if (!isAuthenticated) return null;
    // Use this:
    if (!isAuthenticated || (user && user.user_type !== 'property_owner' && user.user_type !== 'agent')) {
      return null;
    }
    
    // Rest of your component...
  }
  
  // SOLUTION PART 7: DIRECT DEBUG FOR HOME PAGE
  // Add this in your Home.js component to test data display
  
  // In your Home.js render function:
  {loading.featured ? (
    <Box display="flex" justifyContent="center" py={4}>
      <CircularProgress />
    </Box>
  ) : (
    <>
      {/* Debug display - remove in production */}
      {featuredProperties && featuredProperties.length > 0 ? (
        <Box sx={{ mb: 3, p: 2, border: '1px dashed #ccc' }}>
          <Typography variant="h6">Debug: Found {featuredProperties.length} properties</Typography>
          <Box sx={{ maxHeight: '200px', overflow: 'auto' }}>
            {featuredProperties.map((prop, idx) => (
              <Box key={idx} sx={{ mb: 1, p: 1, borderBottom: '1px solid #eee' }}>
                <Typography variant="subtitle2">
                  {prop.title || 'No Title'} - {typeof prop.price !== 'undefined' ? `$${prop.price}` : 'No Price'}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      ) : (
        <Alert severity="warning">No properties found in featuredProperties array</Alert>
      )}
      
      {/* Your actual PropertyList component */}
      <PropertyList 
        properties={featuredProperties} 
        loading={false}
        error={errors.featured}
        showPagination={false}
      />
    </>
  )}