import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import TeamSelectPage from './pages/TeamSelectPage';
import RosterPage from './pages/RosterPage';
import GameSetupPage from './pages/GameSetupPage';
import GameDetailPage from './pages/GameDetailPage';
import { useStore } from './state/store';
import { useEffect, useRef } from 'react';

function App() {
  const selectedTeamId = useStore(state => state.selectedTeamId);
  const activeTeam = useStore(state =>
    state.teams.find(t => t.id === state.selectedTeamId)
  );

  const loadDevData = useStore(state => state.loadDevData);
  const hasLoaded = useRef(false);

  useEffect(() => {
    if (!hasLoaded.current && import.meta.env.DEV) {
      loadDevData();
      hasLoaded.current = true;
    }
  }, [loadDevData]);

  return (
    <Router>
      <main className="min-h-screen bg-gradient-to-br from-white to-sky-100 p-6 font-sans">
        <div className="max-w-3xl mx-auto">
          {!selectedTeamId ? (
            <Routes>
              <Route path="*" element={<TeamSelectPage />} />
            </Routes>
          ) : (
            <>
              <header className="mb-6 text-center">
                <h1 className="text-4xl text-blue-800 font-bold tracking-wider">
                  Little League Lineup
                </h1>
                {activeTeam && (
                  <p className="text-sm text-slate-600 mt-1">
                    Managing team: <span className="font-semibold">{activeTeam.name}</span>
                  </p>
                )}
                <div className="mt-4 space-x-4">
                  <Link
                    to="/roster"
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                  >
                    Roster
                  </Link>
                  <Link
                    to="/games"
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
                  >
                    Game Setup
                  </Link>
                </div>
              </header>
              <Routes>
                <Route path="/" element={<Navigate to="/roster" />} />
                <Route path="/roster" element={<RosterPage />} />
                <Route path="/games" element={<GameSetupPage />} />
                <Route path="/games/:gameId" element={<GameDetailPage />} />
              </Routes>
            </>
          )}
        </div>
      </main>
    </Router>
  );
}

export default App;

