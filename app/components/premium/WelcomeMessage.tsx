'use client';

import { Card, CardContent } from '@/ui/card';
import { Button } from '@/ui/button';
import { CheckCircle2, Crown, Sparkles, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface WelcomeMessageProps {
  onContinue: () => void;
}

export function WelcomeMessage({ onContinue }: WelcomeMessageProps) {
  const { dir } = useLanguage();

  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-primary/10 via-background to-primary/5" dir={dir}>
      <Card className="w-full max-w-2xl border-2 border-primary/20 shadow-2xl">
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            {/* Success Icon */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                  <CheckCircle2 className="w-12 h-12 text-white" />
                </div>
                <Sparkles className="w-8 h-8 text-primary absolute -top-2 -right-2 animate-pulse" />
              </div>
            </div>

            {/* Welcome Title */}
            <div className="space-y-2">
              <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
                <Crown className="w-8 h-8 text-primary" />
                <span style={{ color: `hsl(var(--primary))` }}>
                  {dir === 'rtl' ? 'مرحباً بك في الدردشة المميزة!' : 'Welcome to Premium Chat!'}
                </span>
              </h1>
              <p className="text-lg text-muted-foreground">
                {dir === 'rtl' 
                  ? 'تم تأكيد اشتراكك بنجاح 🎉'
                  : 'Your subscription has been confirmed successfully 🎉'}
              </p>
            </div>

            {/* Success Message */}
            <div className="bg-primary/10 rounded-lg p-6 space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div className="text-left">
                  <p className="font-semibold">
                    {dir === 'rtl' ? 'اشتراك مدى الحياة مفعّل' : 'Lifetime Subscription Activated'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {dir === 'rtl' 
                      ? 'يمكنك الآن الدخول إلى الدردشة الجماعية المميزة في أي وقت'
                      : 'You can now access the premium group chat anytime'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div className="text-left">
                  <p className="font-semibold">
                    {dir === 'rtl' ? 'مجتمع حصري' : 'Exclusive Community'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {dir === 'rtl' 
                      ? 'انضم إلى مجتمع من المحترفين والمبدعين من جميع أنحاء العالم'
                      : 'Join a community of professionals and creatives from around the world'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div className="text-left">
                  <p className="font-semibold">
                    {dir === 'rtl' ? 'دعم فني مخصص' : 'Dedicated Support'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {dir === 'rtl' 
                      ? 'احصل على دعم فني مخصص على مدار الساعة'
                      : 'Get dedicated support 24/7'}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-4">
              <Button
                onClick={onContinue}
                size="lg"
                className="w-full"
                style={{
                  background: `linear-gradient(135deg, hsl(var(--chat-from)), hsl(var(--chat-to)))`
                }}
              >
                <span>{dir === 'rtl' ? 'ادخل إلى الدردشة الآن' : 'Enter Chat Now'}</span>
                <ArrowRight className={cn('w-5 h-5', dir === 'rtl' ? 'mr-2' : 'ml-2')} />
              </Button>
            </div>

            {/* Footer */}
            <div className="text-sm text-muted-foreground pt-4">
              <p>
                {dir === 'rtl' 
                  ? 'شكراً لثقتك بنا! استمتع بتجربتك المميزة 🚀'
                  : 'Thank you for your trust! Enjoy your premium experience 🚀'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

