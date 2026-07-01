import { Crown, Pencil } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { getDashboardTierTheme } from '../../lib/dashboard/tierTheme';
import { useProgression } from '../../hooks/useProgression';
import { usePaywallStore } from '../../stores/usePaywallStore';
import { selectIsPro, useSubscriptionStore } from '../../stores/useSubscriptionStore';
import { useTheme } from '../../theme/ThemeContext';
import { PremiumBadge } from '../paywall/PremiumBadge';
import { USER_AVATAR_SIZES, UserAvatar } from '../ui/UserAvatar';
import { UsernameEditModal } from './UsernameEditModal';

export function ProfileHero() {
  const { profileStats, updateUsername, isUpdatingUsername } = useProgression();
  const { theme } = useTheme();
  const isPro = useSubscriptionStore(selectIsPro);
  const openPaywall = usePaywallStore((s) => s.openPaywall);
  const tierTheme = getDashboardTierTheme(profileStats.level);
  const [isEditOpen, setIsEditOpen] = useState(false);

  return (
    <View className="items-center px-4 pb-2 pt-4">
      <UserAvatar size={USER_AVATAR_SIZES.profile} accessibilityLabel="My profile avatar" />

      <View className="mt-6 min-h-[36px] flex-row items-center justify-center gap-2">
        <Pressable
          onPress={() => setIsEditOpen(true)}
          className="flex-row items-center gap-2 active:opacity-80"
          accessibilityRole="button"
          accessibilityLabel={`Username ${profileStats.username}. Tap to edit.`}
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
        FOCUS • DISCIPLINE • FREEDOM
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
            RANK {profileStats.rank}
          </Text>
        </View>
        {isPro ? <PremiumBadge label="PRO" /> : null}
      </View>

      {!isPro ? (
        <Pressable
          onPress={() => openPaywall()}
          className="mt-4 flex-row items-center gap-2 rounded-full px-5 py-2.5 active:opacity-90"
          style={{
            backgroundColor: `${theme.primary}18`,
            borderWidth: 1,
            borderColor: `${theme.primary}44`,
          }}
        >
          <Crown color={theme.primary} size={14} strokeWidth={2.2} />
          <Text className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: theme.primary }}>
            Upgrade to Pro
          </Text>
        </Pressable>
      ) : null}

      <View className="mt-3 rounded-full border border-obsidian-primary/50 bg-[rgba(168,85,247,0.22)] px-5 py-2">
        <Text
          className="text-xs font-bold uppercase tracking-[0.25em]"
          style={{ color: theme.textPrimary }}
        >
          LEVEL {profileStats.level}
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
