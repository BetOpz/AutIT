import { useState, useEffect } from 'react';
import { Challenge } from '../types';
import { generateId } from '../utils/storage';
import { tablerSearchService } from '../services/tabler-search.service';
import * as TablerIcons from '@tabler/icons-react';

interface AdminPanelProps {
  challenges: Challenge[];
  onUpdateChallenges: (challenges: Challenge[]) => void;
  onSwitchToUser: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
}

// Common emoji options for challenges
const EMOJI_OPTIONS = [
  '🛏️', '💧', '💪', '🧘', '📚', '🍎', '🏃', '🧼', '🪥', '🧹',
  '🍽️', '📖', '✍️', '🎨', '🎵', '🌱', '☀️', '🌙', '⏰', '🎯',
  '🧩', '🎮', '📱', '💻', '🎧', '🎬', '📷', '🍕', '🥗', '☕',
];

// Load custom AI-suggested icons from localStorage
const loadCustomIcons = (): string[] => {
  try {
    const stored = localStorage.getItem('customIcons');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Save custom icons to localStorage
const saveCustomIcons = (icons: string[]) => {
  try {
    localStorage.setItem('customIcons', JSON.stringify(icons));
  } catch (error) {
    console.error('Failed to save custom icons:', error);
  }
};

export const AdminPanel = ({
  challenges,
  onUpdateChallenges,
  onSwitchToUser,
  onExport,
  onImport,
}: AdminPanelProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [editIcon, setEditIcon] = useState('');
  const [newChallengeText, setNewChallengeText] = useState('');
  const [newChallengeIcon, setNewChallengeIcon] = useState('🎯');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiPickerFor, setEmojiPickerFor] = useState<'new' | 'edit'>('new');

  // AI Icon Generation state
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiGenerationError, setAiGenerationError] = useState<string | null>(null);
  const [generatedIconPreview, setGeneratedIconPreview] = useState<string | null>(null);
  const [iconMode, setIconMode] = useState<'emoji' | 'ai'>('emoji');
  const [showDebugInfo, setShowDebugInfo] = useState(false);

  // Custom AI-suggested icons (persisted in localStorage)
  const [customIcons, setCustomIcons] = useState<string[]>(() => loadCustomIcons());

  // Icon suggestions
  const [iconSuggestions, setIconSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Initialize Tabler search service
  useEffect(() => {
    tablerSearchService.initialize();
  }, []);

  // Auto-suggest icons when challenge text changes
  useEffect(() => {
    if (newChallengeText.trim().length > 3 && iconMode === 'ai') {
      const suggestions = tablerSearchService.findMatchingIcons(newChallengeText, 5);
      setIconSuggestions(suggestions.map(s => s.name));
      setShowSuggestions(suggestions.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [newChallengeText, iconMode]);

  const handleAddChallenge = () => {
    if (!newChallengeText.trim()) {
      alert('Please enter challenge text');
      return;
    }

    const newChallenge: Challenge = {
      id: generateId(),
      text: newChallengeText.trim(),
      iconUrl: newChallengeIcon,
      createdAt: new Date().toISOString(),
      order: challenges.length + 1,
    };

    onUpdateChallenges([...challenges, newChallenge]);
    setNewChallengeText('');
    setNewChallengeIcon('🎯');
    setGeneratedIconPreview(null);
    setIconMode('emoji');
  };

  const handleSelectSuggestion = (iconName: string) => {
    const tablerIconKey = `tabler:${iconName}`;

    console.log('Selected icon:', iconName);

    // Store as "tabler:iconname" format
    setGeneratedIconPreview(tablerIconKey);
    setNewChallengeIcon(tablerIconKey);
    setIconMode('ai');

    // Add to custom icons if not already there
    if (!customIcons.includes(tablerIconKey)) {
      const updated = [...customIcons, tablerIconKey];
      setCustomIcons(updated);
      saveCustomIcons(updated);
      console.log('Added to custom icons:', tablerIconKey);
    }

    setShowSuggestions(false);
  };

  const handleGenerateAIIcon = async () => {
    if (!newChallengeText.trim()) {
      alert('Please enter challenge text first');
      return;
    }

    // Use local search instead of API
    setIsGeneratingAI(true);
    setAiGenerationError(null);

    try {
      const suggestions = tablerSearchService.findMatchingIcons(newChallengeText, 1);

      if (suggestions.length === 0) {
        throw new Error('No matching icons found. Try different keywords.');
      }

      // Auto-select the best match
      handleSelectSuggestion(suggestions[0].name);
    } catch (error) {
      console.error('Icon search error:', error);
      setAiGenerationError(error instanceof Error ? error.message : 'Failed to find matching icon');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleRegenerateIcon = () => {
    handleGenerateAIIcon();
  };

  const handleUseEmoji = () => {
    setIconMode('emoji');
    setNewChallengeIcon('🎯');
    setGeneratedIconPreview(null);
  };

  const handleStartEdit = (challenge: Challenge) => {
    setEditingId(challenge.id);
    setEditText(challenge.text);
    setEditIcon(challenge.iconUrl);
  };

  const handleSaveEdit = () => {
    if (!editText.trim()) {
      alert('Please enter challenge text');
      return;
    }

    const updated = challenges.map((c) =>
      c.id === editingId ? { ...c, text: editText.trim(), iconUrl: editIcon } : c
    );
    onUpdateChallenges(updated);
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText('');
    setEditIcon('');
  };

  const handleDelete = (id: string) => {
    const updated = challenges
      .filter((c) => c.id !== id)
      .map((c, index) => ({ ...c, order: index + 1 }));
    onUpdateChallenges(updated);
    setShowDeleteConfirm(null);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;

    const updated = [...challenges];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    updated.forEach((c, i) => (c.order = i + 1));
    onUpdateChallenges(updated);
  };

  const handleMoveDown = (index: number) => {
    if (index === challenges.length - 1) return;

    const updated = [...challenges];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    updated.forEach((c, i) => (c.order = i + 1));
    onUpdateChallenges(updated);
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImport(file);
      event.target.value = ''; // Reset input
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    if (emojiPickerFor === 'new') {
      setNewChallengeIcon(emoji);
      setIconMode('emoji');
    } else {
      setEditIcon(emoji);
    }
    setShowEmojiPicker(false);
  };

  // Check if icon is AI-suggested Tabler icon or emoji
  const isTablerIcon = (iconUrl: string): boolean => {
    return iconUrl.startsWith('tabler:');
  };

  // Helper to render Tabler icon component
  const renderTablerIcon = (iconUrl: string, size: number = 64) => {
    if (!isTablerIcon(iconUrl)) return null;

    const iconName = iconUrl.replace('tabler:', '');
    // Convert icon name to PascalCase for Tabler component (e.g., "target" -> "IconTarget")
    const componentName = `Icon${iconName.charAt(0).toUpperCase()}${iconName.slice(1)}`;

    // Get the icon component from Tabler
    const IconComponent = (TablerIcons as any)[componentName];

    if (!IconComponent) {
      console.warn(`Tabler icon not found: ${componentName}`);
      return <div className="text-red-500">Icon not found: {iconName}</div>;
    }

    return <IconComponent size={size} stroke={2} />;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-lg p-4 sm:p-6 md:p-8 mb-4 md:mb-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900">⚙️ Admin Panel</h1>
            <button
              onClick={onSwitchToUser}
              className="w-full md:w-auto bg-primary text-white px-8 py-4 rounded-xl text-lg sm:text-xl font-bold hover:bg-blue-700 transition-colors shadow-md min-h-[56px]"
            >
              ← Back to Challenges
            </button>
          </div>
        </div>

        {/* Import/Export */}
        <div className="bg-white rounded-3xl shadow-lg p-4 sm:p-6 md:p-8 mb-4 md:mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Backup & Restore</h2>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              onClick={onExport}
              className="flex-1 bg-success text-white px-6 sm:px-8 py-4 rounded-xl text-lg sm:text-xl font-bold hover:bg-green-700 transition-colors shadow-md min-h-[56px]"
            >
              📥 Export Data
            </button>
            <label className="flex-1">
              <input
                type="file"
                accept=".json"
                onChange={handleFileImport}
                className="hidden"
              />
              <div className="bg-warning text-white px-6 sm:px-8 py-4 rounded-xl text-lg sm:text-xl font-bold hover:bg-orange-600 transition-colors shadow-md cursor-pointer text-center min-h-[56px] flex items-center justify-center">
                📤 Import Data
              </div>
            </label>
          </div>
        </div>

        {/* Debug Info */}
        <div className="bg-white rounded-3xl shadow-lg p-4 sm:p-6 md:p-8 mb-4 md:mb-6">
          <button
            onClick={() => setShowDebugInfo(!showDebugInfo)}
            className="text-lg sm:text-xl font-bold text-gray-700 hover:text-primary transition-colors min-h-[48px] w-full text-left"
          >
            🔧 {showDebugInfo ? 'Hide' : 'Show'} Debug Info
          </button>

          {showDebugInfo && (
            <div className="mt-4 space-y-4">
              <div className="bg-gray-100 rounded-xl p-4">
                <h3 className="text-2xl font-bold mb-3">Environment Status</h3>
                <div className="space-y-2 font-mono text-sm">
                  {/* Local Tabler Search */}
                  <div className="flex items-center gap-2">
                    <span className={tablerSearchService.isReady() ? 'text-green-600' : 'text-yellow-600'}>
                      {tablerSearchService.isReady() ? '✅' : '⏳'}
                    </span>
                    <span className="font-bold">Tabler Search:</span>
                    <span>{tablerSearchService.isReady() ? 'Ready (5,000+ icons)' : 'Loading...'}</span>
                  </div>

                  {/* Gemini API (backup) */}
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">💤</span>
                    <span className="font-bold">Gemini API:</span>
                    <span className="text-gray-500">Available (not currently used)</span>
                  </div>

                  <div className="pl-6 space-y-1 text-gray-700 mt-3">
                    <div>Search Mode: Local keyword matching</div>
                    <div>Custom Icons: {customIcons.length}</div>
                    <div>API Calls: None (100% local)</div>
                  </div>

                  <div className="mt-4 p-4 bg-green-100 border-2 border-green-400 rounded-lg">
                    <p className="font-bold text-green-800 mb-2">⚡ Local Tabler Icon Search</p>
                    <p className="text-sm text-green-700">
                      Smart keyword matching across 5,000+ Tabler icons - no API calls needed!
                    </p>
                    <p className="text-sm text-green-700 mt-2">
                      Type your challenge and get instant icon suggestions as you type.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-green-100 rounded-xl p-4">
                <h3 className="text-lg font-bold mb-2 text-green-800">⚡ How It Works</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-green-700">
                  <li>Type your challenge description (e.g., "Go for a run")</li>
                  <li>Icon suggestions appear instantly as you type</li>
                  <li>Click a suggestion or use "Find Best Match" button</li>
                  <li>Selected icons are saved to your custom icon picker</li>
                  <li>100% local search - no API calls, no delays, no errors</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Add New Challenge */}
        <div className="bg-white rounded-3xl shadow-lg p-4 sm:p-6 md:p-8 mb-4 md:mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Add New Challenge</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-lg sm:text-xl font-bold mb-2">Challenge Text</label>
              <input
                type="text"
                value={newChallengeText}
                onChange={(e) => setNewChallengeText(e.target.value.slice(0, 100))}
                placeholder="Enter challenge description..."
                className="w-full px-4 sm:px-6 py-3 sm:py-4 text-lg sm:text-2xl border-4 border-gray-300 rounded-xl focus:border-primary focus:outline-none min-h-[56px]"
                maxLength={100}
              />
              <p className="text-base sm:text-lg text-gray-500 mt-2">
                {newChallengeText.length}/100 characters
              </p>
            </div>

            <div>
              <label className="block text-lg sm:text-xl font-bold mb-2">Icon</label>

              {/* Icon Mode Tabs */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setIconMode('emoji')}
                  className={`flex-1 px-4 sm:px-6 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-bold transition-colors min-h-[56px] ${
                    iconMode === 'emoji'
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  😊 Emoji
                </button>
                <button
                  onClick={() => setIconMode('ai')}
                  className={`flex-1 px-4 sm:px-6 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-bold transition-colors min-h-[56px] ${
                    iconMode === 'ai'
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  🤖 AI Generated
                </button>
              </div>

              {/* Emoji Mode */}
              {iconMode === 'emoji' && (
                <div>
                  <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
                    <div className="text-7xl sm:text-8xl">{newChallengeIcon}</div>
                    <button
                      onClick={() => {
                        setEmojiPickerFor('new');
                        setShowEmojiPicker(!showEmojiPicker);
                      }}
                      className="w-full sm:w-auto bg-gray-200 text-gray-900 px-6 py-3 rounded-xl text-base sm:text-lg font-bold hover:bg-gray-300 transition-colors min-h-[56px]"
                    >
                      Choose Emoji
                    </button>
                  </div>

                  {showEmojiPicker && (
                    <div className="bg-gray-100 rounded-xl p-4">
                      <p className="text-base sm:text-lg font-bold mb-3">Select an icon:</p>

                      {/* Custom AI-suggested icons */}
                      {customIcons.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-bold text-purple-600 mb-2">🤖 AI-Suggested Icons:</p>
                          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-10 gap-2 sm:gap-3">
                            {customIcons.map((iconKey) => (
                              <button
                                key={iconKey}
                                onClick={() => handleEmojiSelect(iconKey)}
                                className="flex items-center justify-center hover:bg-gray-200 rounded-lg p-3 transition-colors min-h-[64px] min-w-[64px] active:scale-95 bg-white border-2 border-purple-200"
                              >
                                {renderTablerIcon(iconKey, 32)}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Standard emojis */}
                      <p className="text-sm font-bold text-gray-600 mb-2">😊 Standard Emojis:</p>
                      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-10 gap-2 sm:gap-3">
                        {EMOJI_OPTIONS.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => handleEmojiSelect(emoji)}
                            className="text-4xl sm:text-5xl hover:bg-gray-200 rounded-lg p-3 transition-colors min-h-[64px] min-w-[64px] active:scale-95"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* AI Mode */}
              {iconMode === 'ai' && (
                <div className="space-y-4">
                  {/* Icon Suggestions */}
                  {showSuggestions && iconSuggestions.length > 0 && (
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 border-2 border-green-200">
                      <p className="text-sm font-bold text-gray-700 mb-3">⚡ Instant Suggestions:</p>
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
                        {iconSuggestions.map((iconName) => (
                          <button
                            key={iconName}
                            onClick={() => handleSelectSuggestion(iconName)}
                            className="flex flex-col items-center gap-2 p-3 bg-white rounded-lg border-2 border-transparent hover:border-green-400 hover:bg-green-50 transition-all active:scale-95"
                          >
                            <div className="flex items-center justify-center w-12 h-12">
                              {renderTablerIcon(`tabler:${iconName}`, 40)}
                            </div>
                            <span className="text-xs text-gray-600 text-center leading-tight">{iconName}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {!generatedIconPreview && !isGeneratingAI && (
                    <div className="text-center py-6 sm:py-8 bg-gray-100 rounded-xl">
                      <p className="text-lg sm:text-xl mb-4 px-4">Find the perfect icon for your challenge</p>
                      <button
                        onClick={handleGenerateAIIcon}
                        className="w-full sm:w-auto px-6 sm:px-8 py-4 rounded-xl text-lg sm:text-xl font-bold transition-colors bg-green-600 text-white hover:bg-green-700 cursor-pointer min-h-[56px]"
                      >
                        ⚡ Find Best Match
                      </button>
                      {!newChallengeText.trim() ? (
                        <p className="text-sm sm:text-base text-gray-500 mt-3 px-4">
                          💡 Enter challenge text above to see suggestions
                        </p>
                      ) : (
                        showSuggestions && (
                          <p className="text-sm sm:text-base text-green-600 mt-3 px-4">
                            👆 Click a suggestion above or use "Find Best Match"
                          </p>
                        )
                      )}
                    </div>
                  )}

                  {isGeneratingAI && (
                    <div className="text-center py-12 bg-green-50 rounded-xl">
                      <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mb-4"></div>
                      <p className="text-2xl font-bold text-green-700">Finding best match...</p>
                      <p className="text-lg text-gray-600 mt-2">Searching 5,000+ icons</p>
                    </div>
                  )}

                  {generatedIconPreview && (
                    <div className="bg-gray-100 rounded-xl p-4 sm:p-6">
                      <div className="text-center mb-4">
                        <div className="inline-flex items-center justify-center bg-white rounded-2xl p-8 shadow-lg">
                          {renderTablerIcon(generatedIconPreview, 128)}
                        </div>
                        <p className="text-sm text-gray-600 mt-3">
                          Icon: {generatedIconPreview.replace('tabler:', '')}
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={handleRegenerateIcon}
                          className="flex-1 bg-warning text-white px-6 py-3 rounded-xl text-base sm:text-lg font-bold hover:bg-orange-600 transition-colors min-h-[56px]"
                        >
                          🔄 Regenerate
                        </button>
                        <button
                          onClick={handleUseEmoji}
                          className="flex-1 bg-gray-300 text-gray-900 px-6 py-3 rounded-xl text-base sm:text-lg font-bold hover:bg-gray-400 transition-colors min-h-[56px]"
                        >
                          Use Emoji Instead
                        </button>
                      </div>
                    </div>
                  )}

                  {aiGenerationError && (
                    <div className="bg-red-100 border-4 border-red-400 rounded-xl p-4">
                      <p className="text-lg font-bold text-red-700">❌ Error: {aiGenerationError}</p>
                      <button
                        onClick={handleGenerateAIIcon}
                        className="mt-3 bg-red-600 text-white px-6 py-2 rounded-lg text-base font-bold hover:bg-red-700"
                      >
                        Try Again
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={handleAddChallenge}
              className="w-full bg-success text-white px-6 sm:px-8 py-5 sm:py-6 rounded-xl text-xl sm:text-2xl font-bold hover:bg-green-700 transition-colors shadow-md min-h-[60px] active:scale-95"
            >
              ✓ Add Challenge
            </button>
          </div>
        </div>

        {/* Challenge List */}
        <div className="bg-white rounded-3xl shadow-lg p-4 sm:p-6 md:p-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">
            Challenges ({challenges.length})
          </h2>

          {challenges.length === 0 ? (
            <p className="text-xl sm:text-2xl text-gray-500 text-center py-8 sm:py-12">
              No challenges yet. Add one above!
            </p>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {challenges.map((challenge, index) => (
                <div
                  key={challenge.id}
                  className="border-4 border-gray-200 rounded-2xl p-4 sm:p-6 hover:border-primary transition-colors"
                >
                  {editingId === challenge.id ? (
                    // Edit mode
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
                        {isTablerIcon(editIcon) ? (
                          <div className="flex items-center justify-center bg-white rounded-xl p-4 border-2 border-gray-300">
                            {renderTablerIcon(editIcon, 64)}
                          </div>
                        ) : (
                          <div className="text-5xl sm:text-6xl">{editIcon}</div>
                        )}
                        <button
                          onClick={() => {
                            setEmojiPickerFor('edit');
                            setShowEmojiPicker(!showEmojiPicker);
                          }}
                          className="w-full sm:w-auto bg-gray-200 text-gray-900 px-4 py-3 rounded-lg text-base font-bold hover:bg-gray-300 transition-colors min-h-[48px]"
                        >
                          Change
                        </button>
                      </div>

                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value.slice(0, 100))}
                        className="w-full px-4 py-3 text-lg sm:text-xl border-4 border-gray-300 rounded-xl focus:border-primary focus:outline-none min-h-[56px]"
                        maxLength={100}
                      />

                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={handleSaveEdit}
                          className="flex-1 bg-success text-white px-6 py-3 rounded-xl text-base sm:text-lg font-bold hover:bg-green-700 transition-colors min-h-[56px]"
                        >
                          ✓ Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="flex-1 bg-gray-300 text-gray-900 px-6 py-3 rounded-xl text-base sm:text-lg font-bold hover:bg-gray-400 transition-colors min-h-[56px]"
                        >
                          ✗ Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View mode
                    <div className="space-y-4">
                      {/* Icon and Text Section */}
                      <div className="flex items-center gap-3 sm:gap-4">
                        {isTablerIcon(challenge.iconUrl) ? (
                          <div className="flex items-center justify-center bg-white rounded-xl p-3 border-2 border-purple-200 flex-shrink-0">
                            {renderTablerIcon(challenge.iconUrl, 48)}
                          </div>
                        ) : (
                          <div className="text-5xl sm:text-6xl flex-shrink-0">{challenge.iconUrl}</div>
                        )}

                        <div className="flex-grow min-w-0">
                          <p className="text-lg sm:text-2xl font-bold break-words leading-tight">{challenge.text}</p>
                          <p className="text-sm sm:text-base text-gray-500 mt-1">
                            Order: {challenge.order} • {isTablerIcon(challenge.iconUrl) ? '🤖 AI Icon' : '😊 Emoji'}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons Section */}
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                        {/* Reorder buttons */}
                        <div className="flex gap-2 sm:gap-3">
                          <button
                            onClick={() => handleMoveUp(index)}
                            disabled={index === 0}
                            className={`flex-1 sm:flex-none px-6 py-3 rounded-lg text-base sm:text-lg font-bold min-h-[48px] ${
                              index === 0
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-blue-100 text-primary hover:bg-blue-200'
                            }`}
                          >
                            ↑ Up
                          </button>
                          <button
                            onClick={() => handleMoveDown(index)}
                            disabled={index === challenges.length - 1}
                            className={`flex-1 sm:flex-none px-6 py-3 rounded-lg text-base sm:text-lg font-bold min-h-[48px] ${
                              index === challenges.length - 1
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-blue-100 text-primary hover:bg-blue-200'
                            }`}
                          >
                            ↓ Down
                          </button>
                        </div>

                        {/* Edit/Delete buttons */}
                        <div className="flex gap-2 sm:gap-3">
                          <button
                            onClick={() => handleStartEdit(challenge)}
                            className="flex-1 bg-warning text-white px-6 py-3 rounded-lg text-base sm:text-lg font-bold hover:bg-orange-600 transition-colors min-h-[48px]"
                          >
                            ✏️ Edit
                          </button>

                          {showDeleteConfirm === challenge.id ? (
                            <>
                              <button
                                onClick={() => handleDelete(challenge.id)}
                                className="flex-1 bg-danger text-white px-6 py-3 rounded-lg text-base sm:text-lg font-bold hover:bg-red-700 transition-colors min-h-[48px]"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setShowDeleteConfirm(null)}
                                className="flex-1 bg-gray-300 text-gray-900 px-6 py-3 rounded-lg text-base sm:text-lg font-bold hover:bg-gray-400 transition-colors min-h-[48px]"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => setShowDeleteConfirm(challenge.id)}
                              className="flex-1 bg-danger text-white px-6 py-3 rounded-lg text-base sm:text-lg font-bold hover:bg-red-700 transition-colors min-h-[48px]"
                            >
                              🗑️ Delete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
