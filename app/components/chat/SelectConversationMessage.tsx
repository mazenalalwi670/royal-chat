'use client';

import { useLanguage } from '@/contexts/LanguageContext';

export function SelectConversationMessage() {
  const { t, dir } = useLanguage();
  
  return (
    <div className="h-full flex items-center justify-center text-muted-foreground text-lg" dir={dir}>
      {t('chat.selectConversation')}
    </div>
  );
}

