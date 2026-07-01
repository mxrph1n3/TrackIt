import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { useLeaderboard } from '../../hooks/useLeaderboard';
import { useAnalyticsNavigationStore } from '../../stores/useAnalyticsNavigationStore';
import { BRAND } from '../../theme/designTokens';
import { useTheme } from '../../theme/ThemeContext';
import { CurrentUserRankCard, LeaderboardRow } from './GlobalLeaderboard';

export function LeaderboardOverviewSection() {
  const { theme } = useTheme();
  const openLeaderboard = useAnalyticsNavigationStore((state) => state.openLeaderboard);
  const { topUsers, currentUser, isLoading, error } = useLeaderboard();
  const currentUserId = currentUser?.profile.id ?? null;
  const previewUsers = topUsers.slice(0, 10);

  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <Text style={[styles.kicker, { color: theme.textMuted }]}>Global Leaderboard</Text>
        <Pressable onPress={openLeaderboard} hitSlop={8}>
          <Text style={[styles.viewAll, { color: BRAND.primary }]}>View All</Text>
        </Pressable>
      </View>

      <CurrentUserRankCard currentUser={currentUser} isLoading={isLoading} error={error} />

      <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Top Players</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {isLoading && previewUsers.length === 0 ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={theme.primary} />
        </View>
      ) : previewUsers.length === 0 ? (
        <Text style={[styles.empty, { color: theme.textSecondary }]}>
          No ranked players yet. Complete tasks and workouts to earn XP.
        </Text>
      ) : (
        <View style={styles.list}>
          {previewUsers.map((entry) => (
            <LeaderboardRow
              key={entry.id}
              entry={entry}
              isCurrentUser={entry.id === currentUserId}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 8,
  },
  headerRow: {
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  kicker: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  viewAll: {
    fontSize: 12,
    fontWeight: '600',
  },
  sectionTitle: {
    marginBottom: 8,
    marginTop: 16,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  error: {
    marginBottom: 8,
    fontSize: 12,
    fontWeight: '500',
    color: '#F87171',
  },
  loadingWrap: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  empty: {
    paddingVertical: 24,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
  },
  list: {
    gap: 8,
  },
});
