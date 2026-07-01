import { BlurView } from 'expo-blur';
import type { PropsWithChildren } from 'react';
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { RADIUS } from '../../../theme/designTokens';
import { useTheme } from '../../../theme/ThemeContext';

type StatisticsPremiumCardProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  flex?: number;
}>;

export function StatisticsPremiumCard({ children, style, flex }: StatisticsPremiumCardProps) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.shadow,
        {
          shadowColor: theme.shadowColor,
          shadowOpacity: theme.shadowOpacity,
          shadowRadius: theme.shadowRadius,
        },
        flex != null && { flex },
        style,
      ]}
    >
      <View
        style={[
          styles.card,
          {
            borderColor: theme.borderSubtle,
            backgroundColor: theme.cardFrosted,
          },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

export function StatisticsCardBlur() {
  const { theme } = useTheme();
  if (Platform.OS !== 'ios') return null;
  return <BlurView intensity={theme.blurIntensity} tint={theme.blurTint} style={StyleSheet.absoluteFill} />;
}

const styles = StyleSheet.create({
  shadow: {
    marginBottom: 14,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 8 },
      },
      android: { elevation: 3 },
    }),
  },
  card: {
    borderRadius: RADIUS.card,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 16,
  },
});
