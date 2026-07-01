import { CalendarDays } from 'lucide-react-native';
import { Text, View } from 'react-native';

import { useHealthStyles } from '../../../hooks/useHealthStyles';
import { useHealthTheme } from '../../../hooks/useHealthTheme';
import { useDashboardWorkoutSnapshot } from '../../../hooks/useDashboardWorkoutSnapshot';
import { formatNextWorkoutWhen } from '../../../lib/health/workoutDashboard';
import { PremiumCard } from '../ui/PremiumCard';

export function NextWorkoutCard() {
  const workoutSnapshot = useDashboardWorkoutSnapshot();
  const healthTheme = useHealthTheme();
  const styles = useHealthStyles((t) => ({
    card: {
      opacity: 0.72,
      backgroundColor: t.card,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    copy: {
      flex: 1,
    },
    kicker: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 2,
      textTransform: 'uppercase',
      color: t.slate,
    },
    title: {
      marginTop: 4,
      fontSize: 18,
      fontWeight: '800',
      color: t.ink,
    },
    meta: {
      marginTop: 4,
      fontSize: 13,
      fontWeight: '500',
      color: t.muted,
    },
    iconWrap: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: t.accentSoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
  }));

  const nextTraining = workoutSnapshot.nextTraining;

  if (!nextTraining) {
    return null;
  }

  const whenLabel = formatNextWorkoutWhen(nextTraining.stepsAhead, nextTraining.day.dayLabel);

  return (
    <PremiumCard style={styles.card}>
      <View style={styles.row}>
        <View style={styles.copy}>
          <Text style={styles.kicker}>Next Workout</Text>
          <Text style={styles.title}>{nextTraining.day.split}</Text>
          <Text style={styles.meta}>
            {whenLabel} · ~{nextTraining.day.estimatedMinutes} min
          </Text>
        </View>
        <View style={styles.iconWrap}>
          <CalendarDays color={healthTheme.slate} size={22} strokeWidth={1.8} />
        </View>
      </View>
    </PremiumCard>
  );
}
