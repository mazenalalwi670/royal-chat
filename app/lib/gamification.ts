import { UserPoints, UserRank, UserBadge, GoldenFrame } from '@/types/gamification';

// Rank System
export const RANKS: UserRank[] = [
  {
    id: 'bronze',
    name: 'Bronze',
    nameAr: 'برونزي',
    minLevel: 1,
    minPoints: 0,
    color: '#CD7F32',
    icon: '🥉',
    badge: 'bronze',
    privileges: ['basic_chat']
  },
  {
    id: 'silver',
    name: 'Silver',
    nameAr: 'فضي',
    minLevel: 5,
    minPoints: 500,
    color: '#C0C0C0',
    icon: '🥈',
    badge: 'silver',
    privileges: ['basic_chat', 'custom_status']
  },
  {
    id: 'gold',
    name: 'Gold',
    nameAr: 'ذهبي',
    minLevel: 10,
    minPoints: 2000,
    color: '#FFD700',
    icon: '🥇',
    badge: 'gold',
    privileges: ['basic_chat', 'custom_status', 'golden_frame']
  },
  {
    id: 'platinum',
    name: 'Platinum',
    nameAr: 'بلاتيني',
    minLevel: 20,
    minPoints: 5000,
    color: '#E5E4E2',
    icon: '💎',
    badge: 'platinum',
    privileges: ['basic_chat', 'custom_status', 'golden_frame', 'premium_badges']
  },
  {
    id: 'diamond',
    name: 'Diamond',
    nameAr: 'ماسي',
    minLevel: 30,
    minPoints: 10000,
    color: '#B9F2FF',
    icon: '💠',
    badge: 'diamond',
    privileges: ['basic_chat', 'custom_status', 'golden_frame', 'premium_badges', 'exclusive_frames']
  },
  {
    id: 'royal',
    name: 'Royal',
    nameAr: 'ملكي',
    minLevel: 50,
    minPoints: 25000,
    color: '#FF6B9D',
    icon: '👑',
    badge: 'royal',
    privileges: ['all']
  }
];

// Calculate level from experience
export function calculateLevel(experience: number): number {
  return Math.floor(Math.sqrt(experience / 100)) + 1;
}

// Calculate experience needed for next level
export function getExperienceForNextLevel(level: number): number {
  return Math.pow(level, 2) * 100;
}

// Get rank based on level and points
export function getUserRank(level: number, points: number): UserRank {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (level >= RANKS[i].minLevel && points >= RANKS[i].minPoints) {
      return RANKS[i];
    }
  }
  return RANKS[0];
}

// Calculate points for actions
export const POINTS_REWARDS = {
  MESSAGE_SENT: 10,
  REACTION_RECEIVED: 5,
  REACTION_GIVEN: 2,
  DAILY_LOGIN: 50,
  FIRST_MESSAGE: 100,
  LEVEL_UP: 200
};

// Golden Frames
export const GOLDEN_FRAMES: GoldenFrame[] = [
  {
    id: 'golden-basic',
    name: 'Golden Basic',
    nameAr: 'ذهبي أساسي',
    description: 'Basic golden frame for active members',
    descriptionAr: 'إطار ذهبي أساسي للأعضاء النشطين',
    image: '/frames/golden-basic.png',
    rarity: 'common',
    requiredLevel: 1,
    isPremium: false
  },
  {
    id: 'golden-royal',
    name: 'Royal Gold',
    nameAr: 'ذهبي ملكي',
    description: 'Luxurious royal golden frame',
    descriptionAr: 'إطار ذهبي ملكي فاخر',
    image: '/frames/golden-royal.png',
    rarity: 'rare',
    requiredLevel: 10,
    requiredPoints: 2000,
    isPremium: true
  },
  {
    id: 'diamond-platinum',
    name: 'Diamond Platinum',
    nameAr: 'بلاتيني ماسي',
    description: 'Exclusive diamond platinum frame',
    descriptionAr: 'إطار بلاتيني ماسي حصري',
    image: '/frames/diamond-platinum.png',
    rarity: 'epic',
    requiredLevel: 20,
    requiredPoints: 5000,
    isPremium: true
  },
  {
    id: 'crown-emerald',
    name: 'Crown Emerald',
    nameAr: 'تاج زمردي',
    description: 'Legendary crown emerald frame',
    descriptionAr: 'إطار تاج زمردي أسطوري',
    image: '/frames/crown-emerald.png',
    rarity: 'legendary',
    requiredLevel: 30,
    requiredPoints: 10000,
    isPremium: true
  },
  {
    id: 'mythic-royal',
    name: 'Mythic Royal',
    nameAr: 'ملكي أسطوري',
    description: 'Ultimate mythic royal frame',
    descriptionAr: 'إطار ملكي أسطوري نهائي',
    image: '/frames/mythic-royal.png',
    rarity: 'mythic',
    requiredLevel: 50,
    requiredPoints: 25000,
    isPremium: true
  }
];

// Initialize user points
export function initializeUserPoints(userId: string): UserPoints {
  return {
    userId,
    totalPoints: 0,
    level: 1,
    experience: 0,
    experienceToNextLevel: 100,
    messagesSent: 0,
    reactionsReceived: 0,
    reactionsGiven: 0,
    daysActive: 1,
    lastActiveDate: new Date().toISOString().split('T')[0]
  };
}

// Add points and update level
export function addPoints(
  currentPoints: UserPoints,
  pointsToAdd: number,
  action: keyof typeof POINTS_REWARDS
): UserPoints {
  const newExperience = currentPoints.experience + pointsToAdd;
  const newLevel = calculateLevel(newExperience);
  const experienceToNextLevel = getExperienceForNextLevel(newLevel);
  
  const updated: UserPoints = {
    ...currentPoints,
    totalPoints: currentPoints.totalPoints + pointsToAdd,
    experience: newExperience,
    level: newLevel,
    experienceToNextLevel,
    [action === 'MESSAGE_SENT' ? 'messagesSent' : 
     action === 'REACTION_RECEIVED' ? 'reactionsReceived' :
     action === 'REACTION_GIVEN' ? 'reactionsGiven' : 'messagesSent']: 
     (currentPoints[action === 'MESSAGE_SENT' ? 'messagesSent' : 
      action === 'REACTION_RECEIVED' ? 'reactionsReceived' :
      action === 'REACTION_GIVEN' ? 'reactionsGiven' : 'messagesSent'] as number) + 1
  };

  // Check for daily login bonus
  const today = new Date().toISOString().split('T')[0];
  if (currentPoints.lastActiveDate !== today) {
    updated.daysActive = currentPoints.daysActive + 1;
    updated.lastActiveDate = today;
    if (action === 'DAILY_LOGIN') {
      updated.totalPoints += POINTS_REWARDS.DAILY_LOGIN;
      updated.experience += POINTS_REWARDS.DAILY_LOGIN;
    }
  }

  return updated;
}

// Storage keys
export const STORAGE_KEYS = {
  USER_POINTS: 'royal_chat_user_points',
  USER_RANK: 'royal_chat_user_rank',
  USER_BADGES: 'royal_chat_user_badges',
  USER_FRAMES: 'royal_chat_user_frames',
  ONLINE_USERS: 'royal_chat_online_users'
};

