import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <nav className="bg-blue-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
      <Link to="/" className="text-xl font-bold hover:text-blue-200 transition-colors">
        Little League Coach
      </Link>
      <div className="flex items-center space-x-6">
        {token ? (
          <>
            <Link to="/dashboard" className="hover:underline">
              Dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="bg-white text-blue-800 font-semibold px-4 py-1 rounded hover:bg-blue-100 transition"
            >
              Log out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:underline">
              Log In
            </Link>
            <Link
              to="/signup"
              className="bg-white text-blue-800 font-semibold px-4 py-1 rounded hover:bg-blue-100 transition"
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
