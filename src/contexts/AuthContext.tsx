import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';
import { supabase } from '../lib/supabaseClient';
import { configureRevenueCat, loginRevenueCatUser, logoutRevenueCatUser } from '../lib/revenuecat';

interface RedeemResult {
  success: boolean;
  error?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isPremium: boolean;
  isPasswordRecovery: boolean;
  isEmailJustConfirmed: boolean;
  isPasswordJustReset: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  redeemCode: (code: string) => Promise<RedeemResult>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  resendConfirmation: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: string | null }>;
  setPremium: (value: boolean) => void;
}

// Creator codes are validated entirely server-side by the redeem_creator_code RPC.
// No code value is ever present in client source or in the shipped bundle.
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
  const [isEmailJustConfirmed, setIsEmailJustConfirmed] = useState(false);
  const [isPasswordJustReset, setIsPasswordJustReset] = useState(false);

  const loadPremiumStatus = async (currentUser: User | null) => {
    if (!currentUser) {
      setIsPremium(false);
      return;
    }

    const { data, error } = await supabase
      .from('facial_profiles')
      .select('is_premium')
      .eq('user_id', currentUser.id)
      .maybeSingle();

    if (error) {
      console.error('Failed to load premium status:', error);
      setIsPremium(false);
      return;
    }

    setIsPremium(Boolean(data?.is_premium));
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      await configureRevenueCat(currentUser?.id ?? null);
      if (currentUser) {
        await loginRevenueCatUser(currentUser.id);
      }
      loadPremiumStatus(currentUser).finally(() => setLoading(false));
    }).catch((error) => {
      console.error('Session check failed:', error);
      supabase.auth.signOut();
      setSession(null);
      setUser(null);
      setIsPremium(false);
      setLoading(false);
    });

    // Web-based auth callback: handle token_hash (signup/recovery) from URL params.
    // On native this is handled by the appUrlOpen listener below.
    try {
      const params = new URLSearchParams(window.location.search);
      const tokenHash = params.get('token_hash');
      const linkType = params.get('type');
      if (tokenHash && linkType) {
        const validTypes = ['signup', 'email_change', 'recovery', 'invite', 'magiclink'] as const;
        const typedType = validTypes.includes(linkType as typeof validTypes[number])
          ? (linkType as typeof validTypes[number])
          : null;
        if (typedType) {
          supabase.auth.verifyOtp({ token_hash: tokenHash, type: typedType })
            .then(async ({ error }) => {
              console.log('[AUTH DEBUG] verifyOtp resolved', { typedType, error: error?.message ?? null });
              if (error) {
                console.error('[AUTH DEBUG] OTP verification failed:', error);
              } else if (typedType === 'recovery') {
                console.log('[AUTH DEBUG] recovery success, calling setIsPasswordRecovery(true)');
                setIsPasswordRecovery(true);
                console.log('[AUTH DEBUG] setIsPasswordRecovery(true) called');
              } else if (typedType === 'signup') {
                console.log('[AUTH DEBUG] signup success, signing out...');
                await supabase.auth.signOut();
                console.log('[AUTH DEBUG] signOut done, setting isEmailJustConfirmed');
                setIsEmailJustConfirmed(true);
              }
            });
          window.history.replaceState({}, '', window.location.pathname);
        }
      }
    } catch (err) {
      console.error('Failed to process auth callback link:', err);
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('[AUTH DEBUG] onAuthStateChange', { event: _event, hasSession: !!session, hasUser: !!session?.user });
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        await loginRevenueCatUser(currentUser.id);
      } else {
        await logoutRevenueCatUser();
      }
      loadPremiumStatus(currentUser);
      setLoading(false);
      if (_event === 'PASSWORD_RECOVERY') {
        console.log('[AUTH DEBUG] PASSWORD_RECOVERY event detected, calling setIsPasswordRecovery(true)');
        setIsPasswordRecovery(true);
      }
    });

    if (Capacitor.isNativePlatform()) {
      const listener = async ({ url }: { url: string }) => {
        if (!url) return;
        try {
          const parsed = new URL(url);

          // Supabase may pass auth params as query params OR as a hash fragment.
          // Query: ?token_hash=...&type=signup  (or type=recovery)
          // Hash:  #access_token=...&refresh_token=...&type=...
          // Also handle OAuth code flow: ?code=...
          const queryParams = parsed.searchParams;
          const hashParams = new URLSearchParams(parsed.hash.replace(/^#/, ''));

          const tokenHash = queryParams.get('token_hash');
          const linkType = queryParams.get('type') ?? hashParams.get('type');
          const code = queryParams.get('code');
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');

          // 1) PKCE OAuth code exchange (Google sign-in)
          if (code) {
            const { error } = await supabase.auth.exchangeCodeForSession(code);
            if (error) console.error('Failed to exchange code for session:', error);
            return;
          }

          // 2) Hash-based flow: set session first, then handle by type
          if (accessToken && refreshToken) {
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            if (sessionError) {
              console.error('Deep-link setSession failed:', sessionError);
              return;
            }
            if (linkType === 'recovery') {
              setIsPasswordRecovery(true);
            }
            // For signup/email_change the onAuthStateChange listener will pick up the new session.
            return;
          }

          // 3) Token-hash flow: verify OTP explicitly
          if (tokenHash && linkType) {
            const validTypes = ['signup', 'email_change', 'recovery', 'invite', 'magiclink'] as const;
            const typedType = validTypes.includes(linkType as typeof validTypes[number])
              ? (linkType as typeof validTypes[number])
              : null;

            if (typedType) {
              const { error: otpError } = await supabase.auth.verifyOtp({
                token_hash: tokenHash,
                type: typedType,
              });
              if (otpError) {
                console.error('Deep-link OTP verification failed:', otpError);
                if (typedType === 'recovery') {
                  setIsPasswordRecovery(false);
                }
              } else if (typedType === 'recovery') {
                setIsPasswordRecovery(true);
              }
            }
            return;
          }

          // 4) Fallback: legacy nextface://auth with only type=recovery
          if (linkType === 'recovery') {
            setIsPasswordRecovery(true);
          }
        } catch (err) {
          console.error('Deep-link handling failed:', err);
        }
      };
      let listenerHandle: { remove: () => Promise<void> } | null = null;
      CapacitorApp.addListener('appUrlOpen', listener).then(handle => {
        listenerHandle = handle;
      });
      return () => {
        listenerHandle?.remove();
        subscription.unsubscribe();
      };
    }

    return () => subscription.unsubscribe();
  }, []);

  const redeemCode = async (code: string): Promise<RedeemResult> => {
    if (!user) {
      return { success: false, error: 'You must be signed in to redeem a code.' };
    }

    if (isPremium) {
      return { success: false, error: 'You already have premium access!' };
    }

    const normalized = code.trim();
    if (!normalized) {
      return { success: false, error: 'Invalid creator code. Please try again.' };
    }

    const { data, error } = await supabase.rpc('redeem_creator_code', {
      p_code: normalized,
    });

    if (error) {
      console.error('Failed to redeem code:', error);
      return { success: false, error: 'Could not activate premium. Please try again.' };
    }

    if (data?.success) {
      setIsPremium(true);
      return { success: true };
    }

    const serverError = data?.error;
    if (serverError === 'Already premium') {
      return { success: false, error: 'You already have premium access!' };
    }
    return { success: false, error: 'Invalid creator code. Please try again.' };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: 'https://nextface.site/auth/callback' },
    });
    return { error };
  };

  const resendConfirmation = async (email: string): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: 'https://nextface.site/auth/callback' },
    });
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    await logoutRevenueCatUser();
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const signInWithGoogle = async (): Promise<{ error: string | null }> => {
    const isNative = Capacitor.isNativePlatform();
    const redirectTo = isNative ? 'nextface://auth' : window.location.origin;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
      },
    });
    return { error: error?.message ?? null };
  };

  const resetPassword = async (email: string): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://nextface.site/auth/callback',
    });
    return { error: error?.message ?? null };
  };

  const updatePassword = async (newPassword: string): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      return { error: error.message };
    }
    setIsPasswordRecovery(false);
    await supabase.auth.signOut();
    setIsPasswordJustReset(true);
    return { error: null };
  };

  const value = {
    user,
    session,
    loading,
    isPremium,
    isPasswordRecovery,
    isEmailJustConfirmed,
    isPasswordJustReset,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    redeemCode,
    resetPassword,
    resendConfirmation,
    updatePassword,
    setPremium: setIsPremium,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
