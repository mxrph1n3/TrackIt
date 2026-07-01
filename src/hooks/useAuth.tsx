import type { Session, User } from '@supabase/supabase-js';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

import { signInWithAppleNative } from '../lib/auth/apple';
import { signInWithGoogleOAuth } from '../lib/auth/oauth';
import { toAuthErrorMessage, validateAuthForm } from '../lib/auth/validation';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

type AuthProviderProps = PropsWithChildren<{
  session: Session | null;
}>;

type UseAuthResult = {
  session: Session | null;
  user: User | null;
  isAuthenticating: boolean;
  authError: string | null;
  clearAuthError: () => void;
  signInWithEmail: (email: string, password: string) => Promise<boolean>;
  signUpWithEmail: (email: string, password: string) => Promise<boolean>;
  signInWithGoogle: () => Promise<boolean>;
  signInWithApple: () => Promise<boolean>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<UseAuthResult | null>(null);

function useAuthProvider(session: Session | null): UseAuthResult {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  const runAuthAction = useCallback(async (action: () => Promise<void>) => {
    if (!isSupabaseConfigured) {
      setAuthError(
        'Supabase is not configured. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.',
      );
      return false;
    }

    setIsAuthenticating(true);
    setAuthError(null);

    try {
      await action();
      return true;
    } catch (error) {
      setAuthError(toAuthErrorMessage(error));
      return false;
    } finally {
      setIsAuthenticating(false);
    }
  }, []);

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      const fieldErrors = validateAuthForm(email, password, 'sign-in');
      if (fieldErrors.email || fieldErrors.password) {
        setAuthError(fieldErrors.email ?? fieldErrors.password ?? 'Invalid credentials.');
        return false;
      }

      return runAuthAction(async () => {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          throw error;
        }
      });
    },
    [runAuthAction],
  );

  const signUpWithEmail = useCallback(
    async (email: string, password: string) => {
      const fieldErrors = validateAuthForm(email, password, 'sign-up');
      if (fieldErrors.email || fieldErrors.password) {
        setAuthError(fieldErrors.email ?? fieldErrors.password ?? 'Invalid sign-up details.');
        return false;
      }

      return runAuthAction(async () => {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });

        if (error) {
          throw error;
        }

        if (!data.session) {
          throw new Error('Check your email inbox to confirm your account before signing in.');
        }
      });
    },
    [runAuthAction],
  );

  const signInWithGoogle = useCallback(async () => {
    return runAuthAction(async () => {
      await signInWithGoogleOAuth();
    });
  }, [runAuthAction]);

  const signInWithApple = useCallback(async () => {
    return runAuthAction(async () => {
      await signInWithAppleNative();
    });
  }, [runAuthAction]);

  const signOut = useCallback(async () => {
    setAuthError(null);
    await supabase.auth.signOut();
  }, []);

  return useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      isAuthenticating,
      authError,
      clearAuthError,
      signInWithEmail,
      signUpWithEmail,
      signInWithGoogle,
      signInWithApple,
      signOut,
    }),
    [
      authError,
      clearAuthError,
      isAuthenticating,
      session,
      signInWithApple,
      signInWithEmail,
      signInWithGoogle,
      signOut,
      signUpWithEmail,
    ],
  );
}

export function AuthProvider({ children, session }: AuthProviderProps) {
  const value = useAuthProvider(session);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): UseAuthResult {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }
  return context;
}
