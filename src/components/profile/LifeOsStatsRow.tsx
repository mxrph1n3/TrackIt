import { Text, View } from 'react-native';

import { useProgression } from '../../hooks/useProgression';

type StatCellProps = {
  value: string;
  label: string;
};

function StatCell({ value, label }: StatCellProps) {
  return (
    <View className="min-w-0 flex-1 items-center px-1">
      <Text
        className="text-xl font-black text-ethereal-ink"
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.75}
      >
        {value}
      </Text>
      <Text className="mt-1.5 text-center text-[9px] font-semibold uppercase leading-3 tracking-wider text-ethereal-slate">
        {label}
      </Text>
    </View>
  );
}

function formatFocusHours(hours: number) {
  return hours.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

const LABELS = {
  profile: {
    days: 'Days in App',
    habits: 'Active Habits',
    focus: 'Focus Hours',
  },
  drawer: {
    days: 'Days',
    habits: 'Habits',
    focus: 'Focus Hrs',
  },
} as const;

type LifeOsStatsRowProps = {
  variant?: keyof typeof LABELS;
};

export function LifeOsStatsRow({ variant = 'profile' }: LifeOsStatsRowProps) {
  const { profileStats } = useProgression();
  const labels = LABELS[variant];

  return (
    <View className="mx-1 mb-6 flex-row rounded-2xl border border-obsidian-border bg-white/[0.03] py-5">
      <StatCell value={String(profileStats.daysActive)} label={labels.days} />
      <View className="w-px self-stretch bg-white/10" />
      <StatCell value={String(profileStats.habitsCompleted)} label={labels.habits} />
      <View className="w-px self-stretch bg-white/10" />
      <StatCell value={formatFocusHours(profileStats.focusHours)} label={labels.focus} />
    </View>
  );
}
