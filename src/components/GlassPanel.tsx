import { BlurView } from 'expo-blur';
import type { PropsWithChildren } from 'react';
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { buildGlassShadowStyle, buildGlassStyle } from '../theme/obsidian';
import { useTheme } from '../theme/ThemeContext';

type GlassPanelProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  intensity?: number;
  borderRadius?: number;
}>;

export type { GlassPanelProps };

export function GlassPanel({
  children,
  style,
  intensity,
  borderRadius,
}: GlassPanelProps) {
  const { theme } = useTheme();
  const resolvedRadius = borderRadius ?? theme.cardRadius;
  const resolvedIntensity = intensity ?? theme.blurIntensity;
  const glassStyle = buildGlassStyle(theme);
  const shadowStyle = buildGlassShadowStyle(theme);

  return (
    <View
      style={[
        styles.shadowShell,
        { borderRadius: resolvedRadius },
        shadowStyle,
        style,
      ]}
    >
      <View style={[styles.wrapper, { borderRadius: resolvedRadius }, glassStyle]}>
        <BlurView
          intensity={resolvedIntensity}
          tint={theme.blurTint}
          style={[StyleSheet.absoluteFill, { borderRadius: resolvedRadius }]}
        />
        <View
          style={[
            styles.overlay,
            {
              borderRadius: resolvedRadius,
              backgroundColor: theme.card,
              borderColor: theme.border,
            },
          ]}
        >
          {children}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowShell: {
    ...Platform.select({
      android: {
        backgroundColor: 'transparent',
      },
    }),
  },
  wrapper: {
    overflow: 'hidden',
  },
  overlay: {
    borderWidth: 1,
  },
});
