'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'ar' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: 'rtl' | 'ltr';
}

const translations = {
  ar: {
    // Common
    'common.save': 'حفظ',
    'common.cancel': 'إلغاء',
    'common.delete': 'حذف',
    'common.edit': 'تعديل',
    'common.search': 'بحث',
    'common.close': 'إغلاق',
    'common.confirm': 'تأكيد',
    'common.yes': 'نعم',
    'common.no': 'لا',
    'common.ok': 'موافق',
    
    // Navigation
    'nav.chats': 'الدردشة',
    'nav.contacts': 'جهات الاتصال',
    'nav.settings': 'الإعدادات',
    'nav.logout': 'تسجيل الخروج',
    
    // Chat
    'chat.sendMessage': 'اكتب رسالة...',
    'chat.selectConversation': 'اختر محادثة للبدء',
    'chat.reply': 'رد',
    'chat.replyTo': 'الرد على',
    'chat.editMessage': 'تعديل الرسالة',
    'chat.deleteMessage': 'حذف الرسالة',
    'chat.copy': 'نسخ',
    'chat.forward': 'إعادة توجيه',
    'chat.search': 'ابحث في المحادثات...',
    'chat.noMessages': 'لا توجد رسائل بعد',
    'chat.typeMessage': 'اكتب رسالة...',
    'chat.messageSent': 'تم الإرسال',
    'chat.messageDelivered': 'تم التسليم',
    'chat.messageRead': 'تم القراءة',
    'chat.sending': 'جاري الإرسال...',
    
    // Contacts
    'contacts.title': 'جهات الاتصال',
    'contacts.comingSoon': 'إدارة جهات الاتصال قريباً',
    'contacts.add': 'إضافة جهة اتصال',
    'contacts.online': 'متصل',
    'contacts.offline': 'غير متصل',
    'contacts.away': 'بعيد',
    
    // Settings
    'settings.title': 'الإعدادات',
    'settings.profile': 'الملف الشخصي',
    'settings.appearance': 'المظهر',
    'settings.notifications': 'الإشعارات',
    'settings.privacy': 'الخصوصية',
    'settings.chat': 'الدردشة',
    'settings.language': 'اللغة',
    
    // Profile Settings
    'profile.title': 'الملف الشخصي',
    'profile.name': 'الاسم',
    'profile.bio': 'نبذة شخصية',
    'profile.phone': 'رقم الهاتف',
    'profile.email': 'البريد الإلكتروني',
    'profile.location': 'الموقع',
    'profile.changePhoto': 'تغيير الصورة',
    'profile.saveChanges': 'حفظ التغييرات',
    
    // Appearance Settings
    'appearance.title': 'المظهر',
    'appearance.darkMode': 'الوضع الليلي',
    'appearance.theme': 'الثيم',
    'appearance.system': 'النظام',
    'appearance.light': 'فاتح',
    'appearance.dark': 'داكن',
    'appearance.colorScheme': 'مخطط الألوان',
    
    // Notification Settings
    'notifications.title': 'الإشعارات',
    'notifications.enable': 'تفعيل الإشعارات',
    'notifications.sound': 'صوت الإشعارات',
    'notifications.vibration': 'الاهتزاز',
    'notifications.desktop': 'إشعارات سطح المكتب',
    'notifications.message': 'إشعارات الرسائل',
    'notifications.group': 'إشعارات المجموعات',
    
    // Privacy Settings
    'privacy.title': 'الخصوصية',
    'privacy.lastSeen': 'آخر ظهور',
    'privacy.everyone': 'الجميع',
    'privacy.contacts': 'جهات الاتصال فقط',
    'privacy.nobody': 'لا أحد',
    'privacy.profilePhoto': 'صورة الملف الشخصي',
    'privacy.readReceipts': 'إيصالات القراءة',
    'privacy.blocked': 'المحظورون',
    
    // Chat Settings
    'chatSettings.title': 'إعدادات الدردشة',
    'chatSettings.autoDownload': 'تنزيل تلقائي',
    'chatSettings.saveToGallery': 'حفظ في المعرض',
    'chatSettings.disappearing': 'رسائل تختفي',
    'chatSettings.archive': 'أرشفة المحادثات',
    'chatSettings.backup': 'نسخ احتياطي',
    'chatSettings.clearChat': 'مسح المحادثة',
    'chatSettings.deleteChat': 'حذف المحادثة',
    
    // Language Settings
    'language.title': 'اللغة',
    'language.select': 'اختر اللغة',
    'language.arabic': 'العربية',
    'language.english': 'English',
    'language.restart': 'سيتم إعادة تشغيل التطبيق لتطبيق التغييرات',
    
    // Groups
    'group.title': 'المجموعة',
    'group.members': 'الأعضاء',
    'group.addMember': 'إضافة عضو',
    'group.removeMember': 'إزالة عضو',
    'group.makeAdmin': 'جعل مشرف',
    'group.removeAdmin': 'إزالة صلاحيات المشرف',
    'group.leave': 'مغادرة المجموعة',
    'group.delete': 'حذف المجموعة',
    
    // Status
    'status.online': 'متصل',
    'status.offline': 'غير متصل',
    'status.away': 'بعيد',
    'status.typing': 'يكتب...',
    
    // Time
    'time.now': 'الآن',
    'time.minutesAgo': 'دقائق مضت',
    'time.hoursAgo': 'ساعات مضت',
    'time.daysAgo': 'أيام مضت',
    'time.weeksAgo': 'أسابيع مضت',
    
    // Actions
    'actions.pin': 'تثبيت',
    'actions.unpin': 'إلغاء التثبيت',
    'actions.archive': 'أرشفة',
    'actions.unarchive': 'إلغاء الأرشفة',
    'actions.mute': 'كتم',
    'actions.unmute': 'إلغاء الكتم',
    'actions.block': 'حظر',
    'actions.unblock': 'إلغاء الحظر',
  },
  en: {
    // Common
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.search': 'Search',
    'common.close': 'Close',
    'common.confirm': 'Confirm',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.ok': 'OK',
    
    // Navigation
    'nav.chats': 'Chats',
    'nav.contacts': 'Contacts',
    'nav.settings': 'Settings',
    'nav.logout': 'Logout',
    
    // Chat
    'chat.sendMessage': 'Type a message...',
    'chat.selectConversation': 'Select a conversation to start chatting',
    'chat.reply': 'Reply',
    'chat.replyTo': 'Replying to',
    'chat.editMessage': 'Editing message',
    'chat.deleteMessage': 'Delete message',
    'chat.copy': 'Copy',
    'chat.forward': 'Forward',
    'chat.search': 'Search conversations...',
    'chat.noMessages': 'No messages yet',
    'chat.typeMessage': 'Type a message...',
    'chat.messageSent': 'Sent',
    'chat.messageDelivered': 'Delivered',
    'chat.messageRead': 'Read',
    'chat.sending': 'Sending...',
    
    // Contacts
    'contacts.title': 'Contacts',
    'contacts.comingSoon': 'Contact management coming soon',
    'contacts.add': 'Add Contact',
    'contacts.online': 'Online',
    'contacts.offline': 'Offline',
    'contacts.away': 'Away',
    
    // Settings
    'settings.title': 'Settings',
    'settings.profile': 'Profile',
    'settings.appearance': 'Appearance',
    'settings.notifications': 'Notifications',
    'settings.privacy': 'Privacy',
    'settings.chat': 'Chat',
    'settings.language': 'Language',
    
    // Profile Settings
    'profile.title': 'Profile',
    'profile.name': 'Name',
    'profile.bio': 'Bio',
    'profile.phone': 'Phone',
    'profile.email': 'Email',
    'profile.location': 'Location',
    'profile.changePhoto': 'Change Photo',
    'profile.saveChanges': 'Save Changes',
    
    // Appearance Settings
    'appearance.title': 'Appearance',
    'appearance.darkMode': 'Dark Mode',
    'appearance.theme': 'Theme',
    'appearance.system': 'System',
    'appearance.light': 'Light',
    'appearance.dark': 'Dark',
    'appearance.colorScheme': 'Color Scheme',
    
    // Notification Settings
    'notifications.title': 'Notifications',
    'notifications.enable': 'Enable Notifications',
    'notifications.sound': 'Notification Sound',
    'notifications.vibration': 'Vibration',
    'notifications.desktop': 'Desktop Notifications',
    'notifications.message': 'Message Notifications',
    'notifications.group': 'Group Notifications',
    
    // Privacy Settings
    'privacy.title': 'Privacy',
    'privacy.lastSeen': 'Last Seen',
    'privacy.everyone': 'Everyone',
    'privacy.contacts': 'Contacts Only',
    'privacy.nobody': 'Nobody',
    'privacy.profilePhoto': 'Profile Photo',
    'privacy.readReceipts': 'Read Receipts',
    'privacy.blocked': 'Blocked',
    
    // Chat Settings
    'chatSettings.title': 'Chat Settings',
    'chatSettings.autoDownload': 'Auto Download',
    'chatSettings.saveToGallery': 'Save to Gallery',
    'chatSettings.disappearing': 'Disappearing Messages',
    'chatSettings.archive': 'Archive Chats',
    'chatSettings.backup': 'Backup',
    'chatSettings.clearChat': 'Clear Chat',
    'chatSettings.deleteChat': 'Delete Chat',
    
    // Language Settings
    'language.title': 'Language',
    'language.select': 'Select Language',
    'language.arabic': 'العربية',
    'language.english': 'English',
    'language.restart': 'The app will restart to apply changes',
    
    // Groups
    'group.title': 'Group',
    'group.members': 'Members',
    'group.addMember': 'Add Member',
    'group.removeMember': 'Remove Member',
    'group.makeAdmin': 'Make Admin',
    'group.removeAdmin': 'Remove Admin',
    'group.leave': 'Leave Group',
    'group.delete': 'Delete Group',
    
    // Status
    'status.online': 'Online',
    'status.offline': 'Offline',
    'status.away': 'Away',
    'status.typing': 'Typing...',
    
    // Time
    'time.now': 'Now',
    'time.minutesAgo': 'minutes ago',
    'time.hoursAgo': 'hours ago',
    'time.daysAgo': 'days ago',
    'time.weeksAgo': 'weeks ago',
    
    // Actions
    'actions.pin': 'Pin',
    'actions.unpin': 'Unpin',
    'actions.archive': 'Archive',
    'actions.unarchive': 'Unarchive',
    'actions.mute': 'Mute',
    'actions.unmute': 'Unmute',
    'actions.block': 'Block',
    'actions.unblock': 'Unblock',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Initialize with Arabic as default, but check localStorage on mount
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('language') as Language;
      if (saved === 'ar' || saved === 'en') {
        return saved;
      }
    }
    return 'ar';
  });
  
  // Update HTML attributes on mount and when language changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('language') as Language;
      if (saved === 'ar' || saved === 'en') {
        setLanguageState(saved);
        document.documentElement.dir = saved === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = saved;
      } else {
        document.documentElement.dir = 'rtl';
        document.documentElement.lang = 'ar';
      }
    }
  }, []);
  
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang);
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = lang;
    }
  };
  
  useEffect(() => {
    // Update HTML attributes when language changes
    if (typeof window !== 'undefined') {
      document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = language;
    }
  }, [language]);
  
  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.ar] || key;
  };
  
  const dir = language === 'ar' ? 'rtl' : 'ltr';
  
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

