const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const cors = require('cors');
const fetch = require('node-fetch');

// Make fetch globally available
global.fetch = fetch;

dotenv.config();

const app = express();
app.use(cors()); // Enable CORS for all routes

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

function analyzePromptContext(text) {
  const lowercaseText = text.toLowerCase();
  
  // Detect prompt category
  const categories = {
    development: {
      type: 'development',
      indicators: ['app', 'website', 'code', 'develop', 'api', 'backend', 'frontend'],
      techStack: {
        nextjs: text.includes('nextjs') || text.includes('next.js'),
        react: text.includes('react'),
        vue: text.includes('vue'),
        shadcn: text.includes('shadcn'),
        tailwind: text.includes('tailwind'),
      }
    },
    image: {
      type: 'image',
      indicators: ['draw', 'generate image', 'art', 'illustration', 'photo', 'picture', 'design logo'],
      styles: {
        realistic: text.includes('realistic') || text.includes('photorealistic'),
        artistic: text.includes('artistic') || text.includes('stylized'),
        cartoon: text.includes('cartoon') || text.includes('anime')
      }
    },
    writing: {
      type: 'writing',
      indicators: ['write', 'blog', 'article', 'story', 'essay', 'script'],
      styles: {
        formal: text.includes('formal') || text.includes('professional'),
        creative: text.includes('creative') || text.includes('story'),
        technical: text.includes('technical') || text.includes('documentation')
      }
    },
    marketing: {
      type: 'marketing',
      indicators: ['marketing', 'ad', 'campaign', 'social media', 'promotion'],
      platforms: {
        social: text.includes('social') || text.includes('instagram') || text.includes('twitter'),
        email: text.includes('email') || text.includes('newsletter'),
        ads: text.includes('ad') || text.includes('advertisement')
      }
    },
    ai: {
      type: 'ai',
      indicators: ['chatbot', 'ai model', 'prompt', 'gpt', 'machine learning'],
      focus: {
        prompting: text.includes('prompt') || text.includes('instruction'),
        model: text.includes('model') || text.includes('train'),
        interaction: text.includes('chat') || text.includes('conversation')
      }
    }
  };

  // Find matching category
  for (const [key, category] of Object.entries(categories)) {
    if (category.indicators.some(indicator => lowercaseText.includes(indicator))) {
      return { category: key, details: category };
    }
  }

  return { category: 'general', details: null };
}

function generateEnhancementTemplate(analysis, userPrompt) {
  const { category, details } = analysis;

  let categorySpecificGuide = '';

  switch(category) {
    case 'development':
      const { techStack } = details;
      categorySpecificGuide = `
Development Focus:
- Architecture and structure
- User interface and experience
- Core features and functionality
- Technical requirements
${techStack.nextjs ? '- Next.js routing and components\n- Server vs client components' : ''}
${techStack.shadcn ? '- UI component selection\n- Theme and styling patterns' : ''}`;
      break;

    case 'image':
      categorySpecificGuide = `
Visual Focus:
- Subject and composition
- Style and mood
- Color palette and lighting
- Technical specifications
- Environmental details
- Specific visual elements`;
      break;

    case 'writing':
      categorySpecificGuide = `
Writing Focus:
- Tone and style
- Structure and flow
- Key points and message
- Target audience
- Supporting details
- Format specifications`;
      break;

    case 'marketing':
      categorySpecificGuide = `
Marketing Focus:
- Target audience
- Key message and value proposition
- Call to action
- Platform-specific requirements
- Brand voice and tone
- Campaign context`;
      break;

    case 'ai':
      categorySpecificGuide = `
AI Focus:
- Clear instructions and constraints
- Desired output format
- Important parameters
- Context and requirements
- Edge cases to handle
- Quality criteria`;
      break;

    default:
      categorySpecificGuide = `
General Enhancement:
- Key details and specifications
- Context and requirements
- Quality criteria
- Desired outcome
- Important parameters`;
  }

  return `Enhance this ${category} prompt to be more detailed and effective:
"${userPrompt}"

${categorySpecificGuide}

Enhancement Rules:
- Maintain original intent while adding detail
- Be specific but flexible
- Focus on desired outcomes
- Add relevant context
- Keep natural language flow
- Don't include explanations or metadata

Generate an enhanced prompt that provides clear, detailed instructions while maintaining a natural style.`;
}

app.get('/enhance', async (req, res) => {
  try {
    const userPrompt = req.query.prompt?.trim();
    
    if (!userPrompt || userPrompt.length < 5) {
      return res.status(400).json({
        error: 'Please provide a valid prompt'
      });
    }

    const analysis = analyzePromptContext(userPrompt);
    const promptTemplate = generateEnhancementTemplate(analysis, userPrompt);

    const result = await model.generateContent(promptTemplate);
    const response = result.response.text()
      .replace(/```.*?```/gs, '')
      .replace(/\*\*/g, '')
      .replace(/^["']|["']$/g, '')
      .replace(/^(Enhanced prompt:?|Prompt:?)\s*/i, '')
      .replace(/^Here's the enhanced prompt:?\s*/i, '')
      .replace(/^Enhanced version:?\s*/i, '')
      .trim();

    res.setHeader('Content-Type', 'text/plain');
    res.send(response);

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to process prompt' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Universal prompt enhancement service running on port ${PORT}`);
});
