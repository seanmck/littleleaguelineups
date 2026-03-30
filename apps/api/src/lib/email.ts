import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'Fair Ball <noreply@fairball.team>';
const APP_URL = process.env.APP_URL || 'http://localhost:5173';

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

export function buildInviteUrl(token: string, hasAccount: boolean): string {
  return hasAccount
    ? `${APP_URL}/invitations/accept?token=${token}`
    : `${APP_URL}/signup?invite=${token}`;
}

export async function sendInvitationEmail(params: {
  toEmail: string;
  teamName: string;
  inviterEmail: string;
  token: string;
  hasAccount: boolean;
}): Promise<{ inviteUrl: string; emailSent: boolean }> {
  const { toEmail, teamName, inviterEmail, token, hasAccount } = params;
  const inviteUrl = buildInviteUrl(token, hasAccount);

  if (!resend) {
    console.log(`[DEV] No RESEND_API_KEY set. Invitation email to ${toEmail}:`);
    console.log(`  Link: ${inviteUrl}`);
    return { inviteUrl, emailSent: false };
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: toEmail,
      subject: `You've been invited to coach ${teamName} on Fair Ball`,
      html: `
        <h2>You're invited!</h2>
        <p>${inviterEmail} has invited you to join <strong>${teamName}</strong> as a coach on Fair Ball.</p>
        <p><a href="${inviteUrl}" style="display:inline-block;padding:12px 24px;background:#166534;color:white;text-decoration:none;border-radius:8px;font-weight:600;">
          ${hasAccount ? 'Accept Invitation' : 'Sign Up & Join Team'}
        </a></p>
        <p>This invitation expires in 7 days.</p>
        <p style="color:#64748b;font-size:12px;">If you didn't expect this email, you can safely ignore it.</p>
      `,
    });
    return { inviteUrl, emailSent: true };
  } catch (err) {
    console.error('Failed to send invitation email:', err);
    return { inviteUrl, emailSent: false };
  }
}
