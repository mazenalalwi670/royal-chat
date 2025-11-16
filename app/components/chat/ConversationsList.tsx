'use client';

import { useState } from 'react';
import { Card } from '@/ui/card';
import { ScrollArea } from '@/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/ui/avatar';
import { Badge } from '@/ui/badge';
import { Input } from '@/ui/input';
import { Pin, Search, Crown } from 'lucide-react';
import { Conversation } from '@/types/chat';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface ConversationsListProps {
  conversations: Conversation[];
  selectedId?: string;
  onSelect: (conversationId: string) => void;
}

export function ConversationsList({ conversations, selectedId, onSelect }: ConversationsListProps) {
  const { t, dir } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter(conv => {
    const name = conv.type === 'group' ? conv.name : conv.participants.find(p => p.id !== 'user-1')?.name;
    return name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getConversationName = (conv: Conversation) => {
    if (conv.type === 'group') return conv.name || (dir === 'rtl' ? 'مجموعة' : 'Group');
    return conv.participants.find(p => p.id !== 'user-1')?.name || (dir === 'rtl' ? 'غير معروف' : 'Unknown');
  };

  const getConversationAvatar = (conv: Conversation) => {
    if (conv.type === 'group') return conv.avatar;
    return conv.participants.find(p => p.id !== 'user-1')?.avatar;
  };

  return (
    <Card className="flex flex-col h-full border-r rounded-none" dir={dir}>
      <div className="p-4 border-b space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="w-6 h-6" style={{ color: `hsl(var(--primary))` }} />
            <h2 className="text-2xl font-bold" style={{
              color: `hsl(var(--primary))`
            }}>
              Royal Chat
            </h2>
          </div>
        </div>
        <div className="relative">
          <Search className={`absolute ${dir === 'rtl' ? 'right' : 'left'}-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground`} />
          <Input
            placeholder={t('chat.search')}
            dir={dir}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={dir === 'rtl' ? 'pr-10' : 'pl-10'} 
            style={{ backgroundColor: 'var(--muted)' }}
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredConversations.map((conv) => {
            const otherUser = conv.participants.find(p => p.id !== 'user-1');
            const isOnline = otherUser?.status === 'online';

            return (
              <button
                type="button"
                key={conv.id}
                onClick={() => onSelect(conv.id)}
                className={cn(
                  'w-full p-3 rounded-lg mb-1 transition-all duration-200 hover:bg-accent',
                  selectedId === conv.id && 'bg-accent shadow-sm'
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <Avatar className="w-12 h-12 border-2 border-background">
                      <AvatarImage src={getConversationAvatar(conv)} />
                      <AvatarFallback>{getConversationName(conv)[0]}</AvatarFallback>
                    </Avatar>
                    {conv.type === 'direct' && isOnline && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 text-right">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm truncate">
                          {getConversationName(conv)}
                        </span>
                        {conv.pinned && <Pin className="w-3 h-3" style={{ color: `hsl(var(--primary))` }} />}
                      </div>
                      {conv.lastMessage && (
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(conv.lastMessage.timestamp, { addSuffix: false })}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground truncate">
                        {conv.lastMessage?.content || t('chat.noMessages')}
                      </p>
                      {conv.unreadCount > 0 && (
                        <Badge className={dir === 'rtl' ? 'mr-2' : 'ml-2'} style={{ backgroundColor: `hsl(var(--primary))`, color: 'white' }}>
                          {conv.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </Card>
  );
}
