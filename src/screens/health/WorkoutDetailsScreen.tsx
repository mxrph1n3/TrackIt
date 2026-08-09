import { ChevronRight, Dumbbell } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Image, Text, View } from 'react-native';

import { useAppSafeAreaInsets } from '../../hooks/useAppSafeAreaInsets';
import { useHealthAssets } from '../../lib/healthAssets';
import { useHealthNavigation } from '../../hooks/useHealthNavigation';
import { useHealthStyles } from '../../hooks/useHealthStyles';
import { useHealthTheme } from '../../hooks/useHealthTheme';
import { useFloatingTabBarStyles } from '../../navigation/hooks/useFloatingTabBarStyles';
import { tExerciseName } from '../../i18n/helpers';
import { useCurrentProgramDay, useHealthStore, useTodayWorkoutPreview } from '../../stores/useHealthStore';
import { HealthPrimaryButton } from '../../components/health/ui/HealthPrimaryButton';
import { HealthScreenHeader } from '../../components/health/ui/HealthScreenHeader';
import { HealthScrollView, HealthScreenRoot } from '../../components/health/ui/HealthScreenScaffold';
import { PremiumCard } from '../../components/health/ui/PremiumCard';

export function WorkoutDetailsScreen() {
  const { t } = useTranslation();
  const insets = useAppSafeAreaInsets();
  const { scrollContentPaddingBottom } = useFloatingTabBarStyles();
  const stickyFooterHeight = 68;
  const { workoutHero } = useHealthAssets();
  const { pop, push } = useHealthNavigation();
  const openWorkoutGoalPicker = useHealthStore((s) => s.openWorkoutGoalPicker);
  const { focusName, exerciseCount, estimatedMinutes } = useTodayWorkoutPreview();
  const programDay = useCurrentProgramDay();
  const healthTheme = useHealthTheme();
  const styles = useHealthStyles((ht) => ({
    root: {
      flex: 1,
      backgroundColor: ht.background,
    },
    scroll: {
      flex: 1,
    },
    content: {
      paddingHorizontal: 20,
    },
    heroArt: {
      height: 200,
      borderRadius: ht.radius.card,
      overflow: 'hidden',
      marginBottom: 16,
      backgroundColor: ht.background,
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
      backgroundColor: ht.background,
      opacity: 0.72,
      justifyContent: 'flex-end',
      padding: 20,
    },
    heroTitle: {
      fontSize: 28,
      fontWeight: '900',
      color: ht.ink,
    },
    heroMeta: {
      marginTop: 4,
      fontSize: 14,
      fontWeight: '600',
      color: ht.slate,
    },
    sectionKicker: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 2,
      textTransform: 'uppercase',
      color: ht.slate,
      marginBottom: 6,
    },
    sectionBody: {
      fontSize: 15,
      fontWeight: '600',
      color: ht.ink,
      lineHeight: 22,
      textTransform: 'capitalize',
    },
    listTitle: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 2,
      textTransform: 'uppercase',
      color: ht.slate,
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
      backgroundColor: ht.accentSoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    exerciseCopy: {
      flex: 1,
    },
    exerciseName: {
      fontSize: 16,
      fontWeight: '700',
      color: ht.ink,
    },
    exerciseMeta: {
      marginTop: 4,
      fontSize: 13,
      color: ht.slate,
      fontWeight: '500',
    },
    sticky: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: 20,
      paddingTop: 12,
      backgroundColor: ht.card,
      borderTopWidth: 1,
      borderTopColor: ht.cardBorder,
    },
  }));

  return (
    <HealthScreenRoot style={{ paddingTop: insets.top + 8 }}>
      <HealthScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: scrollContentPaddingBottom + stickyFooterHeight + 12 },
        ]}
      >
        <HealthScreenHeader title={t('health.workoutDetails')} subtitle={focusName} onBack={pop} />

        <View style={styles.heroArt}>
          <Image source={workoutHero} style={styles.heroImg} resizeMode="cover" />
          <View style={styles.heroOverlay}>
            <Text style={styles.heroTitle}>{focusName}</Text>
            <Text style={styles.heroMeta}>
              {exerciseCount} {t('health.stats.exercises').toLowerCase()} · ~{estimatedMinutes} min
            </Text>
          </View>
        </View>

        <PremiumCard padding={16}>
          <Text style={styles.sectionKicker}>{t('health.muscleGroups')}</Text>
          <Text style={styles.sectionBody}>
            {programDay?.exercises
              .flatMap((ex) => ex.primaryMuscles)
              .filter((v, i, a) => a.indexOf(v) === i)
              .slice(0, 6)
              .join(' · ') || t('health.fullBody')}
          </Text>
        </PremiumCard>

        <Text style={styles.listTitle}>{t('health.exercises')}</Text>
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
                <Text style={styles.exerciseName}>{tExerciseName(t, exercise.name)}</Text>
                <Text style={styles.exerciseMeta}>
                  {exercise.setsCount} {t('health.sets').toLowerCase()} · {exercise.repsTarget}{' '}
                  {t('health.reps').toLowerCase()}
                  {exercise.intensityPercentage
                    ? ` · ${t('health.intensity1rm', { pct: exercise.intensityPercentage })}`
                    : ''}
                </Text>
              </View>
              <ChevronRight color={healthTheme.muted} size={18} />
            </View>
          </PremiumCard>
        ))}
      </HealthScrollView>

      <View style={[styles.sticky, { paddingBottom: scrollContentPaddingBottom }]}>
        <HealthPrimaryButton label={t('health.startWorkout')} onPress={() => openWorkoutGoalPicker()} />
      </View>
    </HealthScreenRoot>
  );
}
