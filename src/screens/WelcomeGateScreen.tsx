import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FocusModePillButton } from '../components/welcome/FocusModePillButton';
import { WeeklyProgressChart } from '../components/welcome/WeeklyProgressChart';
import { useGamification } from '../hooks/useGamification';
import { useWelcomeWeeklyProgress } from '../hooks/useWelcomeWeeklyProgress';
import { getWelcomeGateImage } from '../lib/themeAssets';
import { ETHEREAL_COLORS } from '../theme/etherealTokens';
import { MOTION_DURATION, timingEntrance, timingExit, timingLoop } from '../theme/motion';
import { useTheme } from '../theme/ThemeContext';

/** Screen-specific accent from reference design. */
const PROMO_VIOLET = '#775DD8';
const PROMO_INK_LIGHT = '#1E1A3E';
const PROMO_INK_DARK = '#F8FAFC';
const PROMO_SLATE_LIGHT = '#7F7D9C';
const PROMO_SLATE_DARK = 'rgba(255, 255, 255, 0.68)';
const PROMO_QUOTE_MARK_LIGHT = '#C4B5FD';
const PROMO_QUOTE_MARK_DARK = '#9580E8';
const HORIZONTAL_GUTTER = 28;

type WelcomeGateScreenProps = {
  onEnter: () => void;
};

export function WelcomeGateScreen({ onEnter }: WelcomeGateScreenProps) {
  const { theme, mode } = useTheme();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const background = getWelcomeGateImage(mode);
  const promoInk = mode === 'obsidian' ? PROMO_INK_DARK : PROMO_INK_LIGHT;
  const promoSlate = mode === 'obsidian' ? PROMO_SLATE_DARK : PROMO_SLATE_LIGHT;
  const promoQuoteMark = mode === 'obsidian' ? PROMO_QUOTE_MARK_DARK : PROMO_QUOTE_MARK_LIGHT;

  useGamification();
  const { data: weekly } = useWelcomeWeeklyProgress();

  const kenBurns = useSharedValue(1);
  const quoteOpacity = useSharedValue(0);
  const quoteY = useSharedValue(24);
  const cardOpacity = useSharedValue(0);
  const cardY = useSharedValue(20);
  const exitScale = useSharedValue(1);
  const exitOpacity = useSharedValue(1);

  useEffect(() => {
    kenBurns.value = withRepeat(
      withSequence(
        withTiming(1.015, timingLoop(MOTION_DURATION.loop)),
        withTiming(1, timingLoop(MOTION_DURATION.loop)),
      ),
      -1,
      false,
    );

    quoteOpacity.value = withDelay(120, withTiming(1, timingEntrance(MOTION_DURATION.reveal)));
    quoteY.value = withDelay(120, withTiming(0, timingEntrance(MOTION_DURATION.reveal)));

    cardOpacity.value = withDelay(480, withTiming(1, timingEntrance(MOTION_DURATION.reveal)));
    cardY.value = withDelay(480, withTiming(0, timingEntrance(MOTION_DURATION.reveal)));
  }, [cardOpacity, cardY, kenBurns, quoteOpacity, quoteY]);

  const finishEnter = () => {
    onEnter();
  };

  const handleEnter = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    exitScale.value = withTiming(0.96, timingExit(MOTION_DURATION.medium));
    exitOpacity.value = withTiming(0, timingExit(MOTION_DURATION.medium), (done) => {
      if (done) {
        runOnJS(finishEnter)();
      }
    });
  };

  const backgroundStyle = useAnimatedStyle(() => ({
    transform: [{ scale: kenBurns.value }],
  }));

  const screenStyle = useAnimatedStyle(() => ({
    opacity: exitOpacity.value,
    transform: [{ scale: exitScale.value }],
  }));

  const quoteStyle = useAnimatedStyle(() => ({
    opacity: quoteOpacity.value,
    transform: [{ translateY: quoteY.value }],
  }));

  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ translateY: cardY.value }],
  }));

  const quoteInk = promoInk;
  const welcomeOverlay =
    mode === 'obsidian'
      ? ([
          'rgba(7, 7, 10, 0.08)',
          'rgba(12, 12, 20, 0.18)',
          'rgba(15, 15, 25, 0.62)',
          'rgba(7, 7, 10, 0.94)',
        ] as const)
      : ([
          'rgba(255,255,255,0.08)',
          'rgba(255,255,255,0.02)',
          'rgba(243, 245, 250, 0.55)',
          'rgba(243, 245, 250, 0.92)',
        ] as const);
  const contentTopOffset = Math.round(height * 0.36);

  return (
    <Animated.View style={[styles.root, screenStyle, { backgroundColor: theme.background }]}>
      <View style={StyleSheet.absoluteFill}>
        <Animated.View
          style={[
            styles.background,
            {
              width,
              height: height * 1.02,
              top: -height * 0.02,
            },
            backgroundStyle,
          ]}
        >
          <Image
            source={background}
            style={{ width, height: height * 1.02 }}
            resizeMode="cover"
          />
        </Animated.View>
        <LinearGradient
          colors={welcomeOverlay}
          locations={[0, 0.28, 0.58, 1]}
          style={StyleSheet.absoluteFill}
        />
      </View>

      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top + contentTopOffset,
            paddingBottom: insets.bottom + 20,
          },
        ]}
      >
        <View style={styles.topSpacer} />

        <Animated.View style={[styles.quoteBlock, quoteStyle]}>
          <Text style={[styles.quoteMark, { color: promoQuoteMark }]}>“</Text>
          <Text style={[styles.quoteLine, { color: quoteInk }]}>
            {'THE GRIND\nLOOKS LONELY\nBEFORE IT LOOKS\n'}
            <Text style={[styles.legendary, { color: PROMO_VIOLET }]}>LEGENDARY.</Text>
          </Text>
          <Text style={[styles.quoteSub, { color: promoSlate }]}>— KEEP BUILDING.</Text>
        </Animated.View>

        <View style={styles.ctaShell}>
          <FocusModePillButton onPress={handleEnter} entranceDelay={320} />
        </View>

        <Animated.View style={[styles.progressCard, cardStyle, { backgroundColor: theme.cardFrosted, borderColor: theme.border }]}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressLabel, { color: promoSlate }]}>WEEKLY PROGRESS</Text>
            <Text style={[styles.progressValue, { color: quoteInk }]}>{weekly.averagePercent}%</Text>
          </View>
          <WeeklyProgressChart days={weekly.days} accentColor={PROMO_VIOLET} />
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: ETHEREAL_COLORS.background,
  },
  background: {
    position: 'absolute',
    left: 0,
  },
  content: {
    flex: 1,
    paddingHorizontal: HORIZONTAL_GUTTER,
    alignItems: 'stretch',
  },
  topSpacer: {
    flex: 1,
    minHeight: 8,
  },
  quoteBlock: {
    alignSelf: 'stretch',
    alignItems: 'flex-start',
    marginBottom: 28,
  },
  quoteMark: {
    fontSize: 36,
    fontWeight: '700',
    lineHeight: 36,
    marginBottom: 2,
  },
  quoteLine: {
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 32,
    letterSpacing: -0.3,
    textAlign: 'left',
  },
  legendary: {
    fontWeight: '800',
  },
  quoteSub: {
    marginTop: 16,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    textAlign: 'left',
  },
  ctaShell: {
    width: '100%',
    alignSelf: 'stretch',
    marginBottom: 24,
  },
  progressCard: {
    alignSelf: 'stretch',
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 14,
    shadowColor: PROMO_VIOLET,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3,
    marginBottom: 4,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  progressValue: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
});
