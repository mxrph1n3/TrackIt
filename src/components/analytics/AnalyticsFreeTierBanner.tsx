import { Crown } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { FREE_ANALYTICS_DAYS } from '../../constants/workoutFreeTier';
import { usePaywallStore } from '../../stores/usePaywallStore';
import { selectIsPro, useSubscriptionStore } from '../../stores/useSubscriptionStore';
import { BRAND } from '../../theme/designTokens';
import { useTheme } from '../../theme/ThemeContext';
import { GlassPanel } from '../GlassPanel';

export function AnalyticsFreeTierBanner() {
  const { theme } = useTheme();
  const isPro = useSubscriptionStore(selectIsPro);
  const openPaywall = usePaywallStore((s) => s.openPaywall);

  if (isPro) {
    return null;
  }

  return (
    <GlassPanel borderRadius={18} style={{ marginBottom: 14 }}>
      <Pressable
        onPress={() => openPaywall('advanced_analytics')}
        className="flex-row items-center gap-3 p-4 active:opacity-90"
      >
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: `${BRAND.primary}18`,
          }}
        >
          <Crown color={theme.primary} size={16} strokeWidth={2.2} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 13, fontWeight: '800', color: theme.textPrimary }}>
            Free analytics · last {FREE_ANALYTICS_DAYS} days
          </Text>
          <Text style={{ marginTop: 2, fontSize: 12, lineHeight: 17, color: theme.textSecondary }}>
            Upgrade to Pro for 4-week heatmaps, full history, and advanced insights.
          </Text>
        </View>
        <Text style={{ fontSize: 12, fontWeight: '800', color: theme.primary }}>Pro</Text>
      </Pressable>
    </GlassPanel>
  );
}
