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
   * Initialize the icon list from official Tabler Icons GitHub
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Try to load from GitHub first (official source)
      await this.loadFromGitHub();

      // Fallback to package if GitHub fails
      if (this.iconList.length === 0) {
        this.loadFromPackage();
      }

      console.log(`✅ Loaded ${this.iconList.length} Tabler icons`);
      this.initialized = true;
    } catch (error) {
      console.error('Failed to load Tabler icons:', error);
      // Fallback to package method
      this.loadFromPackage();
      this.initialized = true;
    }
  }

  /**
   * Load icon list from official Tabler GitHub
   */
  private async loadFromGitHub(): Promise<void> {
    try {
      const response = await fetch(
        'https://raw.githubusercontent.com/tabler/tabler-icons/master/icons.json',
        { cache: 'force-cache' } // Cache for better performance
      );

      if (!response.ok) {
        throw new Error(`GitHub fetch failed: ${response.status}`);
      }

      const icons = await response.json();

      // Normalize icon names: IconRelation-one-to-one → relation-one-to-one
      this.iconList = icons.map((icon: any) => {
        let name = icon.name || icon;
        // Remove 'Icon' prefix and convert to proper kebab-case
        return name
          .replace(/^Icon/, '')                    // Remove Icon prefix
          .replace(/([A-Z])/g, '-$1')              // Add dash before capitals
          .toLowerCase()                           // Convert to lowercase
          .replace(/^-/, '')                       // Remove leading dash
          .replace(/--+/g, '-');                   // Clean up multiple dashes
      });

      console.log('✅ Loaded icons from GitHub');
    } catch (error) {
      console.warn('GitHub load failed, using package fallback:', error);
      this.iconList = [];
    }
  }

  /**
   * Fallback: Load from package (less reliable but works offline)
   */
  private loadFromPackage(): void {
    // Get all Tabler icon names from the imported package
    // Icon components are named like "IconHome", "IconUser", etc.
    this.iconList = Object.keys(TablerIcons)
      .filter(key => key.startsWith('Icon'))
      .map(key => {
        // Convert "IconHome" to "home"
        const name = key.replace('Icon', '');
        return this.camelToKebab(name);
      });

    console.log('✅ Loaded icons from package');
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
      'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
      'be', 'have', 'do', 'is', 'are', 'was', 'were', 'of', 'off', 'more', 'must',
      'bigger', 'than'
    ]);

    const words = text
      .toLowerCase()
      .split(/\s+/)
      .map(word => word.replace(/[^a-z]/g, ''))        // Only letters (remove numbers)
      .filter(word => word.length > 3 && !stopWords.has(word)); // Min 4 chars

    console.log('Keywords filtered:', words);
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
      console.log('No keywords found');
      return [];
    }

    console.log('Searching with keywords:', keywords);

    // Score each icon based on keyword matches
    const scored = this.iconList
      .map(icon => {
        let score = 0;

        keywords.forEach(keyword => {
          // Exact match = highest score
          if (icon === keyword) {
            score += 1000;
          }
          // Icon contains keyword as whole word (split by dash)
          else if (icon.split('-').includes(keyword)) {
            score += 100;
          }
          // Keyword starts icon name
          else if (icon.startsWith(keyword)) {
            score += 50;
          }
          // Icon starts with keyword
          else if (keyword.startsWith(icon)) {
            score += 25;
          }
          // Only substring match if keyword is long enough
          else if (icon.includes(keyword) && keyword.length > 4) {
            score += 10;
          }
        });

        return { name: icon, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults);

    console.log('Top matches:', scored);

    return scored;
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
