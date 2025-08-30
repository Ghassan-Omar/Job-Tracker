import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
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
  Divider,
  Avatar,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Work as WorkIcon,
  Psychology as AIIcon,
  TrendingUp as TrendingUpIcon,
  School as SkillIcon,
  AttachMoney as SalaryIcon,
  Business as CompanyIcon,
  Warning as WarningIcon,
  Lightbulb as TipsIcon,
  Star as StarIcon,
  Assignment as TaskIcon,
} from '@mui/icons-material';
import aiService from '../services/aiService';
import Grid from '@mui/material/Grid';
function JobDescriptionAnalyzer() {
  const [jobDescription, setJobDescription] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      setError('Please provide a job description to analyze');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const result = await aiService.analyzeJobDescription(jobDescription);
      setAnalysis(result);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderAnalysisSection = (title, content, icon, color = 'primary') => {
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
                    primary={typeof item === 'object' ? item.skill || item.responsibility || item.tip : item}
                    secondary={typeof item === 'object' ? item.description : null}
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

  const getExperienceLevelColor = (level) => {
    if (level?.toLowerCase().includes('senior')) return 'error';
    if (level?.toLowerCase().includes('mid')) return 'warning';
    return 'success';
  };

  const getExperienceLevelLabel = (level) => {
    if (level?.toLowerCase().includes('senior')) return 'Senior Level';
    if (level?.toLowerCase().includes('mid')) return 'Mid Level';
    if (level?.toLowerCase().includes('entry')) return 'Entry Level';
    return level || 'Not Specified';
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          AI Job Description Analyzer
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Decode job postings and understand what employers really want
        </Typography>
      </Box>

      {/* Input Section */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Job Description
        </Typography>
        <TextField
          label="Paste Job Description Here"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          multiline
          rows={10}
          fullWidth
          placeholder="Copy and paste the complete job description from the job posting..."
          sx={{ mb: 3 }}
        />

        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleAnalyze}
            disabled={loading || !jobDescription.trim()}
            startIcon={loading ? <CircularProgress size={20} /> : <AIIcon />}
          >
            {loading ? 'Analyzing Job Description...' : 'Analyze with AI'}
          </Button>
        </Box>
      </Paper>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Analysis Results */}
      {analysis && (
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            AI Analysis Results
          </Typography>

          {/* Quick Overview Cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {analysis.experience_level && (
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ height: '100%' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <SkillIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h6" gutterBottom>
                      Experience Level
                    </Typography>
                    <Chip
                      label={getExperienceLevelLabel(analysis.experience_level)}
                      color={getExperienceLevelColor(analysis.experience_level)}
                      size="small"
                    />
                  </CardContent>
                </Card>
              </Grid>
            )}

            {analysis.salary_range_estimate && (
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ height: '100%' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <SalaryIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h6" gutterBottom>
                      Salary Estimate
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {analysis.salary_range_estimate}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {analysis.company_culture_indicators && (
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ height: '100%' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <CompanyIcon color="info" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h6" gutterBottom>
                      Culture Type
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {typeof analysis.company_culture_indicators === 'string' 
                        ? analysis.company_culture_indicators.substring(0, 50) + '...'
                        : 'See detailed analysis'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <TrendingUpIcon color="warning" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h6" gutterBottom>
                    Match Factors
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Key areas to emphasize
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Detailed Analysis Sections */}
          <Box sx={{ mb: 2 }}>
            {analysis.type === 'text_analysis' ? (
              <Card>
                <CardContent>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                    {analysis.analysis}
                  </Typography>
                </CardContent>
              </Card>
            ) : (
              <>
                {renderAnalysisSection(
                  'Role Summary',
                  analysis.role_summary || analysis.summary,
                  <WorkIcon />,
                  'primary'
                )}

                {renderAnalysisSection(
                  'Key Responsibilities',
                  analysis.key_responsibilities || analysis.responsibilities,
                  <TaskIcon />,
                  'info'
                )}

                {renderAnalysisSection(
                  'Required Skills',
                  analysis.required_skills || analysis.skills,
                  <SkillIcon />,
                  'error'
                )}

                {renderAnalysisSection(
                  'Preferred Qualifications',
                  analysis.preferred_qualifications || analysis.qualifications,
                  <StarIcon />,
                  'warning'
                )}

                {renderAnalysisSection(
                  'Company Culture Indicators',
                  analysis.company_culture_indicators || analysis.culture,
                  <CompanyIcon />,
                  'info'
                )}

                {renderAnalysisSection(
                  'Application Tips',
                  analysis.application_tips || analysis.tips,
                  <TipsIcon />,
                  'success'
                )}

                {renderAnalysisSection(
                  'Red Flags',
                  analysis.red_flags || analysis.warnings,
                  <WarningIcon />,
                  'error'
                )}

                {renderAnalysisSection(
                  'Match Score Factors',
                  analysis.match_score_factors || analysis.match_factors,
                  <TrendingUpIcon />,
                  'primary'
                )}
              </>
            )}
          </Box>

          {/* Action Items Card */}
          <Card sx={{ mt: 3, bgcolor: 'success.light', color: 'success.contrastText' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🎯 Action Items for Your Application
              </Typography>
              <Typography variant="body2">
                • Tailor your resume to highlight the required skills mentioned<br/>
                • Research the company culture and values before applying<br/>
                • Prepare specific examples that demonstrate the key responsibilities<br/>
                • Address any red flags proactively in your cover letter<br/>
                • Use keywords from the job description in your application materials
              </Typography>
            </CardContent>
          </Card>

          {/* Interview Preparation Tip */}
          <Card sx={{ mt: 2, bgcolor: 'info.light', color: 'info.contrastText' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                💡 Interview Preparation Tip
              </Typography>
              <Typography variant="body2">
                Use our AI Interview Question Generator to prepare for potential questions based on this job description. 
                Focus on the key responsibilities and required skills identified in the analysis above.
              </Typography>
            </CardContent>
          </Card>
        </Paper>
      )}
    </Box>
  );
}

export default JobDescriptionAnalyzer;