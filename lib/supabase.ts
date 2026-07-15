import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import * as QueryParams from 'expo-auth-session/build/QueryParams';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error(
    'Missing Supabase env vars. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY to your .env file.',
  );
}

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce',
  },
});

/** Stable app deep link (add this in Supabase Redirect URLs) */
export const PASSWORD_RESET_REDIRECT = 'jerry://reset-password';

/**
 * Redirect candidates for reset email.
 * Expo Go URL changes by IP, so we also keep a stable jerry:// link.
 */
export function getPasswordResetRedirectCandidates() {
  const expoUrl = Linking.createURL('reset-password');
  const list = [PASSWORD_RESET_REDIRECT, expoUrl];
  return [...new Set(list.filter(Boolean))];
}

/**
 * Send OTP to email for forgot-password flow.
 * Uses Email OTP first (Magic Link template → {{ .Token }}),
 * then falls back to recovery email (Reset Password template → {{ .Token }}).
 */
export async function sendPasswordResetOtp(email: string) {
  // 1) Email OTP (more reliable OTP delivery when Magic Link template has Token)
  const otpResult = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false,
    },
  });

  if (!otpResult.error) {
    return { error: null, otpType: 'email' as const };
  }

  // 2) Fallback: password recovery email
  const recoveryResult = await supabase.auth.resetPasswordForEmail(email);

  if (!recoveryResult.error) {
    return { error: null, otpType: 'recovery' as const };
  }

  // Prefer first error message (usually clearer)
  return {
    error: otpResult.error ?? recoveryResult.error,
    otpType: null,
  };
}

/**
 * Verify OTP for forgot-password (supports email OTP + recovery OTP).
 */
export async function verifyPasswordResetOtp(
  email: string,
  token: string,
  preferredType?: 'email' | 'recovery' | null,
) {
  const order: Array<'email' | 'recovery'> =
    preferredType === 'recovery' ? ['recovery', 'email'] : ['email', 'recovery'];

  let lastError: Error | null = null;

  for (const type of order) {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type,
    });

    if (!error && data.session) {
      return { data, error: null, otpType: type };
    }

    lastError = error;
  }

  return { data: null, error: lastError, otpType: null };
}

/**
 * Create auth session from the email deep link.
 * Handles: PKCE code, token_hash, access_token/refresh_token
 */
export async function createSessionFromUrl(url: string) {
  const { params, errorCode } = QueryParams.getQueryParams(url);

  if (errorCode) {
    throw new Error(errorCode);
  }

  if (params.code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(
      params.code,
    );

    if (error) {
      throw error;
    }

    return {
      session: data.session,
      type: params.type ?? 'recovery',
    };
  }

  if (params.token_hash && params.type) {
    const { data, error } = await supabase.auth.verifyOtp({
      type: params.type as 'recovery',
      token_hash: params.token_hash,
    });

    if (error) {
      throw error;
    }

    return {
      session: data.session,
      type: params.type,
    };
  }

  if (params.access_token && params.refresh_token) {
    const { data, error } = await supabase.auth.setSession({
      access_token: params.access_token,
      refresh_token: params.refresh_token,
    });

    if (error) {
      throw error;
    }

    return {
      session: data.session,
      type: params.type ?? 'recovery',
    };
  }

  return null;
}
