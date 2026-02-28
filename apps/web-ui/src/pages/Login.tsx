import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Input, ErrorBanner } from '../components/ui';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.message || 'Login failed');
        return;
      }

      const data = await res.json();
      localStorage.setItem('token', data.token);
      navigate('/dashboard');
    } catch (err) {
      setError('Network error');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-2xl shadow-lg animate-scale-in">
      <h1 className="text-3xl font-display text-green-900 mb-6 text-center">Log In</h1>
      {error && <ErrorBanner message={error} />}
      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        <Input
          type="email"
          label="Email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          label="Password"
          placeholder="Your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit" className="w-full">
          Log In
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        Don't have an account?{' '}
        <Link to="/signup" className="text-green-700 font-semibold hover:text-green-800 transition-colors">
          Sign up
        </Link>
      </p>
    </div>
  );
}
