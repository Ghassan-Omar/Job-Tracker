import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Card,
  CardContent,
  Grid,
  Chip,
  LinearProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Rating,
  Divider,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  Psychology as AIIcon,
  Description as ResumeIcon,
  Star as StarIcon,
  Lightbulb as IdeaIcon,
} from '@mui/icons-material';
import aiService from '../services/aiService';

function ResumeAnalyzer() {
  const [resumeText, setResumeText] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type === 'text/plain') {
        const reader = new FileReader();
        reader.onload = (e) => {
          setResumeText(e.target.result);
        };
        reader.readAsText(file);
      } else {
        setError('Please upload a text file (.txt). For PDF/Word files, copy and paste the content.');
      }
    }
  };

  const handleAnalyze = async () => {
    if (!resumeText.trim()) {
      setError('Please provide your resume content');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const result = await aiService.analyzeResume(resumeText, targetRole);
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
            {icon}
            <Typography variant="h6" sx={{ ml: 1 }}>
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
                    <CheckIcon color={color} />
                  </ListItemIcon>
                  <ListItemText primary={item} />
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

  const getScoreColor = (score) => {
    if (score >= 8) return 'success';
    if (score >= 6) return 'warning';
    return 'error';
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          AI Resume Analyzer
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Get personalized feedback on your resume from our AI career advisor
        </Typography>
      </Box>

      {/* Input Section */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Upload Resume
            </Typography>
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadIcon />}
              fullWidth
              sx={{ mb: 2 }}
            >
              Upload Text File (.txt)
              <input
                type="file"
                hidden
                accept=".txt"
                onChange={handleFileUpload}
              />
            </Button>
            <Typography variant="body2" color="text.secondary">
              Or copy and paste your resume content below
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              label="Target Role (Optional)"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              fullWidth
              placeholder="e.g., Software Engineer, Marketing Manager"
              helperText="Specify the role you're targeting for more tailored feedback"
            />
          </Grid>
        </Grid>

        <TextField
          label="Resume Content"
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          multiline
          rows={8}
          fullWidth
          sx={{ mt: 2 }}
          placeholder="Paste your resume content here..."
        />

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleAnalyze}
            disabled={loading || !resumeText.trim()}
            startIcon={loading ? <CircularProgress size={20} /> : <AIIcon />}
          >
            {loading ? 'Analyzing Resume...' : 'Analyze with AI'}
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

          {/* Overall Score */}
          {analysis.score && analysis.score !== 'N/A' && (
            <Card sx={{ mb: 3, bgcolor: 'background.default' }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Overall Resume Score
                    </Typography>
                    <Box display="flex" alignItems="center">
                      <Rating
                        value={analysis.score / 2}
                        readOnly
                        precision={0.1}
                        max={5}
                      />
                      <Typography variant="h4" sx={{ ml: 2 }}>
                        {analysis.score}/10
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    label={
                      analysis.score >= 8 ? 'Excellent' :
                      analysis.score >= 6 ? 'Good' :
                      analysis.score >= 4 ? 'Needs Improvement' : 'Poor'
                    }
                    color={getScoreColor(analysis.score)}
                    size="large"
                  />
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Analysis Sections */}
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
                  'Overall Assessment',
                  analysis.overall_assessment || analysis.assessment,
                  <TrendingUpIcon color="primary" />
                )}

                {renderAnalysisSection(
                  'Strengths',
                  analysis.strengths,
                  <CheckIcon color="success" />,
                  'success'
                )}

                {renderAnalysisSection(
                  'Areas for Improvement',
                  analysis.areas_for_improvement || analysis.improvements,
                  <WarningIcon color="warning" />,
                  'warning'
                )}

                {renderAnalysisSection(
                  'Missing Elements',
                  analysis.missing_elements || analysis.missing,
                  <IdeaIcon color="info" />,
                  'info'
                )}

                {renderAnalysisSection(
                  'Formatting & Structure',
                  analysis.formatting_structure || analysis.formatting,
                  <ResumeIcon color="primary" />
                )}

                {renderAnalysisSection(
                  'Keywords & ATS Optimization',
                  analysis.keywords_ats || analysis.keywords,
                  <StarIcon color="secondary" />,
                  'secondary'
                )}

                {renderAnalysisSection(
                  'Industry-Specific Recommendations',
                  analysis.industry_recommendations || analysis.industry_specific,
                  <TrendingUpIcon color="primary" />
                )}

                {renderAnalysisSection(
                  'Action Items',
                  analysis.action_items || analysis.actions,
                  <CheckIcon color="success" />,
                  'success'
                )}
              </>
            )}
          </Box>

          {/* Tips Section */}
          <Card sx={{ mt: 3, bgcolor: 'info.light', color: 'info.contrastText' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                💡 Pro Tips
              </Typography>
              <Typography variant="body2">
                • Use action verbs and quantify your achievements with numbers<br/>
                • Tailor your resume for each job application<br/>
                • Keep it concise - aim for 1-2 pages maximum<br/>
                • Use a clean, professional format that's ATS-friendly<br/>
                • Include relevant keywords from the job description
              </Typography>
            </CardContent>
          </Card>
        </Paper>
      )}
    </Box>
  );
}

export default ResumeAnalyzer;