import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { FinanceMiniForm } from '../quickActions/FinanceMiniForm';
import { useAppSafeAreaInsets } from '../../hooks/useAppSafeAreaInsets';
import { useTheme } from '../../theme/ThemeContext';
import type { TransactionType } from '../../types/finance';

type FinanceTransactionSheetProps = {
  visible: boolean;
  type: TransactionType;
  onClose: () => void;
  onSuccess: () => void;
};

export function FinanceTransactionSheet({
  visible,
  type,
  onClose,
  onSuccess,
}: FinanceTransactionSheetProps) {
  const { theme } = useTheme();
  const insets = useAppSafeAreaInsets();

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: theme.background,
              paddingBottom: Math.max(insets.bottom, 16),
            },
          ]}
        >
          <FinanceMiniForm
            key={type}
            initialType={type}
            onSuccess={() => {
              onSuccess();
              onClose();
            }}
            onBack={onClose}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 12, 32, 0.45)',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 12,
    maxHeight: '88%',
  },
});
