import { DEFAULT_CURRENCY, normalizeCurrency } from '../lib/finance/currency';

import type { TrackItIconName } from './trackItIcons';

export type FinanceCategoryId = string;

export type FinanceCategoryDef = {
  id: FinanceCategoryId;
  label: string;
  icon: TrackItIconName;
  color: string;
  kind: 'income' | 'expense' | 'both';
};

export const INCOME_CATEGORIES: FinanceCategoryDef[] = [
  { id: 'salary', label: 'Salary', icon: 'briefcase', color: '#34D399', kind: 'income' },
  { id: 'freelance', label: 'Freelance', icon: 'banknote', color: '#10B981', kind: 'income' },
  { id: 'investments', label: 'Investments', icon: 'trending-up', color: '#6366F1', kind: 'income' },
  { id: 'gifts_in', label: 'Gifts', icon: 'gift', color: '#F472B6', kind: 'income' },
  { id: 'cashback', label: 'Cashback', icon: 'circle-dollar-sign', color: '#22D3EE', kind: 'income' },
  { id: 'bonuses', label: 'Bonuses', icon: 'trophy', color: '#FBBF24', kind: 'income' },
  { id: 'sales', label: 'Sales', icon: 'package', color: '#A78BFA', kind: 'income' },
  { id: 'other_income', label: 'Other', icon: 'plus', color: '#94A3B8', kind: 'income' },
];

export const EXPENSE_CATEGORIES: FinanceCategoryDef[] = [
  { id: 'food', label: 'Food', icon: 'utensils', color: '#775DD8', kind: 'expense' },
  { id: 'cafe', label: 'Cafe', icon: 'coffee', color: '#9580E8', kind: 'expense' },
  { id: 'groceries', label: 'Groceries', icon: 'shopping-cart', color: '#7C3AED', kind: 'expense' },
  { id: 'transport', label: 'Transport', icon: 'car', color: '#6366F1', kind: 'expense' },
  { id: 'fuel', label: 'Fuel', icon: 'fuel', color: '#4F46E5', kind: 'expense' },
  { id: 'home', label: 'Home', icon: 'home', color: '#818CF8', kind: 'expense' },
  { id: 'utilities', label: 'Utilities', icon: 'zap', color: '#60A5FA', kind: 'expense' },
  { id: 'subscriptions', label: 'Subscriptions', icon: 'smartphone', color: '#38BDF8', kind: 'expense' },
  { id: 'entertainment', label: 'Entertainment', icon: 'gamepad-2', color: '#34D399', kind: 'expense' },
  { id: 'shopping', label: 'Shopping', icon: 'shopping-bag', color: '#F472B6', kind: 'expense' },
  { id: 'health', label: 'Health', icon: 'pill', color: '#FB7185', kind: 'expense' },
  { id: 'sport', label: 'Sport', icon: 'dumbbell', color: '#F97316', kind: 'expense' },
  { id: 'education', label: 'Education', icon: 'book-open', color: '#EAB308', kind: 'expense' },
  { id: 'travel', label: 'Travel', icon: 'plane', color: '#2DD4BF', kind: 'expense' },
  { id: 'pets', label: 'Pets', icon: 'dog', color: '#FB923C', kind: 'expense' },
  { id: 'gifts_out', label: 'Gifts', icon: 'gift', color: '#9580E8', kind: 'expense' },
  { id: 'other', label: 'Other', icon: 'wallet', color: '#94A3B8', kind: 'expense' },
];

export const ALL_CATEGORIES = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];

export const CATEGORY_MAP = new Map(ALL_CATEGORIES.map((c) => [c.id, c]));

export const QUICK_EXPENSE_CATEGORIES = ['food', 'cafe', 'transport', 'entertainment', 'subscriptions'] as const;

export function getCategoryDef(id: string): FinanceCategoryDef {
  return (
    CATEGORY_MAP.get(id) ?? {
      id,
      label: id.replace(/_/g, ' '),
      icon: 'wallet',
      color: '#94A3B8',
      kind: 'expense',
    }
  );
}

export { SUPPORTED_CURRENCIES, type CurrencyCode } from '../lib/finance/currency';

const CURRENCY_SYMBOLS: Record<string, string> = {
  RUB: '₽',
  USD: '$',
  EUR: '€',
  GBP: '£',
  KZT: '₸',
  UAH: '₴',
  TRY: '₺',
};

function formatNumberWithSpaces(value: number, fractionDigits = 0): string {
  const abs = Math.abs(value);
  const rounded =
    fractionDigits === 0 ? Math.round(abs) : Number(abs.toFixed(fractionDigits));
  const [whole, fraction] = rounded.toString().split('.');
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return fraction ? `${grouped}.${fraction}` : grouped;
}

function getCurrencySymbol(code: string): string {
  return CURRENCY_SYMBOLS[code] ?? code;
}

/** Spec format: `128 450 ₽` — space thousands separator, symbol after amount for RUB. */
export function formatMoney(amount: number, currency: string = DEFAULT_CURRENCY): string {
  const code = normalizeCurrency(currency);
  const core = formatNumberWithSpaces(amount);
  const symbol = getCurrencySymbol(code);

  if (code === 'RUB' || code === 'KZT' || code === 'UAH') {
    return `${core} ${symbol}`;
  }

  return `${symbol}${core}`;
}

/** Compact format for micro-widgets: `1.28M`, `84.00K`. */
export function formatMoneyCompact(amount: number, currency: string = DEFAULT_CURRENCY): string {
  const code = normalizeCurrency(currency);
  const symbol = getCurrencySymbol(code);
  const abs = Math.abs(amount);

  if (abs >= 1_000_000) {
    const core = (abs / 1_000_000).toFixed(2);
    return code === 'RUB' || code === 'KZT' || code === 'UAH'
      ? `${core}M ${symbol}`
      : `${symbol}${core}M`;
  }

  if (abs >= 1_000) {
    const core = (abs / 1_000).toFixed(2);
    return code === 'RUB' || code === 'KZT' || code === 'UAH'
      ? `${core}K ${symbol}`
      : `${symbol}${core}K`;
  }

  return formatMoney(amount, currency);
}

export function formatSignedMoney(amount: number, currency: string = DEFAULT_CURRENCY): string {
  const prefix = amount >= 0 ? '+' : '−';
  return `${prefix}${formatMoney(Math.abs(amount), currency)}`;
}
