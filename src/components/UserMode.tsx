import { useState, useEffect } from 'react';
import { Challenge, ChallengeSession, Session } from '../types';
import { Fireworks } from './Fireworks';
import { generateId } from '../utils/storage';

interface UserModeProps {
  challenges: Challenge[];
  onSessionComplete: (session: Session) => void;
  onSwitchToAdmin: () => void;
}

export const UserMode = ({ challenges, onSessionComplete, onSwitchToAdmin }: UserModeProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [completedChallenges, setCompletedChallenges] = useState<ChallengeSession[]>([]);
  const [showFireworks, setShowFireworks] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const currentChallenge = challenges[currentIndex];
  const isLastChallenge = currentIndex === challenges.length - 1;

  // Timer logic
  useEffect(() => {
    let interval: number | undefined;

    if (isTimerRunning) {
      interval = window.setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setIsTimerRunning(true);
    setElapsedTime(0);
  };

  const handleStop = () => {
    setIsTimerRunning(false);

    // Save this challenge completion
    const newCompletion: ChallengeSession = {
      challengeId: currentChallenge.id,
      timeTaken: elapsedTime,
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

  const handleNext = () => {
    if (!isLastChallenge) {
      setCurrentIndex((prev) => prev + 1);
      setElapsedTime(0);
      setIsTimerRunning(false);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setElapsedTime(0);
    setIsTimerRunning(false);
    setCompletedChallenges([]);
    setShowSummary(false);
  };

  if (challenges.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-white">
        <div className="text-center">
          <p className="text-3xl font-bold mb-8">No challenges yet!</p>
          <button
            onClick={onSwitchToAdmin}
            className="bg-primary text-white px-12 py-6 rounded-2xl text-2xl font-bold hover:bg-blue-700 transition-colors shadow-lg"
          >
            Add Challenges
          </button>
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
            <p className="text-6xl font-bold text-center text-primary">{formatTime(totalTime)}</p>
          </div>

          <div className="space-y-4 mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Your Results</h2>
            {completedChallenges.map((completion) => {
              const challenge = challenges.find((c) => c.id === completion.challengeId);
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
                        {formatTime(completion.timeTaken)}
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
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 bg-gradient-to-br from-blue-50 to-purple-50">
      {showFireworks && <Fireworks />}

      <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 md:p-12 max-w-2xl w-full">
        {/* Progress indicator */}
        <div className="mb-6 md:mb-8">
          <div className="flex justify-between items-center mb-3">
            <span className="text-lg md:text-xl font-bold">
              Challenge {currentIndex + 1} of {challenges.length}
            </span>
            <span className="text-lg md:text-xl font-bold text-gray-500">
              {Math.round(((currentIndex + 1) / challenges.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-5">
            <div
              className="bg-primary h-5 rounded-full transition-all duration-500"
              style={{ width: `${((currentIndex + 1) / challenges.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Challenge icon - Extra large on mobile for autism-friendly design */}
        <div className="flex justify-center mb-6 md:mb-8">
          <span style={{ fontSize: '200px', display: 'block', lineHeight: '1' }}>
            {currentChallenge.iconUrl}
          </span>
        </div>

        {/* Challenge text - Larger, more readable on mobile */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-8 md:mb-12 text-gray-900 leading-tight px-2">
          {currentChallenge.text}
        </h1>

        {/* Timer display - Optimized for mobile */}
        <div className="bg-gray-100 rounded-2xl p-6 md:p-8 mb-6 md:mb-8">
          <p className="text-xl md:text-2xl font-bold text-center mb-2 md:mb-3 text-gray-600">
            {isTimerRunning ? 'Time' : 'Ready?'}
          </p>
          <p className="text-6xl sm:text-7xl md:text-8xl font-bold text-center text-primary tabular-nums">
            {formatTime(elapsedTime)}
          </p>
        </div>

        {/* Action buttons - Extra large tap targets for children */}
        <div className="flex flex-col gap-4">
          {!isTimerRunning && elapsedTime === 0 && (
            <button
              onClick={handleStart}
              className="w-full bg-success text-white px-8 sm:px-12 py-6 sm:py-8 rounded-2xl text-2xl sm:text-3xl font-bold hover:bg-green-700 transition-colors shadow-lg active:scale-95 min-h-[72px]"
            >
              ▶️ START
            </button>
          )}

          {isTimerRunning && (
            <button
              onClick={handleStop}
              className="w-full bg-danger text-white px-8 sm:px-12 py-6 sm:py-8 rounded-2xl text-2xl sm:text-3xl font-bold hover:bg-red-700 transition-colors shadow-lg active:scale-95 min-h-[72px]"
            >
              ⏹️ DONE
            </button>
          )}

          {!isTimerRunning && elapsedTime > 0 && !showFireworks && (
            <button
              onClick={handleNext}
              className="w-full bg-primary text-white px-8 sm:px-12 py-6 sm:py-8 rounded-2xl text-2xl sm:text-3xl font-bold hover:bg-blue-700 transition-colors shadow-lg active:scale-95 min-h-[72px]"
            >
              {isLastChallenge ? '✓ FINISH' : '→ NEXT CHALLENGE'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
