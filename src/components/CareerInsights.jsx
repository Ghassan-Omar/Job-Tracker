import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Card,
  CardContent,
  Chip,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Avatar,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Psychology as AIIcon,
  TrendingUp as TrendingUpIcon,
  School as SkillIcon,
  Business as BusinessIcon,
  People as NetworkIcon,
  Star as StarIcon,
  Assignment as GoalIcon,
  Timeline as TimelineIcon,
  Lightbulb as InsightIcon,
  Assessment as AnalysisIcon,
} from '@mui/icons-material';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { getUserProfile } from '../utils/userRoles';
import aiService from '../services/aiService';
import Grid from '@mui/material/Grid';
function CareerInsights() {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userProfile, setUserProfile] = useState(null);
  const [jobApplications, setJobApplications] = useState([]);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      if (auth.currentUser) {
        // Load user profile
        const profile = await getUserProfile(auth.currentUser.uid);
        setUserProfile(profile);

        // Load recent job applications
        const applicationsRef = collection(db, 'jobApplications');
        const q = query(
          applicationsRef,
          where('userId', '==', auth.currentUser.uid),
          orderBy('appliedDate', 'desc'),
          limit(20)
        );
        
        const querySnapshot = await getDocs(q);
        const applications = [];
        querySnapshot.forEach((doc) => {
          applications.push({ id: doc.id, ...doc.data() });
        });
        
        setJobApplications(applications);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setError('Failed to load user data');
    }
  };

  const generateInsights = async () => {
    if (!userProfile) {
      setError('User profile not found. Please ensure you are logged in.');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const result = await aiService.generateCareerInsights(userProfile, jobApplications);
      setInsights(result);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderInsightSection = (title, content, icon, color = 'primary') => {
    if (!content) return null;

    return (
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box display="flex" alignItems="center">
            <Avatar sx={{ bgcolor: `${color}.main`, mr: 2, width: 32, height: 32 }}>
              {icon}
            </Avatar>
            <Typography variant="h6">
              {title}
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          {Array.isArray(content) ? (
            <List>
              {content.map((item, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <StarIcon color={color} fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={typeof item === 'object' ? item.title || item.recommendation || item.goal : item}
                    secondary={typeof item === 'object' ? item.description || item.details : null}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
              {content}
            </Typography>
          )}
        </AccordionDetails>
      </Accordion>
    );
  };

  const getApplicationSuccessRate = () => {
    if (jobApplications.length === 0) return 0;
    const successfulApplications = jobApplications.filter(
      app => app.status === 'Offer Received' || app.status === 'Interview Scheduled'
    ).length;
    return Math.round((successfulApplications / jobApplications.length) * 100);
  };

  const getMostAppliedRole = () => {
    if (jobApplications.length === 0) return 'N/A';
    const roleCounts = {};
    jobApplications.forEach(app => {
      roleCounts[app.position] = (roleCounts[app.position] || 0) + 1;
    });
    return Object.keys(roleCounts).reduce((a, b) => roleCounts[a] > roleCounts[b] ? a : b);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          AI Career Insights
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Get personalized career recommendations based on your profile and application history
        </Typography>
      </Box>

      {/* User Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {jobApplications.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Applications
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {getApplicationSuccessRate()}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Success Rate
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="info.main" noWrap>
                {getMostAppliedRole()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Most Applied Role
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main">
                {userProfile?.role === 'admin' ? 'Admin' : 'User'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Account Type
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Generate Insights Button */}
      <Paper elevation={2} sx={{ p: 3, mb: 3, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          Ready for AI-Powered Career Analysis?
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Our AI will analyze your profile, application history, and market trends to provide personalized career insights
        </Typography>
        
        <Button
          variant="contained"
          size="large"
          onClick={generateInsights}
          disabled={loading || !userProfile}
          startIcon={loading ? <CircularProgress size={20} /> : <AIIcon />}
        >
          {loading ? 'Generating Insights...' : 'Generate AI Career Insights'}
        </Button>
      </Paper>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Insights Results */}
      {insights && (
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Your Personalized Career Insights
          </Typography>

          {/* Key Metrics */}
          {insights.market_position && (
            <Card sx={{ mb: 3, bgcolor: 'background.default' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Market Position Assessment
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={75} 
                  sx={{ mb: 2, height: 8, borderRadius: 4 }}
                />
                <Typography variant="body2" color="text.secondary">
                  {typeof insights.market_position === 'string' 
                    ? insights.market_position 
                    : 'Your competitive position in the current job market'}
                </Typography>
              </CardContent>
            </Card>
          )}

          {/* Detailed Insights Sections */}
          <Box sx={{ mb: 2 }}>
            {insights.type === 'text_insights' ? (
              <Card>
                <CardContent>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                    {insights.insights}
                  </Typography>
                </CardContent>
              </Card>
            ) : (
              <>
                {renderInsightSection(
                  'Career Trajectory Analysis',
                  insights.career_trajectory_analysis || insights.trajectory,
                  <TrendingUpIcon />,
                  'primary'
                )}

                {renderInsightSection(
                  'Skill Gap Analysis',
                  insights.skill_gap_analysis || insights.skill_gaps,
                  <SkillIcon />,
                  'warning'
                )}

                {renderInsightSection(
                  'Industry Trends',
                  insights.industry_trends || insights.trends,
                  <AnalysisIcon />,
                  'info'
                )}

                {renderInsightSection(
                  'Networking Recommendations',
                  insights.networking_recommendations || insights.networking,
                  <NetworkIcon />,
                  'success'
                )}

                {renderInsightSection(
                  'Personal Branding Suggestions',
                  insights.personal_branding_suggestions || insights.branding,
                  <StarIcon />,
                  'secondary'
                )}

                {renderInsightSection(
                  'Short-term Goals',
                  insights.short_term_goals || insights.short_goals,
                  <GoalIcon />,
                  'success'
                )}

                {renderInsightSection(
                  'Long-term Strategy',
                  insights.long_term_strategy || insights.long_strategy,
                  <TimelineIcon />,
                  'primary'
                )}

                {renderInsightSection(
                  'Application Strategy',
                  insights.application_strategy || insights.strategy,
                  <BusinessIcon />,
                  'info'
                )}

                {renderInsightSection(
                  'Professional Development',
                  insights.professional_development || insights.development,
                  <SkillIcon />,
                  'warning'
                )}
              </>
            )}
          </Box>

          {/* Action Timeline */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📅 Recommended Action Timeline
              </Typography>
              <Stepper orientation="vertical">
                <Step active>
                  <StepLabel>
                    <Typography variant="subtitle2">Next 30 Days</Typography>
                  </StepLabel>
                  <StepContent>
                    <Typography variant="body2" color="text.secondary">
                      Update resume, optimize LinkedIn profile, identify skill gaps
                    </Typography>
                  </StepContent>
                </Step>
                
                <Step active>
                  <StepLabel>
                    <Typography variant="subtitle2">Next 3 Months</Typography>
                  </StepLabel>
                  <StepContent>
                    <Typography variant="body2" color="text.secondary">
                      Complete relevant courses, expand network, apply strategically
                    </Typography>
                  </StepContent>
                </Step>
                
                <Step active>
                  <StepLabel>
                    <Typography variant="subtitle2">Next 6-12 Months</Typography>
                  </StepLabel>
                  <StepContent>
                    <Typography variant="body2" color="text.secondary">
                      Achieve career goals, build expertise, consider leadership roles
                    </Typography>
                  </StepContent>
                </Step>
              </Stepper>
            </CardContent>
          </Card>

          {/* Pro Tips */}
          <Card sx={{ mt: 3, bgcolor: 'info.light', color: 'info.contrastText' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                💡 Pro Tips for Career Growth
              </Typography>
              <Typography variant="body2">
                • Set specific, measurable career goals with deadlines<br/>
                • Regularly update your skills based on industry trends<br/>
                • Build meaningful professional relationships, not just connections<br/>
                • Document your achievements and impact quantitatively<br/>
                • Stay visible in your industry through content and networking
              </Typography>
            </CardContent>
          </Card>
        </Paper>
      )}
    </Box>
  );
}

export default CareerInsights;