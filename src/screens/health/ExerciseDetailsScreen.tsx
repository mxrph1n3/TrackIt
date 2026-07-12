import { Text, View } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';

import { useAppSafeAreaInsets } from '../../hooks/useAppSafeAreaInsets';
import { useHealthNavigation } from '../../hooks/useHealthNavigation';
import { useHealthStyles } from '../../hooks/useHealthStyles';
import { useFloatingTabBarStyles } from '../../navigation/hooks/useFloatingTabBarStyles';
import type { HealthStackParamList } from '../../navigation/healthTypes';
import { useCurrentProgramDay } from '../../stores/useHealthStore';
import { HealthScreenHeader } from '../../components/health/ui/HealthScreenHeader';
import { HealthScrollView, HealthScreenRoot } from '../../components/health/ui/HealthScreenScaffold';
import { PremiumCard } from '../../components/health/ui/PremiumCard';
import { MuscleMapHighlighter } from '../../components/health/MuscleMapHighlighter';

const INSTRUCTIONS = [
  'Set up with stable footing and neutral spine.',
  'Brace your core before each rep.',
  'Control the eccentric — 2–3 seconds down.',
  'Drive through the target muscle on the concentric.',
  'Maintain full range of motion without compensating.',
];

export function ExerciseDetailsScreen() {
  const insets = useAppSafeAreaInsets();
  const { scrollContentPaddingBottom } = useFloatingTabBarStyles();
  const { pop } = useHealthNavigation();
  const route = useRoute<RouteProp<HealthStackParamList, 'ExerciseDetails'>>();
  const exerciseIndex = route.params?.exerciseIndex ?? null;
  const programDay = useCurrentProgramDay();
  const exercise = exerciseIndex != null ? programDay?.exercises[exerciseIndex] : null;
  const styles = useHealthStyles((t) => ({
    content: {
      paddingHorizontal: 20,
    },
    empty: {
      color: t.slate,
      fontSize: 15,
      marginTop: 24,
      textAlign: 'center',
    },
    mapLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: t.slate,
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
      color: t.slate,
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
      backgroundColor: t.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepNumText: {
      fontSize: 13,
      fontWeight: '800',
      color: t.ink,
    },
    stepText: {
      flex: 1,
      fontSize: 15,
      lineHeight: 22,
      color: t.ink,
      fontWeight: '500',
    },
    tipKicker: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 2,
      textTransform: 'uppercase',
      color: t.slate,
      marginBottom: 8,
    },
    tipBody: {
      fontSize: 15,
      lineHeight: 22,
      color: t.ink,
      fontWeight: '500',
    },
  }));

  if (!exercise) {
    return (
      <HealthScreenRoot style={{ paddingTop: insets.top + 8, paddingHorizontal: 20 }}>
        <HealthScreenHeader title="Exercise" onBack={pop} />
        <Text style={styles.empty}>Exercise not found.</Text>
      </HealthScreenRoot>
    );
  }

  return (
    <HealthScreenRoot style={{ paddingTop: insets.top + 8 }}>
      <HealthScrollView
        contentContainerStyle={[styles.content, { paddingBottom: scrollContentPaddingBottom + 16 }]}
      >
        <HealthScreenHeader title={exercise.name} subtitle="Exercise Details" onBack={pop} />

        <PremiumCard padding={12} tone="canvas">
          <MuscleMapHighlighter
            highlight={{
              primary: exercise.primaryMuscles,
              secondary: exercise.secondaryMuscles ?? [],
            }}
            compact
            layout="dual"
            centerContent={
              <Text style={styles.mapLabel}>Target muscles</Text>
            }
          />
        </PremiumCard>

        <PremiumCard>
          <View style={styles.metaGrid}>
            <MetaItem label="Sets" value={String(exercise.setsCount)} />
            <MetaItem label="Reps" value={exercise.repsTarget} />
            <MetaItem
              label="Intensity"
              value={exercise.intensityPercentage ? `${exercise.intensityPercentage}%` : '—'}
            />
            <MetaItem label="Rest" value={exercise.restSeconds ? `${exercise.restSeconds}s` : '90s'} />
          </View>
        </PremiumCard>

        <Text style={styles.sectionTitle}>Instructions</Text>
        {INSTRUCTIONS.map((step, index) => (
          <PremiumCard key={step} padding={16}>
            <View style={styles.stepRow}>
              <View style={styles.stepNum}>
                <Text style={styles.stepNumText}>{index + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          </PremiumCard>
        ))}

        <PremiumCard>
          <Text style={styles.tipKicker}>Tips</Text>
          <Text style={styles.tipBody}>Keep shoulders packed and avoid momentum on the last reps.</Text>
        </PremiumCard>

        <PremiumCard>
          <Text style={styles.tipKicker}>Breathing</Text>
          <Text style={styles.tipBody}>Exhale on exertion. Inhale during the eccentric phase.</Text>
        </PremiumCard>
      </HealthScrollView>
    </HealthScreenRoot>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  const styles = useHealthStyles((t) => ({
    metaItem: {
      width: '47%',
      flexGrow: 1,
      backgroundColor: t.accentSoft,
      borderRadius: 14,
      padding: 12,
    },
    metaLabel: {
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 1.5,
      textTransform: 'uppercase',
      color: t.slate,
    },
    metaValue: {
      marginTop: 4,
      fontSize: 18,
      fontWeight: '800',
      color: t.ink,
    },
  }));

  return (
    <View style={styles.metaItem}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}
