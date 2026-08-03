// src/providers/AuthProvider.tsx
import { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { tokenManager } from '@/utils/tokenManager';
import { useQuery } from '@tanstack/react-query';
import { getCurrentUser } from '@/lib/api/auth';
import { useToast } from '@/hooks/useToast';
import { useTranslation } from '@/hooks/useTranslation';
import type { UserProfile } from '@/types/auth.types';

interface AuthContextValue {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refetch: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserProfile | null>(() => tokenManager.getUser());
  const { error } = useToast();
  const { t } = useTranslation();

  // Check if we have a token
  const hasToken = tokenManager.hasValidSession();

  // Fetch user from API - use React Query's built-in cache
  const {
    data: fetchedUser,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: async () => {
      if (!hasToken) return null;
      try {
        const userData = await getCurrentUser();
        return userData;
      } catch (err) {
        console.error('❌ AuthProvider: Failed to fetch user:', err);
        tokenManager.clearAll();
        setUser(null);
        error(t('auth.session.expired'));
        return null;
      }
    },
    enabled: hasToken,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: false,
  });

  // Sync user state with fetched data
  useEffect(() => {
    if (fetchedUser) {
      // Only update if different to avoid loops
      if (user?.id !== fetchedUser.id) {
        setUser(fetchedUser);
        tokenManager.setUser(fetchedUser);
      }
    } else if (!hasToken) {
      setUser(null);
    }
  }, [fetchedUser, hasToken, user?.id]);

  const value: AuthContextValue = {
    user,
    isLoading,
    isAuthenticated: !!user && hasToken,
    refetch,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}