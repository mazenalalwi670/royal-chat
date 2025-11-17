'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/ui/avatar';
import { Button } from '@/ui/button';
import { Badge } from '@/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/ui/popover';
import { MoreVertical, Reply, Trash2, Edit, Smile, Copy, Check, CheckCheck, Crown, Image, FileText, MapPin, Play, Download } from 'lucide-react';
import { Message, User } from '@/types/chat';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { PremiumUserFrame } from '../premium/PremiumUserFrame';
import { PremiumBadge } from '../icons/ModernIcons';
import { LuxuryNameFrame } from '../decorations/LuxuryNameFrames';
import { AnimatedDecorations } from '../decorations/AnimatedDecorations';
import { AnimatedFrame, FrameConfig, FrameType } from '../frames/AnimatedFrames';
import { AnimatedName, NameEffectConfig, NameEffectType } from '../names/AnimatedName';

interface MessageBubbleProps {
  message: Message;
  sender: User;
  isCurrentUser: boolean;
  onReply: (message: Message) => void;
  onEdit: (message: Message) => void;
  onDelete: (messageId: string) => void;
  onReact: (messageId: string, emoji: string) => void;
  replyToMessage?: Message;
  currentUserId?: string;
  conversation?: {
    participants: User[];
  };
  isPremiumSubscriber?: boolean;
}

const EMOJI_REACTIONS = ['❤️', '👍', '😂', '😮', '😢', '🔥', '🎉', '✨'];

export function MessageBubble({
  message,
  sender,
  isCurrentUser,
  onReply,
  onEdit,
  onDelete,
  onReact,
  replyToMessage,
  currentUserId = 'user-1',
  conversation,
  isPremiumSubscriber = false
}: MessageBubbleProps) {
  const { t, dir } = useLanguage();
  const { colorScheme } = useTheme();
  const [showActions, setShowActions] = useState(false);

  const renderStatusIcon = () => {
    if (!isCurrentUser) return null;
    
    switch (message.status) {
      case 'sending':
        return <div className="w-3 h-3 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />;
      case 'sent':
        return <Check className="w-3 h-3 text-muted-foreground" />;
      case 'delivered':
        return <CheckCheck className="w-3 h-3 text-muted-foreground" />;
      case 'read':
        return <CheckCheck className="w-3 h-3" style={{ color: `hsl(var(--chat-from))` }} />;
    }
  };

  // Group reactions by emoji and track user participation
  const groupedReactions = (message.reactions || []).reduce((acc, reaction) => {
    // Handle both formats: { emoji, userName, userId } or { emoji, userIds: string[] }
    const emoji = reaction.emoji || (reaction as any).emoji;
    const userName = (reaction as any).userName || '';
    const userId = (reaction as any).userId || '';
    const userIds = (reaction as any).userIds || (userId ? [userId] : []);
    const userNames = (reaction as any).userNames || [];
    
    if (!acc[emoji]) {
      acc[emoji] = {
        userIds: [],
        userNames: []
      };
    }
    
    // Add unique user IDs
    userIds.forEach((uid: string, index: number) => {
      if (!acc[emoji].userIds.includes(uid)) {
        acc[emoji].userIds.push(uid);
        const name = userNames[index] || userName || uid;
        if (name && !acc[emoji].userNames.includes(name)) {
          acc[emoji].userNames.push(name);
        }
      }
    });
    
    // If we have a single userName, add it
    if (userName && !acc[emoji].userNames.includes(userName)) {
      acc[emoji].userNames.push(userName);
    }
    
    return acc;
  }, {} as Record<string, { userIds: string[]; userNames: string[] }>);

  // Get reply sender name
  const getReplySenderName = (replyToMessage: Message) => {
    if (replyToMessage.senderId === currentUserId) {
      return dir === 'rtl' ? 'نفسك' : 'You';
    }
    const replySender = conversation?.participants?.find(p => p.id === replyToMessage.senderId);
    return replySender?.name || sender.name || replyToMessage.senderId;
  };

  return (
    <div
      id={`message-${message.id}`}
      className={cn(
        'flex gap-2 sm:gap-3 group w-full min-w-0 touch-manipulation',
        isCurrentUser ? 'flex-row-reverse' : 'flex-row'
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      onTouchStart={(e) => {
        e.stopPropagation();
        setShowActions(true);
      }}
      onTouchEnd={(e) => {
        e.stopPropagation();
        setTimeout(() => setShowActions(false), 3000);
      }}
      onClick={(e) => {
        e.stopPropagation();
        setShowActions(!showActions);
      }}
      style={{
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation'
      }}
    >
      {/* Avatar - Always visible and clear - Mobile responsive */}
      <div className={cn(
        "relative flex-shrink-0",
        isPremiumSubscriber 
          ? "w-7 h-7 sm:w-9 sm:h-9" // أصغر للدردشة المميزة
          : "w-8 h-8 sm:w-10 sm:h-10" // الحجم العادي
      )}>
        {isPremiumSubscriber && (sender as any).customNameStyle ? (
          <PremiumUserFrame 
            user={sender as any}
            size="small"
            showRank={false}
          />
        ) : (
          <>
            {isPremiumSubscriber && (sender as any).frameConfig ? (
              <AnimatedFrame
                frameConfig={(sender as any).frameConfig as FrameConfig}
                size="medium"
              >
                <Avatar className={cn(
                  "w-full h-full border-2 relative z-10",
                  "border-background/80 shadow-lg"
                )}>
                  <AvatarImage src={sender.avatar} />
                  <AvatarFallback className="bg-gradient-to-br from-yellow-500/20 to-amber-500/20">
                    {sender.name[0]}
                  </AvatarFallback>
                </Avatar>
              </AnimatedFrame>
            ) : isPremiumSubscriber ? (
              <AnimatedDecorations type="premium" intensity="medium" className="rounded-full">
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-500 animate-pulse opacity-60" />
                <Avatar className={cn(
                  "w-full h-full border-2 relative z-10",
                  "border-yellow-500/50 shadow-lg premium-avatar-glow bg-background"
                )}>
                  <AvatarImage src={sender.avatar} />
                  <AvatarFallback className="bg-gradient-to-br from-yellow-500/20 to-amber-500/20">
                    {sender.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -top-1 -right-1 z-20">
                  <div className="relative">
                    <Crown className="w-4 h-4 text-yellow-500 animate-bounce-slow premium-crown-badge" />
                    <div className="absolute inset-0 bg-yellow-400/30 rounded-full blur-sm animate-pulse" />
                  </div>
                </div>
              </AnimatedDecorations>
            ) : (
              <>
                <Avatar className={cn(
                  "w-10 h-10 border-2 relative z-10 shadow-md",
                  "border-background/80 bg-background"
                )}>
                  <AvatarImage src={sender.avatar} />
                  <AvatarFallback className="bg-muted">
                    {sender.name[0]}
                  </AvatarFallback>
                </Avatar>
              </>
            )}
          </>
        )}
      </div>

      <div className={cn('flex flex-col gap-1 max-w-[85%] sm:max-w-[75%] md:max-w-[70%] min-w-0 flex-1', isCurrentUser && 'items-end')}>
        {/* Sender Name - Show for messages from others - Mobile responsive */}
        {!isCurrentUser && (
          <div className={cn(
            "flex items-center gap-1 sm:gap-2 mb-0.5 sm:mb-1",
            dir === 'rtl' ? 'flex-row-reverse' : ''
          )}>
            <span className={cn(
              "font-semibold text-foreground truncate",
              isPremiumSubscriber 
                ? "text-[9px] sm:text-[10px]" // أصغر للدردشة المميزة
                : "text-[10px] sm:text-xs" // الحجم العادي
            )}>
              {sender.name}
            </span>
            <span className={cn(
              "text-muted-foreground flex-shrink-0",
              isPremiumSubscriber 
                ? "text-[9px] sm:text-[10px]" // أصغر للدردشة المميزة
                : "text-[10px] sm:text-xs" // الحجم العادي
            )}>
              {format(message.timestamp, 'HH:mm')}
            </span>
          </div>
        )}
        
        {/* Time - For current user's messages - Mobile responsive */}
        {isCurrentUser && (
          <div className="flex items-center justify-end gap-1 sm:gap-2 mb-0.5 sm:mb-1">
            <span className={cn(
              "text-muted-foreground",
              isPremiumSubscriber 
                ? "text-[9px] sm:text-[10px]" // أصغر للدردشة المميزة
                : "text-[10px] sm:text-xs" // الحجم العادي
            )}>
              {format(message.timestamp, 'HH:mm')}
            </span>
          </div>
        )}

        <div className="relative">
          {replyToMessage && (
            <div 
              className={cn(
                'mb-2 p-2.5 rounded-lg border-l-4 bg-background dark:bg-gray-800 border border-border hover:bg-muted transition-colors cursor-pointer touch-manipulation',
                dir === 'rtl' && 'border-l-0 border-r-4'
              )}
              style={isCurrentUser ? { 
                borderLeftColor: `hsl(var(--chat-reply-border))`,
                borderRightColor: dir === 'rtl' ? `hsl(var(--chat-reply-border))` : undefined,
                opacity: 1
              } : {
                opacity: 1
              }}
              onClick={() => {
                // Scroll to the replied message
                const element = document.getElementById(`message-${replyToMessage.id}`);
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  element.classList.add('animate-pulse');
                  setTimeout(() => element.classList.remove('animate-pulse'), 2000);
                }
              }}
            >
              <div className="flex items-start gap-2">
                <div 
                  className="w-0.5 h-full rounded-full"
                  style={{ 
                    backgroundColor: isCurrentUser 
                      ? `hsl(var(--chat-reply-border))` 
                      : `hsl(262 83% 58%)` 
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "font-semibold text-foreground mb-0.5",
                    isPremiumSubscriber 
                      ? "text-[9px] sm:text-[10px]" // أصغر للدردشة المميزة
                      : "text-xs" // الحجم العادي
                  )}>
                    {t('chat.replyTo')} {getReplySenderName(replyToMessage)}
                  </p>
                  <p className={cn(
                    'truncate',
                    isCurrentUser ? 'text-white/80' : 'text-muted-foreground',
                    isPremiumSubscriber 
                      ? "text-[9px] sm:text-[10px]" // أصغر للدردشة المميزة
                      : "text-xs" // الحجم العادي
                  )}>
                    {replyToMessage.content}
                  </p>
                </div>
              </div>
            </div>
          )}

                <div className="flex items-end gap-1 sm:gap-2 min-w-0 flex-1">
                  <div
                    className={cn(
                      'rounded-xl sm:rounded-2xl shadow-lg message-bubble-transition message-bubble-hover',
                      'max-w-[85%] sm:max-w-[75%] md:max-w-[70%] min-w-0',
                      isCurrentUser 
                        ? 'text-white' 
                        : 'bg-background dark:bg-card border-2 border-border/80',
                      isPremiumSubscriber 
                        ? 'px-2 py-1 sm:px-3 sm:py-2' // أصغر padding للدردشة المميزة
                        : 'px-2.5 py-1.5 sm:px-4 sm:py-3' // الحجم العادي
                    )}
                    style={isCurrentUser ? {
                      background: `linear-gradient(to bottom right, hsl(var(--chat-from)), hsl(var(--chat-to)))`,
                      opacity: 1
                    } : {
                      backgroundColor: 'hsl(var(--background))',
                      opacity: 1
                    }}
                  >
                    {/* Attachments Display - عرض المرفقات بشكل واضح */}
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="space-y-2 mb-2">
                        {message.attachments.map((attachment) => {
                          if (attachment.type === 'image') {
                            return (
                              <div key={attachment.id} className="relative rounded-lg overflow-hidden max-w-full">
                                <img 
                                  src={attachment.url} 
                                  alt={attachment.name || 'Image'} 
                                  className="max-w-full h-auto rounded-lg object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                  onClick={() => window.open(attachment.url, '_blank')}
                                  style={{ maxHeight: '300px' }}
                                />
                              </div>
                            );
                          }
                          if (attachment.type === 'audio' || (attachment as any).type === 'voice') {
                            return (
                              <div key={attachment.id} className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="ghost"
                                  className="rounded-full h-12 w-12 sm:h-10 sm:w-10 touch-manipulation min-h-[44px] min-w-[44px]"
                                  onClick={() => {
                                    const audio = new Audio(attachment.url);
                                    audio.play();
                                  }}
                                  style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
                                >
                                  <Play className="w-6 h-6 sm:w-5 sm:h-5" />
                                </Button>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium truncate">
                                    {attachment.name || (dir === 'rtl' ? 'رسالة صوتية' : 'Voice Message')}
                                  </p>
                                  {attachment.size && (
                                    <p className="text-[10px] text-muted-foreground">
                                      {(attachment.size / 1024).toFixed(1)} KB
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          }
                          if (attachment.type === 'file') {
                            return (
                              <div key={attachment.id} className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                                <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium truncate">
                                    {attachment.name || (dir === 'rtl' ? 'مستند' : 'Document')}
                                  </p>
                                  {attachment.size && (
                                    <p className="text-[10px] text-muted-foreground">
                                      {(attachment.size / 1024).toFixed(1)} KB
                                    </p>
                                  )}
                                </div>
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="ghost"
                                  className="h-10 w-10 sm:h-8 sm:w-8 touch-manipulation min-h-[44px] min-w-[44px]"
                                  onClick={() => window.open(attachment.url, '_blank')}
                                  style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
                                >
                                  <Download className="w-5 h-5 sm:w-4 sm:h-4" />
                                </Button>
                              </div>
                            );
                          }
                          if ((attachment as any).type === 'location') {
                            const locationData = (attachment as any).data || {};
                            return (
                              <div key={attachment.id} className="relative rounded-lg overflow-hidden border border-border">
                                <a 
                                  href={attachment.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="block"
                                >
                                  <div className="relative h-32 bg-muted flex items-center justify-center">
                                    <MapPin className="w-8 h-8 text-primary" />
                                  </div>
                                  <div className="p-2 bg-muted/50">
                                    <p className="text-xs font-medium truncate">
                                      {attachment.name || (dir === 'rtl' ? 'موقعي' : 'My Location')}
                                    </p>
                                    {locationData.latitude && locationData.longitude && (
                                      <p className="text-[10px] text-muted-foreground">
                                        {locationData.latitude.toFixed(6)}, {locationData.longitude.toFixed(6)}
                                      </p>
                                    )}
                                  </div>
                                </a>
                              </div>
                            );
                          }
                          return null;
                        })}
                      </div>
                    )}
                    
                    {/* Message Content */}
                    {message.content && (
                      <p className={cn(
                        "leading-relaxed break-words font-medium min-w-0",
                        isPremiumSubscriber 
                          ? "text-[10px] sm:text-xs" // أصغر للدردشة المميزة
                          : "text-xs sm:text-sm" // الحجم العادي للدردشة العادية
                      )} dir={dir} style={{ opacity: 1, wordBreak: 'break-word', overflowWrap: 'break-word', hyphens: 'auto' }}>{message.content}</p>
                    )}
                  </div>
                  
                  {/* Name and Badge - On the right side of message */}
                  {!isCurrentUser && (
                    <div className={cn(
                      'flex flex-col items-center gap-1',
                      dir === 'rtl' ? 'items-start' : 'items-end'
                    )}>
                      <div className="flex items-center gap-1.5">
                        {isPremiumSubscriber && (sender as any).nameEffect ? (
                          <AnimatedName
                            name={sender.name}
                            effect={(sender as any).nameEffect as NameEffectConfig}
                            size="sm"
                          />
                        ) : isPremiumSubscriber ? (
                          <LuxuryNameFrame
                            name={sender.name}
                            frameStyle="premium-gold"
                            size="small"
                            animated={true}
                            glow={true}
                          />
                        ) : (
                          <span className="text-xs font-semibold text-foreground">{sender.name}</span>
                        )}
                        {isPremiumSubscriber && (
                          <PremiumBadge 
                            text={dir === 'rtl' ? 'مميز' : 'Premium'}
                            size="sm"
                            variant="gold"
                            animated={true}
                          />
                        )}
                      </div>
                    </div>
                  )}
                  {isCurrentUser && isPremiumSubscriber && (
                    <div className={cn(
                      'flex flex-col items-center gap-1',
                      dir === 'rtl' ? 'items-start' : 'items-end'
                    )}>
                      <PremiumBadge 
                        text={dir === 'rtl' ? 'مميز' : 'Premium'}
                        size="sm"
                        variant="gold"
                        animated={true}
                      />
                    </div>
                  )}
                </div>

          {Object.keys(groupedReactions).length > 0 && (
            <div className={cn(
              'flex gap-1 mt-1 flex-wrap',
              isCurrentUser ? (dir === 'rtl' ? 'justify-start' : 'justify-end') : (dir === 'rtl' ? 'justify-end' : 'justify-start')
            )}>
              {Object.entries(groupedReactions).map(([emoji, data]) => {
                const hasCurrentUserReaction = data.userIds.includes(currentUserId);
                return (
                  <Badge
                    key={emoji}
                    variant={hasCurrentUserReaction ? 'default' : 'secondary'}
                    className={cn(
                      'px-2 py-0.5 text-xs cursor-pointer hover:scale-105 reaction-badge-transition',
                      hasCurrentUserReaction && 'text-white'
                    )}
                    style={hasCurrentUserReaction ? {
                      backgroundColor: `hsl(var(--chat-reaction))`,
                      borderColor: `hsl(var(--chat-reaction))`
                    } : undefined}
                    title={data.userNames.length > 0 ? data.userNames.join(', ') : `${data.userIds.length} ${dir === 'rtl' ? 'مستخدم' : 'users'}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onReact(message.id, emoji);
                    }}
                  >
                    <span className={cn('mr-1', dir === 'rtl' && 'mr-0 ml-1')}>{emoji}</span>
                    <span>{data.userIds.length}</span>
                  </Badge>
                );
              })}
            </div>
          )}

          {showActions && (
            <div className={cn(
              'absolute top-0 flex gap-1',
              isCurrentUser 
                ? (dir === 'rtl' ? 'left-full ml-2' : 'right-full mr-2')
                : (dir === 'rtl' ? 'right-full mr-2' : 'left-full ml-2')
            )}>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="h-9 w-9 sm:h-7 sm:w-7 p-0 shadow-md opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity touch-manipulation min-h-[44px] min-w-[44px]"
                    title={dir === 'rtl' ? 'تفاعل' : 'React'}
                    style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
                  >
                    <Smile className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2">
                  <div className="flex gap-1">
                    {EMOJI_REACTIONS.map((emoji) => (
                      <button
                        type="button"
                        key={emoji}
                        onClick={() => onReact(message.id, emoji)}
                        className="text-xl hover:scale-125 transition-transform p-1"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="h-9 w-9 sm:h-7 sm:w-7 p-0 shadow-md opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity touch-manipulation min-h-[44px] min-w-[44px]"
                    title={dir === 'rtl' ? 'المزيد' : 'More'}
                    style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
                  >
                    <MoreVertical className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={dir === 'rtl' ? 'end' : 'start'}>
                  <DropdownMenuItem onClick={() => onReply(message)}>
                    <Reply className={`w-4 h-4 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                    {t('chat.reply')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigator.clipboard.writeText(message.content)}>
                    <Copy className={`w-4 h-4 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                    {t('chat.copy')}
                  </DropdownMenuItem>
                  {isCurrentUser && (
                    <>
                      <DropdownMenuItem onClick={() => onEdit(message)}>
                        <Edit className={`w-4 h-4 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                        {t('common.edit')}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDelete(message.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className={`w-4 h-4 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                        {t('common.delete')}
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          {renderStatusIcon()}
        </div>
      </div>
    </div>
  );
}
