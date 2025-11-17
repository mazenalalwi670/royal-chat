'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from '@/ui/card';
import { ScrollArea } from '@/ui/scroll-area';
import { MessageBubble } from '../chat/MessageBubble';
import { MessageInput } from '../../MessageInput';
import { Message, User } from '@/types/chat';
import { Subscription } from '@/types/subscription';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/contexts/UserContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/ui/avatar';
import { Badge } from '@/ui/badge';
import { Button } from '@/ui/button';
import { Crown, UsersRound, Shield, Mic, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { VoiceChatBar } from './VoiceChatBar';
import { WelcomeBanner } from './WelcomeBanner';
import { PremiumChatSettings } from './PremiumChatSettings';
import { PremiumAdvertisementBanner } from './PremiumAdvertisementBanner';
import { PremiumUserFrame } from './PremiumUserFrame';
import { SubscriptionOffersBanner } from './SubscriptionOffersBanner';
import { RoyalFramesShowcase } from '../frames/RoyalFramesShowcase';
import { RoyalNameBar } from '../names/RoyalNameBar';
import { FrameConfig } from '../frames/AnimatedFrames';
import { NameEffectConfig } from '../names/AnimatedName';
import { PremiumMembersList } from './PremiumMembersList';
import { mazenAlalwiPortrait } from '../../../data/mazenPortrait';

interface PremiumChatInterfaceProps {
  currentUser: User;
  subscription: Subscription;
}

const PREMIUM_CHAT_ID = 'premium-group-chat';

export function PremiumChatInterface({ currentUser, subscription }: PremiumChatInterfaceProps) {
  const { socket, isConnected } = useWebSocket();
  const { dir } = useLanguage();
  const { user: loggedInUser } = useUser();
  const { isAdmin, user: adminUser, toggleInvisibility } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [replyingTo, setReplyingTo] = useState<Message | undefined>();
  const [editingMessage, setEditingMessage] = useState<Message | undefined>();
  const [isVoiceChatActive, setIsVoiceChatActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [speakingUsers, setSpeakingUsers] = useState<string[]>([]);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const [audioElements, setAudioElements] = useState<Map<string, HTMLAudioElement>>(new Map());
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(true);
  const [hasShownWelcome, setHasShownWelcome] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const isRecordingRef = useRef(false);
  const [advertisements, setAdvertisements] = useState<any[]>([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [dismissedAds, setDismissedAds] = useState<Set<string>>(new Set());
  const [userNameStyles, setUserNameStyles] = useState<Map<string, any>>(new Map());
  const [showSubscriptionOffers, setShowSubscriptionOffers] = useState(false);
  const [selectedFrame, setSelectedFrame] = useState<FrameConfig | null>(null);
  const [showMembersList, setShowMembersList] = useState(false);
  const [chatBackground, setChatBackground] = useState<{ type: 'color' | 'image'; value: string }>(() => {
    if (typeof window !== 'undefined') {
      // Clear any old image backgrounds to use Royal default
      // User can set custom background from settings if they want
      const bgColor = localStorage.getItem('premium_chat_background');
      
      // Only use saved color background if explicitly set and not empty
      // Otherwise, use empty (which means Royal branding background)
      if (bgColor && bgColor !== '' && bgColor !== 'royal-black-gold') {
        return { type: 'color', value: bgColor };
      }
      
      // Default: empty means use Royal branding background
      // Clear any saved image to ensure Royal background shows
      if (localStorage.getItem('premium_chat_background_image')) {
        localStorage.removeItem('premium_chat_background_image');
        localStorage.removeItem('premium_chat_background_type');
      }
      return { type: 'color', value: '' };
    }
    // Default: empty means use Royal branding background
    return { type: 'color', value: '' };
  });
  
  // Check if current user is admin
  const isCurrentUserAdmin = isAdmin && adminUser?.id === currentUser.id;
  const isInvisible = isCurrentUserAdmin && adminUser?.isInvisible;

  // Use logged in user's avatar if available
  const displayUser = loggedInUser ? {
    ...currentUser,
    avatar: loggedInUser.avatar,
    name: loggedInUser.name
  } : currentUser;

  // Listen for background changes
  useEffect(() => {
    const handleBackgroundChange = (e: CustomEvent) => {
      setChatBackground({ type: e.detail.type, value: e.detail.value });
    };
    
    window.addEventListener('premium-background-changed', handleBackgroundChange as EventListener);
    return () => {
      window.removeEventListener('premium-background-changed', handleBackgroundChange as EventListener);
    };
  }, []);

  // Load advertisements
  useEffect(() => {
    const loadAdvertisements = () => {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('premium_advertisements');
        if (saved) {
          try {
            const ads = JSON.parse(saved);
            const activeAds = ads.filter((ad: any) => {
              if (!ad.isActive) return false;
              if (ad.expiresAt && new Date(ad.expiresAt) < new Date()) return false;
              return true;
            });
            setAdvertisements(activeAds);
            // Load dismissed ads
            const dismissed = localStorage.getItem('premium_dismissed_ads');
            if (dismissed) {
              setDismissedAds(new Set(JSON.parse(dismissed)));
            }
          } catch (error) {
            console.error('Error loading advertisements:', error);
          }
        }
      }
    };

    loadAdvertisements();

    // Listen for advertisement updates
    const handleAdUpdate = () => {
      loadAdvertisements();
    };
    window.addEventListener('advertisements-updated', handleAdUpdate);
    return () => {
      window.removeEventListener('advertisements-updated', handleAdUpdate);
    };
  }, []);

  // Listen for members updates
  useEffect(() => {
    const handleMembersUpdate = () => {
      if (typeof window !== 'undefined') {
        const savedMembers = localStorage.getItem('premium_members');
        if (savedMembers) {
          try {
            const adminMembers = JSON.parse(savedMembers);
            const activeAdminMembers = adminMembers
              .filter((m: any) => m.isActive)
              .map((m: any) => ({
                id: m.id,
                name: m.name,
                avatar: m.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.name}`,
                status: 'online' as const,
                isPremiumSubscriber: true,
                rank: m.rank || 999,
                customNameStyle: m.customNameStyle,
                selectedFrame: m.selectedFrame,
                statusMessage: m.statusMessage,
                backgroundImage: m.backgroundImage,
                backgroundGradient: m.backgroundGradient
              }));
            setMembers(prev => {
              const currentUserMember = prev.find(m => m.id === displayUser.id);
              return currentUserMember 
                ? [currentUserMember, ...activeAdminMembers.filter((m: any) => m.id !== displayUser.id)]
                : [...prev, ...activeAdminMembers];
            });
          } catch (error) {
            console.error('Error updating members:', error);
          }
        }
      }
    };

    window.addEventListener('premium-members-updated', handleMembersUpdate);
    return () => {
      window.removeEventListener('premium-members-updated', handleMembersUpdate);
    };
  }, [displayUser.id]);

  // Load user name styles
  useEffect(() => {
    const loadUserNameStyles = () => {
      if (typeof window !== 'undefined' && loggedInUser) {
        const saved = localStorage.getItem(`premium_name_style_${loggedInUser.id}`);
        if (saved) {
          try {
            const style = JSON.parse(saved);
            setUserNameStyles(prev => new Map(prev).set(loggedInUser.id, style));
            // Update members list with saved name style
            setMembers(prev => prev.map(member => 
              member.id === loggedInUser.id 
                ? { ...member, customNameStyle: style } as User & { customNameStyle?: any }
                : member
            ));
          } catch (error) {
            console.error('Error loading name style:', error);
          }
        }
      }
    };

    loadUserNameStyles();

    const handleNameStyleUpdate = (e: CustomEvent) => {
      if (e.detail.userId) {
        setUserNameStyles(prev => new Map(prev).set(e.detail.userId, e.detail.style));
        // Update members list when name style is updated
        setMembers(prev => prev.map(member => 
          member.id === e.detail.userId 
            ? { ...member, customNameStyle: e.detail.style } as User & { customNameStyle?: any }
            : member
        ));
      }
    };

    const handleFrameUpdate = (e: CustomEvent) => {
      if (e.detail.userId && e.detail.frameConfig) {
        // Update members list when frame is updated
        setMembers(prev => prev.map(member => 
          member.id === e.detail.userId 
            ? { ...member, selectedFrame: e.detail.frameConfig, frameConfig: e.detail.frameConfig } as User & { selectedFrame?: any; frameConfig?: any }
            : member
        ));
      }
    };

    window.addEventListener('premium-name-style-updated', handleNameStyleUpdate as EventListener);
    window.addEventListener('premium-frame-updated', handleFrameUpdate as EventListener);
    return () => {
      window.removeEventListener('premium-name-style-updated', handleNameStyleUpdate as EventListener);
      window.removeEventListener('premium-frame-updated', handleFrameUpdate as EventListener);
    };
  }, [loggedInUser?.id]);

  const handleDismissAd = (adId: string) => {
    const newDismissed = new Set(dismissedAds);
    newDismissed.add(adId);
    setDismissedAds(newDismissed);
    if (typeof window !== 'undefined') {
      localStorage.setItem('premium_dismissed_ads', JSON.stringify(Array.from(newDismissed)));
    }
    // Move to next ad
    if (currentAdIndex < advertisements.length - 1) {
      setCurrentAdIndex(currentAdIndex + 1);
    } else {
      setCurrentAdIndex(0);
    }
  };

  const handleAdAction = (ad: any) => {
    if (ad.link) {
      window.open(ad.link, '_blank');
    }
  };

  // Get current active advertisement
  const currentAd = advertisements.length > 0 
    ? advertisements.find((ad, index) => {
        const actualIndex = (currentAdIndex + index) % advertisements.length;
        return !dismissedAds.has(advertisements[actualIndex]?.id);
      }) || advertisements[currentAdIndex]
    : null;

  useEffect(() => {
    if (!socket) return;

    // Join premium chat room with complete user info (real-time)
    const userStyle = userNameStyles.get(displayUser.id);
    const savedFrame = typeof window !== 'undefined' && loggedInUser
      ? localStorage.getItem(`premium_frame_${loggedInUser.id}`)
      : null;
    const userFrame = savedFrame ? JSON.parse(savedFrame) : null;
    const savedNameStyle = typeof window !== 'undefined' && loggedInUser
      ? localStorage.getItem(`premium_name_style_${loggedInUser.id}`)
      : null;
    const nameEffect = savedNameStyle ? JSON.parse(savedNameStyle) : null;
    
    socket.emit('join_conversation', {
      conversationId: PREMIUM_CHAT_ID,
      userId: displayUser.id,
      userName: displayUser.name,
      userAvatar: displayUser.avatar,
      userFrame: userFrame || null,
      userNameEffect: nameEffect?.nameEffect || null,
      userStatus: isCurrentUserAdmin && isInvisible ? 'invisible' : 'online',
      isPremiumSubscriber: true
    });

    // Show welcome banner on first load - Every time user joins premium chat
    // Force show welcome banner for every user joining (luxurious experience)
    setShowWelcomeBanner(true);
    setHasShownWelcome(true);

    // Load initial messages (will be replaced by real messages from server)
    const initialMessages: Message[] = [];
    setMessages(initialMessages);

    // Load members (in real app, this would be from API)
    // Don't add admin to members list if admin is invisible
    // All users in premium chat are premium subscribers
    const initialMembers: User[] = [];
    if (!isCurrentUserAdmin || !isInvisible) {
      const userStyle = userNameStyles.get(displayUser.id);
      const savedFrame = typeof window !== 'undefined' && loggedInUser
        ? localStorage.getItem(`premium_frame_${loggedInUser.id}`)
        : null;
      const userFrame = savedFrame ? JSON.parse(savedFrame) : null;
      
      initialMembers.push({
        id: displayUser.id,
        name: displayUser.name,
        avatar: displayUser.avatar,
        status: isCurrentUserAdmin && isInvisible ? 'invisible' : 'online',
        isPremiumSubscriber: true, // Mark as premium subscriber
        rank: 1, // Default rank, can be calculated based on activity
        customNameStyle: userStyle || undefined,
        selectedFrame: userFrame || undefined,
        frameConfig: userFrame || undefined // Also set frameConfig for consistency
      } as User & { isPremiumSubscriber?: boolean; rank?: number; customNameStyle?: any; selectedFrame?: any; frameConfig?: any });
    }
    
    // Load saved members from admin, and add default owner (Mazen Alalwi)
    if (typeof window !== 'undefined') {
      // Default owner: Mazen Alalwi (project owner)
      // Use the actual portrait image from mockData.ts
      const defaultOwner: User & { isPremiumSubscriber?: boolean; rank?: number; customNameStyle?: any; selectedFrame?: any; frameConfig?: any } = {
        id: 'owner-mazen-alalwi',
        name: 'Mazen Alalwi',
        avatar: mazenAlalwiPortrait, // Actual portrait image from mockData.ts
        status: 'online' as const,
        isPremiumSubscriber: true,
        rank: 0, // Owner rank (highest)
        customNameStyle: undefined,
        selectedFrame: undefined,
        frameConfig: undefined
      };

      const savedMembers = localStorage.getItem('premium_members');
      if (savedMembers) {
        try {
          const adminMembers = JSON.parse(savedMembers);
          const activeAdminMembers = adminMembers
            .filter((m: any) => m.isActive)
            .map((m: any) => ({
              id: m.id,
              name: m.name,
              avatar: m.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.name}`,
              status: 'online' as const,
              isPremiumSubscriber: true,
              rank: m.rank || 999,
              customNameStyle: m.customNameStyle,
              selectedFrame: m.selectedFrame,
              statusMessage: m.statusMessage,
              backgroundImage: m.backgroundImage,
              backgroundGradient: m.backgroundGradient
            }));
          // Add default owner first, then admin members, then initial members
          setMembers([defaultOwner, ...initialMembers, ...activeAdminMembers]);
        } catch (error) {
          console.error('Error loading admin members:', error);
          setMembers([defaultOwner, ...initialMembers]);
        }
      } else {
        // Add default owner
        setMembers([defaultOwner, ...initialMembers]);
      }
    } else {
      // On server side, just add initial members
      setMembers(initialMembers);
    }

    // Listen for new messages - Real-time message receiving
    const handleReceiveMessage = (message: Message | { timestamp: string | Date }) => {
      console.log('Received message:', message);
      
      // Convert timestamp to Date object if it's a string (from WebSocket)
      const processedMessage: Message = {
        ...message as Message,
        timestamp: typeof message.timestamp === 'string' 
          ? new Date(message.timestamp) 
          : message.timestamp instanceof Date 
            ? message.timestamp 
            : new Date(),
        status: 'sent' as const
      };
      
      // Don't add duplicate messages
      setMessages(prev => {
        const existingIndex = prev.findIndex(m => m.id === processedMessage.id);
        if (existingIndex >= 0) {
          // Update existing message (in case of status change)
          const updated = [...prev];
          updated[existingIndex] = processedMessage;
          return updated;
        }
        // Add new message with 'sent' status
        return [...prev, processedMessage];
      });
      
      // Auto-scroll to bottom when new message arrives
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    };

    // Listen for user joined with complete info (real-time)
    const handleUserJoined = (data: { 
      userId: string; 
      userName: string;
      userAvatar?: string;
      userFrame?: any;
      userNameEffect?: any;
      userStatus?: 'online' | 'offline' | 'away' | 'invisible';
      isPremiumSubscriber?: boolean;
    }) => {
      // Don't add admin to members list if admin is invisible
      if (isCurrentUserAdmin && isInvisible && data.userId === currentUser.id) {
        return;
      }
      
      setMembers(prev => {
        if (prev.find(m => m.id === data.userId)) {
          // Update existing user with new info (real-time update)
          return prev.map(member => 
            member.id === data.userId 
              ? {
                  ...member,
                  name: data.userName || member.name,
                  avatar: data.userAvatar || member.avatar,
                  status: (data.userStatus || 'online') as 'online' | 'offline' | 'away',
                  selectedFrame: data.userFrame || (member as any).selectedFrame,
                  frameConfig: data.userFrame || (member as any).frameConfig,
                  customNameStyle: data.userNameEffect ? { nameEffect: data.userNameEffect } : (member as any).customNameStyle,
                  isPremiumSubscriber: data.isPremiumSubscriber !== undefined ? data.isPremiumSubscriber : (member as any).isPremiumSubscriber
                } as User & { selectedFrame?: any; frameConfig?: any; customNameStyle?: any; isPremiumSubscriber?: boolean }
              : member
          );
        }
        
        // Don't show admin in members list if invisible
        if (isCurrentUserAdmin && isInvisible && data.userId === currentUser.id) {
          return prev;
        }
        
        // Add new user with complete info (real-time)
        return [...prev, {
          id: data.userId,
          name: data.userName,
          avatar: data.userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.userId}`,
          status: (data.userStatus || 'online') as 'online' | 'offline' | 'away',
          isPremiumSubscriber: data.isPremiumSubscriber !== undefined ? data.isPremiumSubscriber : true,
          selectedFrame: data.userFrame || undefined,
          frameConfig: data.userFrame || undefined,
          customNameStyle: data.userNameEffect ? { nameEffect: data.userNameEffect } : undefined
        } as User & { isPremiumSubscriber?: boolean; selectedFrame?: any; frameConfig?: any; customNameStyle?: any }];
      });
      
      // Update name styles map
      if (data.userNameEffect) {
        setUserNameStyles(prev => {
          const newMap = new Map(prev);
          newMap.set(data.userId, { nameEffect: data.userNameEffect });
          return newMap;
        });
      }
    };
    
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
      }>;
    }) => {
      if (data.conversationId === PREMIUM_CHAT_ID) {
        console.log(`📨 Received ${data.messages.length} messages from conversation history`);
        // Load conversation history messages
        const historyMessages: Message[] = data.messages.map(msg => ({
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
          reactions: (msg.reactions || []).map(r => ({
            emoji: r.emoji,
            userIds: r.userIds || [],
            userNames: r.userNames || []
          })),
          edited: msg.edited || false
        }));
        
        // Only add if we don't have messages yet or if history is more recent
        setMessages(prev => {
          if (prev.length === 0) {
            return historyMessages;
          }
          // Merge with existing messages (avoid duplicates)
          const existingIds = new Set(prev.map(m => m.id));
          const newMessages = historyMessages.filter(m => !existingIds.has(m.id));
          return [...prev, ...newMessages].sort((a, b) => 
            a.timestamp.getTime() - b.timestamp.getTime()
          );
        });
      }
    };

    // Listen for active users list (when joining, receive all current users)
    const handleActiveUsers = (users: Array<{
      userId: string;
      userName: string;
      userAvatar?: string;
      userFrame?: any;
      userNameEffect?: any;
      userStatus?: string;
      isPremiumSubscriber?: boolean;
    }>) => {
      console.log('Received active users:', users);
      
      // Add all active users to members list (real-time sync)
      setMembers(prev => {
        const existingIds = new Set(prev.map(m => m.id));
        const newMembers = users
          .filter(u => u.userId !== displayUser.id) // Don't add self again
          .filter(u => !existingIds.has(u.userId)) // Don't add duplicates
          .map(u => ({
            id: u.userId,
            name: u.userName,
            avatar: u.userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.userId}`,
            status: (u.userStatus || 'online') as 'online' | 'offline' | 'away',
            isPremiumSubscriber: u.isPremiumSubscriber !== undefined ? u.isPremiumSubscriber : true,
            selectedFrame: u.userFrame || undefined,
            frameConfig: u.userFrame || undefined,
            customNameStyle: u.userNameEffect ? { nameEffect: u.userNameEffect } : undefined
          } as User & { isPremiumSubscriber?: boolean; selectedFrame?: any; frameConfig?: any; customNameStyle?: any }));
        
        // Update name styles
        users.forEach(u => {
          if (u.userNameEffect) {
            setUserNameStyles(prev => {
              const newMap = new Map(prev);
              newMap.set(u.userId, { nameEffect: u.userNameEffect });
              return newMap;
            });
          }
        });
        
        return [...prev, ...newMembers];
      });
    };

    // Listen for user left
    const handleUserLeft = (data: { userId: string }) => {
      setMembers(prev => prev.filter(member => member.id !== data.userId));
    };

    // Listen for voice chat events
    const handleUserSpeaking = (data: { userId: string; isSpeaking: boolean }) => {
      setSpeakingUsers(prev => {
        if (data.isSpeaking) {
          return prev.includes(data.userId) ? prev : [...prev, data.userId];
        } else {
          return prev.filter(id => id !== data.userId);
        }
      });
    };

    const handleVoiceChatJoined = (data: { userId: string; userName: string }) => {
      // User joined voice chat
      if (data.userId !== currentUser.id) {
        // Handle remote user audio stream
        console.log(`User ${data.userName} joined voice chat`);
      }
    };

    // Listen for incoming audio chunks from other users (real-time voice)
    const handleVoiceAudioChunk = (data: { 
      userId: string; 
      userName: string; 
      audioData: string;
      timestamp: Date;
    }) => {
      if (data.userId === currentUser.id || isDeafened) return; // Don't play own audio or if deafened

      try {
        // Convert base64 to blob
        const base64Data = data.audioData.split(',')[1]; // Remove data URL prefix
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'audio/webm' });

        // Get or create audio element for this user
        let audioElement = audioElements.get(data.userId);
        if (!audioElement) {
          audioElement = new Audio();
          audioElement.autoplay = true;
          audioElement.volume = 0.8; // Set volume
          audioElements.set(data.userId, audioElement);
          setAudioElements(new Map(audioElements));
        }

        // Create object URL and play
        const audioUrl = URL.createObjectURL(blob);
        audioElement.src = audioUrl;
        audioElement.play().catch(error => {
          console.error('Error playing audio:', error);
        });

        // Clean up old URL after playing
        audioElement.onended = () => {
          URL.revokeObjectURL(audioUrl);
        };
      } catch (error) {
        console.error('Error processing audio chunk:', error);
      }
    };

    // Listen for message edits
    const handleMessageEdited = (data: { messageId: string; content: string; timestamp: Date }) => {
      setMessages(prev => prev.map(msg => 
        msg.id === data.messageId 
          ? { ...msg, content: data.content, edited: true, timestamp: data.timestamp }
          : msg
      ));
    };

    // Listen for message deletions
    const handleMessageDeleted = (data: { messageId: string }) => {
      setMessages(prev => prev.filter(msg => msg.id !== data.messageId));
    };

    // Listen for reactions
    const handleReactionReceived = (data: { messageId: string; emoji: string; userId: string; userName: string }) => {
      setMessages(prev => prev.map(msg => {
        if (msg.id !== data.messageId) return msg;
        
        const reactions = [...(msg.reactions || [])];
        const existingReactionIndex = reactions.findIndex(r => r.emoji === data.emoji);

        if (existingReactionIndex >= 0) {
          const reaction = reactions[existingReactionIndex];
          const userIndex = reaction.userIds.indexOf(data.userId);

          if (userIndex >= 0) {
            // User already reacted with this emoji, remove their reaction
            const newUserIds = [...reaction.userIds];
            const newUserNames = [...(reaction.userNames || [])];
            newUserIds.splice(userIndex, 1);
            newUserNames.splice(userIndex, 1);

            if (newUserIds.length === 0) {
              reactions.splice(existingReactionIndex, 1);
            } else {
              reactions[existingReactionIndex] = {
                ...reaction,
                userIds: newUserIds,
                userNames: newUserNames
              };
            }
          } else {
            // User reacted with this emoji, add their reaction
            reactions[existingReactionIndex] = {
              ...reaction,
              userIds: [...reaction.userIds, data.userId],
              userNames: [...(reaction.userNames || []), data.userName]
            };
          }
        } else {
          // New emoji reaction
          reactions.push({
            emoji: data.emoji,
            userIds: [data.userId],
            userNames: [data.userName]
          });
        }
        
        return { ...msg, reactions };
      }));
    };

    // Listen for frame updates from other users (real-time)
    const handleUserFrameUpdate = (data: { userId: string; frameConfig: any }) => {
      setMembers(prev => prev.map(member => 
        member.id === data.userId 
          ? { ...member, selectedFrame: data.frameConfig, frameConfig: data.frameConfig } as User & { selectedFrame?: any; frameConfig?: any }
          : member
      ));
    };

    // Listen for name effect updates from other users
    const handleUserNameEffectUpdate = (data: { userId: string; nameEffect: any }) => {
      setUserNameStyles(prev => {
        const newMap = new Map(prev);
        newMap.set(data.userId, { nameEffect: data.nameEffect });
        return newMap;
      });
      
      // Also update members list
      setMembers(prev => prev.map(member => 
        member.id === data.userId 
          ? { ...member, customNameStyle: { nameEffect: data.nameEffect } }
          : member
      ));
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('conversation_history', handleConversationHistory); // Receive conversation history (real-time sync)
    socket.on('user_joined', handleUserJoined);
    socket.on('active_users', handleActiveUsers); // Receive list of active users
    socket.on('user_left', handleUserLeft);
    socket.on('user_speaking', handleUserSpeaking);
    socket.on('voice_chat_joined', handleVoiceChatJoined);
    socket.on('voice_audio_chunk', handleVoiceAudioChunk); // Receive audio chunks (real-time voice)
    socket.on('message_edited', handleMessageEdited);
    socket.on('message_deleted', handleMessageDeleted);
    socket.on('reaction_received', handleReactionReceived);
    socket.on('user_frame_updated', handleUserFrameUpdate);
    socket.on('user_name_effect_updated', handleUserNameEffectUpdate);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('conversation_history', handleConversationHistory);
      socket.off('user_joined', handleUserJoined);
      socket.off('active_users', handleActiveUsers);
      socket.off('user_left', handleUserLeft);
      socket.off('user_speaking', handleUserSpeaking);
      socket.off('voice_chat_joined', handleVoiceChatJoined);
      socket.off('voice_audio_chunk', handleVoiceAudioChunk);
      socket.off('message_edited', handleMessageEdited);
      socket.off('message_deleted', handleMessageDeleted);
      socket.off('reaction_received', handleReactionReceived);
      socket.off('user_frame_updated', handleUserFrameUpdate);
      socket.off('user_name_effect_updated', handleUserNameEffectUpdate);
      socket.emit('leave_conversation', PREMIUM_CHAT_ID);
    };
  }, [socket, currentUser, dir, isCurrentUserAdmin, isInvisible]);

  // Handle voice chat with real audio recording and streaming
  const handleToggleVoiceChat = async () => {
    if (!isVoiceChatActive) {
      try {
        // Request microphone access
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          } 
        });
        setLocalStream(stream);
        setIsVoiceChatActive(true);
        setIsMuted(false);
        
        // Join voice chat room
        if (socket) {
          socket.emit('join_voice_chat', {
            userId: currentUser.id,
            userName: currentUser.name,
            conversationId: PREMIUM_CHAT_ID
          });
        }

        // Start recording audio
        startAudioRecording(stream);

        // Detect speaking
        const audioContext = new AudioContext();
        audioContextRef.current = audioContext;
        const analyser = audioContext.createAnalyser();
        analyserRef.current = analyser;
        const microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);
        analyser.fftSize = 256;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        let animationFrameId: number;
        
        const checkSpeaking = () => {
          if (!isVoiceChatActive || !localStream || !analyserRef.current) {
            if (animationFrameId) {
              cancelAnimationFrame(animationFrameId);
            }
            return;
          }
          
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          
          setSpeakingUsers(prev => {
            const isCurrentlySpeaking = prev.includes(currentUser.id);
            const shouldBeSpeaking = average > 30 && !isMuted;
            
            if (shouldBeSpeaking && !isCurrentlySpeaking) {
              // User started speaking
              if (socket) {
                socket.emit('user_speaking', {
                  userId: currentUser.id,
                  isSpeaking: true,
                  conversationId: PREMIUM_CHAT_ID
                });
              }
              return [...prev, currentUser.id];
            } else if (!shouldBeSpeaking && isCurrentlySpeaking) {
              // User stopped speaking
              if (socket) {
                socket.emit('user_speaking', {
                  userId: currentUser.id,
                  isSpeaking: false,
                  conversationId: PREMIUM_CHAT_ID
                });
              }
              return prev.filter(id => id !== currentUser.id);
            }
            return prev;
          });
          
          animationFrameId = requestAnimationFrame(checkSpeaking);
        };
        
        checkSpeaking();
        
        // Cleanup function
        return () => {
          if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
          }
          if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
          }
          analyserRef.current = null;
        };
      } catch (error) {
        console.error('Error accessing microphone:', error);
        alert(dir === 'rtl' 
          ? 'تم رفض الوصول إلى المايكروفون. يرجى السماح بالوصول لاستخدام الدردشة الصوتية.'
          : 'Microphone access denied. Please allow microphone access to use voice chat.');
      }
    } else {
      // Leave voice chat
      stopAudioRecording();
      
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        setLocalStream(null);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      analyserRef.current = null;
      
      // Stop all remote audio
      audioElements.forEach(audio => {
        audio.pause();
        audio.srcObject = null;
      });
      audioElements.clear();
      remoteStreams.clear();
      
      setIsVoiceChatActive(false);
      setIsMuted(false);
      setIsDeafened(false);
      setSpeakingUsers(prev => prev.filter(id => id !== currentUser.id));
      
      if (socket) {
        socket.emit('leave_voice_chat', {
          userId: currentUser.id,
          conversationId: PREMIUM_CHAT_ID
        });
      }
    }
  };

  // Start recording audio and send via WebSocket
  const startAudioRecording = (stream: MediaStream) => {
    try {
      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus' // Use WebM with Opus codec
      });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      isRecordingRef.current = true;

      // Handle data available
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && socket && isConnected && !isMuted) {
          // Convert blob to base64 for WebSocket transmission
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64Audio = reader.result as string;
            // Send audio chunk via WebSocket
            socket.emit('voice_audio_chunk', {
              userId: currentUser.id,
              userName: currentUser.name,
              conversationId: PREMIUM_CHAT_ID,
              audioData: base64Audio,
              timestamp: new Date()
            });
          };
          reader.readAsDataURL(event.data);
        }
      };

      // Start recording with timeslice (send chunks every 100ms)
      mediaRecorder.start(100);
      console.log('✅ Audio recording started - Real-time voice chat active');
    } catch (error) {
      console.error('Error starting audio recording:', error);
      // Fallback: Try without specific codec
      try {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];
        isRecordingRef.current = true;

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0 && socket && isConnected && !isMuted) {
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64Audio = reader.result as string;
              socket.emit('voice_audio_chunk', {
                userId: currentUser.id,
                userName: currentUser.name,
                conversationId: PREMIUM_CHAT_ID,
                audioData: base64Audio,
                timestamp: new Date()
              });
            };
            reader.readAsDataURL(event.data);
          }
        };

        mediaRecorder.start(100);
        console.log('✅ Audio recording started (fallback mode)');
      } catch (fallbackError) {
        console.error('Error in fallback recording:', fallbackError);
      }
    }
  };

  // Stop audio recording
  const stopAudioRecording = () => {
    if (mediaRecorderRef.current && isRecordingRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
      isRecordingRef.current = false;
      audioChunksRef.current = [];
      console.log('🛑 Audio recording stopped');
    }
  };

  const handleToggleMute = () => {
    const newMutedState = !isMuted;
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !newMutedState; // enabled = true when not muted
      });
    }
    setIsMuted(newMutedState);
    
    // Pause/resume recording based on mute state
    if (mediaRecorderRef.current) {
      if (newMutedState) {
        // Muted - stop sending audio
        if (isRecordingRef.current) {
          mediaRecorderRef.current.pause();
        }
      } else {
        // Unmuted - resume sending audio
        if (isRecordingRef.current && mediaRecorderRef.current.state === 'paused') {
          mediaRecorderRef.current.resume();
        }
      }
    }
    
    if (socket) {
      socket.emit('user_speaking', {
        userId: currentUser.id,
        isSpeaking: !newMutedState,
        conversationId: PREMIUM_CHAT_ID
      });
      if (newMutedState) {
        setSpeakingUsers(prev => prev.filter(id => id !== currentUser.id));
      }
    }
  };

  const handleToggleDeafen = () => {
    const newDeafenedState = !isDeafened;
    setIsDeafened(newDeafenedState);
    
    // Mute/unmute all remote audio streams
    audioElements.forEach(audio => {
      audio.muted = newDeafenedState;
    });
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (content: string) => {
    if (!socket || !content.trim()) return;

    if (editingMessage) {
      // Edit message - Send via WebSocket for real-time update
      socket.emit('edit_message', {
        messageId: editingMessage.id,
        content,
        conversationId: PREMIUM_CHAT_ID
      });
      
      // Update locally immediately (optimistic update)
      setMessages(prev => prev.map(msg => 
        msg.id === editingMessage.id 
          ? { ...msg, content, edited: true }
          : msg
      ));
      setEditingMessage(undefined);
    } else {
      // Send new message - Real-time message sending
      const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newMessage: Message = {
        id: messageId,
        conversationId: PREMIUM_CHAT_ID,
        senderId: displayUser.id,
        content: content.trim(),
        timestamp: new Date(),
        status: 'sending', // Show sending status immediately
        replyTo: replyingTo?.id ?? undefined,
        reactions: []
      };

      // Add message locally FIRST (optimistic update) - User sees message immediately
      setMessages(prev => [...prev, newMessage]);
      
      // Auto-scroll to show new message
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
      
      // Send via WebSocket - Broadcasts to all users in real-time
      socket.emit('send_message', {
        ...newMessage,
        // Include sender info for display
        senderName: displayUser.name,
        senderAvatar: displayUser.avatar
      });
      
      // The server will broadcast this message back via 'receive_message' event
      // This ensures all users (including sender) get the message with server timestamp
      // The handleReceiveMessage will update the status to 'sent'
      
      setReplyingTo(undefined);
      setEditingMessage(undefined);
    }
  };

  const handleReact = (messageId: string, emoji: string) => {
    if (!socket) return;

    // Send reaction via WebSocket for real-time update
    socket.emit('react_to_message', {
      messageId,
      emoji,
      userId: displayUser.id,
      userName: displayUser.name,
      conversationId: PREMIUM_CHAT_ID
    });

    // Update locally immediately (optimistic update)
    setMessages(prev => prev.map(msg => {
      if (msg.id !== messageId) return msg;

      const reactions = [...(msg.reactions || [])];
      const existingReactionIndex = reactions.findIndex(r => r.emoji === emoji);

      if (existingReactionIndex >= 0) {
        const reaction = reactions[existingReactionIndex];
        const userIndex = reaction.userIds.indexOf(displayUser.id);

        if (userIndex >= 0) {
          const newUserIds = [...reaction.userIds];
          const newUserNames = [...(reaction.userNames || [])];
          newUserIds.splice(userIndex, 1);
          newUserNames.splice(userIndex, 1);

          if (newUserIds.length === 0) {
            reactions.splice(existingReactionIndex, 1);
          } else {
            reactions[existingReactionIndex] = {
              ...reaction,
              userIds: newUserIds,
              userNames: newUserNames
            };
          }
        } else {
          // Add reaction
          reactions[existingReactionIndex] = {
            ...reaction,
            userIds: [...reaction.userIds, displayUser.id],
            userNames: [...(reaction.userNames || []), displayUser.name]
          };
        }
      } else {
        // New reaction
        reactions.push({
          emoji,
          userIds: [displayUser.id],
          userNames: [displayUser.name]
        });
      }

      return { ...msg, reactions };
    }));
  };

  const handleReply = (message: Message) => {
    setReplyingTo(message);
    setEditingMessage(undefined);
  };

  const handleEdit = (message: Message) => {
    setEditingMessage(message);
    setReplyingTo(undefined);
  };

  const handleDelete = (messageId: string) => {
    if (!socket) return;

    // Send delete via WebSocket for real-time update
    socket.emit('delete_message', {
      messageId,
      conversationId: PREMIUM_CHAT_ID
    });

    // Update locally immediately (optimistic update)
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
  };

  // Get background style
  const getBackgroundStyle = () => {
    // Only show image background if explicitly set and not default
    const hasCustomImage = chatBackground.type === 'image' && chatBackground.value && chatBackground.value.trim() !== '';
    
    if (hasCustomImage) {
      return {
        backgroundImage: `url(${chatBackground.value})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      };
    }

    // Color backgrounds (only if explicitly selected, not default)
    const backgrounds: Record<string, string> = {
      'original-background': 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%)',
      'royal-black-gold': '#000000',
      'royal-white-gold': '#FFFFFF',
      'gradient-royal': 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%)',
      'gradient-sunset': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'gradient-ocean': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'gradient-forest': 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)',
      'gradient-purple-dream': 'linear-gradient(135deg, #a8edea 0%, #fed6e3 50%, #d299c2 100%)',
      'gradient-fire': 'linear-gradient(135deg, #f093fb 0%, #f5576c 50%, #4facfe 100%)',
      'gradient-emerald': 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
      'gradient-rose': 'linear-gradient(135deg, #fa8bff 0%, #2bd2ff 50%, #2bff88 100%)'
    };
    
    // Default: Always use Royal branding background unless user explicitly chose another
    const hasExplicitBackground = chatBackground.value && chatBackground.value !== '' && backgrounds[chatBackground.value];
    
    return {
      background: hasExplicitBackground
        ? backgrounds[chatBackground.value]
        : 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 25%, #2d1b1b 50%, #1a1a1a 75%, #0a0a0a 100%)',
      position: 'relative' as const,
      overflow: 'hidden' as const
    };
  };

  return (
    <div className="flex-1 flex flex-col sm:flex-row h-full w-full min-w-0 relative overflow-hidden premium-chat-container" dir={dir}>
      {/* Members List Sidebar - Mobile responsive */}
      {showMembersList && (
        <div className="w-full sm:w-80 fixed sm:relative inset-0 sm:inset-auto z-40 sm:z-30 border-r bg-background animate-slide-in-right touch-manipulation overflow-y-auto">
          <PremiumMembersList
            members={members.map((m, index) => ({
              ...m,
              rank: index + 1,
              statusMessage: m.statusMessage || (dir === 'rtl' ? 'مشترك مميز نشط' : 'Active premium member')
            }))}
            currentUserId={displayUser.id}
            onMemberClick={(member) => {
              // Handle member click (e.g., open profile, start DM)
              console.log('Member clicked:', member);
            }}
          />
        </div>
      )}

      {/* Main Chat Area - Mobile responsive */}
      <div 
        className="flex-1 flex flex-col h-full w-full min-w-0 relative overflow-x-hidden overflow-y-auto touch-pan-y"
        style={{
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-y pinch-zoom'
        }}
      >
        {/* Premium Animated Background with Decorations */}
      <div 
        className="absolute inset-0 pointer-events-none overflow-hidden premium-bg-animated transition-all duration-1000"
        style={getBackgroundStyle()}
      >
        {/* Overlay for better readability when using image background */}
        {chatBackground.type === 'image' && (
          <div className="absolute inset-0 bg-background/90" />
        )}

        {/* Default Royal Branding Background - Luxurious with Crown Icon */}
        {/* Show Royal background by default - only hide if user has explicitly set a custom color/image */}
        {chatBackground.type !== 'image' && (!chatBackground.value || chatBackground.value === '') && (
          <>
            {/* Royal Crown Icon - Centered and Large */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none">
              <div className="relative">
                {/* Crown SVG Icon - Luxurious */}
                <svg 
                  width="400" 
                  height="400" 
                  viewBox="0 0 200 200" 
                  className="opacity-10 royal-crown"
                  style={{
                    filter: 'drop-shadow(0 0 40px rgba(255, 215, 0, 0.3)) drop-shadow(0 0 80px rgba(255, 215, 0, 0.2))',
                    animation: 'royalPulse 4s ease-in-out infinite'
                  }}
                >
                  {/* Crown Path */}
                  <path 
                    d="M50 140 L75 60 L100 80 L125 60 L150 140 Z" 
                    fill="none" 
                    stroke="#FFD700" 
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Crown Points */}
                  <circle cx="75" cy="60" r="8" fill="#FFD700" />
                  <circle cx="100" cy="50" r="10" fill="#FFD700" />
                  <circle cx="125" cy="60" r="8" fill="#FFD700" />
                  {/* Crown Base */}
                  <path 
                    d="M45 140 L155 140 L160 150 L40 150 Z" 
                    fill="#FFD700" 
                    opacity="0.3"
                  />
                </svg>
                
                {/* Royal Text Below Crown */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-8">
                  <h1 
                    className="text-6xl sm:text-8xl font-bold royal-text"
                    style={{
                      fontFamily: 'serif',
                      letterSpacing: '0.2em',
                      textAlign: 'center',
                      animation: 'royalShine 3s linear infinite, royalBlink 4s ease-in-out infinite'
                    }}
                  >
                    ROYAL
                  </h1>
                </div>
              </div>
            </div>

            {/* Golden Sparkles - Royal Ambiance */}
            {Array.from({ length: 50 }).map((_, i) => {
              const delay = Math.random() * 4;
              const duration = 3 + Math.random() * 3;
              const size = 2 + Math.random() * 4;
              const left = Math.random() * 100;
              const top = Math.random() * 100;
              
              return (
                <div
                  key={`royal-sparkle-${i}`}
                  className="absolute rounded-full"
                  style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    background: 'radial-gradient(circle, #FFD700 0%, #FFA500 50%, transparent 100%)',
                    boxShadow: `0 0 ${size * 2}px #FFD700, 0 0 ${size * 4}px rgba(255, 215, 0, 0.5)`,
                    left: `${left}%`,
                    top: `${top}%`,
                    opacity: 0.3 + Math.random() * 0.3,
                    animationDelay: `${delay}s`,
                    animationDuration: `${duration}s`,
                    animation: 'royalBlink 3s ease-in-out infinite'
                  }}
                />
              );
            })}

            {/* Subtle Golden Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-900/5 via-transparent to-amber-900/5 pointer-events-none" />
            
            {/* Dark Shadows at Edges */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(0,0,0,0.4)_100%)] pointer-events-none" />
          </>
        )}
        
        {/* Golden Sparkles - Only for selected backgrounds (not Royal default) */}
        {chatBackground.value && chatBackground.value !== '' && chatBackground.value !== 'original-background' && Array.from({ length: 30 }).map((_, i) => {
          const isBlack = chatBackground.value === 'royal-black-gold';
          const opacity = isBlack ? 0.4 : 0.2; // Lighter on white, more visible on black
          return (
            <div
              key={`sparkle-${i}`}
              className="absolute rounded-full golden-sparkle"
              style={{
                width: `${2 + Math.random() * 4}px`,
                height: `${2 + Math.random() * 4}px`,
                background: 'radial-gradient(circle, #FFD700 0%, #FFA500 50%, transparent 100%)',
                boxShadow: `0 0 ${4 + Math.random() * 6}px #FFD700, 0 0 ${8 + Math.random() * 12}px rgba(255, 215, 0, 0.5)`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: opacity,
                animationDelay: `${Math.random() * 4}s`,
                animationDuration: `${3 + Math.random() * 3}s`,
                animation: 'sparkle-twinkle 3s ease-in-out infinite'
              }}
            />
          );
        })}
        
        {/* Original Background - Animated Gradient Orbs */}
        {chatBackground.value === 'original-background' && (
          <>
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-yellow-500/20 via-amber-500/10 to-transparent rounded-full blur-3xl animate-pulse-slow premium-orb-1" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-tl from-purple-500/20 via-blue-500/10 to-transparent rounded-full blur-3xl animate-pulse-slow premium-orb-2" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-primary/10 via-primary/5 to-transparent rounded-full blur-3xl animate-pulse-slow premium-orb-3" style={{ animationDelay: '2s' }} />
            <div className="absolute top-1/3 right-1/3 w-72 h-72 bg-gradient-to-br from-pink-500/15 via-rose-500/8 to-transparent rounded-full blur-3xl animate-pulse-slow premium-orb-4" style={{ animationDelay: '1.5s' }} />
            <div className="absolute bottom-1/3 left-1/3 w-80 h-80 bg-gradient-to-tr from-cyan-500/15 via-teal-500/8 to-transparent rounded-full blur-3xl animate-pulse-slow premium-orb-5" style={{ animationDelay: '2.5s' }} />
            
            {/* Floating Decorative Elements */}
            <div className="absolute top-20 left-10 text-6xl opacity-10 animate-float-slow premium-decoration-1">👑</div>
            <div className="absolute top-40 right-20 text-5xl opacity-10 animate-float-slow premium-decoration-2" style={{ animationDelay: '0.5s' }}>✨</div>
            <div className="absolute bottom-32 left-20 text-4xl opacity-10 animate-float-slow premium-decoration-3" style={{ animationDelay: '1s' }}>💎</div>
            <div className="absolute bottom-20 right-16 text-5xl opacity-10 animate-float-slow premium-decoration-4" style={{ animationDelay: '1.5s' }}>🌟</div>
            
            {/* Floating Particles */}
            {Array.from({ length: 15 }).map((_, i) => (
              <div
                key={`particle-${i}`}
                className="absolute w-2 h-2 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full opacity-30 premium-particle"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${3 + Math.random() * 2}s`
                }}
              />
            ))}
            
            {/* Animated Grid Pattern */}
            <div className="absolute inset-0 premium-grid-pattern opacity-5" />
          </>
        )}
        
        {/* Subtle Golden Glow Orbs - Very light */}
        {chatBackground.value === 'royal-black-gold' && (
          <>
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-yellow-500/5 via-amber-500/3 to-transparent rounded-full blur-3xl animate-pulse-slow premium-orb-1" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-tl from-yellow-500/5 via-amber-500/3 to-transparent rounded-full blur-3xl animate-pulse-slow premium-orb-2" style={{ animationDelay: '2s' }} />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-yellow-500/3 via-amber-500/2 to-transparent rounded-full blur-3xl animate-pulse-slow premium-orb-3" style={{ animationDelay: '4s' }} />
          </>
        )}
        
        {chatBackground.value === 'royal-white-gold' && (
          <>
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-yellow-400/3 via-amber-400/2 to-transparent rounded-full blur-3xl animate-pulse-slow premium-orb-1" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-tl from-yellow-400/3 via-amber-400/2 to-transparent rounded-full blur-3xl animate-pulse-slow premium-orb-2" style={{ animationDelay: '2s' }} />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-yellow-400/2 via-amber-400/1 to-transparent rounded-full blur-3xl animate-pulse-slow premium-orb-3" style={{ animationDelay: '4s' }} />
          </>
        )}
        
        {/* Animated Grid Pattern - Very subtle for black/white backgrounds */}
        {chatBackground.value !== 'original-background' && (
          <div className="absolute inset-0 premium-grid-pattern opacity-[0.02]" />
        )}
      </div>

      {/* Header - Mobile responsive */}
      <Card className="border-b rounded-none premium-header animate-slide-in-down relative z-10 bg-background w-full touch-manipulation">
        <div className="flex items-center justify-between p-2 sm:p-4 gap-2 flex-wrap">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="relative">
              {/* Fancy Frame for Premium Chat Avatar */}
              <div
                className={cn(
                  "absolute -inset-1 rounded-full animate-pulse shadow-lg transition-all duration-300",
                  isCurrentUserAdmin && "admin-glow-jewel"
                )}
                style={{
                  background: isCurrentUserAdmin 
                    ? `linear-gradient(135deg, #ffd700, #ffed4e, #ffd700)`
                    : `linear-gradient(135deg, hsl(var(--chat-from)), hsl(var(--chat-to)))`
                }}
              />
              <Avatar className={cn(
                "w-10 h-10 sm:w-12 sm:h-12 border-2 sm:border-4 border-background relative z-10 shadow-xl animate-fade-in-scale flex-shrink-0",
                isCurrentUserAdmin && "admin-avatar-jewel"
              )}>
                <AvatarFallback 
                  className={cn(
                    isCurrentUserAdmin 
                      ? "admin-avatar-bg-jewel"
                      : "bg-gradient-to-br from-primary to-primary/60"
                  )}
                  style={isCurrentUserAdmin ? undefined : {
                    background: `linear-gradient(135deg, hsl(var(--chat-from)), hsl(var(--chat-to)))`
                  }}
                >
                  {isCurrentUserAdmin ? (
                    <Crown className="w-6 h-6 text-white animate-bounce-slow admin-crown-jewel" />
                  ) : (
                    <Crown className="w-6 h-6 text-white animate-bounce-slow" />
                  )}
                </AvatarFallback>
              </Avatar>
              {isCurrentUserAdmin ? (
                <Badge className="absolute -bottom-1 -right-1 bg-yellow-500 border-2 border-background z-20 shadow-lg animate-pulse admin-badge-jewel">
                  <Crown className="w-3 h-3 text-white animate-bounce-slow" />
                </Badge>
              ) : (
                <Badge className="absolute -bottom-1 -right-1 bg-green-500 border-2 border-background z-20 shadow-lg animate-pulse">
                  <Shield className="w-3 h-3" />
                </Badge>
              )}
              {isCurrentUserAdmin && (
                <div className="absolute -inset-2 bg-yellow-400/20 rounded-full blur-xl animate-pulse admin-glow-jewel" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                <h2 className="font-bold text-sm sm:text-lg flex items-center gap-1 sm:gap-2 animate-gradient min-w-0 truncate" style={{ color: `hsl(var(--primary))` }}>
                  {isCurrentUserAdmin ? (
                    <div className="relative flex-shrink-0">
                      <Crown className="w-4 h-4 sm:w-6 sm:h-6 animate-bounce-slow admin-crown-jewel" style={{ color: `#ffd700` }} />
                      <div className="absolute -inset-1 bg-yellow-400/30 rounded-full blur-md animate-pulse" />
                    </div>
                  ) : (
                    <Crown className="w-4 h-4 sm:w-5 sm:h-5 animate-bounce-slow flex-shrink-0" />
                  )}
                  <span className="truncate">{dir === 'rtl' ? `الدردشة المميزة - ${isInvisible ? 'مخفي' : 'أونلاين'}` : `Premium Chat - ${isInvisible ? 'Invisible' : 'Online'}`}</span>
                </h2>
                {isCurrentUserAdmin && (
                  <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-600 border-yellow-500/30 animate-pulse admin-badge-jewel text-[10px] sm:text-xs px-1 sm:px-2">
                    <Crown className="w-2.5 h-2.5 sm:w-3 sm:h-3 sm:mr-1 animate-bounce-slow" />
                    <span className="hidden sm:inline">{dir === 'rtl' ? 'مالك' : 'Owner'}</span>
                  </Badge>
                )}
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 animate-fade-in-scale text-[10px] sm:text-xs px-1 sm:px-2">
                  {dir === 'rtl' ? 'حصري' : 'Exclusive'}
                </Badge>
                {isVoiceChatActive && (
                  <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20 animate-slide-in-up text-[10px] sm:text-xs px-1 sm:px-2">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse sm:mr-1" />
                    <span className="hidden sm:inline">{dir === 'rtl' ? 'صوتي نشط' : 'Voice Active'}</span>
                  </Badge>
                )}
                {isInvisible && (
                  <Badge variant="secondary" className="bg-gray-500/10 text-gray-600 border-gray-500/20 animate-pulse text-[10px] sm:text-xs px-1 sm:px-2">
                    <EyeOff className="w-2.5 h-2.5 sm:w-3 sm:h-3 sm:mr-1" />
                    <span className="hidden sm:inline">{dir === 'rtl' ? 'مخفي' : 'Invisible'}</span>
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMembersList(!showMembersList)}
                  className="h-auto p-0.5 sm:p-1 hover:bg-primary/10 text-xs sm:text-sm"
                >
                  <UsersRound className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                  <span className="hidden sm:inline">{members.length} {dir === 'rtl' ? 'مشترك' : 'members'}</span>
                  <span className="sm:hidden">{members.length}</span>
                </Button>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
            {isCurrentUserAdmin && (
              <Button
                type="button"
                size="sm"
                variant={isInvisible ? 'secondary' : 'outline'}
                onClick={toggleInvisibility}
                className={cn(
                  'rounded-full transition-all duration-300 hover:scale-110',
                  isInvisible && 'bg-gray-500/20 border-gray-500/30 shadow-lg'
                )}
                title={isInvisible ? (dir === 'rtl' ? 'إظهار نفسك' : 'Show yourself') : (dir === 'rtl' ? 'إخفاء نفسك' : 'Hide yourself')}
              >
                {isInvisible ? (
                  <>
                    <EyeOff className="w-4 h-4 mr-2" />
                    {dir === 'rtl' ? 'إظهار' : 'Show'}
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    {dir === 'rtl' ? 'إخفاء' : 'Hide'}
                  </>
                )}
              </Button>
            )}
            
            {/* Premium Chat Settings */}
            <PremiumChatSettings />
            
            {/* Subscription Offers Button */}
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setShowSubscriptionOffers(true)}
              className={cn(
                "rounded-full transition-all duration-300 hover:scale-110",
                "border-yellow-500/30 hover:border-yellow-500 bg-gradient-to-r from-yellow-500/10 to-amber-500/10"
              )}
              title={dir === 'rtl' ? 'عروض الاشتراك' : 'Subscription Offers'}
            >
              <Crown className="w-4 h-4 text-yellow-500" />
            </Button>
            
            <Badge variant="outline" className="border-primary text-primary animate-fade-in-scale">
              {dir === 'rtl' ? 'مدى الحياة' : 'Lifetime'}
            </Badge>
            <Button
              type="button"
              size="sm"
              variant={isVoiceChatActive ? 'default' : 'outline'}
              onClick={handleToggleVoiceChat}
              className={cn(
                'rounded-full transition-all duration-300 hover:scale-110',
                isVoiceChatActive && 'bg-primary hover:bg-primary/90 shadow-lg'
              )}
              style={
                isVoiceChatActive
                  ? {
                      background: `linear-gradient(135deg, hsl(var(--chat-from)), hsl(var(--chat-to)))`
                    }
                  : undefined
              }
            >
              {isVoiceChatActive ? (
                <>
                  <Mic className="w-4 h-4 mr-2" />
                  {dir === 'rtl' ? 'خروج' : 'Leave'}
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 mr-2" />
                  {dir === 'rtl' ? 'دخول صوتي' : 'Join Voice'}
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Voice Chat Bar */}
      {isVoiceChatActive && (
        <div className="animate-slide-in-down">
          <VoiceChatBar
            participants={members.filter(m => !(isCurrentUserAdmin && isInvisible && m.id === currentUser.id))}
            currentUser={currentUser}
            isMuted={isMuted}
            isDeafened={isDeafened}
            onToggleMute={handleToggleMute}
            onToggleDeafen={handleToggleDeafen}
            speakingUsers={speakingUsers.filter(id => !(isCurrentUserAdmin && isInvisible && id === currentUser.id))}
          />
        </div>
      )}

      {/* Royal Frames Showcase - Modern Luxury Replacement - Mobile responsive */}
      {showSubscriptionOffers && (
        <div className="px-2 sm:px-4 pt-2 sm:pt-4 pb-4 animate-slide-in-down relative z-20 w-full max-w-full overflow-visible">
          <RoyalFramesShowcase
            onSelectFrame={(frameConfig) => {
              // Save frame selection
              if (typeof window !== 'undefined' && loggedInUser) {
                localStorage.setItem(`premium_frame_${loggedInUser.id}`, JSON.stringify({
                  ...frameConfig,
                  frameConfig: frameConfig
                }));
                // Update user's frame config
                window.dispatchEvent(new CustomEvent('premium-frame-updated', { 
                  detail: { userId: loggedInUser.id, frameConfig: frameConfig } 
                }));
              }
              
              setSelectedFrame(frameConfig);
              
              // Update local members list immediately - تحديث فوري في الدردشة
              setMembers(prev => prev.map(member => 
                member.id === displayUser.id 
                  ? { 
                      ...member, 
                      selectedFrame: frameConfig,
                      frameConfig: frameConfig 
                    } as User & { selectedFrame?: any; frameConfig?: any }
                  : member
              ));
              
              // Broadcast frame update to all users in premium chat via WebSocket
              if (socket) {
                socket.emit('update_user_frame', {
                  userId: displayUser.id,
                  userName: displayUser.name,
                  frameConfig: frameConfig,
                  conversationId: PREMIUM_CHAT_ID
                });
              }
              
              setShowSubscriptionOffers(false);
            }}
            onSelectNameEffect={(effect) => {
              // Save name effect
              if (typeof window !== 'undefined' && loggedInUser) {
                localStorage.setItem(`premium_name_style_${loggedInUser.id}`, JSON.stringify({
                  nameEffect: effect
                }));
                window.dispatchEvent(new CustomEvent('premium-name-style-updated', { 
                  detail: { userId: loggedInUser.id, style: { nameEffect: effect } } 
                }));
              }
              
              // Update local state
              setUserNameStyles(prev => {
                const newMap = new Map(prev);
                if (loggedInUser) {
                  newMap.set(loggedInUser.id, { nameEffect: effect });
                }
                return newMap;
              });
              
              // Update local members list immediately - تحديث فوري في الدردشة
              setMembers(prev => prev.map(member => 
                member.id === displayUser.id 
                  ? { 
                      ...member, 
                      customNameStyle: { nameEffect: effect }
                    } as User & { customNameStyle?: any }
                  : member
              ));
              
              // Broadcast name effect update to all users in premium chat via WebSocket
              if (socket) {
                socket.emit('update_user_name_effect', {
                  userId: displayUser.id,
                  userName: displayUser.name,
                  nameEffect: effect,
                  conversationId: PREMIUM_CHAT_ID
                });
              }
              
              setShowSubscriptionOffers(false);
            }}
            onClose={() => setShowSubscriptionOffers(false)}
          />
        </div>
      )}

      {/* Royal Name Bar - Luxury Premium Names Display - Mobile responsive */}
      {!showSubscriptionOffers && members.length > 0 && (
        <div className="px-0 relative z-20 w-full">
          <RoyalNameBar 
            users={members.map(m => ({
              ...m,
              frameConfig: (m as any).frameConfig || (m as any).selectedFrame,
              nameEffect: userNameStyles.get(m.id)?.nameEffect
            }))}
          />
        </div>
      )}

      {/* Advertisement Banner - Keep old one as fallback */}
      {!showSubscriptionOffers && currentAd && !dismissedAds.has(currentAd.id) && members.length === 0 && (
        <div className="px-4 pt-4 animate-slide-in-down relative z-20">
          <PremiumAdvertisementBanner
            advertisement={currentAd}
            onClose={() => handleDismissAd(currentAd.id)}
            onAction={() => handleAdAction(currentAd)}
          />
        </div>
      )}

      {/* Welcome Banner */}
      {showWelcomeBanner && !currentAd && (
        <div className="px-4 pt-4 animate-slide-in-down">
          <WelcomeBanner
            userName={displayUser.name}
            memberCount={members.length}
            onClose={() => setShowWelcomeBanner(false)}
          />
        </div>
      )}

      {/* Messages - Mobile responsive */}
      <ScrollArea 
        className="flex-1 p-2 sm:p-4 relative z-10 w-full min-w-0 touch-pan-y"
        style={{
          maxHeight: 'calc(100dvh - 280px)',
          height: 'calc(100dvh - 280px)',
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-y pinch-zoom'
        }}
      >
        <div className="space-y-2 sm:space-y-4 pb-4 min-w-0">
          {messages.map((message, index) => {
            const sender = members.find(m => m.id === message.senderId) || { ...displayUser, isPremiumSubscriber: true };
            const isCurrentUser = message.senderId === displayUser.id;
            const replyToMessage = message.replyTo ? messages.find(m => m.id === message.replyTo) : undefined;
            const isPremiumSubscriber = (sender as User & { isPremiumSubscriber?: boolean }).isPremiumSubscriber !== false;

            return (
              <div
                key={message.id}
                className={cn(
                  "message-enter message-bubble-hover premium-message-wrapper",
                  "transform transition-all duration-500 ease-out",
                  "hover:scale-[1.02] hover:shadow-xl"
                )}
                style={{
                  animationDelay: `${Math.min(index * 0.05, 0.5)}s`
                }}
              >
                <div className={cn(
                  "relative",
                  isCurrentUser && "premium-message-glow"
                )}>
                  <MessageBubble
                    message={message}
                    sender={sender}
                    isCurrentUser={isCurrentUser}
                    onReply={handleReply}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onReact={handleReact}
                    replyToMessage={replyToMessage}
                    currentUserId={displayUser.id}
                    conversation={{
                      participants: members
                    }}
                    isPremiumSubscriber={isPremiumSubscriber}
                  />
                  {isCurrentUser && (
                    <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500/10 via-amber-500/10 to-yellow-500/10 rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-300 -z-10" />
                  )}
                </div>
              </div>
            );
          })}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>


      {/* Message Input - Mobile responsive */}
      <div 
        className="relative z-10 bg-background border-t border-border w-full touch-manipulation"
        style={{
          paddingBottom: 'env(safe-area-inset-bottom)'
        }}
      >
        <MessageInput
          onSend={handleSend}
          replyingTo={replyingTo}
          onCancelReply={() => setReplyingTo(undefined)}
          editingMessage={editingMessage}
          onCancelEdit={() => setEditingMessage(undefined)}
        />
      </div>
      </div>
    </div>
  );
}

