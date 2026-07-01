import { Text, View } from 'react-native';

import { useHealthStyles } from '../../../hooks/useHealthStyles';
import { useHealthStore } from '../../../stores/useHealthStore';
import { HealthProgressBar } from '../ui/HealthProgressBar';
import { PremiumCard } from '../ui/PremiumCard';

const WEEKLY_TARGET = 5;

export function WeeklyProgressCard() {
  const weeklyPlan = useHealthStore((s) => s.weeklyPlan);
  const selectedDayIndex = useHealthStore((s) => s.selectedDayIndex);
  const lastSession = useHealthStore((s) => s.lastSession);
  const styles = useHealthStyles((t) => ({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
      gap: 8,
    },
    kicker: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 2,
      textTransform: 'uppercase',
      color: t.slate,
      flex: 1,
    },
    meta: {
      fontSize: 13,
      fontWeight: '700',
      color: t.ink,
    },
    percent: {
      fontSize: 13,
      fontWeight: '700',
      color: t.accent,
      minWidth: 36,
      textAlign: 'right',
    },
  }));

  const trainingDays = weeklyPlan.filter((day) => !day.isRest);
  const target = Math.min(WEEKLY_TARGET, trainingDays.length || WEEKLY_TARGET);
  let completed = weeklyPlan
    .slice(0, selectedDayIndex)
    .filter((day) => !day.isRest).length;

  if (lastSession.relativeDay === 'Today' && lastSession.title !== '—') {
    completed = Math.min(target, completed + 1);
  }

  const percent = target > 0 ? Math.round((completed / target) * 100) : 0;

  return (
    <PremiumCard padding={16}>
      <View style={styles.header}>
        <Text style={styles.kicker}>Week Progress</Text>
        <Text style={styles.meta}>
          {completed} / {target} workouts
        </Text>
        <Text style={styles.percent}>{percent}%</Text>
      </View>
      <HealthProgressBar progress={percent} height={6} />
    </PremiumCard>
  );
}
