// src/utils/tokenManager.ts
import type { UserProfile } from '@/types/auth.types';

// Storage keys
const ACCESS_TOKEN_KEY = 'orthovoix_access_token';
const USER_KEY = 'orthovoix_user';
const REFRESH_TOKEN_KEY = 'orthovoix_refresh_token';

// In-memory cache
let accessToken: string | null = null;
let refreshToken: string | null = null;
let currentUser: UserProfile | null = null;

// Initialize from storage on module load
const initFromStorage = () => {
  // Access token
  const storedToken = sessionStorage.getItem(ACCESS_TOKEN_KEY);
  if (storedToken) {
    accessToken = storedToken;
    console.log('🔑 TokenManager: Access token restored from sessionStorage');
  }

  // Refresh token
  const storedRefresh = sessionStorage.getItem(REFRESH_TOKEN_KEY);
  if (storedRefresh) {
    refreshToken = storedRefresh;
    console.log('🔑 TokenManager: Refresh token restored from sessionStorage');
  }

  // User
  const storedUser = sessionStorage.getItem(USER_KEY);
  if (storedUser) {
    try {
      currentUser = JSON.parse(storedUser);
      console.log('👤 TokenManager: User restored from sessionStorage:', currentUser?.email);
    } catch {
      console.error('❌ TokenManager: Failed to parse stored user');
      sessionStorage.removeItem(USER_KEY);
    }
  }
};

// Initialize immediately
initFromStorage();

export const tokenManager = {
  // Access Token
  getAccessToken: (): string | null => {
    if (accessToken) return accessToken;
    
    const stored = sessionStorage.getItem(ACCESS_TOKEN_KEY);
    if (stored) {
      accessToken = stored;
      return stored;
    }
    return null;
  },

  setAccessToken: (token: string): void => {
    accessToken = token;
    sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
    console.log('🔑 TokenManager: Access token stored');
  },

  // Refresh Token
  getRefreshToken: (): string | null => {
    if (refreshToken) return refreshToken;
    
    const stored = sessionStorage.getItem(REFRESH_TOKEN_KEY);
    if (stored) {
      refreshToken = stored;
      return stored;
    }
    return null;
  },

  setRefreshToken: (token: string): void => {
    refreshToken = token;
    sessionStorage.setItem(REFRESH_TOKEN_KEY, token);
    console.log('🔑 TokenManager: Refresh token stored');
  },

  // User
  getUser: (): UserProfile | null => {
    if (currentUser) return currentUser;
    
    const stored = sessionStorage.getItem(USER_KEY);
    if (stored) {
      try {
        currentUser = JSON.parse(stored);
        return currentUser;
      } catch {
        return null;
      }
    }
    return null;
  },

  setUser: (user: UserProfile): void => {
    currentUser = user;
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    console.log('👤 TokenManager: User stored:', user.email);
  },

  // Clear methods
  clearTokens: (): void => {
    accessToken = null;
    refreshToken = null;
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    console.log('🗑️ TokenManager: Tokens cleared');
  },

  clearUser: (): void => {
    currentUser = null;
    sessionStorage.removeItem(USER_KEY);
    console.log('🗑️ TokenManager: User cleared');
  },

  clearAll: (): void => {
    accessToken = null;
    refreshToken = null;
    currentUser = null;
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    console.log('🗑️ TokenManager: All auth data cleared');
  },

  // Auth checks
  isAuthenticated: (): boolean => {
    return !!tokenManager.getAccessToken();
  },

  hasValidSession: (): boolean => {
    return !!tokenManager.getAccessToken() && !!tokenManager.getUser();
  },
};