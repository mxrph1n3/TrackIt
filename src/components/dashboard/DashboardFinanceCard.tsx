import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronRight,
  Plus,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react-native';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { formatMoney, formatSignedMoney } from '../../constants/financeCategories';
import { useDashboardFinanceStyles } from '../../hooks/useDashboardFinanceStyles';
import type { DashboardFinanceSnapshot } from '../../types/dashboard';
import { useCreateHubStore } from '../../stores/useCreateHubStore';
import { useProfileModuleStore } from '../../stores/useProfileModuleStore';
import { BRAND, SEMANTIC } from '../../theme/designTokens';
import { celebrateSpring, timingProgress } from '../../theme/motion';
import { FinanceMarketCarousel } from './FinanceMarketCarousel';
import { AnimatedBalanceText } from '../finance/AnimatedBalanceText';
import { TrackItIcon } from '../ui/TrackItIcon';

type DashboardFinanceCardProps = {
  finance: DashboardFinanceSnapshot;
  isFreshUser: boolean;
};

type FinanceCardStyles = ReturnType<typeof useDashboardFinanceStyles>['styles'];

function SectionDivider({ styles }: { styles: FinanceCardStyles }) {
  return <View style={styles.divider} />;
}

function MiniFlowCard({
  tone,
  amount,
  currency,
  onPress,
  styles,
}: {
  tone: 'income' | 'expense';
  amount: number;
  currency: string;
  onPress: () => void;
  styles: FinanceCardStyles;
}) {
  const isIncome = tone === 'income';
  const Icon = isIncome ? ArrowUpRight : ArrowDownRight;
  const accent = isIncome ? SEMANTIC.income : SEMANTIC.expense;

  return (
    <Pressable onPress={onPress} className="flex-1 active:opacity-92">
      <View style={[styles.miniCard, { borderColor: `${accent}22` }]}>
        <View className="mb-1.5 flex-row items-center gap-1">
          <Icon color={accent} size={13} strokeWidth={2.4} />
          <Text style={styles.miniCardLabel}>{isIncome ? 'Income' : 'Expense'}</Text>
        </View>
        <Text style={[styles.miniCardValue, { color: accent }]}>{formatMoney(amount, currency)}</Text>
      </View>
    </Pressable>
  );
}

function OpenFinanceButton({
  onPress,
  styles,
}: {
  onPress: () => void;
  styles: FinanceCardStyles;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Open finance"
      className="active:opacity-85"
      style={styles.openButton}
    >
      <ChevronRight color={BRAND.primary} size={18} strokeWidth={2.2} />
    </Pressable>
  );
}

function FinanceHeader({
  monthLabel,
  onOpenFinance,
  styles,
}: {
  monthLabel: string;
  onOpenFinance: () => void;
  styles: FinanceCardStyles;
}) {
  return (
    <View className="flex-row items-start justify-between">
      <View className="flex-row items-center gap-2.5">
        <View style={styles.headerIconShell}>
          <Wallet color={BRAND.primary} size={18} strokeWidth={2} />
        </View>
        <View>
          <Text style={styles.headerTitle}>Finance</Text>
          <Text style={styles.headerSubtitle}>{monthLabel || 'This month'}</Text>
        </View>
      </View>
      <OpenFinanceButton onPress={onOpenFinance} styles={styles} />
    </View>
  );
}

function EmptyFinanceCard({
  monthLabel,
  onAddFirst,
  onOpenFinance,
  styles,
  blurTint,
}: {
  monthLabel: string;
  onAddFirst: () => void;
  onOpenFinance: () => void;
  styles: FinanceCardStyles;
  blurTint: 'light' | 'dark';
}) {
  return (
    <View style={styles.cardShell}>
      <BlurView intensity={22} tint={blurTint} style={StyleSheet.absoluteFill} />
      <View style={styles.cardInner}>
        <FinanceHeader monthLabel={monthLabel} onOpenFinance={onOpenFinance} styles={styles} />
        <View style={styles.emptyBody}>
          <Text style={styles.emptyTitle}>Welcome!</Text>
          <Text style={styles.emptySubtitle}>
            Add your first transaction to track income, expenses, and trends.
          </Text>
          <Pressable
            onPress={() => {
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onAddFirst();
            }}
            className="mt-4 active:opacity-90"
            style={styles.primaryCta}
          >
            <Text style={styles.primaryCtaText}>Add first transaction</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export function DashboardFinanceCard({ finance, isFreshUser }: DashboardFinanceCardProps) {
  const { styles, theme, blurTint } = useDashboardFinanceStyles();
  const openFinance = useProfileModuleStore((s) => s.openModule);
  const openHub = useCreateHubStore((s) => s.open);

  const goalProgress = useSharedValue(0);
  const goalCelebrate = useSharedValue(0);

  useEffect(() => {
    const target = finance.activeGoal?.percent ?? 0;
    goalProgress.value = withTiming(Math.min(100, target), timingProgress());
    goalCelebrate.value = withSpring(finance.activeGoal?.isComplete ? 1 : 0, celebrateSpring);
  }, [finance.activeGoal?.isComplete, finance.activeGoal?.percent, goalCelebrate, goalProgress]);

  const goalBarStyle = useAnimatedStyle(() => ({
    width: `${goalProgress.value}%`,
  }));

  const goalCelebrateStyle = useAnimatedStyle(() => ({
    opacity: 0.55 + goalCelebrate.value * 0.45,
    transform: [{ scale: 0.98 + goalCelebrate.value * 0.02 }],
  }));

  const handleOpenFinance = () => openFinance('finance');

  const handleOpenIncome = () => {
    void Haptics.selectionAsync();
    openHub('finance', { financePreset: 'income' });
  };

  const handleOpenExpense = () => {
    void Haptics.selectionAsync();
    openHub('finance', { financePreset: 'expense' });
  };

  if (finance.isEmpty || isFreshUser) {
    return (
      <EmptyFinanceCard
        monthLabel={finance.monthLabel}
        onAddFirst={() => openHub('finance', { financePreset: 'expense' })}
        onOpenFinance={handleOpenFinance}
        styles={styles}
        blurTint={blurTint}
      />
    );
  }

  const balanceTrend = finance.balanceChangePercent;
  const trendUp = balanceTrend !== null && balanceTrend >= 0;
  const TrendIcon = trendUp ? TrendingUp : TrendingDown;
  const trendColor = trendUp ? SEMANTIC.income : SEMANTIC.expense;

  const lastTx =
    finance.showLastTransaction && finance.lastTransactionLabel
      ? {
          label: finance.lastTransactionLabel,
          amount: finance.lastTransactionAmount ?? 0,
          icon: finance.lastTransactionIcon ?? 'wallet',
          relative: finance.lastTransactionRelative ?? 'Recently',
        }
      : finance.recentTransactions[0]
        ? {
            label: finance.recentTransactions[0].label,
            amount: finance.recentTransactions[0].amount,
            icon: finance.recentTransactions[0].icon,
            relative: finance.recentTransactions[0].relativeLabel,
          }
        : null;

  return (
    <View style={styles.cardShell}>
      <BlurView intensity={24} tint={blurTint} style={StyleSheet.absoluteFill} />
      <View style={styles.cardInner}>
        <FinanceHeader monthLabel={finance.monthLabel} onOpenFinance={handleOpenFinance} styles={styles} />

        <View style={styles.balanceBlock}>
          <AnimatedBalanceText
            key={`${finance.balance}-${finance.displayCurrency}`}
            value={finance.balance}
            currency={finance.displayCurrency}
            style={styles.balanceValue}
          />
          <Text style={styles.balanceCaption}>Total balance · {finance.displayCurrency}</Text>
          {finance.balancesByCurrency.length > 1 ? (
            <View className="mt-2 flex-row flex-wrap gap-2">
              {finance.balancesByCurrency
                .filter((entry) => entry.currency !== finance.displayCurrency)
                .map((entry) => (
                  <Text key={entry.currency} style={styles.balanceChip}>
                    {formatMoney(entry.balance, entry.currency)}
                  </Text>
                ))}
            </View>
          ) : null}
          {balanceTrend !== null ? (
            <View className="mt-1 flex-row items-center gap-1">
              <TrendIcon color={trendColor} size={13} strokeWidth={2.3} />
              <Text style={[styles.trendText, { color: trendColor }]}>
                {trendUp ? '+' : ''}
                {balanceTrend}% vs last month
              </Text>
            </View>
          ) : null}
        </View>

        <SectionDivider styles={styles} />

        <View className="flex-row gap-2">
          <MiniFlowCard
            tone="income"
            amount={finance.monthlyIncome}
            currency={finance.displayCurrency}
            onPress={handleOpenFinance}
            styles={styles}
          />
          <MiniFlowCard
            tone="expense"
            amount={finance.monthlyExpense}
            currency={finance.displayCurrency}
            onPress={handleOpenFinance}
            styles={styles}
          />
        </View>

        <SectionDivider styles={styles} />

        {finance.activeGoal ? (
          finance.activeGoal.isComplete ? (
            <Animated.View style={[styles.goalCard, styles.goalCompleteCard, goalCelebrateStyle]}>
              <View className="flex-row items-center gap-2">
                <Sparkles color={SEMANTIC.income} size={16} />
                <Text style={styles.goalCompleteTitle}>Goal reached!</Text>
              </View>
              <Text style={styles.goalName}>{finance.activeGoal.name}</Text>
              <Pressable onPress={handleOpenFinance} className="mt-2 active:opacity-85">
                <Text style={styles.goalCreateLink}>Create a new goal</Text>
              </Pressable>
            </Animated.View>
          ) : (
            <Pressable onPress={handleOpenFinance} className="active:opacity-92">
              <View style={styles.goalCard}>
                <View className="flex-row items-center gap-2">
                  <TrackItIcon name="target" size={15} color={BRAND.primary} />
                  <Text style={styles.goalName}>{finance.activeGoal.name}</Text>
                </View>
                <Text style={styles.goalAmounts}>
                  {formatMoney(finance.activeGoal.savedAmount)} of{' '}
                  {formatMoney(finance.activeGoal.targetAmount)}
                </Text>
                <View style={styles.progressTrack}>
                  <Animated.View
                    style={[styles.progressFill, goalBarStyle, { backgroundColor: BRAND.primary }]}
                  />
                </View>
                <Text style={styles.metaPercent}>{finance.activeGoal.percent}%</Text>
              </View>
            </Pressable>
          )
        ) : (
          <Pressable onPress={handleOpenFinance} className="active:opacity-90">
            <View style={styles.goalCreateButton}>
              <Text style={styles.goalCreateText}>Create goal</Text>
            </View>
          </Pressable>
        )}

        {lastTx ? (
          <>
            <SectionDivider styles={styles} />
            <View style={styles.lastTxSection}>
              <Text style={styles.sectionKicker}>Last transaction</Text>
              <View className="mt-2 flex-row items-center justify-between">
                <View className="flex-1 flex-row items-center gap-2 pr-3">
                  <TrackItIcon name={lastTx.icon} size={16} color={BRAND.primary} badge badgeSize={32} />
                  <View className="flex-1">
                    <Text style={styles.lastTxLabel} numberOfLines={1}>
                      {lastTx.label}
                    </Text>
                    <Text style={styles.lastTxRelative}>{lastTx.relative}</Text>
                  </View>
                </View>
                <Text
                  style={[
                    styles.lastTxAmount,
                    { color: lastTx.amount >= 0 ? SEMANTIC.income : theme.textPrimary },
                  ]}
                >
                  {formatSignedMoney(lastTx.amount)}
                </Text>
              </View>
            </View>
          </>
        ) : null}

        <FinanceMarketCarousel displayCurrency={finance.displayCurrency} />

        <View style={styles.actionRow}>
          <Pressable onPress={handleOpenIncome} className="flex-1 active:opacity-90">
            <View style={[styles.actionButton, styles.actionIncome]}>
              <Plus color={SEMANTIC.income} size={15} strokeWidth={2.5} />
              <Text style={[styles.actionLabel, { color: SEMANTIC.income }]}>Income</Text>
            </View>
          </Pressable>
          <Pressable onPress={handleOpenExpense} className="flex-1 active:opacity-90">
            <View style={[styles.actionButton, styles.actionExpense]}>
              <Plus color={BRAND.primary} size={15} strokeWidth={2.5} />
              <Text style={[styles.actionLabel, { color: BRAND.primary }]}>Expense</Text>
            </View>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
