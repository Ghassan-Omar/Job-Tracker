// // AI Service for Job Tracker Application


class AIService {
  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
    this.baseURL = 'https://generativelanguage.googleapis.com/v1beta';
    this.model = 'gemini-1.5-flash'; // Free tier model
  }

  /**
   * Make a request to Google Gemini API
   * @param {string} prompt - The prompt to send to Gemini
   * @param {Object} options - Additional options
   * @returns {Promise<string>} API response
   */
  async makeRequest(prompt, options = {}) {
    try {
      const requestBody = {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: options.temperature || 0.7,
          topK: options.topK || 40,
          topP: options.topP || 0.95,
          maxOutputTokens: options.maxOutputTokens || 2048,
        }
      };

      const response = await fetch(
        `${this.baseURL}/models/${this.model}:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Gemini API request failed: ${response.status} - ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('Invalid response format from Gemini API');
      }

      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('AI Service Error:', error);
      throw error;
    }
  }

  /**
   * Analyze resume and provide feedback
   * @param {string} resumeText - Resume content
   * @param {string} targetRole - Target job role (optional)
   * @returns {Promise<Object>} Resume analysis and feedback
   */
  async analyzeResume(resumeText, targetRole = '') {
    const prompt = `As an expert career advisor and resume reviewer with 15+ years of experience in career development and growth, analyze the following resume and provide comprehensive feedback.

${targetRole ? `Target Role: ${targetRole}` : ''}

Resume Content:
${resumeText}

Please provide a detailed analysis including:

1. **Overall Assessment** (score out of 10)
2. **Strengths** (what's working well)
3. **Areas for Improvement** (specific suggestions)
4. **Missing Elements** (what should be added)
5. **Formatting & Structure** (layout and organization feedback)
6. **Keywords & ATS Optimization** (for applicant tracking systems)
7. **Industry-Specific Recommendations** (if target role is provided)
8. **Action Items** (prioritized list of improvements)

Format your response as a structured JSON object with these sections.
Be specific, actionable, and constructive in your feedback.
`;

    try {
      const response = await this.makeRequest(prompt, {
        temperature: 0.7,
        maxOutputTokens: 2000,
      });

      // Try to parse as JSON, fallback to structured text
      try {
        // Clean the response to extract JSON if it's wrapped in markdown
        const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) || response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[1] || jsonMatch[0]);
        }
        return JSON.parse(response);
      } catch {
        return {
          analysis: response,
          score: 'N/A',
          type: 'text_analysis'
        };
      }
    } catch (error) {
      throw new Error(`Resume analysis failed: ${error.message}`);
    }
  }

  /**
   * Analyze job description and extract key information
   * @param {string} jobDescription - Job posting content
   * @returns {Promise<Object>} Job analysis results
   */
  async analyzeJobDescription(jobDescription) {
    const prompt = `
Analyze the following job description and extract key information to help job seekers understand the role better.

Job Description:
${jobDescription}

Please provide a comprehensive analysis including:

1. **Role Summary** (brief overview)
2. **Key Responsibilities** (main duties and tasks)
3. **Required Skills** (must-have technical and soft skills)
4. **Preferred Qualifications** (nice-to-have skills)
5. **Experience Level** (entry, mid, senior level)
6. **Company Culture Indicators** (what the posting reveals about company culture)
7. **Salary Range Estimate** (if not mentioned, provide market estimate)
8. **Application Tips** (how to tailor application for this role)
9. **Red Flags** (any concerning aspects to be aware of)
10. **Match Score Factors** (what candidates should emphasize)

Format as a structured JSON object. Be thorough and insightful.
`;

    try {
      const response = await this.makeRequest(prompt, {
        temperature: 0.7,
        maxOutputTokens: 2000,
      });

      try {
        const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) || response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[1] || jsonMatch[0]);
        }
        return JSON.parse(response);
      } catch {
        return {
          analysis: response,
          type: 'text_analysis'
        };
      }
    } catch (error) {
      throw new Error(`Job description analysis failed: ${error.message}`);
    }
  }

  /**
   * Generate career insights and recommendations
   * @param {Object} userProfile - User's career profile
   * @param {Array} jobApplications - User's job applications
   * @returns {Promise<Object>} Career insights and recommendations
   */
  async generateCareerInsights(userProfile, jobApplications) {
    const prompt = `
As a senior career strategist, analyze the following career profile and job application history to provide personalized career insights and recommendations.

User Profile:
${JSON.stringify(userProfile, null, 2)}

Recent Job Applications:
${JSON.stringify(jobApplications.slice(0, 10), null, 2)}

Please provide comprehensive career insights including:

1. **Career Trajectory Analysis** (current path and progression)
2. **Market Position** (how competitive the candidate is)
3. **Skill Gap Analysis** (skills to develop)
4. **Industry Trends** (relevant to their field)
5. **Networking Recommendations** (strategic connections to make)
6. **Personal Branding Suggestions** (how to position themselves)
7. **Short-term Goals** (next 6-12 months)
8. **Long-term Strategy** (2-5 year career plan)
9. **Application Strategy** (how to improve success rate)
10. **Professional Development** (courses, certifications, experiences)

Format as a structured JSON object with actionable recommendations.
`;

    try {
      const response = await this.makeRequest(prompt, {
        temperature: 0.8,
        maxOutputTokens: 2500,
      });

      try {
        const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) || response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[1] || jsonMatch[0]);
        }
        return JSON.parse(response);
      } catch {
        return {
          insights: response,
          type: 'text_insights'
        };
      }
    } catch (error) {
      throw new Error(`Career insights generation failed: ${error.message}`);
    }
  }

  /**
   * Chat with AI career assistant
   * @param {Array} messages - Conversation history
   * @param {Object} context - User context (profile, applications, etc.)
   * @returns {Promise<string>} AI assistant response
   */
  async chatWithAssistant(messages, context = {}) {
    const conversationHistory = messages.map(msg => 
      `${msg.role === 'user' ? 'user' : 'assistant'}: ${msg.content}`
    ).join('\n\n');

    const prompt = `
You are an expert AI career assistant helping job seekers with their career development and job search. You have access to the user's profile and job application history.

User Context:
${JSON.stringify(context, null, 2)}

Conversation date:
${conversationHistory}

Guidelines:
- Be helpful, encouraging, and professional
- Provide specific, actionable advice
- Reference the user's context when relevant
- Ask clarifying questions when needed
- Keep responses concise but comprehensive
- Focus on practical career and job search advice
- Be supportive and motivational

You can help with:
- Resume and cover letter advice
- Interview preparation
- Job search strategies
- Career planning and development
- Skill development recommendations
- Networking advice
- Salary negotiation
- Industry insights
- Application tracking and follow-up strategies
`;

    try {
      const response = await this.makeRequest(prompt, {
        temperature: 0.8,
        maxOutputTokens: 1000,
      });

      return response;
    } catch (error) {
      throw new Error(`AI assistant chat failed: ${error.message}`);
    }
  }

  /**
   * Generate interview questions based on job description
   * @param {string} jobDescription - Job posting content
   * @param {string} resumeText - User's resume (optional)
   * @returns {Promise<Array>} List of potential interview questions
   */
  async generateInterviewQuestions(jobDescription, resumeText = '') {
    const prompt = `
Based on the following job description${resumeText ? ' and candidate resume' : ''}, generate a comprehensive list of potential interview questions the candidate should prepare for.

Job Description:
${jobDescription}

${resumeText ? `Candidate Resume:\n${resumeText}` : ''}

Generate questions in these categories:
1. **Technical Questions** (role-specific skills)
2. **Behavioral Questions** (STAR method scenarios)
3. **Company/Role Fit Questions** (culture and motivation)
4. **Situational Questions** (problem-solving scenarios)
5. **Questions About Experience** (based on resume if provided)

For each question, also provide:
- Brief guidance on how to approach the answer
- Key points to emphasize

Format as a structured JSON array with categories.
`;

    try {
      const response = await this.makeRequest(prompt, {
        temperature: 0.7,
        maxOutputTokens: 2000,
      });

      try {
        const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) || response.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[1] || jsonMatch[0]);
        }
        return JSON.parse(response);
      } catch {
        return {
          questions: response,
          type: 'text_questions'
        };
      }
    } catch (error) {
      throw new Error(`Interview questions generation failed: ${error.message}`);
    }
  }
}

// Create and export a singleton instance
const aiService = new AIService();
export default aiService;
















// // Integrates with OpenAI API for various AI-powered features

// class AIService {
//   constructor() {
//     this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
//     this.baseURL = import.meta.env.VITE_OPENAI_API_BASE || 'https://api.openai.com/v1';
//   }

//   /**
//    * Make a request to OpenAI API
//    * @param {string} endpoint - API endpoint
//    * @param {Object} data - Request data
//    * @returns {Promise<Object>} API response
//    */
//   async makeRequest(endpoint, data) {
//     try {
//       const response = await fetch(`${this.baseURL}${endpoint}`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${this.apiKey}`,
//         },
//         body: JSON.stringify(data),
//       });

//       if (!response.ok) {
//         throw new Error(`API request failed: ${response.status} ${response.statusText}`);
//       }

//       return await response.json();
//     } catch (error) {
//       console.error('AI Service Error:', error);
//       throw error;
//     }
//   }


  
//   /**
//    * Analyze resume and provide feedback
//    * @param {string} resumeText - Resume content
//    * @param {string} targetRole - Target job role (optional)
//    * @returns {Promise<Object>} Resume analysis and feedback
//    */
//   async analyzeResume(resumeText, targetRole = '') {
//     const prompt = `
// As an expert career advisor and resume reviewer, analyze the following resume and provide comprehensive feedback.

// ${targetRole ? `Target Role: ${targetRole}` : ''}

// Resume Content:
// ${resumeText}

// Please provide a detailed analysis including:

// 1. **Overall Assessment** (score out of 10)
// 2. **Strengths** (what's working well)
// 3. **Areas for Improvement** (specific suggestions)
// 4. **Missing Elements** (what should be added)
// 5. **Formatting & Structure** (layout and organization feedback)
// 6. **Keywords & ATS Optimization** (for applicant tracking systems)
// 7. **Industry-Specific Recommendations** (if target role is provided)
// 8. **Action Items** (prioritized list of improvements)

// Format your response as a structured JSON object with these sections.
// Be specific, actionable, and constructive in your feedback.
// `;

//     try {
//       const response = await this.makeRequest('/chat/completions', {
//         model: 'gpt-4',
//         messages: [
//           {
//             role: 'system',
//             content: 'You are an expert career advisor and resume reviewer with 15+ years of experience in recruitment and career development. Provide detailed, actionable feedback to help job seekers improve their resumes.'
//           },
//           {
//             role: 'user',
//             content: prompt
//           }
//         ],
//         temperature: 0.7,
//         max_tokens: 200,
//       });

//       const content = response.choices[0].message.content;
      
//       // Try to parse as JSON, fallback to structured text
//       try {
//         return JSON.parse(content);
//       } catch {
//         return {
//           analysis: content,
//           score: 'N/A',
//           type: 'text_analysis'
//         };
//       }
//     } catch (error) {
//       throw new Error(`Resume analysis failed: ${error.message}`);
//     }
//   }

//   /**
//    * Analyze job description and extract key information
//    * @param {string} jobDescription - Job posting content
//    * @returns {Promise<Object>} Job analysis results
//    */
//   async analyzeJobDescription(jobDescription) {
//     const prompt = `
// Analyze the following job description and extract key information to help job seekers understand the role better.

// Job Description:
// ${jobDescription}

// Please provide a comprehensive analysis including:

// 1. **Role Summary** (brief overview)
// 2. **Key Responsibilities** (main duties and tasks)
// 3. **Required Skills** (must-have technical and soft skills)
// 4. **Preferred Qualifications** (nice-to-have skills)
// 5. **Experience Level** (entry, mid, senior level)
// 6. **Company Culture Indicators** (what the posting reveals about company culture)
// 7. **Salary Range Estimate** (if not mentioned, provide market estimate)
// 8. **Application Tips** (how to tailor application for this role)
// 9. **Red Flags** (any concerning aspects to be aware of)
// 10. **Match Score Factors** (what candidates should emphasize)

// Format as a structured JSON object. Be thorough and insightful.
// `;

//     try {
//       const response = await this.makeRequest('/chat/completions', {
//         model: 'gpt-4',
//         messages: [
//           {
//             role: 'system',
//             content: 'You are an expert recruiter and career advisor who helps job seekers understand job postings and improve their application success rate.'
//           },
//           {
//             role: 'user',
//             content: prompt
//           }
//         ],
//         temperature: 0.7,
//         max_tokens: 200,
//       });

//       const content = response.choices[0].message.content;
      
//       try {
//         return JSON.parse(content);
//       } catch {
//         return {
//           analysis: content,
//           type: 'text_analysis'
//         };
//       }
//     } catch (error) {
//       throw new Error(`Job description analysis failed: ${error.message}`);
//     }
//   }

//   /**
//    * Generate career insights and recommendations
//    * @param {Object} userProfile - User's career profile
//    * @param {Array} jobApplications - User's job applications
//    * @returns {Promise<Object>} Career insights and recommendations
//    */
//   async generateCareerInsights(userProfile, jobApplications) {
//     const prompt = `
// As a senior career strategist, analyze the following career profile and job application history to provide personalized career insights and recommendations.

// User Profile:
// ${JSON.stringify(userProfile, null, 2)}

// Recent Job Applications:
// ${JSON.stringify(jobApplications.slice(0, 10), null, 2)}

// Please provide comprehensive career insights including:

// 1. **Career Trajectory Analysis** (current path and progression)
// 2. **Market Position** (how competitive the candidate is)
// 3. **Skill Gap Analysis** (skills to develop)
// 4. **Industry Trends** (relevant to their field)
// 5. **Networking Recommendations** (strategic connections to make)
// 6. **Personal Branding Suggestions** (how to position themselves)
// 7. **Short-term Goals** (next 6-12 months)
// 8. **Long-term Strategy** (2-5 year career plan)
// 9. **Application Strategy** (how to improve success rate)
// 10. **Professional Development** (courses, certifications, experiences)

// Format as a structured JSON object with actionable recommendations.
// `;

//     try {
//       const response = await this.makeRequest('/chat/completions', {
//         model: 'gpt-4',
//         messages: [
//           {
//             role: 'system',
//             content: 'You are a senior career strategist and executive coach with expertise in career development, market trends, and professional growth strategies.'
//           },
//           {
//             role: 'user',
//             content: prompt
//           }
//         ],
//         temperature: 0.8,
//         max_tokens: 250,
//       });

//       const content = response.choices[0].message.content;
      
//       try {
//         return JSON.parse(content);
//       } catch {
//         return {
//           insights: content,
//           type: 'text_insights'
//         };
//       }
//     } catch (error) {
//       throw new Error(`Career insights generation failed: ${error.message}`);
//     }
//   }

//   /**
//    * Chat with AI career assistant
//    * @param {Array} messages - Conversation history
//    * @param {Object} context - User context (profile, applications, etc.)
//    * @returns {Promise<string>} AI assistant response
//    */
//   async chatWithAssistant(messages, context = {}) {
//     const systemPrompt = `
// You are an expert AI career assistant helping job seekers with their career development and job search. You have access to the user's profile and job application history.

// User Context:
// ${JSON.stringify(context, null, 2)}

// Guidelines:
// - Be helpful, encouraging, and professional
// - Provide specific, actionable advice
// - Reference the user's context when relevant
// - Ask clarifying questions when needed
// - Keep responses concise but comprehensive
// - Focus on practical career and job search advice
// - Be supportive and motivational

// You can help with:
// - Resume and cover letter advice
// - Interview preparation
// - Job search strategies
// - Career planning and development
// - Skill development recommendations
// - Networking advice
// - Salary negotiation
// - Industry insights
// - Application tracking and follow-up strategies
// `;

//     try {
//       const response = await this.makeRequest('/chat/completions', {
//         model: 'gpt-4',
//         messages: [
//           {
//             role: 'system',
//             content: systemPrompt
//           },
//           ...messages
//         ],
//         temperature: 0.8,
//         max_tokens: 100,
//       });

//       return response.choices[0].message.content;
//     } catch (error) {
//       throw new Error(`AI assistant chat failed: ${error.message}`);
//     }
//   }

//   /**
//    * Generate interview questions based on job description
//    * @param {string} jobDescription - Job posting content
//    * @param {string} resumeText - User's resume (optional)
//    * @returns {Promise<Array>} List of potential interview questions
//    */
//   async generateInterviewQuestions(jobDescription, resumeText = '') {
//     const prompt = `
// Based on the following job description${resumeText ? ' and candidate resume' : ''}, generate a comprehensive list of potential interview questions the candidate should prepare for.

// Job Description:
// ${jobDescription}

// ${resumeText ? `Candidate Resume:\n${resumeText}` : ''}

// Generate questions in these categories:
// 1. **Technical Questions** (role-specific skills)
// 2. **Behavioral Questions** (STAR method scenarios)
// 3. **Company/Role Fit Questions** (culture and motivation)
// 4. **Situational Questions** (problem-solving scenarios)
// 5. **Questions About Experience** (based on resume if provided)

// For each question, also provide:
// - Brief guidance on how to approach the answer
// - Key points to emphasize

// Format as a structured JSON array with categories.
// `;

//     try {
//       const response = await this.makeRequest('/chat/completions', {
//         model: 'gpt-4',
//         messages: [
//           {
//             role: 'system',
//             content: 'You are an expert interview coach who helps candidates prepare for job interviews by predicting likely questions and providing guidance.'
//           },
//           {
//             role: 'user',
//             content: prompt
//           }
//         ],
//         temperature: 0.7,
//         max_tokens: 200,
//       });

//       const content = response.choices[0].message.content;
      
//       try {
//         return JSON.parse(content);
//       } catch {
//         return {
//           questions: content,
//           type: 'text_questions'
//         };
//       }
//     } catch (error) {
//       throw new Error(`Interview questions generation failed: ${error.message}`);
//     }
//   }
// }

// Create and export a singleton instance
// const aiService = new AIService();
// export default aiService;





// trying Gemini API

// import { GoogleGenerativeAI } from "@google/generative-ai";
// import { SYSTEM_PROMPTS, USER_PROMPTS } from "./prompts";

// class AIService {
//   constructor() {
//     this.apiKey = import.meta.env.VITE_GEMINI_API_KEY;
//     if (!this.apiKey) {
//       console.error("GEMINI_API_KEY is not set in environment variables.");
//       throw new Error("GEMINI_API_KEY is not set.");
//     }
//     this.genAI = new GoogleGenerativeAI(this.apiKey);
//     this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" }); // Using gemini-pro as a general model
//   }

//   /**
//    * Generic method to make requests to the Gemini API
//    * @param {Array} messages - Array of messages for chat completion
//    * @param {Object} generationConfig - Configuration for content generation
//    * @returns {Promise<Object>} API response
//    */
//   async _callApi(messages, generationConfig = {}) {
//     try {
//       const chat = this.model.startChat({
//         history: messages.slice(0, -1), // All but the last message are history
//         generationConfig: generationConfig,
//       });
//       const result = await chat.sendMessage(messages[messages.length - 1].parts);
//       const content = result.response.text();

//       try {
//         return JSON.parse(content);
//       } catch (jsonError) {
//         // If parsing fails, return the raw text content and indicate it\\'s not JSON
//         return { rawText: content, isJson: false };
//       }
//     } catch (error) {
//       console.error("Gemini Service Error:", error);
//       throw error;
//     }
//   }

//   /**
//    * Analyze resume and provide feedback
//    * @param {string} resumeText - Resume content
//    * @param {string} targetRole - Target job role (optional)
//    * @returns {Promise<Object>} Resume analysis and feedback
//    */
//   async analyzeResume(resumeText, targetRole = "") {
//     const messages = [
//       { role: "user", parts: [{ text: SYSTEM_PROMPTS.resumeAdvisor }] },
//       { role: "model", parts: [{ text: "Okay, I understand. I will provide a detailed analysis of the resume based on the target role and resume content." }] },
//       { role: "user", parts: [{ text: USER_PROMPTS.analyzeResume(resumeText, targetRole) }] }
//     ];

//     try {
//       const result = await this._callApi(messages, { temperature: 0.7 });
//       if (result.isJson === false) {
//         return { analysis: result.rawText, score: "N/A", type: "text_analysis" };
//       }
//       return result;
//     } catch (error) {
//       throw new Error(`Resume analysis failed: ${error.message}`);
//     }
//   }

//   /**
//    * Analyze job description and extract key information
//    * @param {string} jobDescription - Job posting content
//    * @returns {Promise<Object>} Job analysis results
//    */
//   async analyzeJobDescription(jobDescription) {
//     const messages = [
//       { role: "user", parts: [{ text: SYSTEM_PROMPTS.jobDescriptionAnalyzer }] },
//       { role: "model", parts: [{ text: "Okay, I understand. I will provide a detailed analysis of the job description." }] },
//       { role: "user", parts: [{ text: USER_PROMPTS.analyzeJobDescription(jobDescription) }] }
//     ];

//     try {
//       const result = await this._callApi(messages, { temperature: 0.7 });
//       if (result.isJson === false) {
//         return { analysis: result.rawText, type: "text_analysis" };
//       }
//       return result;
//     } catch (error) {
//       throw new Error(`Job description analysis failed: ${error.message}`);
//     }
//   }

//   /**
//    * Generate career insights and recommendations
//    * @param {Object} userProfile - User\\'s career profile
//    * @param {Array} jobApplications - User\\'s job applications
//    * @returns {Promise<Object>} Career insights and recommendations
//    */
//   async generateCareerInsights(userProfile, jobApplications) {
//     const messages = [
//       { role: "user", parts: [{ text: SYSTEM_PROMPTS.careerStrategist }] },
//       { role: "model", parts: [{ text: "Okay, I understand. I will provide personalized career insights and recommendations based on the provided profile and job applications." }] },
//       { role: "user", parts: [{ text: USER_PROMPTS.generateCareerInsights(userProfile, jobApplications) }] }
//     ];

//     try {
//       const result = await this._callApi(messages, { temperature: 0.8 });
//       if (result.isJson === false) {
//         return { insights: result.rawText, type: "text_insights" };
//       }
//       return result;
//     } catch (error) {
//       throw new Error(`Career insights generation failed: ${error.message}`);
//     }
//   }

//   /**
//    * Chat with AI career assistant
//    * @param {Array} messages - Conversation history
//    * @param {Object} context - User context (profile, applications, etc.)
//    * @returns {Promise<string>} AI assistant response
//    */
//   async chatWithAssistant(messages, context = {}) {
//     const systemMessage = USER_PROMPTS.chatAssistantContext(context);

//     // Convert messages to Gemini format and add system message
//     const geminiMessages = [
//       { role: "user", parts: [{ text: SYSTEM_PROMPTS.careerAssistant }] },
//       { role: "model", parts: [{ text: "Okay, I understand. I am ready to assist you with your career development and job search." }] },
//       { role: "user", parts: [{ text: systemMessage }] },
//       ...messages.map(msg => ({
//         role: msg.role === "user" ? "user" : "model",
//         parts: [{ text: msg.content }],
//       })),
//     ];

//     try {
//       const result = await this._callApi(geminiMessages, { temperature: 0.8 });
//       return result.rawText; // Chat responses are typically raw text
//     } catch (error) {
//       throw new Error(`AI assistant chat failed: ${error.message}`);
//     }
//   }

//   /**
//    * Generate interview questions based on job description
//    * @param {string} jobDescription - Job posting content
//    * @param {string} resumeText - User\\'s resume (optional)
//    * @returns {Promise<Array>} List of potential interview questions
//    */
//   async generateInterviewQuestions(jobDescription, resumeText = '') {
//     const messages = [
//       { role: "user", parts: [{ text: SYSTEM_PROMPTS.interviewCoach }] },
//       { role: "model", parts: [{ text: "Okay, I understand. I will provide a detailed list of interview questions." }] },
//       { role: "user", parts: [{ text: USER_PROMPTS.generateInterviewQuestions(jobDescription, resumeText) }] }
//     ];

//     try {
//       const result = await this._callApi(messages, { temperature: 0.7 });
//       if (result.isJson === false) {
//         return { questions: result.rawText, type: "text_questions" };
//       }
//       return result;
//     } catch (error) {
//       throw new Error(`Interview questions generation failed: ${error.message}`);
//     }
//   }
// }

// // Create and export a singleton instance
// const aiService = new AIService();
// export default aiService;



// gemini API  
// AI Service for Job Tracker Application
// Integrates with Google Gemini API for various AI-powered features
