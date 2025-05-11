import { create } from 'zustand';
import { nanoid } from 'nanoid';
import { Team } from '../types';

interface AppState {
  teams: Team[];
  loadDevData: () => void;
}

export const useStore = create<AppState>((set) => ({
  teams: [],

  loadDevData: () => {
    const team: Team = {
      id: nanoid(),
      name: 'Red Rockets',
      players: [],
      games: [],
    };
    set(state => ({ teams: [...state.teams, team] }));
  },
}));
