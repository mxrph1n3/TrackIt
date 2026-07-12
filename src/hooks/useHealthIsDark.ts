import { useMemo, useEffect, useState } from 'react';

import { IS_WEB } from '../lib/platform/constants';
import { subscribeTelegramChrome } from '../lib/telegram/telegramWebApp';
import { isEffectiveDarkMode } from '../theme/resolveWebBackground';
import { useTheme } from '../theme/ThemeContext';

/**
 * Health / body screens should look dark when the app is Obsidian OR when the
 * Mini App runs inside Telegram's dark chrome (even if the stored app theme is Ethereal).
 */
export function useHealthIsDark(): boolean {
  const { mode } = useTheme();
  const [telegramChromeTick, setTelegramChromeTick] = useState(0);

  useEffect(() => {
    if (!IS_WEB) {
      return;
    }

    return subscribeTelegramChrome(() => {
      setTelegramChromeTick((value) => value + 1);
    });
  }, []);

  return useMemo(() => isEffectiveDarkMode(mode), [mode, telegramChromeTick]);
}
