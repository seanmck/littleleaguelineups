import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Team, Player, Game } from '../types';

interface AppState {
  teams: Team[];
  selectedTeamId: string | null;
  addTeam: (name: string) => void;
  selectTeam: (id: string) => void;
  getActiveTeam: () => Team | null;

  addPlayerToActiveTeam: (name: string) => void;
  addGameToActiveTeam: (date: string, playerIds: string[]) => Game | null;

  loadDevData: () => void;
}

export const useStore = create<AppState>((set, get) => ({
  teams: [],
  selectedTeamId: null,
  addTeam: (name) => {
    const newTeam: Team = {
      id: uuidv4(),
      name,
      players: [],
      games: [],
    };
    set(state => ({
      teams: [...state.teams, newTeam],
      selectedTeamId: newTeam.id,
    }));
  },
  selectTeam: (id) => set({ selectedTeamId: id }),
  getActiveTeam: () => {
    const { teams, selectedTeamId } = get();
    return teams.find(team => team.id === selectedTeamId) || null;
  },

  addPlayerToActiveTeam: (name) => {
    const { selectedTeamId, teams } = get();
    if (!selectedTeamId) return;

    set({
      teams: teams.map(team =>
        team.id === selectedTeamId
          ? {
              ...team,
              players: [...team.players, { id: uuidv4(), name }],
            }
          : team
      ),
    });
  },

  addGameToActiveTeam: (date, playerIds) => {
    const { selectedTeamId, teams } = get();
    if (!selectedTeamId) return null;
  
    const newGame: Game = {
      id: uuidv4(),
      date,
      playerIds,
    };
  
    let createdGame: Game | null = null;
  
    const updatedTeams = teams.map(team => {
      if (team.id === selectedTeamId) {
        createdGame = newGame;
        return {
          ...team,
          games: [...team.games, newGame],
        };
      }
      return team;
    });
  
    set({ teams: updatedTeams });
  
    return createdGame;
},  

loadDevData: () => {
  const teamId = uuidv4();
  const players = ['Micah', 'Lorenzo', 'Elliott', 'Henry', 'Asher', 'Oliver', 'Miles', 'Sullivan', 'Will'].map(name => ({
    id: uuidv4(),
    name,
  }));

  const gameId = uuidv4();

  const teams: Team[] = [
    {
      id: teamId,
      name: 'Red Rockets',
      players,
      games: [
        {
          id: gameId,
          date: '2025-05-10',
          playerIds: players.map(p => p.id),
        },
      ],
    },
  ];

  set({
    teams,
    selectedTeamId: teamId,
  });
},
}));