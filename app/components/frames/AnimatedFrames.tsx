'use client';

import { useEffect, useRef, useState } from 'react';
import { Sparkles, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LuxuryParticleFrame } from '../particles/LuxuryParticleFrame';
import { RoyalGemFrame } from './RoyalGemFrame';

export type FrameType = 
  | 'royal-gold' 
  | 'royal-rainbow' 
  | 'royal-fire'
  | 'royal-diamond'
  | 'royal-platinum'
  | 'flame-name'
  | 'gradient-name'
  | 'sparkle-name'
  | 'royal-crown'
  | 'luxury-gold'
  | 'luxury-platinum'
  | 'premium-diamond'
  | 'circular-gold'
  | 'circular-rainbow'
  | 'circular-diamond'
  | 'dragon-animated'
  | 'black-howling'
  | 'custom';

export interface FrameConfig {
  id: string;
  name: string;
  nameAr: string;
  type: FrameType;
  gradient: string[];
  glowColor: string;
  borderStyle: 'solid' | 'dashed' | 'dotted' | 'double' | 'animated' | 'circular' | 'dragon' | 'howling';
  animationSpeed: 'slow' | 'medium' | 'fast';
  particles?: boolean;
  flames?: boolean;
  sparkles?: boolean;
  glow?: boolean;
  premium?: boolean;
  price?: number;
  dragon?: boolean;
  howling?: boolean;
  particleType?: 'diamond' | 'gem' | 'crystal' | 'sparkle' | 'luxury';
  particleShape?: 'circle' | 'square' | 'mixed';
  frameType?: 'royal-gem-crown' | 'royal-gem-emblem' | 'royal-gem-luxury' | 'royal-gem-crown-replica';
  hasCrown?: boolean;
  hasEmblem?: boolean;
  hasWings?: boolean;
  gemCount?: number;
}

interface AnimatedFrameProps {
  frameConfig: FrameConfig;
  size?: 'small' | 'medium' | 'large';
  children?: React.ReactNode;
  className?: string;
}

const sizeMap = {
  small: { container: 'w-12 h-12', padding: 'p-0.5', border: 'border-2' },
  medium: { container: 'w-16 h-16', padding: 'p-1', border: 'border-3' },
  large: { container: 'w-24 h-24', padding: 'p-1.5', border: 'border-4' }
};

export function AnimatedFrame({ 
  frameConfig, 
  size = 'medium',
  children,
  className 
}: AnimatedFrameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Check if this is a Royal Gem Frame type
  const isRoyalGemFrame = frameConfig.frameType && (
    frameConfig.frameType === 'royal-gem-crown' || 
    frameConfig.frameType === 'royal-gem-emblem' || 
    frameConfig.frameType === 'royal-gem-luxury' ||
    frameConfig.frameType === 'royal-gem-crown-replica'
  );

  useEffect(() => {
    if (!isRoyalGemFrame && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDimensions({ width: rect.width, height: rect.height });
    }
  }, [size, isRoyalGemFrame]);

  useEffect(() => {
    if (isRoyalGemFrame) return;
    if (!canvasRef.current || !frameConfig.flames) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = dimensions.width || 100;
    canvas.height = dimensions.height || 100;

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      maxLife: number;
      size: number;
    }> = [];

    const createParticle = () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.5 + Math.random() * 0.5;
      return {
        x: canvas.width / 2 + (Math.random() - 0.5) * 20,
        y: canvas.height,
        vx: Math.cos(angle) * speed,
        vy: -1 - Math.random() * 2,
        life: 0,
        maxLife: 20 + Math.random() * 30,
        size: 2 + Math.random() * 3
      };
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Add new particles
      if (particles.length < 30) {
        for (let i = 0; i < 2; i++) {
          particles.push(createParticle());
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
        
        if (frameConfig.type === 'royal-fire' || frameConfig.type === 'flame-name') {
          gradient.addColorStop(0, `rgba(255, ${100 + p.life * 5}, 0, ${alpha})`);
          gradient.addColorStop(0.5, `rgba(255, 165, 0, ${alpha * 0.5})`);
          gradient.addColorStop(1, `rgba(255, 69, 0, 0)`);
        } else {
          const color = frameConfig.gradient[0];
          gradient.addColorStop(0, `${color}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`);
          gradient.addColorStop(1, `${color}00`);
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      requestAnimationFrame(animate);
    };

    animate();
  }, [dimensions, frameConfig.flames, frameConfig.type, frameConfig.gradient, isRoyalGemFrame]);

  // Use Royal Gem Frame for special frame types
  if (isRoyalGemFrame) {
    const gemType: 'diamond' | 'ruby' | 'sapphire' | 'emerald' | 'gold' = 
      frameConfig.gradient.includes('#4169E1') ? 'sapphire' :
      frameConfig.gradient.includes('#DC143C') ? 'ruby' :
      frameConfig.gradient.includes('#50C878') ? 'emerald' :
      frameConfig.gradient.includes('#FFFFFF') ? 'diamond' : 'gold';

    return (
      <RoyalGemFrame
        gemType={gemType}
        crownPosition={frameConfig.hasCrown ? (frameConfig.frameType === 'royal-gem-emblem' ? 'top-center' : 'top-left') : 'top-center'}
        wings={frameConfig.hasWings || false}
        emblem={frameConfig.hasEmblem || false}
        size={size}
        className={className}
      >
        {children}
      </RoyalGemFrame>
    );
  }

  const speedClass = {
    slow: 'duration-[4s]',
    medium: 'duration-[3s]',
    fast: 'duration-[2s]'
  }[frameConfig.animationSpeed];

  const getGradientStyle = () => {
    if (frameConfig.gradient.length === 1) {
      return { background: frameConfig.gradient[0] };
    }
    return {
      background: `linear-gradient(135deg, ${frameConfig.gradient.join(', ')})`,
      backgroundSize: '200% 200%',
      animation: `gradient-${frameConfig.animationSpeed} 3s ease infinite`
    };
  };

  return (
    <div 
      ref={containerRef}
      className={cn('relative', className)}
    >
      {/* Canvas for flame effects */}
      {frameConfig.flames && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none z-10"
          style={{ width: '100%', height: '100%' }}
        />
      )}

      {/* Main Frame */}
      <div
        className={cn(
          'relative rounded-full',
          sizeMap[size].padding,
          frameConfig.borderStyle === 'animated' ? 'animate-gradient-border' : '',
          frameConfig.borderStyle === 'circular' ? 'frame-circular' : '',
          frameConfig.borderStyle === 'dragon' ? 'frame-dragon' : '',
          frameConfig.borderStyle === 'howling' ? 'frame-howling' : '',
          speedClass,
          frameConfig.glow && 'shadow-2xl'
        )}
        style={{
          ...getGradientStyle(),
          boxShadow: frameConfig.glow 
            ? `0 0 30px ${frameConfig.glowColor}, 0 0 60px ${frameConfig.glowColor}80, inset 0 0 20px ${frameConfig.glowColor}40`
            : undefined,
          borderStyle: ['animated', 'circular', 'dragon', 'howling'].includes(frameConfig.borderStyle) ? 'solid' : frameConfig.borderStyle
        }}
      >
        {/* Inner Border Glow */}
        {frameConfig.glow && (
          <div 
            className="absolute inset-0 rounded-full opacity-50 animate-pulse"
            style={{
              background: `linear-gradient(135deg, ${frameConfig.gradient.join(', ')})`,
              filter: 'blur(8px)',
              zIndex: -1
            }}
          />
        )}

        {/* Particles - Professional Canvas-based System */}
        {frameConfig.particles && frameConfig.particleType && (
          <LuxuryParticleFrame
            shape={frameConfig.particleShape || 'circle'}
            particleType={frameConfig.particleType}
            colors={frameConfig.gradient}
            intensity="high"
            size={size}
            className="absolute inset-0 rounded-full"
          />
        )}
        
        {/* Legacy Particles (fallback) */}
        {frameConfig.particles && !frameConfig.particleType && (
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full animate-float-particle"
                style={{
                  width: '4px',
                  height: '4px',
                  background: frameConfig.gradient[i % frameConfig.gradient.length],
                  left: `${20 + (i * 10)}%`,
                  top: `${20 + (i * 5)}%`,
                  animationDelay: `${i * 0.3}s`,
                  boxShadow: `0 0 8px ${frameConfig.gradient[i % frameConfig.gradient.length]}`,
                  opacity: 0.7
                }}
              />
            ))}
          </div>
        )}

        {/* Sparkles */}
        {frameConfig.sparkles && (
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 6 }).map((_, i) => {
              const Icon = i % 2 === 0 ? Sparkles : Star;
              return (
                <Icon
                  key={i}
                  size={12}
                  className="absolute animate-sparkle-float opacity-60"
                  style={{
                    color: frameConfig.gradient[i % frameConfig.gradient.length],
                    left: `${15 + (i * 12)}%`,
                    top: `${15 + (i * 8)}%`,
                    animationDelay: `${i * 0.4}s`,
                    filter: `drop-shadow(0 0 4px ${frameConfig.gradient[i % frameConfig.gradient.length]})`
                  }}
                />
              );
            })}
          </div>
        )}

        {/* Content */}
        <div className={cn('relative z-10 rounded-full bg-background', sizeMap[size].container)}>
          {children}
        </div>

        {/* Shimmer Effect */}
        <div 
          className="absolute inset-0 rounded-full opacity-30 animate-shimmer pointer-events-none"
          style={{
            background: `linear-gradient(110deg, transparent 40%, ${frameConfig.gradient[0]}88 50%, transparent 60%)`,
            backgroundSize: '200% 100%'
          }}
        />

        {/* Dragon Animation */}
        {frameConfig.dragon && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-full">
            <svg className="absolute inset-0 w-full h-full dragon-svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
              <defs>
                <linearGradient id="dragonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FF4500" stopOpacity="1" />
                  <stop offset="50%" stopColor="#FFD700" stopOpacity="1" />
                  <stop offset="100%" stopColor="#FF6347" stopOpacity="1" />
                </linearGradient>
              </defs>
              {/* Dragon Body */}
              <path
                d="M 20,50 Q 30,30 40,40 Q 50,50 60,35 Q 70,20 80,30 Q 85,40 80,50 Q 75,60 70,50 Q 60,45 50,55 Q 40,65 30,60 Q 25,55 20,50 Z"
                fill="url(#dragonGradient)"
                className="dragon-body"
                opacity="0.8"
              />
              {/* Dragon Eyes */}
              <circle cx="35" cy="45" r="3" fill="#FF0000" className="dragon-eye" />
              <circle cx="45" cy="42" r="2.5" fill="#FF0000" className="dragon-eye" />
              {/* Dragon Fire */}
              <path
                d="M 80,30 Q 85,25 90,20 Q 88,15 85,20 Q 82,25 80,30"
                fill="#FFD700"
                className="dragon-fire"
                opacity="0.9"
              />
            </svg>
          </div>
        )}

        {/* Howling Effect - Black Frame */}
        {frameConfig.howling && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-full">
            {/* Sound Waves */}
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={`wave-${i}`}
                className="absolute rounded-full border-2 border-white/30 howling-wave"
                style={{
                  width: `${60 + i * 15}%`,
                  height: `${60 + i * 15}%`,
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  animationDelay: `${i * 0.2}s`,
                  borderColor: `rgba(255, 255, 255, ${0.4 - i * 0.08})`
                }}
              />
            ))}
            {/* Howling Particles */}
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={`howl-particle-${i}`}
                className="absolute rounded-full bg-white/40 howling-particle"
                style={{
                  width: '3px',
                  height: '3px',
                  top: '50%',
                  left: '50%',
                  transform: `translate(-50%, -50%) rotate(${i * 30}deg)`,
                  transformOrigin: '0 40px',
                  animationDelay: `${i * 0.1}s`
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

