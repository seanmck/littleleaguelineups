import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import posthog from 'posthog-js';
import { Button, Input, ErrorBanner } from '../components/ui';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('invite');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name: name.trim() || undefined, inviteToken }),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.message || 'Signup failed');
        return;
      }

      const data = await res.json();
      localStorage.setItem('token', data.token);
      if (data.accountId) {
        localStorage.setItem('accountId', data.accountId.toString());
        posthog.identify(data.accountId.toString());
      }
      posthog.capture('signup_submitted');
      navigate(data.joinedTeamId ? `/teams/${data.joinedTeamId}/roster` : '/dashboard');
    } catch (err) {
      setError('Network error');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-2xl shadow-lg animate-scale-in">
      <h1 className="text-3xl font-display text-green-900 mb-6 text-center">Create an Account</h1>
      {inviteToken && (
        <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800 mb-4">
          You've been invited to join a team! Create an account to get started.
        </div>
      )}
      {error && <ErrorBanner message={error} />}
      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        <Input
          type="text"
          label="Name"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
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
          placeholder="Choose a password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Input
          type="password"
          label="Confirm Password"
          placeholder="Confirm your password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
        <Button type="submit" className="w-full">
          Sign Up
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="text-green-700 font-semibold hover:text-green-800 transition-colors">
          Log in
        </Link>
      </p>
    </div>
  );
}
