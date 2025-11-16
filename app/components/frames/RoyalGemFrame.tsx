'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { ParticleSystem } from '../particles/ParticleSystem';

export interface RoyalGemFrameProps {
  gemType?: 'diamond' | 'ruby' | 'sapphire' | 'emerald' | 'gold';
  crownPosition?: 'top-left' | 'top-center';
  wings?: boolean;
  emblem?: boolean;
  name?: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
  children?: React.ReactNode;
}

const sizeMap = {
  small: { container: 'w-16 h-16', frame: 16 },
  medium: { container: 'w-24 h-24', frame: 24 },
  large: { container: 'w-32 h-32', frame: 32 }
};

const gemColors = {
  diamond: { main: '#FFFFFF', glow: '#E0E0E0', light: '#F5F5F5' },
  ruby: { main: '#DC143C', glow: '#B22222', light: '#FF69B4' },
  sapphire: { main: '#4169E1', glow: '#0000CD', light: '#87CEEB' },
  emerald: { main: '#50C878', glow: '#228B22', light: '#90EE90' },
  gold: { main: '#FFD700', glow: '#FFA500', light: '#FFED4E' }
};

export function RoyalGemFrame({
  gemType = 'gold',
  crownPosition = 'top-left',
  wings = true,
  emblem = true,
  name,
  size = 'medium',
  className,
  children
}: RoyalGemFrameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 200, height: 200 });
  const gems = gemColors[gemType];

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width || 200, height: rect.height || 200 });
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
  }, [size]);

  const centerX = dimensions.width / 2;
  const centerY = dimensions.height / 2;
  const radius = Math.min(dimensions.width, dimensions.height) * 0.35;
  const frameWidth = radius * 0.15;

  return (
    <div
      ref={containerRef}
      className={cn('relative', sizeMap[size].container, className)}
    >
      {/* Particle System for Gem Sparkles */}
      <ParticleSystem
        config={{
          count: 40,
          colors: [gems.main, gems.glow, gems.light],
          shape: 'star',
          size: 2,
          speed: 0.4,
          life: 1500,
          opacity: 0.8,
          rotation: true,
          glow: true,
          sparkle: true,
          trail: true,
        }}
        width={dimensions.width}
        height={dimensions.height}
        className="absolute inset-0 z-0"
      />

      {/* Main Frame SVG */}
      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Gold Gradient */}
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFD700" stopOpacity="1" />
            <stop offset="50%" stopColor="#FFA500" stopOpacity="1" />
            <stop offset="100%" stopColor="#FFD700" stopOpacity="1" />
          </linearGradient>
          
          {/* Gem Gradient */}
          <linearGradient id="gemGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={gems.light} stopOpacity="1" />
            <stop offset="50%" stopColor={gems.main} stopOpacity="1" />
            <stop offset="100%" stopColor={gems.glow} stopOpacity="1" />
          </linearGradient>

          {/* Glow Filter */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Shine Filter */}
          <filter id="shine">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Main Circular Frame */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radius + frameWidth}
          fill="url(#goldGradient)"
          stroke="#FFD700"
          strokeWidth="2"
          filter="url(#glow)"
          className="animate-pulse-slow"
        />
        
        <circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="none"
          stroke="url(#goldGradient)"
          strokeWidth={frameWidth}
          filter="url(#glow)"
        />

        {/* Crown at Top */}
        {crownPosition === 'top-left' ? (
          <g transform={`translate(${centerX - radius * 0.3}, ${centerY - radius * 0.8})`}>
            {/* Crown Base */}
            <path
              d="M 0,10 L -15,0 L -10,-5 L 0,-8 L 10,-5 L 15,0 L 0,10 Z"
              fill="url(#goldGradient)"
              stroke="#FFA500"
              strokeWidth="1"
              filter="url(#glow)"
            />
            {/* Central Point */}
            <path
              d="M 0,-8 L -8,-18 L 0,-25 L 8,-18 Z"
              fill="url(#goldGradient)"
              stroke="#FFA500"
              strokeWidth="1"
              filter="url(#glow)"
            />
            {/* Left Point */}
            <path
              d="M -10,-5 L -15,-12 L -10,-18 L -5,-12 Z"
              fill="url(#goldGradient)"
              stroke="#FFA500"
              strokeWidth="1"
              filter="url(#glow)"
            />
            {/* Right Point */}
            <path
              d="M 10,-5 L 5,-12 L 10,-18 L 15,-12 Z"
              fill="url(#goldGradient)"
              stroke="#FFA500"
              strokeWidth="1"
              filter="url(#glow)"
            />
            {/* Central Gem */}
            <rect
              x="-6"
              y="-20"
              width="12"
              height="12"
              rx="2"
              transform="rotate(45 -6 -20)"
              fill="url(#gemGradient)"
              stroke={gems.glow}
              strokeWidth="1"
              filter="url(#shine)"
              className="animate-pulse"
            />
          </g>
        ) : (
          // Top Center Crown
          <g transform={`translate(${centerX}, ${centerY - radius * 0.9})`}>
            <path
              d="M 0,8 L -12,-2 L -8,-8 L 0,-12 L 8,-8 L 12,-2 L 0,8 Z"
              fill="url(#goldGradient)"
              stroke="#FFA500"
              strokeWidth="1"
              filter="url(#glow)"
            />
            <rect
              x="-8"
              y="-16"
              width="16"
              height="16"
              rx="2"
              transform="rotate(45 0 -16)"
              fill="url(#gemGradient)"
              stroke={gems.glow}
              strokeWidth="1"
              filter="url(#shine)"
              className="animate-pulse"
            />
          </g>
        )}

        {/* Red Gems along Frame */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * 30 - 90) * (Math.PI / 180);
          const gemX = centerX + Math.cos(angle) * (radius + frameWidth * 0.5);
          const gemY = centerY + Math.sin(angle) * (radius + frameWidth * 0.5);
          const gemSize = 4 + (i % 3);
          
          // Use red for most gems, but mix colors (red, blue, gold)
          const gemColor = i % 3 === 0 ? '#DC143C' : 
                          i % 3 === 1 ? '#4169E1' : 
                          '#FFD700';
          
          const gemGradientId = `gemGradient-${i}`;
          
          return (
            <g key={`gem-${i}`}>
              <defs>
                <radialGradient id={gemGradientId}>
                  <stop offset="0%" stopColor={gemColor === '#DC143C' ? '#FF69B4' : 
                                              gemColor === '#4169E1' ? '#87CEEB' : 
                                              '#FFED4E'} stopOpacity="1" />
                  <stop offset="50%" stopColor={gemColor} stopOpacity="1" />
                  <stop offset="100%" stopColor={gemColor === '#DC143C' ? '#B22222' : 
                                                gemColor === '#4169E1' ? '#0000CD' : 
                                                '#FFA500'} stopOpacity="0.8" />
                </radialGradient>
              </defs>
              
              {/* Gem Glow */}
              <circle
                cx={gemX}
                cy={gemY}
                r={gemSize * 1.5}
                fill={gemColor}
                opacity="0.3"
                filter="url(#glow)"
              />
              {/* Gem */}
              <circle
                cx={gemX}
                cy={gemY}
                r={gemSize}
                fill={`url(#${gemGradientId})`}
                stroke={gemColor === '#DC143C' ? '#B22222' : 
                       gemColor === '#4169E1' ? '#0000CD' : 
                       '#FFA500'}
                strokeWidth="0.5"
                filter="url(#shine)"
                className="animate-pulse"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
              {/* Gem Highlight */}
              <circle
                cx={gemX - gemSize * 0.3}
                cy={gemY - gemSize * 0.3}
                r={gemSize * 0.3}
                fill={gemColor === '#DC143C' ? '#FF69B4' : 
                     gemColor === '#4169E1' ? '#87CEEB' : 
                     '#FFED4E'}
                opacity="0.9"
              />
            </g>
          );
        })}

        {/* Wings at Bottom */}
        {wings && (
          <g transform={`translate(${centerX}, ${centerY + radius * 0.7})`}>
            {/* Left Wing */}
            <path
              d="M 0,0 L -30,-10 L -35,-5 L -25,5 L -15,0 L -10,5 L 0,0 Z"
              fill="url(#goldGradient)"
              stroke="#FFA500"
              strokeWidth="1"
              filter="url(#glow)"
            />
            <path
              d="M -20,-8 L -35,-15 L -40,-10 L -30,-3 Z"
              fill="#DC143C"
              opacity="0.8"
            />
            
            {/* Right Wing */}
            <path
              d="M 0,0 L 30,-10 L 35,-5 L 25,5 L 15,0 L 10,5 L 0,0 Z"
              fill="url(#goldGradient)"
              stroke="#FFA500"
              strokeWidth="1"
              filter="url(#glow)"
            />
            <path
              d="M 20,-8 L 35,-15 L 40,-10 L 30,-3 Z"
              fill="#DC143C"
              opacity="0.8"
            />

            {/* Central Chevron */}
            <path
              d="M 0,0 L -15,15 L 0,25 L 15,15 Z"
              fill="#DC143C"
              stroke="#B22222"
              strokeWidth="1"
            />
            <path
              d="M -10,10 L 0,20 L 10,10 L 0,15 Z"
              fill="#FFD700"
              opacity="0.6"
            />
          </g>
        )}

        {/* Bottom Emblem */}
        {emblem && (
          <g transform={`translate(${centerX}, ${centerY + radius * 0.5})`}>
            {/* Central Star Shield */}
            <circle
              cx="0"
              cy="0"
              r="20"
              fill="url(#goldGradient)"
              stroke="#FFA500"
              strokeWidth="2"
              filter="url(#glow)"
            />
            <circle
              cx="0"
              cy="0"
              r="16"
              fill="#4169E1"
              opacity="0.9"
            />
            {/* Star */}
            <g>
              <path
                d="M 0,-12 L 3,-4 L 11,-4 L 5,1 L 8,9 L 0,5 L -8,9 L -5,1 L -11,-4 L -3,-4 Z"
                fill="#87CEEB"
                filter="url(#shine)"
              />
            </g>
            
            {/* Wings around Star */}
            <path
              d="M -25,-5 L -40,-15 L -45,-10 L -35,-3 L -30,-8 L -25,-5 Z"
              fill="url(#goldGradient)"
              stroke="#FFA500"
              strokeWidth="1"
              filter="url(#glow)"
            />
            <path
              d="M 25,-5 L 40,-15 L 45,-10 L 35,-3 L 30,-8 L 25,-5 Z"
              fill="url(#goldGradient)"
              stroke="#FFA500"
              strokeWidth="1"
              filter="url(#glow)"
            />

            {/* Red Banner */}
            <path
              d="M -20,15 L -25,30 L -15,35 L 0,30 L 15,35 L 25,30 L 20,15 L 0,20 Z"
              fill="#DC143C"
              stroke="#B22222"
              strokeWidth="1"
              opacity="0.9"
            />
            
            {/* Banner Tips */}
            <path
              d="M -25,30 L -20,40 L -15,35 Z"
              fill="#FFD700"
            />
            <path
              d="M 25,30 L 20,40 L 15,35 Z"
              fill="#FFD700"
            />
          </g>
        )}

        {/* Name Text along Frame */}
        {name && (
          <text
            x={centerX}
            y={centerY - radius * 0.6}
            fill="#FFFFFF"
            fontSize="12"
            fontWeight="bold"
            textAnchor="middle"
            className="drop-shadow-lg"
            filter="url(#glow)"
          >
            {name}
          </text>
        )}
      </svg>

      {/* Content Avatar */}
      <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-auto">
        <div
          className="rounded-full overflow-hidden border-2"
          style={{
            width: `${radius * 1.6}px`,
            height: `${radius * 1.6}px`,
            borderColor: gems.main,
            boxShadow: `0 0 20px ${gems.glow}, inset 0 0 10px ${gems.light}40`
          }}
        >
          {children}
        </div>
      </div>

      {/* Animated Sparkles around Frame */}
      <div className="absolute inset-0 pointer-events-none z-30">
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i * 45) * (Math.PI / 180);
          const sparkleX = centerX + Math.cos(angle) * (radius + frameWidth + 10);
          const sparkleY = centerY + Math.sin(angle) * (radius + frameWidth + 10);
          
          return (
            <div
              key={`sparkle-${i}`}
              className="absolute w-2 h-2 rounded-full animate-pulse"
              style={{
                left: `${sparkleX}px`,
                top: `${sparkleY}px`,
                transform: 'translate(-50%, -50%)',
                background: gems.main,
                boxShadow: `0 0 10px ${gems.main}, 0 0 20px ${gems.glow}`,
                animationDelay: `${i * 0.2}s`
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

