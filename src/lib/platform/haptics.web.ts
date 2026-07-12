import type { HapticFeedbackStyle } from './haptics.shared';

export type { HapticFeedbackStyle } from './haptics.shared';

/** Cross-platform haptics — no-op on web / Telegram Mini App. */
export async function triggerHaptic(_style: HapticFeedbackStyle = 'light'): Promise<void> {
  // No haptics in browser / TMA.
}
