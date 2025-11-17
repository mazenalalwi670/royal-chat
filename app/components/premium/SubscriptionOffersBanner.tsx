'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/ui/card';
import { Button } from '@/ui/button';
import { Badge } from '@/ui/badge';
import { Crown, Sparkles, Star, Zap, Gem, Trophy, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface SubscriptionOffer {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  price: string;
  originalPrice?: string;
  discount?: string;
  features: string[];
  featuresAr: string[];
  frameId: string;
  isPopular?: boolean;
}

interface SubscriptionOffersBannerProps {
  offers: SubscriptionOffer[];
  onSelectOffer: (offer: SubscriptionOffer) => void;
  onClose?: () => void;
}

export function SubscriptionOffersBanner({
  offers,
  onSelectOffer,
  onClose
}: SubscriptionOffersBannerProps) {
  const { dir } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (offers.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % offers.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [offers.length]);

  if (!isVisible || offers.length === 0) return null;

  const currentOffer = offers[currentIndex];

  return (
    <div className="relative z-50 animate-slide-in-down">
      <Card className={cn(
        "relative overflow-hidden border-2 shadow-2xl",
        "bg-gradient-to-r from-yellow-500/20 via-amber-500/20 to-yellow-500/20",
        "border-yellow-500/40 backdrop-blur-md",
        "premium-offers-banner"
      )}>
        {/* Animated Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-yellow-500/10 via-amber-500/10 to-yellow-500/10 animate-pulse-slow" />
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-yellow-400/30 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-amber-400/30 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        </div>

        {/* Shine Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shine" />

        {/* Content */}
        <div className="relative p-6" dir={dir}>
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full blur-lg opacity-50 animate-pulse" />
                <div className="relative w-14 h-14 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg">
                  <Crown className="w-8 h-8 text-white animate-bounce-slow" />
                </div>
                <div className="absolute -top-1 -right-1">
                  <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
                </div>
              </div>
              <div>
                <h3 className={cn(
                  "font-bold text-xl bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent",
                  "animate-gradient"
                )}>
                  {dir === 'rtl' ? 'عروض الاشتراك الملكية' : 'Royal Subscription Offers'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {dir === 'rtl' ? 'اختر بروازك الذهبي الفاخر' : 'Choose your luxurious golden frame'}
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
                className="h-8 w-8 rounded-full hover:bg-red-500/10 hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Offer Display */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {offers.map((offer, index) => (
              <button
                key={offer.id}
                type="button"
                onClick={() => onSelectOffer(offer)}
                className={cn(
                  "relative p-4 rounded-xl border-2 transition-all duration-300",
                  "hover:scale-105 active:scale-95 cursor-pointer text-left",
                  "overflow-hidden group",
                  index === currentIndex
                    ? "border-yellow-500 bg-gradient-to-br from-yellow-500/30 to-amber-500/30 shadow-xl ring-2 ring-yellow-400/50"
                    : "border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 to-amber-500/10 hover:border-yellow-500/50"
                )}
              >
                {offer.isPopular && (
                  <div className="absolute top-2 right-2 z-10">
                    <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 animate-pulse">
                      <Star className="w-3 h-3 mr-1" />
                      {dir === 'rtl' ? 'الأكثر' : 'Popular'}
                    </Badge>
                  </div>
                )}

                {/* Frame Preview */}
                <div className="flex justify-center mb-3">
                  <div className={cn(
                    "relative rounded-full p-1",
                    "bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500",
                    "animate-pulse-slow premium-frame-preview",
                    offer.frameId === 'royal-gold' && "premium-frame-royal-gold",
                    offer.frameId === 'diamond-platinum' && "premium-frame-diamond-platinum",
                    offer.frameId === 'crown-emerald' && "premium-frame-crown-emerald",
                    offer.frameId === 'luxury-ruby' && "premium-frame-luxury-ruby"
                  )}>
                    <div className="w-16 h-16 rounded-full bg-background flex items-center justify-center">
                      <Crown className="w-8 h-8 text-yellow-500" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-lg">
                    {dir === 'rtl' ? offer.titleAr : offer.title}
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-yellow-600">
                      {offer.price}
                    </span>
                    {offer.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        {offer.originalPrice}
                      </span>
                    )}
                    {offer.discount && (
                      <Badge variant="secondary" className="bg-green-500/20 text-green-600">
                        {offer.discount}
                      </Badge>
                    )}
                  </div>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {offer.features.slice(0, 2).map((feature, i) => (
                      <li key={i} className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500" />
                        {dir === 'rtl' ? offer.featuresAr[i] : feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </button>
            ))}
          </div>

          {/* Navigation Dots */}
          {offers.length > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              {offers.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setCurrentIndex(index)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    index === currentIndex
                      ? "bg-yellow-500 w-6"
                      : "bg-yellow-500/30 hover:bg-yellow-500/50"
                  )}
                />
              ))}
            </div>
          )}
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-4 left-4 text-yellow-400/20 text-3xl animate-float-slow">👑</div>
        <div className="absolute bottom-4 right-4 text-amber-400/20 text-3xl animate-float-slow" style={{ animationDelay: '0.5s' }}>💎</div>
        <div className="absolute top-1/2 right-8 text-yellow-300/20 text-2xl animate-float-slow" style={{ animationDelay: '1s' }}>✨</div>
      </Card>
    </div>
  );
}



