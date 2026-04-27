'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
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
  /** present on agent notifications */
  metadata?: Record<string, unknown> | null;
  /** used internally to distinguish notification sources for markRead routing */
  _source?: 'whatsapp' | 'agent';
}

// ── Play the notification sound using the bundled MP3 ───────────────────────────
function playNotificationSound() {
  try {
    const audio = new Audio('/notification.mp3');
    audio.volume = 0.7;
    audio.play().catch(() => {});
  } catch {
    // Audio not available — silently ignore
  }
}

// ── Request browser notification permission ───────────────────────────────────
function requestNotificationPermission() {
  if (typeof window === 'undefined') return;
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

// ── Show browser notification ─────────────────────────────────────────────────
function showBrowserNotification(title: string, body: string) {
  if (typeof window === 'undefined') return;
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  // Don't show if window is focused
  if (document.hasFocus()) return;
  try {
    new Notification(title, { body, icon: '/next.svg', tag: 'whatsapp-msg' });
  } catch {
    // Ignore — some browsers block programmatic notifications
  }
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const isLoadingRef = useRef(false);
  // Track if this is the initial load — don't play sound for historical notifications
  const initialLoadDoneRef = useRef(false);

  const fetchNotifications = useCallback(async () => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;
    setIsLoading(true);
    try {
      const [whatsappRes, agentRes] = await Promise.all([
        api.get<ApiResponse<AppNotification[]>>('/whatsapp/notifications').catch(() => ({ data: [] as AppNotification[] })),
        api.get<ApiResponse<AppNotification[]>>('/agent-notifications').catch(() => ({ data: [] as AppNotification[] })),
      ]);

      const whatsapp = (whatsappRes.data ?? []).map((n) => ({ ...n, _source: 'whatsapp' as const }));
      const agent = (agentRes.data ?? []).map((n) => ({ ...n, _source: 'agent' as const }));

      // Merge and sort by createdAt desc
      const merged = [...whatsapp, ...agent].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      setNotifications(merged);
      initialLoadDoneRef.current = true;
    } catch {
      // silently fail
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  }, []);

  // Fetch on mount + request browser notification permission
  useEffect(() => {
    fetchNotifications();
    requestNotificationPermission();
  }, [fetchNotifications]);

  const markRead = useCallback(async (id: string) => {
    setNotifications((prev) => {
      const target = prev.find((n) => n.id === id);
      if (!target) return prev;
      const source = target._source ?? 'whatsapp';
      if (source === 'agent') {
        api.post(`/agent-notifications/${id}/read`, {}).catch(() => {});
      } else {
        api.post(`/whatsapp/notifications/${id}/read`, {}).catch(() => {});
      }
      return prev.map((n) => (n.id === id ? { ...n, isRead: true } : n));
    });
  }, []);

  const markAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    await Promise.all([
      api.post('/whatsapp/notifications/read-all', {}).catch(() => {}),
      api.post('/agent-notifications/read-all', {}).catch(() => {}),
    ]);
  }, []);

  // Real-time: new notification arrives via socket
  useSocket({
    'notification:new': (data) => {
      const notification = { ...(data as AppNotification), _source: 'whatsapp' as const };
      setNotifications((prev) => {
        if (prev.some((n) => n.id === notification.id)) return prev;
        return [notification, ...prev];
      });
      if (initialLoadDoneRef.current) {
        playNotificationSound();
        showBrowserNotification(notification.title, notification.body);
      }
    },
    'agent:notification:new': (data) => {
      const notification = { ...(data as AppNotification), _source: 'agent' as const };
      setNotifications((prev) => {
        if (prev.some((n) => n.id === notification.id)) return prev;
        return [notification, ...prev];
      });
      if (initialLoadDoneRef.current) {
        playNotificationSound();
        showBrowserNotification(notification.title, notification.body);
      }
    },
    // Fired when agent replies to a conversation — backend sets clearedAt, so
    // these notifications will NOT come back from the API on page refresh.
    // Remove them from local state entirely so the bell count drops immediately.
    'notifications:cleared': (data) => {
      const { conversationId } = data as { conversationId: string };
      setNotifications((prev) => prev.filter((n) => n.conversationId !== conversationId));
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
