import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

import { corsHeaders, getServiceClient, validateTelegramInitData } from './tmaAccess.ts';

type TelegramUser = {
  id: number;
  first_name?: string;
  username?: string;
};

export type TelegramAuthSession = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user_id: string;
};

export function telegramAuthEmail(telegramUserId: number): string {
  return `tg${telegramUserId}@tma.trackit.app`;
}

async function hmacSha256(key: ArrayBuffer | Uint8Array, data: string): Promise<ArrayBuffer> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  return crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(data));
}

function bufferToHex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function deriveTmaPassword(telegramUserId: number): Promise<string> {
  const secret =
    Deno.env.get('TMA_AUTH_SECRET')?.trim() || Deno.env.get('TELEGRAM_BOT_TOKEN')?.trim() || '';
  if (!secret) {
    throw new Error('TMA auth secret is not configured.');
  }

  const signature = await hmacSha256(new TextEncoder().encode(secret), `tma-auth:${telegramUserId}`);
  return bufferToHex(signature);
}

function getAnonClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
  );
}

async function createSessionFromEmail(email: string): Promise<TelegramAuthSession> {
  const service = getServiceClient();
  const anon = getAnonClient();
  const { data, error } = await service.auth.admin.generateLink({
    type: 'magiclink',
    email,
  });

  if (error || !data?.properties?.hashed_token) {
    throw error ?? new Error('Could not mint Telegram auth session.');
  }

  const { data: verified, error: verifyError } = await anon.auth.verifyOtp({
    token_hash: data.properties.hashed_token,
    type: 'email',
  });

  if (verifyError || !verified.session) {
    throw verifyError ?? new Error('Could not verify Telegram auth session.');
  }

  return {
    access_token: verified.session.access_token,
    refresh_token: verified.session.refresh_token,
    expires_in: verified.session.expires_in ?? 3600,
    token_type: verified.session.token_type ?? 'bearer',
    user_id: verified.session.user.id,
  };
}

async function ensureTelegramAuthUser(
  telegramUser: TelegramUser,
): Promise<{ userId: string; email: string; password: string }> {
  const service = getServiceClient();
  const email = telegramAuthEmail(telegramUser.id);
  const password = await deriveTmaPassword(telegramUser.id);

  const { data: linkedProfile } = await service
    .from('profiles')
    .select('id')
    .eq('telegram_user_id', telegramUser.id)
    .maybeSingle();

  if (linkedProfile?.id) {
    const { data: authUser, error: authUserError } = await service.auth.admin.getUserById(linkedProfile.id);
    if (authUserError || !authUser.user?.email) {
      throw authUserError ?? new Error('Linked Telegram profile has no auth user.');
    }

    return {
      userId: linkedProfile.id,
      email: authUser.user.email,
      password,
    };
  }

  const anon = getAnonClient();
  const signInAttempt = await anon.auth.signInWithPassword({ email, password });
  if (signInAttempt.data.user?.id) {
    return {
      userId: signInAttempt.data.user.id,
      email,
      password,
    };
  }

  const { data: created, error: createError } = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      preferred_username: telegramUser.username ?? telegramUser.first_name ?? `tg${telegramUser.id}`,
      telegram_user_id: telegramUser.id,
      auth_provider: 'telegram',
    },
  });

  if (createError && !createError.message.toLowerCase().includes('already')) {
    throw createError;
  }

  const userId = created?.user?.id ?? signInAttempt.data.user?.id;
  if (!userId) {
    const retry = await anon.auth.signInWithPassword({ email, password });
    if (!retry.data.user?.id) {
      throw retry.error ?? new Error('Could not create Telegram auth user.');
    }
    return { userId: retry.data.user.id, email, password };
  }

  return { userId, email, password };
}

async function syncTelegramProfile(userId: string, telegramUser: TelegramUser): Promise<void> {
  const service = getServiceClient();
  const { data: profile } = await service
    .from('profiles')
    .select('tma_trial_started_at')
    .eq('id', userId)
    .maybeSingle();

  const updates: Record<string, unknown> = {
    telegram_user_id: telegramUser.id,
  };

  if (!profile?.tma_trial_started_at) {
    updates.tma_trial_started_at = new Date().toISOString();
  }

  const { error } = await service.from('profiles').update(updates).eq('id', userId);
  if (error) {
    throw error;
  }
}

export async function signInWithTelegramInitData(initData: string): Promise<TelegramAuthSession> {
  const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
  if (!botToken) {
    throw new Error('Telegram bot token is not configured.');
  }

  const { user: telegramUser, valid } = await validateTelegramInitData(initData, botToken);
  if (!valid || !telegramUser?.id) {
    throw new Error('Invalid Telegram init data.');
  }

  const authUser = await ensureTelegramAuthUser(telegramUser);
  await syncTelegramProfile(authUser.userId, telegramUser);

  if (authUser.email === telegramAuthEmail(telegramUser.id)) {
    const anon = getAnonClient();
    const { data, error } = await anon.auth.signInWithPassword({
      email: authUser.email,
      password: authUser.password,
    });

    if (error || !data.session) {
      throw error ?? new Error('Could not sign in Telegram user.');
    }

    return {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_in: data.session.expires_in ?? 3600,
      token_type: data.session.token_type ?? 'bearer',
      user_id: data.session.user.id,
    };
  }

  return createSessionFromEmail(authUser.email);
}

export { corsHeaders };
