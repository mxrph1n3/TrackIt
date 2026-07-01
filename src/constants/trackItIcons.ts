import type { LucideIcon } from 'lucide-react-native';
import {
  Banknote,
  BookOpen,
  Briefcase,
  Car,
  CircleDollarSign,
  Coffee,
  CreditCard,
  Dog,
  Dumbbell,
  Flame,
  Fuel,
  Gamepad2,
  Gem,
  Gift,
  Home,
  Landmark,
  Mountain,
  Package,
  Pill,
  Plane,
  Plus,
  Scale,
  Shield,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Sparkles,
  Swords,
  Target,
  TrendingUp,
  Trophy,
  Utensils,
  Wallet,
  Zap,
} from 'lucide-react-native';

/** Lucide icon keys used across TrackIt (stored in DB / constants). */
export type TrackItIconName =
  | 'briefcase'
  | 'banknote'
  | 'trending-up'
  | 'gift'
  | 'circle-dollar-sign'
  | 'trophy'
  | 'package'
  | 'plus'
  | 'utensils'
  | 'coffee'
  | 'shopping-cart'
  | 'car'
  | 'fuel'
  | 'home'
  | 'zap'
  | 'smartphone'
  | 'gamepad-2'
  | 'shopping-bag'
  | 'pill'
  | 'dumbbell'
  | 'book-open'
  | 'plane'
  | 'dog'
  | 'wallet'
  | 'credit-card'
  | 'landmark'
  | 'target'
  | 'flame'
  | 'scale'
  | 'swords'
  | 'gem'
  | 'mountain'
  | 'shield'
  | 'sparkles';

export const TRACKIT_ICONS: Record<TrackItIconName, LucideIcon> = {
  briefcase: Briefcase,
  banknote: Banknote,
  'trending-up': TrendingUp,
  gift: Gift,
  'circle-dollar-sign': CircleDollarSign,
  trophy: Trophy,
  package: Package,
  plus: Plus,
  utensils: Utensils,
  coffee: Coffee,
  'shopping-cart': ShoppingCart,
  car: Car,
  fuel: Fuel,
  home: Home,
  zap: Zap,
  smartphone: Smartphone,
  'gamepad-2': Gamepad2,
  'shopping-bag': ShoppingBag,
  pill: Pill,
  dumbbell: Dumbbell,
  'book-open': BookOpen,
  plane: Plane,
  dog: Dog,
  wallet: Wallet,
  'credit-card': CreditCard,
  landmark: Landmark,
  target: Target,
  flame: Flame,
  scale: Scale,
  swords: Swords,
  gem: Gem,
  mountain: Mountain,
  shield: Shield,
  sparkles: Sparkles,
};

/** Legacy emoji strings → icon keys (existing Supabase rows). */
const LEGACY_EMOJI_TO_ICON: Record<string, TrackItIconName> = {
  '💼': 'briefcase',
  '💰': 'banknote',
  '📈': 'trending-up',
  '🎁': 'gift',
  '💵': 'circle-dollar-sign',
  '🏆': 'trophy',
  '📦': 'package',
  '➕': 'plus',
  '🍔': 'utensils',
  '☕': 'coffee',
  '🛒': 'shopping-cart',
  '🚗': 'car',
  '⛽': 'fuel',
  '🏠': 'home',
  '⚡': 'zap',
  '📱': 'smartphone',
  '🎮': 'gamepad-2',
  '🛍': 'shopping-bag',
  '💊': 'pill',
  '🏋': 'dumbbell',
  '🏋️': 'dumbbell',
  '📚': 'book-open',
  '🧳': 'plane',
  '🐶': 'dog',
  '💸': 'wallet',
  '💳': 'credit-card',
  '🏦': 'landmark',
  '🎯': 'target',
  '🔥': 'flame',
  '⚖️': 'scale',
  '⚔️': 'swords',
  '🗡️': 'swords',
  '💎': 'gem',
  '🏔️': 'mountain',
  '🛡️': 'shield',
};

export function resolveTrackItIcon(nameOrLegacy: string | null | undefined): LucideIcon {
  if (!nameOrLegacy) {
    return Wallet;
  }

  if (nameOrLegacy in TRACKIT_ICONS) {
    return TRACKIT_ICONS[nameOrLegacy as TrackItIconName];
  }

  const legacy = LEGACY_EMOJI_TO_ICON[nameOrLegacy];
  if (legacy) {
    return TRACKIT_ICONS[legacy];
  }

  return Wallet;
}

export function normalizeTrackItIconName(nameOrLegacy: string | null | undefined): TrackItIconName {
  if (!nameOrLegacy) {
    return 'wallet';
  }
  if (nameOrLegacy in TRACKIT_ICONS) {
    return nameOrLegacy as TrackItIconName;
  }
  return LEGACY_EMOJI_TO_ICON[nameOrLegacy] ?? 'wallet';
}
