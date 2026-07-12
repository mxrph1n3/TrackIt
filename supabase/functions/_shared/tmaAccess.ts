import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const TMA_TRIAL_DAYS = 3;
const TMA_STARS_SUBSCRIPTION_PERIOD_SECONDS = 30 * 24 * 60 * 60;
const TMA_STARS_SUBSCRIPTION_PERIOD_DAYS = 30;

export const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('ALLOWED_ORIGIN') ?? '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export type TmaAccessPayload = {
  isInTrial: boolean;
  trialStartedAt: string | null;
  trialEndsAt: string | null;
  trialDaysRemaining: number;
  hasStarsSubscription: boolean;
  proExpiresAt: string | null;
  hasFullAccess: boolean;
  canUseNotifications: boolean;
  telegramUserId: number | null;
  telegramRemindersEnabled: boolean;
};

type TelegramUser = {
  id: number;
  first_name?: string;
  username?: string;
};

function parseInitData(initData: string): URLSearchParams {
  return new URLSearchParams(initData);
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

/** Validates Telegram Mini App initData per official docs. */
export async function validateTelegramInitData(
  initData: string,
  botToken: string,
): Promise<{ user: TelegramUser | null; valid: boolean }> {
  const params = parseInitData(initData);
  const hash = params.get('hash');
  if (!hash) {
    return { user: null, valid: false };
  }

  const entries: string[] = [];
  for (const [key, value] of params.entries()) {
    if (key === 'hash') continue;
    entries.push(`${key}=${value}`);
  }
  entries.sort();
  const dataCheckString = entries.join('\n');

  const secretKey = await hmacSha256(new TextEncoder().encode('WebAppData'), botToken);
  const signature = await hmacSha256(secretKey, dataCheckString);
  const computed = bufferToHex(signature);

  if (computed !== hash) {
    return { user: null, valid: false };
  }

  const authDate = Number(params.get('auth_date') ?? 0);
  const maxAgeSec = 60 * 60 * 24;
  if (!authDate || Date.now() / 1000 - authDate > maxAgeSec) {
    return { user: null, valid: false };
  }

  const userRaw = params.get('user');
  if (!userRaw) {
    return { user: null, valid: true };
  }

  try {
    const user = JSON.parse(userRaw) as TelegramUser;
    return { user, valid: true };
  } catch {
    return { user: null, valid: false };
  }
}

export function buildAccessPayload(row: {
  is_pro: boolean;
  pro_expires_at: string | null;
  tma_trial_started_at: string | null;
  telegram_user_id: number | null;
  telegram_reminders_enabled: boolean;
}): TmaAccessPayload {
  const now = Date.now();
  const trialStartedAt = row.tma_trial_started_at;
  const trialEndsMs = trialStartedAt
    ? new Date(trialStartedAt).getTime() + TMA_TRIAL_DAYS * 24 * 60 * 60 * 1000
    : null;
  const isInTrial = trialEndsMs != null && trialEndsMs > now;

  const hasStarsSubscription =
    row.is_pro && (row.pro_expires_at == null || new Date(row.pro_expires_at).getTime() > now);

  const hasFullAccess = hasStarsSubscription || isInTrial;
  const trialDaysRemaining =
    isInTrial && trialEndsMs
      ? Math.max(0, Math.ceil((trialEndsMs - now) / (24 * 60 * 60 * 1000)))
      : 0;

  return {
    isInTrial,
    trialStartedAt,
    trialEndsAt: trialEndsMs ? new Date(trialEndsMs).toISOString() : null,
    trialDaysRemaining,
    hasStarsSubscription,
    proExpiresAt: row.pro_expires_at,
    hasFullAccess,
    canUseNotifications: hasFullAccess,
    telegramUserId: row.telegram_user_id,
    telegramRemindersEnabled: row.telegram_reminders_enabled,
  };
}

export function getServiceClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );
}

export function grantStarsPro(
  userId: string,
  starsAmount: number,
  chargeId: string,
  telegramUserId: number,
  options?: { subscriptionExpirationDate?: number; isRecurring?: boolean },
) {
  const service = getServiceClient();

  let expires: Date;
  if (options?.subscriptionExpirationDate) {
    expires = new Date(options.subscriptionExpirationDate * 1000);
  } else {
    expires = new Date();
    expires.setUTCDate(expires.getUTCDate() + TMA_STARS_SUBSCRIPTION_PERIOD_DAYS);
  }

  return service
    .from('profiles')
    .update({
      is_pro: true,
      pro_expires_at: expires.toISOString(),
    })
    .eq('id', userId)
    .then(async (updateResult) => {
      if (updateResult.error) {
        throw updateResult.error;
      }

      const { error: paymentError } = await service.from('telegram_stars_payments').insert({
        user_id: userId,
        telegram_user_id: telegramUserId,
        telegram_payment_charge_id: chargeId,
        stars_amount: starsAmount,
        payload: {
          source: 'telegram_stars',
          is_recurring: options?.isRecurring ?? false,
          subscription_expiration_date: options?.subscriptionExpirationDate ?? null,
        },
      });

      if (paymentError && !paymentError.message.includes('duplicate')) {
        throw paymentError;
      }

      return expires.toISOString();
    });
}

export { TMA_TRIAL_DAYS, TMA_STARS_SUBSCRIPTION_PERIOD_SECONDS, TMA_STARS_SUBSCRIPTION_PERIOD_DAYS };
