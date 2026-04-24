'use client';

import { useState, useCallback, useRef } from 'react';
import { useSocket } from './useSocket';
import { api } from '@/lib/api';
import { ApiResponse } from '@/types';

export interface AppNotification {
  id: string;
  conversationId: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const fetchedRef = useRef(false);

  const fetchNotifications = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const res = await api.get<ApiResponse<AppNotification[]>>('/whatsapp/notifications');
      setNotifications(res.data ?? []);
      fetchedRef.current = true;
    } catch {
      // silently fail — not critical
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  const markRead = useCallback(async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    await api.post(`/whatsapp/notifications/${id}/read`, {}).catch(() => {});
  }, []);

  const markAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    await api.post('/whatsapp/notifications/read-all', {}).catch(() => {});
  }, []);

  // Listen for real-time new notifications via socket
  useSocket({
    'notification:new': (data) => {
      const notification = data as AppNotification;
      setNotifications((prev) => {
        // Avoid duplicates
        if (prev.some((n) => n.id === notification.id)) return prev;
        return [notification, ...prev];
      });
    },
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markRead,
    markAllRead,
  };
}
