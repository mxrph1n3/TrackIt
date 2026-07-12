import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ImageBackground, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { getWorkoutAchieveImage } from '../../lib/themeAssets';
import { triggerHaptic } from '../../lib/platform/haptics';
import { BRAND } from '../../theme/designTokens';
import { MOTION_EASING } from '../../theme/motion';
import { useTheme } from '../../theme/ThemeContext';
import type { WorkoutCompletionSummary } from '../../types/health';

type WorkoutCompleteScreenProps = {
  summary: WorkoutCompletionSummary;
  onDismiss: () => void;
};

const XP_FONT_LIGHT = Platform.select({
  ios: 'HelveticaNeue-Thin',
  android: 'sans-serif-thin',
  default: 'System',
});

const XP_FONT_DARK = Platform.select({
  ios: 'AvenirNext-UltraLight',
  android: 'sans-serif-light',
  default: 'System',
});

const POSTER_ENTER_MS = 2200;
const XP_ENTER_DELAY_MS = 1100;
const XP_ENTER_MS = 1400;
const XP_COUNT_MS = 1200;
const DISMISS_UNLOCK_MS = 3400;

export function WorkoutCompleteScreen({ summary, onDismiss }: WorkoutCompleteScreenProps) {
  const { mode, isDark } = useTheme();
  const artwork = getWorkoutAchieveImage(mode);

  const [displayedXp, setDisplayedXp] = useState(0);
  const [canDismiss, setCanDismiss] = useState(false);
  const countFrameRef = useRef<number | null>(null);

  const posterOpacity = useSharedValue(0);
  const posterTranslateY = useSharedValue(96);
  const xpOpacity = useSharedValue(0);
  const xpTranslateY = useSharedValue(28);
  const xpScale = useSharedValue(0.92);
  const hintOpacity = useSharedValue(0);

  const unlockDismiss = useCallback(() => {
    setCanDismiss(true);
    hintOpacity.value = withTiming(1, { duration: 700, easing: MOTION_EASING.entrance });
  }, [hintOpacity]);

  const startXpCount = useCallback(() => {
    const target = summary.xpEarned;
    const startedAt = Date.now();

    const tick = () => {
      const progress = Math.min(1, (Date.now() - startedAt) / XP_COUNT_MS);
      const eased = 1 - (1 - progress) ** 3;
      setDisplayedXp(Math.round(target * eased));

      if (progress < 1) {
        countFrameRef.current = requestAnimationFrame(tick);
        return;
      }

      void triggerHaptic('success');
    };

    countFrameRef.current = requestAnimationFrame(tick);
  }, [summary.xpEarned]);

  useEffect(() => {
    setCanDismiss(false);
    setDisplayedXp(0);

    posterOpacity.value = 0;
    posterTranslateY.value = 96;
    xpOpacity.value = 0;
    xpTranslateY.value = 28;
    xpScale.value = 0.92;
    hintOpacity.value = 0;

    posterOpacity.value = withTiming(1, {
      duration: POSTER_ENTER_MS,
      easing: MOTION_EASING.entrance,
    });
    posterTranslateY.value = withTiming(0, {
      duration: POSTER_ENTER_MS,
      easing: MOTION_EASING.entrance,
    });

    xpOpacity.value = withDelay(
      XP_ENTER_DELAY_MS,
      withTiming(1, { duration: XP_ENTER_MS, easing: MOTION_EASING.entrance }),
    );
    xpTranslateY.value = withDelay(
      XP_ENTER_DELAY_MS,
      withTiming(0, { duration: XP_ENTER_MS, easing: Easing.out(Easing.cubic) }),
    );
    xpScale.value = withDelay(
      XP_ENTER_DELAY_MS,
      withTiming(1, { duration: XP_ENTER_MS, easing: MOTION_EASING.entrance }),
    );

    const countTimer = setTimeout(() => {
      startXpCount();
    }, XP_ENTER_DELAY_MS);

    const dismissTimer = setTimeout(() => {
      unlockDismiss();
    }, DISMISS_UNLOCK_MS);

    return () => {
      clearTimeout(countTimer);
      clearTimeout(dismissTimer);
      if (countFrameRef.current !== null) {
        cancelAnimationFrame(countFrameRef.current);
      }
    };
  }, [
    hintOpacity,
    posterOpacity,
    posterTranslateY,
    startXpCount,
    unlockDismiss,
    xpOpacity,
    xpScale,
    xpTranslateY,
  ]);

  const posterStyle = useAnimatedStyle(() => ({
    opacity: posterOpacity.value,
    transform: [{ translateY: posterTranslateY.value }],
  }));

  const xpStyle = useAnimatedStyle(() => ({
    opacity: xpOpacity.value,
    transform: [{ translateY: xpTranslateY.value }, { scale: xpScale.value }],
  }));

  const hintStyle = useAnimatedStyle(() => ({
    opacity: hintOpacity.value,
  }));

  const themeStyles = useMemo(
    () =>
      isDark
        ? {
            rootBg: '#07070A',
            gradient: ['rgba(7,7,10,0.08)', 'rgba(7,7,10,0)', 'rgba(7,7,10,0.42)'] as const,
            gradientLocations: [0, 0.55, 1] as const,
            xpFont: XP_FONT_DARK,
            xpSize: 52,
            xpLetterSpacing: 10,
            xpNumberColor: '#F5F3FF',
            xpSuffixColor: 'rgba(255,255,255,0.88)',
            xpNumberShadow: {
              textShadowColor: 'rgba(168, 85, 247, 0.85)',
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: 22,
            },
            xpSuffixShadow: {
              textShadowColor: 'rgba(119, 93, 216, 0.55)',
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: 14,
            },
            glow: 'rgba(168, 85, 247, 0.22)',
            ovalBg: 'rgba(168, 85, 247, 0.16)',
            ovalBorder: 'rgba(168, 85, 247, 0.38)',
            hintColor: 'rgba(255,255,255,0.55)',
          }
        : {
            rootBg: '#F3F5FA',
            gradient: ['rgba(255,255,255,0)', 'rgba(255,255,255,0.04)', 'rgba(255,255,255,0.2)'] as const,
            gradientLocations: [0, 0.78, 1] as const,
            xpFont: XP_FONT_LIGHT,
            xpSize: 38,
            xpLetterSpacing: 8,
            xpNumberColor: BRAND.primary,
            xpSuffixColor: '#3D3855',
            xpNumberShadow: {},
            xpSuffixShadow: {},
            glow: 'transparent',
            ovalBg: 'rgba(119, 93, 216, 0.08)',
            ovalBorder: 'rgba(119, 93, 216, 0.22)',
            hintColor: 'rgba(61, 56, 85, 0.55)',
          },
    [isDark],
  );

  const handlePress = () => {
    if (!canDismiss) {
      return;
    }
    void triggerHaptic('light');
    onDismiss();
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Workout complete. Plus ${summary.xpEarned} experience. Tap to continue.`}
      accessibilityState={{ disabled: !canDismiss }}
      onPress={handlePress}
      style={[styles.root, { backgroundColor: themeStyles.rootBg }]}
    >
      <Animated.View style={[styles.posterShell, posterStyle]}>
        <ImageBackground source={artwork} resizeMode="cover" style={styles.artwork}>
          <LinearGradient
            colors={[...themeStyles.gradient]}
            locations={[...themeStyles.gradientLocations]}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />

          <View style={styles.centerStage} pointerEvents="none">
            <Animated.View style={[styles.xpOvalWrap, xpStyle]}>
              <View
                style={[
                  styles.xpOval,
                  {
                    backgroundColor: themeStyles.ovalBg,
                    borderColor: themeStyles.ovalBorder,
                    shadowColor: isDark ? BRAND.primary : 'transparent',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.xpLine,
                    {
                      fontFamily: themeStyles.xpFont,
                      fontSize: themeStyles.xpSize,
                      lineHeight: themeStyles.xpSize + 6,
                      letterSpacing: themeStyles.xpLetterSpacing,
                      color: isDark ? '#FFFFFF' : '#1E1A3E',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.xpNumber,
                      {
                        fontFamily: themeStyles.xpFont,
                        fontSize: themeStyles.xpSize,
                        lineHeight: themeStyles.xpSize + 6,
                        letterSpacing: themeStyles.xpLetterSpacing - 1,
                        color: themeStyles.xpNumberColor,
                      },
                      themeStyles.xpNumberShadow,
                    ]}
                  >
                    +{displayedXp.toLocaleString('en-US')}
                  </Text>
                  <Text
                    style={[
                      styles.xpSuffix,
                      {
                        fontFamily: themeStyles.xpFont,
                        fontSize: themeStyles.xpSize,
                        lineHeight: themeStyles.xpSize + 6,
                        letterSpacing: themeStyles.xpLetterSpacing,
                        color: themeStyles.xpSuffixColor,
                      },
                      themeStyles.xpSuffixShadow,
                    ]}
                  >
                    {' '}
                    XP
                  </Text>
                </Text>
              </View>
            </Animated.View>
          </View>
        </ImageBackground>
      </Animated.View>

      <Animated.View style={[styles.hintWrap, hintStyle]} pointerEvents="none">
        <Text style={[styles.hint, { color: themeStyles.hintColor }]}>Tap to continue</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  posterShell: {
    flex: 1,
  },
  artwork: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  centerStage: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  xpOvalWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  xpOval: {
    minWidth: 248,
    height: 96,
    paddingHorizontal: 36,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.35,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 0 },
  },
  xpLine: {
    fontWeight: '200',
    textTransform: 'uppercase',
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  xpNumber: {
    fontWeight: '300',
  },
  xpSuffix: {
    fontWeight: '200',
  },
  hintWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 36,
    alignItems: 'center',
  },
  hint: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2.8,
    textTransform: 'uppercase',
  },
});
