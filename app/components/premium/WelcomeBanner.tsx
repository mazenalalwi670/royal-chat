'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/ui/card';
import { Badge } from '@/ui/badge';
import { Crown, Sparkles, UsersRound, Zap, Star, Gem, Award } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface WelcomeBannerProps {
  userName: string;
  memberCount: number;
  onClose: () => void;
}

export function WelcomeBanner({ userName, memberCount, onClose }: WelcomeBannerProps) {
  const { dir } = useLanguage();
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    // Auto-hide after 8 seconds (longer for luxurious experience)
    const timer = setTimeout(() => {
      setIsAnimating(false);
      setTimeout(() => {
        setIsVisible(false);
        onClose();
      }, 500);
    }, 8000);

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'relative overflow-hidden mb-6 transition-all duration-700',
        isAnimating ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-95'
      )}
      dir={dir}
    >
      {/* Luxurious Card with Golden Border and Gradient */}
      <Card className="border-4 border-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400 bg-gradient-to-br from-amber-50/90 via-yellow-50/80 to-amber-100/90 backdrop-blur-md shadow-2xl relative overflow-hidden">
        {/* Animated Golden Background Shimmer */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-300/30 to-transparent animate-shimmer" />
        
        {/* Golden Sparkles Animation */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1.5 h-1.5 bg-yellow-400 rounded-full animate-sparkle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
                boxShadow: '0 0 8px #FFD700, 0 0 12px rgba(255, 215, 0, 0.5)'
              }}
            />
          ))}
        </div>

        {/* Golden Gradient Border Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-amber-500/30 to-yellow-400/20 animate-pulse" />

        <div className="relative z-10 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-4 flex-1">
              {/* Luxurious Crown Icon with Golden Glow */}
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-yellow-400 rounded-full blur-2xl animate-pulse opacity-60" />
                <div className="relative bg-gradient-to-br from-yellow-300 to-amber-600 p-3 rounded-full shadow-xl border-2 border-yellow-400">
                  <Crown className="w-10 h-10 sm:w-12 sm:h-12 text-amber-900 relative z-10 animate-bounce-slow" style={{ filter: 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.8))' }} />
                  <Sparkles className="w-5 h-5 text-yellow-500 absolute -top-1 -right-1 animate-spin-slow" />
                </div>
              </div>

              {/* Welcome Message Section */}
              <div className="flex-1 space-y-3">
                {/* User Name Bar - Luxurious Golden Bar */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400 rounded-lg blur-sm opacity-50" />
                  <div className="relative bg-gradient-to-r from-yellow-400/90 via-amber-500/90 to-yellow-400/90 px-4 py-2.5 rounded-lg border-2 border-yellow-300 shadow-lg">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Gem className="w-5 h-5 text-amber-900 animate-pulse" />
                      <h2 className="text-lg sm:text-xl font-bold text-amber-900 royal-text-name">
                        {userName}
                      </h2>
                      <Award className="w-5 h-5 text-amber-900 animate-spin-slow" />
                    </div>
                  </div>
                </div>

                {/* Premium Status Badge */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className="bg-gradient-to-r from-yellow-400 to-amber-500 text-amber-900 border-2 border-yellow-300 shadow-lg px-4 py-1.5 text-sm font-bold animate-pulse">
                    <Star className="w-4 h-4 mr-1.5 fill-amber-900" />
                    {dir === 'rtl' ? '🔥 أنت مميز الآن! 🔥' : '🔥 You are Premium! 🔥'}
                  </Badge>
                  <Badge variant="outline" className="border-amber-400 text-amber-700 bg-amber-50/50">
                    <Crown className="w-3.5 h-3.5 mr-1.5" />
                    {dir === 'rtl' ? 'عضوية مميزة' : 'Premium Member'}
                  </Badge>
                </div>

                {/* Welcome Message */}
                <div className="space-y-1.5">
                  <p className="text-base sm:text-lg font-semibold text-amber-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" />
                    <span>
                      {dir === 'rtl' 
                        ? `🎉 مرحباً بك في الدردشة الجماعية المميزة! 🎉`
                        : `🎉 Welcome to the Premium Group Chat! 🎉`}
                    </span>
                  </p>
                  <p className="text-sm text-amber-800 flex items-center gap-2">
                    <UsersRound className="w-4 h-4" />
                    <span>
                      {dir === 'rtl' 
                        ? `✅ أنت الآن جزء من ${memberCount} مشترك مميز`
                        : `✅ You're now part of ${memberCount} premium members`}
                    </span>
                  </p>
                  <p className="text-sm text-amber-700 flex items-center gap-2 mt-2">
                    <Zap className="w-4 h-4 text-yellow-500 animate-pulse" />
                    <span>
                      {dir === 'rtl' 
                        ? '✨ استمتع بالتحدث الصوتي والدردشة الفورية في الوقت الفعلي'
                        : '✨ Enjoy voice chat and instant real-time messaging'}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Close Button - Elegant */}
            <button
              onClick={() => {
                setIsAnimating(false);
                setTimeout(() => {
                  setIsVisible(false);
                  onClose();
                }, 500);
              }}
              className="text-amber-700 hover:text-amber-900 hover:bg-amber-200/50 transition-all p-2 rounded-full border-2 border-amber-300 hover:border-amber-500 self-start sm:self-auto"
              aria-label={dir === 'rtl' ? 'إغلاق' : 'Close'}
            >
              <span className="text-2xl font-bold">×</span>
            </button>
          </div>
        </div>
      </Card>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        @keyframes sparkle {
          0%, 100% {
            opacity: 0;
            transform: scale(0);
          }
          50% {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-shimmer {
          animation: shimmer 3s infinite;
        }
        .animate-sparkle {
          animation: sparkle 2s ease-in-out infinite;
        }
        .royal-text-name {
          background: linear-gradient(90deg, #78350f, #fbbf24, #78350f);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 2s linear infinite;
          text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
        }
      `}</style>
    </div>
  );
}

