/**
 * Simple emoji icon mapping for challenges
 * Maps keywords to appropriate emojis
 */

const sportIconMap: Record<string, string> = {
  'boxing|box|punch': '🥊',
  'darts|dart|pdc': '🎯',
  'pool|billiard': '🎱',
  'tennis': '🎾',
  'golf': '⛳',
  'basketball': '🏀',
  'soccer|football': '⚽',
  'push-up|pushup': '💪',
  'pull-up|pullup': '🤸',
  'running|run': '🏃',
  'cycling|bike': '🚴',
  'swimming|swim': '🏊',
  'yoga': '🧘',
  'dumbbell|weight': '⚖️',
  'boxing-glove': '🥊',
  'music': '🎵',
  'reading|read': '📖',
  'water|drink': '💧',
  'meditation': '🧘',
  'dance': '💃',
};

export function getIconForChallenge(challengeText: string): string {
  const lower = challengeText.toLowerCase();

  for (const [keywords, emoji] of Object.entries(sportIconMap)) {
    if (keywords.split('|').some(kw => lower.includes(kw))) {
      return emoji;
    }
  }

  return '⭐';
}
