export type TelegramSafeAreaInsets = {
  top: number;
  bottom: number;
  left: number;
  right: number;
};

export function subscribeTelegramChrome(_listener: () => void): () => void {
  return () => {};
}

export function getTelegramChromeVersion(): number {
  return 0;
}

export function applyTelegramThemeToDocument(): void {
  // No-op on native.
}

export function getTelegramWebApp(): null {
  return null;
}

export function isTelegramMiniApp(): false {
  return false;
}

export function initTelegramWebApp(): null {
  return null;
}

export function getTelegramSafeAreaInsets(): null {
  return null;
}

export function getTelegramColorScheme(): null {
  return null;
}

export function getTelegramUser(): null {
  return null;
}
