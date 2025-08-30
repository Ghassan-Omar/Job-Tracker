import React, { useState, useEffect } from 'react';
import { 
  ThemeProvider, 
  createTheme, 
  CssBaseline, 
  AppBar, 
  Toolbar, 
  Typography, 
  Container, 
  Box, 
  Fab, 
  Paper,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Divider
} from '@mui/material';
import { 
  Add as AddIcon, 
  Work as WorkIcon, 
  AccountCircle as AccountIcon,
  Logout as LogoutIcon,
  Dashboard as DashboardIcon,
  AdminPanelSettings as AdminIcon
} from '@mui/icons-material';
import JobApplicationForm from './components/JobApplicationForm';
import JobApplicationList from './components/JobApplicationList';
import JobDashboard from './components/JobDashboard';
import AdminPanel from './components/AdminPanel';
import AuthComponent from './components/AuthComponent';
// import FirebaseSetupGuide from './components/FirebaseSetupGuide';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { initializeUserProfile, getUserProfile, isUserAdmin } from './utils/userRoles';
import './App.css';

// Create Material UI theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
});

function App() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [refreshList, setRefreshList] = useState(0);
  const [currentView, setCurrentView] = useState('applications'); // 'dashboard', 'applications', 'admin'
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Initialize or get user profile
          const profile = await initializeUserProfile(user);
          setUserProfile(profile);
          
          // Check admin status
          const adminStatus = await isUserAdmin(user.uid);
          setIsAdmin(adminStatus);
          
          setUser(user);
        } catch (error) {
          console.error('Error setting up user profile:', error);
          setUser(user);
        }
      } else {
        setUser(null);
        setUserProfile(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAddJob = () => {
    setEditingJob(null);
    setShowForm(true);
  };

  const handleEditJob = (job) => {
    setEditingJob(job);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingJob(null);
    setRefreshList(prev => prev + 1);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      handleMenuClose();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getUserInitials = (email) => {
    return email ? email.charAt(0).toUpperCase() : 'U';
  };

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          minHeight="100vh"
        >
          <Typography variant="h6">Loading...</Typography>
        </Box>
      </ThemeProvider>
    );
  }

  if (!user) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthComponent />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1, minHeight: '100vh' }}>
        {/* Header */}
        <AppBar position="static" elevation={2}>
          <Toolbar>
            <WorkIcon sx={{ mr: 2 }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Job Tracker
            </Typography>
            
            {/* Navigation Buttons */}
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
              <IconButton
                color={currentView === 'dashboard' ? 'secondary' : 'inherit'}
                onClick={() => setCurrentView('dashboard')}
                sx={{ mr: 1 }}
              >
                <DashboardIcon />
              </IconButton>
              <IconButton
                color={currentView === 'applications' ? 'secondary' : 'inherit'}
                onClick={() => setCurrentView('applications')}
                sx={{ mr: 1 }}
              >
                <WorkIcon />
              </IconButton>
              {/* Admin Panel Button - Only visible to admins */}
              {isAdmin && (
                <IconButton
                  color={currentView === 'admin' ? 'secondary' : 'inherit'}
                  onClick={() => setCurrentView('admin')}
                  sx={{ mr: 1 }}
                >
                  <AdminIcon />
                </IconButton>
              )}
            </Box>

            {/* User Menu */}
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls="user-menu"
              aria-haspopup="true"
              onClick={handleMenuOpen}
              color="inherit"
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                {getUserInitials(user.email)}
              </Avatar>
            </IconButton>
            <Menu
              id="user-menu"
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <MenuItem disabled>
                <Typography variant="body2" color="text.secondary">
                  {user.email}
                </Typography>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <LogoutIcon sx={{ mr: 1 }} />
                Logout
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        {/* Main Content */}
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          {currentView === 'dashboard' ? (
            <>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h4" gutterBottom>
                  Dashboard
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Overview of your job search progress and statistics.
                </Typography>
              </Box>
              <JobDashboard refreshTrigger={refreshList} />
            </>
          ) : currentView === 'admin' && isAdmin ? (
            <>
              <AdminPanel />
            </>
          ) : (
            <>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h4" gutterBottom>
                  My Job Applications
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Track your job applications and stay organized in your job search.
                </Typography>
              </Box>

              {/* Job Applications List */}
              <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                <JobApplicationList 
                  onEditJob={handleEditJob}
                  refreshTrigger={refreshList}
                />
              </Paper>
            </>
          )}
        </Container>

        {/* Floating Action Button */}
        <Fab
          color="primary"
          aria-label="add job application"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            boxShadow: 3,
          }}
          onClick={handleAddJob}
        >
          <AddIcon />
        </Fab>

        {/* Job Application Form Modal */}
        {showForm && (
          <JobApplicationForm
            open={showForm}
            onClose={handleFormClose}
            editingJob={editingJob}
          />
        )}
      </Box>
    </ThemeProvider>
  );
}

export default App;