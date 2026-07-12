import { Sparkles } from 'lucide-react-native';
import { ImageBackground, StyleSheet, Text, View } from 'react-native';

import { useHealthAssets } from '../../../lib/healthAssets';
import { useHealthTheme } from '../../../hooks/useHealthTheme';
import { useHealthStore } from '../../../stores/useHealthStore';
import { PremiumCard } from '../ui/PremiumCard';

function StatBlock({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: { ink: string; slate: string };
}) {
  return (
    <View style={styles.statBlock}>
      <Text style={[styles.statValue, { color: color.ink }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: color.slate }]}>{label}</Text>
    </View>
  );
}

export function RecentWorkoutCard() {
  const lastSession = useHealthStore((s) => s.lastSession);
  const { workoutHero } = useHealthAssets();
  const healthTheme = useHealthTheme();

  if (!lastSession.title || lastSession.title === '—') {
    return null;
  }

  const metaLine = `${lastSession.relativeDay} · ${lastSession.durationMinutes} min`;
  const volume =
    lastSession.tonnageKg >= 1000
      ? `${(lastSession.tonnageKg / 1000).toFixed(1)}t`
      : `${lastSession.tonnageKg.toLocaleString('en-US')} kg`;

  return (
    <PremiumCard>
      <View style={styles.row}>
        <ImageBackground
          source={workoutHero}
          style={[styles.thumb, { backgroundColor: healthTheme.background }]}
          imageStyle={styles.thumbImage}
          resizeMode="cover"
        />
        <View style={styles.copy}>
          <Text style={[styles.title, { color: healthTheme.ink }]}>{lastSession.title}</Text>
          <Text style={[styles.meta, { color: healthTheme.muted }]}>{metaLine}</Text>
        </View>
        <View style={[styles.xpBadge, { backgroundColor: healthTheme.accentSoft }]}>
          <Sparkles color={healthTheme.accent} size={14} />
          <Text style={[styles.xp, { color: healthTheme.accent }]}>+{lastSession.xpEarned} XP</Text>
        </View>
      </View>

      <View style={[styles.statsRow, { borderTopColor: healthTheme.cardBorder }]}>
        <StatBlock label="Exercises" value={String(lastSession.exerciseCount)} color={healthTheme} />
        <StatBlock label="Sets" value={String(lastSession.setCount)} color={healthTheme} />
        <StatBlock label="Volume" value={volume} color={healthTheme} />
      </View>
    </PremiumCard>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
  },
  thumbImage: {
    transform: [{ scale: 1.15 }, { translateX: -6 }],
  },
  copy: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
  },
  meta: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: '500',
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  xp: {
    fontSize: 12,
    fontWeight: '800',
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    gap: 8,
  },
  statBlock: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  statLabel: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
});
