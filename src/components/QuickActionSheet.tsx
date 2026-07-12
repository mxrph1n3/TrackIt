import { BlurView } from 'expo-blur';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useAppSafeAreaInsets } from '../hooks/useAppSafeAreaInsets';
import { supportsNativeBlur } from '../lib/platform/blur';
import { SUPPORTS_LAYOUT_ANIMATIONS } from '../lib/platform/constants';
import { triggerHaptic } from '../lib/platform/haptics';

import {
  ACTION_HUB_RADIAL_ACTIONS,
  findRadialAction,
  type RadialHubAction,
  type RecentActionEntry,
} from '../constants/actionHubRadial';
import {
  FORM_ACTION_IDS,
  PRIMARY_CREATE_ACTIONS,
  QUICK_INPUT_PLACEHOLDER,
} from '../constants/createHub';
import { useRecentTemplates } from '../hooks/useRecentTemplates';
import { routeExternalQuickAction } from '../lib/quickActions/actionRouter';
import { openFinanceSheet, openNewTaskSheet } from '../lib/quickActions/createFlows';
import { insertTask, insertTransaction, toQuickActionErrorMessage } from '../lib/quickActions/service';
import { useThemedStyles } from '../hooks/useThemedStyles';
import { useFloatingTabBarStyles } from '../navigation/hooks/useFloatingTabBarStyles';
import { useCreateHubStore } from '../stores/useCreateHubStore';
import { useDashboardStore } from '../stores/useDashboardStore';
import { useProfileModuleStore } from '../stores/useProfileModuleStore';
import { useTheme } from '../theme/ThemeContext';
import { overlayEnter, overlayExit, timingEntrance, timingExit } from '../theme/motion';
import type { CreateHubAction, QuickActionId, RecentTemplate } from '../types/quickActions';
import { parseQuickInput } from '../utils/quickInputParser';
import { ActionHubExpandedHeader } from './actionHub/ActionHubExpandedHeader';
import { ActionHubRadialMenu } from './actionHub/ActionHubRadialMenu';
import { ActionHubRecentActions } from './actionHub/ActionHubRecentActions';
import { ACTION_HUB } from './actionHub/actionHubTheme';
import { useActionHubTheme } from './actionHub/useActionHubTheme';
import { FinanceMiniForm } from './quickActions/FinanceMiniForm';
import { HabitMiniForm } from './quickActions/HabitMiniForm';
import { MealMiniForm } from './quickActions/MealMiniForm';
import { MoodMiniForm } from './quickActions/MoodMiniForm';
import { NoteMiniForm } from './quickActions/NoteMiniForm';
import { SubtaskMiniForm } from './quickActions/SubtaskMiniForm';
import { TaskMiniForm } from './quickActions/TaskMiniForm';
import { WaterMiniForm } from './quickActions/WaterMiniForm';
import { WeightMiniForm } from './quickActions/WeightMiniForm';

type QuickActionSheetProps = {
  visible: boolean;
  onClose: () => void;
  initialAction?: QuickActionId | null;
  onInitialActionConsumed?: () => void;
  onActionSelect?: (actionId: QuickActionId) => void;
};

type FormSeed = {
  taskTitle?: string;
  taskTime?: string;
  taskToday?: boolean;
  habitTitle?: string;
  mealName?: string;
  mealCalories?: string;
  noteBody?: string;
  finance?: {
    type: 'expense' | 'income';
    amount: number;
    label: string;
  };
};

function QuickActionMiniForm({
  actionId,
  radialKey,
  seed,
  onSuccess,
  onBack,
}: {
  actionId: QuickActionId;
  radialKey?: string;
  seed: FormSeed;
  onSuccess: () => void;
  onBack: () => void;
}) {
  const openFinance = useProfileModuleStore((s) => s.openModule);

  switch (actionId) {
    case 'task':
      if (radialKey === 'subtask') {
        return (
          <SubtaskMiniForm
            onSuccess={onSuccess}
            onBack={onBack}
            initialTitle={seed.taskTitle}
          />
        );
      }
      return (
        <TaskMiniForm
          onSuccess={onSuccess}
          onBack={onBack}
          initialTitle={seed.taskTitle}
          initialScheduledTime={seed.taskTime}
          initialIsToday={seed.taskToday}
        />
      );
    case 'habit':
      return <HabitMiniForm onSuccess={onSuccess} onBack={onBack} initialTitle={seed.habitTitle} />;
    case 'finance':
      return (
        <FinanceMiniForm
          onSuccess={onSuccess}
          onBack={onBack}
          onAdvanced={() => {
            onSuccess();
            openFinance('finance');
          }}
          initialType={seed.finance?.type}
          initialAmount={seed.finance?.amount}
          initialLabel={seed.finance?.label}
        />
      );
    case 'meal':
      return (
        <MealMiniForm
          onSuccess={onSuccess}
          onBack={onBack}
          initialMealName={seed.mealName}
          initialCalories={seed.mealCalories}
        />
      );
    case 'note':
      return <NoteMiniForm onSuccess={onSuccess} onBack={onBack} initialBody={seed.noteBody} />;
    case 'mood':
      return <MoodMiniForm onSuccess={onSuccess} onBack={onBack} />;
    case 'water':
      return <WaterMiniForm onSuccess={onSuccess} onBack={onBack} />;
    case 'weight':
      return <WeightMiniForm onSuccess={onSuccess} onBack={onBack} />;
    default:
      return null;
  }
}

function getActionMeta(actionId: QuickActionId, radialKey?: string): CreateHubAction {
  const radial = findRadialAction(actionId, radialKey);
  if (radial) {
    return {
      id: radial.actionId,
      title: radial.label,
      subtitle: 'Quick create',
      accent: radial.accent,
      icon: radial.icon,
    };
  }
  return PRIMARY_CREATE_ACTIONS.find((action) => action.id === actionId) ?? PRIMARY_CREATE_ACTIONS[0];
}

function templateToRecentEntry(template: RecentTemplate): RecentActionEntry {
  const meta = getActionMeta(template.actionId);
  return {
    id: template.id,
    title: template.label,
    meta: 'Recently used',
    actionId: template.actionId,
    icon: meta.icon,
    accent: meta.accent,
  };
}

export function QuickActionSheet({
  visible,
  onClose,
  initialAction = null,
  onInitialActionConsumed,
  onActionSelect,
}: QuickActionSheetProps) {
  const insets = useAppSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const hubTheme = useActionHubTheme();
  const { text, surfaces } = useThemedStyles();
  const { scrollContentPaddingBottom } = useFloatingTabBarStyles();
  const financePreset = useCreateHubStore((s) => s.financePreset);
  const { width, height } = useWindowDimensions();
  const { templates, recordTemplate } = useRecentTemplates(visible);
  const addScheduleItem = useDashboardStore((s) => s.addScheduleItem);
  const quickInputRef = useRef<TextInput>(null);

  const [activeForm, setActiveForm] = useState<QuickActionId | null>(null);
  const [activeRadialKey, setActiveRadialKey] = useState<string | undefined>();
  const [formSeed, setFormSeed] = useState<FormSeed>({});
  const [quickInput, setQuickInput] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  const hubProgress = useSharedValue(0);

  const recentActions = useMemo(
    () => templates.slice(0, 4).map(templateToRecentEntry),
    [templates],
  );

  const radialLayoutScale = Math.min(1, (width - 32) / 440);

  useEffect(() => {
    hubProgress.value = visible
      ? withTiming(1, timingEntrance(ACTION_HUB.openDurationMs))
      : withTiming(0, timingExit(ACTION_HUB.closeDurationMs));
  }, [hubProgress, visible]);

  useEffect(() => {
    if (!visible) {
      setActiveForm(null);
      setActiveRadialKey(undefined);
      setFormSeed({});
      setQuickInput('');
      setParseError(null);
      return;
    }

    if (initialAction) {
      if (initialAction === 'task') {
        onInitialActionConsumed?.();
        onClose();
        openNewTaskSheet();
        return;
      }
      if (initialAction === 'finance' && financePreset) {
        onInitialActionConsumed?.();
        onClose();
        openFinanceSheet(financePreset);
        return;
      }
      if (FORM_ACTION_IDS.has(initialAction)) {
        if (initialAction === 'finance' && financePreset) {
          setFormSeed({
            finance: {
              type: financePreset,
              amount: 0,
              label: '',
            },
          });
        }
        setActiveForm(initialAction);
      } else if (!routeExternalQuickAction(initialAction, onClose)) {
        onActionSelect?.(initialAction);
        onClose();
      }
      onInitialActionConsumed?.();
    }
  }, [financePreset, initialAction, onActionSelect, onClose, onInitialActionConsumed, visible]);

  const hubStyle = useAnimatedStyle(() => ({
    opacity: hubProgress.value,
    transform: [{ scale: 0.88 + hubProgress.value * 0.12 }],
  }));

  const handleCloseSheet = useCallback(() => {
    setActiveForm(null);
    setActiveRadialKey(undefined);
    setFormSeed({});
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!visible) return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      handleCloseSheet();
      return true;
    });
    return () => subscription.remove();
  }, [handleCloseSheet, visible]);

  const openForm = useCallback(
    (actionId: QuickActionId, seed: FormSeed = {}, radialKey?: string) => {
      void triggerHaptic('light');
      if (FORM_ACTION_IDS.has(actionId)) {
        setFormSeed(seed);
        setActiveForm(actionId);
        setActiveRadialKey(radialKey);
        return;
      }
      if (routeExternalQuickAction(actionId, handleCloseSheet)) {
        return;
      }
      onActionSelect?.(actionId);
      handleCloseSheet();
    },
    [handleCloseSheet, onActionSelect],
  );

  const handleRadialAction = useCallback(
    (action: RadialHubAction) => {
      void triggerHaptic('light');

      if (action.kind === 'ai-input') {
        quickInputRef.current?.focus();
        return;
      }
      if (action.key === 'task') {
        handleCloseSheet();
        openNewTaskSheet();
        return;
      }
      if (action.key === 'subtask') {
        openForm('task', { taskTitle: '' }, 'subtask');
        return;
      }
      if (action.key === 'expense' || action.financePreset === 'expense') {
        handleCloseSheet();
        openFinanceSheet('expense');
        return;
      }
      if (action.key === 'income' || action.financePreset === 'income') {
        handleCloseSheet();
        openFinanceSheet('income');
        return;
      }
      openForm(action.actionId, {}, action.key);
    },
    [handleCloseSheet, openForm],
  );

  const handleFormSuccess = useCallback(() => {
    if (activeForm) {
      const actionMeta = getActionMeta(activeForm, activeRadialKey);
      void recordTemplate(activeForm, actionMeta.title);
    }
    setActiveForm(null);
    setActiveRadialKey(undefined);
    setFormSeed({});
    onClose();
  }, [activeForm, activeRadialKey, onClose, recordTemplate]);

  const handleQuickSubmit = useCallback(async () => {
    const parsed = parseQuickInput(quickInput);
    setParseError(null);

    if (parsed.kind === 'unknown') {
      setParseError('Could not parse that command. Try a different format.');
      return;
    }

    setIsParsing(true);

    try {
      if (parsed.kind === 'task') {
        const row = await insertTask({
          title: parsed.title,
          isToday: parsed.isToday,
          scheduledTime: parsed.scheduledTime,
        });
        if (parsed.isToday) {
          addScheduleItem({
            id: row.id,
            title: row.title,
            time: parsed.scheduledTime ?? 'Anytime',
            completed: false,
          });
        }
        void recordTemplate('task', parsed.title, { title: parsed.title });
        setQuickInput('');
        handleCloseSheet();
        await triggerHaptic('success');
        return;
      }

      if (parsed.kind === 'finance') {
        await insertTransaction({
          type: parsed.type,
          amount: parsed.amount,
          category: parsed.type === 'expense' ? 'food' : 'salary',
          label: parsed.label,
        });
        void recordTemplate(
          'finance',
          `${parsed.type === 'expense' ? 'Expense' : 'Income'} — ${parsed.label}`,
        );
        setQuickInput('');
        handleCloseSheet();
        await triggerHaptic('success');
        return;
      }

      if (parsed.kind === 'meal') {
        openForm('meal', { mealName: parsed.mealName });
        setQuickInput('');
        return;
      }

      if (parsed.kind === 'workout') {
        openForm('workout');
        setQuickInput('');
      }
    } catch (error) {
      setParseError(toQuickActionErrorMessage(error));
    } finally {
      setIsParsing(false);
    }
  }, [addScheduleItem, handleCloseSheet, openForm, quickInput, recordTemplate]);

  const handleRecentPress = useCallback(
    (entry: RecentActionEntry) => {
      void triggerHaptic('selection');
      const template = templates.find((item) => item.id === entry.id);
      const payload = template?.payload ?? {};

      switch (entry.actionId) {
        case 'task':
          openForm('task', {
            taskTitle: String(payload.title ?? entry.title),
            taskToday: payload.isToday !== false,
          });
          break;
        case 'finance':
          openForm('finance', {
            finance: {
              type: (payload.type as 'expense' | 'income') ?? 'expense',
              amount: Number(payload.amount ?? 0),
              label: String(payload.label ?? entry.title),
            },
          });
          break;
        case 'meal':
          openForm('meal', {
            mealName: String(payload.mealName ?? entry.title),
            mealCalories: payload.calories ? String(payload.calories) : '',
          });
          break;
        case 'workout':
          if (!routeExternalQuickAction('workout', handleCloseSheet)) {
            openForm('workout');
          }
          break;
        case 'habit':
          openForm('habit', { habitTitle: String(payload.title ?? entry.title) });
          break;
        default:
          openForm(entry.actionId);
      }
    },
    [handleCloseSheet, openForm, templates],
  );

  const scrimColor = hubTheme.scrim;
  const activeAction = activeForm ? getActionMeta(activeForm, activeRadialKey) : null;

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.portal} pointerEvents="box-none">
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleCloseSheet} accessibilityLabel="Close Action Hub">
          <Animated.View
            entering={SUPPORTS_LAYOUT_ANIMATIONS ? overlayEnter : undefined}
            exiting={SUPPORTS_LAYOUT_ANIMATIONS ? overlayExit : undefined}
            style={StyleSheet.absoluteFill}
          >
            {supportsNativeBlur() ? (
              <BlurView intensity={theme.sheetBlurIntensity} tint={theme.blurTint} style={StyleSheet.absoluteFill} />
            ) : null}
            <View style={[styles.scrim, { backgroundColor: scrimColor }]} />
          </Animated.View>
        </Pressable>

        <Animated.View
          style={[
            activeForm ? styles.hubContainerForm : styles.hubContainer,
            !activeForm && {
              paddingTop: insets.top + 8,
              maxHeight: height,
            },
            hubStyle,
          ]}
        >
          {activeForm && activeAction ? (
            <View
              style={[
                styles.formPanel,
                styles.formPanelBottom,
                {
                  borderColor: theme.border,
                  backgroundColor: isDark ? theme.cardFrosted : '#FFFFFF',
                  paddingBottom: insets.bottom + 12,
                },
              ]}
            >
              <View style={styles.formHeader}>
                {(() => {
                  const FormIcon = activeAction.icon;
                  return (
                    <View
                      style={[
                        styles.formIconBadge,
                        {
                          backgroundColor: `${activeAction.accent}18`,
                          borderColor: `${activeAction.accent}44`,
                        },
                      ]}
                    >
                      <FormIcon color={activeAction.accent} size={22} strokeWidth={1.8} />
                    </View>
                  );
                })()}
                <View style={styles.formHeaderCopy}>
                  <Text style={[styles.formTitle, { color: theme.textPrimary }]}>{activeAction.title}</Text>
                  <Text style={[styles.formSubtitle, { color: theme.textMuted }]}>{activeAction.subtitle}</Text>
                </View>
              </View>
              <QuickActionMiniForm
                actionId={activeForm}
                radialKey={activeRadialKey}
                seed={formSeed}
                onSuccess={handleFormSuccess}
                onBack={() => {
                  setActiveForm(null);
                  setActiveRadialKey(undefined);
                  setFormSeed({});
                }}
              />
            </View>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={[
                styles.hubScrollContent,
                { paddingBottom: scrollContentPaddingBottom + 12 },
              ]}
              keyboardShouldPersistTaps="handled"
            >
              <ActionHubExpandedHeader />

              <ActionHubRadialMenu
                actions={ACTION_HUB_RADIAL_ACTIONS}
                visible={visible}
                layoutScale={radialLayoutScale}
                onActionPress={handleRadialAction}
                onCrystalPress={handleCloseSheet}
              />

              <ActionHubRecentActions items={recentActions} onPressItem={handleRecentPress} />

              <View style={styles.bottomZone}>
                <Text style={[styles.sectionLabel, { color: hubTheme.sectionLabel }]}>AI Quick Input</Text>
                <View style={[styles.quickInputShell, { borderColor: hubTheme.glassEdge, backgroundColor: hubTheme.panelBg }]}>
                  {supportsNativeBlur() ? (
                    <BlurView intensity={hubTheme.isDark ? 36 : 18} tint={hubTheme.blurTint} style={StyleSheet.absoluteFill} />
                  ) : null}
                  <TextInput
                    ref={quickInputRef}
                    value={quickInput}
                    onChangeText={setQuickInput}
                    placeholder={QUICK_INPUT_PLACEHOLDER}
                    placeholderTextColor={hubTheme.placeholder}
                    style={[styles.quickInput, { color: theme.textPrimary }]}
                    returnKeyType="done"
                    onSubmitEditing={() => void handleQuickSubmit()}
                  />
                  <Pressable
                    onPress={() => void handleQuickSubmit()}
                    disabled={!quickInput.trim() || isParsing}
                    style={[
                      styles.quickSubmit,
                      { backgroundColor: theme.primary, opacity: !quickInput.trim() || isParsing ? 0.5 : 1 },
                    ]}
                  >
                    {isParsing ? (
                      <ActivityIndicator color={surfaces.onPrimary} size="small" />
                    ) : (
                      <Text style={[styles.quickSubmitText, text.onBrand]}>→</Text>
                    )}
                  </Pressable>
                </View>
                {parseError ? <Text style={styles.parseError}>{parseError}</Text> : null}
              </View>
            </ScrollView>
          )}
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  portal: {
    ...StyleSheet.absoluteFill,
    zIndex: 250,
    elevation: 250,
  },
  overlay: {
    flex: 1,
  },
  scrim: {
    ...StyleSheet.absoluteFill,
  },
  hubContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  hubContainerForm: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 0,
  },
  hubScrollContent: {
    flexGrow: 1,
    alignItems: 'center',
  },
  bottomZone: {
    paddingTop: 16,
    width: '100%',
    maxWidth: 420,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginTop: 4,
  },
  quickInputShell: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 18,
    paddingLeft: 14,
    paddingRight: 6,
    overflow: 'hidden',
  },
  quickInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 14,
  },
  quickSubmit: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickSubmitText: {
    fontSize: 18,
    fontWeight: '700',
  },
  parseError: {
    color: '#F87171',
    fontSize: 12,
    marginTop: 6,
  },
  formPanel: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 420,
    borderRadius: 28,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 18,
  },
  formPanelBottom: {
    alignSelf: 'stretch',
    maxWidth: '100%',
    marginTop: 0,
    marginBottom: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '88%',
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 16,
    paddingBottom: 12,
  },
  formIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  formHeaderCopy: {
    flex: 1,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  formSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
});
