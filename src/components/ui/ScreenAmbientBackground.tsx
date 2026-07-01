import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import type { AppThemeMode } from '../../theme/themes';

type ScreenAmbientBackgroundProps = {
  mode: AppThemeMode;
};

/** Soft vertical gradient + top glow — shared app background (Planner-style). */
export function ScreenAmbientBackground({ mode }: ScreenAmbientBackgroundProps) {
  const isObsidian = mode === 'obsidian';

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={
          isObsidian
            ? ['#12121C', '#07070A', '#07070A']
            : ['#FFFFFF', '#F7F8FC', '#F3F5FA']
        }
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={
          isObsidian
            ? ['rgba(119, 93, 216, 0.12)', 'rgba(7, 7, 10, 0)']
            : ['rgba(226, 217, 255, 0.22)', 'rgba(255,255,255,0)']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0.45 }}
        style={styles.glow}
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
    height: 280,
  },
});
