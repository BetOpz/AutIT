import { useState, useEffect } from 'react';
import { Tab, TabColor, TAB_COLORS } from '../types/tab.types';
import { Challenge } from '../types';
import {
  loadTabs,
  saveTabs,
  canCreateTab,
  getAvailableColors,
  getChallengesForTab,
} from '../utils/tabHelpers';
import { generateId } from '../utils/storage';

// Common emoji options for tab icons
const TAB_EMOJI_OPTIONS = [
  '🎯', '⭐', '🏆', '💪', '📚', '🎨', '🎮', '⚽', '🏀', '🎾',
  '🎸', '🎹', '🎺', '🎭', '🎪', '🎬', '📷', '🔥', '💎', '✨',
  '🌟', '🌈', '🚀', '⚡', '💡', '🎁', '🎈', '🎉', '🎊', '🏅',
  '📖', '✏️', '📝', '🧩', '🎲', '🃏', '🎴', '🧸', '🪀', '🎯',
  '🛏️', '💧', '🧘', '🍎', '🏃', '🧼', '🪥', '🧹', '🍽️', '☕',
];

interface TabManagerProps {
  onClose: () => void;
  challenges: Challenge[];
  onEditChallenge?: (challenge: Challenge) => void;
}

export const TabManager = ({ onClose, challenges, onEditChallenge }: TabManagerProps) => {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [expandedTabId, setExpandedTabId] = useState<string | null>(null);

  // Form state
  const [editingTab, setEditingTab] = useState<Tab | null>(null);
  const [formName, setFormName] = useState('');
  const [formColor, setFormColor] = useState<TabColor>('soft-blue');
  const [formIcon, setFormIcon] = useState('🎯');

  // Load tabs on mount
  useEffect(() => {
    const loadedTabs = loadTabs();
    setTabs(loadedTabs);
  }, []);

  const refreshTabs = () => {
    const loadedTabs = loadTabs();
    setTabs(loadedTabs);
  };

  const resetForm = () => {
    setFormName('');
    setFormColor('soft-blue');
    setFormIcon('🎯');
    setEditingTab(null);
    setShowEmojiPicker(false);
  };

  const handleCreateTab = () => {
    const validation = canCreateTab(tabs);
    if (!validation.allowed) {
      alert(validation.message);
      return;
    }

    if (!formName.trim()) {
      alert('Please enter a tab name');
      return;
    }

    const newTab: Tab = {
      id: generateId(),
      name: formName.trim(),
      color: formColor,
      icon: formIcon,
      order: tabs.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedTabs = [...tabs, newTab];
    saveTabs(updatedTabs);
    refreshTabs();
    setShowCreateModal(false);
    resetForm();
  };

  const handleStartEdit = (tab: Tab) => {
    setEditingTab(tab);
    setFormName(tab.name);
    setFormColor(tab.color);
    setFormIcon(tab.icon || '🎯');
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    if (!editingTab) return;

    if (!formName.trim()) {
      alert('Please enter a tab name');
      return;
    }

    const updatedTabs = tabs.map((tab) =>
      tab.id === editingTab.id
        ? {
            ...tab,
            name: formName.trim(),
            color: formColor,
            icon: formIcon,
            updatedAt: new Date().toISOString(),
          }
        : tab
    );

    saveTabs(updatedTabs);
    refreshTabs();
    setShowEditModal(false);
    resetForm();
  };

  const handleDelete = (tabId: string) => {
    const updatedTabs = tabs
      .filter((tab) => tab.id !== tabId)
      .map((tab, index) => ({ ...tab, order: index + 1 }));

    saveTabs(updatedTabs);
    refreshTabs();
    setShowDeleteConfirm(null);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;

    const updatedTabs = [...tabs];
    [updatedTabs[index - 1], updatedTabs[index]] = [updatedTabs[index], updatedTabs[index - 1]];
    updatedTabs.forEach((tab, i) => (tab.order = i + 1));

    saveTabs(updatedTabs);
    refreshTabs();
  };

  const handleMoveDown = (index: number) => {
    if (index === tabs.length - 1) return;

    const updatedTabs = [...tabs];
    [updatedTabs[index], updatedTabs[index + 1]] = [updatedTabs[index + 1], updatedTabs[index]];
    updatedTabs.forEach((tab, i) => (tab.order = i + 1));

    saveTabs(updatedTabs);
    refreshTabs();
  };

  const availableColors = getAvailableColors();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b-4 border-gray-200 p-6 rounded-t-3xl">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold text-gray-900">📑 Manage Tabs</h2>
            <button
              onClick={onClose}
              className="bg-gray-200 text-gray-900 px-6 py-3 rounded-xl text-lg font-bold hover:bg-gray-300 transition-colors min-h-[48px]"
            >
              ✗ Close
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Create Tab Button */}
          <div className="flex justify-center">
            <button
              onClick={() => {
                const validation = canCreateTab(tabs);
                if (!validation.allowed) {
                  alert(validation.message);
                  return;
                }
                setShowCreateModal(true);
              }}
              className="bg-success text-white px-8 py-4 rounded-xl text-xl font-bold hover:bg-green-700 transition-colors shadow-md min-h-[56px]"
            >
              ➕ Create New Tab
            </button>
          </div>

          {/* Tab Count Info */}
          <div className="text-center">
            <p className="text-lg text-gray-600">
              {tabs.length} of 4 tabs created
              {tabs.length >= 4 && (
                <span className="block text-warning font-bold mt-1">
                  ⚠️ Maximum tabs reached
                </span>
              )}
            </p>
          </div>

          {/* Tab List */}
          {tabs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-2xl text-gray-400 mb-4">No tabs yet</p>
              <p className="text-lg text-gray-500">Create your first tab to organize challenges!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tabs.map((tab, index) => {
                const colorConfig = TAB_COLORS[tab.color];
                return (
                  <div
                    key={tab.id}
                    className={`border-4 ${colorConfig.border} rounded-2xl p-6 hover:shadow-lg transition-shadow`}
                  >
                    <div className="flex items-center gap-4 mb-4">
                      {/* Icon and Name */}
                      <div className="flex items-center gap-3 flex-grow">
                        <span className="text-5xl">{tab.icon || '📁'}</span>
                        <div>
                          <h3 className="text-2xl font-bold">{tab.name}</h3>
                          <p className="text-sm text-gray-500">Order: {tab.order}</p>
                        </div>
                      </div>

                      {/* Color Preview */}
                      <div
                        className={`w-16 h-16 rounded-xl ${colorConfig.bg} border-2 border-gray-300`}
                        title={tab.color}
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                      {/* Reorder buttons */}
                      <button
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        className={`px-4 py-2 rounded-lg text-base font-bold min-h-[44px] ${
                          index === 0
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-100 text-primary hover:bg-blue-200'
                        }`}
                      >
                        ↑ Up
                      </button>
                      <button
                        onClick={() => handleMoveDown(index)}
                        disabled={index === tabs.length - 1}
                        className={`px-4 py-2 rounded-lg text-base font-bold min-h-[44px] ${
                          index === tabs.length - 1
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-100 text-primary hover:bg-blue-200'
                        }`}
                      >
                        ↓ Down
                      </button>

                      {/* Edit button */}
                      <button
                        onClick={() => handleStartEdit(tab)}
                        className="bg-warning text-white px-6 py-2 rounded-lg text-base font-bold hover:bg-orange-600 transition-colors min-h-[44px]"
                      >
                        ✏️ Edit
                      </button>

                      {/* Delete button */}
                      {showDeleteConfirm === tab.id ? (
                        <>
                          <button
                            onClick={() => handleDelete(tab.id)}
                            className="bg-danger text-white px-6 py-2 rounded-lg text-base font-bold hover:bg-red-700 transition-colors min-h-[44px]"
                          >
                            ⚠️ Confirm Delete
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(null)}
                            className="bg-gray-300 text-gray-900 px-6 py-2 rounded-lg text-base font-bold hover:bg-gray-400 transition-colors min-h-[44px]"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setShowDeleteConfirm(tab.id)}
                          className="bg-danger text-white px-6 py-2 rounded-lg text-base font-bold hover:bg-red-700 transition-colors min-h-[44px]"
                        >
                          🗑️ Delete
                        </button>
                      )}

                      {/* Show/Hide Challenges button */}
                      <button
                        onClick={() => setExpandedTabId(expandedTabId === tab.id ? null : tab.id)}
                        className="bg-primary text-white px-6 py-2 rounded-lg text-base font-bold hover:bg-blue-700 transition-colors min-h-[44px]"
                      >
                        {expandedTabId === tab.id ? '👁️ Hide Challenges' : '👁️ View Challenges'}
                      </button>
                    </div>

                    {/* Challenges List (expandable) */}
                    {expandedTabId === tab.id && (() => {
                      const tabChallenges = getChallengesForTab(tab.id, challenges);
                      return (
                        <div className="mt-4 bg-gray-50 rounded-xl p-4">
                          <h4 className="text-lg font-bold mb-3">
                            Challenges in this tab ({tabChallenges.length})
                          </h4>
                          {tabChallenges.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">
                              No challenges in this tab yet. Add challenges in Admin mode.
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {tabChallenges.map((challenge, idx) => (
                                <div
                                  key={challenge.id}
                                  className="bg-white border-2 border-gray-200 rounded-lg p-3 flex items-center justify-between hover:border-primary transition-colors"
                                >
                                  <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <span className="text-gray-500 font-bold text-sm">
                                      #{idx + 1}
                                    </span>
                                    <span className="text-3xl flex-shrink-0">
                                      {challenge.iconUrl}
                                    </span>
                                    <p className="font-bold text-base break-words flex-1">
                                      {challenge.text}
                                    </p>
                                  </div>
                                  {onEditChallenge && (
                                    <button
                                      onClick={() => {
                                        onEditChallenge(challenge);
                                        onClose();
                                      }}
                                      className="bg-warning text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-orange-600 transition-colors ml-2 flex-shrink-0"
                                    >
                                      ✏️ Edit
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Create Tab Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8">
              <h3 className="text-2xl font-bold mb-6">Create New Tab</h3>

              {/* Tab Name */}
              <div className="mb-6">
                <label className="block text-lg font-bold mb-2">Tab Name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value.slice(0, 30))}
                  placeholder="Enter tab name..."
                  className="w-full px-4 py-3 text-xl border-4 border-gray-300 rounded-xl focus:border-primary focus:outline-none min-h-[56px]"
                  maxLength={30}
                  autoFocus
                />
                <p className="text-base text-gray-500 mt-1">
                  {formName.length}/30 characters
                </p>
              </div>

              {/* Color Picker */}
              <div className="mb-6">
                <label className="block text-lg font-bold mb-3">Tab Color</label>
                <div className="grid grid-cols-2 gap-3">
                  {availableColors.map((color) => {
                    const isSelected = formColor === color.value;
                    const colorConfig = TAB_COLORS[color.value];
                    return (
                      <button
                        key={color.value}
                        onClick={() => setFormColor(color.value)}
                        className={`${colorConfig.bg} border-4 ${
                          isSelected ? 'border-gray-900' : 'border-gray-300'
                        } rounded-xl p-4 hover:border-gray-600 transition-all min-h-[72px]`}
                      >
                        <p className="font-bold text-lg">{color.label}</p>
                        <p className="text-sm text-gray-600">{color.hex}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Icon Picker */}
              <div className="mb-6">
                <label className="block text-lg font-bold mb-2">Tab Icon</label>
                <div className="flex items-center gap-4 mb-3">
                  <span className="text-6xl">{formIcon}</span>
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="bg-primary text-white px-6 py-3 rounded-lg text-base font-bold hover:bg-blue-700 transition-colors min-h-[48px]"
                  >
                    {showEmojiPicker ? 'Hide Icons' : 'Choose Icon'}
                  </button>
                </div>

                {showEmojiPicker && (
                  <div className="bg-gray-100 rounded-xl p-4 max-h-64 overflow-y-auto">
                    <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
                      {TAB_EMOJI_OPTIONS.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => {
                            setFormIcon(emoji);
                            setShowEmojiPicker(false);
                          }}
                          className="text-4xl hover:bg-gray-200 rounded-lg p-2 transition-colors min-h-[56px] active:scale-95"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-8">
                <button
                  onClick={handleCreateTab}
                  className="flex-1 bg-success text-white px-6 py-4 rounded-xl text-lg font-bold hover:bg-green-700 transition-colors min-h-[56px]"
                >
                  ✓ Create Tab
                </button>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="flex-1 bg-gray-300 text-gray-900 px-6 py-4 rounded-xl text-lg font-bold hover:bg-gray-400 transition-colors min-h-[56px]"
                >
                  ✗ Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Tab Modal */}
        {showEditModal && editingTab && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8">
              <h3 className="text-2xl font-bold mb-6">Edit Tab</h3>

              {/* Tab Name */}
              <div className="mb-6">
                <label className="block text-lg font-bold mb-2">Tab Name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value.slice(0, 30))}
                  placeholder="Enter tab name..."
                  className="w-full px-4 py-3 text-xl border-4 border-gray-300 rounded-xl focus:border-primary focus:outline-none min-h-[56px]"
                  maxLength={30}
                  autoFocus
                />
                <p className="text-base text-gray-500 mt-1">
                  {formName.length}/30 characters
                </p>
              </div>

              {/* Color Picker */}
              <div className="mb-6">
                <label className="block text-lg font-bold mb-3">Tab Color</label>
                <div className="grid grid-cols-2 gap-3">
                  {availableColors.map((color) => {
                    const isSelected = formColor === color.value;
                    const colorConfig = TAB_COLORS[color.value];
                    return (
                      <button
                        key={color.value}
                        onClick={() => setFormColor(color.value)}
                        className={`${colorConfig.bg} border-4 ${
                          isSelected ? 'border-gray-900' : 'border-gray-300'
                        } rounded-xl p-4 hover:border-gray-600 transition-all min-h-[72px]`}
                      >
                        <p className="font-bold text-lg">{color.label}</p>
                        <p className="text-sm text-gray-600">{color.hex}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Icon Picker */}
              <div className="mb-6">
                <label className="block text-lg font-bold mb-2">Tab Icon</label>
                <div className="flex items-center gap-4 mb-3">
                  <span className="text-6xl">{formIcon}</span>
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="bg-primary text-white px-6 py-3 rounded-lg text-base font-bold hover:bg-blue-700 transition-colors min-h-[48px]"
                  >
                    {showEmojiPicker ? 'Hide Icons' : 'Choose Icon'}
                  </button>
                </div>

                {showEmojiPicker && (
                  <div className="bg-gray-100 rounded-xl p-4 max-h-64 overflow-y-auto">
                    <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
                      {TAB_EMOJI_OPTIONS.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => {
                            setFormIcon(emoji);
                            setShowEmojiPicker(false);
                          }}
                          className="text-4xl hover:bg-gray-200 rounded-lg p-2 transition-colors min-h-[56px] active:scale-95"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-8">
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 bg-success text-white px-6 py-4 rounded-xl text-lg font-bold hover:bg-green-700 transition-colors min-h-[56px]"
                >
                  ✓ Save Changes
                </button>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="flex-1 bg-gray-300 text-gray-900 px-6 py-4 rounded-xl text-lg font-bold hover:bg-gray-400 transition-colors min-h-[56px]"
                >
                  ✗ Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
