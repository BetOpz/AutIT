import { useState, useEffect } from 'react';
import { AppData, AppMode, Session, Challenge } from './types';
import { loadData, saveData, exportData, importData } from './utils/storage';
import { UserMode } from './components/UserMode';
import { AdminPanel } from './components/AdminPanel';

function App() {
  const [appData, setAppData] = useState<AppData>(() => loadData());
  const [mode, setMode] = useState<AppMode>('user');

  // Save to localStorage whenever appData changes
  useEffect(() => {
    saveData(appData);
  }, [appData]);

  const handleSessionComplete = (session: Session) => {
    setAppData((prev) => ({
      ...prev,
      sessions: [...prev.sessions, session],
      currentSession: null,
    }));
  };

  const handleUpdateChallenges = (challenges: Challenge[]) => {
    setAppData((prev) => ({
      ...prev,
      challenges,
    }));
  };

  const handleExport = () => {
    try {
      const jsonString = exportData(appData);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `challenges-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      alert('✓ Data exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      alert('❌ Error exporting data. Please try again.');
    }
  };

  const handleImport = (file: File) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const imported = importData(content);

        if (imported) {
          const confirmImport = window.confirm(
            `Import ${imported.challenges.length} challenges? This will replace your current data.`
          );

          if (confirmImport) {
            setAppData(imported);
            saveData(imported);
            alert('✓ Data imported successfully!');
          }
        } else {
          alert('❌ Invalid file format. Please select a valid backup file.');
        }
      } catch (error) {
        console.error('Import error:', error);
        alert('❌ Error importing data. Please check the file format.');
      }
    };

    reader.onerror = () => {
      alert('❌ Error reading file. Please try again.');
    };

    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen">
      {/* Mode Toggle Button - Fixed in top right */}
      <div className="fixed top-4 right-4 z-40">
        <button
          onClick={() => setMode(mode === 'user' ? 'admin' : 'user')}
          className="bg-gray-900 text-white px-6 py-3 rounded-xl text-lg font-bold hover:bg-gray-700 transition-colors shadow-xl border-4 border-white"
        >
          {mode === 'user' ? '⚙️ Admin' : '← User'}
        </button>
      </div>

      {/* Main Content */}
      {mode === 'user' ? (
        <UserMode
          challenges={appData.challenges}
          onSessionComplete={handleSessionComplete}
          onSwitchToAdmin={() => setMode('admin')}
        />
      ) : (
        <AdminPanel
          challenges={appData.challenges}
          onUpdateChallenges={handleUpdateChallenges}
          onSwitchToUser={() => setMode('user')}
          onExport={handleExport}
          onImport={handleImport}
        />
      )}
    </div>
  );
}

export default App;
