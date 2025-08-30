import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Tooltip,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Launch as LaunchIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { collection, query, where, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import Grid from '@mui/material/Grid';
const statusOptions = [
  { value: 'applied', label: 'Applied', color: '#2196f3' },
  { value: 'interview', label: 'Interview Scheduled', color: '#ff9800' },
  { value: 'offer', label: 'Offer Received', color: '#4caf50' },
  { value: 'rejected', label: 'Rejected', color: '#f44336' },
  { value: 'withdrawn', label: 'Withdrawn', color: '#9e9e9e' },
];

function JobApplicationList({ onEditJob, refreshTrigger }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'jobApplications'),
      where('userId', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        const jobsData = [];
        querySnapshot.forEach((doc) => {
          jobsData.push({
            id: doc.id,
            ...doc.data(),
          });
        });
        setJobs(jobsData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching jobs:', error);
        setError('Failed to load job applications');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [refreshTrigger]);

  const getStatusColor = (status) => {
    const statusOption = statusOptions.find(option => option.value === status);
    return statusOption ? statusOption.color : '#9e9e9e';
  };

  const getStatusLabel = (status) => {
    const statusOption = statusOptions.find(option => option.value === status);
    return statusOption ? statusOption.label : status;
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.location && job.location.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleDeleteClick = (job) => {
    setJobToDelete(job);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!jobToDelete) return;

    try {
      await deleteDoc(doc(db, 'jobApplications', jobToDelete.id));
      setDeleteDialogOpen(false);
      setJobToDelete(null);
    } catch (error) {
      console.error('Error deleting job:', error);
      setError('Failed to delete job application');
    }
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const formatDate = (date) => {
    if (!date) return '';
    if (date.toDate) {
      return date.toDate().toLocaleDateString();
    }
    return new Date(date).toLocaleDateString();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" py={4}>
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Loading job applications...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Search and Filter Controls */}
      <Box display="flex" gap={2} mb={3} flexWrap="wrap">
        <TextField
          placeholder="Search companies, positions, or locations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flexGrow: 1, minWidth: 300 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="outlined"
          startIcon={<FilterIcon />}
          onClick={handleMenuClick}
          sx={{ minWidth: 120 }}
        >
          {statusFilter === 'all' ? 'All Status' : getStatusLabel(statusFilter)}
        </Button>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem 
            onClick={() => { setStatusFilter('all'); handleMenuClose(); }}
            selected={statusFilter === 'all'}
          >
            All Status
          </MenuItem>
          {statusOptions.map((option) => (
            <MenuItem
              key={option.value}
              onClick={() => { setStatusFilter(option.value); handleMenuClose(); }}
              selected={statusFilter === option.value}
            >
              <Box display="flex" alignItems="center">
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: option.color,
                    mr: 1,
                  }}
                />
                {option.label}
              </Box>
            </MenuItem>
          ))}
        </Menu>
      </Box>

      {/* Results Summary */}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Showing {filteredJobs.length} of {jobs.length} applications
      </Typography>

      {/* Job Applications Table */}
      {filteredJobs.length === 0 ? (
        <Box textAlign="center" py={6}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {jobs.length === 0 ? 'No job applications yet' : 'No applications match your search'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {jobs.length === 0 
              ? 'Click the + button to add your first job application'
              : 'Try adjusting your search or filter criteria'
            }
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'grey.50' }}>
                <TableCell><strong>Company</strong></TableCell>
                <TableCell><strong>Position</strong></TableCell>
                <TableCell><strong>Location</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Applied Date</strong></TableCell>
                <TableCell><strong>Salary</strong></TableCell>
                <TableCell align="center"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredJobs.map((job) => (
                <TableRow key={job.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {job.company}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {job.position}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {job.location || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(job.status)}
                      size="small"
                      sx={{
                        backgroundColor: getStatusColor(job.status),
                        color: 'white',
                        fontWeight: 'medium',
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(job.applicationDate)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {job.salary || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Box display="flex" justifyContent="center" gap={1}>
                      {job.jobUrl && (
                        <Tooltip title="Open job posting">
                          <IconButton
                            size="small"
                            onClick={() => window.open(job.jobUrl, '_blank')}
                            color="primary"
                          >
                            <LaunchIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Edit application">
                        <IconButton
                          size="small"
                          onClick={() => onEditJob(job)}
                          color="primary"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete application">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteClick(job)}
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Job Application</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the application for{' '}
            <strong>{jobToDelete?.position}</strong> at{' '}
            <strong>{jobToDelete?.company}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default JobApplicationList;

