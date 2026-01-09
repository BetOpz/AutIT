import { useState, useEffect } from 'react';
import { AppData, AppMode, Session, Challenge } from './types';
import { loadData as loadLocalData, saveData as saveLocalData, exportData, importData } from './utils/storage';
import { firebaseService } from './services/firebase.service';
import { UserMode } from './components/UserMode';
import { AdminPanel } from './components/AdminPanel';
import { isTabsMigrated, createDefaultTab } from './utils/tabHelpers';

function App() {
  const [appData, setAppData] = useState<AppData>(() => loadLocalData());
  const [mode, setMode] = useState<AppMode>('user');
  const [isInitialized, setIsInitialized] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'syncing' | 'synced' | 'error' | 'offline'>('offline');

  // Initialize Firebase and set up real-time listeners
  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        // Check if Firebase is configured first
        const { isFirebaseConfigured } = await import('./config/firebase');

        if (!isFirebaseConfigured()) {
          // Firebase not configured, use local storage only
          if (isMounted) {
            const localData = loadLocalData();
            setAppData(localData);
            setIsInitialized(true);
            setSyncStatus('offline');
          }

          // Migrate to tab system if needed
          if (!isTabsMigrated()) {
            const defaultTab = createDefaultTab();
            const localData = loadLocalData();

            if (localData.challenges.length > 0) {
              const migratedChallenges = localData.challenges.map((challenge) => ({
                ...challenge,
                tabId: challenge.tabId || defaultTab.id,
                timerType: challenge.timerType || 'none',
                completionTimes: challenge.completionTimes || [],
                updatedAt: challenge.updatedAt || new Date().toISOString(),
              }));

              localData.challenges = migratedChallenges;
              saveLocalData(localData);
              setAppData(localData);
            }
          }
          return;
        }

        setSyncStatus('syncing');

        // Initialize Firebase - this will load from Firebase or push local data
        const initialData = await firebaseService.initialize();

        // Migrate existing challenges to tab system if needed
        if (!isTabsMigrated()) {
          const defaultTab = createDefaultTab();

          // If there are existing challenges, assign them to the default tab
          if (initialData.challenges.length > 0) {
            const migratedChallenges = initialData.challenges.map((challenge) => ({
              ...challenge,
              tabId: challenge.tabId || defaultTab.id,
              timerType: challenge.timerType || 'none',
              completionTimes: challenge.completionTimes || [],
              updatedAt: challenge.updatedAt || new Date().toISOString(),
            }));

            initialData.challenges = migratedChallenges;

            // Save migrated data
            saveLocalData(initialData);
            await firebaseService.saveChallenges(migratedChallenges);
          }
          // Migration is now complete (default tab created)
        }

        if (isMounted) {
          setAppData(initialData);
          saveLocalData(initialData); // Update local cache
          setIsInitialized(true);
          setSyncStatus('synced');
        }

        // Subscribe to real-time changes for challenges
        const unsubscribeChallenges = firebaseService.subscribeToChallenges((challenges) => {
          if (isMounted) {
            setAppData((prev) => {
              const updated = { ...prev, challenges };
              saveLocalData(updated); // Keep local cache in sync
              return updated;
            });
            setSyncStatus('synced');
          }
        });

        // Subscribe to real-time changes for sessions
        const unsubscribeSessions = firebaseService.subscribeToSessions((sessions) => {
          if (isMounted) {
            setAppData((prev) => {
              const updated = { ...prev, sessions };
              saveLocalData(updated); // Keep local cache in sync
              return updated;
            });
          }
        });

        // Cleanup function
        return () => {
          isMounted = false;
          unsubscribeChallenges();
          unsubscribeSessions();
          firebaseService.cleanup();
        };
      } catch (error) {
        console.error('Firebase initialization error:', error);
        if (isMounted) {
          setSyncStatus('error');
          // Fall back to local data
          const localData = loadLocalData();
          setAppData(localData);
          setIsInitialized(true);
        }
      }
    };

    init();
  }, []);

  // Save to both localStorage and Firebase whenever challenges change
  useEffect(() => {
    if (isInitialized) {
      saveLocalData(appData);
    }
  }, [appData, isInitialized]);

  const handleSessionComplete = async (session: Session) => {
    const updatedData = {
      ...appData,
      sessions: [...appData.sessions, session],
      currentSession: null,
    };

    setAppData(updatedData);

    // Save session to Firebase only if configured
    const { isFirebaseConfigured } = await import('./config/firebase');
    if (isFirebaseConfigured()) {
      try {
        await firebaseService.saveSession(session);
        setSyncStatus('synced');
      } catch (error) {
        console.error('Error saving session to Firebase:', error);
        setSyncStatus('error');
      }
    }
  };

  const handleUpdateChallenges = async (challenges: Challenge[]) => {
    const updatedData = {
      ...appData,
      challenges,
    };

    setAppData(updatedData);

    // Save to Firebase only if configured
    const { isFirebaseConfigured } = await import('./config/firebase');
    if (isFirebaseConfigured()) {
      try {
        setSyncStatus('syncing');
        await firebaseService.saveChallenges(challenges);
        setSyncStatus('synced');
      } catch (error) {
        console.error('Error saving challenges to Firebase:', error);
        setSyncStatus('error');
      }
    }
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

    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const imported = importData(content);

        if (imported) {
          const confirmImport = window.confirm(
            `Import ${imported.challenges.length} challenges? This will replace your current data on all devices.`
          );

          if (confirmImport) {
            setAppData(imported);
            saveLocalData(imported);

            // Push to Firebase
            try {
              setSyncStatus('syncing');
              await firebaseService.saveChallenges(imported.challenges);
              setSyncStatus('synced');
              alert('✓ Data imported successfully and synced to cloud!');
            } catch (error) {
              console.error('Error syncing imported data to Firebase:', error);
              setSyncStatus('error');
              alert('✓ Data imported locally, but cloud sync failed. Will retry automatically.');
            }
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

  // Sync status indicator
  const getSyncStatusDisplay = () => {
    switch (syncStatus) {
      case 'syncing':
        return { icon: '🔄', text: 'Syncing...', color: 'text-blue-600' };
      case 'synced':
        return { icon: '✓', text: 'Synced', color: 'text-green-600' };
      case 'error':
        return { icon: '⚠️', text: 'Sync Error', color: 'text-red-600' };
      case 'offline':
        return { icon: '📱', text: 'Local Only', color: 'text-gray-600' };
    }
  };

  const syncDisplay = getSyncStatusDisplay();

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-primary mb-4"></div>
          <p className="text-2xl font-bold text-gray-900">Loading...</p>
          <p className="text-lg text-gray-600 mt-2">Syncing your challenges</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Mode Toggle Button - Fixed in top right */}
      <div className="fixed top-4 right-4 z-40 flex items-center gap-3">
        {/* Sync Status Indicator */}
        <div className={`bg-white px-4 py-2 rounded-xl shadow-lg border-2 border-gray-200 ${syncDisplay.color}`}>
          <div className="flex items-center gap-2">
            <span className="text-lg">{syncDisplay.icon}</span>
            <span className="text-sm font-bold">{syncDisplay.text}</span>
          </div>
        </div>

        {/* Mode Toggle */}
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
