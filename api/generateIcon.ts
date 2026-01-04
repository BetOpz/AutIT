import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get the Firebase API key (works with Gemini too)
  const apiKey = process.env.VITE_FIREBASE_API_KEY;

  console.log('🔍 Checking for API key...');
  console.log('API key exists:', !!apiKey);

  if (!apiKey) {
    console.error('❌ VITE_FIREBASE_API_KEY not found in environment');
    return res.status(500).json({
      error: 'API key not configured on server',
      details: 'Add VITE_FIREBASE_API_KEY to Vercel environment variables'
    });
  }

  // Get challenge text from request body
  const { challengeText } = req.body;

  if (!challengeText || typeof challengeText !== 'string') {
    return res.status(400).json({
      error: 'Missing or invalid challengeText in request body'
    });
  }

  console.log('🎨 Suggesting Tabler icon for:', challengeText);

  try {
    // Initialize Gemini
    console.log('🔧 Initializing Google Gemini...');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Create prompt for Gemini to suggest Tabler icon
    const prompt = `You are an icon suggestion assistant. Given a challenge or task description, suggest the most appropriate Tabler icon name.

Challenge: "${challengeText}"

Instructions:
- Respond with ONLY the Tabler icon name (e.g., "target", "run", "apple", "book")
- Use simple, common icon names from the Tabler Icons library
- No prefix, no explanation, just the icon name
- Choose icons that are clear and recognizable
- For activities: use action-related icons (run, walk, yoga, meditation)
- For objects: use object icons (apple, book, tooth, bed)
- For abstract concepts: use symbolic icons (target, star, heart, brain)

Icon name:`;

    console.log('📝 Prompt:', prompt);
    console.log('🚀 Calling Google Gemini API...');

    const result = await model.generateContent(prompt);
    const response = result.response;
    const iconName = response.text().trim().toLowerCase();

    console.log('📦 Gemini response:', iconName);

    // Validate icon name (basic check)
    if (!iconName || iconName.length > 50 || iconName.includes(' ')) {
      throw new Error(`Invalid icon name returned: ${iconName}`);
    }

    console.log('✅ Icon suggestion successful!');
    console.log('🎯 Suggested icon:', iconName);

    // Return the Tabler icon name
    return res.status(200).json({
      success: true,
      iconName: iconName,
      challengeText: challengeText
    });

  } catch (error: any) {
    console.error('❌ ========== ERROR DETAILS ==========');
    console.error('Error type:', error?.constructor?.name);
    console.error('Error message:', error?.message);
    console.error('Error stack:', error?.stack);

    // Log response details if available
    if (error?.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }

    console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    console.error('❌ ===================================');

    // Provide detailed error information to client
    const errorMessage = error?.message || 'Unknown error';
    const statusCode = error?.response?.status || 500;

    return res.status(statusCode).json({
      error: 'Failed to suggest icon',
      details: errorMessage,
      statusCode: statusCode,
      challengeText: challengeText,
      errorType: error?.constructor?.name || 'Unknown'
    });
  }
}
