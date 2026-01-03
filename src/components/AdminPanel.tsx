import { useState } from 'react';
import { Challenge } from '../types';
import { generateId } from '../utils/storage';

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
    } else {
      setEditIcon(emoji);
    }
    setShowEmojiPicker(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">⚙️ Admin Panel</h1>
            <div className="flex gap-3">
              <button
                onClick={onSwitchToUser}
                className="bg-primary text-white px-8 py-4 rounded-xl text-xl font-bold hover:bg-blue-700 transition-colors shadow-md"
              >
                ← Back to Challenges
              </button>
            </div>
          </div>
        </div>

        {/* Import/Export */}
        <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8 mb-6">
          <h2 className="text-3xl font-bold mb-4">Backup & Restore</h2>
          <div className="flex flex-col md:flex-row gap-4">
            <button
              onClick={onExport}
              className="flex-1 bg-success text-white px-8 py-4 rounded-xl text-xl font-bold hover:bg-green-700 transition-colors shadow-md"
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
              <div className="bg-warning text-white px-8 py-4 rounded-xl text-xl font-bold hover:bg-orange-600 transition-colors shadow-md cursor-pointer text-center">
                📤 Import Data
              </div>
            </label>
          </div>
        </div>

        {/* Add New Challenge */}
        <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8 mb-6">
          <h2 className="text-3xl font-bold mb-6">Add New Challenge</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xl font-bold mb-2">Challenge Text</label>
              <input
                type="text"
                value={newChallengeText}
                onChange={(e) => setNewChallengeText(e.target.value.slice(0, 100))}
                placeholder="Enter challenge description..."
                className="w-full px-6 py-4 text-2xl border-4 border-gray-300 rounded-xl focus:border-primary focus:outline-none"
                maxLength={100}
              />
              <p className="text-lg text-gray-500 mt-2">
                {newChallengeText.length}/100 characters
              </p>
            </div>

            <div>
              <label className="block text-xl font-bold mb-2">Icon</label>
              <div className="flex items-center gap-4">
                <div className="text-8xl">{newChallengeIcon}</div>
                <button
                  onClick={() => {
                    setEmojiPickerFor('new');
                    setShowEmojiPicker(!showEmojiPicker);
                  }}
                  className="bg-gray-200 text-gray-900 px-6 py-3 rounded-xl text-lg font-bold hover:bg-gray-300 transition-colors"
                >
                  Choose Icon
                </button>
              </div>
            </div>

            {showEmojiPicker && (
              <div className="bg-gray-100 rounded-xl p-4">
                <p className="text-lg font-bold mb-3">Select an icon:</p>
                <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
                  {EMOJI_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleEmojiSelect(emoji)}
                      className="text-5xl hover:bg-gray-200 rounded-lg p-2 transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleAddChallenge}
              className="w-full bg-success text-white px-8 py-6 rounded-xl text-2xl font-bold hover:bg-green-700 transition-colors shadow-md"
            >
              ✓ Add Challenge
            </button>
          </div>
        </div>

        {/* Challenge List */}
        <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8">
          <h2 className="text-3xl font-bold mb-6">
            Challenges ({challenges.length})
          </h2>

          {challenges.length === 0 ? (
            <p className="text-2xl text-gray-500 text-center py-12">
              No challenges yet. Add one above!
            </p>
          ) : (
            <div className="space-y-4">
              {challenges.map((challenge, index) => (
                <div
                  key={challenge.id}
                  className="border-4 border-gray-200 rounded-2xl p-6 hover:border-primary transition-colors"
                >
                  {editingId === challenge.id ? (
                    // Edit mode
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="text-6xl">{editIcon}</div>
                        <button
                          onClick={() => {
                            setEmojiPickerFor('edit');
                            setShowEmojiPicker(!showEmojiPicker);
                          }}
                          className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg text-base font-bold hover:bg-gray-300 transition-colors"
                        >
                          Change
                        </button>
                      </div>

                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value.slice(0, 100))}
                        className="w-full px-4 py-3 text-xl border-4 border-gray-300 rounded-xl focus:border-primary focus:outline-none"
                        maxLength={100}
                      />

                      <div className="flex gap-3">
                        <button
                          onClick={handleSaveEdit}
                          className="flex-1 bg-success text-white px-6 py-3 rounded-xl text-lg font-bold hover:bg-green-700 transition-colors"
                        >
                          ✓ Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="flex-1 bg-gray-300 text-gray-900 px-6 py-3 rounded-xl text-lg font-bold hover:bg-gray-400 transition-colors"
                        >
                          ✗ Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View mode
                    <div className="flex items-center gap-4">
                      <div className="text-6xl flex-shrink-0">{challenge.iconUrl}</div>

                      <div className="flex-grow">
                        <p className="text-2xl font-bold">{challenge.text}</p>
                        <p className="text-lg text-gray-500">Order: {challenge.order}</p>
                      </div>

                      <div className="flex flex-col gap-2">
                        {/* Reorder buttons */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleMoveUp(index)}
                            disabled={index === 0}
                            className={`px-4 py-2 rounded-lg text-lg font-bold ${
                              index === 0
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-blue-100 text-primary hover:bg-blue-200'
                            }`}
                          >
                            ↑
                          </button>
                          <button
                            onClick={() => handleMoveDown(index)}
                            disabled={index === challenges.length - 1}
                            className={`px-4 py-2 rounded-lg text-lg font-bold ${
                              index === challenges.length - 1
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-blue-100 text-primary hover:bg-blue-200'
                            }`}
                          >
                            ↓
                          </button>
                        </div>

                        {/* Edit/Delete buttons */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleStartEdit(challenge)}
                            className="bg-warning text-white px-4 py-2 rounded-lg text-lg font-bold hover:bg-orange-600 transition-colors"
                          >
                            ✏️ Edit
                          </button>

                          {showDeleteConfirm === challenge.id ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleDelete(challenge.id)}
                                className="bg-danger text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-700 transition-colors"
                              >
                                Confirm?
                              </button>
                              <button
                                onClick={() => setShowDeleteConfirm(null)}
                                className="bg-gray-300 text-gray-900 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-400 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setShowDeleteConfirm(challenge.id)}
                              className="bg-danger text-white px-4 py-2 rounded-lg text-lg font-bold hover:bg-red-700 transition-colors"
                            >
                              🗑️
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
