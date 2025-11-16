export interface User {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline' | 'away';
  bio?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: Date;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  replyTo?: string;
  reactions: Reaction[];
  edited?: boolean;
  attachments?: Attachment[];
}

export interface Reaction {
  emoji: string;
  userId: string;
  userName: string;
}

export interface Attachment {
  id: string;
  type: 'image' | 'file' | 'voice' | 'audio' | 'video' | 'location';
  url: string;
  name: string;
  size?: number;
  data?: {
    latitude?: number;
    longitude?: number;
    duration?: number;
    [key: string]: unknown;
  };
}

export interface Conversation {
  id: string;
  type: 'direct' | 'group';
  name?: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  pinned: boolean;
  archived: boolean;
  avatar?: string;
}
