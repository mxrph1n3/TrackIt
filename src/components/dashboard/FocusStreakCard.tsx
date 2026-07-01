import { LinearGradient } from 'expo-linear-gradient';
import { Image, StyleSheet, Text, View } from 'react-native';

import { getCrystalImage, getImageScrim } from '../../lib/themeAssets';
import { buildGlassShadowStyle } from '../../theme/obsidian';
import { BRAND } from '../../theme/designTokens';
import { useTheme } from '../../theme/ThemeContext';

const CARD_HEIGHT = 124;

type FocusStreakCardProps = {
  streakDays: number;
  crystalActive: boolean;
};

export function FocusStreakCard({ streakDays, crystalActive }: FocusStreakCardProps) {
  const { theme, mode, isDark } = useTheme();
  const shadowStyle = buildGlassShadowStyle(theme);
  const unitLabel = streakDays === 1 ? 'DAY' : 'DAYS';
  const focusScrim = getImageScrim(mode, 'focusCard');

  return (
    <View
      style={[
        styles.shell,
        shadowStyle,
        { borderRadius: theme.cardRadius, opacity: crystalActive ? 1 : 0.94 },
      ]}
    >
      <View
        style={[
          styles.card,
          { borderRadius: theme.cardRadius, borderColor: theme.border, backgroundColor: theme.cardFrosted },
        ]}
      >
        <Image
          source={getCrystalImage(mode)}
          resizeMode="cover"
          style={[styles.crystalBackground, isDark && styles.crystalBackgroundDark]}
          accessibilityIgnoresInvertColors
        />

        <LinearGradient
          colors={[...focusScrim]}
          locations={[0, 0.38, 0.62, 0.88]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        {isDark ? (
          <LinearGradient
            colors={['transparent', 'rgba(119, 93, 216, 0.08)', 'rgba(149, 128, 232, 0.24)']}
            locations={[0.35, 0.72, 1]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
        ) : null}

        <View style={styles.copy}>
          <View style={styles.labelColumn}>
            <Text style={[styles.kicker, { color: theme.textMuted }]}>FOCUS STREAK</Text>
            <View style={styles.streakStack}>
              <Text style={[styles.streakValue, crystalActive && styles.streakValueActive]}>
                {streakDays}
              </Text>
              <Text style={[styles.unitLabel, { color: theme.textSecondary }]}>{unitLabel}</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    width: '100%',
    marginBottom: 14,
  },
  card: {
    height: CARD_HEIGHT,
    overflow: 'hidden',
    borderWidth: 1,
  },
  crystalBackground: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  crystalBackgroundDark: {
    opacity: 1,
    transform: [{ scale: 1.06 }],
  },
  copy: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: 40,
    paddingRight: 16,
    zIndex: 2,
  },
  labelColumn: {
    alignSelf: 'flex-start',
    alignItems: 'center',
  },
  streakStack: {
    alignItems: 'center',
    marginTop: 2,
  },
  kicker: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2.2,
    textTransform: 'uppercase',
  },
  streakValue: {
    color: BRAND.primary,
    fontSize: 44,
    fontWeight: '800',
    letterSpacing: -1.5,
    lineHeight: 46,
    textAlign: 'center',
  },
  streakValueActive: {
    textShadowColor: 'rgba(119, 93, 216, 0.28)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  unitLabel: {
    marginTop: -2,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 2.4,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
});
