'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatedName, NameEffectConfig } from './AnimatedName';
import { Avatar, AvatarFallback, AvatarImage } from '@/ui/avatar';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { User } from '@/types/chat';
import { Crown, Star, Flame, Sparkles } from 'lucide-react';

interface RoyalNameBarProps {
  users: Array<User & { frameConfig?: any; nameEffect?: NameEffectConfig }>;
  className?: string;
}

export function RoyalNameBar({ users, className }: RoyalNameBarProps) {
  const { dir } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(true);
  const [position, setPosition] = useState(0);

  useEffect(() => {
    if (!scrollRef.current) return;
    if (!isScrolling) {
      // Reset position when not scrolling
      setPosition(0);
      return;
    }

    const container = scrollRef.current;
    const scrollSpeed = 0.5; // pixels per frame
    let lastTime = performance.now();
    let animationId: number | null = null;
    
    const animate = (currentTime: number) => {
      if (!container || !isScrolling) {
        if (animationId) {
          cancelAnimationFrame(animationId);
        }
        return;
      }
      
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;
      
      const maxScroll = container.scrollWidth - container.clientWidth;
      
      setPosition((prev) => {
        const scrollDelta = scrollSpeed * (deltaTime / 16); // Normalize to 60fps
        const newPos = prev + scrollDelta;
        
        if (newPos >= maxScroll) {
          // Reset to start smoothly
          container.scrollLeft = 0;
          return 0;
        }
        
        container.scrollLeft = newPos;
        return newPos;
      });
      
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    
    return () => {
      if (animationId !== null) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isScrolling]);

  // Default name effects for premium users
  const defaultNameEffect: NameEffectConfig = {
    type: 'gradient-flow',
    colors: ['#FF006E', '#8338EC', '#3A86FF'],
    speed: 'medium',
    glow: true,
    sparkles: true,
    flames: false
  };

  const flameNameEffect: NameEffectConfig = {
    type: 'flame',
    colors: ['#FF4500', '#FF6347', '#FFD700'],
    speed: 'fast',
    glow: true,
    flames: true,
    sparkles: false
  };

  const goldNameEffect: NameEffectConfig = {
    type: 'gold-shine',
    colors: ['#FFD700', '#FFA500', '#FFD700'],
    speed: 'slow',
    glow: true,
    sparkles: true,
    flames: false
  };

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900",
        "border-t-2 border-b-2 border-purple-500/40 backdrop-blur-md",
        "tiktok-name-bar",
        className
      )}
      onMouseEnter={() => setIsScrolling(false)}
      onMouseLeave={() => setIsScrolling(true)}
    >
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-blue-600/10 animate-pulse-slow" />
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-purple-500/20 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-pink-500/20 rounded-full blur-3xl animate-float-slow" style={{ animationDelay: '1s' }} />
      </div>

      {/* Shimmer Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shine" />

      {/* Scrollable Content */}
      <div
        ref={scrollRef}
        className={cn(
          "flex items-center gap-6 px-6 py-4 overflow-x-auto scrollbar-hide",
          "will-change-scroll",
          dir === 'rtl' ? 'flex-row-reverse' : ''
        )}
        style={{
          scrollBehavior: 'auto',
          overflowX: 'auto'
        }}
      >
        {/* Duplicate for seamless loop */}
        {[...users, ...users].map((user, index) => {
          const isPremium = user.isPremiumSubscriber || user.frameConfig || user.nameEffect;
          const nameEffect = user.nameEffect || (index % 3 === 0 ? flameNameEffect : index % 3 === 1 ? goldNameEffect : defaultNameEffect);

          return (
            <div
              key={`${user.id}-${index}`}
              className={cn(
                "flex items-center gap-3 flex-shrink-0 px-4 py-2 rounded-full",
                "bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20",
                "border border-purple-500/30 backdrop-blur-sm",
                "transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-purple-500/50",
                "group"
              )}
            >
              {/* Avatar */}
              <div className="relative">
                {isPremium && (
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-full blur opacity-60 animate-pulse" />
                )}
                <Avatar className={cn(
                  "w-10 h-10 border-2 relative z-10",
                  isPremium 
                    ? "border-purple-400/50 shadow-lg shadow-purple-500/50" 
                    : "border-background/50"
                )}>
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className={cn(
                    isPremium && "bg-gradient-to-br from-purple-500/20 to-pink-500/20"
                  )}>
                    {user.name[0]}
                  </AvatarFallback>
                </Avatar>
                {isPremium && (
                  <div className="absolute -top-1 -right-1 z-20">
                    <Crown className="w-4 h-4 text-yellow-400 animate-bounce-slow drop-shadow-lg" />
                  </div>
                )}
              </div>

              {/* Name with Effect */}
              <div className="relative">
                {isPremium ? (
                  <AnimatedName
                    name={user.name}
                    effect={nameEffect}
                    size="sm"
                  />
                ) : (
                  <span className="text-sm font-semibold text-white/90">
                    {user.name}
                  </span>
                )}
                
                {/* Premium Badge */}
                {isPremium && (
                  <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-yellow-500/30 to-amber-500/30 border border-yellow-400/50 backdrop-blur-sm">
                      <Star className="w-2.5 h-2.5 text-yellow-400 animate-spin-slow" style={{ animationDuration: '2s' }} />
                      <span className="text-[10px] font-bold text-yellow-300">
                        {dir === 'rtl' ? 'مميز' : 'VIP'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Decorative Sparkles */}
              {isPremium && (
                <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Sparkles className="absolute top-0 right-0 w-3 h-3 text-pink-400 animate-sparkle-float" style={{ animationDelay: '0s' }} />
                  <Sparkles className="absolute bottom-0 left-0 w-3 h-3 text-purple-400 animate-sparkle-float" style={{ animationDelay: '0.3s' }} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Gradient Fade Edges */}
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-slate-900 to-transparent pointer-events-none z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-slate-900 to-transparent pointer-events-none z-10" />

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-40 animate-float-particle"
            style={{
              left: `${(i * 10) % 100}%`,
              top: `${20 + (i * 8)}%`,
              animationDelay: `${i * 0.2}s`,
              animationDuration: `${3 + (i % 3)}s`
            }}
          />
        ))}
      </div>
    </div>
  );
}

