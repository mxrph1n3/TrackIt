import * as Haptics from 'expo-haptics';

import type { HapticFeedbackStyle } from './haptics.shared';

export type { HapticFeedbackStyle } from './haptics.shared';

function toImpactStyle(style: HapticFeedbackStyle): Haptics.ImpactFeedbackStyle {
  switch (style) {
    case 'heavy':
      return Haptics.ImpactFeedbackStyle.Heavy;
    case 'medium':
      return Haptics.ImpactFeedbackStyle.Medium;
    case 'light':
    default:
      return Haptics.ImpactFeedbackStyle.Light;
  }
}

/** Cross-platform haptics — native iOS/Android only. */
export async function triggerHaptic(style: HapticFeedbackStyle = 'light'): Promise<void> {
  try {
    switch (style) {
      case 'selection':
        await Haptics.selectionAsync();
        return;
      case 'success':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        return;
      case 'warning':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        return;
      case 'error':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return;
      default:
        await Haptics.impactAsync(toImpactStyle(style));
    }
  } catch {
    // Haptics unavailable on some devices/simulators.
  }
}
