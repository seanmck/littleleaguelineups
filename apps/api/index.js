import express from 'express';
import cors from 'cors';
import { nanoid } from 'nanoid';

const app = express();
app.use(cors());
app.use(express.json());

let teams = [];

// Load mock data only in development
if (process.env.NODE_ENV === 'development') {
  console.log('Loading mock data for development...');
  teams = [
    {
      id: nanoid(),
      name: 'Red Rockets',
      players: [
        { id: nanoid(), name: 'Alice' },
        { id: nanoid(), name: 'Bob' },
        { id: nanoid(), name: 'Charlie' },
        { id: nanoid(), name: 'Diana' },
      ],
      games: [
        {
          id: nanoid(),
          date: '2025-05-15',
          lineup: {
            1: { P: 'player1', C: 'player2' },
            2: { P: 'player3', C: 'player4' },
          },
          players: [
            { id: 'player1', name: 'Alice' },
            { id: 'player2', name: 'Bob' },
            { id: 'player3', name: 'Charlie' },
            { id: 'player4', name: 'Diana' },
          ],
        },
      ],
    },
  ];
}

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

// Get all players in a team
app.get('/api/teams/:teamId/players', (req, res) => {
  const { teamId } = req.params;

  const team = teams.find(t => t.id === teamId);
  if (!team) {
    return res.status(404).json({ error: 'Team not found' });
  }

  res.json(team.players || []);
});

// Get a team by ID
app.get('/api/teams/:id', (req, res) => {
  const team = teams.find(t => t.id === req.params.id);
  if (!team) {
    return res.status(404).json({ error: 'Team not found' });
  }
  res.json(team);
});

app.put('/api/teams/:teamId/players/:playerId', (req, res) => {
  const { teamId, playerId } = req.params;
  const updated = req.body;

  console.log('Updating player:', { teamId, playerId, updated });

  const team = teams.find(t => t.id === teamId);
  if (!team) return res.status(404).json({ error: 'Team not found' });

  const playerIndex = team.players.findIndex(p => p.id === playerId);
  if (playerIndex === -1) {
    return res.status(404).json({ error: 'Player not found' });
  }

  // Update the player in-place
  team.players[playerIndex] = {
    ...team.players[playerIndex],
    ...updated
  };

  res.json(team.players[playerIndex]);
});

const generateLineup = (players) => {
  const lineup = {};

  // Define the positions
  const positions = ['P', 'C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF'];

  // Shuffle function to randomize positions
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Track assigned positions for each player to avoid repetition
  const playerPositionHistory = players.reduce((acc, player) => {
    acc[player.id] = [];
    return acc;
  }, {});

  // Assign players to positions for 4 innings
  for (let inning = 1; inning <= 4; inning++) {
    lineup[inning] = {};
    const shuffledPositions = shuffleArray(positions); // Shuffle positions for each inning

    players.forEach((player) => {
      // Filter positions based on avoidPositions
      const avoidFilteredPositions = shuffledPositions.filter(
        (pos) => !player.avoidPositions || !player.avoidPositions.includes(pos)
      );

      // Prioritize preferred positions if available
      const preferredPositions = avoidFilteredPositions.filter(
        (pos) => player.preferredPositions && player.preferredPositions.includes(pos)
      );

      // Avoid assigning the same position as in previous innings
      const nonRepeatingPositions = (preferredPositions.length > 0 ? preferredPositions : avoidFilteredPositions).filter(
        (pos) => !playerPositionHistory[player.id].includes(pos)
      );

      // Assign the first non-repeating position, or fallback to any avoid-filtered position
      const position = nonRepeatingPositions[0] || avoidFilteredPositions[0];

      if (position) {
        lineup[inning][position] = player.id;
        playerPositionHistory[player.id].push(position); // Track assigned position
        // Remove the assigned position from the shuffled list to avoid duplicates
        shuffledPositions.splice(shuffledPositions.indexOf(position), 1);
      }
    });
  }

  return lineup;
};

// Create a new game for a team
app.post('/api/teams/:teamId/games', (req, res) => {
  const { teamId } = req.params;
  const { date, playerIds } = req.body; // Only receive player IDs from the frontend

  const team = teams.find(t => t.id === teamId);
  if (!team) {
    return res.status(404).json({ error: 'Team not found' });
  }

  // Fetch the full player data for the selected player IDs
  const players = team.players.filter(player => playerIds.includes(player.id));
  if (players.length === 0) {
    return res.status(400).json({ error: 'No valid players provided' });
  }

  // Generate the lineup using the full player data
  const lineup = generateLineup(players);

  // Create the game
  const game = {
    id: nanoid(),
    date,
    lineup,
    players,
  };

  team.games.push(game);

  res.status(201).json(game);
});

// Get a specific game by ID
app.get('/api/teams/:teamId/games/:gameId', (req, res) => {
  const { teamId, gameId } = req.params;

  // Find the team
  const team = teams.find(t => t.id === teamId);
  if (!team) {
    return res.status(404).json({ error: 'Team not found' });
  }

  // Find the game
  const game = team.games.find(g => g.id === gameId);
  if (!game) {
    return res.status(404).json({ error: 'Game not found' });
  }

  res.json(game);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`API listening on port ${PORT}`);
});
