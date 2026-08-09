import { CalendarDays } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useHealthStyles } from '../../../hooks/useHealthStyles';
import { useHealthTheme } from '../../../hooks/useHealthTheme';
import { useDashboardWorkoutSnapshot } from '../../../hooks/useDashboardWorkoutSnapshot';
import {
  tRelativeDay,
  tWeekdayShort,
  tWorkoutProgramDay,
} from '../../../i18n/helpers';
import { formatNextWorkoutWhen } from '../../../lib/health/workoutDashboard';
import { useHealthStore } from '../../../stores/useHealthStore';
import { PremiumCard } from '../ui/PremiumCard';

function parseProgramDayKey(dayKey: string): { week: number; day: number } | null {
  const match = /^w(\d+)-d(\d+)$/.exec(dayKey);
  if (!match) return null;
  return { week: Number(match[1]), day: Number(match[2]) };
}

export function NextWorkoutCard() {
  const { t } = useTranslation();
  const workoutSnapshot = useDashboardWorkoutSnapshot();
  const trackId = useHealthStore((s) => s.selectedTrackId);
  const healthTheme = useHealthTheme();
  const styles = useHealthStyles((ht) => ({
    card: {
      opacity: 0.72,
      backgroundColor: ht.card,
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
      color: ht.slate,
    },
    title: {
      marginTop: 4,
      fontSize: 18,
      fontWeight: '800',
      color: ht.ink,
    },
    meta: {
      marginTop: 4,
      fontSize: 13,
      fontWeight: '500',
      color: ht.muted,
    },
    iconWrap: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: ht.accentSoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
  }));

  const nextTraining = workoutSnapshot.nextTraining;

  if (!nextTraining) {
    return null;
  }

  const rawWhen = formatNextWorkoutWhen(nextTraining.stepsAhead, nextTraining.day.dayLabel);
  const whenLabel =
    rawWhen === 'Today' || rawWhen === 'Tomorrow'
      ? tRelativeDay(t, rawWhen)
      : tWeekdayShort(t, rawWhen);
  const parsed = parseProgramDayKey(nextTraining.day.dayKey);
  const split =
    parsed != null
      ? tWorkoutProgramDay(t, trackId, parsed.week, parsed.day, nextTraining.day.split)
      : nextTraining.day.split;

  return (
    <PremiumCard style={styles.card}>
      <View style={styles.row}>
        <View style={styles.copy}>
          <Text style={styles.kicker}>{t('health.nextWorkout')}</Text>
          <Text style={styles.title}>{split}</Text>
          <Text style={styles.meta}>
            {whenLabel} · ~{nextTraining.day.estimatedMinutes} {t('common.min')}
          </Text>
        </View>
        <View style={styles.iconWrap}>
          <CalendarDays color={healthTheme.slate} size={22} strokeWidth={1.8} />
        </View>
      </View>
    </PremiumCard>
  );
}
