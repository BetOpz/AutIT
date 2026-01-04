/**
 * Gemini Service - Uses Google Gemini to suggest Tabler icons
 * Much simpler and more reliable than image generation
 */

export class GeminiService {
  /**
   * Check if the API is configured
   */
  isConfigured(): boolean {
    // The API route is always available in production/preview
    return true;
  }

  /**
   * Get icon suggestion from Gemini
   * Returns a Tabler icon name that can be used with @tabler/icons-react
   */
  async suggestIcon(challengeText: string): Promise<string> {
    if (!challengeText || !challengeText.trim()) {
      throw new Error('Challenge text is required');
    }

    try {
      console.log('🎨 Calling Gemini to suggest icon...');
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

        console.error('❌ API error response:', {
          status: response.status,
          statusText: response.statusText,
          errorData: errorData
        });

        // Extract detailed error message
        const errorMessage = errorData.message || errorData.details || errorData.error || `Server error: ${response.status}`;
        const errorType = errorData.errorType || 'Unknown';

        console.error('Error type:', errorType);
        console.error('Error message:', errorMessage);
        console.error('Full error data:', JSON.stringify(errorData, null, 2));

        // Provide user-friendly error messages
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again in a few minutes.');
        } else if (response.status === 500) {
          throw new Error(`Server error: ${errorMessage}`);
        } else {
          throw new Error(`API error (${response.status}): ${errorMessage}`);
        }
      }

      const data = await response.json();

      if (!data.iconName) {
        throw new Error('No icon name returned from server');
      }

      console.log('✅ Icon name received:', data.iconName);

      // Return the Tabler icon name (e.g., "target", "run", "apple")
      return data.iconName;

    } catch (error) {
      console.error('❌ Error suggesting icon:', error);

      // Re-throw with user-friendly message
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('Failed to suggest icon. Please try again.');
      }
    }
  }

  /**
   * Get debug info for troubleshooting
   */
  getDebugInfo(): {
    apiEndpoint: string;
    isConfigured: boolean;
    mode: string;
    service: string;
  } {
    return {
      apiEndpoint: '/api/generateIcon',
      isConfigured: this.isConfigured(),
      mode: import.meta.env.MODE || 'production',
      service: 'Google Gemini + Tabler Icons'
    };
  }
}

// Export singleton instance
export const geminiService = new GeminiService();
