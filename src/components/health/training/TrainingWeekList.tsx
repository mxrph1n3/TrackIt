import { Check, Sparkles } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useHealthStyles } from '../../../hooks/useHealthStyles';
import { useHealthTheme } from '../../../hooks/useHealthTheme';
import { tWeekdayShort, tWorkoutProgramDay } from '../../../i18n/helpers';
import { useHealthStore } from '../../../stores/useHealthStore';
import { PremiumCard } from '../ui/PremiumCard';

function parseProgramDayKey(dayKey: string): { week: number; day: number } | null {
  const match = /^w(\d+)-d(\d+)$/.exec(dayKey);
  if (!match) return null;
  return { week: Number(match[1]), day: Number(match[2]) };
}

export function TrainingWeekList() {
  const { t } = useTranslation();
  const weeklyPlan = useHealthStore((s) => s.weeklyPlan);
  const trackId = useHealthStore((s) => s.selectedTrackId);
  const healthTheme = useHealthTheme();
  const styles = useHealthStyles((ht) => ({
    wrap: {
      marginTop: 4,
    },
    sectionTitle: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 2,
      textTransform: 'uppercase',
      color: ht.slate,
      marginBottom: 12,
      paddingHorizontal: 4,
    },
    selectedCard: {
      borderColor: ht.accentMuted,
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
      color: ht.slate,
      textTransform: 'uppercase',
      letterSpacing: 1.2,
    },
    split: {
      marginTop: 4,
      fontSize: 16,
      fontWeight: '700',
      color: ht.ink,
    },
    restSplit: {
      color: ht.muted,
    },
    meta: {
      marginTop: 4,
      fontSize: 12,
      fontWeight: '500',
      color: ht.muted,
    },
    restMeta: {
      marginTop: 4,
      fontSize: 12,
      fontWeight: '500',
      color: ht.slate,
    },
    todayBadge: {
      backgroundColor: ht.accentSoft,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
    },
    todayText: {
      fontSize: 11,
      fontWeight: '700',
      color: ht.accent,
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
      <Text style={styles.sectionTitle}>{t('health.thisWeek')}</Text>
      {weeklyPlan.map((day) => {
        const parsed = parseProgramDayKey(day.dayKey);
        const split =
          parsed != null
            ? tWorkoutProgramDay(t, trackId, parsed.week, parsed.day, day.split)
            : day.split;

        return (
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
                <Text style={styles.dayLabel}>{tWeekdayShort(t, day.dayLabel)}</Text>
                <Text style={[styles.split, day.isRest && styles.restSplit]}>{split}</Text>
                {!day.isRest ? (
                  <Text style={styles.meta}>
                    ~{day.estimatedMinutes} {t('common.min')}
                    {day.xpReward > 0 ? ` · ${t('health.xpGain', { xp: day.xpReward })}` : ''}
                  </Text>
                ) : (
                  <Text style={styles.restMeta}>{t('health.recovery')}</Text>
                )}
              </View>

              {day.isCompleted ? (
                <View style={styles.doneBadge}>
                  <Check color={healthTheme.ink} size={16} strokeWidth={3} />
                </View>
              ) : day.isToday ? (
                <View style={styles.todayBadge}>
                  <Text style={styles.todayText}>{t('health.today')}</Text>
                </View>
              ) : day.isUpcoming && !day.isRest ? (
                <Sparkles color={healthTheme.muted} size={16} />
              ) : null}
            </View>
          </PremiumCard>
        );
      })}
    </View>
  );
}
