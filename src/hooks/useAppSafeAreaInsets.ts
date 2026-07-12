import { useMemo, useSyncExternalStore } from 'react';
import { useSafeAreaInsets, type EdgeInsets } from 'react-native-safe-area-context';

import { IS_WEB } from '../lib/platform/constants';
import {
  getTelegramChromeVersion,
  getTelegramSafeAreaInsets,
  isTelegramMiniApp,
  subscribeTelegramChrome,
} from '../lib/telegram/telegramWebApp';

function mergeInsets(base: EdgeInsets, extra: EdgeInsets): EdgeInsets {
  return {
    top: Math.max(base.top, extra.top),
    bottom: Math.max(base.bottom, extra.bottom),
    left: Math.max(base.left, extra.left),
    right: Math.max(base.right, extra.right),
  };
}

function subscribeTelegramInsets(onStoreChange: () => void) {
  if (!IS_WEB || !isTelegramMiniApp()) {
    return () => {};
  }
  return subscribeTelegramChrome(onStoreChange);
}

function getTelegramInsetsSnapshot() {
  return getTelegramChromeVersion();
}

/**
 * Safe area insets merged with Telegram Mini App chrome when running inside TMA.
 */
export function useAppSafeAreaInsets(): EdgeInsets {
  const insets = useSafeAreaInsets();
  const telegramChromeVersion = useSyncExternalStore(
    subscribeTelegramInsets,
    getTelegramInsetsSnapshot,
    () => 0,
  );

  return useMemo(() => {
    if (!IS_WEB || !isTelegramMiniApp()) {
      return insets;
    }

    void telegramChromeVersion;
    const telegramInsets = getTelegramSafeAreaInsets();
    if (!telegramInsets) {
      return insets;
    }

    return mergeInsets(insets, telegramInsets);
  }, [insets, telegramChromeVersion]);
}
