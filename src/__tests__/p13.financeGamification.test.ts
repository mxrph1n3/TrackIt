import {
  buildFinanceGamificationMetrics,
  computeFinancialShieldCoef,
  computeFinanceDisciplineXp,
  computeSavingsBossDamage,
  financeXpMultiplier,
  resolveShieldStatus,
} from '../lib/finance/gamification';
import { formatMoney, formatMoneyCompact } from '../constants/financeCategories';

describe('finance gamification', () => {
  it('computes FSC from expenses and budget', () => {
    expect(computeFinancialShieldCoef(48_700, 70_000)).toBe(30);
    expect(computeFinancialShieldCoef(70_000, 70_000)).toBe(0);
    expect(computeFinancialShieldCoef(0, 70_000)).toBe(100);
    expect(computeFinancialShieldCoef(10_000, 0)).toBe(100);
  });

  it('computes SBD from savings and goal', () => {
    expect(computeSavingsBossDamage(84_000, 126_000)).toBe(67);
    expect(computeSavingsBossDamage(126_000, 126_000)).toBe(100);
    expect(computeSavingsBossDamage(0, 0)).toBe(0);
  });

  it('resolves shield status thresholds', () => {
    expect(resolveShieldStatus(80, true, 20)).toBe('on_track');
    expect(resolveShieldStatus(25, true, 86)).toBe('at_risk');
    expect(resolveShieldStatus(10, true, 50)).toBe('vulnerable');
    expect(resolveShieldStatus(0, true, 110)).toBe('vulnerable');
    expect(resolveShieldStatus(100, false, 0)).toBe('no_budget');
  });

  it('applies vulnerable XP debuff at FSC <= 15', () => {
    expect(financeXpMultiplier(15, true)).toBe(0.75);
    expect(financeXpMultiplier(16, true)).toBe(1);
    expect(financeXpMultiplier(10, false)).toBe(1);
  });

  it('builds gamification metrics bundle', () => {
    const metrics = buildFinanceGamificationMetrics({
      monthlyExpense: 48_700,
      monthlyBudgetLimit: 70_000,
      hasBudget: true,
      budgetUsedPercent: 70,
      goalSaved: 84_000,
      goalTarget: 126_000,
    });

    expect(metrics.shieldStrengthPercent).toBe(30);
    expect(metrics.shieldStatus).toBe('at_risk');
    expect(metrics.bossProgressPercent).toBe(67);
    expect(metrics.isVulnerable).toBe(false);
    expect(metrics.xpMultiplier).toBe(1);
  });

  it('computes discipline XP bonus from daily savings', () => {
    expect(computeFinanceDisciplineXp(100, 500, 2_000)).toBe(125);
    expect(computeFinanceDisciplineXp(100, 0, 0)).toBe(100);
  });
});

describe('formatMoney', () => {
  it('uses space thousands separator and trailing ruble symbol', () => {
    expect(formatMoney(128_450, 'RUB')).toBe('128 450 ₽');
    expect(formatMoney(84_000, 'RUB')).toBe('84 000 ₽');
  });

  it('formats compact K/M for micro widgets', () => {
    expect(formatMoneyCompact(1_280_000, 'RUB')).toBe('1.28M ₽');
    expect(formatMoneyCompact(84_000, 'RUB')).toBe('84.00K ₽');
  });
});
