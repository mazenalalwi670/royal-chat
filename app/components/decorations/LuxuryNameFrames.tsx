'use client';

import { ReactNode } from 'react';
import { Crown, Star, Gem, Sparkles, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export type FrameStyle = 
  | 'royal-crown' 
  | 'golden-star' 
  | 'diamond-gem' 
  | 'platinum-luxury' 
  | 'rainbow-sparkle' 
  | 'electric-zap'
  | 'premium-gold';

interface LuxuryNameFrameProps {
  name: string;
  frameStyle?: FrameStyle;
  size?: 'small' | 'medium' | 'large';
  animated?: boolean;
  glow?: boolean;
  className?: string;
  children?: ReactNode;
}

const frameConfigs: Record<FrameStyle, {
  gradient: string;
  borderGradient: string;
  icon: typeof Crown;
  colors: string[];
  glowColor: string;
}> = {
  'royal-crown': {
    gradient: 'from-purple-500 via-pink-500 to-purple-500',
    borderGradient: 'from-purple-400 via-pink-400 to-purple-400',
    icon: Crown,
    colors: ['#9B59B6', '#E91E63', '#9B59B6'],
    glowColor: 'rgba(155, 89, 182, 0.8)'
  },
  'golden-star': {
    gradient: 'from-yellow-400 via-amber-500 to-yellow-400',
    borderGradient: 'from-yellow-300 via-amber-400 to-yellow-300',
    icon: Star,
    colors: ['#FFD700', '#FFA500', '#FFD700'],
    glowColor: 'rgba(255, 215, 0, 0.9)'
  },
  'diamond-gem': {
    gradient: 'from-cyan-400 via-blue-500 to-cyan-400',
    borderGradient: 'from-cyan-300 via-blue-400 to-cyan-300',
    icon: Gem,
    colors: ['#00FFFF', '#0080FF', '#00FFFF'],
    glowColor: 'rgba(0, 255, 255, 0.8)'
  },
  'platinum-luxury': {
    gradient: 'from-gray-200 via-white to-gray-200',
    borderGradient: 'from-gray-300 via-gray-100 to-gray-300',
    icon: Gem,
    colors: ['#E5E4E2', '#FFFFFF', '#C0C0C0'],
    glowColor: 'rgba(229, 228, 226, 0.9)'
  },
  'rainbow-sparkle': {
    gradient: 'from-pink-400 via-purple-400 via-blue-400 via-green-400 via-yellow-400 to-pink-400',
    borderGradient: 'from-pink-300 via-purple-300 via-blue-300 via-green-300 via-yellow-300 to-pink-300',
    icon: Sparkles,
    colors: ['#FF69B4', '#9370DB', '#00BFFF', '#32CD32', '#FFD700'],
    glowColor: 'rgba(255, 105, 180, 0.7)'
  },
  'electric-zap': {
    gradient: 'from-yellow-300 via-yellow-400 to-orange-500',
    borderGradient: 'from-yellow-200 via-yellow-300 to-orange-400',
    icon: Zap,
    colors: ['#FFEB3B', '#FFC107', '#FF9800'],
    glowColor: 'rgba(255, 235, 59, 0.9)'
  },
  'premium-gold': {
    gradient: 'from-yellow-500 via-amber-600 via-yellow-500',
    borderGradient: 'from-yellow-400 via-amber-500 via-yellow-400',
    icon: Crown,
    colors: ['#FFD700', '#FF8C00', '#FFD700'],
    glowColor: 'rgba(255, 215, 0, 1)'
  }
};

export function LuxuryNameFrame({
  name,
  frameStyle = 'premium-gold',
  size = 'medium',
  animated = true,
  glow = true,
  className,
  children
}: LuxuryNameFrameProps) {
  const config = frameConfigs[frameStyle];
  const Icon = config.icon;

  const sizeClasses = {
    small: {
      container: 'px-3 py-1.5 text-xs',
      icon: 'w-4 h-4',
      name: 'text-sm'
    },
    medium: {
      container: 'px-4 py-2 text-sm',
      icon: 'w-5 h-5',
      name: 'text-base'
    },
    large: {
      container: 'px-6 py-3 text-base',
      icon: 'w-6 h-6',
      name: 'text-lg'
    }
  };

  const classes = sizeClasses[size];

  return (
    <div className={cn('relative inline-block', className)}>
      {/* Outer Glow */}
      {glow && (
        <div 
          className="absolute -inset-1 rounded-lg blur-xl opacity-50 animate-pulse-slow"
          style={{
            background: `linear-gradient(135deg, ${config.colors.join(', ')})`,
            boxShadow: `0 0 30px ${config.glowColor}, 0 0 60px ${config.glowColor}60`
          }}
        />
      )}

      {/* Main Frame */}
      <div
        className={cn(
          'relative rounded-lg border-2 overflow-hidden',
          `bg-gradient-to-r ${config.gradient}`,
          `border-gradient-to-r ${config.borderGradient}`,
          classes.container,
          animated && 'animate-gradient-x',
          glow && 'shadow-2xl'
        )}
        style={{
          background: `linear-gradient(90deg, ${config.colors.join(', ')})`,
          backgroundSize: '200% 100%',
          borderImage: `linear-gradient(90deg, ${config.colors.join(', ')}) 1`,
          boxShadow: glow ? `0 0 20px ${config.glowColor}, inset 0 0 20px rgba(255, 255, 255, 0.1)` : undefined
        }}
      >
        {/* Inner Shine Effect */}
        <div 
          className="absolute inset-0 opacity-30 animate-shimmer pointer-events-none"
          style={{
            background: `linear-gradient(110deg, transparent 40%, rgba(255, 255, 255, 0.5) 50%, transparent 60%)`,
            backgroundSize: '200% 100%'
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex items-center gap-2">
          {/* Icon */}
          <Icon 
            className={cn(
              classes.icon,
              'flex-shrink-0 drop-shadow-lg',
              animated && 'animate-bounce-slow'
            )}
            style={{
              filter: 'drop-shadow(0 0 4px rgba(255, 255, 255, 0.8))',
              color: 'white'
            }}
          />

          {/* Name */}
          <span 
            className={cn(
              classes.name,
              'font-bold text-white drop-shadow-lg',
              animated && 'animate-pulse-slow'
            )}
            style={{
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.5), 0 0 8px rgba(255, 255, 255, 0.3)'
            }}
          >
            {name}
          </span>

          {/* Decorative Sparkles */}
          {frameStyle === 'rainbow-sparkle' && (
            <div className="relative ml-1">
              {[0, 1].map((i) => (
                <Sparkles
                  key={i}
                  size={12}
                  className="absolute text-white opacity-70 animate-sparkle-rotate"
                  style={{
                    left: `${i * 8}px`,
                    animationDelay: `${i * 0.3}s`,
                    filter: 'drop-shadow(0 0 2px rgba(255, 255, 255, 0.8))'
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Animated Border */}
        {animated && (
          <div 
            className="absolute inset-0 rounded-lg pointer-events-none"
            style={{
              background: `linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)`,
              animation: 'shimmer 3s linear infinite'
            }}
          />
        )}

        {/* Children (for additional content) */}
        {children && (
          <div className="relative z-10 mt-1">
            {children}
          </div>
        )}
      </div>

      {/* Floating Particles */}
      {animated && (
        <div className="absolute -inset-4 pointer-events-none">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full animate-particle-float opacity-60"
              style={{
                backgroundColor: config.colors[i % config.colors.length],
                left: `${20 + i * 20}%`,
                top: `${-10 + i * 10}%`,
                animationDelay: `${i * 0.5}s`,
                boxShadow: `0 0 6px ${config.colors[i % config.colors.length]}`
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}





