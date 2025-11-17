'use client';

import { User } from '@/types/chat';
import { Avatar, AvatarFallback, AvatarImage } from '@/ui/avatar';
import { Badge } from '@/ui/badge';
import { Card } from '@/ui/card';
import { Crown, Zap, TrendingUp, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface GoldenUserCardProps {
  user: User;
  showPoints?: boolean;
  showLevel?: boolean;
  size?: 'small' | 'medium' | 'large';
  onClick?: () => void;
}

export function GoldenUserCard({ 
  user, 
  showPoints = true, 
  showLevel = true,
  size = 'medium',
  onClick 
}: GoldenUserCardProps) {
  const { dir } = useLanguage();

  const sizeClasses = {
    small: 'p-2',
    medium: 'p-4',
    large: 'p-6'
  };

  const avatarSizes = {
    small: 'w-10 h-10',
    medium: 'w-16 h-16',
    large: 'w-24 h-24'
  };

  const rankColor = user.userRank?.color || '#FFD700';
  const rankIcon = user.userRank?.icon || '👑';

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-300 hover:scale-105 cursor-pointer",
        "bg-gradient-to-br from-yellow-50 via-amber-50 to-yellow-100 dark:from-yellow-900/20 dark:via-amber-900/20 dark:to-yellow-900/20",
        "border-2 border-yellow-400/50 shadow-lg hover:shadow-xl",
        "golden-user-card",
        sizeClasses[size]
      )}
      onClick={onClick}
      style={{
        borderColor: `${rankColor}80`,
        boxShadow: `0 4px 20px ${rankColor}40`
      }}
      dir={dir}
    >
      {/* Golden Frame Background Effect */}
      {user.goldenFrame && (
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `url(${user.goldenFrame.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
      )}

      {/* Shine Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shine pointer-events-none" />

      <div className="relative z-10 flex items-center gap-3">
        {/* Avatar with Golden Frame */}
        <div className="relative">
          <div
            className={cn(
              "absolute -inset-1 rounded-full animate-pulse",
              "golden-frame-glow"
            )}
            style={{
              background: `linear-gradient(135deg, ${rankColor}, ${rankColor}80, ${rankColor})`,
              filter: 'blur(4px)'
            }}
          />
          <Avatar className={cn(
            "relative z-10 border-2",
            avatarSizes[size],
            "golden-avatar"
          )} style={{ borderColor: rankColor }}>
            <AvatarImage src={user.avatar} />
            <AvatarFallback 
              className="bg-gradient-to-br from-yellow-400 to-amber-500 text-white font-bold"
              style={{
                background: `linear-gradient(135deg, ${rankColor}, ${rankColor}80)`
              }}
            >
              {user.name[0]}
            </AvatarFallback>
          </Avatar>
          
          {/* Rank Badge */}
          {user.userRank && (
            <div
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs border-2 border-background z-20 shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${rankColor}, ${rankColor}80)`
              }}
            >
              {rankIcon}
            </div>
          )}

          {/* Online Status */}
          <div className={cn(
            "absolute top-0 right-0 w-3 h-3 rounded-full border-2 border-background z-20",
            user.status === 'online' && "bg-green-500 animate-pulse",
            user.status === 'offline' && "bg-gray-400",
            user.status === 'away' && "bg-yellow-500",
            user.status === 'busy' && "bg-red-500"
          )} />
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-sm truncate" style={{ color: rankColor }}>
              {user.name}
            </h3>
            {user.isPremiumSubscriber && (
              <Crown className="w-4 h-4 text-yellow-500 animate-bounce-slow" />
            )}
          </div>

          {/* Rank */}
          {user.userRank && (
            <Badge
              variant="secondary"
              className="text-xs px-2 py-0.5 mb-1"
              style={{
                background: `${rankColor}20`,
                color: rankColor,
                borderColor: `${rankColor}40`
              }}
            >
              {dir === 'rtl' ? user.userRank.nameAr : user.userRank.name}
            </Badge>
          )}

          {/* Stats */}
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
            {showLevel && user.level && (
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                <span>Lv.{user.level}</span>
              </div>
            )}
            {showPoints && user.points !== undefined && (
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3" />
                <span>{user.points.toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* Status Message */}
          {user.statusMessage && (
            <p className="text-xs text-muted-foreground truncate mt-1">
              {user.statusMessage}
            </p>
          )}

          {/* Typing Indicator */}
          {user.isTyping && (
            <div className="flex items-center gap-1 text-xs text-primary mt-1">
              <span className="animate-pulse">{dir === 'rtl' ? 'يكتب...' : 'typing...'}</span>
            </div>
          )}
        </div>

        {/* Badges */}
        {user.badges && user.badges.length > 0 && (
          <div className="flex flex-col gap-1">
            {user.badges.slice(0, 2).map((badge, index) => (
              <div
                key={badge.id}
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs border border-background shadow-md"
                style={{
                  background: `linear-gradient(135deg, ${rankColor}40, ${rankColor}20)`
                }}
                title={badge.name}
              >
                {badge.icon}
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}


