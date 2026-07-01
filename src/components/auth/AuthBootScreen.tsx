import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles } from 'lucide-react-native';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { ObsidianTheme } from '../../theme/obsidian';

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
        <BlurView intensity={ObsidianTheme.blurIntensity} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={styles.glassOverlay} />

        <View style={styles.content}>
          <View style={styles.iconRing}>
            <Sparkles color={ObsidianTheme.primary} size={28} strokeWidth={2.2} />
          </View>

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
  iconRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.35)',
    backgroundColor: 'rgba(168, 85, 247, 0.12)',
    marginBottom: 20,
  },
  title: {
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
