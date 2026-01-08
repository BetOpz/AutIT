import { Tab, Challenge, TabColor } from '../types/tab.types';
import { generateId } from './storage';

const TABS_KEY = 'tabs_v1';
const ACTIVE_TAB_KEY = 'active_tab_v1';
const TABS_MIGRATED_KEY = 'tabs_migrated_v1';

/**
 * Check if tabs have been migrated from old challenge format
 */
export function isTabsMigrated(): boolean {
  return localStorage.getItem(TABS_MIGRATED_KEY) === 'true';
}

/**
 * Mark tabs as migrated
 */
export function markTabsMigrated(): void {
  localStorage.setItem(TABS_MIGRATED_KEY, 'true');
}

/**
 * Create default "Challenge" tab and migrate existing challenges
 */
export function createDefaultTab(): Tab {
  const defaultTab: Tab = {
    id: generateId(),
    name: 'Challenge',
    color: 'soft-blue',
    icon: '🎯',
    order: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  saveTabs([defaultTab]);
  setActiveTab(defaultTab.id);
  markTabsMigrated();

  return defaultTab;
}

/**
 * Save tabs to localStorage
 */
export function saveTabs(tabs: Tab[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TABS_KEY, JSON.stringify(tabs));
  } catch (error) {
    console.error('Failed to save tabs:', error);
  }
}

/**
 * Load tabs from localStorage
 */
export function loadTabs(): Tab[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(TABS_KEY);
    if (!saved) return [];

    const tabs = JSON.parse(saved) as Tab[];
    return tabs.sort((a, b) => a.order - b.order);
  } catch (error) {
    console.error('Failed to load tabs:', error);
    return [];
  }
}

/**
 * Get active tab ID
 */
export function getActiveTabId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACTIVE_TAB_KEY);
}

/**
 * Set active tab ID
 */
export function setActiveTab(tabId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACTIVE_TAB_KEY, tabId);
}

/**
 * Validate tab creation (max 4 tabs)
 */
export function canCreateTab(existingTabs: Tab[]): { allowed: boolean; message?: string } {
  if (existingTabs.length >= 4) {
    return {
      allowed: false,
      message: 'Maximum 4 tabs allowed. Too many tabs may be overwhelming.',
    };
  }
  return { allowed: true };
}

/**
 * Get tab by ID
 */
export function getTabById(tabId: string, tabs: Tab[]): Tab | undefined {
  return tabs.find((t) => t.id === tabId);
}

/**
 * Get challenges for a specific tab
 */
export function getChallengesForTab(tabId: string, challenges: Challenge[]): Challenge[] {
  return challenges
    .filter((c) => c.tabId === tabId)
    .sort((a, b) => a.order - b.order);
}

/**
 * Get available tab colors (all 4 autism-friendly colors)
 */
export function getAvailableColors(): { value: TabColor; label: string; hex: string }[] {
  return [
    { value: 'soft-blue', label: 'Soft Blue (Sport)', hex: '#A5D8DD' },
    { value: 'soft-green', label: 'Soft Green (School)', hex: '#B8D4B8' },
    { value: 'soft-lilac', label: 'Soft Lilac (Homework)', hex: '#D4C5E2' },
    { value: 'soft-teal', label: 'Soft Teal', hex: '#9FCFC0' },
  ];
}

/**
 * Format timer duration for display
 */
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  if (minutes === 0) {
    return `${secs} second${secs !== 1 ? 's' : ''}`;
  }

  if (secs === 0) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }

  return `${minutes}m ${secs}s`;
}

/**
 * Format completion time for display
 */
export function formatCompletionTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
