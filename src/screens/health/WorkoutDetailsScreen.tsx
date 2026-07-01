import { ChevronRight, Dumbbell } from 'lucide-react-native';
import { Image, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useHealthAssets } from '../../lib/healthAssets';
import { useHealthNavigation } from '../../hooks/useHealthNavigation';
import { useHealthStyles } from '../../hooks/useHealthStyles';
import { useHealthTheme } from '../../hooks/useHealthTheme';
import { useCurrentProgramDay, useHealthStore, useTodayWorkoutPreview } from '../../stores/useHealthStore';
import { HealthPrimaryButton } from '../../components/health/ui/HealthPrimaryButton';
import { HealthScreenHeader } from '../../components/health/ui/HealthScreenHeader';
import { PremiumCard } from '../../components/health/ui/PremiumCard';

export function WorkoutDetailsScreen() {
  const insets = useSafeAreaInsets();
  const { workoutHero } = useHealthAssets();
  const { pop, push } = useHealthNavigation();
  const openWorkoutGoalPicker = useHealthStore((s) => s.openWorkoutGoalPicker);
  const { focusName, exerciseCount, estimatedMinutes } = useTodayWorkoutPreview();
  const programDay = useCurrentProgramDay();
  const healthTheme = useHealthTheme();
  const styles = useHealthStyles((t) => ({
    root: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    content: {
      paddingHorizontal: 20,
    },
    heroArt: {
      height: 200,
      borderRadius: t.radius.card,
      overflow: 'hidden',
      marginBottom: 16,
      backgroundColor: t.accentSoft,
    },
    heroImg: {
      width: '100%',
      height: '100%',
    },
    heroOverlay: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      backgroundColor: t.card,
      opacity: 0.55,
      justifyContent: 'flex-end',
      padding: 20,
    },
    heroTitle: {
      fontSize: 28,
      fontWeight: '900',
      color: t.ink,
    },
    heroMeta: {
      marginTop: 4,
      fontSize: 14,
      fontWeight: '600',
      color: t.slate,
    },
    sectionKicker: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 2,
      textTransform: 'uppercase',
      color: t.slate,
      marginBottom: 6,
    },
    sectionBody: {
      fontSize: 15,
      fontWeight: '600',
      color: t.ink,
      lineHeight: 22,
      textTransform: 'capitalize',
    },
    listTitle: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 2,
      textTransform: 'uppercase',
      color: t.slate,
      marginBottom: 12,
      marginTop: 4,
      paddingHorizontal: 4,
    },
    exerciseRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    exerciseIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: t.accentSoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    exerciseCopy: {
      flex: 1,
    },
    exerciseName: {
      fontSize: 16,
      fontWeight: '700',
      color: t.ink,
    },
    exerciseMeta: {
      marginTop: 4,
      fontSize: 13,
      color: t.slate,
      fontWeight: '500',
    },
    sticky: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: 20,
      paddingTop: 12,
      backgroundColor: t.card,
      borderTopWidth: 1,
      borderTopColor: t.cardBorder,
    },
  }));

  return (
    <View style={[styles.root, { paddingTop: insets.top + 8 }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
      >
        <HealthScreenHeader title="Workout Details" subtitle={focusName} onBack={pop} />

        <View style={styles.heroArt}>
          <Image source={workoutHero} style={styles.heroImg} resizeMode="cover" />
          <View style={styles.heroOverlay}>
            <Text style={styles.heroTitle}>{focusName}</Text>
            <Text style={styles.heroMeta}>
              {exerciseCount} exercises · ~{estimatedMinutes} min
            </Text>
          </View>
        </View>

        <PremiumCard padding={16}>
          <Text style={styles.sectionKicker}>Muscle Groups</Text>
          <Text style={styles.sectionBody}>
            {programDay?.exercises
              .flatMap((ex) => ex.primaryMuscles)
              .filter((v, i, a) => a.indexOf(v) === i)
              .slice(0, 6)
              .join(' · ') || 'Full body'}
          </Text>
        </PremiumCard>

        <Text style={styles.listTitle}>Exercises</Text>
        {programDay?.exercises.map((exercise, index) => (
          <PremiumCard
            key={`${exercise.name}-${index}`}
            onPress={() => push('ExerciseDetails', { exerciseIndex: index })}
            padding={16}
          >
            <View style={styles.exerciseRow}>
              <View style={styles.exerciseIcon}>
                <Dumbbell color={healthTheme.accent} size={18} />
              </View>
              <View style={styles.exerciseCopy}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <Text style={styles.exerciseMeta}>
                  {exercise.setsCount} sets · {exercise.repsTarget} reps
                  {exercise.intensityPercentage ? ` · ${exercise.intensityPercentage}% 1RM` : ''}
                </Text>
              </View>
              <ChevronRight color={healthTheme.muted} size={18} />
            </View>
          </PremiumCard>
        ))}
      </ScrollView>

      <View style={[styles.sticky, { paddingBottom: insets.bottom + 16 }]}>
        <HealthPrimaryButton label="Start Workout" onPress={() => openWorkoutGoalPicker()} />
      </View>
    </View>
  );
}
