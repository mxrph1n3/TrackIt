import { LinearGradient } from 'expo-linear-gradient';
import { Check, Crown, Sparkles, X } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { GlassPanel } from '../components/GlassPanel';
import { IsolatedScreenLayout } from '../components/layout/IsolatedScreenShell';
import { ScreenHeader } from '../components/ui/ScreenHeader';
import {
  FREE_TRIAL_DAYS,
  PREMIUM_BENEFITS,
  SUBSCRIPTION_DISPLAY_PRICING,
  SUBSCRIPTION_PRODUCT_IDS,
} from '../constants/subscriptions';
import { PRIVACY_POLICY_URL, TERMS_OF_SERVICE_URL } from '../constants/legal';
import {
  getTmaStarsPrice,
  TMA_STARS_BILLING_PERIOD_LABEL,
  TMA_TRIAL_DAYS,
} from '../constants/tmaBilling';
import { useAppSafeAreaInsets } from '../hooks/useAppSafeAreaInsets';
import { PREMIUM_FEATURE_META } from '../lib/subscription/features';
import { IS_WEB } from '../lib/platform/constants';
import { triggerHaptic } from '../lib/platform/haptics';
import { isTelegramMiniApp } from '../lib/telegram/telegramWebApp';
import { isRevenueCatReady, selectHasPaidPro, useSubscriptionStore } from '../stores/useSubscriptionStore';
import { usePaywallStore } from '../stores/usePaywallStore';
import { useProfileModuleStore } from '../stores/useProfileModuleStore';
import { BRAND, RADIUS } from '../theme/designTokens';
import { useTheme } from '../theme/ThemeContext';
import type { PremiumFeatureId, SubscriptionProductId } from '../types/subscription';

type PremiumScreenProps = {
  /** When shown as a modal overlay, pass onClose instead of using profile module back. */
  onClose?: () => void;
  /** Contextual feature that triggered the paywall. */
  feature?: PremiumFeatureId | null;
  /** Hide the close/back header when embedded in PaywallHost. */
  showHeader?: boolean;
};

export function PremiumScreen({
  onClose,
  feature = null,
  showHeader = true,
}: PremiumScreenProps) {
  const insets = useAppSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const closeModule = useProfileModuleStore((s) => s.closeModule);
  const closePaywall = usePaywallStore((s) => s.closePaywall);

  const hasPaidPro = useSubscriptionStore(selectHasPaidPro);
  const tmaAccess = useSubscriptionStore((s) => s.tmaAccess);
  const isTma = IS_WEB && isTelegramMiniApp();
  const starsPrice = getTmaStarsPrice();
  const offerings = useSubscriptionStore((s) => s.offerings);
  const isPurchasing = useSubscriptionStore((s) => s.isPurchasing);
  const isLoading = useSubscriptionStore((s) => s.isLoading);
  const error = useSubscriptionStore((s) => s.error);
  const purchase = useSubscriptionStore((s) => s.purchase);
  const restore = useSubscriptionStore((s) => s.restore);
  const clearError = useSubscriptionStore((s) => s.clearError);
  const purchaseWithStars = useSubscriptionStore((s) => s.purchaseWithStars);

  const [selectedPlan, setSelectedPlan] = useState<SubscriptionProductId>(
    SUBSCRIPTION_PRODUCT_IDS.yearly,
  );

  const handleClose = useCallback(() => {
    if (onClose) {
      onClose();
      return;
    }
    closePaywall();
    closeModule();
  }, [closeModule, closePaywall, onClose]);

  const featureMeta = feature ? PREMIUM_FEATURE_META[feature] : null;

  const monthlyPrice =
    offerings.monthly?.priceString ?? SUBSCRIPTION_DISPLAY_PRICING.monthly.price;
  const yearlyPrice =
    offerings.yearly?.priceString ?? SUBSCRIPTION_DISPLAY_PRICING.yearly.price;

  const handlePurchase = useCallback(async () => {
    void triggerHaptic('medium');
    clearError();
    const success = await purchase(selectedPlan);
    if (success) {
      void triggerHaptic('success');
      handleClose();
    }
  }, [clearError, handleClose, purchase, selectedPlan]);

  const refresh = useSubscriptionStore((s) => s.refresh);

  const handleStarsPurchase = useCallback(async () => {
    void triggerHaptic('medium');
    clearError();
    const success = await purchaseWithStars();
    if (success) {
      void triggerHaptic('success');
      handleClose();
    }
  }, [clearError, handleClose, purchaseWithStars]);

  const handleRestore = useCallback(async () => {
    void triggerHaptic('selection');
    clearError();
    const restored = await restore();
    if (restored) {
      void triggerHaptic('success');
      handleClose();
    }
  }, [clearError, handleClose, restore]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        heroGradient: {
          borderRadius: RADIUS.inset,
          padding: 20,
          marginBottom: 16,
        },
        heroRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
        },
        heroTitle: {
          fontSize: 26,
          fontWeight: '900',
          color: theme.textPrimary,
          letterSpacing: -0.5,
        },
        heroSubtitle: {
          marginTop: 8,
          fontSize: 14,
          lineHeight: 21,
          color: theme.textSecondary,
        },
        featureCallout: {
          marginTop: 14,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: `${BRAND.primary}44`,
          backgroundColor: `${BRAND.primary}14`,
          padding: 12,
        },
        featureCalloutTitle: {
          fontSize: 13,
          fontWeight: '800',
          color: theme.textPrimary,
        },
        featureCalloutBody: {
          marginTop: 4,
          fontSize: 12,
          lineHeight: 18,
          color: theme.textSecondary,
        },
        planCard: {
          borderRadius: 18,
          borderWidth: 1.5,
          borderColor: theme.borderSubtle,
          padding: 16,
          marginBottom: 10,
        },
        planCardSelected: {
          borderColor: BRAND.primary,
          backgroundColor: `${BRAND.primary}12`,
        },
        planRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
        planLabel: {
          fontSize: 15,
          fontWeight: '800',
          color: theme.textPrimary,
        },
        planPrice: {
          fontSize: 15,
          fontWeight: '800',
          color: theme.textPrimary,
        },
        planMeta: {
          marginTop: 4,
          fontSize: 12,
          fontWeight: '600',
          color: theme.textMuted,
        },
        savingsBadge: {
          marginTop: 8,
          alignSelf: 'flex-start',
          borderRadius: 999,
          backgroundColor: '#34D399',
          paddingHorizontal: 10,
          paddingVertical: 4,
        },
        savingsText: {
          fontSize: 11,
          fontWeight: '800',
          color: '#052E1A',
        },
        benefitRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          paddingVertical: 7,
        },
        benefitText: {
          flex: 1,
          fontSize: 13,
          fontWeight: '600',
          color: theme.textPrimary,
        },
        primaryButton: {
          marginTop: 8,
          borderRadius: 16,
          backgroundColor: BRAND.primary,
          paddingVertical: 16,
          alignItems: 'center',
        },
        primaryButtonLabel: {
          fontSize: 15,
          fontWeight: '800',
          color: '#FFFFFF',
        },
        secondaryButton: {
          marginTop: 12,
          alignItems: 'center',
          paddingVertical: 10,
        },
        secondaryLabel: {
          fontSize: 13,
          fontWeight: '700',
          color: theme.textSecondary,
        },
        errorText: {
          marginTop: 10,
          fontSize: 12,
          fontWeight: '600',
          color: '#F59E0B',
          textAlign: 'center',
        },
        proActiveCard: {
          alignItems: 'center',
          paddingVertical: 24,
        },
        proActiveTitle: {
          marginTop: 12,
          fontSize: 20,
          fontWeight: '900',
          color: theme.textPrimary,
        },
        proActiveBody: {
          marginTop: 8,
          fontSize: 14,
          lineHeight: 20,
          color: theme.textSecondary,
          textAlign: 'center',
        },
        configNote: {
          marginTop: 16,
          fontSize: 11,
          lineHeight: 16,
          color: theme.textMuted,
          textAlign: 'center',
        },
        closeButton: {
          position: 'absolute',
          right: 16,
          top: insets.top + 8,
          width: 36,
          height: 36,
          borderRadius: 18,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.card,
          borderWidth: 1,
          borderColor: theme.borderSubtle,
          zIndex: 10,
        },
        legalRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          marginTop: 18,
          marginBottom: 4,
        },
        legalLink: {
          fontSize: 12,
          fontWeight: '600',
          color: theme.textSecondary,
          textDecorationLine: 'underline',
        },
        legalDivider: {
          fontSize: 12,
          color: theme.textMuted,
        },
      }),
    [insets.top, theme],
  );

  const gradientColors = isDark
    ? (['rgba(119, 93, 216, 0.28)', 'rgba(15, 15, 25, 0.6)'] as const)
    : (['rgba(119, 93, 216, 0.16)', 'rgba(255,255,255,0.7)'] as const);

  const content = (
    <>
      {!showHeader && (
        <Pressable
          onPress={handleClose}
          style={styles.closeButton}
          accessibilityRole="button"
          accessibilityLabel="Close"
        >
          <X color={theme.textPrimary} size={18} />
        </Pressable>
      )}

      <LinearGradient colors={[...gradientColors]} style={styles.heroGradient}>
        <View style={styles.heroRow}>
          <Crown color={BRAND.primary} size={28} strokeWidth={2.2} />
          <Text style={styles.heroTitle}>Unlock TrackIt Pro</Text>
          <Sparkles color={BRAND.primaryLight} size={18} />
        </View>
        <Text style={styles.heroSubtitle}>
          Your intelligent assistant across tasks, workouts, nutrition, finance, and habits.
        </Text>
        {featureMeta ? (
          <View style={styles.featureCallout}>
            <Text style={styles.featureCalloutTitle}>{featureMeta.title}</Text>
            <Text style={styles.featureCalloutBody}>{featureMeta.description}</Text>
          </View>
        ) : null}
      </LinearGradient>

      {hasPaidPro ? (
        <GlassPanel borderRadius={RADIUS.inset}>
          <View style={styles.proActiveCard}>
            <Crown color={BRAND.primary} size={40} />
            <Text style={styles.proActiveTitle}>TrackIt Pro is active</Text>
            <Text style={styles.proActiveBody}>
              {tmaAccess.isInTrial
                ? `Trial active — ${tmaAccess.trialDaysRemaining} day(s) left with full access and reminders.`
                : tmaAccess.hasStarsSubscription
                  ? 'Monthly Telegram Stars subscription active. AI Coach, analytics, and reminders are unlocked.'
                  : 'AI Coach, advanced analytics, cloud sync, and premium themes are unlocked.'}
            </Text>
            <Pressable onPress={() => void refresh()} style={styles.secondaryButton}>
              <Text style={styles.secondaryLabel}>Refresh subscription status</Text>
            </Pressable>
          </View>
        </GlassPanel>
      ) : (
        <>
          <Text
            style={{
              fontSize: 11,
              fontWeight: '700',
              letterSpacing: 2,
              textTransform: 'uppercase',
              color: theme.textMuted,
              marginBottom: 10,
            }}
          >
            {IS_WEB ? 'Subscription' : 'Choose a plan'}
          </Text>

          {!IS_WEB ? (
            <>
              <Pressable
                onPress={() => setSelectedPlan(SUBSCRIPTION_PRODUCT_IDS.monthly)}
                style={[
                  styles.planCard,
                  selectedPlan === SUBSCRIPTION_PRODUCT_IDS.monthly && styles.planCardSelected,
                ]}
              >
                <View style={styles.planRow}>
                  <Text style={styles.planLabel}>{SUBSCRIPTION_DISPLAY_PRICING.monthly.label}</Text>
                  <Text style={styles.planPrice}>
                    {monthlyPrice}/{SUBSCRIPTION_DISPLAY_PRICING.monthly.period}
                  </Text>
                </View>
                <Text style={styles.planMeta}>Flexible monthly billing</Text>
              </Pressable>

              <Pressable
                onPress={() => setSelectedPlan(SUBSCRIPTION_PRODUCT_IDS.yearly)}
                style={[
                  styles.planCard,
                  selectedPlan === SUBSCRIPTION_PRODUCT_IDS.yearly && styles.planCardSelected,
                ]}
              >
                <View style={styles.planRow}>
                  <Text style={styles.planLabel}>{SUBSCRIPTION_DISPLAY_PRICING.yearly.label}</Text>
                  <Text style={styles.planPrice}>
                    {yearlyPrice}/{SUBSCRIPTION_DISPLAY_PRICING.yearly.period}
                  </Text>
                </View>
                <View style={styles.savingsBadge}>
                  <Text style={styles.savingsText}>
                    {SUBSCRIPTION_DISPLAY_PRICING.yearly.savingsLabel}
                  </Text>
                </View>
              </Pressable>
            </>
          ) : isTma ? (
            <>
              {tmaAccess.isInTrial ? (
                <GlassPanel borderRadius={RADIUS.inset} style={{ marginBottom: 12 }}>
                  <View style={{ padding: 16 }}>
                    <Text style={styles.planLabel}>
                      {TMA_TRIAL_DAYS}-day trial active
                    </Text>
                    <Text style={[styles.planMeta, { marginTop: 6 }]}>
                      {tmaAccess.trialDaysRemaining} day(s) left — full Pro access and Telegram
                      reminders included. Subscribe now to keep access after the trial.
                    </Text>
                  </View>
                </GlassPanel>
              ) : (
                <Text style={[styles.planMeta, { marginBottom: 12 }]}>
                  Your {TMA_TRIAL_DAYS}-day trial has ended. Subscribe with Telegram Stars (billed
                  monthly) to keep Pro features and smart reminders.
                </Text>
              )}

              <Pressable
                onPress={() => void handleStarsPurchase()}
                disabled={isPurchasing || isLoading}
                style={[styles.primaryButton, (isPurchasing || isLoading) && { opacity: 0.7 }]}
              >
                {isPurchasing ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryButtonLabel}>
                    {tmaAccess.isInTrial
                      ? `Subscribe — ${starsPrice} Stars / ${TMA_STARS_BILLING_PERIOD_LABEL}`
                      : `Unlock Pro — ${starsPrice} Stars / ${TMA_STARS_BILLING_PERIOD_LABEL}`}
                  </Text>
                )}
              </Pressable>

              <Pressable onPress={() => void refresh()} style={styles.secondaryButton}>
                <Text style={styles.secondaryLabel}>Refresh access status</Text>
              </Pressable>

              <Text style={[styles.configNote, { marginTop: 8 }]}>
                Billed monthly via Telegram Stars. Subscription renews automatically; cancel in
                Telegram → Settings → Stars.
              </Text>
            </>
          ) : (
            <Text style={[styles.planMeta, { marginBottom: 12 }]}>
              Subscribe on the iOS or Android app, then sync your Pro status here.
            </Text>
          )}

          <GlassPanel borderRadius={RADIUS.inset} style={{ marginTop: 8, marginBottom: 16 }}>
            <View style={{ padding: 16 }}>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '700',
                  letterSpacing: 2,
                  textTransform: 'uppercase',
                  color: theme.textMuted,
                  marginBottom: 4,
                }}
              >
                What&apos;s included
              </Text>
              {PREMIUM_BENEFITS.map((benefit) => (
                <View key={benefit} style={styles.benefitRow}>
                  <Check color={BRAND.primary} size={16} strokeWidth={2.5} />
                  <Text style={styles.benefitText}>{benefit}</Text>
                </View>
              ))}
            </View>
          </GlassPanel>

          {!IS_WEB ? (
            <Pressable
              onPress={() => void handlePurchase()}
              disabled={isPurchasing || isLoading || !isRevenueCatReady()}
              style={[
                styles.primaryButton,
                (isPurchasing || isLoading || !isRevenueCatReady()) && { opacity: 0.7 },
              ]}
            >
              {isPurchasing ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonLabel}>
                  {FREE_TRIAL_DAYS > 0
                    ? `Start ${FREE_TRIAL_DAYS}-day free trial`
                    : 'Upgrade to Pro'}
                </Text>
              )}
            </Pressable>
          ) : isTma ? null : (
            <Pressable
              onPress={() => void handleRestore()}
              disabled={isPurchasing || isLoading}
              style={[styles.primaryButton, (isPurchasing || isLoading) && { opacity: 0.7 }]}
            >
              {isPurchasing ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonLabel}>Sync subscription</Text>
              )}
            </Pressable>
          )}

          {!IS_WEB ? (
            <Pressable onPress={() => void handleRestore()} style={styles.secondaryButton}>
              <Text style={styles.secondaryLabel}>Restore purchases</Text>
            </Pressable>
          ) : null}

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {!isRevenueCatReady() && !IS_WEB ? (
            <Text style={styles.configNote}>
              Store billing is not configured in this build. Add EXPO_PUBLIC_REVENUECAT_APPLE_KEY
              and EXPO_PUBLIC_REVENUECAT_GOOGLE_KEY, then create products trackit_pro_monthly and
              trackit_pro_yearly in App Store Connect and Google Play Console.
            </Text>
          ) : null}

          {!IS_WEB ? (
            <Text style={styles.configNote}>
              {FREE_TRIAL_DAYS > 0
                ? `After the ${FREE_TRIAL_DAYS}-day free trial, payment is charged to your ${Platform.OS === 'ios' ? 'Apple ID' : 'Google Play'} account at ${selectedPlan === SUBSCRIPTION_PRODUCT_IDS.yearly ? `${yearlyPrice}/year` : `${monthlyPrice}/month`}. `
                : ''}
              The subscription renews automatically unless cancelled at least 24 hours before the
              end of the current period. Manage or cancel anytime in{' '}
              {Platform.OS === 'ios'
                ? 'Settings → Apple ID → Subscriptions'
                : 'Google Play → Subscriptions'}
              .
            </Text>
          ) : null}
        </>
      )}

      <View style={styles.legalRow}>
        <Pressable onPress={() => void Linking.openURL(PRIVACY_POLICY_URL)}>
          <Text style={styles.legalLink}>Privacy Policy</Text>
        </Pressable>
        <Text style={styles.legalDivider}>·</Text>
        <Pressable onPress={() => void Linking.openURL(TERMS_OF_SERVICE_URL)}>
          <Text style={styles.legalLink}>Terms of Service</Text>
        </Pressable>
      </View>
    </>
  );

  if (!showHeader) {
    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 52,
          paddingBottom: insets.bottom + 24,
          paddingHorizontal: 20,
        }}
      >
        {content}
      </ScrollView>
    );
  }

  return (
    <IsolatedScreenLayout
      header={
        <ScreenHeader title="TRACKIT PRO" subtitle="Intelligent life OS" onBack={handleClose} />
      }
    >
      {content}
    </IsolatedScreenLayout>
  );
}
