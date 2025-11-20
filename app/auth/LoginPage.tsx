'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card';
import { Input } from '@/ui/input';
import { Button } from '@/ui/button';
import { Label } from '@/ui/label';
import { Crown, Phone, Mail, Lock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';

export function LoginPage() {
  const { dir } = useLanguage();
  const router = useRouter();
  const { setUser } = useUser();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOTP = async () => {
    if (!phoneNumber || !email) {
      setError(dir === 'rtl' ? 'يرجى إدخال رقم الهاتف والبريد الإلكتروني' : 'Please enter phone number and email');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, email })
      });

      const data = await response.json();

      if (data.success) {
        setStep('otp');
      } else {
        setError(data.message || 'حدث خطأ في إرسال كود التحقق');
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setError(dir === 'rtl' ? 'يرجى إدخال كود التحقق (6 أرقام)' : 'Please enter 6-digit OTP code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, code: otp })
      });

      const data = await response.json();

      if (data.success && data.user) {
        // Save user to context
        setUser({
          id: data.user.id,
          name: data.user.name,
          avatar: data.user.avatar,
          phoneNumber: data.user.phoneNumber,
          email: data.user.email
        });

        // Redirect to main app
        router.push('/');
      } else {
        setError(data.message || 'كود التحقق غير صحيح');
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100 p-4" dir={dir}>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Crown className="w-8 h-8" style={{ color: `hsl(var(--primary))` }} />
            <CardTitle className="text-3xl font-bold" style={{ color: `hsl(var(--primary))` }}>
              Royal Chat
            </CardTitle>
          </div>
          <CardDescription className="text-lg">
            {step === 'phone' 
              ? (dir === 'rtl' ? 'أدخل رقم هاتفك وبريدك الإلكتروني' : 'Enter your phone number and email')
              : (dir === 'rtl' ? 'أدخل كود التحقق المرسل إلى بريدك' : 'Enter the verification code sent to your email')
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 'phone' ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {dir === 'rtl' ? 'رقم الهاتف' : 'Phone Number'}
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder={dir === 'rtl' ? '05xxxxxxxx' : '05xxxxxxxx'}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  dir={dir}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {dir === 'rtl' ? 'البريد الإلكتروني' : 'Email'}
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={dir === 'rtl' ? 'example@email.com' : 'example@email.com'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  dir={dir}
                />
              </div>
              {error && (
                <div className="text-sm text-red-500 text-center">{error}</div>
              )}
              <Button
                onClick={handleSendOTP}
                disabled={loading}
                className="w-full"
                style={{ backgroundColor: `hsl(var(--primary))` }}
              >
                {loading 
                  ? (dir === 'rtl' ? 'جاري الإرسال...' : 'Sending...')
                  : (dir === 'rtl' ? 'إرسال كود التحقق' : 'Send Verification Code')
                }
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="otp" className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  {dir === 'rtl' ? 'كود التحقق' : 'Verification Code'}
                </Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder={dir === 'rtl' ? '000000' : '000000'}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  dir={dir}
                  className="text-center text-2xl tracking-widest"
                />
                <p className="text-xs text-muted-foreground text-center">
                  {dir === 'rtl' 
                    ? 'تم إرسال كود التحقق إلى بريدك الإلكتروني'
                    : 'Verification code sent to your email'
                  }
                </p>
              </div>
              {error && (
                <div className="text-sm text-red-500 text-center">{error}</div>
              )}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setStep('phone');
                    setOtp('');
                    setError('');
                  }}
                  className="flex-1"
                >
                  {dir === 'rtl' ? 'رجوع' : 'Back'}
                </Button>
                <Button
                  onClick={handleVerifyOTP}
                  disabled={loading || otp.length !== 6}
                  className="flex-1"
                  style={{ backgroundColor: `hsl(var(--primary))` }}
                >
                  {loading 
                    ? (dir === 'rtl' ? 'جاري التحقق...' : 'Verifying...')
                    : (dir === 'rtl' ? 'تحقق' : 'Verify')
                  }
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

