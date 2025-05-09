import express from 'express';
import cors from 'cors';
import { nanoid } from 'nanoid';

const app = express();
app.use(cors());
app.use(express.json());

let teams = [];

// Get all teams
app.get('/api/teams', (req, res) => {
  res.json(teams);
});

// Create a new team
app.post('/api/teams', (req, res) => {
  const { name } = req.body;
  const team = { id: nanoid(), name, players: [], games: [] };
  teams.push(team);
  res.status(201).json(team);
});

// Add a player to a team
app.post('/api/teams/:teamId/players', (req, res) => {
  const { teamId } = req.params;
  const { name } = req.body;
  const team = teams.find(t => t.id === teamId);
  if (!team) return res.status(404).json({ error: 'Team not found' });
  const player = { id: nanoid(), name, canPlay: [] };
  team.players.push(player);
  res.status(201).json(player);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`API listening on port ${PORT}`);
});
