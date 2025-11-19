'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserPoints, UserRank, UserBadge, GoldenFrame } from '@/types/gamification';
import { 
  initializeUserPoints, 
  addPoints, 
  getUserRank, 
  POINTS_REWARDS,
  STORAGE_KEYS,
  GOLDEN_FRAMES
} from '@/lib/gamification';
import { useUser } from './UserContext';

interface GamificationContextType {
  userPoints: UserPoints | null;
  userRank: UserRank | null;
  userBadges: UserBadge[];
  unlockedFrames: GoldenFrame[];
  selectedFrame: GoldenFrame | null;
  addUserPoints: (points: number, action: keyof typeof POINTS_REWARDS) => void;
  selectFrame: (frame: GoldenFrame) => void;
  getOnlineUsers: () => number;
  updateOnlineUsers: (count: number) => void;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export function GamificationProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const [userPoints, setUserPoints] = useState<UserPoints | null>(null);
  const [userRank, setUserRank] = useState<UserRank | null>(null);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [unlockedFrames, setUnlockedFrames] = useState<GoldenFrame[]>([]);
  const [selectedFrame, setSelectedFrame] = useState<GoldenFrame | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<number>(0);

  // Load user data
  useEffect(() => {
    if (user && typeof window !== 'undefined') {
      // Load points
      const savedPoints = localStorage.getItem(`${STORAGE_KEYS.USER_POINTS}_${user.id}`);
      if (savedPoints) {
        const points: UserPoints = JSON.parse(savedPoints);
        setUserPoints(points);
        const rank = getUserRank(points.level, points.totalPoints);
        setUserRank(rank);
      } else {
        const initialPoints = initializeUserPoints(user.id);
        setUserPoints(initialPoints);
        setUserRank(getUserRank(initialPoints.level, initialPoints.totalPoints));
        localStorage.setItem(`${STORAGE_KEYS.USER_POINTS}_${user.id}`, JSON.stringify(initialPoints));
      }

      // Load badges
      const savedBadges = localStorage.getItem(`${STORAGE_KEYS.USER_BADGES}_${user.id}`);
      if (savedBadges) {
        setUserBadges(JSON.parse(savedBadges));
      }

      // Load frames
      const savedFrames = localStorage.getItem(`${STORAGE_KEYS.USER_FRAMES}_${user.id}`);
      if (savedFrames) {
        const frames: GoldenFrame[] = JSON.parse(savedFrames);
        setUnlockedFrames(frames);
      } else {
        // Unlock basic frame by default
        const basicFrame = GOLDEN_FRAMES.find(f => f.id === 'golden-basic');
        if (basicFrame) {
          setUnlockedFrames([basicFrame]);
          localStorage.setItem(`${STORAGE_KEYS.USER_FRAMES}_${user.id}`, JSON.stringify([basicFrame]));
        }
      }

      // Load selected frame
      const savedSelectedFrame = localStorage.getItem(`selected_frame_${user.id}`);
      if (savedSelectedFrame) {
        const frame: GoldenFrame = JSON.parse(savedSelectedFrame);
        setSelectedFrame(frame);
      } else {
        // Select basic frame by default
        const basicFrame = GOLDEN_FRAMES.find(f => f.id === 'golden-basic');
        if (basicFrame) {
          setSelectedFrame(basicFrame);
        }
      }

      // Daily login bonus
      const today = new Date().toISOString().split('T')[0];
      const lastLogin = localStorage.getItem(`last_login_${user.id}`);
      if (lastLogin !== today) {
        addUserPoints(POINTS_REWARDS.DAILY_LOGIN, 'DAILY_LOGIN');
        localStorage.setItem(`last_login_${user.id}`, today);
      }
    }
  }, [user]);

  const addUserPoints = (points: number, action: keyof typeof POINTS_REWARDS) => {
    if (!user || !userPoints) return;

    const updated = addPoints(userPoints, points, action);
    setUserPoints(updated);
    const newRank = getUserRank(updated.level, updated.totalPoints);
    setUserRank(newRank);

    // Check if level up
    if (updated.level > userPoints.level) {
      // Unlock new frames based on level
      const newFrames = GOLDEN_FRAMES.filter(frame => {
        if (frame.requiredLevel && updated.level >= frame.requiredLevel) {
          return !unlockedFrames.find(f => f.id === frame.id);
        }
        return false;
      });

      if (newFrames.length > 0) {
        const allFrames = [...unlockedFrames, ...newFrames];
        setUnlockedFrames(allFrames);
        if (typeof window !== 'undefined') {
          localStorage.setItem(`${STORAGE_KEYS.USER_FRAMES}_${user.id}`, JSON.stringify(allFrames));
        }
      }
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(`${STORAGE_KEYS.USER_POINTS}_${user.id}`, JSON.stringify(updated));
    }
  };

  const selectFrame = (frame: GoldenFrame) => {
    if (!user) return;
    setSelectedFrame(frame);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`selected_frame_${user.id}`, JSON.stringify(frame));
    }
  };

  const getOnlineUsers = () => onlineUsers;
  const updateOnlineUsers = (count: number) => setOnlineUsers(count);

  return (
    <GamificationContext.Provider
      value={{
        userPoints,
        userRank,
        userBadges,
        unlockedFrames,
        selectedFrame,
        addUserPoints,
        selectFrame,
        getOnlineUsers,
        updateOnlineUsers
      }}
    >
      {children}
    </GamificationContext.Provider>
  );
}

export function useGamification() {
  const context = useContext(GamificationContext);
  if (context === undefined) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return context;
}





