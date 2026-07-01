import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  type ListRenderItem,
  type ViewStyle,
} from 'react-native';

import { useLeaderboard } from '../../hooks/useLeaderboard';
import { getDashboardTierTheme, type DashboardTierTheme } from '../../lib/dashboard/tierTheme';
import { getXpProgress } from '../../lib/gamification/progression';
import { useTheme } from '../../theme/ThemeContext';
import type { CurrentUserLeaderboard, LeaderboardEntry } from '../../types/database';
import { TierBadge } from '../ui/TierBadge';
import { USER_AVATAR_SIZES, UserAvatar } from '../ui/UserAvatar';
import { LifeRadarChart } from './OverviewPanel';

const SILVER_LIGHT = '#7F7D9C';
const SILVER_DARK = 'rgba(255, 255, 255, 0.45)';

function getInitials(username: string): string {
  const parts = username.trim().split(/[\s_]+/).filter(Boolean);
  if (parts.length === 0) {
    return 'U';
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function formatXp(xp: number): string {
  return xp.toLocaleString('en-US');
}

function formatRankPlacement(rank: number, total: number): string {
  const formattedTotal = total.toLocaleString('en-US');
  return `#${rank.toLocaleString('en-US')} out of ${formattedTotal} users`;
}

function tierGlowStyle(theme: DashboardTierTheme, intensity: 'soft' | 'strong' = 'soft'): ViewStyle {
  return {
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: intensity === 'strong' ? 0 : 6 },
    shadowOpacity: intensity === 'strong' ? 0.55 : 0.28,
    shadowRadius: intensity === 'strong' ? 18 : 14,
    elevation: intensity === 'strong' ? 14 : 8,
  };
}

type RankMedalStyle = {
  color: string;
  glow: string;
};

function getRankMedalStyle(position: number): RankMedalStyle | null {
  switch (position) {
    case 1:
      return { color: '#FFD700', glow: 'rgba(255, 215, 0, 0.65)' };
    case 2:
      return { color: '#C0C0C0', glow: 'rgba(192, 192, 192, 0.65)' };
    case 3:
      return { color: '#CD7F32', glow: 'rgba(205, 127, 50, 0.65)' };
    default:
      return null;
  }
}

type LeaderboardGlassCardProps = {
  children: ReactNode;
  variant?: 'hero' | 'row' | 'empty';
  tierTheme?: DashboardTierTheme;
  highlighted?: boolean;
};

function LeaderboardGlassCard({
  children,
  variant = 'row',
  tierTheme,
  highlighted = false,
}: LeaderboardGlassCardProps) {
  const { theme, isDark } = useTheme();
  const radiusClass = variant === 'hero' ? 'rounded-3xl' : 'rounded-2xl';
  const borderColor = tierTheme?.capsuleBorder ?? theme.borderSubtle;
  const accentWash = tierTheme
    ? `${tierTheme.primary}${isDark ? '12' : '10'}`
    : theme.cardFrosted;

  return (
    <View
      className={`overflow-hidden ${radiusClass}`}
      style={[
        styles.glassOuterGlow,
        tierTheme ? tierGlowStyle(tierTheme, highlighted ? 'strong' : 'soft') : null,
        {
          borderWidth: 1,
          borderColor,
          backgroundColor: accentWash,
          shadowColor: theme.shadowColor,
          shadowOpacity: theme.shadowOpacity,
        },
      ]}
    >
      <BlurView
        intensity={theme.blurIntensity}
        tint={theme.blurTint}
        style={StyleSheet.absoluteFill}
      />
      <View
        style={{
          borderTopWidth: 1,
          borderTopColor: tierTheme?.sheen ?? theme.borderSubtle,
          backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.35)',
        }}
      >
        {children}
      </View>
    </View>
  );
}

function LeaderboardAvatar({
  username,
  size = USER_AVATAR_SIZES.deck,
  tierTheme,
  isCurrentUser = false,
}: {
  username: string;
  size?: number;
  tierTheme?: DashboardTierTheme;
  isCurrentUser?: boolean;
}) {
  return (
    <View
      style={[
        { borderRadius: size / 2, padding: 2 },
        tierTheme
          ? {
              borderWidth: 1.5,
              borderColor: tierTheme.capsuleBorder,
              ...tierGlowStyle(tierTheme, 'soft'),
            }
          : null,
      ]}
    >
      <UserAvatar
        size={size}
        fallbackInitials={getInitials(username)}
        showFallbackInitials={!isCurrentUser}
        accessibilityLabel={`${username} avatar`}
      />
    </View>
  );
}

function XpProgressTrack({ percent, accentColor }: { percent: number; accentColor: string }) {
  const { theme, isDark } = useTheme();

  return (
    <View
      style={{
        marginTop: 8,
        height: 6,
        width: '100%',
        overflow: 'hidden',
        borderRadius: 999,
        borderWidth: 1,
        borderColor: isDark ? 'rgba(255,255,255,0.05)' : theme.borderSubtle,
        backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : theme.ringTrack,
        shadowColor: accentColor,
        shadowOpacity: 0.22,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 0 },
      }}
    >
      <LinearGradient
        colors={[accentColor, '#775DD8', '#6366F1']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={[styles.progressFill, { width: `${Math.min(100, percent)}%` }]}
      />
    </View>
  );
}

export function CurrentUserRankCard({
  currentUser,
  isLoading,
  error,
}: {
  currentUser: CurrentUserLeaderboard | null;
  isLoading: boolean;
  error: string | null;
}) {
  const { theme, isDark } = useTheme();
  const mutedColor = isDark ? SILVER_DARK : SILVER_LIGHT;

  if (isLoading && !currentUser) {
    return (
      <LeaderboardGlassCard variant="hero">
        <View className="items-center justify-center gap-3 px-5 py-8">
          <ActivityIndicator color={theme.primary} size="small" />
          <Text style={{ fontSize: 14, fontWeight: '500', color: mutedColor }}>Loading your rank…</Text>
        </View>
      </LeaderboardGlassCard>
    );
  }

  if (!currentUser) {
    return (
      <LeaderboardGlassCard variant="hero">
        <View className="items-center justify-center px-5 py-8">
          <Text
            style={{
              textAlign: 'center',
              fontSize: 16,
              fontWeight: '700',
              letterSpacing: 2,
              textTransform: 'uppercase',
              color: theme.textPrimary,
            }}
          >
            Sign in to compete globally
          </Text>
          <Text
            style={{
              marginTop: 8,
              textAlign: 'center',
              fontSize: 14,
              lineHeight: 20,
              color: mutedColor,
            }}
          >
            {error ?? 'Your rank and XP progress will appear here once your profile syncs.'}
          </Text>
        </View>
      </LeaderboardGlassCard>
    );
  }

  const { profile, rank_position, total_users } = currentUser;
  const tierTheme = getDashboardTierTheme(profile.level);
  const xpProgress = getXpProgress(profile.level, profile.xp);
  const xpRemaining = Math.max(0, xpProgress.requiredXp - xpProgress.currentXp);

  return (
    <LeaderboardGlassCard variant="hero" tierTheme={tierTheme} highlighted>
      <LinearGradient
        colors={[`${tierTheme.primary}22`, 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <View className="flex-row items-center gap-3 px-4 py-5">
        <View className="w-[76px] items-center gap-2">
          <LeaderboardAvatar
            username={profile.username}
            size={USER_AVATAR_SIZES.deck}
            tierTheme={tierTheme}
            isCurrentUser
          />
          <Text
            className="max-w-[76px] text-center text-xs font-bold"
            style={{ color: theme.textPrimary }}
            numberOfLines={1}
          >
            {profile.username}
          </Text>
          <TierBadge level={profile.level} compact />
        </View>

        <View className="min-w-0 flex-1 px-1">
          <Text
            style={{
              fontSize: 9,
              fontWeight: '700',
              letterSpacing: 1.6,
              textTransform: 'uppercase',
              color: mutedColor,
            }}
          >
            Global Placement
          </Text>
          <Text
            style={{
              marginTop: 6,
              fontSize: 14,
              fontWeight: '700',
              lineHeight: 20,
              color: theme.textPrimary,
            }}
          >
            {formatRankPlacement(rank_position, total_users)}
          </Text>
        </View>

        <View className="w-[108px] items-end">
          <Text
            className="text-sm font-black uppercase tracking-widest"
            style={{
              color: theme.textPrimary,
              textShadowColor: tierTheme.glow,
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: 12,
            }}
          >
            LVL {profile.level}
          </Text>
          <XpProgressTrack percent={xpProgress.percent} accentColor={tierTheme.primary} />
          <Text
            style={{
              marginTop: 6,
              textAlign: 'right',
              fontSize: 9,
              fontWeight: '600',
              letterSpacing: 1,
              textTransform: 'uppercase',
              color: mutedColor,
            }}
          >
            {formatXp(xpRemaining)} XP to next level
          </Text>
        </View>
      </View>
    </LeaderboardGlassCard>
  );
}

export function LeaderboardRow({
  entry,
  isCurrentUser,
}: {
  entry: LeaderboardEntry;
  isCurrentUser: boolean;
}) {
  const { theme } = useTheme();
  const tierTheme = getDashboardTierTheme(entry.level);
  const medal = getRankMedalStyle(entry.rank_position);

  return (
    <LeaderboardGlassCard
      variant="row"
      tierTheme={tierTheme}
      highlighted={isCurrentUser}
    >
      <View
        className="flex-row items-center gap-2.5 px-3.5 py-3.5"
        style={{
          backgroundColor: isCurrentUser ? `${tierTheme.primary}18` : 'transparent',
        }}
      >
        <View className="w-[34px] items-center">
          {medal ? (
            <View
              className="h-7 min-w-[28px] items-center justify-center rounded-full border"
              style={[
                styles.medalGlow,
                {
                  borderColor: medal.color,
                  backgroundColor: `${medal.color}18`,
                  shadowColor: medal.color,
                },
              ]}
            >
              <Text className="text-xs font-black" style={{ color: medal.color }}>
                {entry.rank_position}
              </Text>
            </View>
          ) : (
            <Text className="text-sm font-bold" style={{ color: tierTheme.secondary }}>
              {entry.rank_position}
            </Text>
          )}
        </View>

        <LeaderboardAvatar
          username={entry.username}
          size={USER_AVATAR_SIZES.row}
          tierTheme={tierTheme}
          isCurrentUser={isCurrentUser}
        />

        <View className="min-w-0 flex-1 gap-1.5">
          <Text className="text-sm font-bold" style={{ color: theme.textPrimary }} numberOfLines={1}>
            {entry.username}
          </Text>
          <View className="flex-row flex-wrap items-center gap-2">
            <View
              className="rounded-full px-2 py-0.5"
              style={{
                backgroundColor: tierTheme.capsuleBackground,
                borderWidth: 1,
                borderColor: tierTheme.capsuleBorder,
              }}
            >
              <Text
                className="text-[10px] font-bold uppercase tracking-wider"
                style={{ color: tierTheme.highlight }}
              >
                LVL {entry.level}
              </Text>
            </View>
            <TierBadge level={entry.level} compact />
          </View>
        </View>

        <View className="min-w-[68px] items-end">
          <Text
            className="text-sm font-black"
            style={{ color: tierTheme.useGoldGradient ? tierTheme.primary : theme.textPrimary }}
          >
            {formatXp(entry.xp)}
          </Text>
          <Text
            className="mt-0.5 text-[9px] font-bold uppercase tracking-widest"
            style={{ color: tierTheme.secondary }}
          >
            XP
          </Text>
        </View>
      </View>
    </LeaderboardGlassCard>
  );
}

type GlobalLeaderboardProps = {
  bottomInset?: number;
};

export function GlobalLeaderboard({ bottomInset = 32 }: GlobalLeaderboardProps) {
  const { theme, isDark } = useTheme();
  const mutedColor = isDark ? SILVER_DARK : SILVER_LIGHT;
  const { topUsers, currentUser, isLoading, error, refresh } = useLeaderboard();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const currentUserId = currentUser?.profile.id ?? null;

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refresh();
    } finally {
      setIsRefreshing(false);
    }
  }, [refresh]);

  const renderItem: ListRenderItem<LeaderboardEntry> = useCallback(
    ({ item }) => (
      <LeaderboardRow entry={item} isCurrentUser={item.id === currentUserId} />
    ),
    [currentUserId],
  );

  const keyExtractor = useCallback((item: LeaderboardEntry) => item.id, []);

  return (
    <FlatList
      data={topUsers}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: bottomInset }}
      ItemSeparatorComponent={() => <View className="h-2" />}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={() => void handleRefresh()}
          tintColor={theme.primary}
          colors={[theme.primary]}
          title="Pull to refresh ranks"
          titleColor={mutedColor}
        />
      }
      ListHeaderComponent={
        <View className="gap-3 pb-2">
          <LifeRadarChart />
          <Text
            style={{
              marginTop: 4,
              fontSize: 10,
              fontWeight: '700',
              letterSpacing: 2,
              textTransform: 'uppercase',
              color: mutedColor,
            }}
          >
            Global Leaderboard
          </Text>
          <CurrentUserRankCard
            currentUser={currentUser}
            isLoading={isLoading}
            error={error}
          />
          <Text
            style={{
              marginTop: 4,
              fontSize: 16,
              fontWeight: '900',
              letterSpacing: 1.6,
              textTransform: 'uppercase',
              color: theme.textPrimary,
            }}
          >
            Top 50 Worldwide
          </Text>
          {error ? (
            <Text className="text-xs font-medium text-red-400">{error}</Text>
          ) : null}
        </View>
      }
      ListEmptyComponent={
        !isLoading ? (
          <LeaderboardGlassCard variant="empty">
            <View className="items-center px-5 py-6">
              <Text
                style={{
                  textAlign: 'center',
                  fontSize: 14,
                  fontWeight: '700',
                  letterSpacing: 1.6,
                  textTransform: 'uppercase',
                  color: theme.textPrimary,
                }}
              >
                No ranked players yet
              </Text>
              <Text
                style={{
                  marginTop: 8,
                  textAlign: 'center',
                  fontSize: 14,
                  lineHeight: 20,
                  color: mutedColor,
                }}
              >
                Be the first to earn XP and claim the top spot.
              </Text>
            </View>
          </LeaderboardGlassCard>
        ) : (
          <View className="items-center py-6">
            <ActivityIndicator color={theme.primary} />
          </View>
        )
      }
    />
  );
}

const styles = StyleSheet.create({
  glassOuterGlow: {
    shadowColor: '#775DD8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 10,
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    shadowColor: '#775DD8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.65,
    shadowRadius: 6,
  },
  medalGlow: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 12,
    elevation: 6,
  },
});
