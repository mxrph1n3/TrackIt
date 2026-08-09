import { Crown, Pencil } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

import { ANDROID_TRIAL_DAYS } from '../../constants/androidBilling';
import { getDashboardTierTheme } from '../../lib/dashboard/tierTheme';
import { isAppFullyFree } from '../../constants/appAccess';
import { SUBSCRIPTION_DISPLAY_PRICING } from '../../constants/subscriptions';
import { useProgression } from '../../hooks/useProgression';
import { usePaywallStore } from '../../stores/usePaywallStore';
import {
  selectAndroidTrial,
  selectHasPaidPro,
  selectIsPro,
  useSubscriptionStore,
} from '../../stores/useSubscriptionStore';
import { useTheme } from '../../theme/ThemeContext';
import { PremiumBadge } from '../paywall/PremiumBadge';
import { USER_AVATAR_SIZES, UserAvatar } from '../ui/UserAvatar';
import { UsernameEditModal } from './UsernameEditModal';

export function ProfileHero() {
  const { t } = useTranslation();
  const { profileStats, updateUsername, isUpdatingUsername } = useProgression();
  const { theme } = useTheme();
  const isPro = useSubscriptionStore(selectIsPro);
  const hasPaidPro = useSubscriptionStore(selectHasPaidPro);
  const androidTrial = useSubscriptionStore(selectAndroidTrial);
  const openPaywall = usePaywallStore((s) => s.openPaywall);
  const tierTheme = getDashboardTierTheme(profileStats.level);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const showUpgradeCta = !isAppFullyFree() && !hasPaidPro;
  const inSoftTrial = androidTrial.isInTrial && !hasPaidPro;
  const price = SUBSCRIPTION_DISPLAY_PRICING.monthly.price;

  return (
    <View className="items-center px-4 pb-2 pt-4">
      <UserAvatar size={USER_AVATAR_SIZES.profile} accessibilityLabel={t('profile.avatarA11y')} />

      <View className="mt-6 min-h-[36px] flex-row items-center justify-center gap-2">
        <Pressable
          onPress={() => setIsEditOpen(true)}
          className="flex-row items-center gap-2 active:opacity-80"
          accessibilityRole="button"
          accessibilityLabel={t('profile.editUsernameA11y', { username: profileStats.username })}
        >
          <Text
            className="text-2xl font-black tracking-[0.2em]"
            style={{ color: theme.textPrimary }}
          >
            {profileStats.username}
          </Text>
          <View className="rounded-full border border-obsidian-primary/40 bg-obsidian-primary/15 p-1.5">
            <Pencil color="#775DD8" size={14} strokeWidth={2.4} />
          </View>
        </Pressable>
      </View>

      <Text
        className="mt-2 text-center text-[11px] font-semibold tracking-widest"
        style={{ color: theme.textSecondary }}
      >
        {t('profile.tagline')}
      </Text>

      <View className="mt-3 flex-row items-center gap-2">
        <View
          className="rounded-full px-3 py-1"
          style={{
            backgroundColor: tierTheme.capsuleBackground,
            borderWidth: 1,
            borderColor: tierTheme.capsuleBorder,
          }}
        >
          <Text
            className="text-[10px] font-black uppercase tracking-[0.2em]"
            style={{ color: tierTheme.primary }}
          >
            {t('profile.rank', { rank: profileStats.rank })}
          </Text>
        </View>
        {hasPaidPro && !isAppFullyFree() ? <PremiumBadge label={t('common.pro')} /> : null}
        {inSoftTrial ? (
          <View
            className="rounded-full px-3 py-1"
            style={{
              backgroundColor: `${theme.primary}18`,
              borderWidth: 1,
              borderColor: `${theme.primary}44`,
            }}
          >
            <Text
              className="text-[10px] font-black uppercase tracking-[0.15em]"
              style={{ color: theme.primary }}
            >
              {t('profile.trialBadge', {
                remaining: androidTrial.trialDaysRemaining,
                total: ANDROID_TRIAL_DAYS,
              })}
            </Text>
          </View>
        ) : null}
      </View>

      {showUpgradeCta ? (
        <Pressable
          onPress={() => openPaywall()}
          className="mt-4 flex-row items-center gap-2 rounded-full px-5 py-2.5 active:opacity-90"
          style={{
            backgroundColor: `${theme.primary}18`,
            borderWidth: 1,
            borderColor: `${theme.primary}44`,
          }}
          accessibilityRole="button"
          accessibilityLabel={
            inSoftTrial ? t('profile.subscribeBeforeTrialA11y') : t('profile.upgradeProA11y')
          }
        >
          <Crown color={theme.primary} size={14} strokeWidth={2.2} />
          <Text className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: theme.primary }}>
            {inSoftTrial
              ? t('profile.subscribeCta', { price })
              : t('profile.upgradeCta')}
          </Text>
        </Pressable>
      ) : null}

      {inSoftTrial ? (
        <Text
          className="mt-2 px-4 text-center text-[11px] leading-4"
          style={{ color: theme.textMuted }}
        >
          {t('profile.trialHint', { days: ANDROID_TRIAL_DAYS })}
        </Text>
      ) : null}

      {!isPro && !isAppFullyFree() && androidTrial.isExpired ? (
        <Text
          className="mt-2 px-4 text-center text-[11px] leading-4"
          style={{ color: theme.textMuted }}
        >
          {t('profile.trialEnded')}
        </Text>
      ) : null}

      <View className="mt-3 rounded-full border border-obsidian-primary/50 bg-[rgba(168,85,247,0.22)] px-5 py-2">
        <Text
          className="text-xs font-bold uppercase tracking-[0.25em]"
          style={{ color: theme.textPrimary }}
        >
          {t('profile.levelLabel', { level: profileStats.level })}
        </Text>
      </View>

      <UsernameEditModal
        visible={isEditOpen}
        currentUsername={profileStats.username}
        isSaving={isUpdatingUsername}
        onClose={() => setIsEditOpen(false)}
        onSave={updateUsername}
      />
    </View>
  );
}
