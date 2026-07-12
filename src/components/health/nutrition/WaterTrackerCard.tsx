import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Droplets, Plus } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { useWaterDailyTotal } from '../../../hooks/useWaterDailyTotal';
import { useHealthTheme } from '../../../hooks/useHealthTheme';
import { insertWaterLog } from '../../../lib/quickActions/service';
import { triggerHaptic } from '../../../lib/platform/haptics';
import { useHealthStore } from '../../../stores/useHealthStore';
import { useTheme } from '../../../theme/ThemeContext';
import { MOTION_DURATION, pressInSpring, pressOutSpring, timingProgress } from '../../../theme/motion';
import { PremiumCard } from '../ui/PremiumCard';

const GLASS_ML = 250;
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type WaterAddButtonProps = {
  disabled: boolean;
  onPress: () => void;
  gradient: [string, string, string];
  glow: string;
};

function WaterAddButton({ disabled, onPress, gradient, glow }: WaterAddButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel="Add 250 milliliters of water"
      onPressIn={() => {
        scale.value = withSpring(0.96, pressInSpring);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, pressOutSpring);
      }}
      style={[
        styles.addButtonWrap,
        { shadowColor: glow },
        disabled ? styles.addButtonDisabled : null,
        animatedStyle,
      ]}
    >
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.addButtonGradient}
      >
        <LinearGradient
          colors={['rgba(255,255,255,0.42)', 'rgba(255,255,255,0.08)', 'rgba(255,255,255,0)']}
          locations={[0, 0.45, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.addButtonGloss}
        />
        <View style={styles.addButtonRow}>
          <View style={styles.addButtonIcon}>
            <Plus color="#FFFFFF" size={17} strokeWidth={3} />
          </View>
          <View style={styles.addButtonCopy}>
            <Text style={styles.addButtonValue}>+250</Text>
            <Text style={styles.addButtonUnit}>ml</Text>
          </View>
        </View>
      </LinearGradient>
    </AnimatedPressable>
  );
}

type WaterProgressBarProps = {
  percent: number;
  trackColor: string;
  gradient: [string, string, string];
};

function WaterProgressBar({ percent, trackColor, gradient }: WaterProgressBarProps) {
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withTiming(percent, timingProgress(MOTION_DURATION.reveal));
  }, [percent, width]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }));

  return (
    <View style={[styles.progressTrack, { backgroundColor: trackColor }]}>
      <Animated.View style={[styles.progressFill, fillStyle]}>
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

export function WaterTrackerCard() {
  const { waterMl, addWaterOptimistic } = useWaterDailyTotal();
  const waterTargetLiters = useHealthStore((s) => s.waterTargetLiters);
  const [isAdding, setIsAdding] = useState(false);
  const healthTheme = useHealthTheme();
  const { isDark } = useTheme();

  const targetLiters = waterTargetLiters > 0 ? waterTargetLiters : 3;
  const targetMl = targetLiters * 1000;
  const liters = waterMl / 1000;
  const percent = Math.min(100, Math.round((waterMl / targetMl) * 100));
  const remainingMl = Math.max(0, targetMl - waterMl);
  const totalGlasses = Math.ceil(targetMl / GLASS_ML);
  const filledGlasses = Math.min(totalGlasses, Math.floor(waterMl / GLASS_ML));

  const palette = useMemo(
    () =>
      isDark
        ? {
            badge: 'rgba(56, 189, 248, 0.16)',
            badgeBorder: 'rgba(125, 211, 252, 0.28)',
            track: 'rgba(56, 189, 248, 0.12)',
            button: ['#67E8F9', '#38BDF8', '#0284C7'] as [string, string, string],
            buttonGlow: '#0EA5E9',
            progress: ['#67E8F9', '#38BDF8', '#0EA5E9'] as [string, string, string],
          }
        : {
            badge: 'rgba(56, 189, 248, 0.12)',
            badgeBorder: 'rgba(56, 189, 248, 0.2)',
            track: 'rgba(56, 189, 248, 0.1)',
            button: ['#BAE6FD', '#38BDF8', '#0284C7'] as [string, string, string],
            buttonGlow: '#38BDF8',
            progress: ['#BAE6FD', '#60A5FA', '#38BDF8'] as [string, string, string],
          },
    [isDark],
  );

  const handleAddGlass = useCallback(async () => {
    if (isAdding || waterMl >= targetMl) return;
    setIsAdding(true);
    void triggerHaptic('light');
    try {
      await insertWaterLog({ amountMl: GLASS_ML });
      addWaterOptimistic(GLASS_ML);
    } catch {
      addWaterOptimistic(GLASS_ML);
    }
    setIsAdding(false);
  }, [addWaterOptimistic, isAdding, targetMl, waterMl]);

  const themeStyles = useMemo(
    () =>
      StyleSheet.create({
        headerRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          marginBottom: 18,
        },
        iconBadge: {
          width: 42,
          height: 42,
          borderRadius: 14,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: palette.badge,
          borderWidth: 1,
          borderColor: palette.badgeBorder,
        },
        headerCopy: {
          flex: 1,
        },
        kicker: {
          fontSize: 11,
          fontWeight: '700',
          letterSpacing: 2,
          textTransform: 'uppercase',
          color: healthTheme.slate,
        },
        subtitle: {
          marginTop: 3,
          fontSize: 13,
          fontWeight: '600',
          color: healthTheme.muted,
        },
        metricsRow: {
          flexDirection: 'row',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 12,
          marginBottom: 8,
        },
        litersBlock: {
          flex: 1,
        },
        litersRow: {
          flexDirection: 'row',
          alignItems: 'baseline',
          flexWrap: 'wrap',
        },
        litersValue: {
          fontSize: 34,
          fontWeight: '900',
          color: healthTheme.ink,
          letterSpacing: -1.1,
        },
        litersUnit: {
          fontSize: 18,
          fontWeight: '700',
          color: healthTheme.slate,
        },
        litersTarget: {
          fontSize: 16,
          fontWeight: '600',
          color: healthTheme.slate,
        },
        remaining: {
          fontSize: 13,
          fontWeight: '500',
          color: healthTheme.muted,
          marginBottom: 14,
        },
        addButtonSlot: {
          marginTop: 16,
        },
        percentBadge: {
          minWidth: 58,
          paddingHorizontal: 12,
          paddingVertical: 10,
          borderRadius: 16,
          backgroundColor: palette.badge,
          borderWidth: 1,
          borderColor: palette.badgeBorder,
          alignItems: 'center',
        },
        percentValue: {
          fontSize: 18,
          fontWeight: '900',
          color: isDark ? '#E0F2FE' : '#0369A1',
        },
        percentHint: {
          marginTop: 2,
          fontSize: 10,
          fontWeight: '700',
          letterSpacing: 0.6,
          textTransform: 'uppercase',
          color: healthTheme.slate,
        },
      }),
    [healthTheme, isDark, palette],
  );

  return (
    <PremiumCard padding={20}>
      <View style={themeStyles.headerRow}>
        <View style={themeStyles.iconBadge}>
          <Droplets color={healthTheme.macro.water} size={20} strokeWidth={2.2} />
        </View>
        <View style={themeStyles.headerCopy}>
          <Text style={themeStyles.kicker}>Hydration</Text>
          <Text style={themeStyles.subtitle}>
            {filledGlasses} of {totalGlasses} glasses today
          </Text>
        </View>
      </View>

      <View style={themeStyles.metricsRow}>
        <View style={themeStyles.litersBlock}>
          <View style={themeStyles.litersRow}>
            <Text style={themeStyles.litersValue}>{liters.toFixed(1)}</Text>
            <Text style={themeStyles.litersUnit}> L</Text>
            <Text style={themeStyles.litersTarget}> / {targetLiters.toFixed(1)} L</Text>
          </View>
        </View>
        <View style={themeStyles.percentBadge}>
          <Text style={themeStyles.percentValue}>{percent}%</Text>
          <Text style={themeStyles.percentHint}>goal</Text>
        </View>
      </View>

      <Text style={themeStyles.remaining}>
        {remainingMl > 0 ? `${remainingMl.toLocaleString('en-US')} ml left to hydrate` : 'Daily goal reached'}
      </Text>

      <WaterProgressBar percent={percent} trackColor={palette.track} gradient={palette.progress} />

      <View style={themeStyles.addButtonSlot}>
        <WaterAddButton
          disabled={isAdding || waterMl >= targetMl}
          onPress={() => void handleAddGlass()}
          gradient={palette.button}
          glow={palette.buttonGlow}
        />
      </View>
    </PremiumCard>
  );
}

const styles = StyleSheet.create({
  progressTrack: {
    height: 10,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    overflow: 'hidden',
  },
  addButtonWrap: {
    borderRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.34,
    shadowRadius: 18,
    elevation: 8,
  },
  addButtonDisabled: {
    opacity: 0.45,
    shadowOpacity: 0,
    elevation: 0,
  },
  addButtonGradient: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.28)',
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  addButtonGloss: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
  },
  addButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  addButtonIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.38)',
  },
  addButtonCopy: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  addButtonValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.6,
    fontVariant: ['tabular-nums'],
  },
  addButtonUnit: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.88)',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
});
