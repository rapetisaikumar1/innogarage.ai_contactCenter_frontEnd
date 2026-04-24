'use client';

import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') ?? 'http://localhost:4000';

let globalSocket: Socket | null = null;
let refCount = 0;

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('cc_token');
}

function getOrCreateSocket(): Socket {
  if (!globalSocket || !globalSocket.connected) {
    globalSocket = io(BACKEND_URL, {
      auth: { token: getToken() },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    });
  }
  return globalSocket;
}

type SocketEventHandler = (data: unknown) => void;

export function useSocket(
  events: Record<string, SocketEventHandler>
) {
  const socketRef = useRef<Socket | null>(null);
  // Keep events ref stable
  const eventsRef = useRef(events);
  eventsRef.current = events;

  const connect = useCallback(() => {
    const token = getToken();
    if (!token) return;

    refCount++;
    const socket = getOrCreateSocket();
    socketRef.current = socket;

    // Attach all listeners
    Object.entries(eventsRef.current).forEach(([event, handler]) => {
      socket.on(event, handler as (...args: unknown[]) => void);
    });
  }, []);

  const disconnect = useCallback(() => {
    const socket = socketRef.current;
    if (!socket) return;

    // Remove listeners added by this hook instance
    Object.entries(eventsRef.current).forEach(([event, handler]) => {
      socket.off(event, handler as (...args: unknown[]) => void);
    });

    refCount--;
    if (refCount <= 0) {
      socket.disconnect();
      globalSocket = null;
      refCount = 0;
    }
    socketRef.current = null;
  }, []);

  useEffect(() => {
    connect();
    return () => { disconnect(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return socketRef;
}
