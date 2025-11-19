'use client';

import { 
  Crown, 
  Star, 
  Gem, 
  Sparkles, 
  Zap, 
  Heart, 
  Trophy,
  Award,
  Medal,
  Shield,
  Flame,
  Sun,
  Moon,
  Diamond
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type IconType = 
  | 'crown' 
  | 'star' 
  | 'gem' 
  | 'sparkles' 
  | 'zap' 
  | 'heart' 
  | 'trophy'
  | 'award'
  | 'medal'
  | 'shield'
  | 'flame'
  | 'sun'
  | 'moon'
  | 'diamond';

interface ModernIconProps {
  type: IconType;
  size?: number | string;
  variant?: 'default' | 'premium' | 'gold' | 'platinum' | 'diamond' | 'glow';
  animated?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const iconMap: Record<IconType, typeof Crown> = {
  crown: Crown,
  star: Star,
  gem: Gem,
  sparkles: Sparkles,
  zap: Zap,
  heart: Heart,
  trophy: Trophy,
  award: Award,
  medal: Medal,
  shield: Shield,
  flame: Flame,
  sun: Sun,
  moon: Moon,
  diamond: Diamond
};

const variantStyles = {
  default: 'text-foreground',
  premium: 'modern-icon-premium',
  gold: 'text-yellow-600 drop-shadow-[0_0_8px_rgba(255,215,0,0.6)]',
  platinum: 'text-gray-400 drop-shadow-[0_0_8px_rgba(192,192,192,0.6)]',
  diamond: 'text-cyan-400 drop-shadow-[0_0_8px_rgba(0,255,255,0.6)]',
  glow: 'modern-icon-glow'
};

const variantAnimations = {
  default: '',
  premium: 'animate-pulse-slow',
  gold: 'animate-bounce-slow',
  platinum: 'animate-pulse-slow',
  diamond: 'animate-spin-slow',
  glow: 'animate-pulse-slow'
};

export function ModernIcon({
  type,
  size = 24,
  variant = 'default',
  animated = false,
  className,
  style
}: ModernIconProps) {
  const IconComponent = iconMap[type];
  const variantClass = variantStyles[variant];
  const animationClass = animated ? variantAnimations[variant] || 'animate-pulse-slow' : '';

  return (
    <IconComponent
      size={size}
      className={cn(
        'modern-icon',
        variantClass,
        animationClass,
        className
      )}
      style={{
        ...style,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    />
  );
}

// Premium Subscription Badge Component
interface PremiumBadgeProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'gold' | 'platinum' | 'diamond';
  animated?: boolean;
  className?: string;
}

export function PremiumBadge({ 
  text, 
  size = 'md', 
  variant = 'gold',
  animated = true,
  className 
}: PremiumBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base'
  };

  const variantConfigs = {
    gold: {
      gradient: 'from-yellow-400 via-amber-500 to-yellow-400',
      icon: 'gold' as const,
      textColor: 'text-yellow-900 dark:text-yellow-100'
    },
    platinum: {
      gradient: 'from-gray-300 via-gray-200 to-gray-300',
      icon: 'platinum' as const,
      textColor: 'text-gray-800 dark:text-gray-200'
    },
    diamond: {
      gradient: 'from-cyan-400 via-blue-500 to-cyan-400',
      icon: 'diamond' as const,
      textColor: 'text-cyan-900 dark:text-cyan-100'
    }
  };

  const config = variantConfigs[variant];
  const iconType = variant === 'gold' ? 'crown' : variant === 'platinum' ? 'gem' : 'diamond';

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border-2 shadow-lg',
        `bg-gradient-to-r ${config.gradient}`,
        sizeClasses[size],
        config.textColor,
        'font-bold',
        animated && 'animate-pulse-slow',
        className
      )}
      style={{
        borderColor: variant === 'gold' ? '#FFD700' : variant === 'platinum' ? '#C0C0C0' : '#00FFFF',
        boxShadow: variant === 'gold' 
          ? '0 0 20px rgba(255, 215, 0, 0.5)' 
          : variant === 'platinum' 
          ? '0 0 20px rgba(192, 192, 192, 0.5)' 
          : '0 0 20px rgba(0, 255, 255, 0.5)'
      }}
    >
      <ModernIcon 
        type={iconType} 
        size={size === 'sm' ? 12 : size === 'md' ? 16 : 20}
        variant={variant}
        animated={animated}
      />
      {text && <span>{text}</span>}
    </div>
  );
}





