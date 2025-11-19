'use client';

import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/ui/dialog';
import { Button } from '@/ui/button';
import { Label } from '@/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/ui/avatar';
import { Settings, Palette, Check, Camera, X, Image as ImageIcon, Sparkles, Wand2 } from 'lucide-react';
import { Separator } from '@/ui/separator';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUser } from '@/contexts/UserContext';
import { cn } from '@/lib/utils';
import { NameCustomizationDialog } from './NameCustomizationDialog';
import { CustomNameStyle } from './PremiumUserFrame';

type ColorScheme = 'amber' | 'blue' | 'purple' | 'green' | 'rose' | 'brown';

const colorSchemes: { value: ColorScheme; label: string; labelAr: string; color: string }[] = [
  { value: 'amber', label: 'Amber', labelAr: 'كهرماني', color: 'hsl(43, 96%, 56%)' },
  { value: 'blue', label: 'Blue', labelAr: 'أزرق', color: 'hsl(217, 91%, 60%)' },
  { value: 'purple', label: 'Purple', labelAr: 'بنفسجي', color: 'hsl(262, 83%, 58%)' },
  { value: 'green', label: 'Green', labelAr: 'أخضر', color: 'hsl(142, 71%, 45%)' },
  { value: 'rose', label: 'Rose', labelAr: 'وردي', color: 'hsl(346, 77%, 50%)' },
  { value: 'brown', label: 'Brown', labelAr: 'بني', color: 'hsl(25, 65%, 45%)' },
];

export function PremiumChatSettings() {
  const { colorScheme, setColorScheme } = useTheme();
  const { dir } = useLanguage();
  const { user, updateUser } = useUser();
  const [open, setOpen] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [backgroundType, setBackgroundType] = useState<'color' | 'image'>('color');
  const [selectedBackground, setSelectedBackground] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      // Default: empty string means use Royal branding background
      return localStorage.getItem('premium_chat_background') || '';
    }
    return '';
  });
  const [backgroundImagePreview, setBackgroundImagePreview] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('premium_chat_background_image');
      return saved || null;
    }
    return null;
  });
  const backgroundImageInputRef = useRef<HTMLInputElement>(null);
  const [showNameCustomization, setShowNameCustomization] = useState(false);
  const [customNameStyle, setCustomNameStyle] = useState<CustomNameStyle | null>(() => {
    if (typeof window !== 'undefined' && user) {
      const saved = localStorage.getItem(`premium_name_style_${user.id}`);
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert(dir === 'rtl' ? 'يرجى اختيار ملف صورة' : 'Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert(dir === 'rtl' ? 'حجم الصورة كبير جداً (الحد الأقصى 5MB)' : 'Image size is too large (max 5MB)');
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setAvatarPreview(result);
        // Update user immediately
        if (user) {
          updateUser({ avatar: result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    if (user) {
      const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`;
      setAvatarPreview(null);
      updateUser({ avatar: defaultAvatar });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleBackgroundImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert(dir === 'rtl' ? 'يرجى اختيار ملف صورة' : 'Please select an image file');
        return;
      }
      
      // Validate file size (max 10MB for background)
      if (file.size > 10 * 1024 * 1024) {
        alert(dir === 'rtl' ? 'حجم الصورة كبير جداً (الحد الأقصى 10MB)' : 'Image size is too large (max 10MB)');
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setBackgroundImagePreview(result);
        setBackgroundType('image');
        // Save to localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('premium_chat_background_image', result);
          localStorage.setItem('premium_chat_background_type', 'image');
        }
        // Trigger background update
        window.dispatchEvent(new CustomEvent('premium-background-changed', { 
          detail: { type: 'image', value: result } 
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveBackgroundImage = () => {
    setBackgroundImagePreview(null);
    setBackgroundType('color');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('premium_chat_background_image');
      localStorage.setItem('premium_chat_background_type', 'color');
    }
    if (backgroundImageInputRef.current) {
      backgroundImageInputRef.current.value = '';
    }
    // Trigger background update
    window.dispatchEvent(new CustomEvent('premium-background-changed', { 
      detail: { type: 'color', value: selectedBackground } 
    }));
  };

  const handleBackgroundColorSelect = (bgId: string) => {
    setSelectedBackground(bgId);
    setBackgroundType('color');
    if (typeof window !== 'undefined') {
      localStorage.setItem('premium_chat_background', bgId);
      localStorage.setItem('premium_chat_background_type', 'color');
    }
    // Trigger background update
    window.dispatchEvent(new CustomEvent('premium-background-changed', { 
      detail: { type: 'color', value: bgId } 
    }));
  };

  const getColorSchemeStyles = (scheme: ColorScheme) => {
    const colorMap: Record<ColorScheme, { bg: string; border: string; hover: string }> = {
      amber: {
        bg: 'bg-gradient-to-br from-amber-400 to-amber-600',
        border: 'border-amber-500',
        hover: 'hover:border-amber-400'
      },
      blue: {
        bg: 'bg-gradient-to-br from-blue-400 to-blue-600',
        border: 'border-blue-500',
        hover: 'hover:border-blue-400'
      },
      purple: {
        bg: 'bg-gradient-to-br from-purple-400 to-purple-600',
        border: 'border-purple-500',
        hover: 'hover:border-purple-400'
      },
      green: {
        bg: 'bg-gradient-to-br from-green-400 to-green-600',
        border: 'border-green-500',
        hover: 'hover:border-green-400'
      },
      rose: {
        bg: 'bg-gradient-to-br from-rose-400 to-rose-600',
        border: 'border-rose-500',
        hover: 'hover:border-rose-400'
      },
      brown: {
        bg: 'bg-gradient-to-br from-amber-700 to-amber-900',
        border: 'border-amber-700',
        hover: 'hover:border-amber-600'
      },
    };
    return colorMap[scheme];
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className={cn(
            "rounded-full transition-all duration-300 hover:scale-110",
            "border-primary/20 hover:border-primary"
          )}
          title={dir === 'rtl' ? 'الإعدادات' : 'Settings'}
        >
          <Settings className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-full sm:max-w-4xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full" dir={dir}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            {dir === 'rtl' ? 'إعدادات المظهر' : 'Appearance Settings'}
          </DialogTitle>
          <DialogDescription>
            {dir === 'rtl' ? 'اختر لون المظهر المفضل لديك وغير صورتك الشخصية' : 'Choose your preferred color scheme and change your profile picture'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 py-4">
          {/* Left Column - Mobile responsive */}
          <div className={cn("space-y-4 sm:space-y-6", dir === 'rtl' ? "sm:border-r sm:pr-6" : "sm:border-r sm:pr-6")}>
            {/* Profile Picture Section */}
            <div className="space-y-3">
              <Label className="text-base font-semibold flex items-center gap-2">
                <Camera className="w-4 h-4 text-primary" />
                {dir === 'rtl' ? 'الصورة الشخصية' : 'Profile Picture'}
              </Label>
              <div className="flex flex-col items-center gap-4">
                <div className="relative group">
                  <Avatar className="w-24 h-24 border-4 border-primary/20 shadow-lg transition-all duration-300 group-hover:scale-105">
                    <AvatarImage src={avatarPreview || user?.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-white text-xl font-bold">
                      {user?.name?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                    id="premium-avatar-upload"
                  />
                  <Button
                    type="button"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 rounded-full w-10 h-10 sm:w-8 sm:h-8 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg transition-all duration-300 hover:scale-110 active:scale-95 z-10 touch-manipulation min-h-[44px] min-w-[44px] sm:min-h-[32px] sm:min-w-[32px]"
                    style={{
                      background: `linear-gradient(135deg, hsl(var(--chat-from)), hsl(var(--chat-to)))`,
                      WebkitTapHighlightColor: 'transparent',
                      touchAction: 'manipulation'
                    }}
                    title={dir === 'rtl' ? 'تغيير الصورة' : 'Change Photo'}
                  >
                    <Camera className="w-5 h-5 sm:w-4 sm:h-4" />
                  </Button>
                  {avatarPreview && (
                    <Button
                      type="button"
                      size="icon"
                      onClick={handleRemoveAvatar}
                      className="absolute top-0 right-0 rounded-full w-9 h-9 sm:w-7 sm:h-7 bg-red-500 hover:bg-red-600 shadow-lg transition-all duration-300 hover:scale-110 active:scale-95 z-10 touch-manipulation min-h-[36px] min-w-[36px] sm:min-h-[28px] sm:min-w-[28px]"
                      style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
                      title={dir === 'rtl' ? 'إزالة الصورة' : 'Remove Photo'}
                    >
                      <X className="w-4 h-4 sm:w-3 sm:h-3" />
                    </Button>
                  )}
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  {dir === 'rtl' 
                    ? 'يمكنك تغيير صورتك الشخصية التي تظهر للجميع في الدردشة' 
                    : 'Change your profile picture that appears to everyone in chat'}
                </p>
              </div>
            </div>
            
            <div className="border-t pt-4" />
            
            {/* Color Scheme Section */}
            <div className="space-y-3">
              <Label className="text-base font-semibold flex items-center gap-2">
                <Palette className="w-4 h-4 text-primary" />
                {dir === 'rtl' ? 'الألوان' : 'Color Scheme'}
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
              {colorSchemes.map((scheme) => {
                const styles = getColorSchemeStyles(scheme.value);
                const isSelected = colorScheme === scheme.value;
                
                return (
                  <button
                    key={scheme.value}
                    type="button"
                    onClick={() => {
                      setColorScheme(scheme.value);
                      // Add pulse animation
                      const button = document.activeElement as HTMLElement;
                      if (button) {
                        button.classList.add('animate-pulse');
                        setTimeout(() => button.classList.remove('animate-pulse'), 600);
                      }
                    }}
                    className={cn(
                      "relative p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all duration-300",
                      "active:scale-95 sm:hover:scale-105 cursor-pointer touch-manipulation min-h-[80px] sm:min-h-[100px]",
                      "transform-gpu overflow-hidden group",
                      styles.bg,
                      isSelected 
                        ? `${styles.border} shadow-lg ring-2 ring-offset-1 sm:ring-offset-2 ring-2` 
                        : `${styles.border} opacity-70 sm:hover:opacity-100`
                    )}
                    style={{
                      borderColor: isSelected ? scheme.color : undefined,
                      boxShadow: isSelected ? `0 0 20px ${scheme.color}40` : undefined,
                      WebkitTapHighlightColor: 'transparent',
                      touchAction: 'manipulation'
                    }}
                    title={dir === 'rtl' ? scheme.labelAr : scheme.label}
                  >
                    {isSelected && (
                      <div className="absolute inset-0 bg-white/20 animate-pulse" />
                    )}
                    <div className="relative z-10 flex flex-col items-center gap-1 sm:gap-2">
                      <div 
                        className={cn(
                          "w-8 h-8 sm:w-12 sm:h-12 rounded-full border-2 border-white/50 shadow-lg",
                          "transition-transform duration-300 sm:group-hover:scale-110"
                        )}
                        style={{ backgroundColor: scheme.color }}
                      />
                      <span className={cn(
                        "text-[10px] sm:text-xs font-semibold text-white drop-shadow-lg",
                        "transition-all duration-300"
                      )}>
                        {dir === 'rtl' ? scheme.labelAr : scheme.label}
                      </span>
                      {isSelected && (
                        <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-white rounded-full p-0.5 sm:p-1 shadow-lg animate-scale-in">
                          <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary" style={{ color: scheme.color }} />
                        </div>
                      )}
                    </div>
                    {/* Shine effect on hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  </button>
                );
              })}
              </div>
            </div>
          </div>
          
          {/* Right Column */}
          <div className="space-y-6">
            {/* Chat Background Section */}
            <div className="space-y-3">
              <Label className="text-base font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                {dir === 'rtl' ? 'خلفية الدردشة' : 'Chat Background'}
              </Label>
              
              {/* Background Type Toggle */}
              <div className="flex gap-2 mb-3">
                <Button
                  type="button"
                  variant={backgroundType === 'color' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setBackgroundType('color')}
                  className="flex-1 h-10 sm:h-9 min-h-[44px] sm:min-h-[36px] touch-manipulation active:scale-95"
                  style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
                >
                  <Palette className="w-4 h-4 mr-2" />
                  {dir === 'rtl' ? 'ألوان' : 'Colors'}
                </Button>
                <Button
                  type="button"
                  variant={backgroundType === 'image' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setBackgroundType('image')}
                  className="flex-1 h-10 sm:h-9 min-h-[44px] sm:min-h-[36px] touch-manipulation active:scale-95"
                  style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  {dir === 'rtl' ? 'صورة' : 'Image'}
                </Button>
              </div>

              {backgroundType === 'color' ? (
                <div className="space-y-3">
                  {/* Original Background Option - Mobile responsive */}
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm font-medium text-muted-foreground">
                      {dir === 'rtl' ? 'الخلفية الأصلية' : 'Original Background'}
                    </Label>
                    <button
                      type="button"
                      onClick={() => handleBackgroundColorSelect('original-background')}
                      className={cn(
                        "relative w-full h-20 sm:h-24 rounded-lg border-2 transition-all duration-300 overflow-hidden group",
                        "active:scale-98 sm:hover:scale-[1.02] cursor-pointer touch-none",
                        selectedBackground === 'original-background' && backgroundType === 'color'
                          ? "border-primary shadow-lg ring-2 ring-primary/50"
                          : "border-border sm:hover:border-primary/50"
                      )}
                      style={{ 
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%)'
                      }}
                      title={dir === 'rtl' ? 'الخلفية الأصلية' : 'Original Background'}
                    >
                      {selectedBackground === 'original-background' && backgroundType === 'color' && (
                        <div className="absolute inset-0 bg-white/10 animate-pulse" />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center px-2">
                        <div className="text-xs sm:text-sm font-semibold text-white drop-shadow-lg text-center">
                          {dir === 'rtl' ? 'الخلفية الأصلية' : 'Original Background'}
                        </div>
                      </div>
                      {selectedBackground === 'original-background' && backgroundType === 'color' && (
                        <div className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-white rounded-full p-1 sm:p-1.5 shadow-lg z-10">
                          <Check className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                        </div>
                      )}
                      {/* Animated gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full sm:group-hover:translate-x-full transition-transform duration-1000" />
                    </button>
                  </div>
                  
                  <Separator />
                  
                  {/* Other Background Options - Mobile responsive */}
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm font-medium text-muted-foreground">
                      {dir === 'rtl' ? 'خلفيات أخرى' : 'Other Backgrounds'}
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      {premiumBackgrounds.filter(bg => bg.id !== 'original-background').map((bg) => (
                        <button
                          key={bg.id}
                          type="button"
                          onClick={() => handleBackgroundColorSelect(bg.id)}
                          className={cn(
                            "relative h-20 sm:h-20 rounded-lg border-2 transition-all duration-300 overflow-hidden group touch-manipulation min-h-[80px]",
                            "active:scale-95 sm:hover:scale-105 cursor-pointer",
                            selectedBackground === bg.id && backgroundType === 'color'
                              ? "border-primary shadow-lg ring-2 ring-primary/50"
                              : "border-border sm:hover:border-primary/50"
                          )}
                          style={{ 
                            background: bg.gradient,
                            WebkitTapHighlightColor: 'transparent',
                            touchAction: 'manipulation'
                          }}
                          title={dir === 'rtl' ? bg.nameAr : bg.name}
                        >
                          {selectedBackground === bg.id && backgroundType === 'color' && (
                            <div className="absolute inset-0 bg-white/10 animate-pulse" />
                          )}
                          <div className="absolute inset-0 flex items-center justify-center px-1">
                            <div className="text-[10px] sm:text-xs font-semibold text-white drop-shadow-lg opacity-0 sm:group-hover:opacity-100 transition-opacity text-center">
                              {dir === 'rtl' ? bg.nameAr : bg.name}
                            </div>
                          </div>
                          {selectedBackground === bg.id && backgroundType === 'color' && (
                            <div className="absolute top-1 right-1 bg-white rounded-full p-0.5 sm:p-1 shadow-lg">
                              <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary" />
                            </div>
                          )}
                        </button>
                      ))}
                      {/* Black and White Options - Mobile responsive */}
                      <button
                        type="button"
                        onClick={() => handleBackgroundColorSelect('royal-black-gold')}
                        className={cn(
                          "relative h-20 sm:h-20 rounded-lg border-2 transition-all duration-300 overflow-hidden group touch-manipulation min-h-[80px]",
                          "active:scale-95 sm:hover:scale-105 cursor-pointer",
                          selectedBackground === 'royal-black-gold' && backgroundType === 'color'
                            ? "border-primary shadow-lg ring-2 ring-primary/50"
                            : "border-border sm:hover:border-primary/50"
                        )}
                        style={{ 
                          background: '#000000',
                          WebkitTapHighlightColor: 'transparent',
                          touchAction: 'manipulation'
                        }}
                        title={dir === 'rtl' ? 'أسود مع شرارات ذهبية' : 'Black with Golden Sparkles'}
                      >
                        {selectedBackground === 'royal-black-gold' && backgroundType === 'color' && (
                          <div className="absolute inset-0 bg-white/10 animate-pulse" />
                        )}
                        <div className="absolute inset-0 flex flex-col items-center justify-center px-1">
                          <div className="text-[10px] sm:text-xs font-semibold text-white drop-shadow-lg opacity-0 sm:group-hover:opacity-100 transition-opacity mb-0.5 sm:mb-1 text-center">
                            {dir === 'rtl' ? 'أسود ذهبي' : 'Black Gold'}
                          </div>
                          <div className="flex gap-0.5 sm:gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <div
                                key={i}
                                className="w-0.5 h-0.5 sm:w-1 sm:h-1 bg-yellow-400 rounded-full animate-pulse"
                                style={{ animationDelay: `${i * 0.2}s` }}
                              />
                            ))}
                          </div>
                        </div>
                        {selectedBackground === 'royal-black-gold' && backgroundType === 'color' && (
                          <div className="absolute top-1 right-1 bg-white rounded-full p-0.5 sm:p-1 shadow-lg">
                            <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary" />
                          </div>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleBackgroundColorSelect('royal-white-gold')}
                        className={cn(
                          "relative h-20 sm:h-20 rounded-lg border-2 transition-all duration-300 overflow-hidden group touch-manipulation min-h-[80px]",
                          "active:scale-95 sm:hover:scale-105 cursor-pointer",
                          selectedBackground === 'royal-white-gold' && backgroundType === 'color'
                            ? "border-primary shadow-lg ring-2 ring-primary/50"
                            : "border-border sm:hover:border-primary/50"
                        )}
                        style={{ 
                          background: '#FFFFFF',
                          WebkitTapHighlightColor: 'transparent',
                          touchAction: 'manipulation'
                        }}
                        title={dir === 'rtl' ? 'أبيض مع شرارات ذهبية' : 'White with Golden Sparkles'}
                      >
                        {selectedBackground === 'royal-white-gold' && backgroundType === 'color' && (
                          <div className="absolute inset-0 bg-black/5 animate-pulse" />
                        )}
                        <div className="absolute inset-0 flex flex-col items-center justify-center px-1">
                          <div className="text-[10px] sm:text-xs font-semibold text-gray-800 drop-shadow-lg opacity-0 sm:group-hover:opacity-100 transition-opacity mb-0.5 sm:mb-1 text-center">
                            {dir === 'rtl' ? 'أبيض ذهبي' : 'White Gold'}
                          </div>
                          <div className="flex gap-0.5 sm:gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <div
                                key={i}
                                className="w-0.5 h-0.5 sm:w-1 sm:h-1 bg-yellow-400 rounded-full animate-pulse"
                                style={{ animationDelay: `${i * 0.2}s` }}
                              />
                            ))}
                          </div>
                        </div>
                        {selectedBackground === 'royal-white-gold' && backgroundType === 'color' && (
                          <div className="absolute top-1 right-1 bg-white rounded-full p-0.5 sm:p-1 shadow-lg border border-gray-300">
                            <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary" />
                          </div>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="relative group">
                    {backgroundImagePreview ? (
                      <div className="relative rounded-lg overflow-hidden border-2 border-primary/50">
                        <img 
                          src={backgroundImagePreview} 
                          alt="Background preview" 
                          className="w-full h-32 object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <Button
                          type="button"
                          size="icon"
                          onClick={handleRemoveBackgroundImage}
                          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 shadow-lg"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div 
                        className="relative h-32 rounded-lg border-2 border-dashed border-primary/30 flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors bg-muted/50"
                        onClick={() => backgroundImageInputRef.current?.click()}
                      >
                        <div className="text-center">
                          <ImageIcon className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            {dir === 'rtl' ? 'اضغط لاختيار صورة' : 'Click to select image'}
                          </p>
                        </div>
                      </div>
                    )}
                    <input
                      ref={backgroundImageInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleBackgroundImageChange}
                      className="hidden"
                      id="premium-background-upload"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {dir === 'rtl' 
                      ? '💡 اختر صورة من جهازك لتكون خلفية الدردشة' 
                      : '💡 Choose an image from your device as chat background'}
                  </p>
                </div>
              )}
            </div>
            
            <div className="border-t pt-4" />
            
            {/* Name Customization Section */}
            <div className="space-y-3">
              <Label className="text-base font-semibold flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-primary" />
                {dir === 'rtl' ? 'تخصيص الاسم الملكي' : 'Customize Royal Name'}
              </Label>
              <div className="p-4 bg-gradient-to-r from-yellow-500/10 via-amber-500/10 to-yellow-500/10 rounded-lg border-2 border-yellow-500/20">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold mb-1">
                      {dir === 'rtl' ? 'برواز ذهبي فاخر' : 'Luxurious Golden Frame'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {dir === 'rtl' 
                        ? 'اختر الشكل الفاخر لاسمك مع برواز ذهبي متحرك'
                        : 'Choose luxurious style for your name with animated golden frame'}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={() => setShowNameCustomization(true)}
                  className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white font-semibold h-12 sm:h-11 min-h-[48px] sm:min-h-[44px] touch-manipulation active:scale-95"
                  style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
                >
                  <Wand2 className="w-4 h-4 mr-2" />
                  {dir === 'rtl' ? 'تخصيص الاسم الآن' : 'Customize Name Now'}
                </Button>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground text-center">
                {dir === 'rtl' 
                  ? '💡 يمكنك تغيير الألوان والخلفية والاسم في أي وقت' 
                  : '💡 You can change colors, background, and name anytime'}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>

      {/* Name Customization Dialog */}
      <NameCustomizationDialog
        open={showNameCustomization}
        onOpenChange={setShowNameCustomization}
        currentName={user?.name || ''}
        onSave={(name, style) => {
          if (user) {
            updateUser({ name });
            setCustomNameStyle(style);
            if (typeof window !== 'undefined') {
              localStorage.setItem(`premium_name_style_${user.id}`, JSON.stringify(style));
              // Notify premium chat to reload user style
              window.dispatchEvent(new CustomEvent('premium-name-style-updated', { 
                detail: { userId: user.id, style } 
              }));
            }
          }
        }}
      />
    </Dialog>
  );
}

const premiumBackgrounds = [
  {
    id: 'original-background',
    name: 'Original Background',
    nameAr: 'الخلفية الأصلية',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%)',
    isOriginal: true
  },
  {
    id: 'gradient-royal',
    name: 'Royal Gold',
    nameAr: 'ذهبي ملكي',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%)'
  },
  {
    id: 'gradient-sunset',
    name: 'Sunset',
    nameAr: 'غروب الشمس',
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
  },
  {
    id: 'gradient-ocean',
    name: 'Ocean',
    nameAr: 'المحيط',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    id: 'gradient-forest',
    name: 'Forest',
    nameAr: 'الغابة',
    gradient: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)'
  },
  {
    id: 'gradient-purple-dream',
    name: 'Purple Dream',
    nameAr: 'حلم بنفسجي',
    gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 50%, #d299c2 100%)'
  },
  {
    id: 'gradient-fire',
    name: 'Fire',
    nameAr: 'نار',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 50%, #4facfe 100%)'
  },
  {
    id: 'gradient-emerald',
    name: 'Emerald',
    nameAr: 'زمردي',
    gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'
  },
  {
    id: 'gradient-rose',
    name: 'Rose Gold',
    nameAr: 'ذهبي وردي',
    gradient: 'linear-gradient(135deg, #fa8bff 0%, #2bd2ff 50%, #2bff88 100%)'
  }
];

