import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SECURESTORE_LIMIT = 2048;

/**
 * Supabase auth storage adapter: SecureStore for sensitive session data,
 * with AsyncStorage fallback for oversized values on iOS.
 */
export const supabaseAuthStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      const secureValue = await SecureStore.getItemAsync(key);
      if (secureValue != null) {
        return secureValue;
      }
    } catch {
      // Fall through to AsyncStorage migration path.
    }

    return AsyncStorage.getItem(key);
  },

  setItem: async (key: string, value: string): Promise<void> => {
    if (value.length <= SECURESTORE_LIMIT) {
      await SecureStore.setItemAsync(key, value);
      await AsyncStorage.removeItem(key);
      return;
    }

    await AsyncStorage.setItem(key, value);
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {
      // Ignore cleanup errors.
    }
  },

  removeItem: async (key: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {
      // Ignore missing secure keys.
    }
    await AsyncStorage.removeItem(key);
  },
};
