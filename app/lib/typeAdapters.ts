import type { 
  Message as OriginalMessage, 
  User as OriginalUser, 
  Reaction as OriginalReaction,
  Conversation as OriginalConversation
} from '../../data/lib/types/chat';

// We'll use the original status types to ensure compatibility
export type MessageStatus = OriginalMessage['status'];
export type UserStatus = OriginalUser['status'];

// Helper type to convert between our enhanced types and original types
type ReactionInput = {
  emoji: string;
  userIds: string[];
  userNames?: string[];
};

type OriginalReactionInput = {
  emoji: string;
  userId: string;
  userName: string;
};

// Our enhanced types
// Base message type that matches the original but makes some fields required
interface BaseMessage extends Omit<OriginalMessage, 'reactions' | 'status' | 'replyTo'> {
  status: MessageStatus;
  replyTo: string | null;
  reactions: ReactionInput[];
}

// Our enhanced message type with additional fields
export interface Message extends BaseMessage {
  edited?: boolean;
  attachments?: Array<{
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
  }>;
}

export interface User extends Omit<OriginalUser, 'status'> {
  status: UserStatus;
  lastSeen?: Date;
}

export interface Conversation extends Omit<OriginalConversation, 'participants' | 'lastMessage'> {
  participants: User[];
  lastMessage?: Message;
  lastMessageTime?: Date;
  isGroup?: boolean;
  isPinned?: boolean;
  isMuted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Type guards
export function isOriginalMessage(message: any): message is OriginalMessage {
  return message && typeof message === 'object' && 'id' in message && 'conversationId' in message;
}

export function isOriginalUser(user: any): user is OriginalUser {
  return user && typeof user === 'object' && 'id' in user && 'name' in user;
}

// Conversion functions
export function toMessage(message: OriginalMessage | Message): Message {
  // If it's already our enhanced Message type, return as is
  if ('reactions' in message && Array.isArray(message.reactions) && message.reactions.length > 0 && 'userIds' in message.reactions[0]) {
    return message as Message;
  }

  // Otherwise, convert from OriginalMessage to our Message type
  const originalMessage = message as OriginalMessage;
  return {
    ...originalMessage,
    replyTo: originalMessage.replyTo || null,
    reactions: (originalMessage.reactions || []).map(r => ({
      emoji: r.emoji,
      userIds: [r.userId],
      userNames: [r.userName || r.userId]
    })),
    status: originalMessage.status,
    edited: false,
    attachments: []
  };
}

// Single implementation of toOriginalMessage
export function toOriginalMessage(message: Message): OriginalMessage {
  const { reactions, replyTo, status, ...rest } = message;
  
  return {
    ...rest,
    replyTo: replyTo || undefined,
    reactions: reactions.map(r => ({
      emoji: r.emoji,
      userId: r.userIds[0] || '',
      userName: '' // This would need to be populated from a users map
    })),
    status: status as OriginalMessage['status']
  };
}

export function toUser(user: OriginalUser | User): User {
  if ('lastSeen' in user) {
    return user as User;
  }

  const originalUser = user as OriginalUser;
  return {
    ...originalUser,
    status: originalUser.status as UserStatus,
    lastSeen: new Date()
  };
}

export function toOriginalUser(user: User): OriginalUser {
  return {
    ...user,
    status: user.status as OriginalUser['status']
  };
}

export function toConversation(conversation: OriginalConversation | Conversation): Conversation {
  // If it's already our enhanced Conversation type, return as is
  if ('isGroup' in conversation || 'participants' in conversation && conversation.participants.length > 0 && 'lastSeen' in conversation.participants[0]) {
    return conversation as Conversation;
  }

  const originalConversation = conversation as OriginalConversation;
  return {
    ...originalConversation,
    participants: originalConversation.participants.map(toUser),
    lastMessage: originalConversation.lastMessage ? toMessage(originalConversation.lastMessage as unknown as OriginalMessage) : undefined,
    lastMessageTime: originalConversation.lastMessage?.timestamp,
    isGroup: originalConversation.type === 'group',
    isPinned: originalConversation.pinned || false,
    isMuted: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

// Helper function to create a new message
export function createMessage(content: string, options: {
  conversationId: string;
  senderId: string;
  replyTo?: string | null;
  reactions?: Array<{ emoji: string; userIds: string[] }>;
  attachments?: Array<{
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
  }>;
}): Message {
  return {
    id: `msg-${Date.now()}`,
    content,
    conversationId: options.conversationId,
    senderId: options.senderId,
    timestamp: new Date(),
    status: 'sent' as const,
    replyTo: options.replyTo || null,
    reactions: options.reactions || [],
    attachments: options.attachments || []
  };
}

// Helper function to convert message for sending
export function toMessageInput(
  message: string | Omit<Message, 'id' | 'timestamp' | 'status'>
): Omit<OriginalMessage, 'id' | 'timestamp' | 'status'> {
  if (typeof message === 'string') {
    return {
      content: message,
      conversationId: '', // This should be set by the caller
      senderId: '', // This should be set by the caller
      replyTo: undefined,
      reactions: []
    };
  }
  
  const { id, timestamp, status, edited, attachments, ...rest } = message as Message & { 
    id?: string; 
    timestamp?: Date; 
    status?: string 
  };
  
  return {
    ...rest,
    replyTo: rest.replyTo || undefined,
    reactions: (rest.reactions || []).map(r => ({
      emoji: r.emoji,
      userId: r.userIds[0] || '',
      userName: ''
    }))
  };
}
