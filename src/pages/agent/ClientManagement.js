import React, { useEffect, useState } from 'react';
import { 
  Container, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Button, 
  IconButton, 
  Alert, 
  CircularProgress,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Tooltip,
  Grid
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getClients, deleteClient } from '../../api/clients';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import HomeIcon from '@mui/icons-material/Home';
import AddIcon from '@mui/icons-material/Add';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';

const ClientManagement = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        const response = await getClients();
        
        // Debug response
        console.log('Client data response:', response);
        
        // Handle different data structures
        const clientData = response.data || [];
        
        setClients(clientData);
      } catch (err) {
        console.error('Error fetching clients:', err);
        setError('Failed to load clients. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchClients();
  }, []);

  const handleViewClient = (clientId) => {
    navigate(`/clients/${clientId}`);
  };

  const handleEditClient = (clientId) => {
    navigate(`/clients/${clientId}/edit`);
  };

  const handleDeleteClick = (client) => {
    setClientToDelete(client);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!clientToDelete) return;
    
    setDeleteLoading(true);
    try {
      await deleteClient(clientToDelete.id);
      setClients(clients.filter(c => c.id !== clientToDelete.id));
      setDeleteDialogOpen(false);
    } catch (err) {
      console.error('Error deleting client:', err);
      setError('Failed to delete client. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container sx={{ py: 5 }}>
      <Typography variant="h4" gutterBottom>Manage Clients</Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={() => navigate('/add-client')}
        >
          Add New Client
        </Button>
      </Box>
      
      {clients.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>No Clients Found</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            You haven't added any clients yet. Add your first client to get started.
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={() => navigate('/add-client')}
          >
            Add Client
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper} elevation={2}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'primary.light' }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Name</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Email</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Phone</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Properties</TableCell>
                <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {client.name}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <EmailIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      {client.email}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      {client.phone}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      icon={<HomeIcon />} 
                      label={client.properties?.length || 0} 
                      color="primary" 
                      variant="outlined" 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="View">
                      <IconButton onClick={() => handleViewClient(client.id)} color="primary">
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton onClick={() => handleEditClient(client.id)} color="primary">
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton onClick={() => handleDeleteClick(client)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete client "{clientToDelete?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleteLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            disabled={deleteLoading}
          >
            {deleteLoading ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ClientManagement;