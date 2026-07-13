import { Crown, X } from 'lucide-react-native';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { HEALTH_DISCLAIMER } from '../../constants/disclaimers';
import { useHealthTheme } from '../../hooks/useHealthTheme';
import { WORKOUT_GOAL_OPTIONS } from '../../constants/workoutGoals';
import { FREE_BUILTIN_PROGRAM_ID } from '../../constants/workoutFreeTier';
import { isAppFullyFree } from '../../constants/appAccess';
import { getWorkoutTrack } from '../../constants/workoutPrograms';
import { useAppSafeAreaInsets } from '../../hooks/useAppSafeAreaInsets';
import { useWorkoutProgramAccess } from '../../hooks/useWorkoutProgramAccess';
import { triggerHaptic } from '../../lib/platform/haptics';
import { useHealthStore } from '../../stores/useHealthStore';
import type { WorkoutTrackId } from '../../types/workout';
import { BRAND } from '../../theme/designTokens';
import { getThemedSurfaces } from '../../theme/themedSurfaces';
import { useTheme } from '../../theme/ThemeContext';
import { GlassPanel } from '../GlassPanel';

export function WorkoutGoalPickerModal() {
  const insets = useAppSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const healthTheme = useHealthTheme();
  const surfaces = getThemedSurfaces(theme, isDark);
  const visible = useHealthStore((s) => s.isWorkoutGoalPickerOpen);
  const selectedTrackId = useHealthStore((s) => s.selectedTrackId);
  const closeWorkoutGoalPicker = useHealthStore((s) => s.closeWorkoutGoalPicker);
  const beginWorkoutWithTrack = useHealthStore((s) => s.beginWorkoutWithTrack);
  const { trySelectBuiltinProgram, isProProgram } = useWorkoutProgramAccess();

  const handleSelect = (trackId: WorkoutTrackId) => {
    void triggerHaptic('medium');
    trySelectBuiltinProgram(trackId, () => beginWorkoutWithTrack(trackId));
  };

  if (!visible) {
    return null;
  }

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" transparent={false}>
      <View style={[styles.root, { backgroundColor: healthTheme.background }]}>
        <View
          style={[
            styles.content,
            {
              paddingTop: insets.top + 12,
              paddingBottom: insets.bottom + 16,
            },
          ]}
        >
          <View style={styles.headerRow}>
            <View style={styles.headerCopy}>
              <Text style={[styles.kicker, { color: healthTheme.slate }]}>Before you start</Text>
              <Text style={[styles.title, { color: healthTheme.ink }]}>Workout goal</Text>
              <Text style={[styles.subtitle, { color: healthTheme.slate }]}>
                Choose what this session is focused on — program and exercises will match your
                goal.
              </Text>
              <Text style={[styles.disclaimer, { color: healthTheme.slate }]}>{HEALTH_DISCLAIMER}</Text>
            </View>
            <Pressable
              onPress={closeWorkoutGoalPicker}
              accessibilityRole="button"
              accessibilityLabel="Close"
              style={[
                styles.closeButton,
                {
                  backgroundColor: surfaces.chipStrong,
                  borderColor: healthTheme.cardBorder,
                },
              ]}
            >
              <X color={healthTheme.ink} size={18} strokeWidth={2.2} />
            </Pressable>
          </View>

          <View style={styles.options}>
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
                  style={({ pressed }) => [pressed && styles.optionPressed]}
                >
                  <GlassPanel
                    borderRadius={22}
                    style={{
                      borderWidth: isSuggested ? 1 : 0,
                      borderColor: isSuggested ? `${BRAND.primary}66` : 'transparent',
                      opacity: requiresPro ? 0.92 : 1,
                    }}
                  >
                    <View style={styles.optionRow}>
                      <View
                        style={[styles.iconWrap, { backgroundColor: healthTheme.accentSoft }]}
                      >
                        <GoalIcon color={healthTheme.accent} size={22} strokeWidth={2} />
                      </View>
                      <View style={styles.optionCopy}>
                        <View style={styles.titleRow}>
                          <Text style={[styles.optionTitle, { color: healthTheme.ink }]}>
                            {option.title}
                          </Text>
                          {requiresPro && !isAppFullyFree() ? (
                            <View
                              style={[styles.proBadge, { backgroundColor: healthTheme.accentSoft }]}
                            >
                              <Crown color={healthTheme.accent} size={10} strokeWidth={2.4} />
                              <Text style={[styles.proBadgeText, { color: healthTheme.accent }]}>
                                Pro
                              </Text>
                            </View>
                          ) : null}
                          {isFreeProgram && !isAppFullyFree() ? (
                            <View style={styles.freeBadge}>
                              <Text style={styles.freeBadgeText}>Free</Text>
                            </View>
                          ) : null}
                        </View>
                        <Text style={[styles.optionSubtitle, { color: healthTheme.slate }]}>
                          {option.subtitle}
                        </Text>
                        <Text style={[styles.optionMeta, { color: healthTheme.muted }]}>
                          {track.title} · {track.durationWeeks === 1 ? '8 days' : `${track.durationWeeks} wk`}
                        </Text>
                      </View>
                      {isSuggested ? (
                        <View
                          style={[styles.lastBadge, { backgroundColor: healthTheme.accentSoft }]}
                        >
                          <Text style={[styles.lastBadgeText, { color: healthTheme.accent }]}>
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

          <Pressable onPress={closeWorkoutGoalPicker} style={styles.dismiss}>
            <Text style={[styles.dismissText, { color: healthTheme.slate }]}>Not now</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  headerCopy: {
    flex: 1,
    paddingRight: 12,
  },
  kicker: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 2.8,
  },
  title: {
    marginTop: 4,
    fontSize: 24,
    fontWeight: '900',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
  },
  disclaimer: {
    marginTop: 10,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '500',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  options: {
    gap: 12,
  },
  optionPressed: {
    opacity: 0.92,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionCopy: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  proBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  freeBadge: {
    borderRadius: 999,
    backgroundColor: 'rgba(52, 211, 153, 0.18)',
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  freeBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: '#34D399',
  },
  optionSubtitle: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 16,
  },
  optionMeta: {
    marginTop: 8,
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  lastBadge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  lastBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  dismiss: {
    marginTop: 'auto',
    paddingTop: 24,
  },
  dismissText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
});
