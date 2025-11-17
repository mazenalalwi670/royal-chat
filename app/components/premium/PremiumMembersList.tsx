'use client';

import { useState } from 'react';
import { ScrollArea } from '@/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/ui/avatar';
import { Badge } from '@/ui/badge';
import { Button } from '@/ui/button';
import { Crown, Hand, Star, Sparkles, Heart, Smile, Laugh, HeartHandshake, Sparkles as SparklesIcon } from 'lucide-react';
import { User } from '@/types/chat';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { PremiumUserFrame } from './PremiumUserFrame';
import { PremiumUserCard } from './PremiumUserCard';

interface PremiumMembersListProps {
  members: (User & { isPremiumSubscriber?: boolean; rank?: number; customNameStyle?: any; selectedFrame?: any; statusMessage?: string; backgroundImage?: string })[];
  currentUserId: string;
  onMemberClick?: (member: User) => void;
}

const reactionIcons = [
  { icon: Heart, color: 'text-red-500', emoji: '❤️' },
  { icon: Smile, color: 'text-yellow-500', emoji: '😊' },
  { icon: Laugh, color: 'text-green-500', emoji: '😂' },
  { icon: HeartHandshake, color: 'text-pink-500', emoji: '😘' },
  { icon: Sparkles, color: 'text-purple-500', emoji: '🦋' },
  { icon: Star, color: 'text-orange-500', emoji: '🙈' }
];

const getBackgroundGradient = (index: number) => {
  const gradients = [
    'from-gray-800 via-gray-900 to-gray-800',
    'from-gray-800 via-gray-900 to-gray-800',
    'from-orange-600 via-orange-700 to-orange-800',
    'from-purple-600 via-purple-700 to-purple-800',
    'from-gray-800 via-gray-900 to-gray-800',
    'from-green-600 via-green-700 to-green-800',
    'from-blue-600 via-blue-700 to-blue-800',
    'from-blue-600 via-blue-700 to-blue-800'
  ];
  return gradients[index % gradients.length];
};

export function PremiumMembersList({
  members,
  currentUserId,
  onMemberClick
}: PremiumMembersListProps) {
  const { dir } = useLanguage();
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [memberReactions, setMemberReactions] = useState<Map<string, string>>(new Map());

  const handleReaction = (memberId: string, reaction: string) => {
    setMemberReactions(prev => {
      const newMap = new Map(prev);
      if (newMap.get(memberId) === reaction) {
        newMap.delete(memberId);
      } else {
        newMap.set(memberId, reaction);
      }
      return newMap;
    });
  };

  const sortedMembers = [...members].sort((a, b) => {
    const rankA = a.rank || 999;
    const rankB = b.rank || 999;
    return rankA - rankB;
  });

  return (
    <div className="flex flex-col h-full" dir={dir}>
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-pink-500/10 via-background to-pink-500/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-pink-500/30 rounded-full blur-lg animate-pulse" />
              <div className="relative w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h3 className="font-bold text-lg">
                {dir === 'rtl' ? 'المشتركين المميزين' : 'Premium Members'}
              </h3>
              <p className="text-xs text-muted-foreground">
                {members.length} {dir === 'rtl' ? 'مشترك نشط' : 'active members'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Members List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {sortedMembers.map((member, index) => {
            const rank = member.rank || index + 1;
            const backgroundGradient = getBackgroundGradient(index);

            return (
              <PremiumUserCard
                key={member.id}
                user={{
                  ...member,
                  rank,
                  backgroundGradient
                }}
                onHandRaise={(userId) => {
                  handleReaction(userId, 'hand');
                }}
                onReaction={(userId, reaction) => {
                  handleReaction(userId, reaction);
                }}
              />
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

