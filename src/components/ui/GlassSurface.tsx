import { BlurView } from 'expo-blur';
import type { PropsWithChildren } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { frostedOverlayColor, supportsNativeBlur } from '../../lib/platform/blur';
import { useTheme } from '../../theme/ThemeContext';

type GlassSurfaceProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  intensity?: number;
  borderRadius?: number;
  overlayColor?: string;
  borderColor?: string;
}>;

/**
 * Frosted glass surface — native blur on iOS, solid frosted fill on Android/web/TMA.
 */
export function GlassSurface({
  children,
  style,
  intensity,
  borderRadius = 0,
  overlayColor,
  borderColor,
}: GlassSurfaceProps) {
  const { theme, isDark } = useTheme();
  const resolvedIntensity = intensity ?? theme.blurIntensity;
  const fill = overlayColor ?? (supportsNativeBlur() ? theme.card : frostedOverlayColor(isDark));

  return (
    <View style={[styles.root, { borderRadius, overflow: 'hidden' }, style]}>
      {supportsNativeBlur() ? (
        <BlurView
          intensity={resolvedIntensity}
          tint={theme.blurTint}
          style={[StyleSheet.absoluteFill, { borderRadius }]}
        />
      ) : null}
      <View
        style={[
          styles.overlay,
          {
            borderRadius,
            backgroundColor: fill,
            borderColor: borderColor ?? theme.border,
          },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'relative',
  },
  overlay: {
    borderWidth: 1,
  },
});
