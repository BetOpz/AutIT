import { useState, useEffect, useCallback } from 'react';
import { TimerSession, TimerType } from '../types/tab.types';
import { announceProcessComplete, announceElapsedTime } from '../utils/audioAlerts';

const TIMER_SESSION_KEY = 'timer_session_v1';

interface UseTimerProps {
  itemId: string;
  timerType: TimerType;
  duration?: number; // seconds for countdown
}

export function useTimer({ itemId, timerType, duration }: UseTimerProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Load saved session on mount
  useEffect(() => {
    const saved = loadTimerSession();
    if (saved && saved.itemId === itemId) {
      setElapsedSeconds(saved.elapsedSeconds);
      setIsRunning(saved.isRunning);
      setIsPaused(saved.isPaused);
    }
  }, [itemId]);

  // Save session whenever state changes
  useEffect(() => {
    if (isRunning || isPaused) {
      saveTimerSession({
        itemId,
        itemType: 'challenge',
        timerType,
        startTime: Date.now(),
        elapsedSeconds,
        duration,
        isRunning,
        isPaused,
      });
    }
  }, [itemId, timerType, duration, elapsedSeconds, isRunning, isPaused]);

  // Timer tick
  useEffect(() => {
    if (!isRunning || isPaused) return;

    const interval = setInterval(() => {
      setElapsedSeconds((prev) => {
        const next = prev + 1;

        // Check countdown completion
        if (timerType === 'down' && duration && next >= duration) {
          setIsRunning(false);
          setIsComplete(true);
          announceProcessComplete();
          clearTimerSession();
          return duration;
        }

        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, isPaused, timerType, duration]);

  const start = useCallback(() => {
    setElapsedSeconds(0);
    setIsRunning(true);
    setIsPaused(false);
    setIsComplete(false);
  }, []);

  const pause = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    setIsPaused(false);
  }, []);

  const stop = useCallback(() => {
    setIsRunning(false);
    setIsComplete(true);

    // Announce elapsed time for count-up timers
    if (timerType === 'up') {
      announceElapsedTime(elapsedSeconds);
    }

    clearTimerSession();
  }, [timerType, elapsedSeconds]);

  const reset = useCallback(() => {
    setElapsedSeconds(0);
    setIsRunning(false);
    setIsPaused(false);
    setIsComplete(false);
    clearTimerSession();
  }, []);

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const getRemainingSeconds = useCallback((): number => {
    if (timerType === 'down' && duration) {
      return Math.max(0, duration - elapsedSeconds);
    }
    return 0;
  }, [timerType, duration, elapsedSeconds]);

  const getProgressPercentage = useCallback((): number => {
    if (timerType === 'down' && duration) {
      return (elapsedSeconds / duration) * 100;
    }
    return 0;
  }, [timerType, duration, elapsedSeconds]);

  return {
    elapsedSeconds,
    isRunning,
    isPaused,
    isComplete,
    start,
    pause,
    resume,
    stop,
    reset,
    formatTime,
    getRemainingSeconds,
    getProgressPercentage,
  };
}

// localStorage helpers
function saveTimerSession(session: TimerSession): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TIMER_SESSION_KEY, JSON.stringify(session));
  } catch (error) {
    console.error('Failed to save timer session:', error);
  }
}

function loadTimerSession(): TimerSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem(TIMER_SESSION_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error('Failed to load timer session:', error);
    return null;
  }
}

function clearTimerSession(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(TIMER_SESSION_KEY);
  } catch (error) {
    console.error('Failed to clear timer session:', error);
  }
}
