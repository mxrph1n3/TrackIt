import AsyncStorage from '@react-native-async-storage/async-storage';

const favoritesKey = (userId: string) => `@trackit/quote_favorites:${userId}`;

export async function loadQuoteFavorites(userId: string): Promise<Set<string>> {
  const raw = await AsyncStorage.getItem(favoritesKey(userId));
  if (!raw) {
    return new Set();
  }

  try {
    const parsed = JSON.parse(raw) as string[];
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

export async function saveQuoteFavorites(userId: string, favorites: Set<string>): Promise<void> {
  await AsyncStorage.setItem(favoritesKey(userId), JSON.stringify([...favorites]));
}
