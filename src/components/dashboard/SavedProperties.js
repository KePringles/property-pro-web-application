// src/components/dashboard/SavedProperties.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  IconButton,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Tooltip,
  Tabs,
  Tab
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import FavoriteIcon from '@mui/icons-material/Favorite';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ShareIcon from '@mui/icons-material/Share';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import HotelIcon from '@mui/icons-material/Hotel';
import BathtubIcon from '@mui/icons-material/Bathtub';
import HomeIcon from '@mui/icons-material/Home';
import CompareIcon from '@mui/icons-material/Compare';
import SortIcon from '@mui/icons-material/Sort';
import FolderIcon from '@mui/icons-material/Folder';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { useSnackbar } from 'notistack';

// Import services
import { getSavedProperties, unsaveProperty, createPropertyCollection, addToCollection } from '../../services/userService';

// Format price for display
const formatPrice = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'JMD',
    maximumFractionDigits: 0
  }).format(value);
};

const SavedProperties = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  
  // State
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [collections, setCollections] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  
  // Dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState(null);
  const [newCollectionDialogOpen, setNewCollectionDialogOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  
  // Menu states
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [currentPropertyId, setCurrentPropertyId] = useState(null);
  const [collectionsMenuAnchor, setCollectionsMenuAnchor] = useState(null);
  const [sortMenuAnchor, setSortMenuAnchor] = useState(null);
  
  // Load saved properties
  useEffect(() => {
    const fetchSavedProperties = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await getSavedProperties();
        setProperties(response.properties || []);
        setCollections(response.collections || [
          { id: 1, name: 'Favorites', count: 3 },
          { id: 2, name: 'To Visit', count: 2 },
          { id: 3, name: 'Investment Properties', count: 1 }
        ]);
      } catch (err) {
        console.error('Error fetching saved properties:', err);
        setError('Failed to load your saved properties. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSavedProperties();
  }, []);
  
  // Handle remove property
  const handleRemoveProperty = async () => {
    if (!propertyToDelete) return;
    
    try {
      await unsaveProperty(propertyToDelete);
      
      // Update local state
      setProperties(prevProperties => 
        prevProperties.filter(property => property.property_id !== propertyToDelete)
      );
      
      // Update collection counts
      setCollections(prevCollections =>
        prevCollections.map(collection => {
          const propertyInCollection = properties
            .find(p => p.property_id === propertyToDelete && p.collections?.includes(collection.id));
          
          if (propertyInCollection) {
            return { ...collection, count: Math.max(0, collection.count - 1) };
          }
          return collection;
        })
      );
      
      enqueueSnackbar('Property removed from saved list', { variant: 'success' });
    } catch (err) {
      console.error('Error removing property:', err);
      enqueueSnackbar('Failed to remove property', { variant: 'error' });
    } finally {
      setDeleteDialogOpen(false);
      setPropertyToDelete(null);
    }
  };
  
  // Handle create collection
  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) return;
    
    try {
      const response = await createPropertyCollection(newCollectionName);
      
      // Add to local state
      setCollections(prev => [...prev, {
        id: response.collection_id,
        name: newCollectionName,
        count: 0
      }]);
      
      enqueueSnackbar(`Collection "${newCollectionName}" created successfully`, { variant: 'success' });
      setNewCollectionName('');
    } catch (err) {
      console.error('Error creating collection:', err);
      enqueueSnackbar('Failed to create collection', { variant: 'error' });
    } finally {
      setNewCollectionDialogOpen(false);
    }
  };
  
  // Handle add to collection
  const handleAddToCollection = async (collectionId) => {
    if (!currentPropertyId) return;
    
    try {
      await addToCollection(currentPropertyId, collectionId);
      
      // Update local state
      setProperties(prevProperties =>
        prevProperties.map(property => {
          if (property.property_id === currentPropertyId) {
            const updatedCollections = property.collections ? 
              [...property.collections, collectionId] : 
              [collectionId];
            
            return { ...property, collections: updatedCollections };
          }
          return property;
        })
      );
      
      // Update collection count
      setCollections(prevCollections =>
        prevCollections.map(collection => {
          if (collection.id === collectionId) {
            return { ...collection, count: collection.count + 1 };
          }
          return collection;
        })
      );
      
      const collectionName = collections.find(c => c.id === collectionId)?.name || 'collection';
      enqueueSnackbar(`Property added to "${collectionName}"`, { variant: 'success' });
    } catch (err) {
      console.error('Error adding to collection:', err);
      enqueueSnackbar('Failed to add property to collection', { variant: 'error' });
    } finally {
      setCollectionsMenuAnchor(null);
      setCurrentPropertyId(null);
    }
  };
  
  // Handle menu open
  const handleMenuOpen = (event, propertyId) => {
    setMenuAnchorEl(event.currentTarget);
    setCurrentPropertyId(propertyId);
  };
  
  // Handle collections menu open
  const handleCollectionsMenuOpen = (event) => {
    setCollectionsMenuAnchor(event.currentTarget);
  };
  
  // Handle sort menu open
  const handleSortMenuOpen = (event) => {
    setSortMenuAnchor(event.currentTarget);
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Filter properties based on active tab
  const filteredProperties = properties.filter(property => {
    if (activeTab === 'all') return true;
    if (activeTab === 'uncategorized') return !property.collections || property.collections.length === 0;
    return property.collections?.includes(parseInt(activeTab));
  });
  
  // Sort properties
  const sortedProperties = [...filteredProperties].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc':
        return (a.price || 0) - (b.price || 0);
      case 'price-desc':
        return (b.price || 0) - (a.price || 0);
      case 'date-asc':
        return new Date(a.saved_at || 0) - new Date(b.saved_at || 0);
      case 'date-desc':
        return new Date(b.saved_at || 0) - new Date(a.saved_at || 0);
      case 'name':
        return (a.title || '').localeCompare(b.title || '');
      default:
        return new Date(b.saved_at || 0) - new Date(a.saved_at || 0); // Default to newest first
    }
  });
  
  // Property card component
  const PropertyCard = ({ property }) => (
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
        },
        position: 'relative',
        borderRadius: 2,
        overflow: 'hidden'
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="200"
          image={property.image_url || property.main_image_url || 'https://via.placeholder.com/400x200?text=Property+Image'}
          alt={property.title}
          sx={{ objectFit: 'cover' }}
        />
        
        <IconButton
          aria-label="property menu"
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            bgcolor: 'rgba(255, 255, 255, 0.8)',
            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' }
          }}
          onClick={(e) => handleMenuOpen(e, property.property_id)}
        >
          <MoreVertIcon />
        </IconButton>
        
        <IconButton
          aria-label="remove from favorites"
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            bgcolor: 'rgba(255, 255, 255, 0.8)',
            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' }
          }}
          onClick={() => {
            setPropertyToDelete(property.property_id);
            setDeleteDialogOpen(true);
          }}
        >
          <FavoriteIcon color="error" />
        </IconButton>
        
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            bgcolor: 'rgba(0, 0, 0, 0.6)',
            color: 'white',
            p: 1
          }}
        >
          <Typography variant="h6">
            {formatPrice(property.price || 0)}
          </Typography>
        </Box>
      </Box>
      
      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        <Typography variant="h6" gutterBottom noWrap>
          {property.title || 'Unlisted Property'}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <LocationOnIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
          <Typography variant="body2" color="text.secondary" noWrap>
            {property.parish?.name ? 
              `${property.city || ''} ${property.city ? ',' : ''} ${property.parish.name}` : 
              property.location || 'Jamaica'}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <HotelIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
            <Typography variant="body2">
              {property.bedrooms || 0} Beds
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <BathtubIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
            <Typography variant="body2">
              {property.bathrooms || 0} Baths
            </Typography>
          </Box>
        </Box>
        
        {property.collections && property.collections.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Divider sx={{ mb: 1 }} />
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Collections:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {property.collections.map(collectionId => {
                const collection = collections.find(c => c.id === collectionId);
                return collection ? (
                  <Chip 
                    key={collectionId} 
                    label={collection.name} 
                    size="small" 
                    variant="outlined"
                    onClick={() => setActiveTab(collectionId.toString())}
                  />
                ) : null;
              })}
            </Box>
          </Box>
        )}
      </CardContent>
      
      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button
          variant="contained"
          fullWidth
          onClick={() => navigate(`/properties/${property.property_id}`)}
          startIcon={<VisibilityIcon />}
        >
          View Details
        </Button>
      </CardActions>
    </Card>
  );
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">
          Saved Properties ({properties.length})
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<SortIcon />}
            onClick={handleSortMenuOpen}
          >
            Sort
          </Button>
          
          <Menu
            anchorEl={sortMenuAnchor}
            open={Boolean(sortMenuAnchor)}
            onClose={() => setSortMenuAnchor(null)}
          >
            <MenuItem 
              onClick={() => {
                setSortBy('date-desc');
                setSortMenuAnchor(null);
              }}
              selected={sortBy === 'date-desc'}
            >
              Newest First
            </MenuItem>
            <MenuItem 
              onClick={() => {
                setSortBy('date-asc');
                setSortMenuAnchor(null);
              }}
              selected={sortBy === 'date-asc'}
            >
              Oldest First
            </MenuItem>
            <MenuItem 
              onClick={() => {
                setSortBy('price-asc');
                setSortMenuAnchor(null);
              }}
              selected={sortBy === 'price-asc'}
            >
              Price: Low to High
            </MenuItem>
            <MenuItem 
              onClick={() => {
                setSortBy('price-desc');
                setSortMenuAnchor(null);
              }}
              selected={sortBy === 'price-desc'}
            >
              Price: High to Low
            </MenuItem>
            <MenuItem 
              onClick={() => {
                setSortBy('name');
                setSortMenuAnchor(null);
              }}
              selected={sortBy === 'name'}
            >
              Alphabetical
            </MenuItem>
          </Menu>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setNewCollectionDialogOpen(true)}
          >
            New Collection
          </Button>
        </Box>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="All Properties" value="all" icon={<HomeIcon />} iconPosition="start" />
          <Tab label="Uncategorized" value="uncategorized" icon={<FolderIcon />} iconPosition="start" />
          {collections.map(collection => (
            <Tab 
              key={collection.id}
              label={`${collection.name} (${collection.count})`}
              value={collection.id.toString()}
              icon={<FolderIcon />}
              iconPosition="start"
            />
          ))}
        </Tabs>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : sortedProperties.length === 0 ? (
        <Alert severity="info" sx={{ mb: 3 }}>
          {activeTab === 'all' 
            ? "You haven't saved any properties yet. Browse properties and click the heart icon to save them."
            : activeTab === 'uncategorized'
              ? "You don't have any uncategorized properties."
              : `No properties in this collection yet. Add properties to "${collections.find(c => c.id.toString() === activeTab)?.name}" to see them here.`
          }
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {sortedProperties.map((property) => (
            <Grid item xs={12} sm={6} md={4} key={property.property_id}>
              <PropertyCard property={property} />
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Property Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={() => setMenuAnchorEl(null)}
      >
        <MenuItem onClick={() => {
          navigate(`/properties/${currentPropertyId}`);
          setMenuAnchorEl(null);
        }}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleCollectionsMenuOpen}>
          <ListItemIcon>
            <FolderIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Add to Collection</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          // Here you would implement share functionality
          // For now, just close the menu
          setMenuAnchorEl(null);
          enqueueSnackbar('Share functionality coming soon', { variant: 'info' });
        }}>
          <ListItemIcon>
            <ShareIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Share</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => {
          setPropertyToDelete(currentPropertyId);
          setDeleteDialogOpen(true);
          setMenuAnchorEl(null);
        }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText sx={{ color: 'error.main' }}>Remove</ListItemText>
        </MenuItem>
      </Menu>
      
      {/* Collections Menu */}
      <Menu
        anchorEl={collectionsMenuAnchor}
        open={Boolean(collectionsMenuAnchor)}
        onClose={() => setCollectionsMenuAnchor(null)}
      >
        {collections.length === 0 ? (
          <MenuItem onClick={() => {
            setCollectionsMenuAnchor(null);
            setNewCollectionDialogOpen(true);
          }}>
            <ListItemIcon>
              <AddIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Create New Collection</ListItemText>
          </MenuItem>
        ) : (
          <>
            {collections.map(collection => {
              const property = properties.find(p => p.property_id === currentPropertyId);
              const isInCollection = property?.collections?.includes(collection.id);
              
              return (
                <MenuItem 
                  key={collection.id} 
                  onClick={() => handleAddToCollection(collection.id)}
                  disabled={isInCollection}
                >
                  <ListItemIcon>
                    <FolderIcon fontSize="small" color={isInCollection ? "disabled" : "inherit"} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={collection.name}
                    secondary={isInCollection ? "Already in collection" : null}
                  />
                </MenuItem>
              );
            })}
            <Divider />
            <MenuItem onClick={() => {
              setCollectionsMenuAnchor(null);
              setNewCollectionDialogOpen(true);
            }}>
              <ListItemIcon>
                <AddIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Create New Collection</ListItemText>
            </MenuItem>
          </>
        )}
      </Menu>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Remove Saved Property</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to remove this property from your saved list?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleRemoveProperty} 
            color="error"
            variant="contained"
          >
            Remove
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* New Collection Dialog */}
      <Dialog
        open={newCollectionDialogOpen}
        onClose={() => setNewCollectionDialogOpen(false)}
      >
        <DialogTitle>Create New Collection</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Create a new collection to organize your saved properties.
          </DialogContentText>
          <TextField
            autoFocus
            label="Collection Name"
            fullWidth
            value={newCollectionName}
            onChange={(e) => setNewCollectionName(e.target.value)}
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewCollectionDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateCollection} 
            color="primary"
            variant="contained"
            disabled={!newCollectionName.trim()}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SavedProperties;