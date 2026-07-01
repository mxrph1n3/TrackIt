import * as Haptics from 'expo-haptics';
import { Crown, X } from 'lucide-react-native';
import { Modal, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { WORKOUT_GOAL_OPTIONS } from '../../constants/workoutGoals';
import { FREE_BUILTIN_PROGRAM_ID } from '../../constants/workoutFreeTier';
import { getWorkoutTrack } from '../../constants/workoutPrograms';
import { useWorkoutProgramAccess } from '../../hooks/useWorkoutProgramAccess';
import { useHealthStore } from '../../stores/useHealthStore';
import type { WorkoutTrackId } from '../../types/workout';
import { BRAND } from '../../theme/designTokens';
import { getThemedSurfaces } from '../../theme/themedSurfaces';
import { useTheme } from '../../theme/ThemeContext';
import { GlassPanel } from '../GlassPanel';

export function WorkoutGoalPickerModal() {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const surfaces = getThemedSurfaces(theme, isDark);
  const visible = useHealthStore((s) => s.isWorkoutGoalPickerOpen);
  const selectedTrackId = useHealthStore((s) => s.selectedTrackId);
  const closeWorkoutGoalPicker = useHealthStore((s) => s.closeWorkoutGoalPicker);
  const beginWorkoutWithTrack = useHealthStore((s) => s.beginWorkoutWithTrack);
  const { trySelectBuiltinProgram, isProProgram } = useWorkoutProgramAccess();

  const handleSelect = (trackId: WorkoutTrackId) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    trySelectBuiltinProgram(trackId, () => beginWorkoutWithTrack(trackId));
  };

  if (!visible) {
    return null;
  }

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" transparent={false}>
      <View className="flex-1 bg-ethereal-base">
        <View
          style={{
            paddingTop: insets.top + 12,
            paddingBottom: insets.bottom + 16,
            paddingHorizontal: 20,
          }}
          className="flex-1"
        >
          <View className="mb-6 flex-row items-start justify-between">
            <View className="flex-1 pr-3">
              <Text className="text-[10px] font-bold uppercase tracking-[0.28em] text-ethereal-slate">
                Before you start
              </Text>
              <Text className="mt-1 text-2xl font-black text-ethereal-ink">Workout goal</Text>
              <Text className="mt-2 text-sm leading-5 text-ethereal-slate">
                Choose what this session is focused on — program and exercises will match your
                goal.
              </Text>
            </View>
            <Pressable
              onPress={closeWorkoutGoalPicker}
              accessibilityRole="button"
              accessibilityLabel="Close"
              className="h-10 w-10 items-center justify-center rounded-full border border-ethereal-glass-border active:opacity-85"
              style={{ backgroundColor: surfaces.chipStrong }}
            >
              <X color={theme.textPrimary} size={18} strokeWidth={2.2} />
            </Pressable>
          </View>

          <View className="gap-3">
            {WORKOUT_GOAL_OPTIONS.map((option) => {
              const track = getWorkoutTrack(option.id);
              const isSuggested = option.id === selectedTrackId;
              const requiresPro = isProProgram(option.id);
              const isFreeProgram = option.id === FREE_BUILTIN_PROGRAM_ID;
              const GoalIcon = option.icon;

              return (
                <Pressable
                  key={option.id}
                  onPress={() => handleSelect(option.id)}
                  className="active:opacity-92"
                >
                  <GlassPanel
                    borderRadius={22}
                    style={{
                      borderWidth: isSuggested ? 1 : 0,
                      borderColor: isSuggested ? `${BRAND.primary}66` : 'transparent',
                      opacity: requiresPro ? 0.92 : 1,
                    }}
                  >
                    <View className="flex-row items-center gap-3 p-4">
                      <View className="h-11 w-11 items-center justify-center rounded-2xl bg-ethereal-neon/10">
                        <GoalIcon color={BRAND.primary} size={22} strokeWidth={2} />
                      </View>
                      <View className="flex-1">
                        <View className="flex-row items-center gap-2">
                          <Text className="text-base font-bold text-ethereal-ink">{option.title}</Text>
                          {requiresPro ? (
                            <View className="flex-row items-center gap-1 rounded-full bg-ethereal-neon/15 px-2 py-0.5">
                              <Crown color={BRAND.primary} size={10} strokeWidth={2.4} />
                              <Text className="text-[9px] font-bold uppercase text-ethereal-neon">Pro</Text>
                            </View>
                          ) : null}
                          {isFreeProgram ? (
                            <View className="rounded-full bg-emerald-500/15 px-2 py-0.5">
                              <Text className="text-[9px] font-bold uppercase text-emerald-600">Free</Text>
                            </View>
                          ) : null}
                        </View>
                        <Text className="mt-0.5 text-xs leading-4 text-ethereal-slate">
                          {option.subtitle}
                        </Text>
                        <Text className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-ethereal-slate">
                          {track.title} · {track.durationWeeks === 1 ? '8 days' : `${track.durationWeeks} wk`}
                        </Text>
                      </View>
                      {isSuggested ? (
                        <View className="rounded-full bg-ethereal-neon/15 px-2 py-1">
                          <Text className="text-[9px] font-bold uppercase text-ethereal-neon">
                            Last
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  </GlassPanel>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            onPress={closeWorkoutGoalPicker}
            className="mt-auto pt-6 active:opacity-85"
          >
            <Text className="text-center text-sm font-semibold text-ethereal-slate">Not now</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
