import { Router } from 'express';
import { getPrisma } from '../lib/prisma.js';
import { requireAuth } from '../lib/requireAuth.js';

const router = Router();

router.get('/my-teams', requireAuth, async (req, res) => {
  const prisma = await getPrisma();
  const accountId = (req as any).accountId;  

  try {
    const memberships = await prisma.teamMembership.findMany({
      where: { accountId },
      include: {
        team: true,
      },
    });

    const teams = memberships.map((m) => ({
      id: m.team.id,
      name: m.team.name,
      role: m.role,
    }));

    res.json(teams);
  } catch (err) {
    console.error('Error fetching my teams:', err);
    res.status(500).json({ message: 'Failed to fetch teams' });
  }
});

router.post('/teams', requireAuth, async (req, res) => {
  console.log('Creating team with body:', req.body);

  const prisma = await getPrisma();
  const accountId = (req as any).accountId;
  const { name } = req.body;

  console.log('AccountId from token:', accountId);

  // Verify account exists
  const account = await prisma.account.findUnique({ where: { id: accountId } });
  console.log('Account lookup result:', account);

  if (!account) {
    return res.status(401).json({ message: 'Account not found - please sign up again' });
  }

  if (!name) {
    return res.status(400).json({ message: 'Team name is required' });
  }

  try {
    const team = await prisma.team.create({
      data: {
        name,
        members: {
          create: {
            accountId,
            role: 'coach',
          },
        },
      },
    });

    res.status(201).json(team);
  } catch (err) {
    console.error('Error creating team:', err);
    res.status(500).json({ message: 'Failed to create team' });
  }
});

export default router;

