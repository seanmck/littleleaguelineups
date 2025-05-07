import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

interface AppState {
  teams: Team[];
  selectedTeamId: string | null;
  addTeam: (name: string) => void;
  selectTeam: (id: string) => void;
  getActiveTeam: () => Team | null;

  addPlayerToActiveTeam: (name: string) => void;
  addGameToActiveTeam: (date: string, playerIds: string[]) => void;
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
    if (!selectedTeamId) return;

    const newGame: Game = {
      id: uuidv4(),
      date,
      playerIds,
    };

    set({
      teams: teams.map(team =>
        team.id === selectedTeamId
          ? {
              ...team,
              games: [...team.games, newGame],
            }
          : team
      ),
    });
  },
}));
