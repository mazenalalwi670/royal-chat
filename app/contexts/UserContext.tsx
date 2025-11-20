'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useWebSocket } from './WebSocketContext';

interface User {
  id: string;
  phoneNumber: string;
  name: string;
  avatar: string;
  isLoggedIn: boolean;
}

interface UserContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phoneNumber: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  setUser: (user: { id: string; name: string; avatar: string; phoneNumber?: string; email?: string }) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const STORAGE_KEY = 'royal_chat_user';

// Royal Crown Icon - Default avatar for all users (luxurious)
const getRoyalCrownIcon = (): string => {
  return `data:image/svg+xml;base64,${btoa(`
    <svg width="150" height="150" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="crownGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#FFD700;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#FFA500;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#FFD700;stop-opacity:1" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <rect width="200" height="200" fill="#1a1a1a" rx="100"/>
      <!-- Crown Base -->
      <path d="M50 140 L75 60 L100 80 L125 60 L150 140 Z" 
            fill="url(#crownGradient)" 
            stroke="#FFD700" 
            stroke-width="3"
            filter="url(#glow)"/>
      <!-- Crown Points -->
      <circle cx="75" cy="60" r="10" fill="#FFD700" filter="url(#glow)"/>
      <circle cx="100" cy="50" r="12" fill="#FFD700" filter="url(#glow)"/>
      <circle cx="125" cy="60" r="10" fill="#FFD700" filter="url(#glow)"/>
      <!-- Crown Base Band -->
      <path d="M45 140 L155 140 L160 150 L40 150 Z" fill="#FFD700" opacity="0.8" filter="url(#glow)"/>
      <!-- Royal Text -->
      <text x="100" y="175" font-family="serif" font-size="24" font-weight="bold" 
            fill="#FFD700" text-anchor="middle" filter="url(#glow)">R</text>
    </svg>
  `)}`;
};

export function UserProvider({ children }: { children: ReactNode }) {
  const { socket, isConnected } = useWebSocket();
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    // FORCE LOGIN: Always show login page on entry
    // Don't auto-load saved user from localStorage
    // User must explicitly login every time
    const loadUser = () => {
      try {
        if (typeof window !== 'undefined') {
          // Always require login - don't auto-load saved user
          // Clear any saved user data to force login
          // localStorage.removeItem(STORAGE_KEY); // Uncomment if you want to clear saved data
          
          // Always show login page
          if (mounted) {
            setIsAuthenticated(false);
            setUser(null);
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error('Error loading user:', error);
        if (mounted) {
          setIsAuthenticated(false);
          setUser(null);
        }
      } finally {
        // Always set loading to false
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // Load user immediately on client
    if (typeof window !== 'undefined') {
      loadUser();
    } else {
      // Server-side: not authenticated
      setIsLoading(false);
      setIsAuthenticated(false);
      setUser(null);
    }
    
    return () => {
      mounted = false;
    };
  }, []);

  // Register user with WebSocket server when user logs in and socket is connected (real-time phone sync)
  useEffect(() => {
    if (user && socket && isConnected) {
      // Register user with complete phone number info
      socket.emit('register_user', {
        userId: user.id,
        phoneNumber: user.phoneNumber,
        name: user.name,
        avatar: user.avatar
      });
      console.log(`✅ User registered with phone number: ${user.phoneNumber} (Real-time sync enabled)`);
    }
  }, [user, socket, isConnected]);

  const login = async (phoneNumber: string): Promise<void> => {
    // Currently no restrictions - accept any phone number for testing
    // Use phone number as default name (user can change it later from settings)
    // MANDATORY: Royal Crown icon as default avatar for ALL users (luxurious)
    const royalCrownIcon = getRoyalCrownIcon();
    
    const newUser: User = {
      id: `user-${Date.now()}`,
      phoneNumber,
      name: phoneNumber, // Default name is phone number - user can change from settings
      avatar: royalCrownIcon, // MANDATORY: Royal Crown icon for all users (can be changed in settings)
      isLoggedIn: true
    };

    setUser(newUser);
    setIsAuthenticated(true);

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    }

    // Register user with WebSocket server (real-time phone number sync)
    if (socket && isConnected) {
      socket.emit('register_user', {
        userId: newUser.id,
        phoneNumber: newUser.phoneNumber,
        name: newUser.name,
        avatar: newUser.avatar
      });
      console.log(`User registered with phone: ${newUser.phoneNumber}`);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
      }

      // Notify server about profile update (for real-time updates)
      if (socket && isConnected && (updates.name || updates.avatar)) {
        socket.emit('update_user_profile', {
          userId: user.id,
          name: updates.name,
          avatar: updates.avatar
        });
      }
    }
  };

  const setUserFromAuth = (userData: { id: string; name: string; avatar: string; phoneNumber?: string; email?: string }) => {
    const newUser: User = {
      id: userData.id,
      phoneNumber: userData.phoneNumber || '',
      name: userData.name,
      avatar: userData.avatar,
      isLoggedIn: true
    };
    setUser(newUser);
    setIsAuthenticated(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        updateUser,
        setUser: setUserFromAuth
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

