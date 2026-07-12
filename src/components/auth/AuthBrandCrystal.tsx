import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { supportsNativeBlur } from '../../lib/platform/blur';

import { CrystalEmblemIcon } from '../ui/CrystalEmblemIcon';
import { ACTION_HUB } from '../actionHub/actionHubTheme';

type AuthBrandCrystalProps = {
  size?: number;
};

/** Hero crystal medallion for auth and boot screens. */
export function AuthBrandCrystal({ size = 80 }: AuthBrandCrystalProps) {
  const iconSize = Math.round(size * 0.42);
  const innerSize = size - 16;
  const glowSize = size - 10;

  return (
    <View
      style={[
        styles.shell,
        {
          width: size,
          height: size,
          borderRadius: size * 0.28,
          shadowRadius: size * 0.28,
        },
      ]}
    >
      {supportsNativeBlur() ? (
        <BlurView intensity={28} tint="light" style={StyleSheet.absoluteFill} />
      ) : null}

      <LinearGradient
        colors={['#B8A8F8', '#9580E8', '#775DD8', '#6366F1']}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={[StyleSheet.absoluteFill, { borderRadius: size * 0.28 }]}
      />

      <View
        pointerEvents="none"
        style={[
          styles.glow,
          {
            width: glowSize,
            height: glowSize,
            borderRadius: glowSize / 2,
            top: (size - glowSize) / 2,
            left: (size - glowSize) / 2,
          },
        ]}
      />

      <View
        style={[
          styles.innerDisk,
          {
            width: innerSize,
            height: innerSize,
            borderRadius: innerSize / 2,
          },
        ]}
      >
        <LinearGradient
          colors={['rgba(255,255,255,0.92)', 'rgba(255,255,255,0.72)', 'rgba(237,233,254,0.88)']}
          start={{ x: 0.15, y: 0 }}
          end={{ x: 0.85, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <CrystalEmblemIcon size={iconSize} color={ACTION_HUB.crystalPurple} variant="hero" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.55)',
    shadowColor: '#775DD8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    elevation: 10,
  },
  glow: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
  },
  innerDisk: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.85)',
  },
});
