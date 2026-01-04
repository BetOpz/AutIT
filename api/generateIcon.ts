import type { VercelRequest, VercelResponse } from '@vercel/node';
import Replicate from 'replicate';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get the API token from environment variables
  // Note: Using VITE_REPLICATE_API_KEY (not TOKEN) to match Vercel config
  const apiToken = process.env.VITE_REPLICATE_API_KEY;

  console.log('🔍 Checking for Replicate API token...');
  console.log('Token exists:', !!apiToken);
  if (apiToken) {
    console.log('Token starts with r8_:', apiToken.startsWith('r8_'));
    console.log('Token length:', apiToken.length);
  }

  if (!apiToken) {
    console.error('❌ VITE_REPLICATE_API_KEY not found in environment');
    console.error('Available env vars:', Object.keys(process.env).filter(k => k.includes('REPLICATE')));
    return res.status(500).json({
      error: 'Replicate API token not configured on server',
      details: 'Please add VITE_REPLICATE_API_KEY to Vercel environment variables'
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

    if (!output || output.length === 0) {
      throw new Error('No image generated from FLUX model');
    }

    const imageUrl = output[0];
    console.log('✅ Image generated:', imageUrl);

    // Return the image URL to the frontend
    return res.status(200).json({
      success: true,
      imageUrl: imageUrl,
      challengeText: challengeText
    });

  } catch (error: any) {
    console.error('❌ Error generating icon:', error);

    // Provide detailed error information
    const errorMessage = error?.message || 'Unknown error';
    const statusCode = error?.response?.status || 500;

    return res.status(statusCode).json({
      error: 'Failed to generate icon',
      details: errorMessage,
      challengeText: challengeText
    });
  }
}
