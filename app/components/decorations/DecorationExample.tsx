'use client';

import { AnimatedTopBar } from './AnimatedTopBar';
import { AnimatedDecorations } from './AnimatedDecorations';
import { LuxuryNameFrame } from './LuxuryNameFrames';
import { PremiumBadge } from '../icons/ModernIcons';
import { useLanguage } from '@/contexts/LanguageContext';

/**
 * Example component showing how to use all the modern decorations
 * This can be integrated into group chats, subscription pages, etc.
 */
export function DecorationExample() {
  const { dir } = useLanguage();

  return (
    <div className="space-y-8 p-6" dir={dir}>
      {/* Animated Top Bar */}
      <section>
        <h2 className="text-2xl font-bold mb-4">
          {dir === 'rtl' ? 'شريط علوي متحرك' : 'Animated Top Bar'}
        </h2>
        <AnimatedTopBar
          title={dir === 'rtl' ? 'الدردشة الملكية المميزة' : 'Premium Royal Chat'}
          subtitle={dir === 'rtl' ? 'تجربة فاخرة للدردشة' : 'Luxury chat experience'}
          showStats={true}
          premiumCount={42}
          totalUsers={1250}
        />
      </section>

      {/* Luxury Name Frames */}
      <section>
        <h2 className="text-2xl font-bold mb-4">
          {dir === 'rtl' ? 'إطارات الأسماء الفاخرة' : 'Luxury Name Frames'}
        </h2>
        <div className="flex flex-wrap gap-4">
          <LuxuryNameFrame name="الملك" frameStyle="royal-crown" size="medium" animated glow />
          <LuxuryNameFrame name="Gold Star" frameStyle="golden-star" size="medium" animated glow />
          <LuxuryNameFrame name="Diamond" frameStyle="diamond-gem" size="medium" animated glow />
          <LuxuryNameFrame name="Platinum" frameStyle="platinum-luxury" size="medium" animated glow />
          <LuxuryNameFrame name="Rainbow" frameStyle="rainbow-sparkle" size="medium" animated glow />
          <LuxuryNameFrame name="Electric" frameStyle="electric-zap" size="medium" animated glow />
          <LuxuryNameFrame name="Premium" frameStyle="premium-gold" size="medium" animated glow />
        </div>
      </section>

      {/* Premium Badges */}
      <section>
        <h2 className="text-2xl font-bold mb-4">
          {dir === 'rtl' ? 'شارات الاشتراكات المميزة' : 'Premium Subscription Badges'}
        </h2>
        <div className="flex flex-wrap gap-4">
          <PremiumBadge text={dir === 'rtl' ? 'ذهبي' : 'Gold'} variant="gold" size="md" animated />
          <PremiumBadge text={dir === 'rtl' ? 'بلاتيني' : 'Platinum'} variant="platinum" size="md" animated />
          <PremiumBadge text={dir === 'rtl' ? 'ألماسي' : 'Diamond'} variant="diamond" size="md" animated />
        </div>
      </section>

      {/* Animated Decorations */}
      <section>
        <h2 className="text-2xl font-bold mb-4">
          {dir === 'rtl' ? 'زخارف متحركة' : 'Animated Decorations'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatedDecorations type="premium" intensity="medium" className="p-8 rounded-lg">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">{dir === 'rtl' ? 'مميز' : 'Premium'}</h3>
              <p className="text-muted-foreground">
                {dir === 'rtl' 
                  ? 'زخارف مميزة مع تأثيرات ذهبية' 
                  : 'Premium decorations with golden effects'}
              </p>
            </div>
          </AnimatedDecorations>

          <AnimatedDecorations type="royal" intensity="high" className="p-8 rounded-lg">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">{dir === 'rtl' ? 'ملكي' : 'Royal'}</h3>
              <p className="text-muted-foreground">
                {dir === 'rtl' 
                  ? 'زخارف ملكية فاخرة' 
                  : 'Luxury royal decorations'}
              </p>
            </div>
          </AnimatedDecorations>

          <AnimatedDecorations type="diamond" intensity="high" className="p-8 rounded-lg">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">{dir === 'rtl' ? 'ألماسي' : 'Diamond'}</h3>
              <p className="text-muted-foreground">
                {dir === 'rtl' 
                  ? 'زخارف ألماسية متألقة' 
                  : 'Sparkling diamond decorations'}
              </p>
            </div>
          </AnimatedDecorations>

          <AnimatedDecorations type="gold" intensity="low" className="p-8 rounded-lg">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">{dir === 'rtl' ? 'ذهبي' : 'Gold'}</h3>
              <p className="text-muted-foreground">
                {dir === 'rtl' 
                  ? 'زخارف ذهبية أنيقة' 
                  : 'Elegant golden decorations'}
              </p>
            </div>
          </AnimatedDecorations>
        </div>
      </section>
    </div>
  );
}


