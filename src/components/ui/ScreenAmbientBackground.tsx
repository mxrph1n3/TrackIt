import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { ETHEREAL_AMBIENT, OBSIDIAN_AMBIENT } from '../../theme/ambientBackground';
import type { AppThemeMode } from '../../theme/themes';

type ScreenAmbientBackgroundProps = {
  mode: AppThemeMode;
};

/** Soft vertical gradient + top glow — shared app background (Planner-style). */
export function ScreenAmbientBackground({ mode }: ScreenAmbientBackgroundProps) {
  const isObsidian = mode === 'obsidian';
  const ambient = isObsidian ? OBSIDIAN_AMBIENT : ETHEREAL_AMBIENT;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={[...ambient.gradient]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={[...ambient.glow]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0.45 }}
        style={[styles.glow, { height: ambient.glowHeight }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  glow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
});
