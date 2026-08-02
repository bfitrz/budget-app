import { create } from 'zustand';

export type NotificationType = 'success' | 'info' | 'warning' | 'error';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  createdAt: number;
}

interface NotificationState {
  notifications: Notification[];
  notify: (type: NotificationType, message: string) => void;
  dismiss: (id: string) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],

  notify: (type, message) => {
    const id = crypto.randomUUID();
    const notification: Notification = { id, type, message, createdAt: Date.now() };
    set({ notifications: [notification, ...get().notifications].slice(0, 10) });

    // Auto-dismiss after 5s
    setTimeout(() => {
      set({ notifications: get().notifications.filter((n) => n.id !== id) });
    }, 5000);
  },

  dismiss: (id) => {
    set({ notifications: get().notifications.filter((n) => n.id !== id) });
  },
}));

// Helper to fire notifications from anywhere
export const notify = {
  success: (message: string) => useNotificationStore.getState().notify('success', message),
  info: (message: string) => useNotificationStore.getState().notify('info', message),
  warning: (message: string) => useNotificationStore.getState().notify('warning', message),
  error: (message: string) => useNotificationStore.getState().notify('error', message),
};
