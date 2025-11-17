'use client';

import { useEffect, useState } from 'react';
import { Crown, Sparkles, Star, Zap, TrendingUp, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface AnimatedTopBarProps {
  title?: string;
  subtitle?: string;
  showStats?: boolean;
  premiumCount?: number;
  totalUsers?: number;
  className?: string;
}

export function AnimatedTopBar({ 
  title,
  subtitle,
  showStats = true,
  premiumCount = 0,
  totalUsers = 0,
  className 
}: AnimatedTopBarProps) {
  const { dir } = useLanguage();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const maxScroll = 100;
      const progress = Math.min(scrollTop / maxScroll, 1);
      setScrollProgress(progress);
      setIsVisible(scrollTop < 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div 
      className={cn(
        'sticky top-0 z-50 transition-all duration-300',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-90 -translate-y-2',
        className
      )}
      style={{
        backdropFilter: 'blur(20px) saturate(180%)',
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        boxShadow: `0 8px 32px rgba(0, 0, 0, ${0.1 * scrollProgress})`
      }}
    >
      {/* Animated Gradient Background */}
      <div 
        className="absolute inset-0 opacity-30 animate-gradient-x"
        style={{
          background: 'linear-gradient(90deg, #FFD700 0%, #FFA500 25%, #FF6B35 50%, #FFA500 75%, #FFD700 100%)',
          backgroundSize: '200% 100%'
        }}
      />

      {/* Animated Progress Bar */}
      <div 
        className="absolute bottom-0 h-1 bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 transition-all duration-300"
        style={{
          width: `${scrollProgress * 100}%`,
          boxShadow: '0 0 10px rgba(255, 215, 0, 0.5)'
        }}
      />

      <div className="relative px-6 py-4" dir={dir}>
        <div className="flex items-center justify-between">
          {/* Left Side - Title & Icons */}
          <div className="flex items-center gap-4">
            {/* Animated Crown Icon */}
            <div className="relative">
              <div className="absolute inset-0 bg-yellow-400 rounded-full blur-xl opacity-50 animate-pulse" />
              <Crown 
                className="relative w-8 h-8 text-yellow-600 animate-bounce-slow drop-shadow-lg"
                style={{ filter: 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.8))' }}
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold bg-gradient-to-r from-yellow-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent animate-gradient-text">
                  {title || (dir === 'rtl' ? 'الدردشة الملكية' : 'Royal Chat')}
                </h1>
                {/* Floating Sparkles */}
                <div className="relative">
                  {[0, 1, 2].map((i) => (
                    <Sparkles
                      key={i}
                      size={12}
                      className="absolute text-yellow-400 opacity-60 animate-sparkle-float"
                      style={{
                        left: `${i * 8}px`,
                        animationDelay: `${i * 0.3}s`,
                        filter: 'drop-shadow(0 0 4px rgba(255, 215, 0, 0.6))'
                      }}
                    />
                  ))}
                </div>
              </div>
              {subtitle && (
                <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>

          {/* Right Side - Stats & Badges */}
          {showStats && (
            <div className={cn(
              'flex items-center gap-4',
              dir === 'rtl' ? 'flex-row-reverse' : ''
            )}>
              {/* Premium Count */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 shadow-sm">
                <Star 
                  size={16} 
                  className="text-yellow-600 animate-spin-slow"
                  style={{ animationDuration: '3s' }}
                />
                <span className="text-sm font-semibold text-yellow-700">
                  {premiumCount}
                </span>
                <span className="text-xs text-muted-foreground">
                  {dir === 'rtl' ? 'مميز' : 'Premium'}
                </span>
              </div>

              {/* Total Users */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 shadow-sm">
                <Users size={16} className="text-blue-600" />
                <span className="text-sm font-semibold text-blue-700">
                  {totalUsers}
                </span>
                <span className="text-xs text-muted-foreground">
                  {dir === 'rtl' ? 'مستخدم' : 'Users'}
                </span>
              </div>

              {/* Trending Badge */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 shadow-lg animate-pulse-slow">
                <TrendingUp size={14} className="text-white" />
                <Zap size={12} className="text-yellow-200 animate-bounce" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Particles Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-yellow-400 rounded-full animate-particle-float opacity-40"
            style={{
              left: `${(i * 12.5) + Math.sin(i) * 5}%`,
              top: `${50 + Math.cos(i) * 20}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${4 + (i % 2)}s`
            }}
          />
        ))}
      </div>
    </div>
  );
}


