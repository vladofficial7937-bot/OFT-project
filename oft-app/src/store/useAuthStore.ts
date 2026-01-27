/**
 * Стейт авторизации для Telegram Mini App
 * Zustand + persist: сессия переживает закрытие/открытие приложения
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const AUTH_STORAGE_KEY = 'oft-auth-storage';

export interface AuthUser {
  id: string;
  firstName: string;
  username: string;
}

export type AuthRole = 'client' | 'trainer';

interface AuthState {
  user: AuthUser | null;
  role: AuthRole | null;
  isAuthenticated: boolean;
}

interface AuthActions {
  login: (userData: AuthUser, role: AuthRole) => void;
  logout: () => void;
}

const initialState: AuthState = {
  user: null,
  role: null,
  isAuthenticated: false,
};

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      ...initialState,

      login: (userData, role) => {
        set({
          user: userData,
          role,
          isAuthenticated: true,
        });
      },

      logout: () => {
        set(initialState);
        if (typeof window !== 'undefined') {
          localStorage.removeItem(AUTH_STORAGE_KEY);
        }
      },
    }),
    {
      name: AUTH_STORAGE_KEY,
      partialize: (s) => ({
        user: s.user,
        role: s.role,
        isAuthenticated: s.isAuthenticated,
      }),
    }
  )
);
