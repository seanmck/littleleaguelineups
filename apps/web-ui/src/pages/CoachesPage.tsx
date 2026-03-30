import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { TeamMember, TeamInvitation } from '@lineup/types';
import { LoadingState, ErrorBanner, Button, Input } from '../components/ui';
import { apiFetch } from '../lib/api';

export default function CoachesPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Invite form state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteResult, setInviteResult] = useState<{
    email: string;
    inviteUrl?: string;
    emailSent?: boolean;
  } | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);

  const currentAccountId = parseAccountIdFromToken();

  function parseAccountIdFromToken(): string | null {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.accountId || null;
    } catch {
      return null;
    }
  }

  async function loadData() {
    if (!teamId) return;
    try {
      const [membersRes, invitationsRes] = await Promise.all([
        apiFetch(`/teams/${teamId}/members`),
        apiFetch(`/teams/${teamId}/invitations`),
      ]);

      if (!membersRes.ok) throw new Error('Failed to load team members');
      if (!invitationsRes.ok) throw new Error('Failed to load invitations');

      setMembers(await membersRes.json());
      setInvitations(await invitationsRes.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [teamId]);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail.trim() || !teamId) return;

    setInviteLoading(true);
    setInviteResult(null);
    setError(null);

    try {
      const res = await apiFetch(`/teams/${teamId}/invitations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail.trim() }),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.message || 'Failed to send invitation');
        return;
      }

      const data = await res.json();
      setInviteResult({
        email: inviteEmail.trim(),
        inviteUrl: data.inviteUrl,
        emailSent: data.emailSent,
      });
      setInviteEmail('');
      loadData();
    } catch {
      setError('Network error');
    } finally {
      setInviteLoading(false);
    }
  }

  async function handleRemoveMember(memberId: string) {
    if (!teamId) return;
    setError(null);

    try {
      const res = await apiFetch(`/teams/${teamId}/members/${memberId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.message || 'Failed to remove member');
        return;
      }
      setMembers(m => m.filter(member => member.id !== memberId));
    } catch {
      setError('Network error');
    }
  }

  async function handleCancelInvitation(invitationId: string) {
    if (!teamId) return;
    setError(null);

    try {
      const res = await apiFetch(`/teams/${teamId}/invitations/${invitationId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.message || 'Failed to cancel invitation');
        return;
      }
      setInvitations(inv => inv.filter(i => i.id !== invitationId));
    } catch {
      setError('Network error');
    }
  }

  async function handleResendInvitation(invitationId: string) {
    if (!teamId) return;
    setResendingId(invitationId);
    setError(null);

    try {
      const res = await apiFetch(`/teams/${teamId}/invitations/${invitationId}/resend`, {
        method: 'POST',
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.message || 'Failed to resend invitation');
        return;
      }
      const data = await res.json();
      const inv = invitations.find(i => i.id === invitationId);
      setInviteResult({
        email: inv?.email || '',
        inviteUrl: data.inviteUrl,
        emailSent: data.emailSent,
      });
    } catch {
      setError('Network error');
    } finally {
      setResendingId(null);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }

  if (loading) return <LoadingState message="Loading coaches..." />;

  const coaches = members.filter(m => m.role === 'coach');

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-display text-green-900">Coaches</h1>

      {error && <ErrorBanner message={error} />}

      {/* Current Coaches */}
      <section className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Current Coaches</h2>
        {coaches.length === 0 ? (
          <p className="text-slate-500 text-sm">No coaches found.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {coaches.map(coach => (
              <li key={coach.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-semibold text-sm">
                    {(coach.name || coach.email)[0].toUpperCase()}
                  </div>
                  <div>
                    {coach.name ? (
                      <>
                        <span className="font-medium text-slate-800">{coach.name}</span>
                        <span className="text-sm text-slate-400 ml-2">({coach.email})</span>
                      </>
                    ) : (
                      <span className="font-medium text-slate-800">{coach.email}</span>
                    )}
                    {coach.accountId === currentAccountId && (
                      <span className="text-xs text-slate-400 ml-2">(you)</span>
                    )}
                  </div>
                </div>
                {coach.accountId !== currentAccountId && (
                  <Button
                    variant="danger"
                    onClick={() => handleRemoveMember(coach.id)}
                  >
                    Remove
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Invite a Coach */}
      <section className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Invite a Coach</h2>
        <form onSubmit={handleInvite} className="flex gap-3 items-end">
          <Input
            type="email"
            label="Email address"
            placeholder="coach@example.com"
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
            required
            className="flex-1"
          />
          <Button type="submit" disabled={inviteLoading}>
            {inviteLoading ? 'Sending...' : 'Send Invite'}
          </Button>
        </form>

        {inviteResult && (
          <div className={`mt-4 rounded-lg px-4 py-3 text-sm ${
            inviteResult.emailSent
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-amber-50 border border-amber-200 text-amber-800'
          }`}>
            {inviteResult.emailSent ? (
              <p className="font-medium">
                Invitation sent to <strong>{inviteResult.email}</strong>. Or copy this link and send it to them another way:
              </p>
            ) : (
              <p className="font-medium">
                Invitation created for <strong>{inviteResult.email}</strong> but the email couldn't be sent. Copy this link and send it to them directly:
              </p>
            )}
            {inviteResult.inviteUrl && (
              <div className="mt-2 flex items-center gap-2">
                <code className="flex-1 bg-white/60 rounded px-2 py-1 text-xs break-all">
                  {inviteResult.inviteUrl}
                </code>
                <Button
                  variant="muted"
                  onClick={() => copyToClipboard(inviteResult.inviteUrl!)}
                >
                  Copy Link
                </Button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <section className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Pending Invitations</h2>
          <ul className="divide-y divide-slate-100">
            {invitations.map(inv => (
              <li key={inv.id} className="flex items-center justify-between py-3">
                <div>
                  <span className="text-slate-700">{inv.email}</span>
                  <span className="text-xs text-slate-400 ml-3">
                    Expires {new Date(inv.expiresAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    onClick={() => handleResendInvitation(inv.id)}
                    disabled={resendingId === inv.id}
                  >
                    {resendingId === inv.id ? 'Sending...' : 'Resend'}
                  </Button>
                  <Button
                    variant="muted"
                    onClick={() => handleCancelInvitation(inv.id)}
                  >
                    Cancel
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
