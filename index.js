const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const cors = require('cors');  // CORS middleware
const fetch = require('node-fetch'); // Polyfill fetch for Node.js

global.fetch = fetch; // Set global fetch

dotenv.config();

const app = express();
app.use(cors()); // Enable CORS

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// Expanded patterns with more specific categories
function analyzePromptType(text) {
  const lowercaseText = text.toLowerCase();
  
  const patterns = {
    nextjs: ['next.js', 'nextjs', 'next js'],
    react: ['react', 'vite', 'frontend app'],
    vue: ['vue', 'vuejs', 'nuxt'],
    angular: ['angular', 'ng'],
    mobileApp: ['mobile', 'ios', 'android', 'flutter', 'react native', 'expo'],
    api: ['api', 'backend', 'server', 'endpoint', 'microservice', 'rest', 'graphql', 'express'],
    database: ['database', 'db', 'schema', 'data model', 'mongodb', 'postgresql', 'mysql', 'sqlite'],
    auth: ['auth', 'login', 'register', 'user', 'account', 'authentication', 'oauth'],
    blog: ['blog', 'cms', 'content', 'articles', 'posts', 'writer', 'markdown'],
    ecommerce: ['shop', 'store', 'product', 'cart', 'checkout', 'payment', 'order', 'inventory'],
    dashboard: ['dashboard', 'admin', 'analytics', 'metrics', 'monitor', 'stats', 'reporting'],
    ai: ['ai', 'ml', 'machine learning', 'chatbot', 'bot', 'nlp', 'gpt', 'openai'],
    game: ['game', 'gaming', '2d game', '3d game', 'multiplayer', 'unity', 'gamedev'],
    social: ['social', 'community', 'forum', 'chat', 'messaging', 'network', 'friends'],
    landing: ['landing', 'portfolio', 'showcase', 'promotional'],
    tools: ['tool', 'utility', 'generator', 'converter', 'calculator', 'extension'],
    devops: ['ci/cd', 'pipeline', 'docker', 'kubernetes', 'deployment', 'aws', 'cloud'],
    testing: ['test', 'testing', 'jest', 'cypress', 'qa', 'quality'],
    chrome: ['chrome extension', 'browser extension', 'firefox addon'],
    desktop: ['electron', 'desktop app', 'tauri', 'windows app', 'mac app'],
    scraping: ['scraper', 'crawler', 'automation', 'puppeteer', 'selenium'],
    cms: ['wordpress', 'drupal', 'joomla', 'strapi', 'headless cms'],
    booking: ['booking', 'reservation', 'appointment', 'schedule', 'calendar'],
    ui: ['ui design', 'user interface', 'interface design', 'visual design'],
    ux: ['ux design', 'user experience', 'experience design'],
    branding: ['branding', 'logo design', 'brand identity', 'visual identity'],
    typography: ['typography', 'font choices', 'type design'],
    color: ['color scheme', 'color palette', 'color theory'],
    layout: ['layout design', 'grid system', 'responsive design'],
    wireframe: ['wireframe', 'mockup', 'prototype', 'sketch'],
    iconography: ['icon design', 'icon set', 'symbols'],
    illustration: ['illustration', 'graphic design', 'digital art']
  };

  // Check for invalid/personal questions
  const invalidPatterns = [
    'who are you'
  ];

  if (invalidPatterns.some(pattern => lowercaseText.includes(pattern))) {
    return 'invalid';
  }
  
  for (const [type, keywords] of Object.entries(patterns)) {
    if (keywords.some(keyword => lowercaseText.includes(keyword))) {
      return type;
    }
  }
  
  return 'general';
}

app.get('/enhance', async (req, res) => {
  try {
    const userPrompt = req.query.prompt?.trim();
    
    if (!userPrompt || userPrompt.length < 5) {
      return res.status(400).json({
        error: 'Please provide a valid prompt with at least 5 characters'
      });
    }

    const promptType = analyzePromptType(userPrompt);
    
    if (promptType === 'invalid') {
      return res.status(400).json({
        error: 'Please provide a development or creation-related prompt instead of a question'
      });
    }

    let promptTemplate = `Enhance this development prompt for an AI system: "${userPrompt}"

    Create a focused, medium-length prompt that covers key requirements. Make it:
    - Clear and specific
    - 3-4 main sections maximum
    - No more than 10-12 bullet points total
    - Focus on core features only
    
    Important rules:
    - Keep descriptions brief but clear
    - No implementation details or code
    - No technical jargon unless necessary
    - Use simple bullet points
    - Focus on WHAT to build, not HOW
    
    Key aspects for this ${promptType} project:
    ${getTypeSpecificPoints(promptType)}
    
    Write a natural, focused prompt that can be easily copied into another AI system.`;

    const result = await model.generateContent(promptTemplate);
    let response = result.response.text()
      .replace(/```.*?```/gs, '')
      .replace(/\*\*/g, '')
      .replace(/^["']|["']$/g, '')
      .replace(/\\n/g, '\n')
      .replace(/^Enhanced prompt:?\s*/i, '')
      .replace(/^Prompt:?\s*/i, '')
      .trim();

    res.setHeader('Content-Type', 'text/plain');
    res.send(response);

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      error: 'Failed to enhance prompt'
    });
  }
});

function getTypeSpecificPoints(type) {
  const points = {
    nextjs: `
    - Core pages and layouts
    - Key features and interactions
    - Data handling approach`,
    
    react: `
    - Component structure
    - State management
    - User interactions`,
    
    vue: `
    - Component structure
    - Vuex state management
    - Routing setup`,
    
    angular: `
    - Module organization
    - Key components and services
    - Routing and guards`,

    mobileApp: `
    - Core user flows
    - Device features to utilize
    - Platform-specific considerations`,

    api: `
    - Main endpoints
    - Data structures
    - Auth requirements`,

    database: `
    - Core models
    - Essential relationships
    - Main fields`,

    auth: `
    - User roles and permissions
    - Authentication flows
    - Security measures`,

    blog: `
    - Content features
    - User roles
    - Core pages`,

    ecommerce: `
    - Product features
    - Checkout flow
    - Order management`,

    dashboard: `
    - Key metrics
    - Main views
    - User controls`,

    ai: `
    - AI capabilities
    - User interactions
    - Core features`,

    game: `
    - Game mechanics
    - Player interactions
    - Level design`,

    social: `
    - User features
    - Content sharing
    - Interactions`,

    landing: `
    - Key sections
    - Content blocks
    - Call-to-actions`,

    tools: `
    - Main functionality
    - Input/output
    - User options`,

    devops: `
    - CI/CD processes
    - Deployment strategies
    - Monitoring solutions`,

    testing: `
    - Testing strategies
    - Tools to use
    - Key scenarios to cover`,

    chrome: `
    - Features of the extension
    - User interactions
    - API integrations`,

    desktop: `
    - Main functionalities
    - User interface design
    - System requirements`,

    scraping: `
    - Target data sources
    - Scraping techniques
    - Data storage options`,

    cms: `
    - Content structure
    - User roles and permissions
    - Core features`,

    booking: `
    - Key features
    - User workflow
    - Notification system`,

    general: `
    - Core features
    - User interactions
    - Key requirements`
  };

  return points[type] || points.general;
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
