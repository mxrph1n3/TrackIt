import { LinearGradient } from 'expo-linear-gradient';
import { Play } from 'lucide-react-native';
import { ImageBackground, StyleSheet, Text, View } from 'react-native';

import { useHealthAssets } from '../../../lib/healthAssets';
import { getImageScrim } from '../../../lib/themeAssets';
import { formatMuscleGroups } from '../../../lib/health/workoutDashboard';
import { useHealthNavigation } from '../../../hooks/useHealthNavigation';
import { useHealthTheme } from '../../../hooks/useHealthTheme';
import { useHealthStore, useTodayWorkoutPreview } from '../../../stores/useHealthStore';
import { useCurrentProgramDay } from '../../../stores/useHealthStore';
import { HealthPrimaryButton } from '../ui/HealthPrimaryButton';
import { PremiumCard } from '../ui/PremiumCard';
import { useTheme } from '../../../theme/ThemeContext';

export function TrainingHeroCard() {
  const { focusName, exerciseCount, estimatedMinutes } = useTodayWorkoutPreview();
  const openWorkoutGoalPicker = useHealthStore((s) => s.openWorkoutGoalPicker);
  const { push } = useHealthNavigation();
  const programDay = useCurrentProgramDay();
  const { mode } = useTheme();
  const { workoutHero } = useHealthAssets();
  const healthTheme = useHealthTheme();
  const heroScrim = getImageScrim(mode, 'vertical');

  return (
    <PremiumCard onPress={() => push('WorkoutDetails')} padding={0} style={styles.card}>
      <ImageBackground
        source={workoutHero}
        style={styles.heroBg}
        imageStyle={styles.heroImage}
        resizeMode="cover"
      >
        <LinearGradient
          colors={[...heroScrim]}
          locations={[0, 0.28, 0.52, 0.72]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.heroGradient}
        >
          <View style={styles.copy}>
            <Text style={[styles.kicker, { color: healthTheme.slate }]}>Today&apos;s Workout</Text>
            <Text style={[styles.title, { color: healthTheme.ink }]}>{focusName}</Text>
            <Text style={[styles.muscles, { color: healthTheme.slate }]}>{formatMuscleGroups(focusName)}</Text>
            <Text style={[styles.meta, { color: healthTheme.muted }]}>
              {exerciseCount} exercises · ~{estimatedMinutes} min
            </Text>
            <View style={styles.ctaWrap}>
              <HealthPrimaryButton
                label="Start Workout"
                icon={<Play color={healthTheme.ink} size={18} fill={healthTheme.ink} />}
                onPress={() => openWorkoutGoalPicker()}
              />
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>

      {programDay?.notes?.[0] ? (
        <View style={[styles.note, { borderTopColor: healthTheme.cardBorder, backgroundColor: healthTheme.card }]}>
          <Text style={[styles.noteText, { color: healthTheme.slate }]}>{programDay.notes[0]}</Text>
        </View>
      ) : null}
    </PremiumCard>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
  heroBg: {
    minHeight: 220,
  },
  heroImage: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    opacity: 1,
    transform: [{ scale: 1.15 }, { translateX: 16 }],
  },
  heroGradient: {
    flex: 1,
    padding: 20,
    paddingRight: 108,
    minHeight: 220,
    justifyContent: 'center',
  },
  copy: {
    maxWidth: '100%',
  },
  kicker: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  title: {
    marginTop: 6,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.8,
  },
  muscles: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  meta: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '600',
  },
  ctaWrap: {
    marginTop: 16,
  },
  note: {
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  noteText: {
    fontSize: 12,
    lineHeight: 17,
  },
});
