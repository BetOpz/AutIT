import type { VercelRequest, VercelResponse } from '@vercel/node';
import Replicate from 'replicate';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get the API token from environment variables
  // Note: Server-side uses REPLICATE_API_KEY (no VITE_ prefix)
  // VITE_ prefix is only for client-side code processed by Vite
  const apiToken = process.env.REPLICATE_API_KEY;

  console.log('🔍 Checking for Replicate API token...');
  console.log('Token exists:', !!apiToken);
  if (apiToken) {
    console.log('Token starts with r8_:', apiToken.startsWith('r8_'));
    console.log('Token length:', apiToken.length);
  }

  if (!apiToken) {
    console.error('❌ REPLICATE_API_KEY not found in environment');
    console.error('Available env vars:', Object.keys(process.env).filter(k => k.includes('REPLICATE')));
    return res.status(500).json({
      error: 'Replicate API token not configured on server',
      details: 'Add REPLICATE_API_KEY (no VITE_ prefix) to Vercel environment variables'
    });
  }

  // Get challenge text from request body
  const { challengeText } = req.body;

  if (!challengeText || typeof challengeText !== 'string') {
    return res.status(400).json({
      error: 'Missing or invalid challengeText in request body'
    });
  }

  console.log('🎨 Generating icon for:', challengeText);

  try {
    // Initialize Replicate client
    console.log('🔧 Initializing Replicate client...');
    const replicate = new Replicate({
      auth: apiToken,
    });

    // Create optimized prompt for autism-friendly icons
    const prompt = `Simple, clean icon illustration of "${challengeText}".
Minimalist design, bright colors, high contrast, bold lines.
Flat design style, no text, centered on white background.
Autism-friendly, clear and immediately recognizable.
Professional clipart style, 512x512 pixels.`;

    console.log('📝 Prompt:', prompt);
    console.log('🚀 Calling Replicate API with model: black-forest-labs/flux-schnell');

    // Call Replicate FLUX Schnell model
    const output = await replicate.run(
      'black-forest-labs/flux-schnell',
      {
        input: {
          prompt: prompt,
          num_outputs: 1,
          aspect_ratio: '1:1',
          output_format: 'png',
          output_quality: 80,
        },
      }
    ) as string[];

    console.log('📦 Raw Replicate output:', JSON.stringify(output, null, 2));
    console.log('📊 Output type:', typeof output);
    console.log('📊 Output is array:', Array.isArray(output));
    console.log('📊 Output length:', output?.length);

    if (!output || output.length === 0) {
      throw new Error('No image generated from FLUX model');
    }

    const imageUrl = output[0];
    console.log('✅ Image generated successfully!');
    console.log('🔗 Image URL:', imageUrl);

    // Return the image URL to the frontend
    return res.status(200).json({
      success: true,
      imageUrl: imageUrl,
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
      console.error('Response statusText:', error.response.statusText);
      console.error('Response headers:', JSON.stringify(error.response.headers, null, 2));
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }

    // Log request details if available
    if (error?.config) {
      console.error('Request URL:', error.config.url);
      console.error('Request method:', error.config.method);
      console.error('Request headers:', JSON.stringify(error.config.headers, null, 2));
    }

    // Log full error object for debugging
    console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    console.error('❌ ===================================');

    // Provide detailed error information to client
    const errorMessage = error?.message || 'Unknown error';
    const errorDetails = error?.response?.data?.detail || error?.response?.data || errorMessage;
    const statusCode = error?.response?.status || 500;

    return res.status(statusCode).json({
      error: 'Failed to generate icon',
      details: errorDetails,
      message: errorMessage,
      statusCode: statusCode,
      challengeText: challengeText,
      // Include error type for debugging
      errorType: error?.constructor?.name || 'Unknown'
    });
  }
}
