import { Request, Response, NextFunction } from 'express';
import { getPrisma } from './prisma.js';

export async function requireCoach(req: Request, res: Response, next: NextFunction) {
  const accountId = (req as any).accountId;
  const teamId = parseInt(req.params.teamId, 10);

  if (!accountId || isNaN(teamId)) {
    return res.status(400).json({ message: 'Invalid request' });
  }

  const prisma = await getPrisma();
  const membership = await prisma.teamMembership.findUnique({
    where: { accountId_teamId: { accountId, teamId } },
  });

  if (!membership || membership.role !== 'coach') {
    return res.status(403).json({ message: 'Must be a coach on this team' });
  }

  next();
}
