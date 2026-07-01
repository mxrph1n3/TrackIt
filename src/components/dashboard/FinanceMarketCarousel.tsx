import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { getMarketQuotesForCurrency } from '../../lib/finance/marketQuotes';
import { useTheme } from '../../theme/ThemeContext';
import { BalanceTrendSparkline } from '../finance/BalanceTrendSparkline';

type FinanceMarketCarouselProps = {
  displayCurrency: string;
};

export function FinanceMarketCarousel({ displayCurrency }: FinanceMarketCarouselProps) {
  const { theme } = useTheme();
  const quotes = getMarketQuotesForCurrency(displayCurrency);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          marginTop: 10,
        },
        kicker: {
          marginBottom: 8,
          fontSize: 10,
          fontWeight: '700',
          letterSpacing: 1.2,
          textTransform: 'uppercase',
          color: theme.textMuted,
        },
        row: {
          gap: 10,
          paddingRight: 4,
        },
        card: {
          width: 146,
          borderRadius: 16,
          paddingHorizontal: 12,
          paddingVertical: 10,
          backgroundColor: 'rgba(255,255,255,0.52)',
          borderWidth: 1,
        },
        cardTop: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
        badge: {
          borderRadius: 999,
          paddingHorizontal: 8,
          paddingVertical: 3,
        },
        symbol: {
          fontSize: 10,
          fontWeight: '800',
          letterSpacing: 0.4,
        },
        change: {
          fontSize: 10,
          fontWeight: '800',
        },
        name: {
          marginTop: 8,
          fontSize: 11,
          fontWeight: '600',
          color: theme.textSecondary,
        },
        price: {
          marginTop: 2,
          fontSize: 14,
          fontWeight: '900',
          color: theme.textPrimary,
          letterSpacing: -0.3,
        },
        chartRow: {
          marginTop: 8,
          alignItems: 'flex-start',
        },
      }),
    [theme],
  );

  return (
    <View style={styles.wrap}>
      <Text style={styles.kicker}>Markets</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={156}
        contentContainerStyle={styles.row}
      >
        {quotes.map((quote) => {
          const up = quote.changePercent >= 0;
          const changeColor = up ? '#34D399' : '#F87171';

          return (
            <View key={quote.id} style={[styles.card, { borderColor: `${quote.accent}28` }]}>
              <View style={styles.cardTop}>
                <View style={[styles.badge, { backgroundColor: `${quote.accent}18` }]}>
                  <Text style={[styles.symbol, { color: quote.accent }]}>{quote.symbol}</Text>
                </View>
                <Text style={[styles.change, { color: changeColor }]}>
                  {up ? '+' : ''}
                  {quote.changePercent.toFixed(1)}%
                </Text>
              </View>

              <Text style={styles.name} numberOfLines={1}>
                {quote.name}
              </Text>
              <Text style={styles.price}>{quote.priceLabel}</Text>

              <View style={styles.chartRow}>
                <BalanceTrendSparkline
                  points={quote.sparkline}
                  width={118}
                  height={28}
                  color={changeColor}
                />
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
