import { useEffect, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { useHealthNavigation } from '../../../hooks/useHealthNavigation';
import { useHealthTheme } from '../../../hooks/useHealthTheme';
import { useHealthStore } from '../../../stores/useHealthStore';
import { MOTION_DURATION, timingProgress } from '../../../theme/motion';
import { PremiumCard } from '../ui/PremiumCard';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function CaloriesHeroCard() {
  const healthTheme = useHealthTheme();
  const dietPlan = useHealthStore((s) => s.dietPlan);
  const consumed = useHealthStore((s) => s.consumedMacros);
  const { push } = useHealthNavigation();

  const percent = Math.min(100, Math.round((consumed.calories / dietPlan.calories) * 100));
  const remaining = Math.max(0, dietPlan.calories - consumed.calories);

  const size = 120;
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const targetOffset = circumference * (1 - percent / 100);
  const animatedOffset = useSharedValue(circumference);

  useEffect(() => {
    animatedOffset.value = withTiming(targetOffset, timingProgress(MOTION_DURATION.reveal));
  }, [animatedOffset, targetOffset, circumference]);

  const ringProps = useAnimatedProps(() => ({
    strokeDashoffset: animatedOffset.value,
  }));

  const styles = useMemo(
    () =>
      StyleSheet.create({
        kicker: {
          fontSize: 11,
          fontWeight: '700',
          letterSpacing: 2,
          textTransform: 'uppercase',
          color: healthTheme.slate,
          marginBottom: 14,
        },
        row: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
        copy: {
          flex: 1,
          paddingRight: 12,
        },
        calorieRow: {
          flexDirection: 'row',
          alignItems: 'baseline',
          flexWrap: 'wrap',
        },
        current: {
          fontSize: 36,
          fontWeight: '900',
          color: healthTheme.ink,
          letterSpacing: -1.2,
        },
        target: {
          fontSize: 18,
          fontWeight: '600',
          color: healthTheme.slate,
        },
        remaining: {
          marginTop: 8,
          fontSize: 14,
          fontWeight: '500',
          color: healthTheme.muted,
        },
        ringWrap: {
          alignItems: 'center',
          justifyContent: 'center',
        },
        ringLabel: {
          position: 'absolute',
          alignItems: 'center',
          justifyContent: 'center',
        },
        percent: {
          fontSize: 18,
          fontWeight: '800',
          color: healthTheme.ink,
        },
        percentHint: {
          fontSize: 10,
          fontWeight: '600',
          color: healthTheme.slate,
          marginTop: 2,
        },
      }),
    [healthTheme],
  );

  return (
    <PremiumCard onPress={() => push('DailyProgress')}>
      <Text style={styles.kicker}>Today&apos;s Summary</Text>
      <View style={styles.row}>
        <View style={styles.copy}>
          <View style={styles.calorieRow}>
            <Text style={styles.current}>{consumed.calories.toLocaleString('en-US')}</Text>
            <Text style={styles.target}> / {dietPlan.calories.toLocaleString('en-US')} kcal</Text>
          </View>
          <Text style={styles.remaining}>{remaining.toLocaleString('en-US')} kcal left</Text>
        </View>
        <View style={styles.ringWrap}>
          <Svg width={size} height={size}>
            <Defs>
              <LinearGradient id="calRing" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#9580E8" />
                <Stop offset="100%" stopColor={healthTheme.accent} />
              </LinearGradient>
            </Defs>
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="rgba(124, 92, 252, 0.12)"
              strokeWidth={stroke}
              fill="transparent"
            />
            <AnimatedCircle
              animatedProps={ringProps}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="url(#calRing)"
              strokeWidth={stroke}
              fill="transparent"
              strokeDasharray={`${circumference} ${circumference}`}
              strokeLinecap="round"
              rotation={-90}
              origin={`${size / 2}, ${size / 2}`}
            />
          </Svg>
          <View style={styles.ringLabel}>
            <Text style={styles.percent}>{percent}%</Text>
            <Text style={styles.percentHint}>of goal</Text>
          </View>
        </View>
      </View>
    </PremiumCard>
  );
}
