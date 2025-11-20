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

        <div className="relative z-10 p-3 sm:p-4 md:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 md:gap-4">
            <div className="flex items-start sm:items-center gap-2 sm:gap-3 md:gap-4 flex-1 min-w-0">
              {/* Luxurious Crown Icon with Golden Glow - Mobile responsive for 1080x2340 */}
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-yellow-400 rounded-full blur-xl sm:blur-2xl animate-pulse opacity-60" />
                <div className="relative bg-gradient-to-br from-yellow-300 to-amber-600 p-2 sm:p-2.5 md:p-3 rounded-full shadow-xl border-2 border-yellow-400">
                  <Crown className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-amber-900 relative z-10 animate-bounce-slow" style={{ filter: 'drop-shadow(0 0 6px rgba(255, 215, 0, 0.8))' }} />
                  <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-yellow-500 absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 animate-spin-slow" />
                </div>
              </div>

              {/* Welcome Message Section */}
              <div className="flex-1 space-y-2 sm:space-y-2.5 md:space-y-3 min-w-0">
                {/* User Name Bar - Luxurious Golden Bar - Mobile responsive */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400 rounded-lg blur-sm opacity-50" />
                  <div className="relative bg-gradient-to-r from-yellow-400/90 via-amber-500/90 to-yellow-400/90 px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 rounded-lg border-2 border-yellow-300 shadow-lg">
                    <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
                      <Gem className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-amber-900 animate-pulse flex-shrink-0" />
                      <h2 className="text-sm sm:text-base md:text-lg font-bold text-amber-900 royal-text-name truncate">
                        {userName}
                      </h2>
                      <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-amber-900 animate-spin-slow flex-shrink-0" />
                    </div>
                  </div>
                </div>

                {/* Premium Status Badge - Mobile responsive */}
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <Badge className="bg-gradient-to-r from-yellow-400 to-amber-500 text-amber-900 border-2 border-yellow-300 shadow-lg px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 text-xs sm:text-xs md:text-sm font-bold animate-pulse">
                    <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 mr-1 sm:mr-1.5 fill-amber-900" />
                    {dir === 'rtl' ? '🔥 أنت مميز الآن! 🔥' : '🔥 You are Premium! 🔥'}
                  </Badge>
                  <Badge variant="outline" className="border-amber-400 text-amber-700 bg-amber-50/50 text-[9px] sm:text-[10px] md:text-xs px-1.5 sm:px-2 md:px-3 py-0.5 sm:py-1 min-h-[20px] sm:min-h-[22px]">
                    <Crown className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 mr-0.5 sm:mr-1 md:mr-1.5" />
                    <span className="text-[9px] sm:text-[10px] md:text-xs">{dir === 'rtl' ? 'عضوية مميزة' : 'Premium Member'}</span>
                  </Badge>
                </div>

                {/* Welcome Message - Mobile responsive for 1080x2340 */}
                <div className="space-y-1 sm:space-y-1.5">
                  <p className="text-xs sm:text-sm md:text-base font-semibold text-amber-900 flex items-center gap-1.5 sm:gap-2">
                    <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-yellow-500 animate-pulse flex-shrink-0" />
                    <span className="text-xs sm:text-sm md:text-base">
                      {dir === 'rtl' 
                        ? `🎉 مرحباً بك في الدردشة الجماعية المميزة! 🎉`
                        : `🎉 Welcome to the Premium Group Chat! 🎉`}
                    </span>
                  </p>
                  <p className="text-[10px] sm:text-xs md:text-sm text-amber-800 flex items-center gap-1.5 sm:gap-2">
                    <UsersRound className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                    <span className="text-[10px] sm:text-xs md:text-sm">
                      {dir === 'rtl' 
                        ? `✅ أنت الآن جزء من ${memberCount} مشترك مميز`
                        : `✅ You're now part of ${memberCount} premium members`}
                    </span>
                  </p>
                  <p className="text-[10px] sm:text-xs md:text-sm text-amber-700 flex items-center gap-1.5 sm:gap-2 mt-1 sm:mt-2">
                    <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-yellow-500 animate-pulse flex-shrink-0" />
                    <span className="text-[10px] sm:text-xs md:text-sm">
                      {dir === 'rtl' 
                        ? '✨ استمتع بالتحدث الصوتي والدردشة الفورية في الوقت الفعلي'
                        : '✨ Enjoy voice chat and instant real-time messaging'}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Close Button - Elegant - Mobile responsive */}
            <button
              onClick={() => {
                setIsAnimating(false);
                setTimeout(() => {
                  setIsVisible(false);
                  onClose();
                }, 500);
              }}
              className="text-amber-700 hover:text-amber-900 hover:bg-amber-200/50 transition-all p-1.5 sm:p-2 rounded-full border-2 border-amber-300 hover:border-amber-500 self-start sm:self-auto touch-manipulation min-h-[36px] min-w-[36px] sm:min-h-[32px] sm:min-w-[32px] flex items-center justify-center"
              style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
              aria-label={dir === 'rtl' ? 'إغلاق' : 'Close'}
            >
              <span className="text-xl sm:text-2xl font-bold">×</span>
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

