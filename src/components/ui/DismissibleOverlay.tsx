import { BlurView } from 'expo-blur';
import type { PropsWithChildren, ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';

import { supportsNativeBlur } from '../../lib/platform/blur';
import { SUPPORTS_LAYOUT_ANIMATIONS } from '../../lib/platform/constants';
import { useTheme } from '../../theme/ThemeContext';
import { overlayEnter, overlayExit } from '../../theme/motion';

type DismissibleOverlayProps = PropsWithChildren<{
  visible: boolean;
  onDismiss: () => void;
  /** Wrap content in a touch-capture container so inner taps do not dismiss. Default false (pass-through). */
  isolateContent?: boolean;
  blurIntensity?: number;
  blurTint?: 'light' | 'dark';
  scrimColor?: string;
  animated?: boolean;
  animationType?: 'fade' | 'none';
  placement?: 'center' | 'bottom' | 'passThrough';
  contentStyle?: StyleProp<ViewStyle>;
  disabled?: boolean;
  accessibilityLabel?: string;
}>;

function OverlayLayers({
  onDismiss,
  disabled,
  accessibilityLabel,
  resolvedBlur,
  resolvedTint,
  resolvedScrim,
  placement,
  contentStyle,
  content,
}: {
  onDismiss: () => void;
  disabled: boolean;
  accessibilityLabel: string;
  resolvedBlur: number;
  resolvedTint: 'light' | 'dark';
  resolvedScrim: string;
  placement: 'center' | 'bottom' | 'passThrough';
  contentStyle?: StyleProp<ViewStyle>;
  content: ReactNode;
}) {
  let placementStyle: ViewStyle | undefined;
  if (placement === 'center') {
    placementStyle = styles.centerPlacement;
  } else if (placement === 'bottom') {
    placementStyle = styles.bottomPlacement;
  }

  return (
    <View style={styles.root}>
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={disabled ? undefined : onDismiss}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
      >
        {supportsNativeBlur() && resolvedBlur > 0 ? (
          <BlurView intensity={resolvedBlur} tint={resolvedTint} style={StyleSheet.absoluteFill} />
        ) : null}
        <View style={[StyleSheet.absoluteFill, { backgroundColor: resolvedScrim }]} />
      </Pressable>

      <View
        style={[StyleSheet.absoluteFill, placementStyle, contentStyle]}
        pointerEvents="box-none"
      >
        {content}
      </View>
    </View>
  );
}

/**
 * Full-screen overlay with a dedicated backdrop layer.
 * Taps on the dimmed/blurred area call `onDismiss`.
 * With `placement="passThrough"`, only children with `pointerEvents="auto"`
 * capture touches — taps on empty space dismiss the overlay.
 */
export function DismissibleOverlay({
  visible,
  onDismiss,
  children,
  isolateContent = false,
  blurIntensity,
  blurTint,
  scrimColor,
  animated = true,
  animationType = 'fade',
  placement = 'passThrough',
  contentStyle,
  disabled = false,
  accessibilityLabel = 'Close overlay',
}: DismissibleOverlayProps) {
  const { theme, isDark } = useTheme();
  const resolvedBlur = blurIntensity ?? theme.sheetBlurIntensity;
  const resolvedTint = blurTint ?? theme.blurTint;
  const resolvedScrim = scrimColor ?? (isDark ? 'rgba(0,0,0,0.55)' : 'rgba(30, 27, 75, 0.35)');

  const content = isolateContent ? (
    <View pointerEvents="auto">{children}</View>
  ) : (
    children
  );

  const layers = (
    <OverlayLayers
      onDismiss={onDismiss}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel}
      resolvedBlur={resolvedBlur}
      resolvedTint={resolvedTint}
      resolvedScrim={resolvedScrim}
      placement={placement}
      contentStyle={contentStyle}
      content={content}
    />
  );

  const useLayoutAnimations = animated && SUPPORTS_LAYOUT_ANIMATIONS;

  return (
    <Modal
      visible={visible}
      transparent
      animationType={animationType}
      statusBarTranslucent
      onRequestClose={onDismiss}
    >
      {useLayoutAnimations ? (
        <Animated.View
          entering={overlayEnter}
          exiting={overlayExit}
          style={styles.root}
        >
          {layers}
        </Animated.View>
      ) : (
        layers
      )}
    </Modal>
  );
}

/** Card wrapper — use inside passThrough overlays for modal sheets. */
export function OverlayContentCard({
  children,
  style,
}: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  return (
    <View pointerEvents="auto" style={style}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  centerPlacement: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  bottomPlacement: {
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
  },
});

export type { DismissibleOverlayProps };
