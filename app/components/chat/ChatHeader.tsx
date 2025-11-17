'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/ui/avatar';
import { Button } from '@/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/ui/dropdown-menu';
import { Search, Phone, Video, MoreVertical, Pin, Archive, Trash2, Users } from 'lucide-react';
import { Conversation, User } from '@/types/chat';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { VoiceCall } from './VoiceCall';
import { VideoCall } from './VideoCall';

interface ChatHeaderProps {
  conversation: Conversation;
  currentUser: User;
}

export function ChatHeader({ conversation, currentUser }: ChatHeaderProps) {
  const { t, dir } = useLanguage();
  const [isVoiceCallOpen, setIsVoiceCallOpen] = useState(false);
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);
  
  // Handle participants - they can be string[] or User[]
  const participants = Array.isArray(conversation.participants) 
    ? conversation.participants 
    : [];
  
  // Find other user - participants might be string IDs or User objects
  const otherUserId = participants.find((p: string | User) => {
    const id = typeof p === 'string' ? p : p.id;
    return id !== currentUser.id;
  });
  
  // For now, we'll use the conversation name or a default
  const isGroup = conversation.isGroup || false;
  const displayName = isGroup ? conversation.name : (typeof otherUserId === 'string' ? otherUserId : otherUserId?.name || conversation.name);
  const displayAvatar = isGroup ? conversation.avatar : (typeof otherUserId === 'string' ? undefined : otherUserId?.avatar || conversation.avatar);
  const participantCount = participants.length;
  
  // For status, we can't determine it from string IDs, so we'll show offline by default
  const isOnline = typeof otherUserId !== 'string' && otherUserId?.status === 'online';

  // Get caller info for calls
  const caller = typeof otherUserId === 'string' 
    ? { id: otherUserId, name: otherUserId, avatar: displayAvatar || '' }
    : { id: otherUserId?.id || '', name: displayName || '', avatar: displayAvatar || '' };

  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-20" dir={dir}>
      <div className="flex items-center justify-between p-2 sm:p-4 min-w-0">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <div className="relative flex-shrink-0">
            <Avatar className="w-9 h-9 sm:w-10 sm:h-10 border-2 border-background">
              <AvatarImage src={displayAvatar} />
              <AvatarFallback className="text-xs sm:text-sm">{displayName?.[0]}</AvatarFallback>
            </Avatar>
            {!isGroup && isOnline && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 border-2 border-background rounded-full" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <h3 className="font-semibold text-sm sm:text-lg truncate">{displayName}</h3>
              {conversation.isPinned && <Pin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" style={{ color: `hsl(var(--primary))` }} />}
            </div>
            {!isGroup ? (
              <p className={cn(
                'text-[10px] sm:text-xs truncate',
                isOnline ? 'text-green-600 font-medium' : 'text-muted-foreground'
              )}>
                {t(`status.${typeof otherUserId !== 'string' && otherUserId?.status ? otherUserId.status : 'offline'}`)}
              </p>
            ) : (
              <div className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground">
                <Users className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
                <span className="truncate">{participantCount} {dir === 'rtl' ? 'أعضاء' : 'members'}</span>
              </div>
            )}
          </div>
        </div>

        <div className={`flex items-center gap-1 sm:gap-2 flex-shrink-0 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
          <Button 
            type="button" 
            size="icon" 
            variant="ghost" 
            className="rounded-full h-10 w-10 sm:h-9 sm:w-9 touch-manipulation min-h-[44px] min-w-[44px]" 
            title={t('common.search')}
            style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
          >
            <Search className="w-5 h-5 sm:w-4 sm:h-4" />
          </Button>
          {!isGroup && (
            <>
              <Button 
                type="button" 
                size="icon" 
                variant="ghost" 
                className="rounded-full h-10 w-10 sm:h-9 sm:w-9 touch-manipulation min-h-[44px] min-w-[44px]" 
                title={dir === 'rtl' ? 'مكالمة صوتية' : 'Voice Call'}
                onClick={() => setIsVoiceCallOpen(true)}
                style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
              >
                <Phone className="w-5 h-5 sm:w-4 sm:h-4" />
              </Button>
              <Button 
                type="button" 
                size="icon" 
                variant="ghost" 
                className="rounded-full h-10 w-10 sm:h-9 sm:w-9 touch-manipulation min-h-[44px] min-w-[44px]" 
                title={dir === 'rtl' ? 'مكالمة فيديو' : 'Video Call'}
                onClick={() => setIsVideoCallOpen(true)}
                style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
              >
                <Video className="w-5 h-5 sm:w-4 sm:h-4" />
              </Button>
            </>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                type="button" 
                size="icon" 
                variant="ghost" 
                className="rounded-full h-10 w-10 sm:h-9 sm:w-9 touch-manipulation min-h-[44px] min-w-[44px]" 
                title={dir === 'rtl' ? 'المزيد' : 'More'}
                style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
              >
                <MoreVertical className="w-5 h-5 sm:w-4 sm:h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={dir === 'rtl' ? 'start' : 'end'} className="w-56">
              <DropdownMenuItem>
                <Pin className={`w-4 h-4 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                {conversation.isPinned ? t('actions.unpin') : t('actions.pin')} {dir === 'rtl' ? 'المحادثة' : 'Conversation'}
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Archive className={`w-4 h-4 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                {t('actions.archive')} {dir === 'rtl' ? 'المحادثة' : 'Conversation'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive">
                <Trash2 className={`w-4 h-4 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                {t('common.delete')} {dir === 'rtl' ? 'المحادثة' : 'Conversation'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Voice Call Modal */}
      <VoiceCall
        isOpen={isVoiceCallOpen}
        onClose={() => setIsVoiceCallOpen(false)}
        caller={caller}
        currentUser={{
          id: currentUser.id,
          name: currentUser.name,
          avatar: currentUser.avatar
        }}
        onCallEnd={() => setIsVoiceCallOpen(false)}
      />

      {/* Video Call Modal */}
      <VideoCall
        isOpen={isVideoCallOpen}
        onClose={() => setIsVideoCallOpen(false)}
        caller={caller}
        currentUser={{
          id: currentUser.id,
          name: currentUser.name,
          avatar: currentUser.avatar
        }}
        onCallEnd={() => setIsVideoCallOpen(false)}
      />
    </div>
  );
}
