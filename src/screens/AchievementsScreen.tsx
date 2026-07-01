import { useEffect } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  Text,
  View,
} from 'react-native';

import { GlassPanel } from '../components/GlassPanel';
import { TrackItIcon } from '../components/ui/TrackItIcon';
import { IsolatedScreenLayout } from '../components/layout/IsolatedScreenShell';
import { DismissibleOverlay } from '../components/ui/DismissibleOverlay';
import { ScreenHeader } from '../components/ui/ScreenHeader';
import { useAchievements } from '../hooks/useAchievements';
import { useProfileModuleStore } from '../stores/useProfileModuleStore';
import { useTheme } from '../theme/ThemeContext';

export function AchievementsScreen() {
  const { theme } = useTheme();
  const closeModule = useProfileModuleStore((s) => s.closeModule);
  const {
    achievements,
    isLoading,
    selected,
    setSelectedId,
    collectReward,
    refresh,
  } = useAchievements();

  useEffect(() => {
    void refresh().catch((error) => {
      console.warn('[AchievementsScreen] refresh failed:', error);
    });
  }, [refresh]);

  const handleRefresh = () => {
    void refresh().catch((error) => {
      console.warn('[AchievementsScreen] refresh failed:', error);
    });
  };

  return (
    <>
      <IsolatedScreenLayout
        header={<ScreenHeader title="ACHIEVEMENTS" subtitle="RPG Trophy Vault" onBack={closeModule} />}
        scrollProps={{
          refreshControl: (
            <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} tintColor={theme.primary} />
          ),
        }}
      >
        {isLoading && achievements.length === 0 ? (
          <ActivityIndicator color={theme.primary} className="py-16" />
        ) : null}

        <View className="flex-row flex-wrap justify-between">
          {achievements.map((item) => {
            const unlocked = item.unlocked;
            return (
              <Pressable
                key={item.id}
                onPress={() => setSelectedId(item.id)}
                className="mb-4 w-[31%] active:opacity-85"
              >
                <GlassPanel borderRadius={999} style={{ aspectRatio: 1 }}>
                  <View className="flex-1 items-center justify-center p-3">
                    <View
                      className="h-[72px] w-[72px] items-center justify-center rounded-full border"
                      style={{
                        borderColor: unlocked ? theme.primary : `${theme.textMuted}55`,
                        backgroundColor: unlocked ? `${theme.primary}18` : `${theme.textMuted}12`,
                        shadowColor: unlocked ? theme.primaryNeon : 'transparent',
                        shadowOpacity: unlocked ? 0.35 : 0,
                        shadowRadius: 12,
                        shadowOffset: { width: 0, height: 0 },
                        opacity: unlocked ? 1 : 0.55,
                      }}
                    >
                      <TrackItIcon
                        name={item.icon}
                        size={28}
                        color={unlocked ? theme.primary : theme.textMuted}
                      />
                    </View>
                    <Text
                      numberOfLines={2}
                      className="mt-2 text-center text-[10px] font-bold uppercase tracking-wide"
                      style={{ color: theme.textPrimary }}
                    >
                      {item.title}
                    </Text>
                  </View>
                </GlassPanel>
              </Pressable>
            );
          })}
        </View>
      </IsolatedScreenLayout>

      <DismissibleOverlay
        visible={Boolean(selected)}
        onDismiss={() => setSelectedId(null)}
        placement="bottom"
        isolateContent
        accessibilityLabel="Close achievement details"
        contentStyle={{ paddingBottom: 40 }}
      >
        {selected ? (
          <GlassPanel borderRadius={28} style={{ marginHorizontal: 18 }}>
            <View className="p-6">
              <TrackItIcon name={selected.icon} size={48} color={theme.primary} badge badgeSize={72} />
              <Text className="mt-4 text-2xl font-black" style={{ color: theme.textPrimary }}>
                {selected.title}
              </Text>
              <Text className="mt-2 text-sm" style={{ color: theme.textSecondary }}>
                {selected.description}
              </Text>

              <View className="mt-5 h-2 overflow-hidden rounded-full" style={{ backgroundColor: theme.ringTrack }}>
                <View
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.round((selected.progress / selected.targetValue) * 100)}%`,
                    backgroundColor: theme.primary,
                  }}
                />
              </View>
              <Text className="mt-2 text-xs font-semibold" style={{ color: theme.textMuted }}>
                Progress: {selected.progress} / {selected.targetValue}
              </Text>

              <View className="mt-5 rounded-2xl px-4 py-3" style={{ backgroundColor: `${theme.primary}16` }}>
                <Text className="text-sm font-bold" style={{ color: theme.primary }}>
                  Reward: +{selected.xpReward} EXP
                  {selected.titleReward ? ` · Title: ${selected.titleReward}` : ''}
                </Text>
              </View>

              {selected.unlocked && !selected.xpCollected ? (
                <Pressable
                  onPress={() => {
                    void collectReward(selected.id).catch((error) => {
                      console.warn('[AchievementsScreen] collect failed:', error);
                    });
                  }}
                  className="mt-5 items-center rounded-2xl py-4 active:opacity-90"
                  style={{ backgroundColor: theme.primary }}
                >
                  <Text className="font-bold text-white">Collect Reward</Text>
                </Pressable>
              ) : null}
            </View>
          </GlassPanel>
        ) : null}
      </DismissibleOverlay>
    </>
  );
}
