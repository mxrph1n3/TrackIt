/** Shared TMA billing defaults for Supabase Edge Functions. */

export const TMA_MONTHLY_USD_LABEL = '$5.99/month';

/** Stars charged at checkout — ~$5.99/month at typical Telegram Stars rates. */
export const TMA_STARS_DEFAULT_PRICE = 300;

export function getTmaStarsPrice(): number {
  const parsed = Number.parseInt(Deno.env.get('TMA_STARS_PRICE') ?? String(TMA_STARS_DEFAULT_PRICE), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : TMA_STARS_DEFAULT_PRICE;
}

export function getTmaMonthlyPriceLabel(): string {
  return Deno.env.get('TMA_MONTHLY_PRICE_LABEL')?.trim() || TMA_MONTHLY_USD_LABEL;
}
