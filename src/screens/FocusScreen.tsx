import { LinearGradient } from 'expo-linear-gradient';
import { Pause, Play, RotateCcw } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';

import { IsolatedScreenShell } from '../components/layout/IsolatedScreenShell';
import { ScreenHeader } from '../components/ui/ScreenHeader';
import { FOCUS_MODE_PRESETS } from '../types/focus';
import { useFocusTimer } from '../hooks/useFocusTimer';
import { useIsolatedScreenInsets } from '../navigation/hooks/useFloatingTabBarStyles';
import { useProfileModuleStore } from '../stores/useProfileModuleStore';
import { useTheme } from '../theme/ThemeContext';

const RING_SIZE = 280;
const STROKE = 10;
const RADIUS = (RING_SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function FocusScreen() {
  const { theme } = useTheme();
  const { scrollPaddingBottom } = useIsolatedScreenInsets();
  const closeModule = useProfileModuleStore((s) => s.closeModule);
  const {
    sessionType,
    status,
    formattedTime,
    progressPercent,
    crystalAnimatedStyle,
    setSessionType,
    start,
    pause,
    reset,
  } = useFocusTimer();

  const dashOffset = CIRCUMFERENCE * (1 - progressPercent);
  const isRunning = status === 'running';
  const isCompleted = status === 'completed';

  return (
    <IsolatedScreenShell style={{ paddingHorizontal: 18, paddingBottom: scrollPaddingBottom }}>
      <ScreenHeader title="FOCUS MODE" subtitle="Deep Work Protocol" onBack={closeModule} />

      <View className="mb-8 flex-row rounded-2xl p-1" style={{ backgroundColor: `${theme.primary}14` }}>
        {FOCUS_MODE_PRESETS.map((preset) => {
          const active = sessionType === preset.id;
          return (
            <Pressable
              key={preset.id}
              onPress={() => setSessionType(preset.id)}
              className="flex-1 rounded-xl py-2.5 active:opacity-85"
              style={active ? { backgroundColor: theme.primary } : undefined}
            >
              <Text
                className="text-center text-[10px] font-bold uppercase tracking-wider"
                style={{ color: active ? theme.textPrimary : theme.textMuted }}
              >
                {preset.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View className="flex-1 items-center justify-center">
        <View style={{ width: RING_SIZE, height: RING_SIZE, alignItems: 'center', justifyContent: 'center' }}>
          <Svg width={RING_SIZE} height={RING_SIZE} style={{ position: 'absolute' }}>
            <Defs>
              <SvgGradient id="focusRing" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor={theme.primaryNeon} />
                <Stop offset="100%" stopColor={theme.primary} />
              </SvgGradient>
            </Defs>
            <Circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RADIUS}
              stroke={theme.ringTrack}
              strokeWidth={STROKE}
              fill="transparent"
            />
            <Circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RADIUS}
              stroke="url(#focusRing)"
              strokeWidth={STROKE}
              fill="transparent"
              strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              rotation={-90}
              origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
            />
          </Svg>

          <Animated.View style={crystalAnimatedStyle}>
            <LinearGradient
              colors={[theme.primaryNeon, theme.primary, theme.secondary]}
              start={{ x: 0.2, y: 0 }}
              end={{ x: 0.9, y: 1 }}
              style={{
                width: 88,
                height: 88,
                borderRadius: 24,
                transform: [{ rotate: '45deg' }],
                shadowColor: theme.primaryNeon,
                shadowOpacity: 0.45,
                shadowRadius: 24,
                shadowOffset: { width: 0, height: 0 },
              }}
            />
          </Animated.View>
        </View>

        <Text
          className="mt-6 text-5xl font-black tracking-tight"
          style={{
            color: theme.textPrimary,
            textShadowColor: theme.glowPurple,
            textShadowRadius: 12,
            textShadowOffset: { width: 0, height: 0 },
          }}
        >
          {formattedTime}
        </Text>

        <Text className="mt-8 text-center text-sm font-semibold" style={{ color: theme.textMuted }}>
          {isCompleted
            ? 'Session complete — +40 EXP awarded'
            : sessionType === 'focus'
              ? 'Stay locked in. Crystal pulses with your focus.'
              : 'Recharge. Break time active.'}
        </Text>
      </View>

      <View className="flex-row items-center justify-center gap-4">
        <Pressable
          onPress={reset}
          className="h-14 w-14 items-center justify-center rounded-full active:opacity-85"
          style={{ backgroundColor: `${theme.primary}18` }}
        >
          <RotateCcw color={theme.primary} size={22} />
        </Pressable>

        <Pressable
          onPress={isRunning ? pause : start}
          className="h-16 w-16 items-center justify-center rounded-full active:opacity-90"
          style={{
            backgroundColor: theme.primary,
            shadowColor: theme.primaryNeon,
            shadowOpacity: 0.4,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 4 },
          }}
        >
          {isRunning ? (
            <Pause color={theme.textPrimary} size={26} fill={theme.textPrimary} />
          ) : (
            <Play color={theme.textPrimary} size={26} fill={theme.textPrimary} />
          )}
        </Pressable>
      </View>
    </IsolatedScreenShell>
  );
}
