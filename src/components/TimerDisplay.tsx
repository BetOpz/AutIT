import { useTimer } from '../hooks/useTimer';
import { Challenge } from '../types';

interface TimerDisplayProps {
  challenge: Challenge;
  onComplete: (completionTime: number) => void;
  onNext: () => void;
}

export const TimerDisplay = ({ challenge, onComplete, onNext }: TimerDisplayProps) => {
  const timer = useTimer({
    itemId: challenge.id,
    timerType: challenge.timerType || 'none',
    duration: challenge.timerDuration,
  });

  const handleDone = () => {
    timer.stop();
    onComplete(timer.elapsedSeconds);
  };

  const getTimerLabel = (): string => {
    if (timer.isPaused) return '⏸ PAUSED';
    if (challenge.timerType === 'down') return 'Countdown';
    if (challenge.timerType === 'up') return 'Time';
    return 'Ready?';
  };

  const getDisplayTime = (): string => {
    if (challenge.timerType === 'down') {
      return timer.formatTime(timer.getRemainingSeconds());
    }
    return timer.formatTime(timer.elapsedSeconds);
  };

  const getProgressColor = (): string => {
    if (challenge.timerType !== 'down') return 'bg-blue-500';

    const percentage = timer.getProgressPercentage();
    if (percentage < 50) return 'bg-green-500';
    if (percentage < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-4">
      {/* Challenge Icon */}
      <div className="flex justify-center mb-4">
        <span style={{ fontSize: '120px', display: 'block', lineHeight: '1' }}>
          {challenge.iconUrl}
        </span>
      </div>

      {/* Challenge Text */}
      <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4 text-gray-900 leading-tight px-2">
        {challenge.text}
      </h2>

      {/* Best/Last Time Display */}
      {(challenge.bestTime || challenge.lastTime) && !timer.isRunning && !timer.isComplete && (
        <div className="flex justify-center gap-4 text-sm text-gray-600 mb-2">
          {challenge.bestTime && (
            <span>Best: {timer.formatTime(challenge.bestTime)}</span>
          )}
          {challenge.lastTime && (
            <span>Last: {timer.formatTime(challenge.lastTime)}</span>
          )}
        </div>
      )}

      {/* Timer Display */}
      <div
        className={`rounded-xl p-4 mb-4 transition-all ${
          timer.isPaused ? 'bg-gray-300' : 'bg-gray-100'
        }`}
      >
        <p className="text-lg font-bold text-center mb-1 text-gray-600">
          {getTimerLabel()}
        </p>

        {/* Countdown Progress Bar */}
        {challenge.timerType === 'down' && timer.isRunning && !timer.isPaused && (
          <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
            <div
              className={`h-3 rounded-full transition-all duration-1000 ${getProgressColor()}`}
              style={{ width: `${100 - timer.getProgressPercentage()}%` }}
            />
          </div>
        )}

        <p
          className={`text-5xl sm:text-6xl font-bold text-center tabular-nums ${
            timer.isPaused ? 'text-gray-500' : 'text-primary'
          }`}
        >
          {getDisplayTime()}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3">
        {/* START button */}
        {!timer.isRunning && !timer.isComplete && (
          <button
            onClick={timer.start}
            className="w-full bg-success text-white px-6 py-5 rounded-xl text-xl font-bold hover:bg-green-700 transition-colors shadow-lg active:scale-95 min-h-[64px]"
          >
            ▶️ START
          </button>
        )}

        {/* RESUME button */}
        {timer.isPaused && (
          <button
            onClick={timer.resume}
            className="w-full bg-success text-white px-6 py-5 rounded-xl text-xl font-bold hover:bg-green-700 transition-colors shadow-lg active:scale-95 min-h-[64px]"
          >
            ▶️ RESUME
          </button>
        )}

        {/* PAUSE button */}
        {timer.isRunning && !timer.isPaused && (
          <button
            onClick={timer.pause}
            className="w-full bg-warning text-white px-6 py-5 rounded-xl text-xl font-bold hover:bg-orange-600 transition-colors shadow-lg active:scale-95 min-h-[64px]"
          >
            ⏸️ PAUSE
          </button>
        )}

        {/* DONE button (for count-up or manual completion) */}
        {timer.isRunning && !timer.isPaused && challenge.timerType === 'up' && (
          <button
            onClick={handleDone}
            className="w-full bg-danger text-white px-6 py-5 rounded-xl text-xl font-bold hover:bg-red-700 transition-colors shadow-lg active:scale-95 min-h-[64px]"
          >
            ⏹️ DONE
          </button>
        )}

        {/* RESET TASK button */}
        {(timer.isRunning || timer.isPaused) && (
          <button
            onClick={timer.reset}
            className="w-full bg-gray-200 text-gray-700 px-6 py-4 rounded-xl text-base font-bold hover:bg-gray-300 transition-colors shadow-md active:scale-95"
          >
            🔄 Reset Task
          </button>
        )}

        {/* NEXT button (after completion) */}
        {timer.isComplete && (
          <button
            onClick={onNext}
            className="w-full bg-primary text-white px-6 py-5 rounded-xl text-xl font-bold hover:bg-blue-700 transition-colors shadow-lg active:scale-95 min-h-[64px]"
          >
            → NEXT
          </button>
        )}
      </div>
    </div>
  );
};
