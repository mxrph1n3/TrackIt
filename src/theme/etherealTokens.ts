import {
  BRAND,
  GRADIENTS,
  RADIUS,
  SPACING,
  SURFACE,
  TEXT,
} from './designTokens';

/** Canonical Ethereal Light palette — derived from designTokens. */
export const ETHEREAL_COLORS = {
  background: SURFACE.background,
  ambientGlow: SURFACE.ambientGlow,
  ambientGlowSolid: SURFACE.ambientGlowSolid,

  glassCard: SURFACE.card,
  glassBorder: SURFACE.border,
  glassShadow: SURFACE.shadow,

  textPrimary: TEXT.primary,
  textSecondary: TEXT.secondary,

  neonActive: BRAND.primary,
  neonGlow: SURFACE.glow,
  neonDeep: BRAND.primaryDeep,
  neonLight: BRAND.primaryLight,
} as const;

/** Shared gradient stops for CTA buttons, FAB, avatars. */
export const ETHEREAL_GRADIENTS = GRADIENTS;

export const EtherealTheme = {
  colors: ETHEREAL_COLORS,
} as const;

export type EtherealColorToken = keyof typeof ETHEREAL_COLORS;

/** Re-export token scales for convenience. */
export { BRAND, GRADIENTS, RADIUS, SPACING, SEMANTIC, SURFACE, TEXT, TYPOGRAPHY, ELEVATION } from './designTokens';
