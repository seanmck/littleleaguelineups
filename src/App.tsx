//import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import TeamSelectPage from './pages/TeamSelectPage';
import RosterPage from './pages/RosterPage';
import GameSetupPage from './pages/GameSetupPage';
//import GameDetailPage from './pages/GameDetailPage';
import { useStore } from './state/store';

function App() {
  /*
  const selectedTeamId = useStore(state => state.selectedTeamId);

  if (!selectedTeamId) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-white to-sky-100 p-6 font-sans">
        <div className="max-w-3xl mx-auto">
          <TeamSelectPage />
        </div>
      </main>
    );
  }

  return (
    <Router>
      <main className="min-h-screen bg-gradient-to-br from-white to-sky-100 p-6 font-sans">
        <div className="max-w-3xl mx-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/roster" />} />
            <Route path="/roster" element={<RosterPage />} />
            <Route path="/games" element={<GameSetupPage />} />
            <Route path="/games/:gameId" element={<GameDetailPage />} />
          </Routes>
        </div>
      </main>
    </Router>
  );
}


*/

  return (
    <div className="min-h-screen bg-blue-500 text-white flex items-center justify-center">
      <h1 className="text-4xl font-bold">Tailwind is working!</h1>
    </div>
  );
}

export default App;

