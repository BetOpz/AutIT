/**
 * Tab system for organizing challenges
 */

export type TabColor =
  | 'soft-blue'      // #A5D8DD - Sport (soft turquoise)
  | 'soft-green'     // #B8D4B8 - School (soft sage green)
  | 'soft-lilac'     // #D4C5E2 - Homework (soft lavender)
  | 'soft-teal';     // #9FCFC0 - Alternative soft teal

export type TimerType = 'none' | 'up' | 'down';

export interface Tab {
  id: string;
  name: string;
  color: TabColor;
  icon?: string;        // emoji (optional)
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Challenge {
  id: string;
  tabId: string;                    // which tab this belongs to
  text: string;
  iconUrl: string;
  timerType: TimerType;             // none, count-up, count-down
  timerDuration?: number;           // seconds (only for countdown)
  completionTimes: number[];        // all attempt times in seconds
  bestTime?: number;                // fastest completion in seconds
  lastTime?: number;                // most recent completion
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface TimerSession {
  itemId: string;                   // challenge ID
  itemType: 'challenge';            // for now, just challenges
  timerType: TimerType;
  startTime: number;                // ms timestamp
  elapsedSeconds: number;           // seconds elapsed
  duration?: number;                // seconds (for countdown)
  isRunning: boolean;
  isPaused: boolean;
}

// Color mapping for Tailwind classes
export const TAB_COLORS: Record<TabColor, { bg: string; text: string; border: string }> = {
  'soft-blue': {
    bg: 'bg-[#A5D8DD]',
    text: 'text-gray-800',
    border: 'border-[#A5D8DD]',
  },
  'soft-green': {
    bg: 'bg-[#B8D4B8]',
    text: 'text-gray-800',
    border: 'border-[#B8D4B8]',
  },
  'soft-lilac': {
    bg: 'bg-[#D4C5E2]',
    text: 'text-gray-800',
    border: 'border-[#D4C5E2]',
  },
  'soft-teal': {
    bg: 'bg-[#9FCFC0]',
    text: 'text-gray-800',
    border: 'border-[#9FCFC0]',
  },
};
