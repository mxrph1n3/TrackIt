import { Platform, type ViewStyle } from 'react-native';

import { ETHEREAL_COLORS } from './etherealTokens';

export const neonPurpleGlow: ViewStyle = Platform.select({
  ios: {
    shadowColor: ETHEREAL_COLORS.neonActive,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
  },
  android: {
    elevation: 14,
  },
  default: {},
}) as ViewStyle;

export const neonPurpleGlowSoft: ViewStyle = Platform.select({
  ios: {
    shadowColor: ETHEREAL_COLORS.neonActive,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  android: {
    elevation: 8,
  },
  default: {},
}) as ViewStyle;

export const neonIndigoGlow: ViewStyle = Platform.select({
  ios: {
    shadowColor: ETHEREAL_COLORS.neonLight,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
  },
  android: {
    elevation: 10,
  },
  default: {},
}) as ViewStyle;

/** SVG-adjacent tube glow for progress rings. */
export const neonTubeGlow = {
  shadowBlur: 12,
  shadowColor: ETHEREAL_COLORS.neonActive,
  shadowOpacity: 0.85,
  shadowRadius: 12,
} as const;
