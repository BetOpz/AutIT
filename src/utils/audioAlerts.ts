/**
 * Voice announcements for timer completion
 * Uses Web Speech Synthesis API
 */

let soundEnabled = false;

export function setSoundEnabled(enabled: boolean): void {
  soundEnabled = enabled;
  localStorage.setItem('soundEnabled', enabled ? 'true' : 'false');
}

export function getSoundEnabled(): boolean {
  const saved = localStorage.getItem('soundEnabled');
  return saved === 'true';
}

export function initializeSound(): void {
  soundEnabled = getSoundEnabled();
}

/**
 * Speak text using Web Speech Synthesis
 */
function speakText(text: string): void {
  if (!soundEnabled) return;
  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported');
    return;
  }

  // Cancel any ongoing speech
  speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.9;   // Slightly slower for clarity
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  speechSynthesis.speak(utterance);
}

/**
 * Announce countdown timer completion
 */
export function announceProcessComplete(): void {
  speakText('Process Complete');
}

/**
 * Announce elapsed time for count-up timer
 */
export function announceElapsedTime(seconds: number): void {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  let announcement = '';

  if (minutes > 0) {
    announcement += `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
  }

  if (secs > 0) {
    if (minutes > 0) announcement += ' ';
    announcement += `${secs} ${secs === 1 ? 'second' : 'seconds'}`;
  }

  if (announcement === '') {
    announcement = '0 seconds';
  }

  speakText(announcement);
}

/**
 * Test voice announcement
 */
export function testVoice(): void {
  speakText('Voice test');
}
