import { AppData, Challenge } from '../types';

const STORAGE_KEY = 'autism_challenges_data';

// Sample challenges with emoji icons (simple, clear, immediate recognition)
const DEFAULT_CHALLENGES: Challenge[] = [
  {
    id: '1',
    text: 'Make your bed',
    iconUrl: '🛏️',
    createdAt: new Date().toISOString(),
    order: 1,
  },
  {
    id: '2',
    text: 'Drink a glass of water',
    iconUrl: '💧',
    createdAt: new Date().toISOString(),
    order: 2,
  },
  {
    id: '3',
    text: 'Do 5 push-ups',
    iconUrl: '💪',
    createdAt: new Date().toISOString(),
    order: 3,
  },
  {
    id: '4',
    text: 'Take deep breaths for 1 minute',
    iconUrl: '🧘',
    createdAt: new Date().toISOString(),
    order: 4,
  },
  {
    id: '5',
    text: 'Organize your desk',
    iconUrl: '📚',
    createdAt: new Date().toISOString(),
    order: 5,
  },
];

const DEFAULT_DATA: AppData = {
  challenges: DEFAULT_CHALLENGES,
  sessions: [],
  currentSession: null,
};

export const loadData = (): AppData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      // First time use - save default data
      saveData(DEFAULT_DATA);
      return DEFAULT_DATA;
    }

    const parsed = JSON.parse(stored) as AppData;

    // Validate data structure
    if (!parsed.challenges || !Array.isArray(parsed.challenges)) {
      console.error('Invalid data structure, resetting to defaults');
      saveData(DEFAULT_DATA);
      return DEFAULT_DATA;
    }

    return parsed;
  } catch (error) {
    console.error('Error loading data from localStorage:', error);
    return DEFAULT_DATA;
  }
};

export const saveData = (data: AppData): boolean => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error saving data to localStorage:', error);
    return false;
  }
};

export const exportData = (data: AppData): string => {
  return JSON.stringify(data, null, 2);
};

export const importData = (jsonString: string): AppData | null => {
  try {
    const parsed = JSON.parse(jsonString) as AppData;

    // Validate structure
    if (!parsed.challenges || !Array.isArray(parsed.challenges)) {
      throw new Error('Invalid data structure');
    }

    return parsed;
  } catch (error) {
    console.error('Error importing data:', error);
    return null;
  }
};

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const resetData = (): AppData => {
  saveData(DEFAULT_DATA);
  return DEFAULT_DATA;
};
