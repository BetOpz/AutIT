import { TimerType } from './types/tab.types';

export interface Challenge {
  id: string;
  text: string;
  iconUrl: string;
  createdAt: string;
  order: number;
  // NEW: Tab system fields
  tabId?: string;                    // which tab this belongs to (optional for backward compatibility)
  timerType?: TimerType;             // 'none', 'up', 'down'
  timerDuration?: number;            // seconds (only for countdown)
  completionTimes?: number[];        // all attempt times in seconds
  bestTime?: number;                 // fastest completion in seconds
  lastTime?: number;                 // most recent completion
  updatedAt?: string;
}

export interface ChallengeSession {
  challengeId: string;
  timeTaken: number; // in seconds
  order: number;
}

export interface Session {
  id: string;
  date: string;
  challenges: ChallengeSession[];
  totalTime: number;
}

export interface AppData {
  challenges: Challenge[];
  sessions: Session[];
  currentSession: Session | null;
}

export type AppMode = 'user' | 'admin';
