'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card';
import { Button } from '@/ui/button';
import { Badge } from '@/ui/badge';
import { UsersRound, Lock, CheckCircle2, Crown, Sparkles, Building2 } from 'lucide-react';
import { User } from '@/types/chat';
import { Subscription } from '@/types/subscription';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { PaymentPage } from './PaymentPage';
import { WelcomeMessage } from './WelcomeMessage';
import { PremiumChatInterface } from './PremiumChatInterface';

interface PremiumChatPageProps {
  currentUser: User;
}

export function PremiumChatPage({ currentUser }: PremiumChatPageProps) {
  const { t, dir } = useLanguage();
  const { isAdmin, user: adminUser } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const checkSubscription = async () => {
    setIsLoading(true);
    try {
      // Skip check for admin
      if (isAdmin && adminUser) {
        setIsLoading(false);
        return;
      }
      // In a real app, this would be an API call
      const savedSubscription = localStorage.getItem(`subscription_${currentUser.id}`);
      if (savedSubscription) {
        const sub = JSON.parse(savedSubscription);
        setSubscription(sub);
        if (sub.status === 'active') {
          setShowWelcome(false);
        }
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Check subscription status (including admin access)
  useEffect(() => {
    if (isAdmin && adminUser) {
      // Admin gets free access
      const adminSubscription: Subscription = {
        id: 'admin-sub',
        userId: adminUser.id,
        status: 'active',
        plan: 'lifetime',
        amount: 0,
        currency: 'USD',
        purchaseDate: new Date(),
        paymentMethod: 'admin',
        paymentId: 'admin-access',
        transactionId: 'admin-access'
      };
      setSubscription(adminSubscription);
      setIsLoading(false);
    } else {
      // Regular user - check subscription
      checkSubscription();
    }
  }, [currentUser.id, isAdmin, adminUser]);

  const handlePaymentSuccess = (subscriptionData: Subscription) => {
    setSubscription(subscriptionData);
    setPaymentSuccess(true);
    setShowPayment(false);
    // For bank transfer, show pending message instead of welcome
    if (subscriptionData.paymentMethod === 'bank_transfer' && subscriptionData.status === 'pending') {
      // Don't show welcome message for pending bank transfers
      setShowWelcome(false);
    } else {
      setShowWelcome(true);
    }
    // Save to localStorage (in real app, this would be saved to database)
    localStorage.setItem(`subscription_${currentUser.id}`, JSON.stringify(subscriptionData));
  };

  const isSubscribed = subscription?.status === 'active' || isAdmin; // Admin always has access

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center" dir={dir}>
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">{dir === 'rtl' ? 'جاري التحميل...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  // Show pending message for bank transfers
  if (subscription?.status === 'pending' && subscription?.paymentMethod === 'bank_transfer') {
    return (
      <div className="flex-1 flex items-center justify-center p-6" dir={dir}>
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Building2 className="w-16 h-16 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">
              {dir === 'rtl' ? 'في انتظار التأكيد' : 'Pending Confirmation'}
            </CardTitle>
            <CardDescription className="text-lg mt-2">
              {dir === 'rtl' 
                ? 'سيتم تفعيل اشتراكك بعد تأكيد التحويل البنكي'
                : 'Your subscription will be activated after bank transfer confirmation'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                {dir === 'rtl' 
                  ? '✅ تم استلام طلب الاشتراك الخاص بك'
                  : '✅ Your subscription request has been received'}
              </p>
              <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-2">
                {dir === 'rtl' 
                  ? '⏳ سيتم تفعيل اشتراكك خلال 24 ساعة بعد تأكيد التحويل البنكي'
                  : '⏳ Your subscription will be activated within 24 hours after bank transfer confirmation'}
              </p>
              <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-2">
                {dir === 'rtl' 
                  ? '📧 ستصلك رسالة تأكيد على بريدك الإلكتروني عند التفعيل'
                  : '📧 You will receive a confirmation email when activated'}
              </p>
            </div>
            <Button
              onClick={() => {
                // Refresh subscription status
                checkSubscription();
              }}
              className="w-full"
              variant="outline"
            >
              {dir === 'rtl' ? 'تحديث الحالة' : 'Refresh Status'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show welcome message after payment (not for pending bank transfers)
  if (showWelcome && paymentSuccess && subscription?.status === 'active') {
    return <WelcomeMessage onContinue={() => setShowWelcome(false)} />;
  }

  // Show payment page
  if (showPayment) {
    return (
      <PaymentPage
        currentUser={currentUser}
        onSuccess={handlePaymentSuccess}
        onCancel={() => setShowPayment(false)}
      />
    );
  }

  // Show premium chat if subscribed or admin
  if (isSubscribed) {
    const activeSubscription = isAdmin && adminUser
      ? ({
          id: 'admin-sub',
          userId: adminUser.id,
          status: 'active' as const,
          plan: 'lifetime' as const,
          amount: 0,
          currency: 'USD',
          purchaseDate: new Date(),
          paymentMethod: 'admin' as const,
          paymentId: 'admin-access',
          transactionId: 'admin-access'
        } as Subscription)
      : subscription!;
    return <PremiumChatInterface currentUser={currentUser} subscription={activeSubscription} />;
  }

  // Show subscription page if not subscribed
  return (
    <div className="flex-1 flex items-start sm:items-center justify-center p-4 sm:p-6 overflow-y-auto" dir={dir}>
      <Card className="w-full max-w-2xl my-4 sm:my-6">
        <CardHeader className="text-center p-4 sm:p-6">
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="relative">
              <Crown className="w-14 h-14 sm:w-20 sm:h-20 text-primary" />
              <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-primary absolute -top-1 -right-1 sm:-top-2 sm:-right-2 animate-pulse" />
            </div>
          </div>
          <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3">
            {dir === 'rtl' ? 'الدردشة الجماعية المميزة' : 'Premium Group Chat'}
          </CardTitle>
          <CardDescription className="text-base sm:text-lg mt-2 px-2">
            {dir === 'rtl' 
              ? 'انضم إلى مجتمع حصري من المحترفين والمبدعين' 
              : 'Join an exclusive community of professionals and creatives'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 sm:space-y-8 p-4 sm:p-6">
          {/* Mobile-first layout: Stack on mobile, side-by-side on desktop */}
          <div className="flex flex-col md:grid md:grid-cols-2 gap-6 sm:gap-8">
            {/* Features Section */}
            <div className="space-y-4 sm:space-y-5 order-2 md:order-1">
              <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
                {dir === 'rtl' ? 'المميزات' : 'Features'}
              </h3>
              <ul className="space-y-3 sm:space-y-4 text-sm sm:text-base text-muted-foreground">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="leading-relaxed">{dir === 'rtl' ? 'دردشة جماعية مع أعضاء من جميع أنحاء العالم' : 'Group chat with members from around the world'}</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="leading-relaxed">{dir === 'rtl' ? 'مجتمع حصري للمشتركين فقط' : 'Exclusive community for subscribers only'}</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="leading-relaxed">{dir === 'rtl' ? 'اشتراك دائم مدى الحياة' : 'Lifetime subscription'}</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="leading-relaxed">{dir === 'rtl' ? 'دخول فوري بعد الدفع' : 'Instant access after payment'}</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="leading-relaxed">{dir === 'rtl' ? 'دعم فني مخصص' : 'Dedicated support'}</span>
                </li>
              </ul>
            </div>
            
            {/* Pricing Box - Show first on mobile */}
            <div className="space-y-4 order-1 md:order-2">
              <div className="border-2 border-primary rounded-xl p-6 sm:p-8 text-center bg-gradient-to-br from-primary/5 to-primary/10">
                <div className="text-5xl sm:text-6xl font-bold text-primary mb-3 sm:mb-4">$30</div>
                <div className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-5">
                  {dir === 'rtl' ? 'دفعة واحدة مدى الحياة' : 'One-time payment, lifetime access'}
                </div>
                <Badge variant="secondary" className="mb-4 sm:mb-5 text-xs sm:text-sm py-1.5 px-3">
                  <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" />
                  {dir === 'rtl' ? 'مشتركين فقط' : 'Subscribers Only'}
                </Badge>
                <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-muted-foreground">
                  <UsersRound className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>{dir === 'rtl' ? 'المشتركين الحاليين: ' : 'Current Members: '}</span>
                  <span className="font-semibold">1,234</span>
                </div>
              </div>
            </div>
          </div>

          {/* Subscribe Button - Full width, larger on mobile */}
          <div className="pt-2 sm:pt-4">
            <Button
              onClick={() => setShowPayment(true)}
              className="w-full h-14 sm:h-16 text-base sm:text-lg font-semibold rounded-lg shadow-lg min-h-[56px] touch-manipulation"
              style={{
                background: `linear-gradient(135deg, hsl(var(--chat-from)), hsl(var(--chat-to)))`
              }}
            >
              <Crown className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
              {dir === 'rtl' ? 'اشترك الآن - $30' : 'Subscribe Now - $30'}
            </Button>
          </div>

          {/* Security Notice - Better spacing */}
          <div className="text-center text-xs sm:text-sm text-muted-foreground pt-4 sm:pt-6 border-t space-y-2">
            <p className="leading-relaxed px-2">
              {dir === 'rtl' 
                ? '✅ دفعة آمنة ومشفرة | ✅ استرداد الأموال خلال 30 يوم | ✅ دعم على مدار الساعة'
                : '✅ Secure encrypted payment | ✅ 30-day money-back guarantee | ✅ 24/7 support'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

