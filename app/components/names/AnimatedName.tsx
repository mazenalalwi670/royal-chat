'use client';

import { useEffect, useRef, useState } from 'react';
import { Flame, Sparkles, Star, Zap, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ParticleSystem, ParticleConfig } from '../particles/ParticleSystem';

export type NameEffectType = 
  | 'flame'
  | 'gradient-flow'
  | 'sparkle'
  | 'lightning'
  | 'rainbow'
  | 'gold-shine'
  | 'glow-pulse'
  | 'none';

export interface NameEffectConfig {
  type: NameEffectType;
  colors: string[];
  speed?: 'slow' | 'medium' | 'fast';
  glow?: boolean;
  sparkles?: boolean;
  flames?: boolean;
  particles?: boolean;
  particleType?: 'diamond' | 'gem' | 'crystal' | 'sparkle' | 'luxury';
  particleShape?: 'circle' | 'square' | 'mixed';
}

interface AnimatedNameProps {
  name: string;
  effect: NameEffectConfig;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function AnimatedName({ 
  name, 
  effect, 
  size = 'md',
  className 
}: AnimatedNameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 200, height: 60 });

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width || 200, height: rect.height || 60 });
      }
    };

    updateDimensions();
    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [name, size]);

  useEffect(() => {
    if (!canvasRef.current || !effect.flames) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    canvas.width = rect.width || dimensions.width;
    canvas.height = rect.height || dimensions.height;

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      maxLife: number;
      size: number;
    }> = [];

    const createFlameParticle = (x: number, y: number) => {
      return {
        x,
        y,
        vx: (Math.random() - 0.5) * 0.5,
        vy: -0.5 - Math.random() * 1,
        life: 0,
        maxLife: 20 + Math.random() * 20,
        size: 2 + Math.random() * 2
      };
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Add particles at random positions along text
      if (particles.length < 15) {
        const textX = canvas.width / 2;
        const textY = canvas.height / 2;
        for (let i = 0; i < 2; i++) {
          particles.push(createFlameParticle(
            textX + (Math.random() - 0.5) * 40,
            textY + Math.random() * 10
          ));
        }
      }

      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life++;

        if (p.life > p.maxLife || p.y < -10) {
          particles.splice(i, 1);
          continue;
        }

        const alpha = 1 - (p.life / p.maxLife);
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
        gradient.addColorStop(0, `rgba(255, ${100 + p.life * 5}, 0, ${alpha})`);
        gradient.addColorStop(0.5, `rgba(255, 165, 0, ${alpha * 0.5})`);
        gradient.addColorStop(1, `rgba(255, 69, 0, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      requestAnimationFrame(animate);
    };

    if (isHovered || effect.flames) {
      animate();
    }
  }, [isHovered, effect.flames]);

  const getTextStyle = () => {
    const speed = effect.speed || 'medium';
    const speedClass = {
      slow: 'duration-[4s]',
      medium: 'duration-[3s]',
      fast: 'duration-[2s]'
    }[speed];

    switch (effect.type) {
      case 'flame':
        return {
          background: `linear-gradient(to bottom, ${effect.colors.join(', ')})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          filter: 'drop-shadow(0 0 8px rgba(255, 69, 0, 0.8))',
          className: `animate-gradient-text ${speedClass}`
        };
      
      case 'gradient-flow':
        return {
          background: `linear-gradient(90deg, ${effect.colors.join(', ')})`,
          backgroundSize: '200% 100%',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          className: `animate-gradient-x ${speedClass}`
        };
      
      case 'rainbow':
        return {
          background: `linear-gradient(90deg, ${effect.colors.join(', ')})`,
          backgroundSize: '200% 100%',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          className: `animate-gradient-x ${speedClass}`
        };
      
      case 'gold-shine':
        return {
          background: `linear-gradient(135deg, ${effect.colors.join(', ')})`,
          backgroundSize: '200% 200%',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          className: `animate-shimmer ${speedClass}`,
          filter: 'drop-shadow(0 0 10px rgba(255, 215, 0, 0.8))'
        };
      
      case 'glow-pulse':
        return {
          color: effect.colors[0],
          filter: 'drop-shadow(0 0 8px currentColor)',
          className: `animate-pulse-slow`
        };
      
      default:
        return {
          color: effect.colors[0] || 'inherit'
        };
    }
  };

  const textStyle = getTextStyle();

  return (
    <div 
      ref={containerRef}
      className={cn('relative inline-block', className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Canvas for flame effects */}
      {effect.flames && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none z-0"
          style={{ 
            width: '120%',
            height: '120%',
            top: '-10%',
            left: '-10%'
          }}
        />
      )}

      {/* Text */}
      <span
        className={cn(
          sizeClasses[size],
          'font-bold relative z-10',
          textStyle?.className
        )}
        style={{
          ...(textStyle || {}),
          textShadow: effect.glow ? `0 0 10px ${effect.colors[0]}` : undefined
        }}
      >
        {name}
      </span>

      {/* Professional Particle System for Names */}
      {effect.particles && effect.particleType && (
        <div className="absolute inset-0 pointer-events-none z-0" style={{ overflow: 'visible' }}>
          <ParticleSystem
            config={{
              count: 30,
              colors: effect.colors,
              shape: effect.particleShape === 'square' ? 'square' : 
                     effect.particleShape === 'mixed' ? (Math.random() > 0.5 ? 'square' : 'circle') : 
                     'circle',
              size: 2,
              speed: effect.speed === 'fast' ? 0.6 : effect.speed === 'slow' ? 0.3 : 0.45,
              life: 1500,
              opacity: 0.7,
              rotation: true,
              glow: effect.glow || false,
              sparkle: effect.sparkles || false,
              trail: true,
            }}
            width={dimensions.width}
            height={dimensions.height}
            className="z-0"
          />
        </div>
      )}

      {/* Sparkles */}
      {effect.sparkles && (
        <div className="absolute inset-0 pointer-events-none z-20">
          {Array.from({ length: 4 }).map((_, i) => (
            <Sparkles
              key={i}
              size={10}
              className="absolute animate-sparkle-float opacity-60"
              style={{
                color: effect.colors[i % effect.colors.length],
                left: `${i * 25}%`,
                top: `${-20 + (i % 2) * 40}%`,
                animationDelay: `${i * 0.3}s`,
                filter: `drop-shadow(0 0 4px ${effect.colors[i % effect.colors.length]})`
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

