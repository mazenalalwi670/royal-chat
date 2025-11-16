'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from '@/ui/card';
import { Button } from '@/ui/button';
import { Badge } from '@/ui/badge';
import { X, Crown, Sparkles, Star, Flame, Zap, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { AnimatedFrame, FrameConfig } from './AnimatedFrames';
import { AnimatedName, NameEffectConfig } from '../names/AnimatedName';
import { Avatar, AvatarFallback } from '@/ui/avatar';

interface RoyalFramesShowcaseProps {
  onClose?: () => void;
  onSelectFrame?: (frameConfig: FrameConfig) => void;
  onSelectNameEffect?: (effect: NameEffectConfig) => void;
}

// Royal luxury frame configurations
const royalFrames: FrameConfig[] = [
  {
    id: 'royal-gold',
    name: 'Royal Gold',
    nameAr: 'ذهبي ملكي',
    type: 'royal-gold',
    gradient: ['#FFD700', '#FFA500', '#FFD700'],
    glowColor: 'rgba(255, 215, 0, 0.9)',
    borderStyle: 'animated',
    animationSpeed: 'medium',
    particles: true,
    sparkles: true,
    glow: true,
    premium: true,
    price: 5
  },
  {
    id: 'royal-fire',
    name: 'Royal Flame',
    nameAr: 'لهب ملكي',
    type: 'royal-fire',
    gradient: ['#FF4500', '#FF6347', '#FFD700'],
    glowColor: 'rgba(255, 69, 0, 0.9)',
    borderStyle: 'animated',
    animationSpeed: 'fast',
    flames: true,
    particles: true,
    glow: true,
    premium: true,
    price: 5
  },
  {
    id: 'royal-rainbow',
    name: 'Royal Rainbow',
    nameAr: 'قوس قزح ملكي',
    type: 'royal-rainbow',
    gradient: ['#FF006E', '#8338EC', '#3A86FF', '#06FFA5', '#FFBE0B'],
    glowColor: 'rgba(168, 85, 247, 0.9)',
    borderStyle: 'animated',
    animationSpeed: 'medium',
    particles: true,
    sparkles: true,
    glow: true,
    premium: true,
    price: 5
  },
  {
    id: 'royal-diamond',
    name: 'Royal Diamond',
    nameAr: 'ألماس ملكي',
    type: 'royal-diamond',
    gradient: ['#00FFFF', '#0080FF', '#FFFFFF'],
    glowColor: 'rgba(0, 255, 255, 0.9)',
    borderStyle: 'animated',
    animationSpeed: 'slow',
    particles: true,
    sparkles: true,
    glow: true,
    premium: true,
    price: 5
  },
  {
    id: 'royal-platinum',
    name: 'Royal Platinum',
    nameAr: 'بلاتيني ملكي',
    type: 'royal-platinum',
    gradient: ['#E5E4E2', '#C0C0C0', '#FFFFFF'],
    glowColor: 'rgba(229, 228, 226, 0.9)',
    borderStyle: 'animated',
    animationSpeed: 'slow',
    particles: true,
    sparkles: true,
    glow: true,
    premium: true,
    price: 5
  },
  // Circular Frames
  {
    id: 'circular-gold',
    name: 'Circular Gold',
    nameAr: 'ذهبي دائري',
    type: 'circular-gold',
    gradient: ['#FFD700', '#FFA500', '#FFD700'],
    glowColor: 'rgba(255, 215, 0, 0.9)',
    borderStyle: 'circular',
    animationSpeed: 'medium',
    particles: true,
    sparkles: true,
    glow: true,
    premium: true,
    price: 5
  },
  {
    id: 'circular-rainbow',
    name: 'Circular Rainbow',
    nameAr: 'قوس قزح دائري',
    type: 'circular-rainbow',
    gradient: ['#FF006E', '#8338EC', '#3A86FF', '#06FFA5', '#FFBE0B'],
    glowColor: 'rgba(168, 85, 247, 0.9)',
    borderStyle: 'circular',
    animationSpeed: 'fast',
    particles: true,
    sparkles: true,
    glow: true,
    premium: true,
    price: 5
  },
  {
    id: 'circular-diamond',
    name: 'Circular Diamond',
    nameAr: 'ألماس دائري',
    type: 'circular-diamond',
    gradient: ['#00FFFF', '#0080FF', '#FFFFFF'],
    glowColor: 'rgba(0, 255, 255, 0.9)',
    borderStyle: 'circular',
    animationSpeed: 'slow',
    particles: true,
    sparkles: true,
    glow: true,
    premium: true,
    price: 5
  },
  // Dragon Animated Frame
  {
    id: 'dragon-animated',
    name: 'Dragon Frame',
    nameAr: 'إطار التنين',
    type: 'dragon-animated',
    gradient: ['#FF4500', '#FF6347', '#FFD700'],
    glowColor: 'rgba(255, 69, 0, 0.9)',
    borderStyle: 'dragon',
    animationSpeed: 'fast',
    flames: true,
    particles: true,
    glow: true,
    dragon: true,
    premium: true,
    price: 5
  },
  // Black Howling Frame
  {
    id: 'black-howling',
    name: 'Black Howling',
    nameAr: 'أسود يعوي',
    type: 'black-howling',
    gradient: ['#000000', '#1a1a1a', '#000000'],
    glowColor: 'rgba(255, 255, 255, 0.3)',
    borderStyle: 'howling',
    animationSpeed: 'fast',
    particles: true,
    glow: true,
    howling: true,
    premium: true,
    price: 5
  },
  // Premium Particle Frames - Circular Gems
  {
    id: 'circular-gem-diamond',
    name: 'Circular Gem Diamond',
    nameAr: 'جوهرة ماسية دائرية',
    type: 'circular-gold',
    gradient: ['#FFFFFF', '#E0E0E0', '#C0C0C0', '#FFFFFF'],
    glowColor: 'rgba(255, 255, 255, 0.95)',
    borderStyle: 'circular',
    animationSpeed: 'medium',
    particles: true,
    sparkles: true,
    glow: true,
    premium: true,
    price: 5,
    particleType: 'diamond',
    particleShape: 'circle'
  },
  {
    id: 'circular-gem-rainbow',
    name: 'Circular Gem Rainbow',
    nameAr: 'جوهرة قوس قزح دائرية',
    type: 'circular-rainbow',
    gradient: ['#FF006E', '#8338EC', '#3A86FF', '#06FFA5', '#FFBE0B'],
    glowColor: 'rgba(168, 85, 247, 0.95)',
    borderStyle: 'circular',
    animationSpeed: 'fast',
    particles: true,
    sparkles: true,
    glow: true,
    premium: true,
    price: 5,
    particleType: 'gem',
    particleShape: 'circle'
  },
  {
    id: 'circular-gem-gold',
    name: 'Circular Gem Gold',
    nameAr: 'جوهرة ذهبية دائرية',
    type: 'circular-gold',
    gradient: ['#FFD700', '#FFA500', '#FF6347'],
    glowColor: 'rgba(255, 215, 0, 0.95)',
    borderStyle: 'circular',
    animationSpeed: 'medium',
    particles: true,
    sparkles: true,
    glow: true,
    premium: true,
    price: 5,
    particleType: 'sparkle',
    particleShape: 'circle'
  },
  // Premium Particle Frames - Square Gems
  {
    id: 'square-gem-diamond',
    name: 'Square Gem Diamond',
    nameAr: 'جوهرة ماسية مربعة',
    type: 'royal-diamond',
    gradient: ['#FFFFFF', '#E0E0E0', '#C0C0C0', '#FFFFFF'],
    glowColor: 'rgba(255, 255, 255, 0.95)',
    borderStyle: 'animated',
    animationSpeed: 'medium',
    particles: true,
    sparkles: true,
    glow: true,
    premium: true,
    price: 5,
    particleType: 'diamond',
    particleShape: 'square'
  },
  {
    id: 'square-gem-rainbow',
    name: 'Square Gem Rainbow',
    nameAr: 'جوهرة قوس قزح مربعة',
    type: 'royal-rainbow',
    gradient: ['#FF006E', '#8338EC', '#3A86FF', '#06FFA5', '#FFBE0B'],
    glowColor: 'rgba(168, 85, 247, 0.95)',
    borderStyle: 'animated',
    animationSpeed: 'fast',
    particles: true,
    sparkles: true,
    glow: true,
    premium: true,
    price: 5,
    particleType: 'gem',
    particleShape: 'square'
  },
  {
    id: 'square-gem-luxury',
    name: 'Square Gem Luxury',
    nameAr: 'جوهرة فاخرة مربعة',
    type: 'royal-gold',
    gradient: ['#FFD700', '#FFA500', '#FF6347', '#FF1493', '#9370DB'],
    glowColor: 'rgba(255, 215, 0, 0.95)',
    borderStyle: 'animated',
    animationSpeed: 'medium',
    particles: true,
    sparkles: true,
    glow: true,
    premium: true,
    price: 5,
    particleType: 'luxury',
    particleShape: 'square'
  },
  // Mixed Particle Frames
  {
    id: 'mixed-gem-diamond',
    name: 'Mixed Gem Diamond',
    nameAr: 'جوهرة ماسية مختلطة',
    type: 'royal-diamond',
    gradient: ['#FFFFFF', '#E0E0E0', '#C0C0C0', '#A0A0A0', '#FFFFFF'],
    glowColor: 'rgba(255, 255, 255, 0.95)',
    borderStyle: 'animated',
    animationSpeed: 'medium',
    particles: true,
    sparkles: true,
    glow: true,
    premium: true,
    price: 5,
    particleType: 'crystal',
    particleShape: 'mixed'
  },
  {
    id: 'mixed-gem-rainbow',
    name: 'Mixed Gem Rainbow',
    nameAr: 'جوهرة قوس قزح مختلطة',
    type: 'royal-rainbow',
    gradient: ['#FF006E', '#8338EC', '#3A86FF', '#06FFA5', '#FFBE0B'],
    glowColor: 'rgba(168, 85, 247, 0.95)',
    borderStyle: 'animated',
    animationSpeed: 'fast',
    particles: true,
    sparkles: true,
    glow: true,
    premium: true,
    price: 5,
    particleType: 'luxury',
    particleShape: 'mixed'
  },
  {
    id: 'mixed-gem-premium',
    name: 'Mixed Gem Premium',
    nameAr: 'جوهرة مميزة مختلطة',
    type: 'royal-gold',
    gradient: ['#FFD700', '#FFA500', '#FF6347', '#FF1493', '#9370DB', '#00FFFF'],
    glowColor: 'rgba(255, 215, 0, 0.95)',
    borderStyle: 'animated',
    animationSpeed: 'medium',
    particles: true,
    sparkles: true,
    glow: true,
    premium: true,
    price: 5,
    particleType: 'luxury',
    particleShape: 'mixed'
  },
  // Royal Gem Frames - Like the ones shown in images
  {
    id: 'royal-gem-crown',
    name: 'Royal Gem Crown',
    nameAr: 'تاج الجوهرة الملكي',
    type: 'royal-gold',
    gradient: ['#FFD700', '#FFA500', '#DC143C', '#FFD700'],
    glowColor: 'rgba(255, 215, 0, 0.95)',
    borderStyle: 'animated',
    animationSpeed: 'medium',
    particles: true,
    sparkles: true,
    glow: true,
    premium: true,
    price: 10,
    particleType: 'gem',
    particleShape: 'circle',
    frameType: 'royal-gem-crown',
    hasCrown: true,
    hasWings: true,
    gemCount: 12
  },
  {
    id: 'royal-gem-emblem',
    name: 'Royal Gem Emblem',
    nameAr: 'شارة الجوهرة الملكية',
    type: 'royal-gold',
    gradient: ['#FFD700', '#4169E1', '#DC143C', '#FFD700'],
    glowColor: 'rgba(255, 215, 0, 0.95)',
    borderStyle: 'animated',
    animationSpeed: 'fast',
    particles: true,
    sparkles: true,
    glow: true,
    premium: true,
    price: 10,
    particleType: 'diamond',
    particleShape: 'mixed',
    frameType: 'royal-gem-emblem',
    hasCrown: true,
    hasEmblem: true,
    hasWings: true,
    gemCount: 14
  },
  {
    id: 'royal-gem-luxury',
    name: 'Royal Gem Luxury',
    nameAr: 'جوهرة ملكية فاخرة',
    type: 'royal-gold',
    gradient: ['#FFD700', '#FFA500', '#DC143C', '#4169E1', '#50C878', '#FFD700'],
    glowColor: 'rgba(255, 215, 0, 0.95)',
    borderStyle: 'animated',
    animationSpeed: 'medium',
    particles: true,
    sparkles: true,
    glow: true,
    premium: true,
    price: 10,
    particleType: 'luxury',
    particleShape: 'mixed',
    frameType: 'royal-gem-luxury',
    hasCrown: true,
    hasEmblem: true,
    hasWings: true,
    gemCount: 16
  },
  // New Royal Gem Frame - Exact replica
  {
    id: 'royal-gem-crown-replica',
    name: 'Royal Gem Crown Replica',
    nameAr: 'تاج الجوهرة الملكي المطابق',
    type: 'royal-gold',
    gradient: ['#FFD700', '#FFA500', '#DC143C', '#FFD700'],
    glowColor: 'rgba(255, 215, 0, 0.95)',
    borderStyle: 'animated',
    animationSpeed: 'medium',
    particles: true,
    sparkles: true,
    glow: true,
    premium: true,
    price: 10,
    particleType: 'gem',
    particleShape: 'circle',
    frameType: 'royal-gem-crown',
    hasCrown: true,
    hasWings: true,
    gemCount: 12
  }
];

// Royal luxury name effects
const royalNameEffects: NameEffectConfig[] = [
  {
    type: 'flame',
    colors: ['#FF4500', '#FF6347', '#FFD700'],
    speed: 'fast',
    glow: true,
    flames: true,
    sparkles: false,
    particles: true,
    particleType: 'sparkle',
    particleShape: 'circle'
  },
  {
    type: 'gradient-flow',
    colors: ['#FF006E', '#8338EC', '#3A86FF'],
    speed: 'medium',
    glow: true,
    sparkles: true,
    flames: false,
    particles: true,
    particleType: 'gem',
    particleShape: 'mixed'
  },
  {
    type: 'rainbow',
    colors: ['#FF006E', '#8338EC', '#3A86FF', '#06FFA5', '#FFBE0B'],
    speed: 'medium',
    glow: true,
    sparkles: true,
    flames: false,
    particles: true,
    particleType: 'luxury',
    particleShape: 'mixed'
  },
  {
    type: 'gold-shine',
    colors: ['#FFD700', '#FFA500', '#FFD700'],
    speed: 'slow',
    glow: true,
    sparkles: true,
    flames: false,
    particles: true,
    particleType: 'diamond',
    particleShape: 'circle'
  },
  // Premium Particle Name Effects
  {
    type: 'gradient-flow',
    colors: ['#FFFFFF', '#E0E0E0', '#C0C0C0', '#FFFFFF'],
    speed: 'medium',
    glow: true,
    sparkles: true,
    flames: false,
    particles: true,
    particleType: 'diamond',
    particleShape: 'square'
  },
  {
    type: 'rainbow',
    colors: ['#FFD700', '#FFA500', '#FF6347', '#FF1493', '#9370DB'],
    speed: 'fast',
    glow: true,
    sparkles: true,
    flames: false,
    particles: true,
    particleType: 'gem',
    particleShape: 'mixed'
  },
  {
    type: 'gold-shine',
    colors: ['#00FFFF', '#0080FF', '#8000FF', '#FF00FF'],
    speed: 'medium',
    glow: true,
    sparkles: true,
    flames: false,
    particles: true,
    particleType: 'crystal',
    particleShape: 'mixed'
  }
];

export function RoyalFramesShowcase({
  onClose,
  onSelectFrame,
  onSelectNameEffect
}: RoyalFramesShowcaseProps) {
  const { dir } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'frames' | 'names'>('frames');
  const scrollRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Minimum swipe distance (in pixels)
  const minSwipeDistance = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchEndX.current = null;
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) {
      touchStartX.current = null;
      touchEndX.current = null;
      return;
    }
    
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    // For RTL, reverse the swipe direction
    if (dir === 'rtl') {
      if (isRightSwipe && currentIndex < royalFrames.length - 1) {
        goToNext();
      } else if (isLeftSwipe && currentIndex > 0) {
        goToPrevious();
      }
    } else {
      if (isLeftSwipe && currentIndex < royalFrames.length - 1) {
        goToNext();
      } else if (isRightSwipe && currentIndex > 0) {
        goToPrevious();
      }
    }

    // Reset touch positions
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const goToNext = () => {
    if (currentIndex < royalFrames.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0); // Loop back to start
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      setCurrentIndex(royalFrames.length - 1); // Loop to end
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      const cardWidth = 288; // w-72 = 18rem = 288px
      const gap = 16; // gap-4 = 1rem = 16px
      scrollRef.current.scrollTo({
        left: currentIndex * (cardWidth + gap),
        behavior: 'smooth'
      });
    }
  }, [currentIndex]);

  useEffect(() => {
    if (selectedTab === 'frames' && royalFrames.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % royalFrames.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [selectedTab]);

  if (!isVisible) return null;

  return (
    <div className="relative z-50 animate-slide-in-down w-full">
      <Card className={cn(
        "relative overflow-hidden border-2 shadow-2xl w-full",
        "bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900",
        "border-purple-500/40 backdrop-blur-md",
        "royal-showcase-banner"
      )}>
        {/* Animated Background - Royal luxury style */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-blue-600/20 animate-pulse-slow" />
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/30 rounded-full blur-3xl animate-float-slow" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500/30 rounded-full blur-3xl animate-float-slow" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full opacity-60 animate-float-particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>

        {/* Shine Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shine" />

        {/* Content */}
        <div className="relative p-6" dir={dir}>
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 rounded-full blur-xl opacity-70 animate-pulse" />
                <div className="relative w-16 h-16 bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 rounded-full flex items-center justify-center shadow-2xl">
                  <TrendingUp className="w-8 h-8 text-white animate-bounce-slow" />
                </div>
                <div className="absolute -top-1 -right-1">
                  <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
                </div>
              </div>
              <div>
                <h3 className={cn(
                  "font-bold text-2xl bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent",
                  "animate-gradient-text drop-shadow-lg"
                )}>
                  {dir === 'rtl' ? 'الإطارات الملكية الفاخرة' : 'Royal Luxury Frames'}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {dir === 'rtl' ? 'أشكال ملكية متحركة بتأثيرات حقيقية فاخرة' : 'Royal animated frames with luxurious real effects'}
                </p>
              </div>
            </div>
            {onClose && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  setIsVisible(false);
                  onClose?.();
                }}
                className="h-10 w-10 rounded-full hover:bg-red-500/20 hover:text-red-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </Button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <Button
              type="button"
              variant={selectedTab === 'frames' ? 'default' : 'outline'}
              onClick={() => setSelectedTab('frames')}
              className={cn(
                selectedTab === 'frames' && "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
                "transition-all duration-300"
              )}
            >
              <Crown className="w-4 h-4 mr-2" />
              {dir === 'rtl' ? 'الإطارات' : 'Frames'}
            </Button>
            <Button
              type="button"
              variant={selectedTab === 'names' ? 'default' : 'outline'}
              onClick={() => setSelectedTab('names')}
              className={cn(
                selectedTab === 'names' && "bg-gradient-to-r from-pink-500 to-blue-500 text-white",
                "transition-all duration-300"
              )}
            >
              <Flame className="w-4 h-4 mr-2" />
              {dir === 'rtl' ? 'الأسماء المتحركة' : 'Animated Names'}
            </Button>
          </div>

          {/* Frames Tab */}
          {selectedTab === 'frames' && (
            <div className="space-y-4 relative">
              {/* Navigation Arrows */}
              {royalFrames.length > 1 && (
                <>
                  <div className={cn(
                    "absolute top-1/2 -translate-y-1/2 z-20",
                    dir === 'rtl' ? "right-0 translate-x-4" : "left-0 -translate-x-4"
                  )}>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={goToPrevious}
                      className={cn(
                        "h-14 w-14 rounded-full bg-gradient-to-r from-purple-500/90 to-pink-500/90 hover:from-purple-600 hover:to-pink-600",
                        "text-white border-2 border-purple-400/60 shadow-2xl backdrop-blur-md",
                        "transition-all duration-300 hover:scale-110 active:scale-95",
                        "hover:shadow-purple-500/50"
                      )}
                    >
                      {dir === 'rtl' ? (
                        <ChevronRight className="w-7 h-7" />
                      ) : (
                        <ChevronLeft className="w-7 h-7" />
                      )}
                    </Button>
                  </div>

                  <div className={cn(
                    "absolute top-1/2 -translate-y-1/2 z-20",
                    dir === 'rtl' ? "left-0 -translate-x-4" : "right-0 translate-x-4"
                  )}>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={goToNext}
                      className={cn(
                        "h-14 w-14 rounded-full bg-gradient-to-r from-purple-500/90 to-pink-500/90 hover:from-purple-600 hover:to-pink-600",
                        "text-white border-2 border-purple-400/60 shadow-2xl backdrop-blur-md",
                        "transition-all duration-300 hover:scale-110 active:scale-95",
                        "hover:shadow-purple-500/50"
                      )}
                    >
                      {dir === 'rtl' ? (
                        <ChevronLeft className="w-7 h-7" />
                      ) : (
                        <ChevronRight className="w-7 h-7" />
                      )}
                    </Button>
                  </div>
                </>
              )}

              {/* Horizontal Scroll Container */}
              <div
                ref={scrollRef}
                className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4 px-12"
                style={{ scrollBehavior: 'smooth' }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {royalFrames.map((frame, index) => (
                  <div
                    key={frame.id}
                    className={cn(
                      "relative flex-shrink-0 w-72 snap-center",
                      "transform transition-all duration-500"
                    )}
                  >
                    <Card
                      className={cn(
                        "relative overflow-hidden border-2 transition-all duration-300 cursor-pointer group",
                        "hover:scale-105 active:scale-95",
                        index === currentIndex
                          ? "border-purple-500 bg-gradient-to-br from-purple-500/30 to-pink-500/30 shadow-2xl ring-2 ring-purple-400/50"
                          : "border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-pink-500/10 hover:border-purple-500/50"
                      )}
                      onClick={() => onSelectFrame?.(frame)}
                    >
                      {/* Frame Preview */}
                      <div className="flex justify-center p-6 mb-4">
                        <AnimatedFrame frameConfig={frame} size="large">
                          <Avatar className="w-full h-full">
                            <AvatarFallback className="bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                              <Crown className="w-12 h-12 text-purple-400" />
                            </AvatarFallback>
                          </Avatar>
                        </AnimatedFrame>
                      </div>

                      <div className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-lg text-white">
                            {dir === 'rtl' ? frame.nameAr : frame.name}
                          </h4>
                          {index === 0 && (
                            <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 animate-pulse">
                              <Star className="w-3 h-3 mr-1" />
                              {dir === 'rtl' ? 'الأكثر' : 'Popular'}
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                            ${frame.price}
                          </span>
                          <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                            {dir === 'rtl' ? 'مدى الحياة' : 'Lifetime'}
                          </Badge>
                        </div>

                        <div className="flex gap-2">
                          {frame.flames && (
                            <Badge variant="outline" className="border-orange-500/50 text-orange-400 text-xs">
                              <Flame className="w-3 h-3 mr-1" />
                              {dir === 'rtl' ? 'لهب' : 'Fire'}
                            </Badge>
                          )}
                          {frame.sparkles && (
                            <Badge variant="outline" className="border-yellow-500/50 text-yellow-400 text-xs">
                              <Sparkles className="w-3 h-3 mr-1" />
                              {dir === 'rtl' ? 'بريق' : 'Sparkles'}
                            </Badge>
                          )}
                          {frame.particles && (
                            <Badge variant="outline" className="border-blue-500/50 text-blue-400 text-xs">
                              <Zap className="w-3 h-3 mr-1" />
                              {dir === 'rtl' ? 'جزيئات' : 'Particles'}
                            </Badge>
                          )}
                        </div>

                        {/* Frame is activated on click - no button needed */}
                        <div className="text-center py-2">
                          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                            {dir === 'rtl' ? 'اضغط للتفعيل' : 'Click to Activate'}
                          </Badge>
                        </div>
                      </div>

                      {/* Hover Glow */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 opacity-0 group-hover:opacity-100" />
                    </Card>
                  </div>
                ))}
              </div>

              {/* Navigation Dots */}
              <div className="flex justify-center gap-2">
                {royalFrames.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setCurrentIndex(index)}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all duration-300",
                      index === currentIndex
                        ? "bg-purple-500 w-8 shadow-lg shadow-purple-500/50"
                        : "bg-purple-500/30 hover:bg-purple-500/50"
                    )}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Names Tab */}
          {selectedTab === 'names' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {royalNameEffects.map((effect, index) => (
                <Card
                  key={index}
                  className={cn(
                    "relative overflow-hidden border-2 cursor-pointer group transition-all duration-300",
                    "hover:scale-105 active:scale-95",
                    "border-pink-500/30 bg-gradient-to-br from-pink-500/10 to-blue-500/10 hover:border-pink-500/50"
                  )}
                  onClick={() => onSelectNameEffect?.(effect)}
                >
                  <div className="p-6 space-y-4">
                    <div className="flex justify-center">
                      <AnimatedName
                        name={dir === 'rtl' ? 'اسم المستخدم المميز' : 'Premium User Name'}
                        effect={effect}
                        size="lg"
                      />
                    </div>

                    <div className="text-center">
                      <h4 className="font-bold text-lg text-white mb-2 capitalize">
                        {effect.type.replace('-', ' ')}
                      </h4>
                      <Badge variant="outline" className="border-pink-500/50 text-pink-400 text-xs">
                        {dir === 'rtl' ? `السرعة: ${effect.speed}` : `Speed: ${effect.speed}`}
                      </Badge>
                    </div>

                    {/* Name effect is activated on click - no button needed */}
                    <div className="text-center py-2">
                      <Badge className="bg-gradient-to-r from-pink-500 to-blue-500 text-white border-0">
                        {dir === 'rtl' ? 'اضغط للتفعيل' : 'Click to Activate'}
                      </Badge>
                    </div>
                  </div>

                  {/* Hover Glow */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 opacity-0 group-hover:opacity-100" />
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-4 left-4 text-purple-400/20 text-4xl animate-float-slow">✨</div>
        <div className="absolute bottom-4 right-4 text-pink-400/20 text-4xl animate-float-slow" style={{ animationDelay: '0.5s' }}>💎</div>
        <div className="absolute top-1/2 right-8 text-blue-300/20 text-3xl animate-float-slow" style={{ animationDelay: '1s' }}>⭐</div>
      </Card>
    </div>
  );
}

