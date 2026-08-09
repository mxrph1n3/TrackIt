import { Crown } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

import { ANDROID_TRIAL_DAYS } from '../../constants/androidBilling';
import { isAppFullyFree } from '../../constants/appAccess';
import { SUBSCRIPTION_DISPLAY_PRICING } from '../../constants/subscriptions';
import { usePaywallStore } from '../../stores/usePaywallStore';
import {
  selectAndroidTrial,
  selectHasPaidPro,
  useSubscriptionStore,
} from '../../stores/useSubscriptionStore';
import { BRAND } from '../../theme/designTokens';
import { useTheme } from '../../theme/ThemeContext';
import { GlassPanel } from '../GlassPanel';

/** Shown on iOS/Android during soft trial — full access + early subscribe CTA. */
export function AndroidTrialBanner() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const trial = useSubscriptionStore(selectAndroidTrial);
  const hasPaidPro = useSubscriptionStore(selectHasPaidPro);
  const openPaywall = usePaywallStore((s) => s.openPaywall);

  if (isAppFullyFree() || hasPaidPro || !trial.isInTrial) {
    return null;
  }

  const price = SUBSCRIPTION_DISPLAY_PRICING.monthly.price;

  return (
    <GlassPanel borderRadius={18} style={{ marginBottom: 14 }}>
      <Pressable
        onPress={() => openPaywall()}
        className="flex-row items-center gap-3 p-4 active:opacity-90"
        accessibilityRole="button"
        accessibilityLabel={t('common.subscribe')}
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
            {t('trial.bannerTitle', {
              remaining: trial.trialDaysRemaining,
              total: ANDROID_TRIAL_DAYS,
            })}
          </Text>
          <Text style={{ marginTop: 2, fontSize: 12, lineHeight: 17, color: theme.textSecondary }}>
            {t('trial.bannerBody', { price })}
          </Text>
        </View>
        <Text style={{ fontSize: 12, fontWeight: '800', color: theme.primary }}>
          {t('common.subscribe')}
        </Text>
      </Pressable>
    </GlassPanel>
  );
}
