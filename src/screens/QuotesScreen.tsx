import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { GlassPanel } from '../components/GlassPanel';
import { IsolatedScreenLayout } from '../components/layout/IsolatedScreenShell';
import { ScreenHeader } from '../components/ui/ScreenHeader';
import { QUOTE_FILTERS, QUOTES, type QuoteCategory } from '../constants/quotes';
import { loadQuoteFavorites, saveQuoteFavorites } from '../lib/quotes/favoritesStorage';
import { useGamificationStore } from '../stores/useGamificationStore';
import { useProfileModuleStore } from '../stores/useProfileModuleStore';
import { useTheme } from '../theme/ThemeContext';

export function QuotesScreen() {
  const { theme } = useTheme();
  const userId = useGamificationStore((state) => state.profile?.id);
  const closeModule = useProfileModuleStore((state) => state.closeModule);
  const [filter, setFilter] = useState<QuoteCategory>('all');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!userId) {
      setFavorites(new Set());
      return;
    }

    void loadQuoteFavorites(userId).then(setFavorites);
  }, [userId]);

  const filteredQuotes = useMemo(() => {
    if (filter === 'all') {
      return QUOTES;
    }
    return QUOTES.filter((quote) => quote.category === filter);
  }, [filter]);

  const toggleFavorite = useCallback(
    (id: string) => {
      setFavorites((current) => {
        const next = new Set(current);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }

        if (userId) {
          void saveQuoteFavorites(userId, next);
        }

        return next;
      });
    },
    [userId],
  );

  return (
    <IsolatedScreenLayout
      header={<ScreenHeader title="QUOTES" subtitle="Motivation Hub" onBack={closeModule} />}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingBottom: 14 }}
      >
        {QUOTE_FILTERS.map((item) => {
          const active = filter === item.id;
          return (
            <Pressable
              key={item.id}
              onPress={() => setFilter(item.id)}
              className="rounded-full px-4 py-2"
              style={{
                backgroundColor: active ? theme.primary : 'rgba(255,255,255,0.08)',
              }}
            >
              <Text
                className="text-xs font-bold uppercase tracking-[0.12em]"
                style={{ color: active ? '#FFFFFF' : theme.textSecondary }}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View className="gap-3">
        {filteredQuotes.map((quote) => {
          const isFavorite = favorites.has(quote.id);
          return (
            <GlassPanel key={quote.id} borderRadius={24}>
              <View
                className="gap-3 p-5"
                style={{ borderLeftWidth: 3, borderLeftColor: quote.accent }}
              >
                <Text className="text-base leading-7 text-ethereal-ink">"{quote.text}"</Text>
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm font-semibold text-ethereal-slate">— {quote.author}</Text>
                  <Pressable onPress={() => toggleFavorite(quote.id)}>
                    <Text
                      className="text-xs font-bold uppercase tracking-[0.12em]"
                      style={{ color: isFavorite ? quote.accent : theme.textMuted }}
                    >
                      {isFavorite ? 'Saved' : 'Save'}
                    </Text>
                  </Pressable>
                </View>
              </View>
            </GlassPanel>
          );
        })}
      </View>
    </IsolatedScreenLayout>
  );
}
