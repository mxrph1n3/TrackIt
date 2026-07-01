import {
  computeAccountBalanceFromTransactions,
  computeTotalBalanceInCurrency,
  resolveAccountBalance,
  resolveDisplayBalance,
} from '../lib/finance/accountBalance';

describe('accountBalance', () => {
  const transactions = [
    { type: 'income' as const, amount: 50_000, account_id: 'acc-1' },
    { type: 'expense' as const, amount: 600, account_id: 'acc-1' },
    { type: 'income' as const, amount: 10_000, account_id: 'acc-1' },
    { type: 'expense' as const, amount: 1_200, account_id: null },
  ];

  it('computes balance from transactions instead of stale stored value', () => {
    expect(resolveAccountBalance('acc-1', 600, transactions, { isDefault: true })).toBe(58_200);
    expect(computeAccountBalanceFromTransactions('acc-1', transactions)).toBe(59_400);
  });

  it('assigns orphan transactions to the default account', () => {
    expect(resolveAccountBalance('acc-1', 600, transactions, { isDefault: true })).toBe(58_200);
    expect(resolveAccountBalance('acc-2', 600, transactions)).toBe(0);
  });

  it('sums all transactions in display currency for total balance', () => {
    const accountCurrencies = new Map([
      ['acc-1', 'RUB'],
      ['acc-2', 'USD'],
    ]);

    expect(computeTotalBalanceInCurrency(transactions, accountCurrencies, 'RUB')).toBe(58_200);
  });

  it('returns zero when there are no transactions', () => {
    expect(resolveAccountBalance('acc-1', 1_200, [])).toBe(0);
    expect(
      resolveDisplayBalance({
        transactions: [],
        accounts: [{ id: 'acc-1', currency: 'USD', isDefault: true, balance: 1_200 }],
        displayCurrency: 'USD',
      }),
    ).toBe(0);
  });

  it('uses transaction totals for display balance when activity exists', () => {
    expect(
      resolveDisplayBalance({
        transactions,
        accounts: [{ id: 'acc-1', currency: 'USD', isDefault: true, balance: 600 }],
        displayCurrency: 'USD',
      }),
    ).toBe(58_200);
  });
});
