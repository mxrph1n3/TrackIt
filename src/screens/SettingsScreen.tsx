import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Linking, Platform, Pressable, Switch, Text, TextInput, View } from 'react-native';

import { GlassPanel } from '../components/GlassPanel';
import { LanguagePicker } from '../components/i18n/LanguagePicker';
import { IsolatedScreenLayout } from '../components/layout/IsolatedScreenShell';
import { ScreenHeader } from '../components/ui/ScreenHeader';
import { useAuth } from '../hooks/useAuth';
import { useGamification } from '../hooks/useGamification';
import { PRIVACY_POLICY_URL, SUPPORT_URL, TERMS_OF_SERVICE_URL } from '../constants/legal';
import { isAppFullyFree } from '../constants/appAccess';
import { getTmaMonthlyPriceLabel, TMA_TRIAL_DAYS } from '../constants/tmaBilling';
import { deleteAccount } from '../lib/account/accountService';
import { IS_WEB } from '../lib/platform/constants';
import { notificationsSupportedInRuntime } from '../lib/platform/services';
import { ensureNotificationPermissions } from '../lib/notifications/reminderService';
import { notifyTelegramRemindersEnabled, setTelegramRemindersEnabled } from '../lib/subscription/tmaAccessService';
import { isTelegramMiniApp } from '../lib/telegram/telegramWebApp';
import {
  ACTIVITY_LEVELS,
  resolveNutritionTargets,
  updateNutritionProfile,
} from '../lib/health/nutritionProfileService';
import { useGamificationStore } from '../stores/useGamificationStore';
import { useHealthStore } from '../stores/useHealthStore';
import { reportSyncError, reportSyncSuccess } from '../lib/sync/reportSyncError';
import { useProfileModuleStore } from '../stores/useProfileModuleStore';
import { useFeatureGate } from '../hooks/useFeatureGate';
import { usePaywallStore } from '../stores/usePaywallStore';
import { useSubscriptionStore, selectAndroidTrial, selectCanUseNotifications } from '../stores/useSubscriptionStore';
import { useNotificationSettingsStore } from '../stores/useNotificationSettingsStore';
import { useTheme } from '../theme/ThemeContext';
import type { AppThemeMode } from '../theme/themes';
import type { DietGoal } from '../types/health';

/** Cross-platform confirm — Alert.alert is a no-op on react-native-web. */
function confirmDestructive(
  title: string,
  message: string,
  confirmLabel: string,
  cancelLabel: string,
): Promise<boolean> {
  if (Platform.OS === 'web') {
    return Promise.resolve(window.confirm(`${title}\n\n${message}`));
  }

  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: cancelLabel, style: 'cancel', onPress: () => resolve(false) },
      { text: confirmLabel, style: 'destructive', onPress: () => resolve(true) },
    ]);
  });
}
function ChipRow<T extends string>({
  options,
  value,
  onChange,
  themeMuted,
  themePrimary,
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (next: T) => void;
  themeMuted: string;
  themePrimary: string;
}) {
  return (
    <View className="mt-3 flex-row flex-wrap gap-2">
      {options.map((option) => {
        const active = option.id === value;
        return (
          <Pressable
            key={option.id}
            onPress={() => onChange(option.id)}
            className="rounded-full px-3 py-2"
            style={{
              backgroundColor: active ? themePrimary : `${themePrimary}12`,
            }}
          >
            <Text
              className="text-xs font-bold"
              style={{ color: active ? '#0B1220' : themeMuted }}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function SettingsScreen() {
  const { t } = useTranslation();
  const dietGoals: { id: DietGoal; label: string }[] = [
    { id: 'fat_loss', label: t('settings.dietGoals.fat_loss') },
    { id: 'maintenance', label: t('settings.dietGoals.maintenance') },
    { id: 'bulk', label: t('settings.dietGoals.bulk') },
  ];
  const genders = [
    { id: 'male' as const, label: t('settings.genders.male') },
    { id: 'female' as const, label: t('settings.genders.female') },
    { id: 'other' as const, label: t('settings.genders.other') },
  ];
  const activityLevelKey: Record<string, string> = {
    sedentary: 'sedentary',
    light: 'light',
    moderate: 'moderate',
    active: 'active',
    very_active: 'veryActive',
  };
  const { theme, mode, setMode, isDark } = useTheme();
  const { requirePro: requirePremiumThemes } = useFeatureGate('premium_themes');
  const openPaywall = usePaywallStore((s) => s.openPaywall);
  const devProOverride = useSubscriptionStore((s) => s.devProOverride);
  const setDevProOverride = useSubscriptionStore((s) => s.setDevProOverride);
  const androidTrial = useSubscriptionStore(selectAndroidTrial);
  const expireSoftTrial = useSubscriptionStore((s) => s.expireSoftTrial);
  const { profile, updateUsername, isUpdatingUsername, syncProfile } = useGamification();
  const { signOut } = useAuth();
  const bodyWeight = useHealthStore((s) => s.bodyStats.weightKg);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const handleSignOut = useCallback(async () => {
    const confirmed = await confirmDestructive(
      t('settings.signOut'),
      t('settings.signOutConfirmBody'),
      t('settings.signOut'),
      t('common.cancel'),
    );
    if (confirmed) {
      await signOut();
    }
  }, [signOut, t]);

  const handleDeleteAccount = useCallback(async () => {
    const confirmed = await confirmDestructive(
      t('settings.deleteAccount'),
      t('settings.deleteConfirmBody'),
      t('settings.deleteForever'),
      t('common.cancel'),
    );
    if (!confirmed) {
      return;
    }

    setIsDeletingAccount(true);
    try {
      await deleteAccount();
      reportSyncSuccess(t('settings.accountDeleted'));
    } catch (error) {
      reportSyncError('DeleteAccount', error, t('settings.deleteError'));
    } finally {
      setIsDeletingAccount(false);
    }
  }, [t]);

  const [usernameDraft, setUsernameDraft] = useState(profile?.username ?? '');
  const [usernameError, setUsernameError] = useState<string | null>(null);

  const [heightCm, setHeightCm] = useState(String(profile?.height_cm ?? 175));
  const [age, setAge] = useState(String(profile?.age ?? 30));
  const [gender, setGender] = useState<'male' | 'female' | 'other'>(
    profile?.gender ?? 'male',
  );
  const [activityFactor, setActivityFactor] = useState(profile?.activity_factor ?? 1.55);
  const [dietGoal, setDietGoal] = useState<DietGoal>(profile?.diet_goal ?? 'fat_loss');
  const [goalPaceKg, setGoalPaceKg] = useState(String(profile?.goal_pace_kg ?? 0.5));
  const [nutritionError, setNutritionError] = useState<string | null>(null);
  const [isSavingNutrition, setIsSavingNutrition] = useState(false);

  useEffect(() => {
    setUsernameDraft(profile?.username ?? '');
  }, [profile?.username]);

  useEffect(() => {
    if (!profile) return;
    setHeightCm(String(profile.height_cm ?? 175));
    setAge(String(profile.age ?? 30));
    setGender(profile.gender ?? 'male');
    setActivityFactor(profile.activity_factor ?? 1.55);
    setDietGoal(profile.diet_goal ?? 'fat_loss');
    setGoalPaceKg(String(profile.goal_pace_kg ?? 0.5));
  }, [profile]);

  const previewTargets = useMemo(() => {
    const parsedHeight = Number(heightCm);
    const parsedAge = Number(age);
    const parsedPace = Number(goalPaceKg);
    return resolveNutritionTargets(
      {
        ...profile,
        id: profile?.id ?? '',
        username: profile?.username ?? '',
        level: profile?.level ?? 1,
        xp: profile?.xp ?? 0,
        days_active: profile?.days_active ?? 0,
        focus_hours: profile?.focus_hours ?? 0,
        habits_count: profile?.habits_count ?? 0,
        updated_at: profile?.updated_at ?? '',
        height_cm: Number.isFinite(parsedHeight) ? parsedHeight : 175,
        age: Number.isFinite(parsedAge) ? parsedAge : 30,
        gender,
        activity_factor: activityFactor,
        diet_goal: dietGoal,
        goal_pace_kg: Number.isFinite(parsedPace) ? parsedPace : 0.5,
      },
      bodyWeight,
    );
  }, [activityFactor, age, bodyWeight, dietGoal, gender, goalPaceKg, heightCm, profile]);

  const handleSaveUsername = useCallback(async () => {
    setUsernameError(null);
    try {
      const result = await updateUsername(usernameDraft);
      if (!result.success) {
        setUsernameError(
          result.errorKey
            ? t(result.errorKey, result.errorParams)
            : t('settings.usernameSaveError'),
        );
      }
    } catch (error) {
      console.warn('[SettingsScreen] save username failed:', error);
      setUsernameError(t('settings.usernameSaveError'));
    }
  }, [updateUsername, usernameDraft, t]);

  const handleSaveNutrition = useCallback(async () => {
    const userId = profile?.id;
    if (!userId) return;

    const parsedHeight = Number(heightCm);
    const parsedAge = Number(age);
    const parsedPace = Number(goalPaceKg);

    if (!Number.isFinite(parsedHeight) || parsedHeight < 100 || parsedHeight > 250) {
      setNutritionError(t('settings.heightError'));
      return;
    }
    if (!Number.isFinite(parsedAge) || parsedAge < 13 || parsedAge > 100) {
      setNutritionError(t('settings.ageError'));
      return;
    }
    if (!Number.isFinite(parsedPace) || parsedPace < 0 || parsedPace > 1.5) {
      setNutritionError(t('settings.paceError'));
      return;
    }

    setNutritionError(null);
    setIsSavingNutrition(true);

    try {
      await updateNutritionProfile(userId, {
        heightCm: parsedHeight,
        age: parsedAge,
        gender,
        activityFactor,
        dietGoal,
        goalPaceKg: parsedPace,
      });
      await syncProfile();
      useHealthStore.getState().applyNutritionTargets(
        resolveNutritionTargets(useGamificationStore.getState().profile, bodyWeight),
      );
      reportSyncSuccess(t('settings.nutritionSaved'));
    } catch (error) {
      reportSyncError('Health', error, t('settings.nutritionSaveError'));
      setNutritionError(t('settings.nutritionSaveError'));
    } finally {
      setIsSavingNutrition(false);
    }
  }, [
    activityFactor,
    age,
    bodyWeight,
    dietGoal,
    gender,
    goalPaceKg,
    heightCm,
    profile?.id,
    syncProfile,
    t,
  ]);

  const closeModule = useProfileModuleStore((s) => s.closeModule);

  const PREMIUM_THEME_OPTIONS = [
    t('settings.themes.amoled'),
    t('settings.themes.glass'),
    t('settings.themes.minimal'),
    t('settings.themes.gradient'),
    t('settings.themes.cyber'),
  ] as const;

  const handleThemeToggle = useCallback(
    (enabled: boolean) => {
      const nextMode: AppThemeMode = enabled ? 'obsidian' : 'ethereal';
      setMode(nextMode);
    },
    [setMode],
  );

  const notificationsEnabled = useNotificationSettingsStore((s) => s.enabled);
  const hardcoreMode = useNotificationSettingsStore((s) => s.hardcoreMode);
  const setNotificationsEnabled = useNotificationSettingsStore((s) => s.setEnabled);
  const setHardcoreMode = useNotificationSettingsStore((s) => s.setHardcoreMode);

  const isTma = IS_WEB && isTelegramMiniApp();
  const monthlyPriceLabel = getTmaMonthlyPriceLabel();
  const canUseNotifications = useSubscriptionStore(selectCanUseNotifications);
  const tmaAccess = useSubscriptionStore((s) => s.tmaAccess);
  const [telegramReminders, setTelegramReminders] = useState(tmaAccess.telegramRemindersEnabled);
  const [isSavingTelegramReminders, setIsSavingTelegramReminders] = useState(false);

  useEffect(() => {
    setTelegramReminders(tmaAccess.telegramRemindersEnabled);
  }, [tmaAccess.telegramRemindersEnabled]);

  const handlePushRemindersToggle = useCallback(
    async (enabled: boolean) => {
      if (!enabled) {
        setNotificationsEnabled(false);
        return;
      }

      const granted = await ensureNotificationPermissions();
      if (!granted) {
        Alert.alert(
          t('settings.notifications.offTitle'),
          t('settings.notifications.offBody'),
          [
            { text: t('common.cancel'), style: 'cancel' },
            { text: t('settings.notifications.openSettings'), onPress: () => void Linking.openSettings() },
          ],
        );
        return;
      }

      setNotificationsEnabled(true);
    },
    [setNotificationsEnabled, t],
  );

  const handleTelegramRemindersToggle = useCallback(
    async (enabled: boolean) => {
      if (!canUseNotifications) {
        openPaywall();
        return;
      }

      setTelegramReminders(enabled);
      setIsSavingTelegramReminders(true);
      try {
        await setTelegramRemindersEnabled(enabled);
        if (enabled) {
          void notifyTelegramRemindersEnabled(true);
        }
        void useSubscriptionStore.getState().syncTma();
      } catch (error) {
        setTelegramReminders(!enabled);
        reportSyncError('TelegramReminders', error, t('settings.telegramRemindersError'));
      } finally {
        setIsSavingTelegramReminders(false);
      }
    },
    [canUseNotifications, openPaywall, t],
  );

  return (
    <IsolatedScreenLayout
      header={<ScreenHeader title={t('settings.title')} subtitle={t('settings.subtitle')} onBack={closeModule} />}
    >
      <GlassPanel borderRadius={24} style={{ marginBottom: 16 }}>
        <View className="p-5">
          <Text className="text-[10px] font-bold uppercase tracking-[2px]" style={{ color: theme.textMuted }}>
            {t('settings.language')}
          </Text>
          <LanguagePicker />
        </View>
      </GlassPanel>

      <GlassPanel borderRadius={24} style={{ marginBottom: 16 }}>
        <View className="p-5">
          <Text className="text-[10px] font-bold uppercase tracking-[2px]" style={{ color: theme.textMuted }}>
            {t('settings.profileManagement')}
          </Text>
          <TextInput
            value={usernameDraft}
            onChangeText={setUsernameDraft}
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={16}
            placeholder={t('settings.username')}
            placeholderTextColor={theme.textMuted}
            className="mt-4 rounded-2xl border px-4 py-3 text-base font-semibold"
            style={{
              color: theme.textPrimary,
              borderColor: theme.borderSubtle,
              backgroundColor: `${theme.primary}08`,
            }}
          />
          {usernameError ? (
            <Text className="mt-2 text-xs font-semibold text-red-500">{usernameError}</Text>
          ) : null}
          <Pressable
            onPress={() => void handleSaveUsername()}
            disabled={isUpdatingUsername}
            className="mt-4 items-center rounded-2xl py-3.5 active:opacity-90"
            style={{ backgroundColor: theme.primary, opacity: isUpdatingUsername ? 0.7 : 1 }}
          >
            <Text className="font-bold text-white">
              {isUpdatingUsername ? t('settings.saving') : t('settings.saveUsername')}
            </Text>
          </Pressable>
        </View>
      </GlassPanel>

      <GlassPanel borderRadius={24} style={{ marginBottom: 16 }}>
        <View className="p-5">
          <Text className="text-[10px] font-bold uppercase tracking-[2px]" style={{ color: theme.textMuted }}>
            {t('settings.nutritionTargets')}
          </Text>
          <Text className="mt-2 text-sm" style={{ color: theme.textSecondary }}>
            {t('settings.nutritionHint')} ({bodyWeight.toFixed(1)} {t('common.kg')}).
          </Text>
          <Text className="mt-2 text-xs leading-5" style={{ color: theme.textMuted }}>
            {t('health.disclaimer')}
          </Text>

          <Text className="mt-4 text-xs font-bold uppercase tracking-[1px]" style={{ color: theme.textMuted }}>
            {t('settings.height')}
          </Text>
          <TextInput
            value={heightCm}
            onChangeText={setHeightCm}
            keyboardType="number-pad"
            className="mt-2 rounded-2xl border px-4 py-3 text-base font-semibold"
            style={{
              color: theme.textPrimary,
              borderColor: theme.borderSubtle,
              backgroundColor: `${theme.primary}08`,
            }}
          />

          <Text className="mt-4 text-xs font-bold uppercase tracking-[1px]" style={{ color: theme.textMuted }}>
            {t('settings.age')}
          </Text>
          <TextInput
            value={age}
            onChangeText={setAge}
            keyboardType="number-pad"
            className="mt-2 rounded-2xl border px-4 py-3 text-base font-semibold"
            style={{
              color: theme.textPrimary,
              borderColor: theme.borderSubtle,
              backgroundColor: `${theme.primary}08`,
            }}
          />

          <Text className="mt-4 text-xs font-bold uppercase tracking-[1px]" style={{ color: theme.textMuted }}>
            {t('settings.sex')}
          </Text>
          <ChipRow
            options={genders}
            value={gender}
            onChange={setGender}
            themeMuted={theme.textMuted}
            themePrimary={theme.primary}
          />

          <Text className="mt-4 text-xs font-bold uppercase tracking-[1px]" style={{ color: theme.textMuted }}>
            {t('settings.activity')}
          </Text>
          <ChipRow
            options={ACTIVITY_LEVELS.map((level) => ({
              id: String(level.factor),
              label: t(`settings.activityLevels.${activityLevelKey[level.id]}`),
            }))}
            value={String(activityFactor)}
            onChange={(next) => setActivityFactor(Number(next))}
            themeMuted={theme.textMuted}
            themePrimary={theme.primary}
          />

          <Text className="mt-4 text-xs font-bold uppercase tracking-[1px]" style={{ color: theme.textMuted }}>
            {t('settings.dietGoal')}
          </Text>
          <ChipRow
            options={dietGoals}
            value={dietGoal}
            onChange={setDietGoal}
            themeMuted={theme.textMuted}
            themePrimary={theme.primary}
          />

          <Text className="mt-4 text-xs font-bold uppercase tracking-[1px]" style={{ color: theme.textMuted }}>
            {t('settings.weeklyPace')}
          </Text>
          <TextInput
            value={goalPaceKg}
            onChangeText={setGoalPaceKg}
            keyboardType="decimal-pad"
            className="mt-2 rounded-2xl border px-4 py-3 text-base font-semibold"
            style={{
              color: theme.textPrimary,
              borderColor: theme.borderSubtle,
              backgroundColor: `${theme.primary}08`,
            }}
          />

          <View
            className="mt-4 rounded-2xl px-4 py-3"
            style={{ backgroundColor: `${theme.primary}10` }}
          >
            <Text className="text-xs font-semibold" style={{ color: theme.textSecondary }}>
              {t('settings.previewBmr', { bmr: previewTargets.bmr, tdee: previewTargets.tdee })}
            </Text>
            <Text className="mt-1 text-sm font-bold" style={{ color: theme.textPrimary }}>
              {previewTargets.calorieTarget} kcal · P {previewTargets.proteinG} / F {previewTargets.fatG} / C{' '}
              {previewTargets.carbsG}
            </Text>
            <Text className="mt-1 text-xs font-semibold" style={{ color: theme.textSecondary }}>
              {t('settings.previewWater', { liters: (previewTargets.waterTargetMl / 1000).toFixed(1) })}
            </Text>
          </View>

          {nutritionError ? (
            <Text className="mt-2 text-xs font-semibold text-red-500">{nutritionError}</Text>
          ) : null}

          <Pressable
            onPress={() => void handleSaveNutrition()}
            disabled={isSavingNutrition}
            className="mt-4 items-center rounded-2xl py-3.5 active:opacity-90"
            style={{ backgroundColor: theme.primary, opacity: isSavingNutrition ? 0.7 : 1 }}
          >
            <Text className="font-bold text-white">
              {isSavingNutrition ? t('settings.saving') : t('settings.saveNutritionProfile')}
            </Text>
          </Pressable>
        </View>
      </GlassPanel>

      <GlassPanel borderRadius={24} style={{ marginBottom: 16 }}>
        <View className="p-5">
          <Text className="text-[10px] font-bold uppercase tracking-[2px]" style={{ color: theme.textMuted }}>
            {isTma ? t('settings.notifications.telegramTitle') : t('settings.notifications.title')}
          </Text>
          {isTma ? (
            <>
              <Text className="mt-2 text-sm" style={{ color: theme.textSecondary }}>
                {isAppFullyFree()
                  ? t('settings.notifications.telegramBody')
                  : canUseNotifications
                    ? tmaAccess.isInTrial
                      ? t('settings.notifications.trialIncluded', {
                          days: TMA_TRIAL_DAYS,
                          price: monthlyPriceLabel,
                        })
                      : t('settings.notifications.telegramBody')
                    : t('settings.notifications.trialEnded', { price: monthlyPriceLabel })}
              </Text>
              <View className="mt-4 flex-row items-center justify-between">
                <View className="flex-1 pr-4">
                  <Text className="text-base font-bold" style={{ color: theme.textPrimary }}>
                    {t('settings.notifications.smartReminders')}
                  </Text>
                  <Text className="mt-1 text-sm" style={{ color: theme.textSecondary }}>
                    {t('settings.notifications.telegramBody')}
                  </Text>
                </View>
                <Switch
                  value={telegramReminders}
                  onValueChange={(value) => void handleTelegramRemindersToggle(value)}
                  disabled={!canUseNotifications || isSavingTelegramReminders}
                  trackColor={{ false: `${theme.primary}33`, true: theme.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>
              <Text className="mt-4 text-xs leading-5" style={{ color: theme.textMuted }}>
                {t('settings.notifications.scheduleSample')}
              </Text>
            </>
          ) : (
            <>
              {!notificationsSupportedInRuntime ? (
                <Text className="mt-2 text-sm" style={{ color: theme.textSecondary }}>
                  {t('settings.notifications.webUnavailable')}
                </Text>
              ) : null}
              <View className="mt-4 flex-row items-center justify-between">
                <View className="flex-1 pr-4">
                  <Text className="text-base font-bold" style={{ color: theme.textPrimary }}>
                    {t('settings.notifications.smartReminders')}
                  </Text>
                  <Text className="mt-1 text-sm" style={{ color: theme.textSecondary }}>
                    {t('settings.notifications.smartRemindersHint')}
                  </Text>
                </View>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={(value) => void handlePushRemindersToggle(value)}
                  disabled={!notificationsSupportedInRuntime}
                  trackColor={{ false: `${theme.primary}33`, true: theme.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View
                className="mt-4 flex-row items-center justify-between"
                style={{ opacity: notificationsEnabled && notificationsSupportedInRuntime ? 1 : 0.45 }}
              >
                <View className="flex-1 pr-4">
                  <Text className="text-base font-bold" style={{ color: theme.textPrimary }}>
                    {t('settings.notifications.hardcore')}
                  </Text>
                  <Text className="mt-1 text-sm" style={{ color: theme.textSecondary }}>
                    {t('settings.notifications.hardcoreHint')}
                  </Text>
                </View>
                <Switch
                  value={hardcoreMode}
                  onValueChange={setHardcoreMode}
                  disabled={!notificationsEnabled || !notificationsSupportedInRuntime}
                  trackColor={{ false: `${theme.primary}33`, true: theme.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <Text className="mt-4 text-xs leading-5" style={{ color: theme.textMuted }}>
                {t('settings.notifications.scheduleSample')}
              </Text>
            </>
          )}
        </View>
      </GlassPanel>

      <GlassPanel borderRadius={24} style={{ marginBottom: 16 }}>
        <View className="p-5">
          <Text className="text-[10px] font-bold uppercase tracking-[2px]" style={{ color: theme.textMuted }}>
            {t('settings.freeThemes')}
          </Text>
          <Text className="mt-2 text-lg font-bold" style={{ color: theme.textPrimary }}>
            {t('settings.lightDark')}
          </Text>
          <Text className="mt-1 text-sm" style={{ color: theme.textSecondary }}>
            {t('settings.lightDarkHint')}
          </Text>
          <View className="mt-4 flex-row items-center justify-between">
            <Text className="text-base font-bold" style={{ color: theme.textPrimary }}>
              {t('settings.obsidianDark')}
            </Text>
            <Switch
              value={isDark}
              onValueChange={handleThemeToggle}
              trackColor={{ false: `${theme.primary}33`, true: theme.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>
      </GlassPanel>

      {!isAppFullyFree() ? (
        <GlassPanel borderRadius={24} style={{ marginBottom: 16 }}>
          <View className="p-5">
            <Text className="text-[10px] font-bold uppercase tracking-[2px]" style={{ color: theme.textMuted }}>
              {t('settings.premiumThemes')}
            </Text>
            <Text className="mt-2 text-sm" style={{ color: theme.textSecondary }}>
              {t('settings.premiumThemesHint')}
            </Text>
            <View className="mt-4 flex-row flex-wrap gap-2">
              {PREMIUM_THEME_OPTIONS.map((label) => (
                <Pressable
                  key={label}
                  onPress={() => requirePremiumThemes(() => {})}
                  className="rounded-full px-3 py-2 active:opacity-80"
                  style={{
                    backgroundColor: `${theme.primary}10`,
                    borderWidth: 1,
                    borderColor: `${theme.primary}33`,
                  }}
                >
                  <Text className="text-xs font-bold" style={{ color: theme.textMuted }}>
                    {label} {t('settings.themes.proSuffix')}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Pressable
              onPress={() => openPaywall('premium_themes')}
              className="mt-4 items-center rounded-2xl py-3 active:opacity-90"
              style={{ backgroundColor: `${theme.primary}18`, borderWidth: 1, borderColor: `${theme.primary}44` }}
            >
              <Text className="text-sm font-bold" style={{ color: theme.primary }}>
                {t('settings.viewPro')}
              </Text>
            </Pressable>
          </View>
        </GlassPanel>
      ) : null}

      <GlassPanel borderRadius={24} style={{ marginBottom: 16 }}>
        <View className="p-5">
          <Text className="text-[10px] font-bold uppercase tracking-[2px]" style={{ color: theme.textMuted }}>
            {t('settings.account')}
          </Text>

          <Pressable
            onPress={() => void handleSignOut()}
            className="mt-4 items-center rounded-2xl py-3.5 active:opacity-90"
            style={{ backgroundColor: `${theme.primary}18`, borderWidth: 1, borderColor: `${theme.primary}44` }}
          >
            <Text className="text-sm font-bold" style={{ color: theme.primary }}>
              {t('settings.signOut')}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => void handleDeleteAccount()}
            disabled={isDeletingAccount}
            className="mt-3 items-center rounded-2xl py-3.5 active:opacity-90"
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.10)',
              borderWidth: 1,
              borderColor: 'rgba(239, 68, 68, 0.35)',
              opacity: isDeletingAccount ? 0.6 : 1,
            }}
          >
            <Text className="text-sm font-bold" style={{ color: '#EF4444' }}>
              {isDeletingAccount ? t('settings.deleting') : t('settings.deleteAccount')}
            </Text>
          </Pressable>

          <Text className="mt-3 text-xs leading-4" style={{ color: theme.textMuted }}>
            {t('settings.deleteConfirmBody')}
          </Text>

          <View className="mt-4 flex-row flex-wrap items-center justify-center gap-x-4 gap-y-2">
            <Pressable onPress={() => void Linking.openURL(PRIVACY_POLICY_URL)}>
              <Text className="text-xs font-semibold underline" style={{ color: theme.textSecondary }}>
                {t('auth.privacy')}
              </Text>
            </Pressable>
            <Pressable onPress={() => void Linking.openURL(TERMS_OF_SERVICE_URL)}>
              <Text className="text-xs font-semibold underline" style={{ color: theme.textSecondary }}>
                {t('auth.terms')}
              </Text>
            </Pressable>
            <Pressable onPress={() => void Linking.openURL(SUPPORT_URL)}>
              <Text className="text-xs font-semibold underline" style={{ color: theme.textSecondary }}>
                {t('auth.support')}
              </Text>
            </Pressable>
          </View>
        </View>
      </GlassPanel>

      {__DEV__ && !isAppFullyFree() ? (
        <GlassPanel borderRadius={24} style={{ marginBottom: 16 }}>
          <View className="flex-row items-center justify-between p-5">
            <View className="flex-1 pr-4">
              <Text className="text-[10px] font-bold uppercase tracking-[2px]" style={{ color: theme.textMuted }}>
                {t('settings.developer')}
              </Text>
              <Text className="mt-2 text-base font-bold" style={{ color: theme.textPrimary }}>
                {t('settings.simulatePro')}
              </Text>
            </View>
            <Switch
              value={devProOverride}
              onValueChange={setDevProOverride}
              trackColor={{ false: `${theme.primary}33`, true: theme.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </GlassPanel>
      ) : null}

      {!isAppFullyFree() && androidTrial.isInTrial ? (
        <GlassPanel borderRadius={24} style={{ marginBottom: 16 }}>
          <Pressable
            onPress={() => {
              void expireSoftTrial().then(() => {
                reportSyncSuccess(t('settings.softTrialEnded'));
              });
            }}
            className="p-5 active:opacity-80"
          >
            <Text className="text-[10px] font-bold uppercase tracking-[2px]" style={{ color: theme.textMuted }}>
              {t('settings.developer')}
            </Text>
            <Text className="mt-2 text-base font-bold" style={{ color: theme.textPrimary }}>
              {t('settings.endSoftTrial')}
            </Text>
            <Text className="mt-1 text-sm" style={{ color: theme.textSecondary }}>
              {t('settings.endSoftTrialHint')}
            </Text>
          </Pressable>
        </GlassPanel>
      ) : null}

      <Text className="mt-2 text-center text-xs" style={{ color: theme.textMuted }}>
        {t('settings.activeTheme', {
          theme: mode === 'obsidian' ? t('settings.obsidianDarkName') : t('settings.etherealLight'),
        })}
      </Text>
    </IsolatedScreenLayout>
  );
}
