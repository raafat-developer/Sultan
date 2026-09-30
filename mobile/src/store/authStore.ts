import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { User, RoleType } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  role: RoleType | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (data: { user: User; accessToken: string; refreshToken: string }) => Promise<void>;
  updateUser: (user: Partial<User>) => void;
  logout: () => Promise<void>;
  loadSession: () => Promise<void>;
}

const SECURE_TOKEN_KEY = 'fastman_access_token';
const SECURE_REFRESH_KEY = 'fastman_refresh_token';
const USER_KEY = 'fastman_user_data';

async function setSecureItem(key: string, value: string) {
  if (Platform.OS === 'web') {
    localStorage.setItem(key, value);
  } else {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {
      localStorage?.setItem?.(key, value);
    }
  }
}

async function getSecureItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return localStorage.getItem(key);
  }
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

async function deleteSecureItem(key: string) {
  if (Platform.OS === 'web') {
    localStorage.removeItem(key);
  } else {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {}
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  refreshToken: null,
  role: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: async ({ user, accessToken, refreshToken }) => {
    const primaryRole = user.roles[0] || 'COURIER';
    await setSecureItem(SECURE_TOKEN_KEY, accessToken);
    await setSecureItem(SECURE_REFRESH_KEY, refreshToken);
    await setSecureItem(USER_KEY, JSON.stringify(user));

    set({
      user,
      token: accessToken,
      refreshToken,
      role: primaryRole,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  updateUser: (updates) => {
    const current = get().user;
    if (current) {
      const updated = { ...current, ...updates };
      setSecureItem(USER_KEY, JSON.stringify(updated));
      set({ user: updated });
    }
  },

  logout: async () => {
    await deleteSecureItem(SECURE_TOKEN_KEY);
    await deleteSecureItem(SECURE_REFRESH_KEY);
    await deleteSecureItem(USER_KEY);

    set({
      user: null,
      token: null,
      refreshToken: null,
      role: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  loadSession: async () => {
    try {
      const token = await getSecureItem(SECURE_TOKEN_KEY);
      const refreshToken = await getSecureItem(SECURE_REFRESH_KEY);
      const userData = await getSecureItem(USER_KEY);

      if (token && userData) {
        const user: User = JSON.parse(userData);
        const primaryRole = user.roles[0] || 'COURIER';
        set({
          user,
          token,
          refreshToken,
          role: primaryRole,
          isAuthenticated: true,
          isLoading: false,
        });
        return;
      }
    } catch (e) {
      console.warn('Failed to load session:', e);
    }
    set({ isLoading: false });
  },
}));
