'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/ui/card';
import { Button } from '@/ui/button';
import { Badge } from '@/ui/badge';
import { X, Crown, Sparkles, ArrowRight, Star, Zap } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface Advertisement {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  buttonText: string;
  buttonTextAr: string;
  link?: string;
  type: 'subscription' | 'premium' | 'feature';
  isActive: boolean;
  createdAt: Date;
  expiresAt?: Date;
}

interface PremiumAdvertisementBannerProps {
  advertisement: Advertisement;
  onClose: () => void;
  onAction?: () => void;
}

export function PremiumAdvertisementBanner({
  advertisement,
  onClose,
  onAction
}: PremiumAdvertisementBannerProps) {
  const { dir } = useLanguage();
  const [isVisible, setIsVisible] = useState(true);
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 300);
  };

  if (!isVisible) return null;

  const title = dir === 'rtl' ? advertisement.titleAr : advertisement.title;
  const description = dir === 'rtl' ? advertisement.descriptionAr : advertisement.description;
  const buttonText = dir === 'rtl' ? advertisement.buttonTextAr : advertisement.buttonText;

  return (
    <div
      className={cn(
        "relative z-50 animate-slide-in-down",
        isClosing && "animate-slide-out-up"
      )}
    >
      <Card className={cn(
        "relative overflow-hidden border-2 shadow-2xl",
        "bg-gradient-to-r from-yellow-500/10 via-amber-500/10 to-yellow-500/10",
        "border-yellow-500/30 backdrop-blur-md",
        "premium-ad-banner"
      )}>
        {/* Animated Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-yellow-500/5 via-amber-500/5 to-yellow-500/5 animate-pulse-slow" />
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-yellow-400/20 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-amber-400/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        </div>

        {/* Shine Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shine" />

        {/* Content */}
        <div className="relative p-4 flex items-center gap-4" dir={dir}>
          {/* Icon */}
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full blur-lg opacity-50 animate-pulse" />
            <div className="relative w-16 h-16 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg">
              <Crown className="w-8 h-8 text-white animate-bounce-slow" />
            </div>
            <div className="absolute -top-1 -right-1">
              <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
            </div>
          </div>

          {/* Text Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className={cn(
                "font-bold text-lg bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent",
                "animate-gradient"
              )}>
                {title}
              </h3>
              <Badge 
                variant="secondary" 
                className="bg-yellow-500/20 text-yellow-700 border-yellow-500/30 text-xs px-2 py-0.5 animate-pulse"
              >
                <Star className="w-3 h-3 mr-1" />
                {dir === 'rtl' ? 'مميز' : 'Premium'}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {description}
            </p>
          </div>

          {/* Action Button */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              type="button"
              onClick={onAction}
              className={cn(
                "bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600",
                "text-white font-semibold shadow-lg transition-all duration-300",
                "hover:scale-105 active:scale-95",
                "premium-ad-button"
              )}
              size="sm"
            >
              {buttonText}
              <ArrowRight className={cn("w-4 h-4", dir === 'rtl' ? 'mr-2 rotate-180' : 'ml-2')} />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-8 w-8 rounded-full hover:bg-red-500/10 hover:text-red-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-2 left-4 text-yellow-400/20 text-2xl animate-float-slow">✨</div>
        <div className="absolute bottom-2 right-4 text-amber-400/20 text-2xl animate-float-slow" style={{ animationDelay: '0.5s' }}>⭐</div>
        <div className="absolute top-1/2 right-8 text-yellow-300/20 text-xl animate-float-slow" style={{ animationDelay: '1s' }}>💫</div>
      </Card>
    </div>
  );
}

