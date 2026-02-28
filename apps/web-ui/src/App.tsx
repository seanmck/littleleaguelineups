import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import ProtectedRoute from './components/ProtectedRoute';
import TeamLayout from './layouts/TeamLayout';

function App() {
  return (
    <Router>
      <main className="min-h-screen bg-gradient-to-br from-white to-green-50">
        <div className="mx-auto">
          <Navbar />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/login" element={<LoginPage />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/teams" element={<TeamSelectPage />} />
              <Route path="/teams/:teamId" element={<TeamLayout />}>
                <Route path="roster" element={<RosterPage />} />
                <Route path="games" element={<GamesListPage />} />
                <Route path="games/setup" element={<GameSetupPage />} />
                <Route path="games/:gameId" element={<GameDetailPage />} />
                <Route path="season-recap" element={<SeasonRecapPage />} />
              </Route>
            </Route>
          </Routes>
          <Footer />
        </div>
      </main>
    </Router>
  );
}

export default App;
