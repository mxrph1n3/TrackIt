import { Check, Sparkles } from 'lucide-react-native';
import { Text, View } from 'react-native';

import { useHealthStyles } from '../../../hooks/useHealthStyles';
import { useHealthTheme } from '../../../hooks/useHealthTheme';
import { useHealthStore } from '../../../stores/useHealthStore';
import { PremiumCard } from '../ui/PremiumCard';

export function TrainingWeekList() {
  const weeklyPlan = useHealthStore((s) => s.weeklyPlan);
  const healthTheme = useHealthTheme();
  const styles = useHealthStyles((t) => ({
    wrap: {
      marginTop: 4,
    },
    sectionTitle: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 2,
      textTransform: 'uppercase',
      color: t.slate,
      marginBottom: 12,
      paddingHorizontal: 4,
    },
    selectedCard: {
      borderColor: t.accentMuted,
    },
    restCard: {
      opacity: 0.65,
    },
    weekRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    weekCopy: {
      flex: 1,
    },
    dayLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: t.slate,
      textTransform: 'uppercase',
      letterSpacing: 1.2,
    },
    split: {
      marginTop: 4,
      fontSize: 16,
      fontWeight: '700',
      color: t.ink,
    },
    restSplit: {
      color: t.muted,
    },
    meta: {
      marginTop: 4,
      fontSize: 12,
      fontWeight: '500',
      color: t.muted,
    },
    restMeta: {
      marginTop: 4,
      fontSize: 12,
      fontWeight: '500',
      color: t.slate,
    },
    todayBadge: {
      backgroundColor: t.accentSoft,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
    },
    todayText: {
      fontSize: 11,
      fontWeight: '700',
      color: t.accent,
    },
    doneBadge: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: '#34D399',
      alignItems: 'center',
      justifyContent: 'center',
    },
  }));

  return (
    <View style={styles.wrap}>
      <Text style={styles.sectionTitle}>This Week</Text>
      {weeklyPlan.map((day) => (
        <PremiumCard
          key={day.dayKey}
          style={[
            day.isRest ? styles.restCard : undefined,
            day.isToday ? styles.selectedCard : undefined,
          ]}
          padding={16}
        >
          <View style={styles.weekRow}>
            <View style={styles.weekCopy}>
              <Text style={styles.dayLabel}>{day.dayLabel}</Text>
              <Text style={[styles.split, day.isRest && styles.restSplit]}>{day.split}</Text>
              {!day.isRest ? (
                <Text style={styles.meta}>
                  ~{day.estimatedMinutes} min
                  {day.xpReward > 0 ? ` · +${day.xpReward} XP` : ''}
                </Text>
              ) : (
                <Text style={styles.restMeta}>Recovery</Text>
              )}
            </View>

            {day.isCompleted ? (
              <View style={styles.doneBadge}>
                <Check color={healthTheme.ink} size={16} strokeWidth={3} />
              </View>
            ) : day.isToday ? (
              <View style={styles.todayBadge}>
                <Text style={styles.todayText}>Today</Text>
              </View>
            ) : day.isUpcoming && !day.isRest ? (
              <Sparkles color={healthTheme.muted} size={16} />
            ) : null}
          </View>
        </PremiumCard>
      ))}
    </View>
  );
}
