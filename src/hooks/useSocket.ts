'use client';

import { useEffect, useRef } from 'react';
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

export type SocketEventHandler = (data: unknown) => void;

/**
 * useSocket — attach socket.io event listeners that always call the LATEST handler.
 *
 * Each event gets one stable wrapper function (stored in wrappersRef) that
 * delegates to eventsRef.current, so:
 *  - The same function reference is passed to socket.on AND socket.off → clean teardown
 *  - Handlers in the parent component can be inline/arrow functions without causing
 *    duplicate listeners or stale closures
 */
export function useSocket(events: Record<string, SocketEventHandler>) {
  // Always holds the latest event map — updated every render
  const eventsRef = useRef(events);
  eventsRef.current = events;

  // Stable wrapper functions: created once per event per hook instance
  const wrappersRef = useRef<Record<string, (...args: unknown[]) => void>>({});

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    refCount++;
    const socket = getOrCreateSocket();
    socketRef.current = socket;

    // For each event, create one stable wrapper (or reuse existing) that delegates
    // to the latest handler in eventsRef. This means socket.off() will always
    // receive the exact same function reference that socket.on() received.
    Object.keys(events).forEach((event) => {
      if (!wrappersRef.current[event]) {
        wrappersRef.current[event] = (data: unknown) => {
          eventsRef.current[event]?.(data);
        };
      }
      socket.on(event, wrappersRef.current[event]);
    });

    return () => {
      // Remove exactly what we attached
      Object.keys(events).forEach((event) => {
        if (wrappersRef.current[event]) {
          socket.off(event, wrappersRef.current[event]);
        }
      });

      refCount--;
      if (refCount <= 0) {
        socket.disconnect();
        globalSocket = null;
        refCount = 0;
      }
      socketRef.current = null;
    };
    // Intentionally empty deps — run once on mount/unmount only.
    // eventsRef always has the latest handlers without needing to re-subscribe.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return socketRef;
}
