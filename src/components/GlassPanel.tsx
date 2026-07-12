import { BlurView } from 'expo-blur';
import type { PropsWithChildren } from 'react';
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { frostedOverlayColor, supportsNativeBlur } from '../lib/platform/blur';
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
  const { theme, isDark } = useTheme();
  const resolvedRadius = borderRadius ?? theme.cardRadius;
  const resolvedIntensity = intensity ?? theme.blurIntensity;
  const glassStyle = buildGlassStyle(theme);
  const shadowStyle = buildGlassShadowStyle(theme);
  const overlayFill = supportsNativeBlur() ? theme.card : frostedOverlayColor(isDark);

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
        {supportsNativeBlur() ? (
          <BlurView
            intensity={resolvedIntensity}
            tint={theme.blurTint}
            style={[StyleSheet.absoluteFill, { borderRadius: resolvedRadius }]}
          />
        ) : null}
        <View
          style={[
            styles.overlay,
            {
              borderRadius: resolvedRadius,
              backgroundColor: overlayFill,
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
    alignSelf: 'stretch',
    width: '100%',
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
