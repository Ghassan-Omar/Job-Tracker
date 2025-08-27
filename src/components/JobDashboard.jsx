import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Work as WorkIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
} from '@mui/icons-material';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebase';

const statusOptions = [
  { value: 'applied', label: 'Applied', color: '#2196f3', icon: PendingIcon },
  { value: 'interview', label: 'Interview Scheduled', color: '#ff9800', icon: ScheduleIcon },
  { value: 'offer', label: 'Offer Received', color: '#4caf50', icon: CheckCircleIcon },
  { value: 'rejected', label: 'Rejected', color: '#f44336', icon: CancelIcon },
  { value: 'withdrawn', label: 'Withdrawn', color: '#9e9e9e', icon: CancelIcon },
];

function JobDashboard({ refreshTrigger }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    applied: 0,
    interview: 0,
    offer: 0,
    rejected: 0,
    withdrawn: 0,
  });

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'jobApplications'),
      where('userId', '==', auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const jobsData = [];
      querySnapshot.forEach((doc) => {
        jobsData.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      
      setJobs(jobsData);
      calculateStats(jobsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [refreshTrigger]);

  const calculateStats = (jobsData) => {
    const newStats = {
      total: jobsData.length,
      applied: 0,
      interview: 0,
      offer: 0,
      rejected: 0,
      withdrawn: 0,
    };

    jobsData.forEach((job) => {
      if (newStats.hasOwnProperty(job.status)) {
        newStats[job.status]++;
      }
    });

    setStats(newStats);
  };

  const getStatusColor = (status) => {
    const statusOption = statusOptions.find(option => option.value === status);
    return statusOption ? statusOption.color : '#9e9e9e';
  };

  const getStatusLabel = (status) => {
    const statusOption = statusOptions.find(option => option.value === status);
    return statusOption ? statusOption.label : status;
  };

  const getRecentApplications = () => {
    return jobs
      .sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
        return dateB - dateA;
      })
      .slice(0, 5);
  };

  const getSuccessRate = () => {
    if (stats.total === 0) return 0;
    return Math.round(((stats.offer + stats.interview) / stats.total) * 100);
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
      <Box>
        <LinearProgress sx={{ mb: 3 }} />
        <Typography>Loading dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    Total Applications
                  </Typography>
                  <Typography variant="h4" component="div">
                    {stats.total}
                  </Typography>
                </Box>
                <WorkIcon sx={{ fontSize: 40, color: 'primary.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    Success Rate
                  </Typography>
                  <Typography variant="h4" component="div">
                    {getSuccessRate()}%
                  </Typography>
                </Box>
                <TrendingUpIcon sx={{ fontSize: 40, color: 'success.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    Interviews
                  </Typography>
                  <Typography variant="h4" component="div">
                    {stats.interview}
                  </Typography>
                </Box>
                <ScheduleIcon sx={{ fontSize: 40, color: 'warning.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    Offers
                  </Typography>
                  <Typography variant="h4" component="div">
                    {stats.offer}
                  </Typography>
                </Box>
                <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Status Breakdown */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Application Status Breakdown
            </Typography>
            <Box sx={{ mt: 2 }}>
              {statusOptions.map((status) => {
                const count = stats[status.value] || 0;
                const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                
                return (
                  <Box key={status.value} sx={{ mb: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                      <Box display="flex" alignItems="center">
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: status.color,
                            mr: 1,
                          }}
                        />
                        <Typography variant="body2">{status.label}</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {count} ({Math.round(percentage)}%)
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={percentage}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: 'grey.200',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: status.color,
                        },
                      }}
                    />
                  </Box>
                );
              })}
            </Box>
          </Paper>
        </Grid>

        {/* Recent Applications */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Applications
            </Typography>
            {getRecentApplications().length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                No applications yet. Start by adding your first job application!
              </Typography>
            ) : (
              <List dense>
                {getRecentApplications().map((job, index) => (
                  <React.Fragment key={job.id}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: getStatusColor(job.status),
                          }}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="body2" fontWeight="medium">
                            {job.position} at {job.company}
                          </Typography>
                        }
                        secondary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Chip
                              label={getStatusLabel(job.status)}
                              size="small"
                              sx={{
                                backgroundColor: getStatusColor(job.status),
                                color: 'white',
                                fontSize: '0.75rem',
                                height: 20,
                              }}
                            />
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(job.createdAt)}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < getRecentApplications().length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default JobDashboard;

