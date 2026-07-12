import { useEffect } from 'react';
import { Platform } from 'react-native';

import { IS_WEB } from '../../lib/platform/constants';
import { initTelegramWebApp } from '../../lib/telegram/telegramWebApp';

/** Initializes Telegram WebApp SDK on web (theme sync lives in useTelegramThemeSync). */
export function TelegramBootstrap() {
  useEffect(() => {
    if (!IS_WEB) {
      return;
    }

    initTelegramWebApp();
  }, []);

  return null;
}
