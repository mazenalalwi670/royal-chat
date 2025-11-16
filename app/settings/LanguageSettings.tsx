'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card';
import { Label } from '@/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select';
import { Separator } from '@/ui/separator';
import { Globe, RefreshCw } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export function LanguageSettings() {
  const { language, setLanguage, t, dir } = useLanguage();
  const [showRestart, setShowRestart] = useState(false);

  const handleLanguageChange = (newLanguage: 'ar' | 'en') => {
    if (newLanguage !== language) {
      setLanguage(newLanguage);
      setShowRestart(true);
      // Reload page after a short delay to apply language changes
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  };

  const languages = [
    { value: 'ar', label: t('language.arabic'), flag: '🇸🇦' },
    { value: 'en', label: t('language.english'), flag: '🇬🇧' },
  ];

  return (
    <div className="space-y-6" dir={dir}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-amber-500" />
            {t('language.title')}
          </CardTitle>
          <CardDescription>
            {t('language.select')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label htmlFor="language">{t('language.select')}</Label>
            <Select value={language} onValueChange={handleLanguageChange}>
              <SelectTrigger id="language" className="w-full">
                <SelectValue>
                  <div className="flex items-center gap-2">
                    <span>{languages.find(l => l.value === language)?.flag}</span>
                    <span>{languages.find(l => l.value === language)?.label}</span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    <div className="flex items-center gap-2">
                      <span>{lang.flag}</span>
                      <span>{lang.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {showRestart && (
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <p className="text-sm font-medium">{t('language.restart')}</p>
              </div>
            </div>
          )}

          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              {dir === 'rtl' 
                ? 'اللغة العربية هي اللغة الافتراضية للتطبيق. يمكنك التبديل إلى الإنجليزية إذا أردت.'
                : 'Arabic is the default language of the app. You can switch to English if you prefer.'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

