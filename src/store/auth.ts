import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile, UserOut } from '../api/types';
import { persistStorage } from './persist';

interface AuthState {
  /** Mirrors "a refresh token exists in the keychain" — set on start by bootstrapSession. */
  isLoggedIn: boolean;
  /** Cached profile so the account screen paints offline; refreshed from GET /users/me. */
  user: UserProfile | null;
  setLoggedIn: (v: boolean) => void;
  setUser: (user: UserProfile | UserOut | null) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      user: null,
      setLoggedIn: (isLoggedIn) => set({ isLoggedIn }),
      setUser: (user) =>
        set((s) => ({
          user: user ? { addresses: s.user?.addresses ?? [], ...user } : null,
        })),
      reset: () => set({ isLoggedIn: false, user: null }),
    }),
    { name: 'bazaura.auth', storage: persistStorage, version: 2, partialize: (s) => ({ user: s.user }) },
  ),
);
