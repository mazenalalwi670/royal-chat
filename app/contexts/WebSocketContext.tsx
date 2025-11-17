'use client';

import { createContext, useContext, useEffect, ReactNode, useState } from 'react';
import io from 'socket.io-client';
import type { Socket } from 'socket.io-client';

type SocketType = Socket;

interface WebSocketContextType {
  socket: SocketType | null;
  isConnected: boolean;
}

const WebSocketContext = createContext<WebSocketContextType>({
  socket: null,
  isConnected: false,
});

// eslint-disable-next-line react-refresh/only-export-components
export const useWebSocket = () => useContext(WebSocketContext);

interface WebSocketProviderProps {
  children: ReactNode;
}

export const WebSocketProvider = ({ children }: WebSocketProviderProps) => {
  const [socket, setSocket] = useState<SocketType | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Get WebSocket URL from environment or use same host as app
    // In Railway, WebSocket runs on the same port as Next.js
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 
      (typeof window !== 'undefined' 
        ? (window.location.protocol === 'https:' ? 'wss://' : 'ws://') + window.location.host
        : 'ws://localhost:8080');
    
    // Initialize socket connection with Android support
    const socketInstance = io(wsUrl, {
      transports: ['websocket', 'polling'], // Fallback to polling for Android
      upgrade: true,
      rememberUpgrade: true,
      secure: wsUrl.startsWith('wss://') || wsUrl.startsWith('https://'),
      // Android specific settings
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
      timeout: 20000,
      forceNew: false,
      // Android WebView compatibility
      autoConnect: true,
      // Better error handling for Android
      rejectUnauthorized: false
    });

    const onConnect = () => {
      console.log('Connected to WebSocket server');
      setIsConnected(true);
    };

    const onDisconnect = () => {
      console.log('Disconnected from WebSocket server');
      setIsConnected(false);
    };

    socketInstance.on('connect', onConnect);
    socketInstance.on('disconnect', onDisconnect);

    setSocket(socketInstance);

    return () => {
      socketInstance.off('connect', onConnect);
      socketInstance.off('disconnect', onDisconnect);
      socketInstance.close();
    };
  }, []);

  const value = {
    socket,
    isConnected,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};
