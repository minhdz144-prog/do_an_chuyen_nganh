import { create } from 'zustand';
import axiosInstance from '@/lib/axios';
import Cookies from 'js-cookie';

export interface Notification {
  _id: string;
  type: 'new_application' | 'status_changed' | 'system';
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addNotification: (notification: Notification) => void;
  incrementUnread: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,

  fetchNotifications: async () => {
    // Không fetch nếu chưa đăng nhập — tránh lỗi 401 trên trang public
    const token = Cookies.get('token');
    if (!token) return;
    try {
      const response = await axiosInstance.get('/notifications?limit=20') as any;
      if (response.success) {
        set({
          notifications: response.data.notifications,
          unreadCount: response.data.unreadCount,
        });
      }
    } catch (error) {
      // Bỏ qua lỗi 401 (token hết hạn) để tránh spam console
      const err = error as any;
      if (err?.response?.status !== 401) {
        console.error('Failed to fetch notifications:', error);
      }
    }
  },

  markAsRead: async (id: string) => {
    try {
      // Optimistic update
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n._id === id ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
      await axiosInstance.patch(`/notifications/${id}/read`);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      // Rollback could be implemented here
    }
  },

  markAllAsRead: async () => {
    try {
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));
      await axiosInstance.patch('/notifications/read-all');
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  },

  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications].slice(0, 20),
      unreadCount: state.unreadCount + 1,
    }));
  },

  incrementUnread: () => {
    set((state) => ({ unreadCount: state.unreadCount + 1 }));
  }
}));
