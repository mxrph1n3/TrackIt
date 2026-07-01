import { BlurView } from 'expo-blur';
import type { PropsWithChildren } from 'react';
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '../../theme/ThemeContext';

type PlannerPremiumCardProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
}>;

export function PlannerPremiumCard({ children, style }: PlannerPremiumCardProps) {
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
        {Platform.OS === 'ios' ? (
          <BlurView intensity={theme.blurIntensity} tint={theme.blurTint} style={StyleSheet.absoluteFill} />
        ) : null}
        {children}
      </View>
    </View>
  );
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
    borderRadius: 28,
    borderWidth: 1,
    overflow: 'hidden',
  },
});
