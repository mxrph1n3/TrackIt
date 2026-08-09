import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';

import { useAppSafeAreaInsets } from '../../hooks/useAppSafeAreaInsets';
import { useHealthNavigation } from '../../hooks/useHealthNavigation';
import { useHealthStyles } from '../../hooks/useHealthStyles';
import { useFloatingTabBarStyles } from '../../navigation/hooks/useFloatingTabBarStyles';
import type { HealthStackParamList } from '../../navigation/healthTypes';
import { tExerciseName } from '../../i18n/helpers';
import { useCurrentProgramDay } from '../../stores/useHealthStore';
import { HealthScreenHeader } from '../../components/health/ui/HealthScreenHeader';
import { HealthScrollView, HealthScreenRoot } from '../../components/health/ui/HealthScreenScaffold';
import { PremiumCard } from '../../components/health/ui/PremiumCard';
import { MuscleMapHighlighter } from '../../components/health/MuscleMapHighlighter';

export function ExerciseDetailsScreen() {
  const { t } = useTranslation();
  const insets = useAppSafeAreaInsets();
  const { scrollContentPaddingBottom } = useFloatingTabBarStyles();
  const { pop } = useHealthNavigation();
  const route = useRoute<RouteProp<HealthStackParamList, 'ExerciseDetails'>>();
  const exerciseIndex = route.params?.exerciseIndex ?? null;
  const programDay = useCurrentProgramDay();
  const exercise = exerciseIndex != null ? programDay?.exercises[exerciseIndex] : null;
  const instructions = [1, 2, 3, 4, 5].map((step) => t(`health.instructionSteps.${step}`));
  const styles = useHealthStyles((ht) => ({
    content: {
      paddingHorizontal: 20,
    },
    empty: {
      color: ht.slate,
      fontSize: 15,
      marginTop: 24,
      textAlign: 'center',
    },
    mapLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: ht.slate,
      textAlign: 'center',
    },
    metaGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    sectionTitle: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 2,
      textTransform: 'uppercase',
      color: ht.slate,
      marginVertical: 12,
      paddingHorizontal: 4,
    },
    stepRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
    },
    stepNum: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: ht.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepNumText: {
      fontSize: 13,
      fontWeight: '800',
      color: ht.ink,
    },
    stepText: {
      flex: 1,
      fontSize: 15,
      lineHeight: 22,
      color: ht.ink,
      fontWeight: '500',
    },
    tipKicker: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 2,
      textTransform: 'uppercase',
      color: ht.slate,
      marginBottom: 8,
    },
    tipBody: {
      fontSize: 15,
      lineHeight: 22,
      color: ht.ink,
      fontWeight: '500',
    },
  }));

  if (!exercise) {
    return (
      <HealthScreenRoot style={{ paddingTop: insets.top + 8, paddingHorizontal: 20 }}>
        <HealthScreenHeader title={t('health.exercise')} onBack={pop} />
        <Text style={styles.empty}>{t('health.exerciseNotFound')}</Text>
      </HealthScreenRoot>
    );
  }

  return (
    <HealthScreenRoot style={{ paddingTop: insets.top + 8 }}>
      <HealthScrollView
        contentContainerStyle={[styles.content, { paddingBottom: scrollContentPaddingBottom + 16 }]}
      >
        <HealthScreenHeader
          title={tExerciseName(t, exercise.name)}
          subtitle={t('health.exerciseDetails')}
          onBack={pop}
        />

        <PremiumCard padding={12} tone="canvas">
          <MuscleMapHighlighter
            highlight={{
              primary: exercise.primaryMuscles,
              secondary: exercise.secondaryMuscles ?? [],
            }}
            compact
            layout="dual"
            centerContent={
              <Text style={styles.mapLabel}>{t('health.targetMuscles')}</Text>
            }
          />
        </PremiumCard>

        <PremiumCard>
          <View style={styles.metaGrid}>
            <MetaItem label={t('health.sets')} value={String(exercise.setsCount)} />
            <MetaItem label={t('health.reps')} value={exercise.repsTarget} />
            <MetaItem
              label={t('health.intensity')}
              value={exercise.intensityPercentage ? `${exercise.intensityPercentage}%` : '—'}
            />
            <MetaItem label={t('health.rest')} value={exercise.restSeconds ? `${exercise.restSeconds}s` : '90s'} />
          </View>
        </PremiumCard>

        <Text style={styles.sectionTitle}>{t('health.instructions')}</Text>
        {instructions.map((step, index) => (
          <PremiumCard key={`step-${index}`} padding={16}>
            <View style={styles.stepRow}>
              <View style={styles.stepNum}>
                <Text style={styles.stepNumText}>{index + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          </PremiumCard>
        ))}

        <PremiumCard>
          <Text style={styles.tipKicker}>{t('health.tips')}</Text>
          <Text style={styles.tipBody}>{t('health.exerciseTip')}</Text>
        </PremiumCard>

        <PremiumCard>
          <Text style={styles.tipKicker}>{t('health.breathing')}</Text>
          <Text style={styles.tipBody}>{t('health.exerciseBreathing')}</Text>
        </PremiumCard>
      </HealthScrollView>
    </HealthScreenRoot>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  const styles = useHealthStyles((ht) => ({
    metaItem: {
      width: '47%',
      flexGrow: 1,
      backgroundColor: ht.accentSoft,
      borderRadius: 14,
      padding: 12,
    },
    metaLabel: {
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 1.5,
      textTransform: 'uppercase',
      color: ht.slate,
    },
    metaValue: {
      marginTop: 4,
      fontSize: 18,
      fontWeight: '800',
      color: ht.ink,
    },
  }));

  return (
    <View style={styles.metaItem}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}
