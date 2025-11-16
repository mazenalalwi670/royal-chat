'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/ui/avatar';
import { Badge } from '@/ui/badge';
import { Crown, Hand } from 'lucide-react';
import { User } from '@/types/chat';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { PremiumUserFrame } from './PremiumUserFrame';

interface PremiumUserCardProps {
  user: User & { 
    isPremiumSubscriber?: boolean; 
    rank?: number; 
    customNameStyle?: any; 
    selectedFrame?: any; 
    statusMessage?: string; 
    backgroundImage?: string;
    backgroundGradient?: string;
  };
  onReaction?: (userId: string, reaction: string) => void;
  onHandRaise?: (userId: string) => void;
}

const getRankBadge = (rank: number) => {
  if (rank === 1) {
    return {
      icon: '🥇',
      color: 'from-yellow-400 via-yellow-500 to-yellow-600',
      borderColor: 'border-yellow-500',
      textColor: 'text-yellow-400',
      glow: 'shadow-[0_0_20px_rgba(255,215,0,0.6)]'
    };
  } else if (rank === 2) {
    return {
      icon: '🥈',
      color: 'from-gray-300 via-gray-400 to-gray-500',
      borderColor: 'border-gray-400',
      textColor: 'text-gray-300',
      glow: 'shadow-[0_0_15px_rgba(192,192,192,0.5)]'
    };
  } else if (rank === 3) {
    return {
      icon: '🥉',
      color: 'from-amber-600 via-amber-700 to-amber-800',
      borderColor: 'border-amber-600',
      textColor: 'text-amber-600',
      glow: 'shadow-[0_0_15px_rgba(217,119,6,0.5)]'
    };
  } else {
    return {
      icon: rank.toString(),
      color: 'from-purple-400 via-purple-500 to-purple-600',
      borderColor: 'border-purple-500',
      textColor: 'text-purple-400',
      glow: 'shadow-[0_0_10px_rgba(168,85,247,0.4)]'
    };
  };
};

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

export function PremiumUserCard({ user, onReaction, onHandRaise }: PremiumUserCardProps) {
  const { dir } = useLanguage();
  const rank = user.rank || 999;
  const rankBadge = getRankBadge(rank);
  const backgroundGradient = user.backgroundGradient || getBackgroundGradient(rank - 1);

  const getDisplayName = () => {
    if (user.customNameStyle) {
      const fontStyles = {
        royal: 'font-serif font-bold tracking-wider',
        elegant: 'font-sans font-light tracking-wide italic',
        bold: 'font-bold tracking-tight',
        cursive: 'font-serif italic'
      };
      const colorStyles = {
        gold: 'text-yellow-400',
        silver: 'text-gray-300',
        bronze: 'text-amber-600',
        platinum: 'text-white',
        rainbow: 'bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 bg-clip-text text-transparent animate-gradient'
      };
      
      let name = user.name;
      if (user.customNameStyle.decoration === 'crown') {
        name = `👑 ${name}`;
      } else if (user.customNameStyle.decoration === 'star') {
        name = `⭐ ${name}`;
      } else if (user.customNameStyle.decoration === 'sparkles') {
        name = `✨ ${name} ✨`;
      }

      return (
        <span className={cn(
          fontStyles[user.customNameStyle.fontFamily as keyof typeof fontStyles] || fontStyles.royal,
          colorStyles[user.customNameStyle.color as keyof typeof colorStyles] || colorStyles.gold,
          user.customNameStyle.glow && 'drop-shadow-[0_0_10px_currentColor]',
          user.customNameStyle.animated && 'animate-pulse'
        )}>
          {name}
        </span>
      );
    }
    return <span className="font-bold text-white">{user.name}</span>;
  };

  return (
    <div className={cn(
      "relative rounded-xl overflow-hidden border-2 transition-all duration-300",
      "hover:scale-[1.02] hover:shadow-2xl cursor-pointer group",
      `bg-gradient-to-br ${backgroundGradient}`,
      rankBadge.borderColor,
      "premium-user-card"
    )}>
      {/* Background Image Overlay */}
      {user.backgroundImage && (
        <div className="absolute inset-0 opacity-20">
          <img 
            src={user.backgroundImage} 
            alt="Background" 
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Decorative Pattern Overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:20px_20px]" />
      </div>

      {/* Content */}
      <div className="relative p-4 flex items-center gap-4">
        {/* Profile Picture with Golden Frame */}
        <div className="relative flex-shrink-0">
          {user.isPremiumSubscriber && user.selectedFrame ? (
            <div className="relative">
              <PremiumUserFrame 
                user={user}
                size="medium"
                showRank={false}
              />
            </div>
          ) : (
            <div className="relative">
              {/* Golden Frame Decoration */}
              <div className={cn(
                "absolute -inset-2 rounded-full",
                "bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500",
                "animate-pulse-slow premium-golden-frame",
                rankBadge.glow
              )}>
                <div className="absolute inset-0.5 rounded-full bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-300 opacity-50" />
              </div>
              
              {/* Crown Top Decoration */}
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-10">
                <div className="relative">
                  <Crown className="w-6 h-6 text-yellow-400 animate-bounce-slow" />
                  <div className="absolute inset-0 bg-yellow-400/30 rounded-full blur-md animate-pulse" />
                </div>
              </div>

              {/* Avatar */}
              <div className="relative z-10">
                <Avatar className="w-20 h-20 border-4 border-background shadow-xl">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="bg-gradient-to-br from-yellow-500/20 to-amber-500/20 text-white text-xl font-bold">
                    {user.name[0]}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Wings Decoration */}
              <div className="absolute -left-8 top-1/2 transform -translate-y-1/2 text-yellow-400/30 text-4xl animate-float-slow">
                ✨
              </div>
              <div className="absolute -right-8 top-1/2 transform -translate-y-1/2 text-yellow-400/30 text-4xl animate-float-slow" style={{ animationDelay: '0.5s' }}>
                ✨
              </div>
            </div>
          )}

          {/* Rank Badge */}
          <div className={cn(
            "absolute -bottom-2 -right-2 z-20",
            "w-10 h-10 rounded-full flex items-center justify-center",
            "border-2 border-background shadow-xl",
            `bg-gradient-to-br ${rankBadge.color}`,
            rankBadge.glow,
            "premium-rank-badge"
          )}>
            <span className="text-white font-bold text-sm">{rankBadge.icon}</span>
          </div>

          {/* Royal Chat Label */}
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 z-10 whitespace-nowrap">
            <span className="text-xs font-serif text-white drop-shadow-lg tracking-wider">
              {dir === 'rtl' ? 'شات ملكي' : 'Royal Chat'}
            </span>
          </div>
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            {getDisplayName()}
            {user.isPremiumSubscriber && (
              <Badge className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white border-0 text-[10px] px-1.5 py-0.5 animate-pulse">
                <Crown className="w-2.5 h-2.5 mr-0.5" />
                VIP
              </Badge>
            )}
          </div>
          {user.statusMessage && (
            <p className="text-xs text-white/80 line-clamp-2 drop-shadow-md">
              {user.statusMessage}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col items-center gap-2 flex-shrink-0">
          {/* Hand Raise */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onHandRaise?.(user.id);
            }}
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center",
              "bg-white/20 hover:bg-white/30 backdrop-blur-sm",
              "transition-all duration-300 hover:scale-110",
              "border border-white/30"
            )}
          >
            <Hand className="w-4 h-4 text-white" />
          </button>

          {/* VIP Crown Icon */}
          {user.isPremiumSubscriber && (
            <div className="relative">
              <Crown className="w-6 h-6 text-yellow-400 animate-pulse" />
              <div className="absolute inset-0 bg-yellow-400/30 rounded-full blur-sm animate-pulse" />
            </div>
          )}
        </div>
      </div>

      {/* Hover Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      
      {/* Corner Decorations */}
      <div className="absolute top-2 right-2 text-yellow-400/20 text-2xl animate-float-slow">✨</div>
      <div className="absolute bottom-2 left-2 text-yellow-400/20 text-2xl animate-float-slow" style={{ animationDelay: '1s' }}>⭐</div>
    </div>
  );
}

