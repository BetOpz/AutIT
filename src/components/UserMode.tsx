import { useState, useEffect } from 'react';
import { Challenge, ChallengeSession, Session } from '../types';
import { Fireworks } from './Fireworks';
import { generateId } from '../utils/storage';
import { TabBar } from './TabBar';
import { TimerDisplay } from './TimerDisplay';
import { Tab } from '../types/tab.types';
import {
  loadTabs,
  getActiveTabId,
  setActiveTab,
  formatCompletionTime,
} from '../utils/tabHelpers';
import { initializeSound, getSoundEnabled, setSoundEnabled as setSoundEnabledGlobal } from '../utils/audioAlerts';

interface UserModeProps {
  challenges: Challenge[];
  onSessionComplete: (session: Session) => void;
  onSwitchToAdmin: () => void;
}

// Challenge progress persistence
interface ChallengeProgress {
  currentIndex: number;
  completedChallenges: ChallengeSession[];
  isPaused: boolean;
  pausedTime: number;
  timestamp: string;
}

const PROGRESS_KEY = 'challenge_progress_v1';

// Load saved progress from localStorage
const loadProgress = (): ChallengeProgress | null => {
  if (typeof window === 'undefined') return null;

  try {
    const saved = localStorage.getItem(PROGRESS_KEY);
    if (!saved) return null;

    const progress = JSON.parse(saved) as ChallengeProgress;

    // Validate the data structure
    if (
      typeof progress.currentIndex === 'number' &&
      Array.isArray(progress.completedChallenges) &&
      progress.timestamp
    ) {
      // Add default values for new fields if missing (backwards compatibility)
      return {
        ...progress,
        isPaused: progress.isPaused ?? false,
        pausedTime: progress.pausedTime ?? 0,
      };
    }
    return null;
  } catch (error) {
    console.error('Failed to load challenge progress:', error);
    return null;
  }
};

// Save progress to localStorage
const saveProgress = (progress: ChallengeProgress): void => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error('Failed to save challenge progress:', error);
  }
};

// Clear saved progress
const clearProgress = (): void => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(PROGRESS_KEY);
  } catch (error) {
    console.error('Failed to clear challenge progress:', error);
  }
};

export const UserMode = ({ challenges, onSessionComplete, onSwitchToAdmin }: UserModeProps) => {
  // Tab state
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(false);

  // Initialize state with saved progress if available
  const [currentIndex, setCurrentIndex] = useState(() => {
    const saved = loadProgress();
    return saved?.currentIndex ?? 0;
  });

  const [completedChallenges, setCompletedChallenges] = useState<ChallengeSession[]>(() => {
    const saved = loadProgress();
    return saved?.completedChallenges ?? [];
  });

  const [showFireworks, setShowFireworks] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Initialize tabs and audio on mount
  useEffect(() => {
    // Initialize sound
    initializeSound();
    setSoundEnabled(getSoundEnabled());

    // Load existing tabs (App.tsx handles migration)
    const loadedTabs = loadTabs();
    setTabs(loadedTabs);

    // Set active tab
    if (loadedTabs.length > 0) {
      const savedActiveTabId = getActiveTabId();
      if (savedActiveTabId && loadedTabs.find(t => t.id === savedActiveTabId)) {
        setActiveTabId(savedActiveTabId);
      } else {
        const firstTabId = loadedTabs[0].id;
        setActiveTabId(firstTabId);
        setActiveTab(firstTabId);
      }
    }
  }, []);

  // Filter challenges by active tab
  // Show all challenges if no tabs exist OR if challenges don't have tabId (backward compatibility)
  const filteredChallenges = activeTabId && tabs.length > 0
    ? challenges.filter(c => !c.tabId || c.tabId === activeTabId) // Show challenges with no tabId OR matching tabId
    : challenges;

  // Save progress whenever it changes
  useEffect(() => {
    if (completedChallenges.length > 0 || currentIndex > 0) {
      saveProgress({
        currentIndex,
        completedChallenges,
        isPaused: false,
        pausedTime: 0,
        timestamp: new Date().toISOString(),
      });
    }
  }, [currentIndex, completedChallenges]);

  const currentChallenge = filteredChallenges[currentIndex];
  const isLastChallenge = currentIndex === filteredChallenges.length - 1;

  // Handle tab switching
  const handleTabSwitch = (tabId: string) => {
    setActiveTabId(tabId);
    setActiveTab(tabId);
    // Reset to first challenge of new tab
    setCurrentIndex(0);
    setCompletedChallenges([]);
    clearProgress();
  };

  // Handle sound toggle
  const handleSoundToggle = () => {
    const newState = !soundEnabled;
    setSoundEnabledGlobal(newState); // Update global sound state
    setSoundEnabled(newState); // Update local state for UI
  };

  // Handle challenge completion (called by TimerDisplay)
  const handleChallengeComplete = (completionTime: number) => {
    // Save this challenge completion
    const newCompletion: ChallengeSession = {
      challengeId: currentChallenge.id,
      timeTaken: completionTime,
      order: currentIndex + 1,
    };

    const updatedCompletions = [...completedChallenges, newCompletion];
    setCompletedChallenges(updatedCompletions);

    // Show fireworks
    setShowFireworks(true);

    // Hide fireworks after 3 seconds
    setTimeout(() => {
      setShowFireworks(false);

      // If last challenge, show summary
      if (isLastChallenge) {
        const totalTime = updatedCompletions.reduce((sum, c) => sum + c.timeTaken, 0);
        const session: Session = {
          id: generateId(),
          date: new Date().toISOString(),
          challenges: updatedCompletions,
          totalTime,
        };
        onSessionComplete(session);
        setShowSummary(true);
      }
    }, 3000);
  };

  // Handle next challenge (called by TimerDisplay)
  const handleNext = () => {
    if (!isLastChallenge) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  // Handle reset all
  const handleResetAll = () => {
    setCurrentIndex(0);
    setCompletedChallenges([]);
    setShowSummary(false);
    setShowResetConfirm(false);
    clearProgress();
  };

  // Handle restart
  const handleRestart = () => {
    setCurrentIndex(0);
    setCompletedChallenges([]);
    setShowSummary(false);
    clearProgress();
  };

  if (filteredChallenges.length === 0) {
    return (
      <div className="min-h-screen flex flex-col p-4 sm:p-6 md:p-8 bg-white">
        {/* TabBar at top if tabs exist */}
        {tabs.length > 0 && activeTabId && (
          <div className="mb-6">
            <TabBar tabs={tabs} activeTabId={activeTabId} onTabChange={handleTabSwitch} />
          </div>
        )}

        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-3xl font-bold mb-8">No challenges in this tab yet!</p>
            <button
              onClick={onSwitchToAdmin}
              className="bg-primary text-white px-12 py-6 rounded-2xl text-2xl font-bold hover:bg-blue-700 transition-colors shadow-lg"
            >
              Add Challenges
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showSummary) {
    const totalTime = completedChallenges.reduce((sum, c) => sum + c.timeTaken, 0);
    const fastestChallenge = completedChallenges.reduce((fastest, current) =>
      current.timeTaken < fastest.timeTaken ? current : fastest
    );

    return (
      <div className="min-h-screen flex items-center justify-center p-6 md:p-8 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-4xl w-full">
          <h1 className="text-5xl md:text-6xl font-bold text-center mb-8 text-success">
            🎉 All Done! 🎉
          </h1>

          <div className="bg-blue-100 rounded-2xl p-6 mb-8">
            <p className="text-2xl font-bold text-center mb-2">Total Time</p>
            <p className="text-6xl font-bold text-center text-primary">{formatCompletionTime(totalTime)}</p>
          </div>

          <div className="space-y-4 mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Your Results</h2>
            {completedChallenges.map((completion) => {
              const challenge = filteredChallenges.find((c) => c.id === completion.challengeId);
              const isFastest = completion.challengeId === fastestChallenge.challengeId;

              return (
                <div
                  key={completion.challengeId}
                  className={`p-4 md:p-6 rounded-2xl ${
                    isFastest ? 'bg-yellow-100 border-4 border-warning' : 'bg-gray-100'
                  }`}
                >
                  {/* Mobile: Stack vertically. Desktop: Horizontal */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    {/* Icon and text */}
                    <div className="flex items-center gap-3 md:gap-4">
                      <span className="text-6xl md:text-7xl flex-shrink-0">{challenge?.iconUrl}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-lg md:text-2xl font-bold leading-tight break-words">
                          {challenge?.text}
                        </p>
                        {isFastest && <span className="text-2xl md:text-3xl">⭐ Fastest!</span>}
                      </div>
                    </div>

                    {/* Time */}
                    <div className="flex justify-center sm:justify-end">
                      <span className="text-3xl md:text-4xl font-bold text-primary whitespace-nowrap">
                        {formatCompletionTime(completion.timeTaken)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <button
              onClick={handleRestart}
              className="flex-1 bg-success text-white px-12 py-6 rounded-2xl text-2xl font-bold hover:bg-green-700 transition-colors shadow-lg"
            >
              ↻ Start Over
            </button>
            <button
              onClick={onSwitchToAdmin}
              className="flex-1 bg-primary text-white px-12 py-6 rounded-2xl text-2xl font-bold hover:bg-blue-700 transition-colors shadow-lg"
            >
              ⚙️ Edit Challenges
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col p-4 sm:p-6 md:p-8 bg-gradient-to-br from-blue-50 to-purple-50">
      {showFireworks && <Fireworks />}

      {/* TabBar at top if tabs exist */}
      {tabs.length > 0 && activeTabId && (
        <div className="mb-4">
          <TabBar tabs={tabs} activeTabId={activeTabId} onTabChange={handleTabSwitch} />
        </div>
      )}

      <div className="flex-1 flex items-center justify-center">

      {/* Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
            <h2 className="text-3xl font-bold text-center mb-6">Are you sure?</h2>
            <p className="text-xl text-center mb-8 text-gray-700">
              This will restart all challenges
            </p>
            <div className="flex gap-4">
              {/* Thumbs Down - NO */}
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 bg-danger text-white px-6 py-8 rounded-2xl font-bold hover:bg-red-700 transition-colors shadow-lg active:scale-95 min-h-[100px] relative"
              >
                <div className="text-6xl mb-2">👎</div>
                <div className="text-2xl">NO</div>
              </button>

              {/* Thumbs Up - YES */}
              <button
                onClick={handleResetAll}
                className="flex-1 bg-success text-white px-6 py-8 rounded-2xl font-bold hover:bg-green-700 transition-colors shadow-lg active:scale-95 min-h-[100px] relative"
              >
                <div className="text-6xl mb-2">👍</div>
                <div className="text-2xl">YES</div>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 max-w-xl w-full">
        {/* Progress indicator with Reset button at top left and Sound toggle at top right */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowResetConfirm(true)}
                className="bg-warning text-white px-3 py-2 rounded-lg text-sm font-bold hover:bg-orange-600 transition-colors"
              >
                🔄 Reset
              </button>
              <span className="text-base font-bold">
                Challenge {currentIndex + 1} of {filteredChallenges.length}
              </span>
            </div>
            <button
              onClick={handleSoundToggle}
              className={`${
                soundEnabled ? 'bg-success' : 'bg-gray-300'
              } text-white px-3 py-2 rounded-lg text-sm font-bold hover:opacity-80 transition-all`}
              title={soundEnabled ? 'Sound On' : 'Sound Off'}
            >
              {soundEnabled ? '🔊' : '🔇'}
            </button>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-primary h-4 rounded-full transition-all duration-500"
              style={{ width: `${((currentIndex + 1) / filteredChallenges.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Timer Display Component - handles icon, text, timer, and buttons */}
        <TimerDisplay
          challenge={currentChallenge}
          onComplete={handleChallengeComplete}
          onNext={handleNext}
        />
      </div>
      </div>
    </div>
  );
};
