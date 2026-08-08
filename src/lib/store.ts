import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SessionUser } from '../types';

interface SearchState {
  destination: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
}

interface AppState {
  user: SessionUser | null;
  theme: 'light' | 'dark';
  search: SearchState;
  setUser: (user: SessionUser | null) => void;
  logout: () => void;
  toggleTheme: () => void;
  setSearch: (patch: Partial<SearchState>) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      theme: 'light',
      search: {
        destination: '',
        checkIn: '',
        checkOut: '',
        guests: 2,
        rooms: 1
      },
      setUser: function (user) {
        set({ user: user });
      },
      logout: function () {
        set({ user: null });
      },
      toggleTheme: function () {
        set({ theme: get().theme === 'dark' ? 'light' : 'dark' });
      },
      setSearch: function (patch) {
        set({ search: Object.assign({}, get().search, patch) });
      }
    }),
    { name: 'staysphere-app' }
  )
);
