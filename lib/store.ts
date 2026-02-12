import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, DailyMenuWithFlavor } from './database.types';

interface AppState {
  // User state
  user: User | null;
  setUser: (user: User | null) => void;
  isAdmin: boolean;

  // Today's menu
  todaysMenu: DailyMenuWithFlavor[];
  setTodaysMenu: (menu: DailyMenuWithFlavor[]) => void;
  menuLastUpdated: string | null;

  // Watchlist
  watchlistIds: string[];
  addToWatchlist: (flavorId: string) => void;
  removeFromWatchlist: (flavorId: string) => void;
  isInWatchlist: (flavorId: string) => boolean;

  // Tried flavors (local tracking before sync)
  triedFlavorIds: string[];
  markAsTried: (flavorId: string) => void;
  hasTried: (flavorId: string) => boolean;

  // Onboarding
  hasCompletedOnboarding: boolean;
  completeOnboarding: () => void;

  // UI state
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchFilters: SearchFilters;
  setSearchFilters: (filters: SearchFilters) => void;

  // Notifications
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;
}

interface SearchFilters {
  category: string | null;
  rarity: string | null;
  dietary: string[];
  yearRange: [number, number] | null;
  season: string | null;
}

const defaultSearchFilters: SearchFilters = {
  category: null,
  rarity: null,
  dietary: [],
  yearRange: null,
  season: null,
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // User state
      user: null,
      setUser: (user) => set({ user, isAdmin: user?.is_admin ?? false }),
      isAdmin: false,

      // Today's menu
      todaysMenu: [],
      setTodaysMenu: (menu) =>
        set({ todaysMenu: menu, menuLastUpdated: new Date().toISOString() }),
      menuLastUpdated: null,

      // Watchlist
      watchlistIds: [],
      addToWatchlist: (flavorId) =>
        set((state) => ({
          watchlistIds: Array.from(new Set([...state.watchlistIds, flavorId])),
        })),
      removeFromWatchlist: (flavorId) =>
        set((state) => ({
          watchlistIds: state.watchlistIds.filter((id) => id !== flavorId),
        })),
      isInWatchlist: (flavorId) => get().watchlistIds.includes(flavorId),

      // Tried flavors
      triedFlavorIds: [],
      markAsTried: (flavorId) =>
        set((state) => ({
          triedFlavorIds: Array.from(new Set([...state.triedFlavorIds, flavorId])),
        })),
      hasTried: (flavorId) => get().triedFlavorIds.includes(flavorId),

      // Onboarding
      hasCompletedOnboarding: false,
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),

      // UI state
      isLoading: false,
      setIsLoading: (loading) => set({ isLoading: loading }),
      error: null,
      setError: (error) => set({ error }),

      // Search
      searchQuery: '',
      setSearchQuery: (query) => set({ searchQuery: query }),
      searchFilters: defaultSearchFilters,
      setSearchFilters: (filters) => set({ searchFilters: filters }),

      // Notifications
      notificationsEnabled: false,
      setNotificationsEnabled: (enabled) =>
        set({ notificationsEnabled: enabled }),
    }),
    {
      name: 'max-minas-storage',
      partialize: (state) => ({
        watchlistIds: state.watchlistIds,
        triedFlavorIds: state.triedFlavorIds,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        notificationsEnabled: state.notificationsEnabled,
      }),
    }
  )
);

// Selector hooks for common operations
export const useUser = () => useStore((state) => state.user);
export const useIsAdmin = () => useStore((state) => state.isAdmin);
export const useTodaysMenu = () => useStore((state) => state.todaysMenu);
export const useWatchlist = () => useStore((state) => state.watchlistIds);
export const useIsLoading = () => useStore((state) => state.isLoading);
export const useError = () => useStore((state) => state.error);
