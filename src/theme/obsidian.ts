/** @deprecated Use `useTheme()` from ThemeContext — kept for gradual migration. */
import { ETHEREAL_THEME, type AppTheme } from './themes';

export const ObsidianTheme = ETHEREAL_THEME;

export const TabBarLayout = {
  topPadding: 10,
  /** Extra padding above the home indicator (added to insets.bottom). */
  bottomInsetExtra: 12,
  /** Height of the icon row above the safe-area inset. */
  contentHeight: 38,
  iconSize: 23,
  fabSize: 70,
  fabOverlap: 21,
  blurIntensity: 20,
  scrollContentBottomPadding: 112,
} as const;

/** FAB `top` offset so its horizontal mid-axis aligns with tab icon centers. */
export function fabAnchorTop(): number {
  const iconCenterY =
    TabBarLayout.topPadding + TabBarLayout.contentHeight - TabBarLayout.iconSize / 2;
  return iconCenterY - TabBarLayout.fabSize / 2;
}

/** Total scroll padding below screen content. */
export function tabBarScrollPadding(insetsBottom: number): number {
  const iconCenterY =
    TabBarLayout.topPadding + TabBarLayout.contentHeight - TabBarLayout.iconSize / 2;
  const fabProtrusion = Math.max(0, -(fabAnchorTop()));
  return (
    TabBarLayout.topPadding +
    TabBarLayout.contentHeight +
    insetsBottom +
    TabBarLayout.bottomInsetExtra +
    fabProtrusion
  );
}

/** Soft drop shadow for glass cards — applied on an outer shell (not clipped by overflow). */
export function buildGlassShadowStyle(theme: AppTheme) {
  return {
    shadowColor: theme.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: theme.mode === 'ethereal' ? 0.08 : 0.14,
    shadowRadius: 10,
    elevation: 3,
  } as const;
}

export const EtherealGlass = {
  backgroundColor: ETHEREAL_THEME.card,
  borderRadius: ETHEREAL_THEME.cardRadius,
  borderWidth: 1,
  borderColor: ETHEREAL_THEME.border,
  ...buildGlassShadowStyle(ETHEREAL_THEME),
} as const;

export function buildGlassStyle(theme: AppTheme) {
  return {
    backgroundColor: theme.card,
    borderRadius: theme.cardRadius,
    borderWidth: 1,
    borderColor: theme.border,
  } as const;
}
