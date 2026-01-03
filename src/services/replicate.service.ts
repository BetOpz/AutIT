import Replicate from 'replicate';

/**
 * Get Replicate API token from environment variables
 * Provides detailed debugging if token is missing
 */
function getReplicateToken(): string | undefined {
  const token = import.meta.env.VITE_REPLICATE_API_TOKEN;

  // Debug logging
  if (!token) {
    console.warn('❌ VITE_REPLICATE_API_TOKEN is not set');
    console.warn('Available env vars:', Object.keys(import.meta.env));
  } else {
    console.log('✅ Replicate API token found:', token.substring(0, 8) + '...');
  }

  return token;
}

export class ReplicateService {
  private replicate: Replicate | null = null;
  private token: string | undefined;

  constructor() {
    this.token = getReplicateToken();

    if (this.token) {
      try {
        this.replicate = new Replicate({
          auth: this.token,
        });
        console.log('✅ Replicate client initialized successfully');
      } catch (error) {
        console.error('❌ Failed to initialize Replicate client:', error);
        this.replicate = null;
      }
    } else {
      console.warn('⚠️ Replicate API token not configured. AI icon generation will be disabled.');
      console.warn('To enable AI icons, add VITE_REPLICATE_API_TOKEN to your .env file or Vercel environment variables.');
    }
  }

  /**
   * Check if Replicate is configured
   */
  isConfigured(): boolean {
    const configured = !!this.replicate && !!this.token;

    if (!configured) {
      console.log('Replicate status:', {
        hasToken: !!this.token,
        hasClient: !!this.replicate,
        tokenPreview: this.token ? this.token.substring(0, 8) + '...' : 'none'
      });
    }

    return configured;
  }

  /**
   * Generate an icon using FLUX model
   * Returns a data URL of the generated image
   */
  async generateIcon(challengeText: string): Promise<string> {
    // Check token at runtime
    if (!this.token) {
      const errorMsg = 'Replicate API token is not configured.\n\n' +
        'Please add VITE_REPLICATE_API_TOKEN to your environment variables:\n' +
        '1. In Vercel: Go to Settings → Environment Variables\n' +
        '2. Locally: Add to .env file\n\n' +
        'Your token should start with "r8_"';
      throw new Error(errorMsg);
    }

    if (!this.replicate) {
      throw new Error('Replicate client failed to initialize. Check console for details.');
    }

    try {
      // Create a prompt optimized for simple, clear icons
      const prompt = this.createPrompt(challengeText);

      console.log('🎨 Generating AI icon...');
      console.log('Challenge:', challengeText);
      console.log('Prompt:', prompt);

      // Use FLUX Schnell (fast model) for quick generation
      const output = await this.replicate.run(
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

      console.log('✅ Image generated successfully');

      // Get the image URL
      const imageUrl = output[0];
      console.log('Image URL:', imageUrl);

      // Convert to data URL
      console.log('Converting to data URL...');
      const dataUrl = await this.convertToDataUrl(imageUrl);
      console.log('✅ Conversion complete');

      return dataUrl;
    } catch (error) {
      console.error('❌ Error generating icon:', error);

      // Provide user-friendly error messages
      if (error instanceof Error) {
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          throw new Error('Invalid Replicate API token. Please check your credentials.');
        } else if (error.message.includes('429') || error.message.includes('rate limit')) {
          throw new Error('Replicate API rate limit exceeded. Please try again in a few minutes.');
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          throw new Error('Network error. Please check your internet connection and try again.');
        }
      }

      throw error;
    }
  }

  /**
   * Create an optimized prompt for icon generation
   */
  private createPrompt(challengeText: string): string {
    return `Simple, clean icon illustration of "${challengeText}".
Minimalist design, bright colors, high contrast, bold lines.
Flat design style, no text, centered on white background.
Autism-friendly, clear and immediately recognizable.
Professional clipart style, 512x512 pixels.`;
  }

  /**
   * Convert image URL to data URL
   */
  private async convertToDataUrl(url: string): Promise<string> {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      }

      const blob = await response.blob();

      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result);
          } else {
            reject(new Error('Failed to convert image to data URL'));
          }
        };
        reader.onerror = () => reject(new Error('FileReader error'));
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error converting image to data URL:', error);
      throw new Error(`Failed to download generated image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get token info for debugging
   */
  getDebugInfo(): {
    hasToken: boolean;
    tokenPreview: string;
    isConfigured: boolean;
    envVars: string[];
  } {
    return {
      hasToken: !!this.token,
      tokenPreview: this.token ? this.token.substring(0, 10) + '...' : 'none',
      isConfigured: this.isConfigured(),
      envVars: Object.keys(import.meta.env)
    };
  }
}

// Export singleton instance
export const replicateService = new ReplicateService();
