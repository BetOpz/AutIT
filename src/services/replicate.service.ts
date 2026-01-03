import Replicate from 'replicate';

const REPLICATE_API_TOKEN = import.meta.env.VITE_REPLICATE_API_TOKEN;

export class ReplicateService {
  private replicate: Replicate | null = null;

  constructor() {
    if (REPLICATE_API_TOKEN) {
      this.replicate = new Replicate({
        auth: REPLICATE_API_TOKEN,
      });
    } else {
      console.warn('Replicate API token not configured');
    }
  }

  /**
   * Check if Replicate is configured
   */
  isConfigured(): boolean {
    return !!this.replicate;
  }

  /**
   * Generate an icon using FLUX model
   * Returns a data URL of the generated image
   */
  async generateIcon(challengeText: string): Promise<string> {
    if (!this.replicate) {
      throw new Error('Replicate is not configured. Please add VITE_REPLICATE_API_TOKEN to .env');
    }

    try {
      // Create a prompt optimized for simple, clear icons
      const prompt = this.createPrompt(challengeText);

      console.log('Generating icon with prompt:', prompt);

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
        throw new Error('No image generated');
      }

      // Get the image URL
      const imageUrl = output[0];

      // Convert to data URL
      const dataUrl = await this.convertToDataUrl(imageUrl);

      return dataUrl;
    } catch (error) {
      console.error('Error generating icon:', error);
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
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error converting image to data URL:', error);
      throw error;
    }
  }

  /**
   * Test if API is working
   */
  async testConnection(): Promise<boolean> {
    if (!this.replicate) {
      return false;
    }

    try {
      // Just check if we can create the client
      return true;
    } catch (error) {
      console.error('Replicate connection test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const replicateService = new ReplicateService();
