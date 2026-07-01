import { showErrorToast, showSuccessToast } from '../../stores/useToastStore';

export function reportSyncError(scope: string, error: unknown, userMessage?: string) {
  const detail = error instanceof Error ? error.message : String(error);
  console.warn(`[${scope}]`, detail);
  showErrorToast(userMessage ?? 'Sync failed. Check your connection and try again.');
}

export function reportSyncSuccess(message: string) {
  showSuccessToast(message);
}
