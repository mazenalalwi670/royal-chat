'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Sidebar } from './components/Sidebar';
import { ConversationsList } from './components/chat/ConversationsList';
import { ChatInterface } from './components/chat/ChatInterface';

const SettingsPage = dynamic(() => import('./settings/SettingsPage').then(mod => ({ default: mod.SettingsPage })), { ssr: false });
const SelectConversationMessage = dynamic(() => import('./components/chat/SelectConversationMessage').then(mod => ({ default: mod.SelectConversationMessage })), { ssr: false });
const ContactsPage = dynamic(() => import('./components/ContactsPage').then(mod => ({ default: mod.ContactsPage })), { ssr: false });
const PremiumChatPage = dynamic(() => import('./components/premium/PremiumChatPage').then(mod => ({ default: mod.PremiumChatPage })), { ssr: false });
import { currentUser as initialUserRaw, mockConversations, mockMessages } from '../data/mockData';
import { 
  Message, 
  User, 
  toMessage, 
  toUser, 
  toOriginalMessage,
  Conversation,
  createMessage,
  toConversation
} from './lib/typeAdapters';
import type { Message as OriginalMessage } from '../data/lib/types/chat';
import { useUser } from './contexts/UserContext';

// Initial data will be converted as needed

function App() {
  const { user: loggedInUser, updateUser: updateLoggedInUser } = useUser();
  // Regular user flow only - Admin is handled separately on /admin route
  const [activeTab, setActiveTab] = useState<'chats' | 'contacts' | 'settings' | 'premium'>('chats');
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>(
    mockConversations.map(conv => toConversation(conv))
  );
  
  const [messages, setMessages] = useState<Message[]>(
    mockMessages.map(msg => {
      // Convert the mock message to our internal format
      const originalMessage = msg as unknown as OriginalMessage;
      return {
        ...originalMessage,
        status: originalMessage.status || 'sent',
        replyTo: originalMessage.replyTo || null,
        reactions: (originalMessage.reactions || []).map(r => ({
          emoji: r.emoji,
          userIds: [r.userId],
          userNames: [r.userName || r.userId]
        })),
        edited: false,
        attachments: []
      };
    })
  );
  
  // Royal Crown Icon - Default avatar helper
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
        <path d="M50 140 L75 60 L100 80 L125 60 L150 140 Z" 
              fill="url(#crownGradient)" 
              stroke="#FFD700" 
              stroke-width="3"
              filter="url(#glow)"/>
        <circle cx="75" cy="60" r="10" fill="#FFD700" filter="url(#glow)"/>
        <circle cx="100" cy="50" r="12" fill="#FFD700" filter="url(#glow)"/>
        <circle cx="125" cy="60" r="10" fill="#FFD700" filter="url(#glow)"/>
        <path d="M45 140 L155 140 L160 150 L40 150 Z" fill="#FFD700" opacity="0.8" filter="url(#glow)"/>
        <text x="100" y="175" font-family="serif" font-size="24" font-weight="bold" 
              fill="#FFD700" text-anchor="middle" filter="url(#glow)">R</text>
      </svg>
    `)}`;
  };

  // Use logged in user if available, otherwise use mock user
  // MANDATORY: Force Royal Crown icon for all users (can be changed in settings)
  const initialUser = loggedInUser ? {
    id: loggedInUser.id,
    name: loggedInUser.name,
    avatar: loggedInUser.avatar && loggedInUser.avatar.includes('data:image/svg+xml') 
      ? loggedInUser.avatar 
      : getRoyalCrownIcon(), // Force Royal Crown if not already set
    status: 'online' as const,
    lastSeen: new Date()
  } : toUser(initialUserRaw);
  
  const [currentUser, setCurrentUser] = useState<User>(initialUser);

  // Sync with logged in user when it changes
  useEffect(() => {
    if (loggedInUser) {
      setCurrentUser(prev => ({
        ...prev,
        name: loggedInUser.name,
        avatar: loggedInUser.avatar
      }));
    }
  }, [loggedInUser?.name, loggedInUser?.avatar]);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640); // sm breakpoint
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const selectedConversation = selectedConversationId ? conversations.find(c => c.id === selectedConversationId) : null;

  const conversationMessages = selectedConversationId ? messages.filter(m => m.conversationId === selectedConversationId) : [];

  const handleSendMessage = (message: string | Omit<Message, 'id' | 'timestamp' | 'status'>) => {
    if (!selectedConversationId) return;
    // Ensure we have a valid message object
    const newMessage = createMessage(
      typeof message === 'string' ? message : message.content,
      {
        conversationId: selectedConversationId,
        senderId: currentUser.id,
        replyTo: typeof message === 'string' ? null : message.replyTo,
        attachments: typeof message === 'string' ? undefined : message.attachments
      }
    );
    
    // Convert to OriginalMessage for WebSocket (if needed)
    // const originalMessage = toOriginalMessage(newMessage);

    setMessages(prev => [...prev, newMessage]);

    setConversations(prev => 
      prev.map(conv => 
        conv.id === selectedConversationId 
          ? { 
              ...conv, 
              lastMessage: newMessage,
              lastMessageTime: newMessage.timestamp
            } 
          : conv
      )
    );
    
    // Send the message via WebSocket
    // socket?.emit('send_message', originalMessage);
  };

  const handleEditMessage = (messageId: string, content: string) => {
    setMessages((prevMessages: Message[]) => 
      prevMessages.map((msg: Message) => 
        msg.id === messageId 
          ? { ...msg, content, edited: true }
          : msg
      )
    );
  };

  const handleDeleteMessage = (messageId: string) => {
    setMessages((prevMessages: Message[]) => prevMessages.filter(msg => msg.id !== messageId));
    
    // Update the last message in conversations if needed
    setConversations((prevConversations: Conversation[]) => 
      prevConversations.map((conv: Conversation) => {
        if (conv.lastMessage?.id === messageId) {
          // Find the most recent message that's not the one being deleted
          const lastMessage = [...messages]
            .filter((msg: Message) => msg.id !== messageId && msg.conversationId === conv.id)
            .sort((a: Message, b: Message) => b.timestamp.getTime() - a.timestamp.getTime())[0];
            
          return {
            ...conv,
            lastMessage,
            lastMessageTime: lastMessage?.timestamp
          } as Conversation;
        }
        return conv;
      })
    );
  };

  const handleReactToMessage = (messageId: string, emoji: string) => {
    setMessages((prevMessages: Message[]) => 
      prevMessages.map((msg: Message) => {
        if (msg.id !== messageId) return msg;
        
        const reactions = [...(msg.reactions || [])];
        const existingReactionIndex = reactions.findIndex(r => r.emoji === emoji);
        
        if (existingReactionIndex >= 0) {
          // Toggle user's reaction
          const reaction = reactions[existingReactionIndex];
          const userIndex = reaction.userIds.indexOf(currentUser.id);
          
          if (userIndex >= 0) {
            // Remove user's reaction
            const newUserIds = [...reaction.userIds];
            const newUserNames = reaction.userNames ? [...reaction.userNames] : [];
            newUserIds.splice(userIndex, 1);
            if (newUserNames.length > userIndex) {
              newUserNames.splice(userIndex, 1);
            }
            
            if (newUserIds.length === 0) {
              // Remove the reaction if no users left
              reactions.splice(existingReactionIndex, 1);
            } else {
              // Update with remaining users
              reactions[existingReactionIndex] = {
                ...reaction,
                userIds: newUserIds,
                userNames: newUserNames.length > 0 ? newUserNames : undefined
              };
            }
          } else {
            // Add user to reaction
            reactions[existingReactionIndex] = {
              ...reaction,
              userIds: [...reaction.userIds, currentUser.id],
              userNames: [...(reaction.userNames || []), currentUser.name]
            };
          }
        } else {
          // Add new reaction
          reactions.push({
            emoji,
            userIds: [currentUser.id],
            userNames: [currentUser.name]
          });
        }
        
        return {
          ...msg,
          reactions
        };
      })
    );
  };

  const handleUpdateUser = (updates: Partial<import('./types/chat').User>) => {
    const updatedUser = { ...currentUser, ...updates } as User;
    setCurrentUser(updatedUser);
    
    // Also update in UserContext if user is logged in
    if (loggedInUser) {
      updateLoggedInUser({
        name: updatedUser.name,
        avatar: updatedUser.avatar
      });
    }
  };

  // Convert messages to the correct type for the ChatInterface
  const chatInterfaceMessages = conversationMessages.map(msg => {
    // Convert to the expected message format for the chat interface
    return {
      ...msg,
      // Ensure status is one of the allowed values
      status: (['sending', 'sent', 'delivered', 'read'].includes(msg.status) 
        ? msg.status 
        : 'sent') as 'sending' | 'sent' | 'delivered' | 'read',
      // Convert reactions to the expected format
      reactions: (msg.reactions || []).map(r => ({
        emoji: r.emoji,
        userId: r.userIds[0] || '',
        userName: (r.userNames && r.userNames[0]) || r.userIds[0] || '' // Use userNames if available
      })),
      // Ensure replyTo is either string or undefined
      replyTo: msg.replyTo || undefined
    };
  });

  // Handle conversation selection - on mobile, this navigates to chat view
  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
  };

  // Handle back navigation on mobile
  const handleBackToConversations = () => {
    setSelectedConversationId(null);
  };

  return (
    <div className="flex h-[100dvh] bg-background overflow-hidden w-full max-w-full touch-pan-y">
      {/* Hide sidebar on mobile when viewing chats */}
      {!(isMobile && activeTab === 'chats') && (
        <Sidebar
          currentUser={{
            ...currentUser,
            status: currentUser.status as 'online' | 'offline' | 'away'
          }}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      )}

      {activeTab === 'chats' && (
        <>
          {/* Conversations List - Show on mobile when no conversation selected, always on desktop */}
          <div className={`w-full sm:w-80 flex-shrink-0 ${isMobile && selectedConversationId ? 'hidden' : 'block'}`}>
            <ConversationsList
              conversations={conversations.map(conv => ({
                id: conv.id,
                name: conv.name || (conv.isGroup ? 'Group' : conv.participants.find(p => p.id !== currentUser.id)?.name || 'Unknown'),
                type: conv.isGroup ? 'group' as const : 'direct' as const,
                participants: conv.participants,
                avatar: conv.avatar,
                lastMessage: conv.lastMessage ? {
                  id: conv.lastMessage.id,
                  content: conv.lastMessage.content,
                  timestamp: conv.lastMessage.timestamp,
                  senderId: conv.lastMessage.senderId
                } : undefined,
                unreadCount: 0,
                pinned: conv.isPinned || false,
                archived: false
              })) as unknown as import('./types/chat').Conversation[]}
              selectedId={selectedConversationId || undefined}
              onSelect={handleSelectConversation}
            />
          </div>

          {/* Chat Interface - Show on mobile when conversation selected, always on desktop if conversation exists */}
          <div className={`flex-1 min-w-0 overflow-hidden ${isMobile && !selectedConversationId ? 'hidden' : 'block'}`}>
            {selectedConversation ? (
              <ChatInterface
                conversation={{
                  ...selectedConversation,
                  lastMessage: selectedConversation.lastMessage 
                    ? {
                        ...selectedConversation.lastMessage,
                        // Convert to the expected message format
                        status: (['sending', 'sent', 'delivered', 'read'].includes(selectedConversation.lastMessage.status)
                          ? selectedConversation.lastMessage.status
                          : 'sent') as 'sending' | 'sent' | 'delivered' | 'read',
                        replyTo: selectedConversation.lastMessage.replyTo || undefined,
                        reactions: (selectedConversation.lastMessage.reactions || []).map(r => ({
                          emoji: r.emoji,
                          userId: r.userIds[0] || '',
                          userName: (r.userNames && r.userNames[0]) || r.userIds[0] || ''
                        }))
                      }
                    : undefined
                }}
                messages={chatInterfaceMessages}
                currentUser={{
                  ...currentUser,
                  status: currentUser.status as 'online' | 'offline' | 'away'
                }}
                onSendMessage={(msg) => {
                  if (typeof msg === 'string') {
                    handleSendMessage(msg);
                  } else {
                    // Convert the message to our internal format
                    const messageInput: Omit<Message, 'id' | 'timestamp' | 'status'> = {
                      content: msg.content,
                      conversationId: selectedConversationId!,
                      senderId: currentUser.id,
                      replyTo: msg.replyTo || null,
                      reactions: (msg.reactions || []).map(r => ({
                        emoji: r.emoji,
                        userIds: [r.userId],
                        userNames: r.userName ? [r.userName] : []
                      })),
                      attachments: []
                    };
                    handleSendMessage(messageInput);
                  }
                }}
                onEditMessage={handleEditMessage}
                onDeleteMessage={handleDeleteMessage}
                onReactToMessage={handleReactToMessage}
                onBack={isMobile ? handleBackToConversations : undefined}
              />
            ) : (
              <SelectConversationMessage />
            )}
          </div>
        </>
      )}

      {activeTab === 'contacts' && (
        <ContactsPage />
      )}

      {activeTab === 'premium' && (
        <PremiumChatPage
          currentUser={{
            ...currentUser,
            status: currentUser.status as 'online' | 'offline' | 'away'
          }}
        />
      )}

      {activeTab === 'settings' && (
        <SettingsPage currentUser={currentUser} onUpdateUser={handleUpdateUser} />
      )}
    </div>
  );
}

export default App;
