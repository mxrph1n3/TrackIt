import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';

import { supportsNativeBlur } from '../../lib/platform/blur';
import { ObsidianTheme } from '../../theme/obsidian';
import { AuthBrandCrystal } from './AuthBrandCrystal';

export function AuthBootScreen() {
  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#07070A', '#0A0A10', '#07070A']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.glassShell}>
        {supportsNativeBlur() ? (
          <BlurView intensity={ObsidianTheme.blurIntensity} tint="dark" style={StyleSheet.absoluteFill} />
        ) : null}
        <View style={styles.glassOverlay} />

        <View style={styles.content}>
          <AuthBrandCrystal size={72} />

          <Text style={styles.title}>TrackIt</Text>
          <Text style={styles.subtitle}>Restoring your session…</Text>

          <ActivityIndicator
            color={ObsidianTheme.primary}
            size="large"
            style={styles.spinner}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ObsidianTheme.background,
    paddingHorizontal: 32,
  },
  glassShell: {
    width: '100%',
    maxWidth: 320,
    overflow: 'hidden',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: ObsidianTheme.border,
  },
  glassOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#0D0D12',
    opacity: 0.72,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 36,
  },
  title: {
    marginTop: 20,
    fontSize: 22,
    fontWeight: '800',
    color: ObsidianTheme.textPrimary,
    letterSpacing: 0.4,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 13,
    color: ObsidianTheme.textSecondary,
    textAlign: 'center',
  },
  spinner: {
    marginTop: 28,
  },
});
