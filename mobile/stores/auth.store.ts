/**
 * Authentication store using Zustand.
 *
 * Manages user authentication state, tokens, and user profile.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';

import type { User, AuthTokens, UserProgress } from '@/types';

// Custom storage adapter for Expo SecureStore
const secureStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return await SecureStore.getItemAsync(name);
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await SecureStore.setItemAsync(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await SecureStore.deleteItemAsync(name);
  },
};

interface AuthState {
  // State
  user: User | null;
  tokens: AuthTokens | null;
  progress: UserProgress | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isOnboarded: boolean;

  // Actions
  setUser: (user: User) => void;
  setTokens: (tokens: AuthTokens) => void;
  setProgress: (progress: UserProgress) => void;
  setOnboarded: (value: boolean) => void;
  login: (user: User, tokens: AuthTokens, progress: UserProgress) => void;
  logout: () => void;
  updateProgress: (partial: Partial<UserProgress>) => void;
  addXp: (amount: number) => void;
  useHeart: () => boolean;
  regenerateHeart: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      tokens: null,
      progress: null,
      isAuthenticated: false,
      isLoading: true,
      isOnboarded: false,

      // Actions
      setUser: (user) => set({ user }),

      setTokens: (tokens) => set({ tokens }),

      setProgress: (progress) => set({ progress }),

      setOnboarded: (value) => set({ isOnboarded: value }),

      login: (user, tokens, progress) =>
        set({
          user,
          tokens,
          progress,
          isAuthenticated: true,
          isLoading: false,
        }),

      logout: () =>
        set({
          user: null,
          tokens: null,
          progress: null,
          isAuthenticated: false,
        }),

      updateProgress: (partial) =>
        set((state) => ({
          progress: state.progress
            ? { ...state.progress, ...partial }
            : null,
        })),

      addXp: (amount) =>
        set((state) => {
          if (!state.progress) return state;

          const newTotalXp = state.progress.totalXp + amount;
          // Simple level calculation: level = floor(sqrt(totalXp / 100))
          const newLevel = Math.floor(Math.sqrt(newTotalXp / 100)) + 1;

          return {
            progress: {
              ...state.progress,
              totalXp: newTotalXp,
              level: Math.max(state.progress.level, newLevel),
            },
          };
        }),

      useHeart: () => {
        const state = get();
        if (!state.progress || state.progress.hearts <= 0) return false;

        set((state) => ({
          progress: state.progress
            ? {
                ...state.progress,
                hearts: state.progress.hearts - 1,
                heartsRegenAt:
                  state.progress.hearts === state.progress.maxHearts
                    ? new Date().toISOString()
                    : state.progress.heartsRegenAt,
              }
            : null,
        }));

        return true;
      },

      regenerateHeart: () =>
        set((state) => {
          if (!state.progress) return state;
          if (state.progress.hearts >= state.progress.maxHearts) return state;

          return {
            progress: {
              ...state.progress,
              hearts: state.progress.hearts + 1,
              heartsRegenAt:
                state.progress.hearts + 1 >= state.progress.maxHearts
                  ? undefined
                  : new Date().toISOString(),
            },
          };
        }),
    }),
    {
      name: 'quran-quest-auth',
      storage: createJSONStorage(() => secureStorage),
      partialize: (state) => ({
        tokens: state.tokens,
        isOnboarded: state.isOnboarded,
      }),
    }
  )
);

