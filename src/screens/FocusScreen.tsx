import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Brain, Coffee, Pause, Play, RotateCcw, Sparkles, Timer, Zap } from 'lucide-react-native';
import { useMemo } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';

import { IsolatedScrollView, IsolatedScreenShell } from '../components/layout/IsolatedScreenShell';
import { ScreenHeader } from '../components/ui/ScreenHeader';
import { useFocusTimer } from '../hooks/useFocusTimer';
import { supportsNativeBlur } from '../lib/platform/blur';
import { useIsolatedScreenInsets } from '../navigation/hooks/useFloatingTabBarStyles';
import { useGamificationStore } from '../stores/useGamificationStore';
import { useProfileModuleStore } from '../stores/useProfileModuleStore';
import { BRAND } from '../theme/designTokens';
import { useTheme } from '../theme/ThemeContext';
import { FOCUS_MODE_PRESETS, type FocusSessionType } from '../types/focus';

const OUTER_RING = 300;
const MID_RING = 264;
const INNER_RING = 228;
const STROKE_OUTER = 6;
const STROKE_MID = 8;
const STROKE_INNER = 10;

const PRESET_META: Record<
  FocusSessionType,
  { icon: typeof Brain; subtitle: string; accent: string }
> = {
  focus: {
    icon: Brain,
    subtitle: 'Deep work · zero distractions',
    accent: BRAND.primary,
  },
  short_break: {
    icon: Coffee,
    subtitle: 'Micro reset · breathe & stretch',
    accent: '#34D399',
  },
  long_break: {
    icon: Sparkles,
    subtitle: 'Full recharge · step away',
    accent: '#818CF8',
  },
};

function formatDuration(seconds: number): string {
  const minutes = Math.round(seconds / 60);
  return `${minutes} min`;
}

function AmbientOrb({
  size,
  color,
  top,
  left,
  delay = 0,
}: {
  size: number;
  color: string;
  top: number;
  left: number;
  delay?: number;
}) {
  const style = useAnimatedStyle(() => ({
    opacity: withRepeat(
      withSequence(
        withTiming(0.55, { duration: 2800 + delay, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.18, { duration: 2800 + delay, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    ),
    transform: [
      {
        scale: withRepeat(
          withSequence(
            withTiming(1.08, { duration: 3200 + delay, easing: Easing.inOut(Easing.sin) }),
            withTiming(0.92, { duration: 3200 + delay, easing: Easing.inOut(Easing.sin) }),
          ),
          -1,
          true,
        ),
      },
    ],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          top,
          left,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
}

function FocusRing({
  size,
  stroke,
  progress,
  trackColor,
  gradientId,
  gradientColors,
}: {
  size: number;
  stroke: number;
  progress: number;
  trackColor: string;
  gradientId: string;
  gradientColors: [string, string];
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  return (
    <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
      <Defs>
        <SvgGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={gradientColors[0]} />
          <Stop offset="100%" stopColor={gradientColors[1]} />
        </SvgGradient>
      </Defs>
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={trackColor}
        strokeWidth={stroke}
        fill="transparent"
      />
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={`url(#${gradientId})`}
        strokeWidth={stroke}
        fill="transparent"
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
        rotation={-90}
        origin={`${size / 2}, ${size / 2}`}
      />
    </Svg>
  );
}

export function FocusScreen() {
  const { theme, isDark } = useTheme();
  const { scrollPaddingBottom } = useIsolatedScreenInsets();
  const closeModule = useProfileModuleStore((s) => s.closeModule);
  const focusHours = useGamificationStore((s) => Number(s.profile?.focus_hours ?? 0));
  const daysActive = useGamificationStore((s) => s.profile?.days_active ?? 0);

  const {
    sessionType,
    status,
    formattedTime,
    progressPercent,
    crystalAnimatedStyle,
    preset,
    setSessionType,
    start,
    pause,
    reset,
  } = useFocusTimer();

  const isRunning = status === 'running';
  const isPaused = status === 'paused';
  const isCompleted = status === 'completed';
  const meta = PRESET_META[sessionType];
  const PresetIcon = meta.icon;

  const statusLabel = useMemo(() => {
    if (isCompleted) return 'Session Complete';
    if (isRunning) return 'In Flow';
    if (isPaused) return 'Paused';
    return 'Ready';
  }, [isCompleted, isPaused, isRunning]);

  const phaseCopy = useMemo(() => {
    if (isCompleted) {
      return sessionType === 'focus'
        ? 'Crystal charged · +40 EXP awarded'
        : 'Break complete · return when ready';
    }
    if (sessionType === 'focus') {
      return 'Lock in. The crystal pulses with your focus rhythm.';
    }
    if (sessionType === 'short_break') {
      return 'Breathe. Let your mind decompress before the next sprint.';
    }
    return 'Full reset. Hydrate, move, and come back sharper.';
  }, [isCompleted, sessionType]);

  const ringGradients = useMemo(
    () =>
      sessionType === 'focus'
        ? ([theme.primaryNeon, theme.primary] as [string, string])
        : sessionType === 'short_break'
          ? (['#6EE7B7', '#34D399'] as [string, string])
          : (['#A5B4FC', '#818CF8'] as [string, string]),
    [sessionType, theme.primary, theme.primaryNeon],
  );

  const styles = useMemo(
    () =>
      StyleSheet.create({
        ambientLayer: {
          ...StyleSheet.absoluteFill,
          overflow: 'hidden',
        },
        glassDeck: {
          borderRadius: 28,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: isDark ? 'rgba(149, 128, 232, 0.22)' : 'rgba(119, 93, 216, 0.16)',
          marginBottom: 18,
          position: 'relative',
        },
        glassInner: {
          padding: 16,
          backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.55)',
        },
        presetRow: {
          flexDirection: 'row',
          gap: 10,
          marginBottom: 22,
        },
        presetCard: {
          flex: 1,
          borderRadius: 20,
          overflow: 'hidden',
          borderWidth: 1.5,
          minHeight: 108,
        },
        presetCardActive: {
          borderColor: theme.primaryNeon,
          shadowColor: theme.primaryNeon,
          shadowOpacity: 0.35,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 4 },
        },
        presetCardIdle: {
          borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(119, 93, 216, 0.12)',
        },
        presetBody: {
          flex: 1,
          padding: 12,
          justifyContent: 'space-between',
        },
        presetLabel: {
          fontSize: 11,
          fontWeight: '800',
          letterSpacing: 1.4,
          textTransform: 'uppercase',
        },
        presetDuration: {
          marginTop: 6,
          fontSize: 18,
          fontWeight: '900',
        },
        timerShell: {
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 8,
        },
        ringStage: {
          width: OUTER_RING,
          height: OUTER_RING,
          alignItems: 'center',
          justifyContent: 'center',
        },
        statusPill: {
          alignSelf: 'center',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          paddingHorizontal: 14,
          paddingVertical: 7,
          borderRadius: 999,
          borderWidth: 1,
          marginBottom: 18,
        },
        statusText: {
          fontSize: 11,
          fontWeight: '800',
          letterSpacing: 2,
          textTransform: 'uppercase',
        },
        timerText: {
          fontSize: 58,
          fontWeight: '900',
          letterSpacing: -2,
          fontVariant: ['tabular-nums'],
        },
        phaseText: {
          marginTop: 10,
          textAlign: 'center',
          fontSize: 14,
          fontWeight: '600',
          lineHeight: 22,
          paddingHorizontal: 12,
        },
        statsRow: {
          flexDirection: 'row',
          gap: 10,
          marginBottom: 22,
        },
        statCard: {
          flex: 1,
          borderRadius: 18,
          padding: 14,
          borderWidth: 1,
          borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(119, 93, 216, 0.12)',
          backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.62)',
        },
        statKicker: {
          fontSize: 10,
          fontWeight: '700',
          letterSpacing: 1.6,
          textTransform: 'uppercase',
          color: theme.textMuted,
        },
        statValue: {
          marginTop: 6,
          fontSize: 22,
          fontWeight: '900',
          color: theme.textPrimary,
        },
        controls: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 18,
          marginTop: 8,
        },
        controlSecondary: {
          width: 58,
          height: 58,
          borderRadius: 29,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: isDark ? 'rgba(149, 128, 232, 0.28)' : 'rgba(119, 93, 216, 0.2)',
          backgroundColor: isDark ? 'rgba(119, 93, 216, 0.12)' : 'rgba(119, 93, 216, 0.08)',
        },
        controlPrimary: {
          width: 78,
          height: 78,
          borderRadius: 39,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: theme.primaryNeon,
          shadowOpacity: 0.45,
          shadowRadius: 22,
          shadowOffset: { width: 0, height: 6 },
        },
        controlCaption: {
          marginTop: 14,
          textAlign: 'center',
          fontSize: 12,
          fontWeight: '600',
          color: theme.textMuted,
        },
      }),
    [isDark, theme],
  );

  return (
    <IsolatedScreenShell>
      <View style={styles.ambientLayer} pointerEvents="none">
        <AmbientOrb
          size={220}
          color={isDark ? 'rgba(119, 93, 216, 0.18)' : 'rgba(226, 217, 255, 0.65)'}
          top={40}
          left={-40}
        />
        <AmbientOrb
          size={180}
          color={isDark ? 'rgba(129, 140, 248, 0.14)' : 'rgba(129, 140, 248, 0.22)'}
          top={280}
          left={220}
          delay={400}
        />
        <AmbientOrb
          size={140}
          color={isDark ? 'rgba(52, 211, 153, 0.1)' : 'rgba(52, 211, 153, 0.16)'}
          top={520}
          left={-20}
          delay={800}
        />
      </View>

      <IsolatedScrollView
        horizontalPadding={18}
        contentContainerStyle={{ paddingBottom: scrollPaddingBottom }}
      >
        <ScreenHeader title="Focus Protocol" subtitle="Pomodoro · Deep Work Engine" onBack={closeModule} />

        <View style={styles.presetRow}>
          {FOCUS_MODE_PRESETS.map((item, index) => {
            const active = sessionType === item.id;
            const itemMeta = PRESET_META[item.id];
            const Icon = itemMeta.icon;

            const PresetWrapper = Platform.OS === 'ios' ? Animated.View : View;
            const presetWrapperProps =
              Platform.OS === 'ios'
                ? { entering: FadeInDown.delay(index * 80).duration(420) }
                : {};

            return (
              <PresetWrapper key={item.id} {...presetWrapperProps}>
                <Pressable
                  onPress={() => setSessionType(item.id)}
                  style={[styles.presetCard, active ? styles.presetCardActive : styles.presetCardIdle]}
                >
                  <LinearGradient
                    colors={
                      active
                        ? isDark
                          ? ['rgba(119, 93, 216, 0.32)', 'rgba(99, 102, 241, 0.18)']
                          : ['rgba(119, 93, 216, 0.18)', 'rgba(255,255,255,0.72)']
                        : isDark
                          ? ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']
                          : ['rgba(255,255,255,0.72)', 'rgba(255,255,255,0.45)']
                    }
                    style={styles.presetBody}
                  >
                    <Icon color={active ? itemMeta.accent : theme.textMuted} size={18} />
                    <View>
                      <Text
                        style={[
                          styles.presetLabel,
                          { color: active ? theme.textPrimary : theme.textMuted },
                        ]}
                      >
                        {item.label}
                      </Text>
                      <Text
                        style={[
                          styles.presetDuration,
                          { color: active ? theme.textPrimary : theme.textSecondary },
                        ]}
                      >
                        {formatDuration(item.durationSeconds)}
                      </Text>
                    </View>
                  </LinearGradient>
                </Pressable>
              </PresetWrapper>
            );
          })}
        </View>

        <View style={styles.glassDeck}>
          {supportsNativeBlur() ? (
            <BlurView
              intensity={isDark ? 28 : 18}
              tint={isDark ? 'dark' : 'light'}
              style={StyleSheet.absoluteFill}
            />
          ) : null}
          <View style={styles.glassInner}>
              <View
                style={[
                  styles.statusPill,
                  {
                    borderColor: isRunning
                      ? `${meta.accent}66`
                      : isDark
                        ? 'rgba(255,255,255,0.1)'
                        : 'rgba(119, 93, 216, 0.14)',
                    backgroundColor: isRunning ? `${meta.accent}18` : 'transparent',
                  },
                ]}
              >
                {isRunning ? <Zap color={meta.accent} size={12} /> : <Timer color={theme.textMuted} size={12} />}
                <Text style={[styles.statusText, { color: isRunning ? meta.accent : theme.textMuted }]}>
                  {statusLabel}
                </Text>
              </View>

              <View style={styles.timerShell}>
                <View style={styles.ringStage}>
                  <FocusRing
                    size={OUTER_RING}
                    stroke={STROKE_OUTER}
                    progress={progressPercent}
                    trackColor={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(119, 93, 216, 0.08)'}
                    gradientId="focusOuter"
                    gradientColors={[`${ringGradients[0]}55`, `${ringGradients[1]}33`]}
                  />
                  <FocusRing
                    size={MID_RING}
                    stroke={STROKE_MID}
                    progress={progressPercent}
                    trackColor={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(119, 93, 216, 0.1)'}
                    gradientId="focusMid"
                    gradientColors={ringGradients}
                  />
                  <FocusRing
                    size={INNER_RING}
                    stroke={STROKE_INNER}
                    progress={progressPercent}
                    trackColor={theme.ringTrack}
                    gradientId="focusInner"
                    gradientColors={[theme.primaryNeon, theme.secondary]}
                  />

                  <Animated.View style={crystalAnimatedStyle}>
                    <LinearGradient
                      colors={[theme.primaryNeon, theme.primary, theme.secondary]}
                      start={{ x: 0.15, y: 0 }}
                      end={{ x: 0.95, y: 1 }}
                      style={{
                        width: 76,
                        height: 76,
                        borderRadius: 22,
                        transform: [{ rotate: '45deg' }],
                        shadowColor: theme.primaryNeon,
                        shadowOpacity: 0.5,
                        shadowRadius: 28,
                        shadowOffset: { width: 0, height: 0 },
                      }}
                    />
                  </Animated.View>
                </View>

                <Animated.Text
                  entering={Platform.OS === 'ios' ? FadeIn.duration(500) : undefined}
                  style={[
                    styles.timerText,
                    {
                      color: theme.textPrimary,
                      textShadowColor: isDark ? theme.glowPurple : 'transparent',
                      textShadowRadius: isDark ? 16 : 0,
                      textShadowOffset: { width: 0, height: 0 },
                    },
                  ]}
                >
                  {formattedTime}
                </Animated.Text>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 }}>
                  <PresetIcon color={meta.accent} size={14} />
                  <Text style={{ fontSize: 13, fontWeight: '700', color: theme.textSecondary }}>
                    {preset.label} · {meta.subtitle}
                  </Text>
                </View>

                <Text style={[styles.phaseText, { color: theme.textMuted }]}>{phaseCopy}</Text>
              </View>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statKicker}>Focus Hours</Text>
            <Text style={styles.statValue}>{focusHours.toFixed(1)}h</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statKicker}>Active Days</Text>
            <Text style={styles.statValue}>{daysActive}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statKicker}>Progress</Text>
            <Text style={styles.statValue}>{Math.round(progressPercent * 100)}%</Text>
          </View>
        </View>

        <View style={styles.controls}>
          <Pressable onPress={reset} style={styles.controlSecondary} accessibilityLabel="Reset timer">
            <RotateCcw color={theme.primary} size={22} />
          </Pressable>

          <Pressable
            onPress={isRunning ? pause : start}
            accessibilityLabel={isRunning ? 'Pause timer' : 'Start timer'}
          >
            <LinearGradient
              colors={[theme.primaryNeon, theme.primary, '#6366F1']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.controlPrimary}
            >
              {isRunning ? (
                <Pause color={theme.textPrimary} size={30} fill={theme.textPrimary} />
              ) : (
                <Play color={theme.textPrimary} size={30} fill={theme.textPrimary} />
              )}
            </LinearGradient>
          </Pressable>
        </View>

        <Text style={styles.controlCaption}>
          {isRunning
            ? 'Tap pause to suspend the protocol'
            : isCompleted
              ? 'Tap play to begin a new cycle'
              : 'Tap play to initiate focus protocol'}
        </Text>
      </IsolatedScrollView>
    </IsolatedScreenShell>
  );
}
