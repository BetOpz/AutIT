import { useState, useEffect } from 'react';
import { Challenge } from '../types';
import { generateId } from '../utils/storage';
import { getIconForChallenge } from '../utils/iconMapping';
import { TabManager } from './TabManager';
import { Tab, TimerType } from '../types/tab.types';
import { loadTabs } from '../utils/tabHelpers';

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
  '🥊', '🎯', '🎱', '🎾', '⛳', '🏀', '⚽', '🤸', '🚴', '🏊',
  '⚖️', '💃', '⭐', '🔥', '💎', '🎪', '🎭', '🎺', '🎸', '🎹',
];

export const AdminPanel = ({
  challenges,
  onUpdateChallenges,
  onSwitchToUser,
  onExport,
  onImport,
}: AdminPanelProps) => {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [editIcon, setEditIcon] = useState('');
  const [newChallengeText, setNewChallengeText] = useState('');
  const [newChallengeIcon, setNewChallengeIcon] = useState<string | null>(null); // null means use auto-detect
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiPickerFor, setEmojiPickerFor] = useState<'new' | 'edit'>('new');
  const [showTabManager, setShowTabManager] = useState(false);

  // New fields for tab and timer
  const [newTabId, setNewTabId] = useState<string>('');
  const [newTimerType, setNewTimerType] = useState<TimerType>('none');
  const [newTimerDuration, setNewTimerDuration] = useState<number>(5); // default 5 minutes

  // Edit fields for tab and timer
  const [editTabId, setEditTabId] = useState<string>('');
  const [editTimerType, setEditTimerType] = useState<TimerType>('none');
  const [editTimerDuration, setEditTimerDuration] = useState<number>(5);

  // Load tabs on mount and assign unassigned challenges to first tab
  useEffect(() => {
    const loadedTabs = loadTabs();
    setTabs(loadedTabs);

    // Set default tab if available
    if (loadedTabs.length > 0 && !newTabId) {
      setNewTabId(loadedTabs[0].id);

      // Auto-assign challenges without tabId to the first tab
      const unassignedChallenges = challenges.filter(c => !c.tabId);
      if (unassignedChallenges.length > 0) {
        const updatedChallenges = challenges.map(c =>
          !c.tabId ? { ...c, tabId: loadedTabs[0].id, updatedAt: new Date().toISOString() } : c
        );
        onUpdateChallenges(updatedChallenges);
      }
    }
  }, []);

  // Update default tab selection when tabs change
  useEffect(() => {
    if (tabs.length > 0 && !newTabId) {
      setNewTabId(tabs[0].id);
    }
  }, [tabs, newTabId]);

  // Refresh tabs when TabManager closes
  const handleTabManagerClose = () => {
    setShowTabManager(false);
    const loadedTabs = loadTabs();
    setTabs(loadedTabs);
    // Update newTabId if it was deleted
    if (newTabId && !loadedTabs.find(t => t.id === newTabId)) {
      setNewTabId(loadedTabs.length > 0 ? loadedTabs[0].id : '');
    }
  };

  const handleAddChallenge = () => {
    if (!newChallengeText.trim()) {
      alert('Please enter challenge text');
      return;
    }

    // Validate tab selection
    if (!newTabId && tabs.length > 0) {
      alert('Please select a tab');
      return;
    }

    // Use manually selected icon if available, otherwise auto-detect
    const finalIcon = newChallengeIcon ?? getIconForChallenge(newChallengeText);

    const newChallenge: Challenge = {
      id: generateId(),
      text: newChallengeText.trim(),
      iconUrl: finalIcon,
      createdAt: new Date().toISOString(),
      order: challenges.length + 1,
      // New fields
      tabId: newTabId || undefined,
      timerType: newTimerType,
      timerDuration: newTimerType === 'down' ? newTimerDuration * 60 : undefined, // convert minutes to seconds
      completionTimes: [],
      bestTime: undefined,
      lastTime: undefined,
      updatedAt: new Date().toISOString(),
    };

    onUpdateChallenges([...challenges, newChallenge]);
    setNewChallengeText('');
    setNewChallengeIcon(null); // Reset to auto-detect for next challenge
    // Reset timer fields but keep tab and timer type
    setNewTimerDuration(5);
  };

  const handleStartEdit = (challenge: Challenge) => {
    setEditingId(challenge.id);
    setEditText(challenge.text);
    setEditIcon(challenge.iconUrl);
    // Load tab and timer fields
    setEditTabId(challenge.tabId || (tabs.length > 0 ? tabs[0].id : ''));
    setEditTimerType(challenge.timerType || 'none');
    setEditTimerDuration(
      challenge.timerDuration ? Math.round(challenge.timerDuration / 60) : 5
    ); // convert seconds to minutes
  };

  const handleSaveEdit = () => {
    if (!editText.trim()) {
      alert('Please enter challenge text');
      return;
    }

    // Validate tab selection
    if (!editTabId && tabs.length > 0) {
      alert('Please select a tab');
      return;
    }

    const updated = challenges.map((c) =>
      c.id === editingId
        ? {
            ...c,
            text: editText.trim(),
            iconUrl: editIcon,
            tabId: editTabId || undefined,
            timerType: editTimerType,
            timerDuration: editTimerType === 'down' ? editTimerDuration * 60 : undefined, // convert minutes to seconds
            updatedAt: new Date().toISOString(),
          }
        : c
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
    } else {
      setEditIcon(emoji);
    }
    setShowEmojiPicker(false);
  };

  // Preview auto-detected icon
  const autoDetectedIcon = newChallengeText ? getIconForChallenge(newChallengeText) : '⭐';

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-lg p-4 sm:p-6 md:p-8 mb-4 md:mb-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900">⚙️ Admin Panel</h1>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <button
                onClick={() => setShowTabManager(true)}
                className="w-full sm:w-auto bg-warning text-white px-8 py-4 rounded-xl text-lg sm:text-xl font-bold hover:bg-orange-600 transition-colors shadow-md min-h-[56px]"
              >
                📑 Manage Tabs
              </button>
              <button
                onClick={onSwitchToUser}
                className="w-full sm:w-auto bg-primary text-white px-8 py-4 rounded-xl text-lg sm:text-xl font-bold hover:bg-blue-700 transition-colors shadow-md min-h-[56px]"
              >
                ← Back to Challenges
              </button>
            </div>
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

            {/* Icon Selection */}
            <div>
              <label className="block text-lg sm:text-xl font-bold mb-2">Icon</label>

              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border-2 border-green-200">
                {/* Current icon display */}
                <div className="flex items-center gap-4 mb-4">
                  <span style={{ fontSize: '64px', display: 'block' }}>
                    {newChallengeIcon ?? autoDetectedIcon}
                  </span>
                  <div className="flex-1">
                    {newChallengeIcon ? (
                      <div>
                        <p className="text-base font-bold text-gray-700">✓ Custom Icon Selected</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Using your manually selected icon
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-base font-bold text-gray-700">🤖 Auto-Detected Icon</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {newChallengeText
                            ? 'Based on your challenge text'
                            : 'Type challenge text to see suggestion'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEmojiPickerFor('new');
                      setShowEmojiPicker(!showEmojiPicker);
                    }}
                    className="flex-1 bg-primary text-white px-4 py-3 rounded-lg text-base font-bold hover:bg-blue-700 transition-colors min-h-[48px]"
                  >
                    {newChallengeIcon ? 'Change Icon' : 'Choose Different Icon'}
                  </button>
                  {newChallengeIcon && (
                    <button
                      onClick={() => setNewChallengeIcon(null)}
                      className="flex-1 bg-gray-300 text-gray-900 px-4 py-3 rounded-lg text-base font-bold hover:bg-gray-400 transition-colors min-h-[48px]"
                    >
                      Use Auto-Detect
                    </button>
                  )}
                </div>

                {/* Emoji picker */}
                {showEmojiPicker && emojiPickerFor === 'new' && (
                  <div className="bg-white rounded-xl p-4 mt-4 border-2 border-gray-300">
                    <p className="text-base sm:text-lg font-bold mb-3">Select an icon:</p>
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
            </div>

            {/* Tab Selection */}
            {tabs.length > 0 && (
              <div>
                <label className="block text-lg sm:text-xl font-bold mb-2">Tab</label>
                <select
                  value={newTabId}
                  onChange={(e) => setNewTabId(e.target.value)}
                  className="w-full px-4 py-3 text-lg border-4 border-gray-300 rounded-xl focus:border-primary focus:outline-none min-h-[56px]"
                >
                  {tabs.map((tab) => (
                    <option key={tab.id} value={tab.id}>
                      {tab.icon} {tab.name}
                    </option>
                  ))}
                </select>
                <p className="text-base text-gray-500 mt-2">
                  Assign this challenge to a tab
                </p>
              </div>
            )}

            {/* Timer Configuration */}
            <div>
              <label className="block text-lg sm:text-xl font-bold mb-2">Timer</label>
              <select
                value={newTimerType}
                onChange={(e) => setNewTimerType(e.target.value as TimerType)}
                className="w-full px-4 py-3 text-lg border-4 border-gray-300 rounded-xl focus:border-primary focus:outline-none min-h-[56px]"
              >
                <option value="none">⭕ No Timer</option>
                <option value="up">⏱️ Count Up (stopwatch)</option>
                <option value="down">⏳ Count Down (timer)</option>
              </select>
              <p className="text-base text-gray-500 mt-2">
                {newTimerType === 'none' && 'No timer for this challenge'}
                {newTimerType === 'up' && 'Timer starts at 0:00 and counts up'}
                {newTimerType === 'down' && 'Timer counts down from set duration'}
              </p>
            </div>

            {/* Duration for Countdown */}
            {newTimerType === 'down' && (
              <div>
                <label className="block text-lg sm:text-xl font-bold mb-2">
                  Countdown Duration (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={newTimerDuration}
                  onChange={(e) => setNewTimerDuration(Math.max(1, Math.min(60, parseInt(e.target.value) || 1)))}
                  className="w-full px-4 py-3 text-lg border-4 border-gray-300 rounded-xl focus:border-primary focus:outline-none min-h-[56px]"
                />
                <p className="text-base text-gray-500 mt-2">
                  Timer will count down from {newTimerDuration} minute{newTimerDuration !== 1 ? 's' : ''}
                </p>
              </div>
            )}

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
                        <div className="text-5xl sm:text-6xl">{editIcon}</div>
                        <button
                          onClick={() => {
                            setEmojiPickerFor('edit');
                            setShowEmojiPicker(!showEmojiPicker);
                          }}
                          className="w-full sm:w-auto bg-gray-200 text-gray-900 px-4 py-3 rounded-lg text-base font-bold hover:bg-gray-300 transition-colors min-h-[48px]"
                        >
                          Change Icon
                        </button>
                      </div>

                      {showEmojiPicker && emojiPickerFor === 'edit' && (
                        <div className="bg-gray-100 rounded-xl p-4 mb-4">
                          <p className="text-base sm:text-lg font-bold mb-3">Select an icon:</p>
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

                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value.slice(0, 100))}
                        className="w-full px-4 py-3 text-lg sm:text-xl border-4 border-gray-300 rounded-xl focus:border-primary focus:outline-none min-h-[56px]"
                        maxLength={100}
                      />

                      {/* Tab Selection for Edit */}
                      {tabs.length > 0 && (
                        <div>
                          <label className="block text-base font-bold mb-2">Tab</label>
                          <select
                            value={editTabId}
                            onChange={(e) => setEditTabId(e.target.value)}
                            className="w-full px-4 py-3 text-base border-4 border-gray-300 rounded-xl focus:border-primary focus:outline-none min-h-[48px]"
                          >
                            {tabs.map((tab) => (
                              <option key={tab.id} value={tab.id}>
                                {tab.icon} {tab.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Timer Configuration for Edit */}
                      <div>
                        <label className="block text-base font-bold mb-2">Timer</label>
                        <select
                          value={editTimerType}
                          onChange={(e) => setEditTimerType(e.target.value as TimerType)}
                          className="w-full px-4 py-3 text-base border-4 border-gray-300 rounded-xl focus:border-primary focus:outline-none min-h-[48px]"
                        >
                          <option value="none">⭕ No Timer</option>
                          <option value="up">⏱️ Count Up (stopwatch)</option>
                          <option value="down">⏳ Count Down (timer)</option>
                        </select>
                      </div>

                      {/* Duration for Countdown in Edit */}
                      {editTimerType === 'down' && (
                        <div>
                          <label className="block text-base font-bold mb-2">
                            Countdown Duration (minutes)
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="60"
                            value={editTimerDuration}
                            onChange={(e) => setEditTimerDuration(Math.max(1, Math.min(60, parseInt(e.target.value) || 1)))}
                            className="w-full px-4 py-3 text-base border-4 border-gray-300 rounded-xl focus:border-primary focus:outline-none min-h-[48px]"
                          />
                        </div>
                      )}

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
                        <div className="text-5xl sm:text-6xl flex-shrink-0">{challenge.iconUrl}</div>

                        <div className="flex-grow min-w-0">
                          <p className="text-lg sm:text-2xl font-bold break-words leading-tight">{challenge.text}</p>
                          <p className="text-sm sm:text-base text-gray-500 mt-1">
                            Order: {challenge.order}
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

      {/* Tab Manager Modal */}
      {showTabManager && (
        <TabManager
          onClose={handleTabManagerClose}
          challenges={challenges}
          onEditChallenge={(challenge) => {
            setEditingId(challenge.id);
            setEditText(challenge.text);
            setEditIcon(challenge.iconUrl);
            setShowTabManager(false);
          }}
        />
      )}
    </div>
  );
};
