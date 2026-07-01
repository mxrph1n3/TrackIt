export type MarketQuote = {
  id: string;
  symbol: string;
  name: string;
  priceLabel: string;
  changePercent: number;
  kind: 'crypto' | 'fx' | 'stock';
  accent: string;
  sparkline: number[];
};

const QUOTES: MarketQuote[] = [
  {
    id: 'btc',
    symbol: 'BTC',
    name: 'Bitcoin',
    priceLabel: '$67 420',
    changePercent: 2.4,
    kind: 'crypto',
    accent: '#F59E0B',
    sparkline: [62, 63, 61, 64, 66, 65, 67.4],
  },
  {
    id: 'eth',
    symbol: 'ETH',
    name: 'Ethereum',
    priceLabel: '$3 540',
    changePercent: 1.8,
    kind: 'crypto',
    accent: '#6366F1',
    sparkline: [3.2, 3.25, 3.18, 3.3, 3.42, 3.48, 3.54],
  },
  {
    id: 'usd-rub',
    symbol: 'USD/RUB',
    name: 'US Dollar',
    priceLabel: '92.40 ₽',
    changePercent: -0.3,
    kind: 'fx',
    accent: '#34D399',
    sparkline: [92.8, 92.6, 92.5, 92.7, 92.4, 92.3, 92.4],
  },
  {
    id: 'eur-rub',
    symbol: 'EUR/RUB',
    name: 'Euro',
    priceLabel: '100.15 ₽',
    changePercent: 0.1,
    kind: 'fx',
    accent: '#38BDF8',
    sparkline: [99.6, 99.8, 99.9, 100.0, 100.2, 100.1, 100.15],
  },
  {
    id: 'aapl',
    symbol: 'AAPL',
    name: 'Apple',
    priceLabel: '$214.20',
    changePercent: 0.9,
    kind: 'stock',
    accent: '#94A3B8',
    sparkline: [210, 211, 209, 212, 213, 214, 214.2],
  },
  {
    id: 'nvda',
    symbol: 'NVDA',
    name: 'NVIDIA',
    priceLabel: '$128.60',
    changePercent: 3.1,
    kind: 'stock',
    accent: '#76B900',
    sparkline: [118, 121, 120, 124, 126, 127, 128.6],
  },
  {
    id: 'sber',
    symbol: 'SBER',
    name: 'Sberbank',
    priceLabel: '285.40 ₽',
    changePercent: -1.2,
    kind: 'stock',
    accent: '#22C55E',
    sparkline: [292, 290, 288, 287, 286, 285, 285.4],
  },
  {
    id: 'gazp',
    symbol: 'GAZP',
    name: 'Gazprom',
    priceLabel: '128.90 ₽',
    changePercent: -0.8,
    kind: 'stock',
    accent: '#3B82F6',
    sparkline: [131, 130, 129.5, 129, 128.5, 128.7, 128.9],
  },
];

export function getMarketQuotes(): MarketQuote[] {
  return QUOTES;
}

export function getMarketQuotesForCurrency(displayCurrency: string): MarketQuote[] {
  if (displayCurrency === 'USD') {
    return QUOTES.filter((quote) => quote.id !== 'usd-rub');
  }
  return QUOTES;
}
