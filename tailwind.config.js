/** @type {import('tailwindcss').Config} */
/** Values mirror `src/theme/designTokens.ts` — keep in sync. */
const BRAND = { primary: '#775DD8', primaryDeep: '#6249C0', primaryLight: '#9580E8', accent: '#818CF8' };
const TEXT = { primary: '#1E1A3E', secondary: '#7F7D9C', muted: '#8E89B3', kicker: '#3D3855' };
const SURFACE = {
  background: '#F3F5FA',
  card: 'rgba(255, 255, 255, 0.75)',
  border: 'rgba(255, 255, 255, 0.60)',
  ambientGlowSolid: '#E2D9FF',
};
const SEMANTIC = {
  income: '#059669',
  incomeSoft: '#34D399',
  expense: '#E11D48',
  expenseSoft: '#F87171',
  warning: '#F59E0B',
};
const RADIUS = { control: 14, inset: 20, card: 28 };
const SPACING = { screenGutter: 20, cardGap: 14, sectionGap: 20 };

module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        ethereal: {
          base: 'var(--ethereal-base)',
          mist: 'var(--ethereal-mist)',
          white: '#FFFFFF',
          ink: 'rgb(var(--ethereal-ink) / <alpha-value>)',
          'ink-deep': 'rgb(var(--ethereal-ink) / <alpha-value>)',
          slate: 'rgb(var(--ethereal-slate) / <alpha-value>)',
          muted: 'rgb(var(--ethereal-muted) / <alpha-value>)',
          kicker: 'rgb(var(--ethereal-kicker) / <alpha-value>)',
          neon: BRAND.primary,
          'neon-core': BRAND.primary,
          'neon-deep': BRAND.primaryDeep,
          'neon-light': BRAND.primaryLight,
          accent: BRAND.accent,
          lavender: SURFACE.ambientGlowSolid,
          glass: 'var(--ethereal-glass)',
          'glass-border': 'var(--ethereal-glass-border)',
        },
        /** Legacy `obsidian-*` text aliases — use dark ink on Ethereal light UI. */
        obsidian: {
          bg: '#07070A',
          card: 'rgba(15, 15, 25, 0.75)',
          border: 'rgba(255, 255, 255, 0.1)',
          primary: BRAND.primary,
          secondary: BRAND.accent,
          muted: TEXT.muted,
          subtle: TEXT.secondary,
        },
        finance: {
          green: SEMANTIC.income,
          'green-soft': SEMANTIC.incomeSoft,
          red: SEMANTIC.expense,
          'red-soft': SEMANTIC.expenseSoft,
          blue: BRAND.primary,
          indigo: TEXT.primary,
          warning: SEMANTIC.warning,
        },
      },
      spacing: {
        gutter: `${SPACING.screenGutter}px`,
        'card-gap': `${SPACING.cardGap}px`,
        section: `${SPACING.sectionGap}px`,
      },
      letterSpacing: {
        widest: '0.25em',
        ethereal: '0.2em',
        kicker: '0.22em',
      },
      boxShadow: {
        'neon-purple': '0 0 16px rgba(119, 93, 216, 0.55)',
        'neon-purple-soft': '0 0 12px rgba(119, 93, 216, 0.35)',
        'ethereal-card': '0 8px 20px rgba(119, 93, 216, 0.05)',
      },
      borderRadius: {
        ethereal: `${RADIUS.card}px`,
        control: `${RADIUS.control}px`,
        inset: `${RADIUS.inset}px`,
        card: `${RADIUS.card}px`,
      },
    },
  },
  plugins: [],
};
