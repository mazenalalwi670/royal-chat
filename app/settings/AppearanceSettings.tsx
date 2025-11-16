'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card';
import { Label } from '@/ui/label';
import { Switch } from '@/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select';
import { Separator } from '@/ui/separator';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

export function AppearanceSettings() {
  const { t, dir } = useLanguage();
  const { theme, setTheme, colorScheme, setColorScheme, resolvedTheme } = useTheme();
  const [fontSize, setFontSize] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('fontSize') || 'medium';
    }
    return 'medium';
  });
  const [compactMode, setCompactMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('compactMode') === 'true';
    }
    return false;
  });
  const [animations, setAnimations] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('animations') !== 'false';
    }
    return true;
  });

  // Save fontSize to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('fontSize', fontSize);
    }
  }, [fontSize]);

  // Save compactMode to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('compactMode', compactMode.toString());
    }
  }, [compactMode]);

  // Save animations to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('animations', animations.toString());
    }
  }, [animations]);

  const colorSchemes = [
    { 
      value: 'amber' as const, 
      label: dir === 'rtl' ? 'ذهبي ملكي' : 'Royal Gold',
      primary: 'hsl(43, 96%, 56%)',
      secondary: 'hsl(43, 96%, 60%)',
      gradient: 'linear-gradient(135deg, hsl(43, 96%, 56%) 0%, hsl(43, 96%, 60%) 100%)'
    },
    { 
      value: 'blue' as const, 
      label: dir === 'rtl' ? 'أزرق محيط' : 'Ocean Blue',
      primary: 'hsl(217, 91%, 60%)',
      secondary: 'hsl(217, 91%, 65%)',
      gradient: 'linear-gradient(135deg, hsl(217, 91%, 60%) 0%, hsl(217, 91%, 65%) 100%)'
    },
    { 
      value: 'purple' as const, 
      label: dir === 'rtl' ? 'بنفسجي ملكي' : 'Royal Purple',
      primary: 'hsl(262, 83%, 58%)',
      secondary: 'hsl(262, 83%, 63%)',
      gradient: 'linear-gradient(135deg, hsl(262, 83%, 58%) 0%, hsl(262, 83%, 63%) 100%)'
    },
    { 
      value: 'green' as const, 
      label: dir === 'rtl' ? 'أخضر زمردي' : 'Emerald Green',
      primary: 'hsl(142, 71%, 45%)',
      secondary: 'hsl(142, 71%, 50%)',
      gradient: 'linear-gradient(135deg, hsl(142, 71%, 45%) 0%, hsl(142, 71%, 50%) 100%)'
    },
    { 
      value: 'rose' as const, 
      label: dir === 'rtl' ? 'أحمر وردي' : 'Rose Red',
      primary: 'hsl(346, 77%, 50%)',
      secondary: 'hsl(346, 77%, 55%)',
      gradient: 'linear-gradient(135deg, hsl(346, 77%, 50%) 0%, hsl(346, 77%, 55%) 100%)'
    },
    { 
      value: 'brown' as const, 
      label: dir === 'rtl' ? 'بني متدرج' : 'Gradient Brown',
      primary: 'hsl(25, 65%, 45%)',
      secondary: 'hsl(25, 70%, 55%)',
      gradient: 'linear-gradient(135deg, hsl(25, 65%, 45%) 0%, hsl(25, 70%, 55%) 100%)'
    }
  ];

  // Get theme button styles based on current theme and color scheme
  const getThemeButtonStyles = (themeValue: 'light' | 'dark' | 'system') => {
    const isActive = theme === themeValue || (themeValue === 'light' && theme === 'system' && resolvedTheme === 'light') || (themeValue === 'dark' && theme === 'system' && resolvedTheme === 'dark');
    const colorClasses: Record<string, { border: string; bg: string; text: string }> = {
      amber: {
        border: isActive ? 'border-amber-500' : 'border-muted',
        bg: isActive ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-transparent',
        text: isActive ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'
      },
      blue: {
        border: isActive ? 'border-blue-500' : 'border-muted',
        bg: isActive ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-transparent',
        text: isActive ? 'text-blue-600 dark:text-blue-400' : 'text-muted-foreground'
      },
      purple: {
        border: isActive ? 'border-purple-500' : 'border-muted',
        bg: isActive ? 'bg-purple-50 dark:bg-purple-900/20' : 'bg-transparent',
        text: isActive ? 'text-purple-600 dark:text-purple-400' : 'text-muted-foreground'
      },
      green: {
        border: isActive ? 'border-green-500' : 'border-muted',
        bg: isActive ? 'bg-green-50 dark:bg-green-900/20' : 'bg-transparent',
        text: isActive ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'
      },
      rose: {
        border: isActive ? 'border-rose-500' : 'border-muted',
        bg: isActive ? 'bg-rose-50 dark:bg-rose-900/20' : 'bg-transparent',
        text: isActive ? 'text-rose-600 dark:text-rose-400' : 'text-muted-foreground'
      },
      brown: {
        border: isActive ? 'border-amber-800' : 'border-muted',
        bg: isActive ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-transparent',
        text: isActive ? 'text-amber-800 dark:text-amber-400' : 'text-muted-foreground'
      }
    };
    return colorClasses[colorScheme] || colorClasses.amber;
  };

  // Get color scheme button styles
  const getColorSchemeStyles = (schemeValue: typeof colorScheme) => {
    const isSelected = colorScheme === schemeValue;
    const schemeColors: Record<typeof colorScheme, { border: string; bg: string }> = {
      amber: {
        border: isSelected ? 'border-amber-500' : 'border-muted',
        bg: isSelected ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-transparent'
      },
      blue: {
        border: isSelected ? 'border-blue-500' : 'border-muted',
        bg: isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-transparent'
      },
      purple: {
        border: isSelected ? 'border-purple-500' : 'border-muted',
        bg: isSelected ? 'bg-purple-50 dark:bg-purple-900/20' : 'bg-transparent'
      },
      green: {
        border: isSelected ? 'border-green-500' : 'border-muted',
        bg: isSelected ? 'bg-green-50 dark:bg-green-900/20' : 'bg-transparent'
      },
      rose: {
        border: isSelected ? 'border-rose-500' : 'border-muted',
        bg: isSelected ? 'bg-rose-50 dark:bg-rose-900/20' : 'bg-transparent'
      },
      brown: {
        border: isSelected ? 'border-amber-800' : 'border-muted',
        bg: isSelected ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-transparent'
      }
    };
    return schemeColors[schemeValue];
  };

  return (
    <div className="space-y-6" dir={dir}>
      <Card>
        <CardHeader>
          <CardTitle>{t('appearance.title')}</CardTitle>
          <CardDescription>{dir === 'rtl' ? 'تخصيص مظهر Royal Chat' : 'Customize the appearance of Royal Chat'}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label>{t('appearance.theme')}</Label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={cn(
                  'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all hover:scale-105 cursor-pointer',
                  getThemeButtonStyles('light').border,
                  getThemeButtonStyles('light').bg,
                  theme === 'light' || (theme === 'system' && resolvedTheme === 'light') ? 'shadow-md' : ''
                )}
              >
                <Sun className={cn('w-6 h-6 transition-colors', getThemeButtonStyles('light').text)} />
                <span className="text-sm font-medium">{t('appearance.light')}</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={cn(
                  'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all hover:scale-105 cursor-pointer',
                  getThemeButtonStyles('dark').border,
                  getThemeButtonStyles('dark').bg,
                  theme === 'dark' || (theme === 'system' && resolvedTheme === 'dark') ? 'shadow-md' : ''
                )}
              >
                <Moon className={cn('w-6 h-6 transition-colors', getThemeButtonStyles('dark').text)} />
                <span className="text-sm font-medium">{t('appearance.dark')}</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme('system')}
                className={cn(
                  'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all hover:scale-105 cursor-pointer',
                  getThemeButtonStyles('system').border,
                  getThemeButtonStyles('system').bg,
                  theme === 'system' ? 'shadow-md' : ''
                )}
              >
                <Monitor className={cn('w-6 h-6 transition-colors', getThemeButtonStyles('system').text)} />
                <span className="text-sm font-medium">{t('appearance.system')}</span>
              </button>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <Label>{t('appearance.colorScheme')}</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {colorSchemes.map((scheme) => {
                const styles = getColorSchemeStyles(scheme.value);
                const isSelected = colorScheme === scheme.value;
                return (
                  <button
                    type="button"
                    key={scheme.value}
                    onClick={() => {
                      setColorScheme(scheme.value);
                      // Add pulse animation on click
                      const button = document.activeElement as HTMLElement;
                      if (button) {
                        button.classList.add('animate-pulse');
                        setTimeout(() => button.classList.remove('animate-pulse'), 600);
                      }
                    }}
                    className={cn(
                      'p-4 rounded-lg border-2 transition-all cursor-pointer relative overflow-hidden',
                      'hover:scale-105 active:scale-95',
                      styles.border,
                      styles.bg,
                      isSelected ? 'shadow-md ring-2 ring-offset-2 ring-primary' : 'hover:border-primary',
                      'transform-gpu'
                    )}
                    style={{
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  >
                    {isSelected && (
                      <div className="absolute inset-0 bg-primary/10 animate-pulse" style={{ animation: 'none' }} />
                    )}
                    <div className="flex flex-col gap-2 relative z-10 w-full">
                      <div className="flex items-center gap-3">
                        <div 
                          className={cn(
                            'w-12 h-12 rounded-lg shadow-md transition-all duration-500 overflow-hidden',
                            isSelected && 'ring-2 ring-primary ring-offset-2 scale-110'
                          )}
                          style={{
                            background: scheme.gradient || `linear-gradient(135deg, ${scheme.primary} 0%, ${scheme.secondary} 100%)`
                          }}
                        />
                        <span className="text-sm font-medium transition-colors duration-500 flex-1">{scheme.label}</span>
                      </div>
                      {isSelected && (
                        <div className="w-full h-2 rounded-full overflow-hidden" style={{
                          background: scheme.gradient || `linear-gradient(135deg, ${scheme.primary} 0%, ${scheme.secondary} 100%)`,
                          opacity: 0.8
                        }} />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{dir === 'rtl' ? 'عرض' : 'Display'}</CardTitle>
          <CardDescription>{dir === 'rtl' ? 'ضبط تفضيلات العرض' : 'Adjust display preferences'}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="compact">{dir === 'rtl' ? 'الوضع المدمج' : 'Compact Mode'}</Label>
              <p className="text-sm text-muted-foreground">{dir === 'rtl' ? 'تقليل المسافات لمزيد من المحتوى' : 'Reduce spacing for more content'}</p>
            </div>
            <Switch
              id="compact"
              checked={compactMode}
              onCheckedChange={setCompactMode}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="animations">{dir === 'rtl' ? 'الرسوم المتحركة' : 'Animations'}</Label>
              <p className="text-sm text-muted-foreground">{dir === 'rtl' ? 'تفعيل الرسوم المتحركة السلسة' : 'Enable smooth animations'}</p>
            </div>
            <Switch
              id="animations"
              checked={animations}
              onCheckedChange={setAnimations}
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="fontSize">{dir === 'rtl' ? 'حجم الخط' : 'Font Size'}</Label>
            <Select value={fontSize} onValueChange={setFontSize}>
              <SelectTrigger id="fontSize">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">{dir === 'rtl' ? 'صغير' : 'Small'}</SelectItem>
                <SelectItem value="medium">{dir === 'rtl' ? 'متوسط' : 'Medium'}</SelectItem>
                <SelectItem value="large">{dir === 'rtl' ? 'كبير' : 'Large'}</SelectItem>
                <SelectItem value="xlarge">{dir === 'rtl' ? 'كبير جداً' : 'Extra Large'}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
