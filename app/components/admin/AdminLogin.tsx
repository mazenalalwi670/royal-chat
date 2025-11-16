'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
import { Crown, Lock, Eye, EyeOff, AlertCircle, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

export function AdminLogin() {
  const { login } = useAuth();
  const { dir } = useLanguage();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
    const particleCount = 35;

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        size: Math.random() * 3 + 1.5,
        opacity: Math.random() * 0.6 + 0.4
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
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'rgba(255, 215, 0, 0.9)';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Trim and validate inputs
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();
    
    if (!trimmedUsername || !trimmedPassword) {
      setError(dir === 'rtl' ? 'يرجى إدخال اسم المستخدم وكلمة المرور' : 'Please enter username and password');
      return;
    }
    
    // Only allow owner login (admin / mazen@771885223)
    if (trimmedUsername !== 'admin' || trimmedPassword !== 'mazen@771885223') {
      setError(dir === 'rtl' ? '⚠ هذا المسار محجوز للمالك فقط' : '⚠ This path is reserved for owner only');
      return;
    }
    
    setIsLoading(true);

    try {
      const success = await login(trimmedUsername, trimmedPassword);
      if (!success) {
        setError(dir === 'rtl' ? 'اسم المستخدم أو كلمة المرور غير صحيحة' : 'Invalid username or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(dir === 'rtl' ? 'حدث خطأ أثناء تسجيل الدخول' : 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
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
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/40 via-transparent to-amber-50/30 pointer-events-none" />

      {/* Main Content */}
      <Card className="relative z-10 w-full max-w-md border-2 border-yellow-200 bg-white shadow-xl">
        <CardHeader className="text-center space-y-6 pb-8">
          {/* Elegant Crown Header */}
          <div className="flex flex-col items-center">
            <div className="relative mb-6">
              <Crown 
                className="w-24 h-24 text-yellow-500"
                style={{
                  filter: 'drop-shadow(0 6px 16px rgba(255, 215, 0, 0.5))',
                  animation: 'gentleFloat 4s ease-in-out infinite'
                }}
              />
            </div>

            {/* Owner Title - Clean and Elegant */}
            <CardTitle className="text-4xl font-bold mb-2 text-gray-900" style={{
              letterSpacing: '0.05em',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
            }}>
              {dir === 'rtl' ? 'المالك' : 'OWNER'}
            </CardTitle>
            <div className="h-1 w-24 bg-gradient-to-r from-transparent via-yellow-500 to-transparent mb-4" />
            <CardDescription className="text-base font-medium text-gray-600">
              {dir === 'rtl' ? 'لوحة تحكم المالك الحصرية' : 'Exclusive Owner Control Panel'}
            </CardDescription>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mt-2">
              <Shield className="w-4 h-4 text-yellow-600" />
              <span>{dir === 'rtl' ? 'مساحة محمية - للمالك فقط' : 'Protected Area - Owner Only'}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Crown className="w-4 h-4 text-yellow-600" />
                {dir === 'rtl' ? 'اسم المستخدم' : 'Username'}
              </Label>
              <div className="relative">
                <Crown className={cn(
                  'absolute top-1/2 transform -translate-y-1/2 w-5 h-5 text-yellow-600',
                  dir === 'rtl' ? 'right-4' : 'left-4'
                )} />
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={dir === 'rtl' ? 'أدخل اسم المستخدم' : 'Enter username'}
                  className={cn(
                    'h-14 text-base transition-all duration-200 border-2',
                    dir === 'rtl' ? 'pr-12' : 'pl-12',
                    error ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-300 focus:border-yellow-500 focus:ring-yellow-500/20',
                    'bg-white font-medium text-gray-900',
                    'placeholder:text-gray-400',
                    'hover:border-yellow-400'
                  )}
                  dir={dir}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Lock className="w-4 h-4 text-yellow-600" />
                {dir === 'rtl' ? 'كلمة المرور' : 'Password'}
              </Label>
              <div className="relative">
                <Lock className={cn(
                  'absolute top-1/2 transform -translate-y-1/2 w-5 h-5 text-yellow-600',
                  dir === 'rtl' ? 'right-4' : 'left-4'
                )} />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={dir === 'rtl' ? 'أدخل كلمة المرور' : 'Enter password'}
                  className={cn(
                    'h-14 text-base transition-all duration-200 border-2',
                    dir === 'rtl' ? 'pr-20' : 'pl-20',
                    error ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-300 focus:border-yellow-500 focus:ring-yellow-500/20',
                    'bg-white font-medium text-gray-900',
                    'placeholder:text-gray-400',
                    'hover:border-yellow-400'
                  )}
                  dir={dir}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={cn(
                    'absolute top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-yellow-600 transition-colors',
                    dir === 'rtl' ? 'left-4' : 'right-4'
                  )}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-sm font-medium text-red-600">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className={cn(
                "w-full h-14 text-base font-semibold rounded-lg shadow-md",
                "bg-gradient-to-r from-yellow-500 to-amber-500",
                "hover:from-yellow-600 hover:to-amber-600",
                "text-white transition-all duration-200",
                "hover:shadow-lg hover:shadow-yellow-500/30",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "relative overflow-hidden"
              )}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {dir === 'rtl' ? 'جاري تسجيل الدخول...' : 'Logging in...'}
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  {dir === 'rtl' ? 'دخول المالك' : 'Owner Login'}
                </span>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <style jsx>{`
        @keyframes gentleFloat {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-12px);
          }
        }
      `}</style>
    </div>
  );
}

