type BalanceTransaction = {
  type: 'income' | 'expense';
  amount: number;
  account_id: string | null;
};

export function computeAccountBalanceFromTransactions(
  accountId: string,
  transactions: BalanceTransaction[],
  options?: { includeOrphans?: boolean },
): number {
  return transactions.reduce((sum, row) => {
    const matchesAccount = row.account_id === accountId;
    const orphanOnDefault = options?.includeOrphans && !row.account_id;
    if (!matchesAccount && !orphanOnDefault) return sum;
    const amount = Number(row.amount);
    return row.type === 'income' ? sum + amount : sum - amount;
  }, 0);
}

export function computeTotalBalanceInCurrency(
  transactions: BalanceTransaction[],
  accountCurrencies: Map<string, string>,
  displayCurrency: string,
): number {
  return transactions.reduce((sum, row) => {
    const currency = row.account_id
      ? (accountCurrencies.get(row.account_id) ?? displayCurrency)
      : displayCurrency;
    if (currency !== displayCurrency) return sum;
    const amount = Number(row.amount);
    return row.type === 'income' ? sum + amount : sum - amount;
  }, 0);
}

export function resolveAccountBalance(
  accountId: string,
  storedBalance: number | null | undefined,
  transactions: BalanceTransaction[],
  options?: { isDefault?: boolean },
): number {
  const hasAssigned = transactions.some(
    (row) => row.account_id === accountId || (options?.isDefault && !row.account_id),
  );

  if (hasAssigned) {
    return computeAccountBalanceFromTransactions(accountId, transactions, {
      includeOrphans: options?.isDefault,
    });
  }

  if (transactions.length === 0) {
    return 0;
  }

  return 0;
}

export function resolveDisplayBalance(input: {
  transactions: BalanceTransaction[];
  accounts: { id: string; currency: string; isDefault: boolean; balance: number }[];
  displayCurrency: string;
}): number {
  const accountCurrencies = new Map(input.accounts.map((account) => [account.id, account.currency]));

  if (input.transactions.length > 0) {
    return computeTotalBalanceInCurrency(
      input.transactions,
      accountCurrencies,
      input.displayCurrency,
    );
  }

  return 0;
}
