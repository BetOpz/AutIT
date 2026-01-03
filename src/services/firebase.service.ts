import {
  ref,
  set,
  get,
  onValue,
  remove,
  Unsubscribe,
} from 'firebase/database';
import { database, isFirebaseConfigured } from '../config/firebase';
import { Challenge, Session, AppData } from '../types';
import { loadData as loadLocalData, saveData as saveLocalData } from '../utils/storage';

export class FirebaseService {
  private challengesRef = ref(database, 'challenges');
  private sessionsRef = ref(database, 'sessions');
  private listeners: Unsubscribe[] = [];

  /**
   * Initialize Firebase sync - load data from Firebase or push local data if Firebase is empty
   */
  async initialize(): Promise<AppData> {
    if (!isFirebaseConfigured()) {
      console.warn('Firebase not configured, using local storage only');
      return loadLocalData();
    }

    try {
      // Try to load from Firebase first
      const firebaseData = await this.loadFromFirebase();

      if (firebaseData.challenges.length > 0) {
        // Firebase has data, use it and update local storage
        saveLocalData(firebaseData);
        return firebaseData;
      } else {
        // Firebase is empty, push local data to Firebase
        const localData = loadLocalData();
        await this.pushToFirebase(localData);
        return localData;
      }
    } catch (error) {
      console.error('Firebase initialization error, falling back to local:', error);
      return loadLocalData();
    }
  }

  /**
   * Load all data from Firebase
   */
  private async loadFromFirebase(): Promise<AppData> {
    try {
      const [challengesSnapshot, sessionsSnapshot] = await Promise.all([
        get(this.challengesRef),
        get(this.sessionsRef),
      ]);

      const challenges: Challenge[] = [];
      const sessions: Session[] = [];

      if (challengesSnapshot.exists()) {
        const challengesData = challengesSnapshot.val();
        Object.values(challengesData).forEach((challenge: any) => {
          challenges.push(challenge);
        });
      }

      if (sessionsSnapshot.exists()) {
        const sessionsData = sessionsSnapshot.val();
        Object.values(sessionsData).forEach((session: any) => {
          sessions.push(session);
        });
      }

      // Sort by order
      challenges.sort((a, b) => a.order - b.order);
      sessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      return {
        challenges,
        sessions,
        currentSession: null,
      };
    } catch (error) {
      console.error('Error loading from Firebase:', error);
      throw error;
    }
  }

  /**
   * Push local data to Firebase (initial sync)
   */
  private async pushToFirebase(data: AppData): Promise<void> {
    try {
      const challengesData: { [key: string]: Challenge } = {};
      const sessionsData: { [key: string]: Session } = {};

      data.challenges.forEach((challenge) => {
        challengesData[challenge.id] = challenge;
      });

      data.sessions.forEach((session) => {
        sessionsData[session.id] = session;
      });

      await Promise.all([
        set(this.challengesRef, challengesData),
        set(this.sessionsRef, sessionsData),
      ]);
    } catch (error) {
      console.error('Error pushing to Firebase:', error);
      throw error;
    }
  }

  /**
   * Subscribe to real-time updates for challenges
   */
  subscribeToChallenges(callback: (challenges: Challenge[]) => void): Unsubscribe {
    if (!isFirebaseConfigured()) {
      return () => {};
    }

    const unsubscribe = onValue(
      this.challengesRef,
      (snapshot) => {
        const challenges: Challenge[] = [];

        if (snapshot.exists()) {
          const data = snapshot.val();
          Object.values(data).forEach((challenge: any) => {
            challenges.push(challenge);
          });
        }

        // Sort by order
        challenges.sort((a, b) => a.order - b.order);
        callback(challenges);
      },
      (error) => {
        console.error('Error subscribing to challenges:', error);
      }
    );

    this.listeners.push(unsubscribe);
    return unsubscribe;
  }

  /**
   * Subscribe to real-time updates for sessions
   */
  subscribeToSessions(callback: (sessions: Session[]) => void): Unsubscribe {
    if (!isFirebaseConfigured()) {
      return () => {};
    }

    const unsubscribe = onValue(
      this.sessionsRef,
      (snapshot) => {
        const sessions: Session[] = [];

        if (snapshot.exists()) {
          const data = snapshot.val();
          Object.values(data).forEach((session: any) => {
            sessions.push(session);
          });
        }

        // Sort by date (newest first)
        sessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        callback(sessions);
      },
      (error) => {
        console.error('Error subscribing to sessions:', error);
      }
    );

    this.listeners.push(unsubscribe);
    return unsubscribe;
  }

  /**
   * Save challenges to Firebase
   */
  async saveChallenges(challenges: Challenge[]): Promise<void> {
    if (!isFirebaseConfigured()) {
      return;
    }

    try {
      const challengesData: { [key: string]: Challenge } = {};
      challenges.forEach((challenge) => {
        challengesData[challenge.id] = challenge;
      });

      await set(this.challengesRef, challengesData);
    } catch (error) {
      console.error('Error saving challenges to Firebase:', error);
      throw error;
    }
  }

  /**
   * Add or update a single challenge
   */
  async saveChallenge(challenge: Challenge): Promise<void> {
    if (!isFirebaseConfigured()) {
      return;
    }

    try {
      const challengeRef = ref(database, `challenges/${challenge.id}`);
      await set(challengeRef, challenge);
    } catch (error) {
      console.error('Error saving challenge to Firebase:', error);
      throw error;
    }
  }

  /**
   * Delete a challenge
   */
  async deleteChallenge(challengeId: string): Promise<void> {
    if (!isFirebaseConfigured()) {
      return;
    }

    try {
      const challengeRef = ref(database, `challenges/${challengeId}`);
      await remove(challengeRef);
    } catch (error) {
      console.error('Error deleting challenge from Firebase:', error);
      throw error;
    }
  }

  /**
   * Save a session to Firebase
   */
  async saveSession(session: Session): Promise<void> {
    if (!isFirebaseConfigured()) {
      return;
    }

    try {
      const sessionRef = ref(database, `sessions/${session.id}`);
      await set(sessionRef, session);
    } catch (error) {
      console.error('Error saving session to Firebase:', error);
      throw error;
    }
  }

  /**
   * Clean up all listeners
   */
  cleanup(): void {
    this.listeners.forEach((unsubscribe) => unsubscribe());
    this.listeners = [];
  }
}

// Export singleton instance
export const firebaseService = new FirebaseService();
