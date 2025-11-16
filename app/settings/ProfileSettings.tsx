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
    <div className="space-y-6" dir={dir}>
      <Card>
        <CardHeader>
          <CardTitle>{t('profile.title')}</CardTitle>
          <CardDescription>{t('profile.title')} - {dir === 'rtl' ? 'تحديث معلوماتك الشخصية' : 'Update your personal information'}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-start gap-6">
            <div className="relative group">
              <Avatar className="w-24 h-24 border-4 border-amber-500/20 shadow-lg transition-all duration-300 group-hover:scale-105">
                <AvatarImage src={avatarPreview || avatar || defaultAvatar} 
                             onError={(e) => {
                               // If image fails to load, show Royal Crown icon (mandatory default)
                               const target = e.target as HTMLImageElement;
                               const royalCrownIcon = getRoyalCrownIcon();
                               target.src = royalCrownIcon;
                             }} />
                <AvatarFallback className="bg-gradient-to-br from-amber-600 to-amber-500 text-white text-3xl font-bold flex items-center justify-center">
                  <svg width="48" height="48" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                    <path d="M50 140 L75 60 L100 80 L125 60 L150 140 Z" 
                          fill="#FFD700" 
                          stroke="#FFA500" 
                          stroke-width="2"/>
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
                  className="rounded-full w-10 h-10 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 shadow-lg transition-all duration-300 hover:scale-110 z-10"
                  title={dir === 'rtl' ? 'رفع صورة من الجهاز' : 'Upload Image from Device'}
                >
                  <Camera className="w-5 h-5" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  className="rounded-full w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-lg transition-all duration-300 hover:scale-110 z-10"
                  title={dir === 'rtl' ? 'إدخال رابط الصورة' : 'Enter Image URL'}
                >
                  <LinkIcon className="w-5 h-5" />
                </Button>
              </div>
              {(avatarPreview || (avatar && !avatar.includes('data:image/svg+xml'))) && (
                <Button
                  type="button"
                  size="icon"
                  onClick={handleRemoveAvatar}
                  className="absolute top-0 right-0 rounded-full w-8 h-8 bg-red-500 hover:bg-red-600 shadow-lg transition-all duration-300 hover:scale-110 z-10"
                  title={dir === 'rtl' ? 'إزالة الصورة' : 'Remove Photo'}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 rounded-full transition-colors duration-300" />
              
              {/* URL Input */}
              {showUrlInput && (
                <div className={`absolute top-full mt-4 ${dir === 'rtl' ? 'right-0' : 'left-0'} w-80 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl border-2 border-amber-500/20 z-20`}>
                  <div className="space-y-3">
                    <Label htmlFor="image-url" className="text-sm font-semibold flex items-center gap-2">
                      <LinkIcon className="w-4 h-4" />
                      {dir === 'rtl' ? 'رابط الصورة' : 'Image URL'}
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="image-url"
                        type="url"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder={dir === 'rtl' ? 'https://example.com/image.jpg' : 'https://example.com/image.jpg'}
                        className="flex-1"
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
                      <Button
                        type="button"
                        onClick={handleImageUrlChange}
                        className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
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
                      >
                        {dir === 'rtl' ? 'إلغاء' : 'Cancel'}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">
                      {dir === 'rtl' ? 'أدخل رابط الصورة (http/https) أو data URL' : 'Enter image URL (http/https) or data URL'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex-1 space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">{t('profile.name')}</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('profile.name')}
                  dir={dir}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="bio">{t('profile.bio')}</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder={t('profile.bio')}
                  rows={3}
                  className="resize-none"
                  dir={dir}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              {t(`status.${currentUser.status}`)}
            </Badge>
            <span className="text-sm text-muted-foreground">{t('status.online')}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('profile.title')} - {dir === 'rtl' ? 'معلومات الاتصال' : 'Contact Information'}</CardTitle>
          <CardDescription>{t('profile.title')} - {dir === 'rtl' ? 'إدارة معلومات الاتصال الخاصة بك' : 'Manage your contact details'}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="phone">{t('profile.phone')}</Label>
            <div className="relative">
              <Phone className={`absolute ${dir === 'rtl' ? 'right' : 'left'}-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground`} />
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={dir === 'rtl' ? 'pr-10' : 'pl-10'}
                dir={dir}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="location">{t('profile.location')}</Label>
            <div className="relative">
              <MapPin className={`absolute ${dir === 'rtl' ? 'right' : 'left'}-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground`} />
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className={dir === 'rtl' ? 'pr-10' : 'pl-10'}
                dir={dir}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className={`flex ${dir === 'rtl' ? 'justify-start' : 'justify-end'}`}>
        <Button
          type="button"
          onClick={handleSave}
          className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600"
        >
          <Save className={`w-4 h-4 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
          {t('profile.saveChanges')}
        </Button>
      </div>
    </div>
  );
}
