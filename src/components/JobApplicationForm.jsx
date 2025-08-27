import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  Box,
  IconButton,
  Typography,
} from '@mui/material';
import { Close as CloseIcon, Work as WorkIcon } from '@mui/icons-material';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db, auth } from '../firebase';

const statusOptions = [
  { value: 'applied', label: 'Applied', color: '#2196f3' },
  { value: 'interview', label: 'Interview Scheduled', color: '#ff9800' },
  { value: 'offer', label: 'Offer Received', color: '#4caf50' },
  { value: 'rejected', label: 'Rejected', color: '#f44336' },
  { value: 'withdrawn', label: 'Withdrawn', color: '#9e9e9e' },
];

function JobApplicationForm({ open, onClose, editingJob }) {
  const [formData, setFormData] = useState({
    company: '',
    position: '',
    location: '',
    salary: '',
    status: 'applied',
    applicationDate: new Date().toISOString().split('T')[0],
    notes: '',
    jobUrl: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingJob) {
      setFormData({
        company: editingJob.company || '',
        position: editingJob.position || '',
        location: editingJob.location || '',
        salary: editingJob.salary || '',
        status: editingJob.status || 'applied',
        applicationDate: editingJob.applicationDate || new Date().toISOString().split('T')[0],
        notes: editingJob.notes || '',
        jobUrl: editingJob.jobUrl || '',
      });
    } else {
      setFormData({
        company: '',
        position: '',
        location: '',
        salary: '',
        status: 'applied',
        applicationDate: new Date().toISOString().split('T')[0],
        notes: '',
        jobUrl: '',
      });
    }
    setError('');
  }, [editingJob, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.company.trim() || !formData.position.trim()) {
      setError('Company and Position are required fields');
      setLoading(false);
      return;
    }

    try {
      const jobData = {
        ...formData,
        userId: auth.currentUser.uid,
        updatedAt: new Date(),
      };

      if (editingJob) {
        // Update existing job
        await updateDoc(doc(db, 'jobApplications', editingJob.id), jobData);
      } else {
        // Add new job
        jobData.createdAt = new Date();
        await addDoc(collection(db, 'jobApplications'), jobData);
      }

      onClose();
    } catch (error) {
      console.error('Error saving job application:', error);
      setError('Failed to save job application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <WorkIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">
              {editingJob ? 'Edit Job Application' : 'Add New Job Application'}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Company *"
                name="company"
                value={formData.company}
                onChange={handleChange}
                required
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Position *"
                name="position"
                value={formData.position}
                onChange={handleChange}
                required
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                variant="outlined"
                placeholder="e.g., San Francisco, CA"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Salary Range"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                variant="outlined"
                placeholder="e.g., $80,000 - $100,000"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  label="Status"
                >
                  {statusOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
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
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Application Date"
                name="applicationDate"
                type="date"
                value={formData.applicationDate}
                onChange={handleChange}
                variant="outlined"
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Job URL"
                name="jobUrl"
                value={formData.jobUrl}
                onChange={handleChange}
                variant="outlined"
                placeholder="https://..."
                type="url"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                variant="outlined"
                multiline
                rows={4}
                placeholder="Add any additional notes about this application..."
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{ minWidth: 120 }}
          >
            {loading ? 'Saving...' : editingJob ? 'Update' : 'Add Application'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default JobApplicationForm;

