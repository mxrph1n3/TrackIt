import { create } from 'zustand';

export type ToastType = 'error' | 'success' | 'info';

type ToastState = {
  message: string | null;
  type: ToastType;
  show: (message: string, type?: ToastType) => void;
  dismiss: () => void;
};

let hideTimer: ReturnType<typeof setTimeout> | null = null;

export const useToastStore = create<ToastState>((set) => ({
  message: null,
  type: 'info',
  show: (message, type = 'info') => {
    if (hideTimer) {
      clearTimeout(hideTimer);
    }

    set({ message, type });

    hideTimer = setTimeout(() => {
      set({ message: null });
      hideTimer = null;
    }, 3200);
  },
  dismiss: () => {
    if (hideTimer) {
      clearTimeout(hideTimer);
      hideTimer = null;
    }
    set({ message: null });
  },
}));

export function showErrorToast(message: string) {
  useToastStore.getState().show(message, 'error');
}

export function showSuccessToast(message: string) {
  useToastStore.getState().show(message, 'success');
}
