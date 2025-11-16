'use client';

import { useState, useEffect, useRef } from 'react';
import { Crown, Phone, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Card, CardContent } from '@/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface PhoneLoginProps {
  onLoginSuccess: (phoneNumber: string) => void;
}

// Country codes with flags (Yemen first)
interface CountryCode {
  code: string;
  flag: string;
  name: string;
  nameAr: string;
}

const COUNTRY_CODES: CountryCode[] = [
  // Yemen first
  { code: '+967', flag: '🇾🇪', name: 'Yemen', nameAr: 'اليمن' },
  // Arab countries
  { code: '+966', flag: '🇸🇦', name: 'Saudi Arabia', nameAr: 'السعودية' },
  { code: '+971', flag: '🇦🇪', name: 'UAE', nameAr: 'الإمارات' },
  { code: '+965', flag: '🇰🇼', name: 'Kuwait', nameAr: 'الكويت' },
  { code: '+974', flag: '🇶🇦', name: 'Qatar', nameAr: 'قطر' },
  { code: '+973', flag: '🇧🇭', name: 'Bahrain', nameAr: 'البحرين' },
  { code: '+968', flag: '🇴🇲', name: 'Oman', nameAr: 'عمان' },
  { code: '+961', flag: '🇱🇧', name: 'Lebanon', nameAr: 'لبنان' },
  { code: '+962', flag: '🇯🇴', name: 'Jordan', nameAr: 'الأردن' },
  { code: '+964', flag: '🇮🇶', name: 'Iraq', nameAr: 'العراق' },
  { code: '+963', flag: '🇸🇾', name: 'Syria', nameAr: 'سوريا' },
  { code: '+20', flag: '🇪🇬', name: 'Egypt', nameAr: 'مصر' },
  { code: '+212', flag: '🇲🇦', name: 'Morocco', nameAr: 'المغرب' },
  { code: '+213', flag: '🇩🇿', name: 'Algeria', nameAr: 'الجزائر' },
  { code: '+216', flag: '🇹🇳', name: 'Tunisia', nameAr: 'تونس' },
  { code: '+218', flag: '🇱🇾', name: 'Libya', nameAr: 'ليبيا' },
  { code: '+249', flag: '🇸🇩', name: 'Sudan', nameAr: 'السودان' },
  // Other countries
  { code: '+1', flag: '🇺🇸', name: 'USA/Canada', nameAr: 'أمريكا/كندا' },
  { code: '+44', flag: '🇬🇧', name: 'UK', nameAr: 'بريطانيا' },
  { code: '+33', flag: '🇫🇷', name: 'France', nameAr: 'فرنسا' },
  { code: '+49', flag: '🇩🇪', name: 'Germany', nameAr: 'ألمانيا' },
  { code: '+39', flag: '🇮🇹', name: 'Italy', nameAr: 'إيطاليا' },
  { code: '+34', flag: '🇪🇸', name: 'Spain', nameAr: 'إسبانيا' },
  { code: '+7', flag: '🇷🇺', name: 'Russia', nameAr: 'روسيا' },
  { code: '+86', flag: '🇨🇳', name: 'China', nameAr: 'الصين' },
  { code: '+81', flag: '🇯🇵', name: 'Japan', nameAr: 'اليابان' },
  { code: '+82', flag: '🇰🇷', name: 'South Korea', nameAr: 'كوريا الجنوبية' },
  { code: '+91', flag: '🇮🇳', name: 'India', nameAr: 'الهند' },
  { code: '+92', flag: '🇵🇰', name: 'Pakistan', nameAr: 'باكستان' },
  { code: '+90', flag: '🇹🇷', name: 'Turkey', nameAr: 'تركيا' },
  { code: '+98', flag: '🇮🇷', name: 'Iran', nameAr: 'إيران' },
  { code: '+27', flag: '🇿🇦', name: 'South Africa', nameAr: 'جنوب أفريقيا' },
  { code: '+55', flag: '🇧🇷', name: 'Brazil', nameAr: 'البرازيل' },
  { code: '+52', flag: '🇲🇽', name: 'Mexico', nameAr: 'المكسيك' },
  { code: '+61', flag: '🇦🇺', name: 'Australia', nameAr: 'أستراليا' },
  { code: '+31', flag: '🇳🇱', name: 'Netherlands', nameAr: 'هولندا' },
  { code: '+32', flag: '🇧🇪', name: 'Belgium', nameAr: 'بلجيكا' },
  { code: '+41', flag: '🇨🇭', name: 'Switzerland', nameAr: 'سويسرا' },
  { code: '+46', flag: '🇸🇪', name: 'Sweden', nameAr: 'السويد' },
  { code: '+47', flag: '🇳🇴', name: 'Norway', nameAr: 'النرويج' },
  { code: '+45', flag: '🇩🇰', name: 'Denmark', nameAr: 'الدنمارك' },
  { code: '+358', flag: '🇫🇮', name: 'Finland', nameAr: 'فنلندا' },
  { code: '+48', flag: '🇵🇱', name: 'Poland', nameAr: 'بولندا' },
  { code: '+351', flag: '🇵🇹', name: 'Portugal', nameAr: 'البرتغال' },
  { code: '+30', flag: '🇬🇷', name: 'Greece', nameAr: 'اليونان' },
];

export function PhoneLogin({ onLoginSuccess }: PhoneLoginProps) {
  const { dir, t } = useLanguage();
  // Default to Yemen (+967)
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(COUNTRY_CODES[0]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Real animated background using Canvas
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Golden particles with real movement
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
    }

    const particles: Particle[] = [];
    const particleCount = 30;

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.5 + 0.3
      });
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        // Keep particles in bounds
        particle.x = Math.max(0, Math.min(canvas.width, particle.x));
        particle.y = Math.max(0, Math.min(canvas.height, particle.y));

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 215, 0, ${particle.opacity})`;
        ctx.fill();

        // Draw glow
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(255, 215, 0, 0.8)';
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  // Allow any input - no restrictions
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value; // Accept any input
    setPhoneNumber(value);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Clean phone number (remove spaces, but keep any characters)
    const cleanedPhone = phoneNumber.trim();
    
    // Minimal validation - just check if something was entered
    if (!cleanedPhone || cleanedPhone.length === 0) {
      setError(dir === 'rtl' ? 'يرجى إدخال رقم هاتف' : 'Please enter a phone number');
      return;
    }

    setIsLoading(true);

          // Combine country code with phone number
          const fullPhoneNumber = `${selectedCountry.code}${cleanedPhone}`;

          // No real validation - accept any input for testing
          setTimeout(() => {
            setIsLoading(false);
            setIsSuccess(true);
            
            // After success animation, proceed to login with full phone number
            setTimeout(() => {
              onLoginSuccess(fullPhoneNumber);
            }, 1500);
          }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-white" dir={dir}>
      {/* Real Animated Background Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ background: 'linear-gradient(135deg, #ffffff 0%, #fffef0 50%, #ffffff 100%)' }}
      />

      {/* Subtle golden gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/30 via-transparent to-amber-50/20 pointer-events-none" />

      {/* Main Content */}
      <Card className="relative z-10 w-full max-w-md border-2 border-yellow-200 bg-white shadow-xl">
        <CardContent className="p-10">
          {/* Elegant Crown Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-6">
              <Crown 
                className="w-20 h-20 text-yellow-500"
                style={{
                  filter: 'drop-shadow(0 4px 12px rgba(255, 215, 0, 0.4))',
                  animation: 'gentleFloat 4s ease-in-out infinite'
                }}
              />
            </div>

            {/* App Title - Clean and Elegant */}
            <h1 className="text-4xl font-bold mb-2 text-gray-900" style={{
              letterSpacing: '0.05em',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
            }}>
              ROYAL CHAT
            </h1>
            <div className="h-1 w-20 bg-gradient-to-r from-transparent via-yellow-500 to-transparent mb-4" />
            <p className="text-base font-medium text-gray-600">
              {dir === 'rtl' 
                ? 'تطبيق الدردشة المميز' 
                : 'Premium Chat Application'}
            </p>
          </div>

          {/* Login Form */}
          {!isSuccess ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <label htmlFor="phone" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-yellow-600" />
                  {dir === 'rtl' ? 'رقم الهاتف' : 'Phone Number'}
                </label>
                <div className="flex gap-2">
                  {/* Country Code Selector */}
                  <Select
                    value={selectedCountry.code}
                    onValueChange={(value) => {
                      const country = COUNTRY_CODES.find(c => c.code === value);
                      if (country) {
                        setSelectedCountry(country);
                      }
                    }}
                  >
                    <SelectTrigger 
                      className={cn(
                        "w-[140px] h-14 border-2 transition-all duration-200",
                        "focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20",
                        error ? "border-red-400 focus:border-red-500 focus:ring-red-500/20" : "border-gray-300",
                        "bg-white font-medium hover:border-yellow-400"
                      )}
                      dir={dir}
                    >
                      <SelectValue>
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{selectedCountry.flag}</span>
                          <span className="text-sm font-semibold text-gray-900">{selectedCountry.code}</span>
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {COUNTRY_CODES.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          <div className="flex items-center gap-3 py-1">
                            <span className="text-2xl">{country.flag}</span>
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold text-gray-900">{country.code}</span>
                              <span className="text-xs text-gray-500">
                                {dir === 'rtl' ? country.nameAr : country.name}
                              </span>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Phone Number Input */}
                  <div className="flex-1 relative">
                    <Input
                      id="phone"
                      type="text"
                      value={phoneNumber}
                      onChange={handlePhoneChange}
                      placeholder={dir === 'rtl' ? 'أدخل رقم الهاتف' : 'Enter phone number'}
                      className={cn(
                        "text-base h-14 border-2 transition-all duration-200",
                        "focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20",
                        error ? "border-red-400 focus:border-red-500 focus:ring-red-500/20" : "border-gray-300",
                        "bg-white font-medium text-gray-900",
                        "placeholder:text-gray-400",
                        "hover:border-yellow-400"
                      )}
                      dir="ltr"
                      disabled={isLoading}
                    />
                  </div>
                </div>
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <span className="text-red-500 text-sm">⚠</span>
                    <p className="text-sm font-medium text-red-600">{error}</p>
                  </div>
                )}
                <p className="text-xs text-gray-500 text-center">
                  {dir === 'rtl' 
                    ? 'أدخل أي رقم للدخول (حالياً بدون قيود)' 
                    : 'Enter any number to login (currently no restrictions)'}
                </p>
              </div>

              <Button
                type="submit"
                disabled={isLoading || !phoneNumber}
                className={cn(
                  "w-full h-14 text-base font-semibold rounded-lg shadow-md",
                  "bg-gradient-to-r from-yellow-500 to-amber-500",
                  "hover:from-yellow-600 hover:to-amber-600",
                  "text-white transition-all duration-200",
                  "hover:shadow-lg hover:shadow-yellow-500/30",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "relative overflow-hidden"
                )}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {dir === 'rtl' ? 'جاري الدخول...' : 'Logging in...'}
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    {dir === 'rtl' ? 'دخول' : 'Login'}
                    <ArrowRight className={cn("w-5 h-5", dir === 'rtl' && "rotate-180")} />
                  </span>
                )}
              </Button>
            </form>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 space-y-6">
              <CheckCircle2 className="w-16 h-16 text-green-500 animate-scale-in" />
              <h3 className="text-xl font-bold text-center text-gray-900">
                {dir === 'rtl' ? 'تم الدخول بنجاح!' : 'Login Successful!'}
              </h3>
              <p className="text-sm text-gray-600 text-center">
                {dir === 'rtl' ? 'جاري التوجيه...' : 'Redirecting...'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <style jsx>{`
        @keyframes gentleFloat {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        @keyframes scale-in {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-scale-in {
          animation: scale-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}

