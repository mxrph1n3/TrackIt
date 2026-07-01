import { create } from 'zustand';

import type { TransactionType } from '../types/finance';

type FinanceTransactionState = {
  isOpen: boolean;
  type: TransactionType;
  open: (type: TransactionType) => void;
  close: () => void;
};

export const useFinanceTransactionStore = create<FinanceTransactionState>((set) => ({
  isOpen: false,
  type: 'expense',
  open: (type) => set({ isOpen: true, type }),
  close: () => set({ isOpen: false }),
}));
