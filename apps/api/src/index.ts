import express, { Application, Request, Response } from 'express';
import cors from 'cors';

import signupRoutes from './routes/signup.js';
import teamRoutes from './routes/teams.js';
import invitationRoutes from './routes/invitations.js';

const { PG_HOST, PG_USER, PG_PASSWORD, PG_DB } = process.env;

console.log("PG_HOST: ", PG_HOST);
console.log("PG_USER: ", PG_USER);
console.log("PG_PASSWORD: ", PG_PASSWORD);
console.log("PG_DB: ", PG_DB);
console.log("PG_PORT: ", process.env.PG_PORT);

// Only construct DATABASE_URL from parts if not already set (e.g., by .env file)
if (!process.env.DATABASE_URL) {
  if (!PG_HOST || !PG_USER || !PG_PASSWORD || !PG_DB) {
    throw new Error("Missing DATABASE_URL or required PG_* environment variables");
  }
  const port = process.env.PG_PORT || '5432';
  process.env.DATABASE_URL = `postgresql://${encodeURIComponent(PG_USER)}:${encodeURIComponent(PG_PASSWORD)}@${PG_HOST}:${port}/${PG_DB}?schema=public`;
}

import { PrismaClient } from '@prisma/client';
import { Game, Player, Lineup, Position, POSITIONS, BattingOrderStrategy, parseLineup } from '@lineup/types';
import { calculateSeasonRecapStats } from './lib/seasonRecapCalculator.js';
import { generateLineup } from './lib/generateLineup.js';
import { generateBattingOrder } from './lib/generateBattingOrder.js';
import { trackEvent, shutdownAnalytics } from './lib/analytics.js';

const prisma = new PrismaClient();

const app: Application = express();
app.use(cors());
app.use(express.json());

app.use('/api', signupRoutes);
app.use('/api', teamRoutes);
app.use('/api', invitationRoutes);

// Get all teams
app.get('/api/teams', async (req: Request, res: Response) => {
  console.log("Database URL: ", process.env.DATABASE_URL);

  try {
    const teams = await prisma.team.findMany({
      include: {
        players: true,
        games: true
      }
    });
    res.json(teams);
  } catch (err) {
    console.error('Error fetching teams:', err);
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
});

// Add a player to a team
app.post('/api/teams/:teamId/players', async (req: Request<{ teamId: string }>, res: Response) => {
  const { teamId } = req.params;
  const { name } = req.body;
  try {
    const player = await prisma.player.create({
      data: {
        name,
        teamId: parseInt(teamId, 10),
      },
    });
    res.status(201).json(player);
  } catch (err) {
    console.error('Error adding player:', err);
    res.status(500).json({ error: 'Failed to add player' });
  }
});

// Get all players in a team
app.get('/api/teams/:teamId/players', async (req: Request<{ teamId: string }>, res: Response) => {
  const { teamId } = req.params;

  console.log('Fetching players for team ID:', teamId);

  try {
    const players = await prisma.player.findMany({
      where: { teamId: parseInt(teamId, 10) },
    });
    res.json(players);
  } catch (err) {
    console.error('Error fetching players:', err);
    res.status(500).json({ error: 'Failed to fetch players' });
  }
});

// Get a team by ID
app.get('/api/teams/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const team = await prisma.team.findUnique({
      where: { id: parseInt(id, 10) },
      include: {
        players: true,
        games: true,
      },
    });
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }
    res.json(team);
  } catch (err) {
    console.error('Error fetching team:', err);
    res.status(500).json({ error: 'Failed to fetch team' });
  }
});

// Update team settings
app.put('/api/teams/:id', async (req: Request<{ id: string }>, res: Response) => {
  const { id } = req.params;
  const { battingOrderStrategy } = req.body;

  const validStrategies: BattingOrderStrategy[] = ['rotate', 'keepSame', 'balancedFairness'];
  if (battingOrderStrategy && !validStrategies.includes(battingOrderStrategy)) {
    return res.status(400).json({ error: 'Invalid batting order strategy' });
  }

  try {
    const team = await prisma.team.update({
      where: { id: parseInt(id, 10) },
      data: { battingOrderStrategy },
    });
    res.json(team);
  } catch (err) {
    console.error('Error updating team:', err);
    res.status(500).json({ error: 'Failed to update team' });
  }
});

// Update a player's details
app.put('/api/teams/:teamId/players/:playerId', async (req: Request<{ teamId: string; playerId: string }>, res: Response) => {
  const { playerId } = req.params;
  const updated = req.body;
  try {
    const player = await prisma.player.update({
      where: { id: parseInt(playerId, 10) },
      data: updated,
    });
    res.json(player);
  } catch (err) {
    console.error('Error updating player:', err);
    res.status(500).json({ error: 'Failed to update player' });
  }
});

// Delete a player from a team
app.delete('/api/teams/:teamId/players/:playerId', async (req: Request<{ teamId: string; playerId: string }>, res: Response) => {
  const { playerId } = req.params;
  try {
    await prisma.player.delete({
      where: { id: parseInt(playerId, 10) },
    });
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting player:', err);
    res.status(500).json({ error: 'Failed to delete player' });
  }
});

// Create a new game for a team
app.post('/api/teams/:teamId/games', async (req: Request<{ teamId: string }>, res: Response) => {
  const { teamId } = req.params;
  const { date, playerIds, innings, battingOrderStrategy: strategyOverride, previousGameLastBatterIndex } = req.body;
  const teamIdInt = parseInt(teamId, 10);

  try {
    // Fetch players from the database
    const players = await prisma.player.findMany({
      where: { id: { in: playerIds.map((id: string) => parseInt(id, 10)) } },
    });

    if (players.length === 0) {
      return res.status(400).json({ error: 'No valid players provided' });
    }

    if (!date || isNaN(Date.parse(date))) {
      return res.status(400).json({ error: 'Invalid or missing date' });
    }

    const parsedDate = new Date(date);

    // Validate innings (1-9, default 4)
    const inningsCount = Math.min(9, Math.max(1, parseInt(innings, 10) || 4));

    // Determine batting order strategy
    let strategy: BattingOrderStrategy = strategyOverride;
    if (!strategy) {
      const team = await prisma.team.findUnique({ where: { id: teamIdInt } });
      strategy = (team?.battingOrderStrategy as BattingOrderStrategy) || 'rotate';
    }

    // Fetch previous games for batting order context
    const previousGames = await prisma.game.findMany({
      where: { teamId: teamIdInt },
      orderBy: { date: 'desc' },
      select: { id: true, lineup: true, lastBatterIndex: true },
    });

    // If coach marked the last batter during game setup, save it on the previous game
    if (previousGameLastBatterIndex != null && previousGames.length > 0) {
      const prevGame = previousGames.find(g => parseLineup(g.lineup)?.battingOrder != null);
      if (prevGame) {
        await prisma.game.update({
          where: { id: prevGame.id },
          data: { lastBatterIndex: previousGameLastBatterIndex },
        });
        prevGame.lastBatterIndex = previousGameLastBatterIndex;
      }
    }

    // Generate batting order, then the full lineup (which includes it)
    const battingOrder = generateBattingOrder(
      strategy,
      players.map(p => p.id),
      previousGames.map(g => ({
        battingOrder: parseLineup(g.lineup)?.battingOrder ?? null,
        lastBatterIndex: g.lastBatterIndex,
      })),
    );
    const lineup = generateLineup(players, inningsCount, battingOrder);

    const game = await prisma.game.create({
      data: {
        date: parsedDate,
        teamId: teamIdInt,
        innings: inningsCount,
        lineup: lineup as any,
        battingOrderStrategy: strategy,
        players: {
          connect: players.map((player) => ({ id: player.id })),
        },
      },
    });

    console.log('Game created:', game);

    trackEvent(`team:${teamIdInt}`, 'game_created', {
      team_id: teamIdInt,
      innings_count: inningsCount,
      player_count: players.length,
      batting_order_strategy: strategy,
    });
    res.status(201).json(game);
  } catch (err) {
    console.error('Error creating game:', err);
    res.status(500).json({ error: 'Failed to create game' });
  }
});

// Get all games for a team
app.get('/api/teams/:teamId/games', async (req: Request<{ teamId: string }>, res: Response) => {
  const { teamId } = req.params;
  try {
    const games = await prisma.game.findMany({
      where: { teamId: parseInt(teamId, 10) },
      include: { players: true },
      orderBy: { date: 'desc' },
    });
    res.json(games);
  } catch (err) {
    console.error('Error fetching games:', err);
    res.status(500).json({ error: 'Failed to fetch games' });
  }
});

// Get a specific game by ID
app.get('/api/teams/:teamId/games/:gameId', async (req: Request<{ teamId: string; gameId: string }>, res: Response) => {
  
  console.log('Fetching game details for:', req.params);
  
  const { gameId } = req.params;
  try {
    const game = await prisma.game.findUnique({
      where: { id: parseInt(gameId, 10) },
      include: {
        players: true,
      },
    });
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    res.json(game);
  } catch (err) {
    console.error('Error fetching game:', err);
    res.status(500).json({ error: 'Failed to fetch game' });
  }
});

// Update a game (opponent, scores, lineup, players)
app.put('/api/teams/:teamId/games/:gameId', async (req: Request<{ teamId: string; gameId: string }>, res: Response) => {
  const { gameId } = req.params;
  const { opponent, homeScore, awayScore, lineup, lastBatterIndex, playerIds, innings, currentInning, atBatIdx } = req.body;

  try {
    const updateData: {
      opponent?: string | null;
      homeScore?: number | null;
      awayScore?: number | null;
      lineup?: string;
      lastBatterIndex?: number | null;
      innings?: number;
      currentInning?: number | null;
      atBatIdx?: number | null;
      players?: { set: { id: number }[] };
    } = {};

    // Only include fields that are provided
    if (opponent !== undefined) updateData.opponent = opponent;
    if (homeScore !== undefined) updateData.homeScore = homeScore;
    if (awayScore !== undefined) updateData.awayScore = awayScore;
    if (lineup !== undefined) updateData.lineup = lineup;
    if (lastBatterIndex !== undefined) updateData.lastBatterIndex = lastBatterIndex;
    if (currentInning !== undefined) updateData.currentInning = currentInning;
    if (atBatIdx !== undefined) updateData.atBatIdx = atBatIdx;
    if (innings !== undefined) {
      updateData.innings = Math.min(9, Math.max(1, parseInt(innings, 10) || 4));
    }

    // Handle player updates if provided
    if (playerIds !== undefined) {
      updateData.players = {
        set: playerIds.map((id: string) => ({ id: parseInt(id, 10) })),
      };
    }

    const game = await prisma.game.update({
      where: { id: parseInt(gameId, 10) },
      data: updateData,
      include: { players: true },
    });

    res.json(game);
  } catch (err) {
    console.error('Error updating game:', err);
    res.status(500).json({ error: 'Failed to update game' });
  }
});

// Get season recap stats for a team
app.get('/api/teams/:teamId/season-recap', async (req: Request<{ teamId: string }>, res: Response) => {
  const { teamId } = req.params;
  try {
    const team = await prisma.team.findUnique({
      where: { id: parseInt(teamId, 10) },
      include: {
        games: {
          include: { players: true },
          orderBy: { date: 'asc' },
        },
        players: true,
      },
    });

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const stats = calculateSeasonRecapStats(team);
    res.json(stats);
  } catch (err) {
    console.error('Error fetching season recap:', err);
    res.status(500).json({ error: 'Failed to fetch season recap' });
  }
});

// Fix PORT type issue
const PORT = parseInt(process.env.PORT || '3000', 10);
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});

process.on('SIGTERM', async () => {
  await shutdownAnalytics();
  process.exit(0);
});
