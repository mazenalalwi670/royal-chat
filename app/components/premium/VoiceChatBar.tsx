'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/ui/avatar';
import { Button } from '@/ui/button';
import { Badge } from '@/ui/badge';
import { Mic, MicOff, Volume2, VolumeX, Users, Crown } from 'lucide-react';
import { User } from '@/types/chat';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface VoiceChatBarProps {
  participants: User[];
  currentUser: User;
  isMuted: boolean;
  isDeafened: boolean;
  onToggleMute: () => void;
  onToggleDeafen: () => void;
  speakingUsers: string[]; // Array of user IDs who are currently speaking
}

export function VoiceChatBar({
  participants,
  currentUser,
  isMuted,
  isDeafened,
  onToggleMute,
  onToggleDeafen,
  speakingUsers
}: VoiceChatBarProps) {
  const { dir } = useLanguage();
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Get active speakers (currently speaking)
  const activeSpeakers = participants.filter(p => speakingUsers.includes(p.id));

  return (
    <Card className="border-b rounded-none bg-gradient-to-r from-primary/5 via-background to-primary/5 animate-slide-in-down" dir={dir}>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Users className="w-5 h-5 text-primary animate-pulse" />
              <div className="absolute -inset-1 bg-primary/20 rounded-full blur animate-pulse" />
            </div>
            <span className="font-semibold text-sm animate-gradient" style={{ color: `hsl(var(--primary))` }}>
              {dir === 'rtl' ? 'التحدث الصوتي' : 'Voice Chat'}
            </span>
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 animate-fade-in-scale">
              {participants.length} {dir === 'rtl' ? 'مشارك' : 'participants'}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant={isMuted ? 'destructive' : 'default'}
              onClick={onToggleMute}
              className={cn(
                'rounded-full transition-all duration-300 hover:scale-110',
                isMuted ? 'bg-red-500 hover:bg-red-600 shadow-lg' : 'bg-primary hover:bg-primary/90 shadow-lg'
              )}
              style={!isMuted ? {
                background: `linear-gradient(135deg, hsl(var(--chat-from)), hsl(var(--chat-to)))`
              } : undefined}
              title={isMuted ? (dir === 'rtl' ? 'فك كتم الصوت' : 'Unmute') : (dir === 'rtl' ? 'كتم الصوت' : 'Mute')}
            >
              {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
            <Button
              type="button"
              size="sm"
              variant={isDeafened ? 'destructive' : 'outline'}
              onClick={onToggleDeafen}
              className={cn(
                'rounded-full transition-all duration-300 hover:scale-110',
                isDeafened && 'bg-red-500 hover:bg-red-600 border-red-500 shadow-lg'
              )}
              title={isDeafened ? (dir === 'rtl' ? 'فك كتم الصوت' : 'Undeafen') : (dir === 'rtl' ? 'كتم الصوت' : 'Deafen')}
            >
              {isDeafened ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Active Speakers */}
        {activeSpeakers.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-medium text-muted-foreground">
                {dir === 'rtl' ? 'المتحدثون الآن' : 'Speaking Now'}
              </span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {activeSpeakers.map((speaker) => (
                <div
                  key={speaker.id}
                  className={cn(
                    'flex flex-col items-center gap-2 min-w-[80px] relative',
                    'transform transition-all duration-300',
                    speakingUsers.includes(speaker.id) && 'scale-105'
                  )}
                >
                  <div className="relative">
                    {/* Fancy Frame */}
                    <div
                      className={cn(
                        'absolute -inset-1 rounded-full',
                        'bg-gradient-to-r from-primary via-primary/80 to-primary',
                        'animate-pulse shadow-lg',
                        'border-4 border-background'
                      )}
                      style={{
                        background: `linear-gradient(135deg, hsl(var(--chat-from)), hsl(var(--chat-to)))`
                      }}
                    />
                    <div className="relative">
                      <Avatar className="w-16 h-16 border-4 border-background shadow-xl">
                        <AvatarImage src={speaker.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-white text-lg font-bold">
                          {speaker.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      {/* Speaking Indicator */}
                      {speakingUsers.includes(speaker.id) && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-background flex items-center justify-center animate-pulse">
                          <Mic className="w-3 h-3 text-white" />
                        </div>
                      )}
                      {/* Premium Subscriber Badge */}
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-20">
                        <Badge 
                          variant="secondary" 
                          className={cn(
                            "bg-gradient-to-r from-yellow-500/30 via-amber-500/30 to-yellow-500/30",
                            "border-yellow-500/50 text-yellow-600 dark:text-yellow-400",
                            "px-1.5 py-0.5 text-[10px] font-semibold",
                            "animate-pulse shadow-lg premium-badge-glow"
                          )}
                        >
                          <Crown className="w-3 h-3 mr-0.5 animate-bounce-slow" />
                          {dir === 'rtl' ? 'مميز' : 'Premium'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold truncate max-w-[80px]" title={speaker.name}>
                      {speaker.id === currentUser.id ? (dir === 'rtl' ? 'أنت' : 'You') : speaker.name}
                    </p>
                    {speakingUsers.includes(speaker.id) && (
                      <div className="flex items-center justify-center gap-1 mt-1">
                        <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-xs text-green-500 font-medium">
                          {dir === 'rtl' ? 'يتحدث' : 'Speaking'}
                        </span>
                      </div>
                    )}
                  </div>
                  {/* Enhanced Audio Wave Animation */}
                  {speakingUsers.includes(speaker.id) && (
                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex gap-1.5 items-end h-5">
                      <div 
                        className="w-1.5 bg-primary rounded-full audio-wave-bar shadow-md" 
                        style={{ 
                          animationDelay: '0s',
                          background: `linear-gradient(to top, hsl(var(--chat-from)), hsl(var(--chat-to)))`
                        }} 
                      />
                      <div 
                        className="w-1.5 bg-primary rounded-full audio-wave-bar shadow-md" 
                        style={{ 
                          animationDelay: '0.15s',
                          background: `linear-gradient(to top, hsl(var(--chat-from)), hsl(var(--chat-to)))`
                        }} 
                      />
                      <div 
                        className="w-1.5 bg-primary rounded-full audio-wave-bar shadow-md" 
                        style={{ 
                          animationDelay: '0.3s',
                          background: `linear-gradient(to top, hsl(var(--chat-from)), hsl(var(--chat-to)))`
                        }} 
                      />
                      <div 
                        className="w-1.5 bg-primary rounded-full audio-wave-bar shadow-md" 
                        style={{ 
                          animationDelay: '0.45s',
                          background: `linear-gradient(to top, hsl(var(--chat-from)), hsl(var(--chat-to)))`
                        }} 
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Participants */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            {dir === 'rtl' ? 'جميع المشاركين' : 'All Participants'}:
          </span>
          <div className="flex -space-x-2 flex-1 overflow-x-auto pb-2 scrollbar-hide">
            {participants.map((participant, index) => (
              <div
                key={participant.id}
                className={cn(
                  'relative transition-all duration-300 hover:scale-125 cursor-pointer',
                  speakingUsers.includes(participant.id) && 'scale-110 z-10 animate-pulse'
                )}
                title={participant.name}
                style={{
                  animationDelay: `${index * 0.05}s`
                }}
              >
                {/* Enhanced Fancy Frame for all participants */}
                <div
                  className={cn(
                    'absolute -inset-1 rounded-full transition-all duration-300',
                    speakingUsers.includes(participant.id)
                      ? 'bg-gradient-to-r from-primary via-primary/80 to-primary shadow-lg shadow-primary/50 animate-pulse'
                      : 'bg-gradient-to-r from-muted to-muted/80 border-2 border-background shadow-md'
                  )}
                  style={
                    speakingUsers.includes(participant.id)
                      ? {
                          background: `linear-gradient(135deg, hsl(var(--chat-from)), hsl(var(--chat-to)))`,
                          filter: 'blur(2px)'
                        }
                      : undefined
                  }
                />
                <Avatar className="w-12 h-12 border-3 border-background relative z-10 shadow-xl">
                  <AvatarImage src={participant.avatar} className="object-cover" />
                  <AvatarFallback 
                    className={cn(
                      'text-sm font-bold',
                      speakingUsers.includes(participant.id)
                        ? 'bg-gradient-to-br from-primary to-primary/60 text-white'
                        : 'bg-gradient-to-br from-primary/20 to-primary/10 text-foreground'
                    )}
                    style={
                      speakingUsers.includes(participant.id)
                        ? {
                            background: `linear-gradient(135deg, hsl(var(--chat-from)), hsl(var(--chat-to)))`
                          }
                        : undefined
                    }
                  >
                    {participant.name[0]}
                  </AvatarFallback>
                </Avatar>
                {/* Online Status with Pulse */}
                {participant.status === 'online' && (
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-background z-20 shadow-lg animate-pulse" />
                )}
                {/* Enhanced Speaking Indicator */}
                {speakingUsers.includes(participant.id) && (
                  <>
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-background flex items-center justify-center z-20 animate-pulse shadow-lg">
                      <Mic className="w-2.5 h-2.5 text-white" />
                    </div>
                    {/* Outer Pulse Ring */}
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500/50 rounded-full border-2 border-background z-10 animate-ping" />
                  </>
                )}
                {/* Premium Subscriber Badge */}
                {!speakingUsers.includes(participant.id) && (
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 z-20">
                    <Badge 
                      variant="secondary" 
                      className={cn(
                        "bg-gradient-to-r from-yellow-500/30 via-amber-500/30 to-yellow-500/30",
                        "border-yellow-500/50 text-yellow-600 dark:text-yellow-400",
                        "px-1 py-0.5 text-[9px] font-semibold",
                        "shadow-md premium-badge-glow"
                      )}
                    >
                      <Crown className="w-2.5 h-2.5 animate-bounce-slow" />
                    </Badge>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

