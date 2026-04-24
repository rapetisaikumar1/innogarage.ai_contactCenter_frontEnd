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
}

// ── Play a short two-tone beep via Web Audio API (no audio file required) ─────
function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const playTone = (freq: number, startAt: number, duration: number, gain: number) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + startAt);
      gainNode.gain.setValueAtTime(0, ctx.currentTime + startAt);
      gainNode.gain.linearRampToValueAtTime(gain, ctx.currentTime + startAt + 0.01);
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + startAt + duration);
      osc.start(ctx.currentTime + startAt);
      osc.stop(ctx.currentTime + startAt + duration);
    };
    playTone(880, 0, 0.15, 0.4);   // high note
    playTone(1100, 0.18, 0.2, 0.3); // higher note
    setTimeout(() => ctx.close(), 600);
  } catch {
    // AudioContext not available in SSR or blocked — silently ignore
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
      const res = await api.get<ApiResponse<AppNotification[]>>('/whatsapp/notifications');
      setNotifications(res.data ?? []);
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
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    await api.post(`/whatsapp/notifications/${id}/read`, {}).catch(() => {});
  }, []);

  const markAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    await api.post('/whatsapp/notifications/read-all', {}).catch(() => {});
  }, []);

  // Real-time: new notification arrives via socket
  useSocket({
    'notification:new': (data) => {
      const notification = data as AppNotification;
      setNotifications((prev) => {
        if (prev.some((n) => n.id === notification.id)) return prev;
        return [notification, ...prev];
      });
      // Only play sound/alert for live notifications (not on initial page load)
      if (initialLoadDoneRef.current) {
        playNotificationSound();
        showBrowserNotification(notification.title, notification.body);
      }
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
