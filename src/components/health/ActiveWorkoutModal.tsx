import { BlurView } from 'expo-blur';
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  List,
  Minus,
  Pause,
  Play,
  Plus,
  X,
} from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useAppSafeAreaInsets } from '../../hooks/useAppSafeAreaInsets';
import { useHeartRateProfile } from '../../hooks/useHeartRateProfile';
import { useHealthStyles } from '../../hooks/useHealthStyles';
import { useHealthTheme } from '../../hooks/useHealthTheme';
import { countCompletedExercises, formatExerciseSubtitle, sessionElapsedSeconds } from '../../lib/health/workoutEngine';
import { resolveMusclesForExercise } from '../../lib/health/muscleMap';
import { supportsNativeBlur } from '../../lib/platform/blur';
import { triggerHaptic } from '../../lib/platform/haptics';
import type { MuscleHighlight } from '../../types/workout';
import { useHealthStore } from '../../stores/useHealthStore';
import { useTheme } from '../../theme/ThemeContext';
import { HealthPrimaryButton } from './ui/HealthPrimaryButton';
import { HealthProgressBar } from './ui/HealthProgressBar';
import { PremiumCard } from './ui/PremiumCard';
import { HeartRateZonesCard } from './HeartRateZonesCard';
import { MuscleMapHighlighter } from './MuscleMapHighlighter';
import { WorkoutCompleteScreen } from './WorkoutCompleteScreen';

function formatTimer(totalSec: number): string {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function SetRow({
  setIndex,
  weightKg,
  reps,
  completed,
  repsTarget,
  onToggle,
  onWeightDelta,
  onRepsDelta,
}: {
  setIndex: number;
  weightKg: number;
  reps: number;
  completed: boolean;
  repsTarget: string;
  onToggle: () => void;
  onWeightDelta: (delta: number) => void;
  onRepsDelta: (delta: number) => void;
}) {
  const healthTheme = useHealthTheme();

  return (
    <PremiumCard padding={14} style={{ marginBottom: 10 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <Text style={{ fontSize: 15, fontWeight: '800', color: healthTheme.ink }}>Set {setIndex + 1}</Text>
        <Pressable
          onPress={onToggle}
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: completed ? healthTheme.accent : 'transparent',
            borderWidth: 1.5,
            borderColor: completed ? healthTheme.accent : healthTheme.accentMuted,
          }}
        >
          {completed ? <Check color={healthTheme.ink} size={16} strokeWidth={3} /> : null}
        </Pressable>
      </View>

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 10, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase', color: healthTheme.slate, marginBottom: 6 }}>
            Weight
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: healthTheme.accentSoft, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 8 }}>
            <Pressable onPress={() => onWeightDelta(-2.5)} hitSlop={8}>
              <Minus color={healthTheme.accent} size={16} />
            </Pressable>
            <Text style={{ fontSize: 15, fontWeight: '800', color: healthTheme.ink }}>
              {weightKg > 0 ? `${weightKg} kg` : '—'}
            </Text>
            <Pressable onPress={() => onWeightDelta(2.5)} hitSlop={8}>
              <Plus color={healthTheme.accent} size={16} />
            </Pressable>
          </View>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 10, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase', color: healthTheme.slate, marginBottom: 6 }}>
            Reps
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: healthTheme.accentSoft, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 8 }}>
            <Pressable onPress={() => onRepsDelta(-1)} hitSlop={8}>
              <Minus color={healthTheme.accent} size={16} />
            </Pressable>
            <Text style={{ fontSize: 15, fontWeight: '800', color: healthTheme.ink }}>
              {reps > 0 ? reps : repsTarget}
            </Text>
            <Pressable onPress={() => onRepsDelta(1)} hitSlop={8}>
              <Plus color={healthTheme.accent} size={16} />
            </Pressable>
          </View>
        </View>
      </View>
    </PremiumCard>
  );
}

export function ActiveWorkoutModal() {
  const insets = useAppSafeAreaInsets();
  const { isDark } = useTheme();
  const healthTheme = useHealthTheme();
  const styles = useHealthStyles((t) => ({
    iconBtn: {
      height: 44,
      minWidth: 44,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 14,
      backgroundColor: t.card,
      borderWidth: 1,
      borderColor: t.cardBorder,
    },
  }));
  const session = useHealthStore((s) => s.activeSession);
  const isGoalPickerOpen = useHealthStore((s) => s.isWorkoutGoalPickerOpen);
  const advanceExerciseOrFinish = useHealthStore((s) => s.advanceExerciseOrFinish);
  const cancelWorkout = useHealthStore((s) => s.cancelWorkout);
  const dismissWorkoutCompletion = useHealthStore((s) => s.dismissWorkoutCompletion);
  const toggleSet = useHealthStore((s) => s.toggleSet);
  const adjustSetWeight = useHealthStore((s) => s.adjustSetWeight);
  const adjustSetReps = useHealthStore((s) => s.adjustSetReps);
  const selectExercise = useHealthStore((s) => s.selectExercise);
  const goToNextExercise = useHealthStore((s) => s.goToNextExercise);
  const goToPreviousExercise = useHealthStore((s) => s.goToPreviousExercise);
  const togglePause = useHealthStore((s) => s.togglePause);
  const heartRateProfile = useHeartRateProfile();
  const [, setClock] = useState(0);
  const [showExerciseList, setShowExerciseList] = useState(false);
  const [showHrCard, setShowHrCard] = useState(false);

  useEffect(() => {
    if (!session || session.completionSummary) return;
    if (session.isPaused) return;
    const id = setInterval(() => setClock((value) => value + 1), 1000);
    return () => clearInterval(id);
  }, [session?.startedAtMs, session?.isPaused, session?.completionSummary]);

  const currentExercise = session?.exercises[session.currentExerciseIndex];
  const muscleHighlight: MuscleHighlight = useMemo(() => {
    if (!currentExercise) return { primary: [], secondary: [] };
    if (currentExercise.template) {
      return {
        primary: currentExercise.template.primaryMuscles,
        secondary: currentExercise.template.secondaryMuscles ?? [],
      };
    }
    return resolveMusclesForExercise(currentExercise.name);
  }, [currentExercise]);

  if (!session) return null;

  if (session.completionSummary) {
    return (
      <Modal visible animationType="none" presentationStyle="fullScreen" statusBarTranslucent>
        <WorkoutCompleteScreen
          summary={session.completionSummary}
          onDismiss={dismissWorkoutCompletion}
        />
      </Modal>
    );
  }

  if (isGoalPickerOpen) return null;

  const completedCount = countCompletedExercises(session.exercises);
  const elapsedSec = sessionElapsedSeconds(
    session.startedAtMs,
    session.totalPausedMs,
    session.isPaused,
    session.pausedAtMs,
  );
  const isCardio = currentExercise?.template?.isCardio ?? false;
  const activeHrZones = currentExercise?.template?.targetHeartRateZones ?? [1, 2];

  const progressPercent = Math.round((completedCount / session.exercises.length) * 100);
  const nextExercise = session.exercises[session.currentExerciseIndex + 1];
  const isLastExercise = session.currentExerciseIndex >= session.exercises.length - 1;
  const blurTint = isDark ? 'dark' : 'light';

  const handleCompleteExercise = () => {
    void triggerHaptic('medium');
    void advanceExerciseOrFinish();
  };

  const handleExit = () => {
    Alert.alert(
      'Exit workout?',
      'Your progress for this session will not be saved.',
      [
        { text: 'Keep going', style: 'cancel' },
        {
          text: 'Exit',
          style: 'destructive',
          onPress: () => {
            void triggerHaptic('warning');
            cancelWorkout();
          },
        },
      ],
    );
  };

  const handleToggle = (exerciseId: string, setId: string) => {
    void triggerHaptic('selection');
    toggleSet(exerciseId, setId);
  };

  return (
    <Modal visible animationType="slide" presentationStyle="fullScreen">
      <View style={{ flex: 1, backgroundColor: healthTheme.background }}>
        {supportsNativeBlur() ? (
          <BlurView intensity={24} tint={blurTint} style={StyleSheet.absoluteFill} />
        ) : null}

        <View
          style={{
            paddingTop: insets.top + 8,
            paddingBottom: insets.bottom + 8,
            flex: 1,
            paddingHorizontal: 16,
          }}
        >
          <View style={{ marginBottom: 12, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Pressable
                onPress={handleExit}
                style={{
                  marginBottom: 8,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                  alignSelf: 'flex-start',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 999,
                  backgroundColor: healthTheme.card,
                  borderWidth: 1,
                  borderColor: healthTheme.cardBorder,
                }}
              >
                <X color="#E11D48" size={14} strokeWidth={2.5} />
                <Text style={{ fontSize: 12, fontWeight: '600', color: '#E11D48' }}>Exit</Text>
              </Pressable>
              <Text style={{ fontSize: 28, fontWeight: '900', color: healthTheme.ink }}>{session.focusName}</Text>
              <Text style={{ marginTop: 4, fontSize: 22, fontWeight: '800', color: healthTheme.accent }}>
                {formatTimer(elapsedSec)}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: healthTheme.slate, textTransform: 'uppercase', letterSpacing: 1.5 }}>
                Exercise {session.currentExerciseIndex + 1} of {session.exercises.length}
              </Text>
            </View>
          </View>

          <View style={{ flex: 1, minHeight: 0 }}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingBottom: 16 }}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
            >
              <HealthProgressBar
                label="Overall Progress"
                meta={`${progressPercent}%`}
                progress={progressPercent}
              />

              <PremiumCard padding={12} style={{ marginTop: 12, marginBottom: 12 }}>
                <MuscleMapHighlighter
                  highlight={muscleHighlight}
                  compact
                  layout="dual"
                  centerContent={
                    <>
                      <Text
                        className="text-center text-base font-bold text-ethereal-ink"
                        numberOfLines={3}
                      >
                        {currentExercise?.name}
                      </Text>
                      {currentExercise?.template ? (
                        <Text className="mt-1 text-center text-xs text-ethereal-slate">
                          {formatExerciseSubtitle(currentExercise.template)}
                        </Text>
                      ) : null}
                      {isCardio ? (
                        <Pressable
                          onPress={() => setShowHrCard((value) => !value)}
                          className="mt-2 flex-row items-center justify-center gap-1 active:opacity-80"
                        >
                          <Text className="text-xs font-semibold text-obsidian-primary">
                            Heart rate zones {activeHrZones.join('–')}
                          </Text>
                          {showHrCard ? (
                            <ChevronUp color={healthTheme.accent} size={14} />
                          ) : (
                            <ChevronDown color={healthTheme.accent} size={14} />
                          )}
                        </Pressable>
                      ) : null}
                    </>
                  }
                />
              </PremiumCard>

              {isCardio && showHrCard ? (
                <View style={{ marginBottom: 12 }}>
                  <HeartRateZonesCard profile={heartRateProfile} activeZones={activeHrZones} compact />
                </View>
              ) : null}

              {currentExercise?.sets.map((set, setIndex) => (
                <SetRow
                  key={set.id}
                  setIndex={setIndex}
                  weightKg={set.weightKg}
                  reps={set.reps}
                  completed={set.completed}
                  repsTarget={currentExercise.template?.repsTarget ?? '—'}
                  onToggle={() => handleToggle(currentExercise.id, set.id)}
                  onWeightDelta={(delta) => adjustSetWeight(currentExercise.id, set.id, delta)}
                  onRepsDelta={(delta) => adjustSetReps(currentExercise.id, set.id, delta)}
                />
              ))}

              {nextExercise ? (
                <PremiumCard padding={14}>
                  <Text style={{ fontSize: 10, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', color: healthTheme.slate }}>
                    Next Exercise
                  </Text>
                  <Text style={{ marginTop: 4, fontSize: 15, fontWeight: '700', color: healthTheme.ink }}>
                    {nextExercise.name}
                  </Text>
                </PremiumCard>
              ) : null}

              {showExerciseList ? (
                <PremiumCard padding={14} style={{ marginTop: 8 }}>
                  <Text style={{ fontSize: 10, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', color: healthTheme.slate, marginBottom: 10 }}>
                    All Exercises
                  </Text>
                  {session.exercises.map((exercise, index) => (
                    <Pressable
                      key={exercise.id}
                      onPress={() => {
                        selectExercise(index);
                        setShowExerciseList(false);
                      }}
                      style={{
                        marginBottom: 8,
                        padding: 10,
                        borderRadius: 12,
                        backgroundColor: index === session.currentExerciseIndex ? healthTheme.accentSoft : 'transparent',
                      }}
                    >
                      <Text style={{ fontSize: 14, fontWeight: '600', color: healthTheme.ink }}>
                        {index + 1}. {exercise.name}
                      </Text>
                    </Pressable>
                  ))}
                </PremiumCard>
              ) : null}
            </ScrollView>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 }}>
            <Pressable
              onPress={goToPreviousExercise}
              style={styles.iconBtn}
            >
              <ChevronLeft color={healthTheme.accent} size={20} />
            </Pressable>

            <Pressable
              onPress={() => setShowExerciseList((value) => !value)}
              style={[styles.iconBtn, { flex: 1, flexDirection: 'row', gap: 6 }]}
            >
              <List color={healthTheme.accent} size={16} />
              <Text style={{ fontSize: 12, fontWeight: '600', color: healthTheme.ink }}>List</Text>
            </Pressable>

            <Pressable onPress={togglePause} style={styles.iconBtn}>
              {session.isPaused ? (
                <Play color={healthTheme.accent} size={18} />
              ) : (
                <Pause color={healthTheme.accent} size={18} />
              )}
            </Pressable>

            <Pressable onPress={goToNextExercise} style={styles.iconBtn}>
              <ChevronRight color={healthTheme.accent} size={20} />
            </Pressable>
          </View>

          <View style={{ marginTop: 12 }}>
            <HealthPrimaryButton
              label={isLastExercise ? 'Finish Workout' : 'Complete Exercise'}
              onPress={handleCompleteExercise}
              icon={<Check color={healthTheme.ink} size={16} />}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}
