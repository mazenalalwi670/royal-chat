'use client';

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/ui/avatar';
import { Badge } from '@/ui/badge';
import { Crown, Sparkles, Star } from 'lucide-react';
import { User } from '@/types/chat';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface PremiumUserFrameProps {
  user: User & { isPremiumSubscriber?: boolean; rank?: number; customNameStyle?: CustomNameStyle; selectedFrame?: any };
  size?: 'small' | 'medium' | 'large';
  showRank?: boolean;
}

export interface CustomNameStyle {
  fontFamily: 'royal' | 'elegant' | 'bold' | 'cursive';
  color: 'gold' | 'silver' | 'bronze' | 'platinum' | 'rainbow';
  decoration: 'crown' | 'star' | 'sparkles' | 'none';
  glow: boolean;
  animated: boolean;
}

const rankColors = {
  1: { border: 'from-yellow-400 via-yellow-500 to-yellow-600', badge: 'bg-gradient-to-br from-yellow-400 to-yellow-600', text: 'text-yellow-400' },
  2: { border: 'from-gray-300 via-gray-400 to-gray-500', badge: 'bg-gradient-to-br from-gray-300 to-gray-500', text: 'text-gray-300' },
  3: { border: 'from-amber-600 via-amber-700 to-amber-800', badge: 'bg-gradient-to-br from-amber-600 to-amber-800', text: 'text-amber-600' },
  default: { border: 'from-purple-400 via-purple-500 to-purple-600', badge: 'bg-gradient-to-br from-purple-400 to-purple-600', text: 'text-purple-400' }
};

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

export function PremiumUserFrame({ user, size = 'medium', showRank = true }: PremiumUserFrameProps) {
  const { dir } = useLanguage();
  const rank = user.rank || 0;
  const customStyle = user.customNameStyle;
  const selectedFrame = user.selectedFrame;
  const rankColor = rankColors[rank as keyof typeof rankColors] || rankColors.default;
  
  // Get frame style if selected
  const getFrameStyle = () => {
    if (selectedFrame) {
      return {
        gradient: selectedFrame.gradient,
        glowColor: selectedFrame.glowColor,
        borderStyle: selectedFrame.borderStyle
      };
    }
    return {
      gradient: rankColor.border,
      glowColor: 'rgba(255, 215, 0, 0.8)',
      borderStyle: 'solid'
    };
  };
  
  const frameStyle = getFrameStyle();

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return { avatar: 'w-12 h-12', border: 'w-14 h-14', text: 'text-xs', badge: 'w-5 h-5 text-xs' };
      case 'large':
        return { avatar: 'w-24 h-24', border: 'w-28 h-28', text: 'text-lg', badge: 'w-8 h-8 text-sm' };
      default:
        return { avatar: 'w-16 h-16', border: 'w-20 h-20', text: 'text-sm', badge: 'w-6 h-6 text-xs' };
    }
  };

  const sizeClasses = getSizeClasses();

  const getDisplayName = () => {
    if (customStyle) {
      const fontClass = fontStyles[customStyle.fontFamily as keyof typeof fontStyles] || fontStyles.royal;
      const colorClass = colorStyles[customStyle.color as keyof typeof colorStyles] || colorStyles.gold;
      const glowClass = customStyle.glow ? 'drop-shadow-[0_0_8px_currentColor]' : '';
      const animatedClass = customStyle.animated ? 'animate-pulse' : '';

      let name = user.name;
      if (customStyle.decoration === 'crown') {
        name = `👑 ${name}`;
      } else if (customStyle.decoration === 'star') {
        name = `⭐ ${name}`;
      } else if (customStyle.decoration === 'sparkles') {
        name = `✨ ${name} ✨`;
      }

      return (
        <span className={cn(fontClass, colorClass, glowClass, animatedClass)}>
          {name}
        </span>
      );
    }
    return user.name;
  };

  return (
    <div className="relative inline-block premium-user-frame">
      {/* Animated Border Frame */}
      <div 
        className={cn(
          "relative rounded-full p-0.5",
          selectedFrame ? `bg-gradient-to-r ${selectedFrame.gradient}` : `bg-gradient-to-r ${rankColor.border}`,
          "animate-pulse-slow premium-frame-glow",
          selectedFrame && `premium-frame-${selectedFrame.id}`,
          sizeClasses.border
        )}
        style={selectedFrame ? {
          boxShadow: `0 0 30px ${frameStyle.glowColor}, 0 0 60px ${frameStyle.glowColor}40`
        } : undefined}
      >
        {/* Inner Glow */}
        <div 
          className={cn(
            "absolute inset-0 rounded-full opacity-50",
            selectedFrame ? `bg-gradient-to-r ${selectedFrame.gradient}` : `bg-gradient-to-r ${rankColor.border}`,
            "blur-md animate-pulse"
          )} 
        />
        
        {/* Avatar Container */}
        <div className="relative rounded-full bg-background p-0.5">
          <Avatar className={cn("border-2 border-background", sizeClasses.avatar)}>
            <AvatarImage src={user.avatar} />
            <AvatarFallback className={cn(
              "bg-gradient-to-br",
              rankColor.badge,
              "text-white font-bold"
            )}>
              {user.name[0]}
            </AvatarFallback>
          </Avatar>
          
          {/* Crown Badge for Premium */}
          {user.isPremiumSubscriber && (
            <div className="absolute -top-1 -right-1 z-10">
              <div className={cn(
                "rounded-full p-1",
                "bg-gradient-to-br from-yellow-400 to-amber-500",
                "shadow-lg animate-bounce-slow"
              )}>
                <Crown className="w-3 h-3 text-white" />
              </div>
            </div>
          )}
        </div>

        {/* Rank Badge */}
        {showRank && rank > 0 && (
          <div className={cn(
            "absolute -bottom-1 -right-1 z-10",
            "rounded-full flex items-center justify-center",
            "border-2 border-background shadow-xl",
            rankColor.badge,
            sizeClasses.badge
          )}>
            <span className="font-bold text-white">{rank}</span>
          </div>
        )}

        {/* Floating Particles */}
        <div className="absolute -inset-2 pointer-events-none">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "absolute w-1 h-1 rounded-full",
                "bg-yellow-400 opacity-60",
                "premium-particle-float"
              )}
              style={{
                top: `${20 + i * 30}%`,
                left: `${10 + i * 25}%`,
                animationDelay: `${i * 0.3}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Name Display */}
      <div className="mt-2 text-center">
        <div className={cn(
          "font-semibold",
          sizeClasses.text,
          "premium-name-display"
        )}>
          {getDisplayName()}
        </div>
        <div className={cn(
          "text-xs text-muted-foreground mt-0.5",
          "premium-royal-chat-label"
        )}>
          {dir === 'rtl' ? 'شات ملكي' : 'Royal Chat'}
        </div>
      </div>
    </div>
  );
}

