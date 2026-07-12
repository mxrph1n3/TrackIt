import { triggerHaptic } from '../../lib/platform/haptics';

export async function finalizeQuickActionSuccess(onClose: () => void): Promise<void> {
  void triggerHaptic('success');
  onClose();
}
