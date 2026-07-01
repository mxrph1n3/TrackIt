import { useMemo } from 'react';
import { Platform, StyleSheet, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ETHEREAL_COLORS } from '../../theme/etherealTokens';
import { ACTION_HUB } from '../../components/actionHub/actionHubTheme';
import { TabBarLayout, fabAnchorTop, tabBarScrollPadding } from '../../theme/obsidian';
import { useTheme } from '../../theme/ThemeContext';

const ACTIVE_PURPLE = ETHEREAL_COLORS.neonActive;
const INACTIVE_SLATE = ETHEREAL_COLORS.textSecondary;

/** Bottom padding for full-screen profile modules (no floating tab bar). */
export function useIsolatedScreenInsets() {
  const insets = useSafeAreaInsets();

  return useMemo(
    () => ({
      scrollPaddingBottom: insets.bottom + 120,
    }),
    [insets.bottom],
  );
}

export function useFloatingTabBarStyles() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { scrollPaddingBottom: isolatedScrollPaddingBottom } = useIsolatedScreenInsets();

  const safeBottomPadding = insets.bottom + TabBarLayout.bottomInsetExtra;

  return useMemo(
    () => ({
      isolatedScrollPaddingBottom,
      container: {
        position: 'absolute' as const,
        bottom: 0,
        left: 0,
        right: 0,
        width: '100%' as const,
        overflow: 'visible' as const,
        zIndex: 100,
        elevation: 100,
      } satisfies ViewStyle,
      shell: {
        position: 'relative' as const,
        overflow: 'hidden' as const,
        borderTopWidth: 1,
        borderTopColor:
          theme.mode === 'ethereal' ? ETHEREAL_COLORS.glassBorder : 'rgba(255, 255, 255, 0.12)',
      } satisfies ViewStyle,
      panel: {
        backgroundColor: theme.tabBarBackground,
        paddingTop: TabBarLayout.topPadding,
        paddingBottom: safeBottomPadding,
      } satisfies ViewStyle,
      row: {
        flexDirection: 'row' as const,
        alignItems: 'flex-end' as const,
        justifyContent: 'space-between' as const,
        height: TabBarLayout.contentHeight,
        paddingHorizontal: 16,
      } satisfies ViewStyle,
      tabButton: {
        flex: 1,
        height: TabBarLayout.contentHeight,
        alignItems: 'center' as const,
        justifyContent: 'flex-end' as const,
      } satisfies ViewStyle,
      centerSlot: {
        width: TabBarLayout.fabSize,
        height: TabBarLayout.contentHeight,
      } satisfies ViewStyle,
      fabAnchor: {
        position: 'absolute' as const,
        top: fabAnchorTop() + ACTION_HUB.crystalNudgeY,
        left: 0,
        right: 0,
        alignItems: 'center' as const,
        zIndex: 20,
        transform: [{ translateX: ACTION_HUB.crystalNudgeX }],
      } satisfies ViewStyle,
      scrollContentPaddingBottom: Math.max(
        TabBarLayout.scrollContentBottomPadding,
        tabBarScrollPadding(insets.bottom),
      ),
      scenePaddingBottom: tabBarScrollPadding(insets.bottom) + 8,
      blurIntensity: TabBarLayout.blurIntensity,
      blurTint: theme.blurTint,
      iconSize: TabBarLayout.iconSize,
      colors: {
        inactive: INACTIVE_SLATE,
        active: ACTIVE_PURPLE,
      },
      styles: StyleSheet.create({
        blurLayer: {
          ...StyleSheet.absoluteFill,
        },
        iconSlot: {
          position: 'relative' as const,
          width: TabBarLayout.iconSize,
          height: TabBarLayout.iconSize,
          alignItems: 'center' as const,
          justifyContent: 'center' as const,
        },
        activeDot: {
          position: 'absolute' as const,
          bottom: -8,
          width: 4,
          height: 4,
          borderRadius: 2,
          backgroundColor: ACTIVE_PURPLE,
          ...Platform.select({
            ios: {
              shadowColor: ACTIVE_PURPLE,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.95,
              shadowRadius: 5,
            },
            android: {
              elevation: 4,
            },
          }),
        },
      }),
    }),
    [insets.bottom, isolatedScrollPaddingBottom, safeBottomPadding, theme],
  );
}

export type FloatingTabBarStyles = ReturnType<typeof useFloatingTabBarStyles>;
