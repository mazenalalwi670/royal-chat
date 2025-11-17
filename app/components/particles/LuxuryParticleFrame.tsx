'use client';

import { useEffect, useRef, useState } from 'react';
import { ParticleSystem, ParticleConfig, ParticleShape } from './ParticleSystem';
import { cn } from '@/lib/utils';

export interface LuxuryParticleFrameProps {
  shape?: 'circle' | 'square' | 'mixed';
  particleType?: 'diamond' | 'gem' | 'crystal' | 'sparkle' | 'luxury';
  colors?: string[];
  intensity?: 'low' | 'medium' | 'high';
  size?: 'small' | 'medium' | 'large';
  children?: React.ReactNode;
  className?: string;
}

const luxuryParticleConfigs: Record<string, ParticleConfig> = {
  diamond: {
    colors: ['#FFFFFF', '#E0E0E0', '#C0C0C0', '#A0A0A0', '#FFFFFF'],
    shape: 'diamond',
    count: 80,
    size: 4,
    speed: 0.3,
    life: 2000,
    opacity: 0.9,
    rotation: true,
    glow: true,
    sparkle: true,
  },
  gem: {
    colors: ['#FFD700', '#FFA500', '#FF6347', '#FF1493', '#9370DB'],
    shape: 'square',
    count: 100,
    size: 3,
    speed: 0.4,
    life: 1500,
    opacity: 0.85,
    rotation: true,
    glow: true,
    sparkle: true,
  },
  crystal: {
    colors: ['#00FFFF', '#0080FF', '#8000FF', '#FF00FF', '#FF0080'],
    shape: 'hexagon',
    count: 70,
    size: 3.5,
    speed: 0.35,
    life: 1800,
    opacity: 0.9,
    rotation: true,
    glow: true,
    sparkle: true,
  },
  sparkle: {
    colors: ['#FFD700', '#FFFFFF', '#FFA500', '#FFF8DC'],
    shape: 'star',
    count: 120,
    size: 2.5,
    speed: 0.5,
    life: 1200,
    opacity: 0.8,
    rotation: true,
    glow: true,
    sparkle: true,
  },
  luxury: {
    colors: ['#FFD700', '#FFA500', '#FF6347', '#FFFFFF', '#E0E0E0'],
    shape: 'circle',
    count: 150,
    size: 2,
    speed: 0.6,
    life: 1000,
    opacity: 0.75,
    rotation: false,
    glow: true,
    sparkle: true,
    trail: true,
  },
};

export function LuxuryParticleFrame({
  shape = 'circle',
  particleType = 'luxury',
  colors,
  intensity = 'medium',
  size = 'medium',
  children,
  className,
}: LuxuryParticleFrameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 200, height: 200 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
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
  }, []);

  const baseConfig = luxuryParticleConfigs[particleType] || luxuryParticleConfigs.luxury;
  
  const intensityMultipliers = {
    low: { count: 0.5, size: 0.8, speed: 0.7 },
    medium: { count: 1, size: 1, speed: 1 },
    high: { count: 1.5, size: 1.2, speed: 1.3 },
  };

  const sizeMultipliers = {
    small: 0.7,
    medium: 1,
    large: 1.3,
  };

  const multiplier = intensityMultipliers[intensity];
  const sizeMultiplier = sizeMultipliers[size];

  const config: ParticleConfig = {
    ...baseConfig,
    colors: colors || baseConfig.colors,
    count: Math.floor(baseConfig.count! * multiplier.count),
    size: (baseConfig.size || 3) * multiplier.size * sizeMultiplier,
    speed: (baseConfig.speed || 0.5) * multiplier.speed,
  };

  // Determine particle shapes based on shape prop
  let particleShapes: ParticleShape[] = [];
  if (shape === 'circle') {
    particleShapes = ['circle'];
  } else if (shape === 'square') {
    particleShapes = ['square', 'diamond'];
  } else {
    particleShapes = ['circle', 'square', 'diamond', 'star', 'hexagon'];
  }

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-hidden', className)}
    >
      {/* Multiple particle layers for depth */}
      {particleShapes.map((particleShape, index) => {
        const layerConfig: ParticleConfig = {
          ...config,
          shape: particleShape,
          count: Math.floor(config.count! / particleShapes.length),
          opacity: (config.opacity || 0.8) * (1 - index * 0.2),
        };

        return (
          <ParticleSystem
            key={`particle-layer-${index}-${particleShape}`}
            config={layerConfig}
            width={Math.max(dimensions.width, 100)}
            height={Math.max(dimensions.height, 100)}
            className="z-0"
          />
        );
      })}

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

