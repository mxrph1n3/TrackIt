import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { supportsNativeBlur } from '../../lib/platform/blur';
import { triggerHaptic } from '../../lib/platform/haptics';

import { CrystalEmblemIcon } from '../ui/CrystalEmblemIcon';
import { ACTION_HUB } from './actionHubTheme';
import { useActionHubTheme } from './useActionHubTheme';

const DEFAULT_SIZE = 96;
const ICON_RATIO = 0.36;
const OUTER_RING = 14;
const GLOW_RING = 8;

type ActionHubCenterCrystalProps = {
  onPress: () => void;
  size?: number;
};

/** Pixel-perfect center crystal for the expanded Action Hub radial menu. */
export function ActionHubCenterCrystal({ onPress, size = DEFAULT_SIZE }: ActionHubCenterCrystalProps) {
  const hubTheme = useActionHubTheme();
  const iconSize = Math.round(size * ICON_RATIO);
  const innerSize = size - OUTER_RING;
  const glowSize = size - GLOW_RING;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        hitArea: {
          overflow: 'hidden',
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: hubTheme.glassBorder,
          backgroundColor: hubTheme.crystalBg,
          shadowColor: '#775DD8',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: hubTheme.isDark ? 0.32 : 0.12,
          shadowRadius: 18,
          elevation: 8,
        },
        glow: {
          position: 'absolute',
          backgroundColor: hubTheme.isDark ? 'rgba(149, 128, 232, 0.24)' : 'rgba(124, 92, 252, 0.18)',
        },
        innerDisk: {
          overflow: 'hidden',
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: hubTheme.crystalInnerBorder,
        },
      }),
    [hubTheme],
  );

  const handlePress = () => {
    void triggerHaptic('light');
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      style={[styles.hitArea, { width: size, height: size, borderRadius: size / 2 }]}
      accessibilityRole="button"
      accessibilityLabel="Close Action Hub"
    >
      {supportsNativeBlur() ? (
        <BlurView intensity={hubTheme.isDark ? 36 : 32} tint={hubTheme.blurTint} style={StyleSheet.absoluteFill} />
      ) : null}

      <View
        pointerEvents="none"
        style={[
          styles.glow,
          {
            top: GLOW_RING / 2,
            left: GLOW_RING / 2,
            width: glowSize,
            height: glowSize,
            borderRadius: glowSize / 2,
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
          colors={[...hubTheme.crystalGradient]}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.8, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <CrystalEmblemIcon size={iconSize} color={ACTION_HUB.crystalPurple} />
      </View>
    </Pressable>
  );
}
