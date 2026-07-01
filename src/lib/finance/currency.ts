export const SUPPORTED_CURRENCIES = [
  { code: 'USD', label: 'USD · $' },
  { code: 'EUR', label: 'EUR · €' },
  { code: 'GBP', label: 'GBP · £' },
  { code: 'RUB', label: 'RUB · ₽' },
  { code: 'KZT', label: 'KZT · ₸' },
  { code: 'UAH', label: 'UAH · ₴' },
  { code: 'TRY', label: 'TRY · ₺' },
] as const;

export type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number]['code'];

export const DEFAULT_CURRENCY: CurrencyCode = 'USD';

export type CurrencyBalance = {
  currency: string;
  balance: number;
};

export function resolveDisplayCurrency(
  accounts: { currency: string; isDefault: boolean }[],
): CurrencyCode {
  const defaultAccount = accounts.find((account) => account.isDefault);
  if (defaultAccount?.currency) {
    return normalizeCurrency(defaultAccount.currency);
  }
  if (accounts[0]?.currency) {
    return normalizeCurrency(accounts[0].currency);
  }
  return DEFAULT_CURRENCY;
}

export function normalizeCurrency(value: string | null | undefined): CurrencyCode {
  const upper = (value ?? DEFAULT_CURRENCY).toUpperCase();
  if (SUPPORTED_CURRENCIES.some((item) => item.code === upper)) {
    return upper as CurrencyCode;
  }
  return DEFAULT_CURRENCY;
}

export function aggregateBalancesByCurrency(
  accounts: { currency: string; balance: number }[],
): CurrencyBalance[] {
  const totals = new Map<string, number>();

  for (const account of accounts) {
    const currency = normalizeCurrency(account.currency);
    totals.set(currency, (totals.get(currency) ?? 0) + account.balance);
  }

  return [...totals.entries()].map(([currency, balance]) => ({ currency, balance }));
}

export function resolveTransactionCurrency(
  accountId: string | null,
  accountCurrencies: Map<string, string>,
  fallback: string,
): CurrencyCode {
  if (!accountId) return normalizeCurrency(fallback);
  return normalizeCurrency(accountCurrencies.get(accountId) ?? fallback);
}
