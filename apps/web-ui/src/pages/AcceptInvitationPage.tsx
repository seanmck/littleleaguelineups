import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { LoadingState, ErrorBanner } from '../components/ui';
import { apiFetch } from '../lib/api';

export default function AcceptInvitationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('No invitation token provided.');
      return;
    }

    apiFetch('/invitations/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then(async res => {
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || 'Failed to accept invitation');
        }
        return res.json();
      })
      .then(data => {
        navigate(`/teams/${data.teamId}/roster`, { replace: true });
      })
      .catch(err => {
        setError(err.message);
      });
  }, [token, navigate]);

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-2xl shadow-lg">
        <h1 className="text-2xl font-display text-green-900 mb-4 text-center">Invitation</h1>
        <ErrorBanner message={error} />
        <p className="mt-4 text-center text-sm text-slate-500">
          <Link to="/dashboard" className="text-green-700 font-semibold hover:text-green-800 transition-colors">
            Go to Dashboard
          </Link>
        </p>
      </div>
    );
  }

  return <LoadingState message="Accepting invitation..." />;
}
