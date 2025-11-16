'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

export type ParticleShape = 'circle' | 'square' | 'diamond' | 'star' | 'hexagon';

export interface ParticleConfig {
  count?: number;
  colors: string[];
  shape?: ParticleShape;
  size?: number;
  speed?: number;
  life?: number;
  opacity?: number;
  gravity?: number;
  rotation?: boolean;
  glow?: boolean;
  sparkle?: boolean;
  trail?: boolean;
  attraction?: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  opacity: number;
  life: number;
  maxLife: number;
  rotation: number;
  rotationSpeed: number;
  shape: ParticleShape;
  glow: boolean;
  sparkle: boolean;
  trail: Array<{ x: number; y: number; opacity: number }>;
}

interface ParticleSystemProps {
  config: ParticleConfig;
  width: number;
  height: number;
  className?: string;
  style?: React.CSSProperties;
}

export function ParticleSystem({ config, width, height, className, style }: ParticleSystemProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    const {
      count = 50,
      colors,
      shape = 'circle',
      size = 3,
      speed = 0.5,
      life = 1000,
      opacity = 0.8,
      gravity = 0.02,
      rotation = true,
      glow = false,
      sparkle = false,
      trail = false,
    } = config;

    // Initialize particles
    const particles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      const particle: Particle = {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * speed * 2,
        vy: (Math.random() - 0.5) * speed * 2,
        size: size * (0.5 + Math.random() * 0.5),
        color,
        opacity: opacity * (0.7 + Math.random() * 0.3),
        life: life,
        maxLife: life,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: rotation ? (Math.random() - 0.5) * 0.1 : 0,
        shape,
        glow: glow || false,
        sparkle: sparkle || false,
        trail: trail ? [] : [],
      };
      particles.push(particle);
    }

    particlesRef.current = particles;

    const drawParticle = (particle: Particle) => {
      ctx.save();
      ctx.globalAlpha = particle.opacity;

      if (particle.glow) {
        ctx.shadowBlur = 15;
        ctx.shadowColor = particle.color;
      }

      ctx.fillStyle = particle.color;
      ctx.strokeStyle = particle.color;

      if (particle.sparkle) {
        ctx.shadowBlur = 20;
        ctx.shadowColor = particle.color;
      }

      ctx.translate(particle.x, particle.y);
      ctx.rotate(particle.rotation);

      switch (particle.shape) {
        case 'circle':
          ctx.beginPath();
          ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
          ctx.fill();
          break;

        case 'square':
          ctx.fillRect(-particle.size, -particle.size, particle.size * 2, particle.size * 2);
          break;

        case 'diamond':
          ctx.beginPath();
          ctx.moveTo(0, -particle.size);
          ctx.lineTo(particle.size, 0);
          ctx.lineTo(0, particle.size);
          ctx.lineTo(-particle.size, 0);
          ctx.closePath();
          ctx.fill();
          break;

        case 'star': {
          ctx.beginPath();
          const spikes = 5;
          const outerRadius = particle.size;
          const innerRadius = particle.size * 0.5;
          let x = 0;
          let y = 0;
          for (let i = 0; i < spikes * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (Math.PI * i) / spikes - Math.PI / 2;
            x = Math.cos(angle) * radius;
            y = Math.sin(angle) * radius;
            if (i === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
          ctx.closePath();
          ctx.fill();
          break;
        }

        case 'hexagon': {
          ctx.beginPath();
          const sides = 6;
          for (let i = 0; i < sides; i++) {
            const angle = (Math.PI * 2 * i) / sides;
            const x = Math.cos(angle) * particle.size;
            const y = Math.sin(angle) * particle.size;
            if (i === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
          ctx.closePath();
          ctx.fill();
          break;
        }
      }

      ctx.restore();

      // Draw trail
      if (trail && particle.trail.length > 0) {
        ctx.save();
        for (let i = 0; i < particle.trail.length; i++) {
          const point = particle.trail[i];
          ctx.globalAlpha = point.opacity;
          ctx.fillStyle = particle.color;
          ctx.beginPath();
          ctx.arc(point.x, point.y, particle.size * 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    };

    const updateParticle = (particle: Particle, deltaTime: number) => {
      // Update position
      particle.x += particle.vx * (deltaTime / 16);
      particle.y += particle.vy * (deltaTime / 16);

      // Apply gravity
      if (gravity) {
        particle.vy += gravity * (deltaTime / 16);
      }

      // Update rotation
      if (rotation) {
        particle.rotation += particle.rotationSpeed * (deltaTime / 16);
      }

      // Update trail
      if (trail) {
        particle.trail.push({ x: particle.x, y: particle.y, opacity: particle.opacity });
        if (particle.trail.length > 5) {
          particle.trail.shift();
        }
        // Fade trail
        particle.trail.forEach((point) => {
          point.opacity *= 0.8;
        });
      }

      // Boundary collision with wrap-around
      if (particle.x < 0) particle.x = width;
      if (particle.x > width) particle.x = 0;
      if (particle.y < 0) particle.y = height;
      if (particle.y > height) particle.y = 0;

      // Update life
      particle.life -= deltaTime;
      if (particle.life <= 0) {
        // Reset particle
        particle.x = Math.random() * width;
        particle.y = Math.random() * height;
        particle.life = particle.maxLife;
        particle.opacity = opacity * (0.7 + Math.random() * 0.3);
        particle.trail = [];
      }

      // Sparkle effect
      if (sparkle) {
        particle.opacity = opacity * (0.7 + Math.random() * 0.3) * (particle.life / particle.maxLife);
      } else {
        particle.opacity = opacity * (particle.life / particle.maxLife);
      }
    };

    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Update and draw particles
      particlesRef.current.forEach((particle) => {
        updateParticle(particle, deltaTime);
        drawParticle(particle);
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    lastTimeRef.current = performance.now();
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [config, width, height]);

  return (
    <canvas
      ref={canvasRef}
      className={cn('absolute inset-0 pointer-events-none', className)}
      style={style}
    />
  );
}

