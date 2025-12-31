import { BrowserRouter as Router, Routes, Route, Navigate, Link, useParams } from 'react-router-dom';
import TeamSelectPage from './pages/TeamSelectPage';
import RosterPage from './pages/RosterPage';
import GameSetupPage from './pages/GameSetupPage';
import GameDetailPage from './pages/GameDetailPage';
import GamesListPage from './pages/GamesListPage';
import SeasonRecapPage from './pages/SeasonRecapPage';
import LandingPage from './pages/LandingPage';
import SignupPage from './pages/Signup';
import LoginPage from './pages/Login';

import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Footer from './components/Footer';

import TeamLayout from './layouts/TeamLayout';

function Header() {
  const { teamId } = useParams();

  if (!teamId) return null;

  return (    
    <header className="mb-6 text-center">      
      <h1 className="text-4xl text-blue-800 font-bold tracking-wider">
        Little League Lineup
      </h1>
      <p className="text-sm text-slate-600 mt-1">
        Managing team: <span className="font-semibold">{teamId}</span>
      </p>
      <div className="mt-4 space-x-4">
        <Link
          to={`/teams/${teamId}/roster`}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          Roster
        </Link>
        <Link
          to={`/teams/${teamId}/games/setup`}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
        >
          Game Setup
        </Link>
        <Link
          to={`/teams/${teamId}/games`}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
        >
          Game Schedule
        </Link>
      </div>
    </header>
  );
}

function App() {
  return (  
    <Router>
        <main className="min-h-screen bg-gradient-to-br from-white to-sky-100 p-6 font-sans">
          <div className="mx-auto">            
          <Navbar />
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/teams" element={<TeamSelectPage />} />
              <Route path="/teams/:teamId/roster" element={<RosterPage />} />
              <Route path="/teams/:teamId/games" element={<GamesListPage />} />
              <Route path="/teams/:teamId/games/setup" element={<GameSetupPage />} />
              <Route path="/teams/:teamId/games/:gameId" element={<GameDetailPage />} />
              <Route path="/teams/:teamId/season-recap" element={<SeasonRecapPage />} />
            </Routes>
          <Footer />
          </div>
      </main>
    </Router>
  );
}

export default App;
