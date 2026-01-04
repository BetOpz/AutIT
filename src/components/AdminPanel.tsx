import { useState } from 'react';
import { Challenge } from '../types';
import { generateId } from '../utils/storage';
import { getIconForChallenge } from '../utils/iconMapping';

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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [editIcon, setEditIcon] = useState('');
  const [newChallengeText, setNewChallengeText] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleAddChallenge = () => {
    if (!newChallengeText.trim()) {
      alert('Please enter challenge text');
      return;
    }

    // Auto-detect icon from challenge text
    const autoIcon = getIconForChallenge(newChallengeText);

    const newChallenge: Challenge = {
      id: generateId(),
      text: newChallengeText.trim(),
      iconUrl: autoIcon,
      createdAt: new Date().toISOString(),
      order: challenges.length + 1,
    };

    onUpdateChallenges([...challenges, newChallenge]);
    setNewChallengeText('');
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
    setEditIcon(emoji);
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

            {/* Auto-detected Icon Preview */}
            {newChallengeText && (
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border-2 border-green-200">
                <p className="text-lg font-bold text-gray-700 mb-3">🤖 Auto-Detected Icon:</p>
                <div className="flex items-center gap-4">
                  <span style={{ fontSize: '64px', display: 'block' }}>
                    {autoDetectedIcon}
                  </span>
                  <div className="flex-1">
                    <p className="text-base text-gray-600">
                      This icon will be automatically assigned based on your challenge text.
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      You can change it after adding the challenge if needed.
                    </p>
                  </div>
                </div>
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
                          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                          className="w-full sm:w-auto bg-gray-200 text-gray-900 px-4 py-3 rounded-lg text-base font-bold hover:bg-gray-300 transition-colors min-h-[48px]"
                        >
                          Change Icon
                        </button>
                      </div>

                      {showEmojiPicker && (
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
    </div>
  );
};
