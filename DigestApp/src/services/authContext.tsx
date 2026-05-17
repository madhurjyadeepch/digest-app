import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

// ─── Types ──────────────────────────────────────────
interface User {
  _id: string;
  email: string;
  displayName: string;
  preferences?: {
    categories?: string[];
    notifications?: boolean;
    language?: string;
    country?: string;
  };
  bookmarkCount?: number;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = '@digest_token';
const USER_KEY = '@digest_user';

// ─── Provider ───────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    restoreSession();
  }, []);

  const restoreSession = async () => {
    try {
      const [savedToken, savedUser] = await Promise.all([
        AsyncStorage.getItem(TOKEN_KEY),
        AsyncStorage.getItem(USER_KEY),
      ]);

      if (savedToken && savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setToken(savedToken);
        setUser(parsedUser);
        api.setAuthToken(savedToken);
      }
    } catch (err) {
      console.warn('[Auth] Failed to restore session:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const persistSession = async (newToken: string, newUser: User) => {
    await Promise.all([
      AsyncStorage.setItem(TOKEN_KEY, newToken),
      AsyncStorage.setItem(USER_KEY, JSON.stringify(newUser)),
    ]);
  };

  const clearSession = async () => {
    await Promise.all([
      AsyncStorage.removeItem(TOKEN_KEY),
      AsyncStorage.removeItem(USER_KEY),
    ]);
  };

  const login = useCallback(async (email: string, password: string) => {
    const result = await api.login(email, password);
    setToken(result.token);
    setUser(result.user);
    api.setAuthToken(result.token);
    await persistSession(result.token, result.user);
  }, []);

  const register = useCallback(
    async (email: string, password: string, displayName?: string) => {
      const result = await api.register(email, password, displayName);
      setToken(result.token);
      setUser(result.user);
      api.setAuthToken(result.token);
      await persistSession(result.token, result.user);
    },
    []
  );

  const logout = useCallback(async () => {
    setToken(null);
    setUser(null);
    api.setAuthToken(null);
    await clearSession();
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!token) return;
    try {
      const profileData = await api.getProfile();
      if (profileData?.user) {
        setUser(profileData.user);
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(profileData.user));
      }
    } catch (err) {
      console.warn('[Auth] Failed to refresh profile:', err);
    }
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ───────────────────────────────────────────
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
