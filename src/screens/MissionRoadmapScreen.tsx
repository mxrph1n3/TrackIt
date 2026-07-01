import { ActivityIndicator, RefreshControl, Text, View } from 'react-native';

import { GlassPanel } from '../components/GlassPanel';
import { IsolatedScreenLayout } from '../components/layout/IsolatedScreenShell';
import { ScreenHeader } from '../components/ui/ScreenHeader';
import type { MissionMilestoneStatus } from '../constants/missionRoadmap';
import { MISSION_DAILY_REMINDER } from '../constants/missionRoadmap';
import { useMissionRoadmap } from '../hooks/useMissionRoadmap';
import { useProfileModuleStore } from '../stores/useProfileModuleStore';
import { useTheme } from '../theme/ThemeContext';

const STATUS_LABEL: Record<MissionMilestoneStatus, string> = {
  completed: 'Completed',
  active: 'In progress',
  locked: 'Locked',
};

const STATUS_COLOR: Record<MissionMilestoneStatus, string> = {
  completed: '#10B981',
  active: '#775DD8',
  locked: '#94A3B8',
};

export function MissionRoadmapScreen() {
  const { theme } = useTheme();
  const closeModule = useProfileModuleStore((state) => state.closeModule);
  const { snapshot, isLoading, refresh } = useMissionRoadmap();

  return (
    <IsolatedScreenLayout
      header={
        <ScreenHeader title="MISSION ROADMAP" subtitle="Become Unstoppable" onBack={closeModule} />
      }
      scrollProps={{
        refreshControl: (
          <RefreshControl refreshing={isLoading} onRefresh={() => void refresh()} tintColor={theme.primary} />
        ),
      }}
    >
      <GlassPanel borderRadius={26} style={{ marginBottom: 16 }}>
        <View className="gap-3 p-5">
          <Text className="text-xs font-bold uppercase tracking-[0.24em] text-ethereal-slate">
            Mission progress
          </Text>
          <Text className="text-4xl font-black text-ethereal-ink">{snapshot.overallPercent}%</Text>
          <View className="h-2 overflow-hidden rounded-full bg-white/10">
            <View
              className="h-full rounded-full"
              style={{
                width: `${Math.min(100, snapshot.overallPercent)}%`,
                backgroundColor: theme.primary,
              }}
            />
          </View>
        </View>
      </GlassPanel>

      <GlassPanel borderRadius={22} style={{ marginBottom: 16 }}>
        <View className="gap-2 p-4">
          <Text className="text-[10px] font-bold uppercase tracking-[0.18em] text-ethereal-slate">
            Daily reminder
          </Text>
          <Text className="text-sm leading-6 text-ethereal-ink">{MISSION_DAILY_REMINDER}</Text>
        </View>
      </GlassPanel>

      {isLoading && snapshot.milestones.length === 0 ? (
        <ActivityIndicator color={theme.primary} className="py-10" />
      ) : null}

      <View className="gap-3">
        {snapshot.milestones.map((milestone) => (
          <GlassPanel key={milestone.id} borderRadius={22}>
            <View className="gap-3 p-4">
              <View className="flex-row items-start justify-between gap-3">
                <View className="flex-1">
                  <Text className="text-base font-bold text-ethereal-ink">{milestone.title}</Text>
                  <Text className="mt-1 text-sm leading-5 text-ethereal-slate">{milestone.subtitle}</Text>
                </View>
                <View
                  className="rounded-full px-2.5 py-1"
                  style={{ backgroundColor: `${STATUS_COLOR[milestone.status]}22` }}
                >
                  <Text
                    className="text-[10px] font-bold uppercase tracking-[0.12em]"
                    style={{ color: STATUS_COLOR[milestone.status] }}
                  >
                    {STATUS_LABEL[milestone.status]}
                  </Text>
                </View>
              </View>
              {milestone.status !== 'locked' ? (
                <View className="gap-1">
                  <View className="h-1.5 overflow-hidden rounded-full bg-white/10">
                    <View
                      className="h-full rounded-full"
                      style={{
                        width: `${milestone.progressPercent}%`,
                        backgroundColor: STATUS_COLOR[milestone.status],
                      }}
                    />
                  </View>
                  <Text className="text-right text-xs font-semibold text-ethereal-slate">
                    {milestone.progressPercent}%
                  </Text>
                </View>
              ) : null}
            </View>
          </GlassPanel>
        ))}
      </View>
    </IsolatedScreenLayout>
  );
}
