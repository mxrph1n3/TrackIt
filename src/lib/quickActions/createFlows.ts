import { usePlannerStore } from '../../stores/usePlannerStore';
import { useFinanceTransactionStore } from '../../stores/useFinanceTransactionStore';
import type { TransactionType } from '../../types/finance';

export function openNewTaskSheet(): void {
  usePlannerStore.getState().openTaskSheet();
}

export function openFinanceSheet(type: TransactionType): void {
  useFinanceTransactionStore.getState().open(type);
}
