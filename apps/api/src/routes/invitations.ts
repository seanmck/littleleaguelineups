import { Router } from 'express';
import crypto from 'crypto';
import { getPrisma } from '../lib/prisma.js';
import { requireAuth } from '../lib/requireAuth.js';
import { requireCoach } from '../lib/requireCoach.js';
import { sendInvitationEmail } from '../lib/email.js';

const router = Router();

// Create invitation
router.post('/teams/:teamId/invitations', requireAuth, requireCoach, async (req, res) => {
  const teamId = parseInt(req.params.teamId, 10);
  const accountId = (req as any).accountId;
  const { email } = req.body;

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ message: 'Email is required' });
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const prisma = await getPrisma();

    // Check if already a member
    const existingAccount = await prisma.account.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingAccount) {
      const existingMembership = await prisma.teamMembership.findUnique({
        where: { accountId_teamId: { accountId: existingAccount.id, teamId } },
      });
      if (existingMembership) {
        return res.status(409).json({ message: 'This person is already on the team' });
      }
    }

    // Check for pending invitation
    const existingInvite = await prisma.invitation.findFirst({
      where: {
        email: normalizedEmail,
        teamId,
        status: 'pending',
        expiresAt: { gt: new Date() },
      },
    });
    if (existingInvite) {
      return res.status(409).json({ message: 'An invitation is already pending for this email' });
    }

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const invitation = await prisma.invitation.create({
      data: {
        email: normalizedEmail,
        token,
        teamId,
        invitedById: accountId,
        expiresAt,
      },
      include: {
        invitedBy: { select: { email: true, name: true } },
        team: { select: { name: true } },
      },
    });

    const { inviteUrl, emailSent } = await sendInvitationEmail({
      toEmail: normalizedEmail,
      teamName: invitation.team.name,
      inviterName: invitation.invitedBy.name,
      inviterEmail: invitation.invitedBy.email,
      token,
      hasAccount: !!existingAccount,
    });

    res.status(201).json({
      id: invitation.id,
      email: invitation.email,
      teamId: invitation.teamId,
      status: invitation.status,
      expiresAt: invitation.expiresAt.toISOString(),
      createdAt: invitation.createdAt.toISOString(),
      invitedBy: invitation.invitedBy,
      inviteUrl,
      emailSent,
    });
  } catch (err) {
    console.error('Error creating invitation:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// List pending invitations
router.get('/teams/:teamId/invitations', requireAuth, requireCoach, async (req, res) => {
  const teamId = parseInt(req.params.teamId, 10);

  try {
    const prisma = await getPrisma();
    const invitations = await prisma.invitation.findMany({
      where: {
        teamId,
        status: 'pending',
        expiresAt: { gt: new Date() },
      },
      include: {
        invitedBy: { select: { email: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(invitations.map(inv => ({
      id: inv.id,
      email: inv.email,
      teamId: inv.teamId,
      status: inv.status,
      expiresAt: inv.expiresAt.toISOString(),
      createdAt: inv.createdAt.toISOString(),
      invitedBy: inv.invitedBy,
    })));
  } catch (err) {
    console.error('Error listing invitations:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Cancel invitation
router.delete('/teams/:teamId/invitations/:id', requireAuth, requireCoach, async (req, res) => {
  const teamId = parseInt(req.params.teamId, 10);
  const { id } = req.params;

  try {
    const prisma = await getPrisma();
    const invitation = await prisma.invitation.findFirst({
      where: { id, teamId, status: 'pending' },
    });

    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found' });
    }

    await prisma.invitation.update({
      where: { id },
      data: { status: 'cancelled' },
    });

    res.status(204).send();
  } catch (err) {
    console.error('Error cancelling invitation:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Resend invitation
router.post('/teams/:teamId/invitations/:id/resend', requireAuth, requireCoach, async (req, res) => {
  const teamId = parseInt(req.params.teamId, 10);
  const { id } = req.params;

  try {
    const prisma = await getPrisma();
    const invitation = await prisma.invitation.findFirst({
      where: { id, teamId, status: 'pending', expiresAt: { gt: new Date() } },
      include: {
        invitedBy: { select: { email: true, name: true } },
        team: { select: { name: true } },
      },
    });

    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found or expired' });
    }

    const existingAccount = await prisma.account.findUnique({
      where: { email: invitation.email },
    });

    const { inviteUrl, emailSent } = await sendInvitationEmail({
      toEmail: invitation.email,
      teamName: invitation.team.name,
      inviterName: invitation.invitedBy.name,
      inviterEmail: invitation.invitedBy.email,
      token: invitation.token,
      hasAccount: !!existingAccount,
    });

    res.json({ inviteUrl, emailSent });
  } catch (err) {
    console.error('Error resending invitation:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Accept invitation (for logged-in users)
router.post('/invitations/accept', requireAuth, async (req, res) => {
  const accountId = (req as any).accountId;
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: 'Token is required' });
  }

  try {
    const prisma = await getPrisma();

    const invitation = await prisma.invitation.findUnique({
      where: { token },
    });

    if (!invitation || invitation.status !== 'pending' || invitation.expiresAt <= new Date()) {
      return res.status(404).json({ message: 'Invitation not found or expired' });
    }

    const account = await prisma.account.findUnique({
      where: { id: accountId },
    });

    if (!account || account.email.toLowerCase() !== invitation.email.toLowerCase()) {
      return res.status(403).json({ message: 'This invitation was sent to a different email address' });
    }

    // Check if already a member
    const existingMembership = await prisma.teamMembership.findUnique({
      where: { accountId_teamId: { accountId, teamId: invitation.teamId } },
    });

    if (existingMembership) {
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: 'accepted' },
      });
      return res.json({ message: 'Already a member', teamId: invitation.teamId });
    }

    await prisma.teamMembership.create({
      data: {
        accountId,
        teamId: invitation.teamId,
        role: 'coach',
      },
    });

    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: 'accepted' },
    });

    res.json({ message: 'Invitation accepted', teamId: invitation.teamId });
  } catch (err) {
    console.error('Error accepting invitation:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// List team members
router.get('/teams/:teamId/members', requireAuth, requireCoach, async (req, res) => {
  const teamId = parseInt(req.params.teamId, 10);

  try {
    const prisma = await getPrisma();
    const members = await prisma.teamMembership.findMany({
      where: { teamId },
      include: {
        account: { select: { id: true, email: true, name: true } },
      },
    });

    res.json(members.map(m => ({
      id: m.id,
      accountId: m.account.id,
      email: m.account.email,
      name: m.account.name,
      role: m.role,
    })));
  } catch (err) {
    console.error('Error listing members:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Remove a member
router.delete('/teams/:teamId/members/:id', requireAuth, requireCoach, async (req, res) => {
  const teamId = parseInt(req.params.teamId, 10);
  const accountId = (req as any).accountId;
  const { id } = req.params;

  try {
    const prisma = await getPrisma();

    const membership = await prisma.teamMembership.findFirst({
      where: { id, teamId },
    });

    if (!membership) {
      return res.status(404).json({ message: 'Member not found' });
    }

    if (membership.accountId === accountId) {
      return res.status(400).json({ message: 'Cannot remove yourself' });
    }

    const coachCount = await prisma.teamMembership.count({
      where: { teamId, role: 'coach' },
    });

    if (coachCount <= 1 && membership.role === 'coach') {
      return res.status(400).json({ message: 'Cannot remove the only coach' });
    }

    await prisma.teamMembership.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (err) {
    console.error('Error removing member:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
