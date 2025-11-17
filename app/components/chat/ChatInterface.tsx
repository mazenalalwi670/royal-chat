'use client';

import { useState, useRef, useEffect } from 'react';
import { Card } from '../../ui/card';
import { ScrollArea } from '../../ui/scroll-area';
import { Message as MessageType, User, Conversation, Message } from '../../../data/lib/types/chat';
import { Message as AppMessage, User as AppUser, Conversation as AppConversation, toUser } from '../../lib/typeAdapters';
import type { Message as MessageFromTypes, User as UserFromTypes, Conversation as ConversationFromTypes } from '../../types/chat';
import { MessageBubble } from './MessageBubble';
import { useWebSocket } from '../../contexts/WebSocketContext';
import { ChatHeader } from './ChatHeader';
import { MessageInput } from '../../MessageInput';
import { useLanguage } from '../../contexts/LanguageContext';

interface ChatInterfaceProps {
  conversation: AppConversation | Conversation;
  messages: AppMessage[] | Message[];
  currentUser: AppUser | User;
  onSendMessage: (message: MessageType) => void;
  onEditMessage: (messageId: string, content: string) => void;
  onDeleteMessage: (messageId: string) => void;
  onReactToMessage: (messageId: string, emoji: string) => void;
}

export function ChatInterface({
  conversation,
  messages,
  currentUser,
  onSendMessage: handleSendMessage,
  onEditMessage,
  onDeleteMessage,
  onReactToMessage,
}: ChatInterfaceProps) {
  const { socket } = useWebSocket();
  const { dir } = useLanguage();

  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (message: MessageType | { timestamp: string | Date }) => {
      // Convert timestamp to Date object if it's a string (from WebSocket)
      const processedMessage: MessageType = {
        ...message as MessageType,
        timestamp: typeof message.timestamp === 'string' 
          ? new Date(message.timestamp) 
          : message.timestamp instanceof Date 
            ? message.timestamp 
            : new Date()
      };
      
      // Update message status from 'sending' to 'sent' if it's our message
      // Or add new message if it's from another user
      handleSendMessage(processedMessage);
    };

    const handleMessageReaction = (data: { messageId: string; emoji: string; userId: string; userName: string; action: 'add' | 'remove' }) => {
      // Update message reactions via parent handler
      onReactToMessage(data.messageId, data.emoji);
    };

    // Join the current conversation room with user info
    socket.emit('join_conversation', {
      conversationId: conversation.id,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: (currentUser as { avatar?: string }).avatar
    });

    // Listen for conversation history (when joining, receive all previous messages)
    const handleConversationHistory = (data: {
      conversationId: string;
      messages: Array<{
        id: string;
        conversationId: string;
        senderId: string;
        senderName?: string;
        senderAvatar?: string;
        content: string;
        timestamp: Date | string;
        status: 'sending' | 'sent' | 'delivered' | 'read';
        replyTo?: string | null;
        reactions?: Array<{ emoji: string; userIds: string[]; userNames?: string[] }>;
        edited?: boolean;
        attachments?: Array<{
          id: string;
          type: string;
          url: string;
          name?: string;
          size?: number;
          data?: {
            latitude?: number;
            longitude?: number;
            duration?: number;
            [key: string]: unknown;
          };
        }>;
      }>;
    }) => {
      if (data.conversationId === conversation.id) {
        console.log(`📨 Received ${data.messages.length} messages from conversation history`);
        // Load conversation history messages
        const historyMessages: MessageType[] = data.messages.map(msg => {
          // Convert reactions from server format to MessageType format
          const reactions: Array<{ emoji: string; userId: string; userName: string }> = [];
          if (msg.reactions) {
            msg.reactions.forEach(r => {
              const userIds = r.userIds || [];
              const userNames = r.userNames || [];
              userIds.forEach((userId, index) => {
                reactions.push({
                  emoji: r.emoji,
                  userId,
                  userName: userNames[index] || userId
                });
              });
            });
          }
          
          return {
            id: msg.id,
            conversationId: msg.conversationId,
            senderId: msg.senderId,
            content: msg.content,
            // Convert timestamp to Date object - ensure it's the actual timestamp
            timestamp: typeof msg.timestamp === 'string' 
              ? new Date(msg.timestamp) 
              : msg.timestamp instanceof Date 
                ? msg.timestamp 
                : new Date(msg.timestamp || Date.now()),
            status: msg.status as 'sending' | 'sent' | 'delivered' | 'read',
            replyTo: msg.replyTo || undefined,
            reactions,
            edited: msg.edited || false,
            attachments: (msg.attachments || []).map(att => ({
              id: att.id,
              type: att.type as 'image' | 'file' | 'audio' | 'video' | 'voice' | 'location',
              url: att.url,
              name: att.name || '',
              size: att.size,
              data: att.data
            }))
          } as MessageType;
        });
        
        // Only add if we don't have messages yet or if history is more recent
        historyMessages.forEach(msg => {
          handleSendMessage(msg);
        });
      }
    };

    // Listen for new messages
    socket.on('receive_message', handleReceiveMessage);
    socket.on('conversation_history', handleConversationHistory); // Receive conversation history (real-time sync)
    
    // Listen for message reactions
    socket.on('message_reaction', handleMessageReaction);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('conversation_history', handleConversationHistory);
      socket.off('message_reaction', handleMessageReaction);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, conversation.id]);

  interface AttachmentData {
    type: 'image' | 'file' | 'voice' | 'location';
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

  const sendMessage = (content: string, replyToId?: string, attachments?: AttachmentData[]) => {
    if (!socket) return;
    
    // Format attachments for message
    const messageContent = attachments && attachments.length > 0 
      ? (content || (attachments[0].type === 'location' ? (dir === 'rtl' ? '📍 موقعي' : '📍 My Location') : attachments[0].name))
      : content;
    
    const newMessage: MessageType = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      conversationId: conversation.id,
      senderId: currentUser.id,
      content: messageContent,
      timestamp: new Date(),
      status: 'sending', // Show as sending first
      replyTo: replyToId,
      reactions: [],
      attachments: attachments?.map(att => ({
        id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: att.type as 'image' | 'file' | 'audio' | 'video' | 'voice' | 'location',
        url: att.url,
        name: att.name,
        size: att.size,
        data: att.data
      }))
    } as MessageType;

    // Update local state immediately (optimistic update)
    handleSendMessage(newMessage);

    // Send the message via WebSocket with sender info
    const userWithAvatar = currentUser as { id: string; name: string; avatar?: string };
    socket.emit('send_message', {
      ...newMessage,
      senderName: currentUser.name,
      senderAvatar: userWithAvatar.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.id}`,
      attachments: attachments
    });
  };

  const [replyingTo, setReplyingTo] = useState<MessageFromTypes | undefined>();
  const [editingMessage, setEditingMessage] = useState<MessageFromTypes | undefined>();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (content: string, attachments?: AttachmentData[]) => {
    if (editingMessage) {
      onEditMessage(editingMessage.id, content);
      setEditingMessage(undefined);
    } else {
      sendMessage(content, replyingTo?.id, attachments);
      setReplyingTo(undefined);
    }
  };

  const handleEdit = (message: MessageFromTypes) => {
    setEditingMessage(message);
    setReplyingTo(undefined);
  };

  const handleReply = (message: MessageFromTypes) => {
    setReplyingTo(message);
    setEditingMessage(undefined);
    // Focus the input after setting reply
    setTimeout(() => {
      const input = document.querySelector('input[placeholder*="رسالة"]') as HTMLInputElement;
      input?.focus();
    }, 100);
  };

  const handleReact = (messageId: string, emoji: string) => {
    if (!socket) return;
    
    // Send reaction via WebSocket
    socket.emit('react_to_message', {
      messageId,
      emoji,
      userId: currentUser.id,
      userName: currentUser.name,
      conversationId: conversation.id
    });
    
    // Update local state immediately
    onReactToMessage(messageId, emoji);
  };

  // Convert conversation to the expected type
  // Type guard to handle both Conversation types
  type ConversationInput = AppConversation | Conversation;
  interface ConversationWithAllFields {
    id: string;
    name?: string;
    avatar?: string;
    participants?: unknown[];
    isGroup?: boolean;
    lastMessage?: unknown;
    unreadCount?: number;
    isPinned?: boolean;
    pinned?: boolean;
    isMuted?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }
  const conv = conversation as ConversationInput & ConversationWithAllFields;
  const appConversation: ConversationFromTypes = {
    id: conv.id || '',
    name: conv.name || '',
    avatar: conv.avatar,
    participants: Array.isArray(conv.participants) 
      ? conv.participants.map((p: unknown) => {
          if (typeof p === 'string') return p;
          if (typeof p === 'object' && p !== null && 'id' in p) {
            return (p as { id?: string }).id || '';
          }
          return '';
        }).filter((id): id is string => typeof id === 'string' && id !== '')
      : [],
    isGroup: conv.isGroup || false,
    lastMessage: conv.lastMessage ? {
      id: conv.lastMessage.id || '',
      content: conv.lastMessage.content || '',
      timestamp: conv.lastMessage.timestamp || new Date(),
      senderId: conv.lastMessage.senderId || ''
    } : undefined,
    unreadCount: conv.unreadCount || 0,
    isPinned: conv.isPinned || conv.pinned || false,
    isMuted: conv.isMuted || false,
    createdAt: conv.createdAt || new Date(),
    updatedAt: conv.updatedAt || new Date()
  };

  // Convert current user to the expected type
  const appUser: UserFromTypes = {
    id: currentUser.id,
    name: currentUser.name,
    avatar: currentUser.avatar,
    status: currentUser.status as 'online' | 'offline' | 'away' | 'busy' | 'invisible'
  };

  // Convert messages to the expected type
  const appMessages: MessageFromTypes[] = messages.map(msg => {
    interface MessageInput {
      id?: string;
      conversationId?: string;
      senderId?: string;
      content?: string;
      timestamp?: Date;
      status?: string;
      replyTo?: string;
      reactions?: Array<{ emoji?: string; userId?: string; userIds?: string[]; userName?: string; userNames?: string[] }>;
      attachments?: Array<{ id?: string; type?: string; url?: string; name?: string; size?: number; mimeType?: string }>;
      edited?: boolean;
    }
    const msgAny = msg as MessageInput;
    return {
      id: msgAny.id || '',
      conversationId: msgAny.conversationId || '',
      senderId: msgAny.senderId || '',
      content: msgAny.content || '',
      timestamp: msgAny.timestamp || new Date(),
      status: (msgAny.status === 'failed' ? 'sent' : (msgAny.status || 'sent')) as 'sent' | 'delivered' | 'read' | 'sending',
      replyTo: msgAny.replyTo || undefined,
      reactions: msgAny.reactions ? msgAny.reactions.map((r) => ({
        emoji: r.emoji || '',
        userIds: r.userIds || (r.userId ? [r.userId] : []),
        userNames: r.userNames || (r.userName ? [r.userName] : [])
      })) : [],
      attachments: msgAny.attachments ? msgAny.attachments.map((a) => ({
        id: a.id || '',
        type: (a.type === 'voice' ? 'audio' : a.type) as 'image' | 'file' | 'audio' | 'video',
        url: a.url || '',
        name: a.name,
        size: a.size,
        mimeType: a.mimeType
      })) : undefined,
      edited: msgAny.edited || false
    } as MessageFromTypes;
  });

  return (
    <Card className="flex flex-col h-full w-full min-w-0 rounded-none border-0 overflow-hidden" dir={dir}>
      <ChatHeader conversation={appConversation} currentUser={appUser} />

      <ScrollArea 
        className="flex-1 p-2 sm:p-4 min-h-0 overflow-y-auto touch-manipulation" 
        style={{ 
          maxHeight: 'calc(100vh - 200px)',
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-y pinch-zoom'
        }}
      >
        <div className="space-y-3 sm:space-y-4 pb-2 sm:pb-4 min-w-0">
          {appMessages.map((message) => {
            interface ConversationInput {
              participants?: Array<string | User | { id?: string }>;
            }
            const convInput = conversation as ConversationInput;
            const senderParticipants = Array.isArray(convInput.participants) 
              ? convInput.participants 
              : [];
            const sender = senderParticipants.find((p: string | User | { id?: string }) => {
              const id = typeof p === 'string' ? p : p.id;
              return id === message.senderId;
            }) || appUser;
            const isCurrentUser = message.senderId === appUser.id;
            const replyToMessage = message.replyTo ? appMessages.find(m => m.id === message.replyTo) : undefined;

            return (
              <MessageBubble
                key={message.id}
                message={message}
                sender={typeof sender === 'string' ? appUser : sender as UserFromTypes}
                isCurrentUser={isCurrentUser}
                onReply={handleReply}
                onEdit={handleEdit}
                onDelete={onDeleteMessage}
                onReact={handleReact}
                replyToMessage={replyToMessage}
                currentUserId={appUser.id}
                conversation={{ participants: senderParticipants.map((p: string | User | { id?: string }) => typeof p === 'string' ? appUser : toUser(p as User)) }}
              />
            );
          })}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <MessageInput
        onSend={handleSend}
        replyingTo={replyingTo}
        onCancelReply={() => setReplyingTo(undefined)}
        editingMessage={editingMessage}
        onCancelEdit={() => setEditingMessage(undefined)}
      />
    </Card>
  );
}
