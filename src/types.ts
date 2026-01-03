export interface Challenge {
  id: string;
  text: string;
  iconUrl: string;
  createdAt: string;
  order: number;
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
