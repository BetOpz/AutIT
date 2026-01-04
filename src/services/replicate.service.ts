/**
 * Replicate Service - Now uses serverless API route to avoid CORS issues
 * The actual Replicate API calls happen on the server via /api/generateIcon
 */

export class ReplicateService {
  /**
   * Check if the API endpoint is available
   * In production, this is always true since the API route is deployed with the app
   */
  isConfigured(): boolean {
    // The API route is always available in production/preview
    // For local dev, it works via Vercel CLI or Next.js dev server
    return true;
  }

  /**
   * Generate an icon using FLUX model via serverless API route
   * This bypasses CORS issues by calling Replicate from the server
   */
  async generateIcon(challengeText: string): Promise<string> {
    if (!challengeText || !challengeText.trim()) {
      throw new Error('Challenge text is required');
    }

    try {
      console.log('🎨 Calling API to generate icon...');
      console.log('Challenge:', challengeText);

      // Call our serverless API route
      const response = await fetch('/api/generateIcon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          challengeText: challengeText.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || errorData.details || `Server error: ${response.status}`;

        console.error('❌ API error:', errorMessage);

        // Provide user-friendly error messages
        if (response.status === 401) {
          throw new Error('Invalid Replicate API token on server. Please check Vercel environment variables.');
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again in a few minutes.');
        } else if (response.status === 500) {
          throw new Error(errorMessage || 'Server error. Please try again.');
        } else {
          throw new Error(errorMessage);
        }
      }

      const data = await response.json();

      if (!data.imageUrl) {
        throw new Error('No image URL returned from server');
      }

      console.log('✅ Image URL received:', data.imageUrl);

      // Convert the Replicate image URL to a data URL
      console.log('Converting to data URL...');
      const dataUrl = await this.convertToDataUrl(data.imageUrl);
      console.log('✅ Conversion complete');

      return dataUrl;

    } catch (error) {
      console.error('❌ Error generating icon:', error);

      // Re-throw with user-friendly message
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('Failed to generate icon. Please try again.');
      }
    }
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
   * Get debug info for troubleshooting
   */
  getDebugInfo(): {
    apiEndpoint: string;
    isConfigured: boolean;
    mode: string;
  } {
    return {
      apiEndpoint: '/api/generateIcon',
      isConfigured: this.isConfigured(),
      mode: import.meta.env.MODE || 'production'
    };
  }
}

// Export singleton instance
export const replicateService = new ReplicateService();
