/**
 * Tabler Icon Search Service
 * Dynamic keyword-based search through 5,000+ Tabler icons
 * No API calls needed - uses local keyword matching
 */

// Import all Tabler icon names from the package
import * as TablerIcons from '@tabler/icons-react';

export interface IconSuggestion {
  name: string;
  score: number;
}

class TablerSearchService {
  private iconList: string[] = [];
  private initialized: boolean = false;

  /**
   * Initialize the icon list from Tabler Icons package
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Get all Tabler icon names from the imported package
      // Icon components are named like "IconHome", "IconUser", etc.
      this.iconList = Object.keys(TablerIcons)
        .filter(key => key.startsWith('Icon'))
        .map(key => {
          // Convert "IconHome" to "home"
          const name = key.replace('Icon', '');
          return this.camelToKebab(name);
        });

      console.log(`✅ Loaded ${this.iconList.length} Tabler icons`);
      this.initialized = true;
    } catch (error) {
      console.error('Failed to load Tabler icons:', error);
      this.iconList = [];
    }
  }

  /**
   * Convert camelCase to kebab-case
   * Example: "ArrowRight" -> "arrow-right"
   */
  private camelToKebab(str: string): string {
    return str
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
      .toLowerCase();
  }

  /**
   * Extract meaningful keywords from challenge text
   */
  private extractKeywords(text: string): string[] {
    const stopWords = new Set([
      'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'your', 'my', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'this', 'that',
      'of', 'with', 'from', 'by', 'is', 'are', 'was', 'were', 'be', 'been',
      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should'
    ]);

    // Split into words, lowercase, remove non-alphanumeric
    const words = text
      .toLowerCase()
      .split(/\s+/)
      .map(word => word.replace(/[^a-z0-9-]/g, ''))
      .filter(word => word.length > 2 && !stopWords.has(word));

    return words;
  }

  /**
   * Find matching icons based on challenge text
   */
  findMatchingIcons(challengeText: string, maxResults: number = 3): IconSuggestion[] {
    if (!this.initialized) {
      console.warn('Tabler icons not initialized yet');
      return [];
    }

    const keywords = this.extractKeywords(challengeText);

    if (keywords.length === 0) {
      return [];
    }

    console.log('Keywords extracted:', keywords);

    // Score each icon based on keyword matches
    const scored = this.iconList.map(icon => {
      let score = 0;

      keywords.forEach(keyword => {
        // Exact match (highest priority)
        if (icon === keyword) {
          score += 100;
        }
        // Icon contains keyword
        else if (icon.includes(keyword)) {
          score += 50;
        }
        // Keyword contains icon name
        else if (keyword.includes(icon)) {
          score += 25;
        }
        // Check for partial word matches in multi-word icons
        const iconParts = icon.split('-');
        iconParts.forEach(part => {
          if (part === keyword) {
            score += 75;
          } else if (part.includes(keyword) || keyword.includes(part)) {
            score += 10;
          }
        });
      });

      return { name: icon, score };
    });

    // Sort by score and return top N
    const results = scored
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults);

    console.log('Top matches:', results);

    return results;
  }

  /**
   * Search icons by query string
   */
  searchIcons(query: string, maxResults: number = 20): string[] {
    if (!this.initialized) {
      console.warn('Tabler icons not initialized yet');
      return [];
    }

    const keywords = this.extractKeywords(query);

    if (keywords.length === 0) {
      return [];
    }

    return this.iconList
      .filter(icon => {
        return keywords.some(keyword =>
          icon.includes(keyword) || keyword.includes(icon)
        );
      })
      .slice(0, maxResults);
  }

  /**
   * Get all available icons (for browse mode)
   */
  getAllIcons(): string[] {
    return this.iconList;
  }

  /**
   * Check if service is ready
   */
  isReady(): boolean {
    return this.initialized;
  }
}

// Export singleton instance
export const tablerSearchService = new TablerSearchService();
