import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

// Use a singleton socket instance
let socketInstance: Socket | null = null;

export function useWebSocket() {
  const [connected, setConnected] = useState(false);
  const pendingSubscriptions = useRef<string[]>([]);
  
  // Initialize socket connection
  useEffect(() => {
    // Create socket if it doesn't exist
    if (!socketInstance) {
      socketInstance = io(BACKEND_URL, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 10,
        timeout: 10000,
        transports: ['websocket', 'polling'] // Try WebSocket first, then fall back to polling
      });
    }

    // Set up event listeners
    const onConnect = () => {
      setConnected(true);
      
      // Resubscribe to channels after reconnection
      if (pendingSubscriptions.current.length > 0) {
        pendingSubscriptions.current.forEach(channel => {
          socketInstance?.emit(`subscribe-${channel}`);
        });
      }
    };

    const onDisconnect = () => setConnected(false);

    const onConnectError = () => setConnected(false);

    socketInstance.on('connect', onConnect);
    socketInstance.on('disconnect', onDisconnect);
    socketInstance.on('connect_error', onConnectError);

    // Check if already connected
    if (socketInstance.connected) {
      setConnected(true);
    }

    // Clean up event listeners on unmount
    return () => {
      socketInstance?.off('connect', onConnect);
      socketInstance?.off('disconnect', onDisconnect);
      socketInstance?.off('connect_error', onConnectError);
    };
  }, []);

  // Subscribe to channels
  const subscribe = useCallback((channels: string[]) => {
    if (!channels?.length) return;
    
    // Save subscriptions for reconnection
    pendingSubscriptions.current = [...new Set([...pendingSubscriptions.current, ...channels])];
    
    if (socketInstance && connected) {
      channels.forEach(channel => {
        socketInstance?.emit(`subscribe-${channel}`);
      });
    }
  }, [connected]);

  // Unsubscribe from channels
  const unsubscribe = useCallback((channels: string[]) => {
    if (!channels?.length) return;
    
    // Remove from pending subscriptions
    pendingSubscriptions.current = pendingSubscriptions.current.filter(
      channel => !channels.includes(channel)
    );
    
    if (socketInstance && connected) {
      channels.forEach(channel => {
        socketInstance?.emit(`unsubscribe-${channel}`);
      });
    }
  }, [connected]);

  // Listen for events
  const on = useCallback((event: string, callback: (...args: any[]) => void) => {
    if (socketInstance) {
      socketInstance.on(event, callback);
    }
  }, []);

  // Remove event listener
  const off = useCallback((event: string, callback?: (...args: any[]) => void) => {
    if (socketInstance) {
      socketInstance.off(event, callback);
    }
  }, []);

  // Force reconnection
  const reconnect = useCallback(() => {
    if (socketInstance) {
      socketInstance.disconnect();
      socketInstance.connect();
    }
  }, []);

  return {
    connected,
    isConnected: connected, // Alias for compatibility
    socket: socketInstance,
    subscribe,
    unsubscribe,
    on,
    off,
    reconnect
  };
}