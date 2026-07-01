import { FinanceTransactionSheet } from './FinanceTransactionSheet';
import { useFinanceTransactionStore } from '../../stores/useFinanceTransactionStore';

export function FinanceTransactionHost() {
  const isOpen = useFinanceTransactionStore((state) => state.isOpen);
  const type = useFinanceTransactionStore((state) => state.type);
  const close = useFinanceTransactionStore((state) => state.close);

  return (
    <FinanceTransactionSheet
      visible={isOpen}
      type={type}
      onClose={close}
      onSuccess={close}
    />
  );
}
