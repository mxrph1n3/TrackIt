import AsyncStorage from '@react-native-async-storage/async-storage';

/** Web / TMA: session tokens in AsyncStorage (localStorage under the hood). */
export const supabaseAuthStorage = {
  getItem: (key: string) => AsyncStorage.getItem(key),
  setItem: (key: string, value: string) => AsyncStorage.setItem(key, value),
  removeItem: (key: string) => AsyncStorage.removeItem(key),
};
