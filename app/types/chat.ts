export interface User {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline' | 'away' | 'busy' | 'invisible';
  lastSeen?: Date;
  // Gamification fields
  points?: number;
  level?: number;
  userRank?: {
    id: string;
    name: string;
    nameAr: string;
    color: string;
    icon: string;
  };
  badges?: Array<{
    id: string;
    name: string;
    icon: string;
    rarity: string;
  }>;
  goldenFrame?: {
    id: string;
    name: string;
    image: string;
    rarity: string;
  };
  isTyping?: boolean;
  isSpeaking?: boolean;
  // Premium fields
  isPremiumSubscriber?: boolean;
  rank?: number;
  customNameStyle?: any;
  selectedFrame?: any;
  statusMessage?: string;
  backgroundImage?: string;
  backgroundGradient?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read' | 'failed' | 'sending';
  replyTo?: string;
  reactions?: {
    emoji: string;
    userIds: string[];
    userNames?: string[];
  }[];
  attachments?: Attachment[];
  edited?: boolean;
}

export interface Attachment {
  id: string;
  type: 'image' | 'file' | 'audio' | 'video' | 'voice' | 'location';
  url: string;
  name?: string;
  size?: number;
  mimeType?: string;
  data?: {
    latitude?: number;
    longitude?: number;
    duration?: number;
    [key: string]: unknown;
  };
}

export interface Conversation {
  id: string;
  name: string;
  avatar?: string;
  participants: string[];
  isGroup: boolean;
  lastMessage?: {
    id: string;
    content: string;
    timestamp: Date;
    senderId: string;
  };
  unreadCount: number;
  isPinned: boolean;
  isMuted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MessageReaction {
  messageId: string;
  emoji: string;
  userId: string;
  timestamp: Date;
}
