import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

let socket: Socket | null = null;

export function useWebSocket() {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!socket) {
      socket = io(BACKEND_URL, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });

      socket.on('connect', () => {
        console.log('Connected to WebSocket');
        setConnected(true);
      });

      socket.on('disconnect', () => {
        console.log('Disconnected from WebSocket');
        setConnected(false);
      });

      socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
      });
    }

    return () => {
      if (socket) {
        socket.removeAllListeners();
      }
    };
  }, []);

  const subscribe = useCallback((channels: string[]) => {
    if (socket && connected) {
      socket.emit('subscribe', channels);
    }
  }, [connected]);

  const unsubscribe = useCallback((channels: string[]) => {
    if (socket && connected) {
      socket.emit('unsubscribe', channels);
    }
  }, [connected]);

  const on = useCallback((event: string, callback: (...args: any[]) => void) => {
    if (socket) {
      socket.on(event, callback);
    }
  }, []);

  const off = useCallback((event: string, callback?: (...args: any[]) => void) => {
    if (socket) {
      socket.off(event, callback);
    }
  }, []);

  return {
    connected,
    subscribe,
    unsubscribe,
    on,
    off,
  };
}