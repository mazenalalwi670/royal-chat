// Gamification System Types
export interface UserPoints {
  userId: string;
  totalPoints: number;
  level: number;
  experience: number;
  experienceToNextLevel: number;
  messagesSent: number;
  reactionsReceived: number;
  reactionsGiven: number;
  daysActive: number;
  lastActiveDate: string;
}

export interface UserRank {
  id: string;
  name: string;
  nameAr: string;
  minLevel: number;
  minPoints: number;
  color: string;
  icon: string;
  badge: string;
  frame?: string;
  privileges: string[];
}

export interface UserBadge {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: Date;
}

export interface GoldenFrame {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  image: string; // PNG transparent
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  requiredLevel?: number;
  requiredPoints?: number;
  price?: number;
  isPremium: boolean;
  unlockedAt?: Date;
}

export interface UserProfile {
  userId: string;
  points: UserPoints;
  rank: UserRank;
  badges: UserBadge[];
  selectedFrame?: GoldenFrame;
  decorations: string[];
  statusMessage?: string;
  backgroundImage?: string;
  backgroundGradient?: string;
}



