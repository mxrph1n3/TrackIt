import * as Haptics from 'expo-haptics';

export async function finalizeQuickActionSuccess(onClose: () => void): Promise<void> {
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  onClose();
}
