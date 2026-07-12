import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Ellipse } from 'react-native-svg';

import { timingLoop } from '../../theme/motion';
import { useTheme } from '../../theme/ThemeContext';
import { AuthBrandCrystal } from './AuthBrandCrystal';

const AnimatedSvg = Animated.createAnimatedComponent(Svg);

export function AuthHeroMark() {
  const { theme, isDark } = useTheme();
  const floatY = useSharedValue(0);
  const ringRotate = useSharedValue(0);
  const pulse = useSharedValue(1);

  useEffect(() => {
    floatY.value = withRepeat(
      withSequence(
        withTiming(-6, timingLoop(4200)),
        withTiming(6, timingLoop(4200)),
      ),
      -1,
      true,
    );
    ringRotate.value = withRepeat(
      withTiming(360, { duration: 28000, easing: Easing.linear }),
      -1,
      false,
    );
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.04, timingLoop(3600)),
        withTiming(0.96, timingLoop(3600)),
      ),
      -1,
      true,
    );
  }, [floatY, pulse, ringRotate]);

  const crystalStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }, { scale: pulse.value }],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${ringRotate.value}deg` }],
  }));

  const ringColor = isDark ? 'rgba(149, 128, 232, 0.35)' : 'rgba(119, 93, 216, 0.22)';
  const orbitColor = isDark ? 'rgba(149, 128, 232, 0.18)' : 'rgba(119, 93, 216, 0.14)';

  return (
    <View style={styles.root}>
      <AnimatedSvg
        width={220}
        height={220}
        viewBox="0 0 220 220"
        style={[styles.rings, ringStyle]}
      >
        <Ellipse cx={110} cy={110} rx={98} ry={38} stroke={orbitColor} strokeWidth={1} fill="none" />
        <Ellipse cx={110} cy={110} rx={78} ry={78} stroke={ringColor} strokeWidth={1.2} fill="none" strokeDasharray="4 10" />
        <Circle cx={110} cy={18} r={4} fill={isDark ? '#B8A8F8' : '#775DD8'} opacity={0.85} />
        <Circle cx={202} cy={110} r={3} fill={isDark ? '#9580E8' : '#6366F1'} opacity={0.55} />
      </AnimatedSvg>

      <Animated.View style={[styles.crystalWrap, crystalStyle]}>
        <View style={styles.crystalHalo} />
        <AuthBrandCrystal size={92} />
      </Animated.View>

      <View style={styles.copy}>
        <View style={styles.wordmarkRow}>
          <Text style={[styles.wordmark, { color: theme.ink }]}>Track</Text>
          <Text style={[styles.wordmark, styles.wordmarkAccent, { color: theme.primary }]}>It</Text>
        </View>
        <Text style={[styles.tagline, { color: theme.textSecondary }]}>Your personal Life OS</Text>
        <View style={styles.pillRow}>
          {['Focus', 'Health', 'Clarity'].map((item) => (
            <View
              key={item}
              style={[
                styles.pill,
                {
                  backgroundColor: isDark ? 'rgba(149, 128, 232, 0.14)' : 'rgba(255, 255, 255, 0.62)',
                  borderColor: isDark ? 'rgba(149, 128, 232, 0.28)' : 'rgba(119, 93, 216, 0.12)',
                },
              ]}
            >
              <Text style={[styles.pillText, { color: theme.textMuted }]}>{item}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 12,
  },
  rings: {
    position: 'absolute',
    top: 0,
  },
  crystalWrap: {
    marginTop: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  crystalHalo: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(119, 93, 216, 0.16)',
  },
  copy: {
    marginTop: 22,
    alignItems: 'center',
  },
  wordmarkRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  wordmark: {
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  wordmarkAccent: {
    marginLeft: 1,
  },
  tagline: {
    marginTop: 6,
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  pillRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
