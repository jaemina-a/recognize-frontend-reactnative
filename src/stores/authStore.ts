import type { User } from '@/src/features/auth/types/auth.types';
import { create } from 'zustand';

// TODO: persist 미들웨어 추가 (AsyncStorage)

type AuthState = {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoggedIn: false,
  setAuth: (user, token) => set({ user, token, isLoggedIn: true }),
  logout: () => set({ user: null, token: null, isLoggedIn: false }),
}));
