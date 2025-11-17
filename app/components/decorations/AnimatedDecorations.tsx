'use client';

import { useEffect, useState } from 'react';
import { Sparkles, Star, Crown, Zap, Heart, Gem } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnimatedDecorationsProps {
  type?: 'premium' | 'gold' | 'platinum' | 'royal' | 'diamond';
  intensity?: 'low' | 'medium' | 'high';
  className?: string;
  children?: React.ReactNode;
}

const decorationConfigs = {
  premium: {
    colors: ['#FFD700', '#FFA500', '#FF6B35'],
    icons: [Sparkles, Star, Zap],
    particles: 12
  },
  gold: {
    colors: ['#FFD700', '#FFA500', '#FFE135'],
    icons: [Crown, Star, Gem],
    particles: 15
  },
  platinum: {
    colors: ['#E5E4E2', '#C0C0C0', '#FFFFFF'],
    icons: [Gem, Star, Sparkles],
    particles: 10
  },
  royal: {
    colors: ['#9B59B6', '#8E44AD', '#FFD700'],
    icons: [Crown, Sparkles, Heart],
    particles: 18
  },
  diamond: {
    colors: ['#00FFFF', '#0080FF', '#FFFFFF'],
    icons: [Gem, Star, Zap],
    particles: 20
  }
};

export function AnimatedDecorations({ 
  type = 'premium', 
  intensity = 'medium',
  className,
  children 
}: AnimatedDecorationsProps) {
  const config = decorationConfigs[type];
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number; size: number; iconIndex: number; colorIndex: number }>>([]);

  useEffect(() => {
    const particleCount = intensity === 'low' ? config.particles / 2 : intensity === 'high' ? config.particles * 1.5 : config.particles;
    const newParticles = Array.from({ length: Math.floor(particleCount) }, (_, i) => {
      const iconIndex = Math.floor(Math.random() * config.icons.length);
      const colorIndex = Math.floor(Math.random() * config.colors.length);
      return {
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 3,
        size: 4 + Math.random() * 6,
        iconIndex,
        colorIndex
      };
    });
    setParticles(newParticles);
  }, [type, intensity, config.particles, config.icons.length, config.colors.length]);

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Animated Background Gradient */}
      <div 
        className="absolute inset-0 opacity-20 animate-gradient-x"
        style={{
          background: `linear-gradient(90deg, ${config.colors[0]}22, ${config.colors[1]}22, ${config.colors[2]}22, ${config.colors[0]}22)`,
          backgroundSize: '200% 200%'
        }}
      />

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((particle) => {
          const Icon = config.icons[particle.iconIndex || 0];
          const color = config.colors[particle.colorIndex || 0];
          
          return (
            <div
              key={particle.id}
              className="absolute animate-float-particle"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                animationDelay: `${particle.delay}s`,
                animationDuration: `${3 + (particle.id % 2)}s`
              }}
            >
              <Icon 
                size={particle.size} 
                className="opacity-60"
                style={{ color, filter: `drop-shadow(0 0 4px ${color})` }}
              />
            </div>
          );
        })}
      </div>

      {/* Glowing Orbs */}
      <div className="absolute inset-0 pointer-events-none">
        {config.colors.map((color, index) => (
          <div
            key={index}
            className="absolute rounded-full blur-3xl animate-pulse-slow"
            style={{
              width: `${100 + index * 50}px`,
              height: `${100 + index * 50}px`,
              backgroundColor: color,
              opacity: 0.1,
              left: `${20 + index * 30}%`,
              top: `${10 + index * 20}%`,
              animationDelay: `${index * 0.5}s`
            }}
          />
        ))}
      </div>

      {/* Content */}
      {children && (
        <div className="relative z-10">
          {children}
        </div>
      )}

      {/* Shimmer Effect */}
      <div 
        className="absolute inset-0 opacity-30 animate-shimmer pointer-events-none"
        style={{
          background: `linear-gradient(110deg, transparent 40%, ${config.colors[0]}88 50%, transparent 60%)`,
          backgroundSize: '200% 100%'
        }}
      />
    </div>
  );
}

