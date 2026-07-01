import { LinearGradient } from 'expo-linear-gradient';
import { Check, Flame } from 'lucide-react-native';
import { ImageBackground, StyleSheet, Text, View } from 'react-native';

import { useHealthAssets } from '../../../lib/healthAssets';
import { getImageScrim } from '../../../lib/themeAssets';
import { useHealthTheme } from '../../../hooks/useHealthTheme';
import { useHealthStore } from '../../../stores/useHealthStore';
import { useTheme } from '../../../theme/ThemeContext';
import { HEALTH_ELEVATION } from '../ui/healthTheme';

const CARD_HEIGHT = 168;

export function StreakCard() {
  const stats = useHealthStore((s) => s.lifetimeStats);
  const weeklyPlan = useHealthStore((s) => s.weeklyPlan);
  const selectedDayIndex = useHealthStore((s) => s.selectedDayIndex);
  const { mode } = useTheme();
  const { todayWidget } = useHealthAssets();
  const healthTheme = useHealthTheme();
  const scrim = getImageScrim(mode, 'horizontalSoft');

  const streak = stats.streakDays;
  const longest = Math.max(stats.longestStreakDays, streak);

  return (
    <View style={styles.shell}>
      <View
        style={[
          styles.card,
          { borderColor: healthTheme.cardBorder, backgroundColor: healthTheme.card },
        ]}
      >
        <ImageBackground
          source={todayWidget}
          style={styles.bg}
          imageStyle={styles.bgImage}
          resizeMode="cover"
        >
          <LinearGradient colors={[...scrim]} locations={[0, 0.45, 1]} style={styles.gradient}>
            <View style={styles.topRow}>
              <View style={styles.streakCopy}>
                <View style={styles.kickerRow}>
                  <Flame color={healthTheme.accent} size={14} fill={healthTheme.accent} />
                  <Text style={[styles.kicker, { color: healthTheme.slate }]}>Streak</Text>
                </View>
                <Text style={[styles.value, { color: healthTheme.ink }]}>{streak} days</Text>
                {longest > 0 ? (
                  <Text style={[styles.longest, { color: healthTheme.muted }]}>Longest: {longest} days</Text>
                ) : null}
              </View>
            </View>

            <View style={styles.weekRow}>
              {weeklyPlan.map((day, index) => {
                const done = day.isCompleted || (index === selectedDayIndex && streak > 0);
                return (
                  <View key={day.dayKey} style={styles.dayCol}>
                    <View
                      style={[
                        styles.dayCircle,
                        done
                          ? { backgroundColor: healthTheme.accent }
                          : { backgroundColor: healthTheme.accentSoft, borderColor: healthTheme.accentMuted, borderWidth: 1 },
                      ]}
                    >
                      {done ? (
                        <Check color={healthTheme.ink} size={12} strokeWidth={3} />
                      ) : null}
                    </View>
                    <Text style={[styles.dayLabel, { color: healthTheme.slate }]}>{day.dayLabel}</Text>
                  </View>
                );
              })}
            </View>
          </LinearGradient>
        </ImageBackground>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    ...HEALTH_ELEVATION.card,
    marginBottom: 16,
  },
  card: {
    height: CARD_HEIGHT,
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: 1,
  },
  bg: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  bgImage: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 18,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  streakCopy: {
    flex: 1,
  },
  kickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  kicker: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  value: {
    marginTop: 6,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.6,
  },
  longest: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: '500',
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
  },
  dayCol: {
    alignItems: 'center',
    gap: 6,
  },
  dayCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
});
