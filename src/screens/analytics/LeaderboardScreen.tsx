import { ChevronLeft } from 'lucide-react-native';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppSafeAreaInsets } from '../../hooks/useAppSafeAreaInsets';

import { GlobalLeaderboard } from '../../components/analytics/GlobalLeaderboard';
import { useFloatingTabBarStyles } from '../../navigation/hooks/useFloatingTabBarStyles';
import { useAnalyticsNavigationStore } from '../../stores/useAnalyticsNavigationStore';
import { getThemedSurfaces } from '../../theme/themedSurfaces';
import { useTheme } from '../../theme/ThemeContext';

export function LeaderboardScreen() {
  const insets = useAppSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const surfaces = getThemedSurfaces(theme, isDark);
  const { scrollContentPaddingBottom } = useFloatingTabBarStyles();
  const closeLeaderboard = useAnalyticsNavigationStore((state) => state.closeLeaderboard);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        screen: {
          flex: 1,
          backgroundColor: 'transparent',
        },
        header: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingBottom: 8,
        },
        backButton: {
          width: 36,
          height: 36,
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: surfaces.chip,
        },
        headerTitle: {
          flex: 1,
          textAlign: 'center',
          fontSize: 17,
          fontWeight: '800',
          color: theme.textPrimary,
        },
        headerSpacer: {
          width: 36,
        },
        listWrap: {
          flex: 1,
        },
      }),
    [isDark, surfaces.chip, theme],
  );

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={closeLeaderboard} hitSlop={12} style={styles.backButton}>
          <ChevronLeft color={theme.textPrimary} size={22} />
        </Pressable>
        <Text style={styles.headerTitle}>Leaderboard</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={[styles.listWrap, { paddingHorizontal: 16 }]}>
        <GlobalLeaderboard bottomInset={scrollContentPaddingBottom} />
      </View>
    </View>
  );
}
