import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

const STORAGE_KEY = 'trackit:notification-settings';

export type NotificationSettings = {
  enabled: boolean;
  hardcoreMode: boolean;
};

type NotificationSettingsState = NotificationSettings & {
  isReady: boolean;
  hydrate: () => Promise<void>;
  setEnabled: (enabled: boolean) => void;
  setHardcoreMode: (hardcoreMode: boolean) => void;
};

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  hardcoreMode: false,
};

async function persistSettings(settings: NotificationSettings): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export const useNotificationSettingsStore = create<NotificationSettingsState>((set, get) => ({
  ...DEFAULT_SETTINGS,
  isReady: false,

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<NotificationSettings>;
        set({
          enabled: parsed.enabled ?? DEFAULT_SETTINGS.enabled,
          hardcoreMode: parsed.hardcoreMode ?? DEFAULT_SETTINGS.hardcoreMode,
          isReady: true,
        });
        return;
      }
    } catch {
      // fall through to defaults
    }

    set({ ...DEFAULT_SETTINGS, isReady: true });
  },

  setEnabled: (enabled) => {
    set({ enabled });
    const { hardcoreMode } = get();
    void persistSettings({ enabled, hardcoreMode });
  },

  setHardcoreMode: (hardcoreMode) => {
    set({ hardcoreMode });
    const { enabled } = get();
    void persistSettings({ enabled, hardcoreMode });
  },
}));
