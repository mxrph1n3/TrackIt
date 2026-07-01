import { Text, View } from 'react-native';

import { useProgression } from '../../hooks/useProgression';
import { useHealthStore } from '../../stores/useHealthStore';
import { getThemedSurfaces } from '../../theme/themedSurfaces';
import { useTheme } from '../../theme/ThemeContext';
import { GlassPanel } from '../GlassPanel';

type StatCardProps = {
  label: string;
  value: string;
};

function StatCard({ label, value }: StatCardProps) {
  const { theme, isDark } = useTheme();
  const surfaces = getThemedSurfaces(theme, isDark);

  return (
    <View
      className="min-w-[47%] flex-1 rounded-2xl border border-obsidian-border px-3 py-3"
      style={{ backgroundColor: surfaces.chip }}
    >
      <Text className="text-[10px] font-bold uppercase tracking-wider text-ethereal-slate">
        {label}
      </Text>
      <Text className="mt-1 text-lg font-black text-ethereal-ink">{value}</Text>
    </View>
  );
}

export function WorkoutStatsGrid() {
  const stats = useHealthStore((s) => s.lifetimeStats);
  const { profile } = useProgression();

  const streak = Math.max(stats.streakDays, profile?.days_active ?? 0);
  const hours = Math.round(stats.totalMinutes / 60);

  return (
    <GlassPanel borderRadius={22} style={{ marginBottom: 16 }}>
      <View className="p-4">
        <Text className="mb-3 text-[10px] font-bold uppercase tracking-widest text-ethereal-slate">
          Stats
        </Text>
        <View className="flex-row flex-wrap gap-3">
          <StatCard label="Total workouts" value={String(stats.totalWorkouts)} />
          <StatCard label="Streak" value={`${streak} days`} />
          <StatCard label="Time" value={`${hours} hr`} />
          <StatCard
            label="Total volume"
            value={`${stats.totalTonnageKg.toLocaleString('en-US')} kg`}
          />
        </View>
      </View>
    </GlassPanel>
  );
}
