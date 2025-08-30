import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Card,
  CardContent,
  Avatar,
  Chip,
  IconButton,
  Divider,
  CircularProgress,
  Alert,
  Grid,
  Tooltip,
} from '@mui/material';
import {
  Send as SendIcon,
  Psychology as AIIcon,
  Person as PersonIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  Help as HelpIcon,
  Work as WorkIcon,
  School as SkillIcon,
  TrendingUp as CareerIcon,
  Assignment as ResumeIcon,
} from '@mui/icons-material';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { getUserProfile } from '../utils/userRoles';
import aiService from '../services/aiService';

function AICareerAssistant() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userContext, setUserContext] = useState({});
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadUserContext();
    initializeChat();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadUserContext = async () => {
    try {
      if (auth.currentUser) {
        // Load user profile
        const profile = await getUserProfile(auth.currentUser.uid);
        
        // Load recent job applications
        const applicationsRef = collection(db, 'jobApplications');
        const q = query(
          applicationsRef,
          where('userId', '==', auth.currentUser.uid),
          orderBy('appliedDate', 'desc'),
          limit(10)
        );
        
        const querySnapshot = await getDocs(q);
        const applications = [];
        querySnapshot.forEach((doc) => {
          applications.push({ id: doc.id, ...doc.data() });
        });
        
        setUserContext({
          profile,
          recentApplications: applications,
          totalApplications: applications.length,
          successRate: applications.length > 0 
            ? Math.round((applications.filter(app => 
                app.status === 'Offer Received' || app.status === 'Interview Scheduled'
              ).length / applications.length) * 100)
            : 0
        });
      }
    } catch (error) {
      console.error('Error loading user context:', error);
    }
  };

  const initializeChat = () => {
    const welcomeMessage = {
      id: Date.now(),
      type: 'ai',
      content: `👋 Hello! I'm your AI Career Assistant. I'm here to help you with:

• Resume and cover letter advice
• Interview preparation tips
• Job search strategies
• Career planning and development
• Skill development recommendations
• Salary negotiation guidance
• Industry insights and trends

What would you like to discuss today?`,
      timestamp: new Date()
    };
    
    setMessages([welcomeMessage]);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);
    setError('');

    try {
      // Prepare conversation history for AI
      const conversationHistory = messages.map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

      // Add current user message
      conversationHistory.push({
        role: 'user',
        content: inputMessage
      });

      const aiResponse = await aiService.chatWithAssistant(conversationHistory, userContext);

      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: aiResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      setError(error.message);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: 'I apologize, but I encountered an error. Please try again or rephrase your question.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    initializeChat();
    setError('');
  };

  const handleQuickQuestion = (question) => {
    setInputMessage(question);
  };

  const quickQuestions = [
    "How can I improve my resume?",
    "What should I ask in an interview?",
    "How do I negotiate salary?",
    "What skills should I learn?",
    "How to write a cover letter?",
    "Tips for job searching?",
  ];

  const formatTimestamp = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
              <AIIcon />
            </Avatar>
            <Box>
              <Typography variant="h5">
                AI Career Assistant
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Your personal career advisor powered by AI
              </Typography>
            </Box>
          </Box>
          
          <Box>
            <Tooltip title="Clear conversation">
              <IconButton onClick={clearChat}>
                <ClearIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Refresh context">
              <IconButton onClick={loadUserContext}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Paper>

      {/* User Context Summary */}
      {userContext.profile && (
        <Paper elevation={1} sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}>
          <Typography variant="subtitle2" gutterBottom>
            Your Profile Summary
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Chip 
                icon={<WorkIcon />} 
                label={`${userContext.totalApplications} Applications`} 
                size="small" 
                variant="outlined"
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <Chip 
                icon={<TrendingUpIcon />} 
                label={`${userContext.successRate}% Success Rate`} 
                size="small" 
                variant="outlined"
                color={userContext.successRate > 20 ? 'success' : 'default'}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <Chip 
                icon={<PersonIcon />} 
                label={userContext.profile.role === 'admin' ? 'Admin' : 'User'} 
                size="small" 
                variant="outlined"
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <Chip 
                icon={<AIIcon />} 
                label="AI Ready" 
                size="small" 
                variant="outlined"
                color="primary"
              />
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Quick Questions */}
      <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Quick Questions
        </Typography>
        <Box display="flex" flexWrap="wrap" gap={1}>
          {quickQuestions.map((question, index) => (
            <Chip
              key={index}
              label={question}
              onClick={() => handleQuickQuestion(question)}
              variant="outlined"
              size="small"
              clickable
            />
          ))}
        </Box>
      </Paper>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Chat Messages */}
      <Paper 
        elevation={2} 
        sx={{ 
          flex: 1, 
          p: 2, 
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          mb: 2
        }}
      >
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {messages.map((message) => (
            <Box key={message.id} sx={{ mb: 2 }}>
              <Box
                display="flex"
                justifyContent={message.type === 'user' ? 'flex-end' : 'flex-start'}
                alignItems="flex-start"
                gap={1}
              >
                {message.type === 'ai' && (
                  <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                    <AIIcon fontSize="small" />
                  </Avatar>
                )}
                
                <Card
                  sx={{
                    maxWidth: '70%',
                    bgcolor: message.type === 'user' ? 'primary.main' : 'background.paper',
                    color: message.type === 'user' ? 'primary.contrastText' : 'text.primary',
                  }}
                >
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                      {message.content}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        display: 'block', 
                        mt: 1, 
                        opacity: 0.7,
                        textAlign: message.type === 'user' ? 'right' : 'left'
                      }}
                    >
                      {formatTimestamp(message.timestamp)}
                    </Typography>
                  </CardContent>
                </Card>

                {message.type === 'user' && (
                  <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}>
                    <PersonIcon fontSize="small" />
                  </Avatar>
                )}
              </Box>
            </Box>
          ))}
          
          {loading && (
            <Box display="flex" alignItems="center" gap={1} sx={{ mb: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                <AIIcon fontSize="small" />
              </Avatar>
              <Card>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <CircularProgress size={16} />
                    <Typography variant="body2" color="text.secondary">
                      AI is thinking...
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          )}
          
          <div ref={messagesEndRef} />
        </Box>
      </Paper>

      {/* Message Input */}
      <Paper elevation={2} sx={{ p: 2 }}>
        <Box display="flex" gap={1} alignItems="flex-end">
          <TextField
            fullWidth
            multiline
            maxRows={4}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about your career..."
            variant="outlined"
            disabled={loading}
          />
          <Button
            variant="contained"
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || loading}
            sx={{ minWidth: 'auto', p: 1.5 }}
          >
            <SendIcon />
          </Button>
        </Box>
        
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Press Enter to send, Shift+Enter for new line
        </Typography>
      </Paper>
    </Box>
  );
}

export default AICareerAssistant;