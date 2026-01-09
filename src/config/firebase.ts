import { initializeApp, FirebaseApp } from 'firebase/app';
import { getDatabase, Database } from 'firebase/database';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Check if Firebase is properly configured
export const isFirebaseConfigured = (): boolean => {
  const hasValidConfig = !!(
    firebaseConfig.apiKey &&
    firebaseConfig.apiKey !== 'undefined' &&
    firebaseConfig.databaseURL &&
    firebaseConfig.databaseURL !== 'undefined' &&
    firebaseConfig.projectId &&
    firebaseConfig.projectId !== 'undefined'
  );
  console.log('[Firebase Config Check]', {
    apiKey: firebaseConfig.apiKey,
    databaseURL: firebaseConfig.databaseURL,
    projectId: firebaseConfig.projectId,
    isValid: hasValidConfig
  });
  return hasValidConfig;
};

// Only initialize Firebase if configured
let app: FirebaseApp | null = null;
let database: Database | null = null;

if (isFirebaseConfigured()) {
  try {
    app = initializeApp(firebaseConfig);
    database = getDatabase(app);
  } catch (error) {
    console.warn('Firebase initialization failed:', error);
  }
}

export { app, database };
