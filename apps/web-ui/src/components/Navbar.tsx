import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <nav className="bg-gradient-to-b from-green-900 to-green-950 text-white">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
      <Link to="/" className="text-2xl font-display tracking-wide hover:text-green-200 transition-colors">
        Little League Coach
      </Link>
      <div className="flex items-center space-x-6">
        {token ? (
          <>
            <Link to="/dashboard" className="text-sm font-semibold hover:text-green-200 transition-colors">
              Dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="bg-white text-green-900 font-semibold px-4 py-1.5 rounded-lg hover:bg-green-100 transition-all hover:shadow-md active:scale-[0.98]"
            >
              Log out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-sm font-semibold hover:text-green-200 transition-colors">
              Log In
            </Link>
            <Link
              to="/signup"
              className="bg-white text-green-900 font-semibold px-4 py-1.5 rounded-lg hover:bg-green-100 transition-all hover:shadow-md active:scale-[0.98]"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
      </div>
    </nav>
  );
}
