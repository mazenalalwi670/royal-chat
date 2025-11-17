'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
import { Textarea } from '@/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/ui/avatar';
import { Badge } from '@/ui/badge';
import { Camera, Save, Phone, MapPin, X, Link as LinkIcon } from 'lucide-react';
import { User } from '@/types/chat';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRef } from 'react';
import { cn } from '@/lib/utils';

interface ProfileSettingsProps {
  currentUser: User;
  onUpdateUser: (updates: Partial<User>) => void;
}

// Royal Crown Icon - Default avatar helper function
const getRoyalCrownIcon = (): string => {
  return `data:image/svg+xml;base64,${btoa(`
    <svg width="150" height="150" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="crownGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#FFD700;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#FFA500;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#FFD700;stop-opacity:1" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <rect width="200" height="200" fill="#1a1a1a" rx="100"/>
      <path d="M50 140 L75 60 L100 80 L125 60 L150 140 Z" 
            fill="url(#crownGradient)" 
            stroke="#FFD700" 
            stroke-width="3"
            filter="url(#glow)"/>
      <circle cx="75" cy="60" r="10" fill="#FFD700" filter="url(#glow)"/>
      <circle cx="100" cy="50" r="12" fill="#FFD700" filter="url(#glow)"/>
      <circle cx="125" cy="60" r="10" fill="#FFD700" filter="url(#glow)"/>
      <path d="M45 140 L155 140 L160 150 L40 150 Z" fill="#FFD700" opacity="0.8" filter="url(#glow)"/>
      <text x="100" y="175" font-family="serif" font-size="24" font-weight="bold" 
            fill="#FFD700" text-anchor="middle" filter="url(#glow)">R</text>
    </svg>
  `)}`;
};

export function ProfileSettings({ currentUser, onUpdateUser }: ProfileSettingsProps) {
  const { t, dir } = useLanguage();
  const [name, setName] = useState(currentUser.name);
  const [bio, setBio] = useState((currentUser as { bio?: string }).bio || '');
  const [phone, setPhone] = useState('+1 234 567 8900');
  const [location, setLocation] = useState('New York, USA');
  // Force Royal Crown as default if current avatar is not Royal Crown or custom image
  const defaultAvatar = currentUser.avatar && currentUser.avatar.includes('data:image/svg+xml') 
    ? currentUser.avatar 
    : getRoyalCrownIcon();
  const [avatar, setAvatar] = useState(defaultAvatar);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        setAvatar(result);
        // Update user immediately
        onUpdateUser({ avatar: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUrlChange = () => {
    if (imageUrl.trim()) {
      // Validate URL
      try {
        const url = new URL(imageUrl.trim());
        if (url.protocol === 'http:' || url.protocol === 'https:') {
          setAvatar(imageUrl.trim());
          setAvatarPreview(null);
          setImageUrl('');
          setShowUrlInput(false);
          // Update user immediately
          onUpdateUser({ avatar: imageUrl.trim() });
        } else {
          alert(dir === 'rtl' ? 'يرجى إدخال رابط صحيح (http أو https)' : 'Please enter a valid URL (http or https)');
        }
      } catch (e) {
        // Also accept data URLs
        if (imageUrl.trim().startsWith('data:image/')) {
          setAvatar(imageUrl.trim());
          setAvatarPreview(null);
          setImageUrl('');
          setShowUrlInput(false);
          onUpdateUser({ avatar: imageUrl.trim() });
        } else {
          alert(dir === 'rtl' ? 'يرجى إدخال رابط صحيح' : 'Please enter a valid URL');
        }
      }
    }
  };

  const handleRemoveAvatar = () => {
    // MANDATORY: Reset to Royal Crown icon (default for all users)
    const royalCrownIcon = getRoyalCrownIcon();
    setAvatar(royalCrownIcon);
    setAvatarPreview(null);
    setImageUrl('');
    setShowUrlInput(false);
    onUpdateUser({ avatar: royalCrownIcon });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = () => {
    onUpdateUser({ 
      name, 
      avatar,
      ...(bio && { bio } as Partial<User>)
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6" dir={dir}>
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl">{t('profile.title')}</CardTitle>
          <CardDescription className="text-sm sm:text-base mt-1">{t('profile.title')} - {dir === 'rtl' ? 'تحديث معلوماتك الشخصية' : 'Update your personal information'}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
          {/* Mobile-first layout: Stack on mobile, side-by-side on desktop */}
          <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
            <div className="relative group w-full sm:w-auto flex justify-center sm:justify-start">
              <Avatar className="w-20 h-20 sm:w-24 sm:h-24 border-2 sm:border-4 border-amber-500/20 shadow-lg transition-all duration-300 group-hover:scale-105">
                <AvatarImage src={avatarPreview || avatar || defaultAvatar} 
                             onError={(e) => {
                               // If image fails to load, show Royal Crown icon (mandatory default)
                               const target = e.target as HTMLImageElement;
                               const royalCrownIcon = getRoyalCrownIcon();
                               target.src = royalCrownIcon;
                             }} />
                <AvatarFallback className="bg-gradient-to-br from-amber-600 to-amber-500 text-white text-2xl sm:text-3xl font-bold flex items-center justify-center">
                  <svg width="40" height="40" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="sm:w-12 sm:h-12">
                    <path d="M50 140 L75 60 L100 80 L125 60 L150 140 Z" 
                          fill="#FFD700" 
                          stroke="#FFA500" 
                          strokeWidth="2"/>
                    <circle cx="75" cy="60" r="8" fill="#FFD700"/>
                    <circle cx="100" cy="50" r="10" fill="#FFD700"/>
                    <circle cx="125" cy="60" r="8" fill="#FFD700"/>
                  </svg>
                </AvatarFallback>
              </Avatar>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
                id="avatar-upload"
              />
              <div className="absolute bottom-0 right-0 flex gap-2">
                <Button
                  type="button"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-full w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 shadow-lg transition-all duration-300 hover:scale-110 z-10 min-h-[40px] min-w-[40px] touch-manipulation"
                  title={dir === 'rtl' ? 'رفع صورة من الجهاز' : 'Upload Image from Device'}
                >
                  <Camera className="w-5 h-5 sm:w-6 sm:h-6" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  className="rounded-full w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-lg transition-all duration-300 hover:scale-110 z-10 min-h-[40px] min-w-[40px] touch-manipulation"
                  title={dir === 'rtl' ? 'إدخال رابط الصورة' : 'Enter Image URL'}
                >
                  <LinkIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                </Button>
              </div>
              {(avatarPreview || (avatar && !avatar.includes('data:image/svg+xml'))) && (
                <Button
                  type="button"
                  size="icon"
                  onClick={handleRemoveAvatar}
                  className="absolute top-0 right-0 rounded-full w-8 h-8 sm:w-10 sm:h-10 bg-red-500 hover:bg-red-600 shadow-lg transition-all duration-300 hover:scale-110 z-10 min-h-[32px] min-w-[32px] touch-manipulation"
                  title={dir === 'rtl' ? 'إزالة الصورة' : 'Remove Photo'}
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 rounded-full transition-colors duration-300" />
              
              {/* URL Input - Mobile responsive */}
              {showUrlInput && (
                <div className={`absolute top-full mt-4 ${dir === 'rtl' ? 'right-0' : 'left-0'} w-[calc(100vw-2rem)] sm:w-80 max-w-sm p-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl border-2 border-amber-500/20 z-20`}>
                  <div className="space-y-3">
                    <Label htmlFor="image-url" className="text-sm font-semibold flex items-center gap-2">
                      <LinkIcon className="w-4 h-4" />
                      {dir === 'rtl' ? 'رابط الصورة' : 'Image URL'}
                    </Label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Input
                        id="image-url"
                        type="url"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder={dir === 'rtl' ? 'https://example.com/image.jpg' : 'https://example.com/image.jpg'}
                        className="flex-1 h-11 sm:h-10 text-sm sm:text-base"
                        dir="ltr"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleImageUrlChange();
                          } else if (e.key === 'Escape') {
                            setShowUrlInput(false);
                            setImageUrl('');
                          }
                        }}
                      />
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          onClick={handleImageUrlChange}
                          className="flex-1 sm:flex-none bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 h-11 sm:h-10 min-h-[44px] sm:min-h-[40px] touch-manipulation"
                          size="sm"
                        >
                          {dir === 'rtl' ? 'تطبيق' : 'Apply'}
                        </Button>
                        <Button
                          type="button"
                          onClick={() => {
                            setShowUrlInput(false);
                            setImageUrl('');
                          }}
                          variant="outline"
                          size="sm"
                          className="flex-1 sm:flex-none h-11 sm:h-10 min-h-[44px] sm:min-h-[40px] touch-manipulation"
                        >
                          {dir === 'rtl' ? 'إلغاء' : 'Cancel'}
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      {dir === 'rtl' ? 'أدخل رابط الصورة (http/https) أو data URL' : 'Enter image URL (http/https) or data URL'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex-1 space-y-4 w-full">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-sm sm:text-base">{t('profile.name')}</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('profile.name')}
                  dir={dir}
                  className="h-11 sm:h-12 text-sm sm:text-base"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="bio" className="text-sm sm:text-base">{t('profile.bio')}</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder={t('profile.bio')}
                  rows={4}
                  className="resize-none h-24 sm:h-28 text-sm sm:text-base"
                  dir={dir}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs sm:text-sm px-2 sm:px-3 py-1">
              {t(`status.${currentUser.status}`)}
            </Badge>
            <span className="text-xs sm:text-sm text-muted-foreground">{t('status.online')}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl">{t('profile.title')} - {dir === 'rtl' ? 'معلومات الاتصال' : 'Contact Information'}</CardTitle>
          <CardDescription className="text-sm sm:text-base mt-1">{t('profile.title')} - {dir === 'rtl' ? 'إدارة معلومات الاتصال الخاصة بك' : 'Manage your contact details'}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-5 p-4 sm:p-6">
          <div className="grid gap-2">
            <Label htmlFor="phone" className="text-sm sm:text-base">{t('profile.phone')}</Label>
            <div className="relative">
              <Phone className={`absolute ${dir === 'rtl' ? 'right' : 'left'}-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground`} />
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={cn(
                  dir === 'rtl' ? 'pr-10 sm:pr-12' : 'pl-10 sm:pl-12',
                  "h-11 sm:h-12 text-sm sm:text-base"
                )}
                dir={dir}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="location" className="text-sm sm:text-base">{t('profile.location')}</Label>
            <div className="relative">
              <MapPin className={`absolute ${dir === 'rtl' ? 'right' : 'left'}-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground`} />
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className={cn(
                  dir === 'rtl' ? 'pr-10 sm:pr-12' : 'pl-10 sm:pl-12',
                  "h-11 sm:h-12 text-sm sm:text-base"
                )}
                dir={dir}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className={`flex ${dir === 'rtl' ? 'justify-start' : 'justify-end'} pt-2`}>
        <Button
          type="button"
          onClick={handleSave}
          className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 h-12 sm:h-14 w-full sm:w-auto px-6 sm:px-8 text-base sm:text-lg font-semibold min-h-[48px] touch-manipulation"
        >
          <Save className={`w-5 h-5 sm:w-6 sm:h-6 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
          {t('profile.saveChanges')}
        </Button>
      </div>
    </div>
  );
}
