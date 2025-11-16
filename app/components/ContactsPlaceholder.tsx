'use client';

import { useLanguage } from '@/contexts/LanguageContext';

export function ContactsPlaceholder() {
  const { t, dir } = useLanguage();
  
  return (
    <div className="flex-1 flex items-center justify-center" dir={dir}>
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">{t('contacts.title')}</h2>
        <p className="text-muted-foreground">{t('contacts.comingSoon')}</p>
      </div>
    </div>
  );
}

