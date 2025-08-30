import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  Tooltip,
  Avatar,
} from '@mui/material';
import {
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
  Security as SecurityIcon,
  TrendingUp as TrendingUpIcon,
  Edit as EditIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  AdminPanelSettings as AdminIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import {
  getAllUsers,
  getUserStatistics,
  updateUserRole,
  toggleUserStatus,
  USER_ROLES,
} from '../utils/userRoles';
import { auth } from '../firebase';

function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [usersData, statsData] = await Promise.all([
        getAllUsers(auth.currentUser.uid),
        getUserStatistics(auth.currentUser.uid)
      ]);
      
      setUsers(usersData);
      setStatistics(statsData);
    } catch (error) {
      console.error('Error loading admin data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setEditDialogOpen(true);
  };

  const handleUpdateRole = async () => {
    try {
      await updateUserRole(auth.currentUser.uid, selectedUser.id, newRole);
      setEditDialogOpen(false);
      setSelectedUser(null);
      await loadData(); // Refresh data
    } catch (error) {
      setError(error.message);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      await toggleUserStatus(auth.currentUser.uid, userId, !currentStatus);
      await loadData(); // Refresh data
    } catch (error) {
      setError(error.message);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case USER_ROLES.ADMIN:
        return <AdminIcon />;
      case USER_ROLES.MODERATOR:
        return <SecurityIcon />;
      default:
        return <PersonIcon />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case USER_ROLES.ADMIN:
        return 'error';
      case USER_ROLES.MODERATOR:
        return 'warning';
      default:
        return 'default';
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Not specified';
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" py={4}>
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          جاري تحميل لوحة الإدارة...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom>
            لوحة الإدارة
          </Typography>
          <Typography variant="body1" color="text.secondary">
            إدارة المستخدمين والصلاحيات
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={loadData}
          disabled={loading}
        >
          تحديث
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      {statistics && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="text.secondary" gutterBottom variant="body2">
                      إجمالي المستخدمين
                    </Typography>
                    <Typography variant="h4" component="div">
                      {statistics.totalUsers}
                    </Typography>
                  </Box>
                  <PeopleIcon sx={{ fontSize: 40, color: 'primary.main' }} />
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
                      المستخدمين النشطين
                    </Typography>
                    <Typography variant="h4" component="div">
                      {statistics.activeUsers}
                    </Typography>
                  </Box>
                  <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main' }} />
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
                      المديرين
                    </Typography>
                    <Typography variant="h4" component="div">
                      {statistics.adminUsers}
                    </Typography>
                  </Box>
                  <AdminIcon sx={{ fontSize: 40, color: 'error.main' }} />
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
                      المستخدمين العاديين
                    </Typography>
                    <Typography variant="h4" component="div">
                      {statistics.regularUsers}
                    </Typography>
                  </Box>
                  <PersonIcon sx={{ fontSize: 40, color: 'info.main' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Users Table */}
      <Paper elevation={2}>
        <Box p={3}>
          <Typography variant="h6" gutterBottom>
            إدارة المستخدمين
          </Typography>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'grey.50' }}>
                  <TableCell><strong>المستخدم</strong></TableCell>
                  <TableCell><strong>البريد الإلكتروني</strong></TableCell>
                  <TableCell><strong>الدور</strong></TableCell>
                  <TableCell><strong>الحالة</strong></TableCell>
                  <TableCell><strong>تاريخ التسجيل</strong></TableCell>
                  <TableCell><strong>آخر دخول</strong></TableCell>
                  <TableCell align="center"><strong>الإجراءات</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          {user.displayName?.charAt(0) || user.email.charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography variant="body2" fontWeight="medium">
                          {user.displayName || user.email.split('@')[0]}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {user.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getRoleIcon(user.role)}
                        label={
                          user.role === USER_ROLES.ADMIN ? 'مدير' :
                          user.role === USER_ROLES.MODERATOR ? 'مشرف' : 'مستخدم'
                        }
                        color={getRoleColor(user.role)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.isActive ? 'نشط' : 'معطل'}
                        color={user.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(user.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(user.lastLogin)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box display="flex" justifyContent="center" gap={1}>
                        <Tooltip title="تعديل الدور">
                          <IconButton
                            size="small"
                            onClick={() => handleEditUser(user)}
                            color="primary"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={user.isActive ? 'تعطيل المستخدم' : 'تفعيل المستخدم'}>
                          <IconButton
                            size="small"
                            onClick={() => handleToggleStatus(user.id, user.isActive)}
                            color={user.isActive ? 'error' : 'success'}
                            disabled={user.id === auth.currentUser.uid} // Can't disable self
                          >
                            {user.isActive ? <BlockIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Paper>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>تعديل دور المستخدم</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="body1" gutterBottom>
                <strong>المستخدم:</strong> {selectedUser.email}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
                <strong>الدور الحالي:</strong> {
                  selectedUser.role === USER_ROLES.ADMIN ? 'مدير' :
                  selectedUser.role === USER_ROLES.MODERATOR ? 'مشرف' : 'مستخدم'
                }
              </Typography>
              
              <FormControl fullWidth>
                <InputLabel>الدور الجديد</InputLabel>
                <Select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  label="الدور الجديد"
                >
                  <MenuItem value={USER_ROLES.USER}>
                    <Box display="flex" alignItems="center">
                      <PersonIcon sx={{ mr: 1 }} />
                      مستخدم عادي
                    </Box>
                  </MenuItem>
                  <MenuItem value={USER_ROLES.MODERATOR}>
                    <Box display="flex" alignItems="center">
                      <SecurityIcon sx={{ mr: 1 }} />
                      مشرف
                    </Box>
                  </MenuItem>
                  <MenuItem value={USER_ROLES.ADMIN}>
                    <Box display="flex" alignItems="center">
                      <AdminIcon sx={{ mr: 1 }} />
                      مدير
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>إلغاء</Button>
          <Button onClick={handleUpdateRole} variant="contained" disabled={newRole === selectedUser?.role}>
            حفظ التغييرات
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AdminPanel;