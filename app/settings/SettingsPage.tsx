'use client';

import { ScrollArea } from '@/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/tabs';
import { User, Bell, Lock, Palette, MessageSquare, Crown, Globe, Shield } from 'lucide-react';
import { ProfileSettings } from './ProfileSettings';
import { AppearanceSettings } from './AppearanceSettings';
import { NotificationSettings } from './NotificationSettings';
import { PrivacySettings } from './PrivacySettings';
import { ChatSettings } from './ChatSettings';
import { LanguageSettings } from './LanguageSettings';
import { User as UserType } from '@/types/chat';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { Button } from '@/ui/button';
import { useRouter } from 'next/navigation';

interface SettingsPageProps {
  currentUser: UserType;
  onUpdateUser: (updates: Partial<UserType>) => void;
}

export function SettingsPage({ currentUser, onUpdateUser }: SettingsPageProps) {
  const { t, dir } = useLanguage();
  const { isOwner, isAdmin, isAuthenticated } = useAuth();
  const router = useRouter();

  return (
    <div className="flex-1 h-full" dir={dir}>
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-3 p-4">
          <div className="flex items-center gap-2">
            <Crown className="w-6 h-6" style={{ color: `hsl(var(--primary))` }} />
            <h1 className="text-2xl font-bold" style={{
              color: `hsl(var(--primary))`
            }}>
              {t('settings.title')}
            </h1>
          </div>
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-73px)]">
        <div className="p-6">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-7 lg:w-[700px]">
              <TabsTrigger value="profile" className="gap-2">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">{t('settings.profile')}</span>
              </TabsTrigger>
              <TabsTrigger value="appearance" className="gap-2">
                <Palette className="w-4 h-4" />
                <span className="hidden sm:inline">{t('settings.appearance')}</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="gap-2">
                <Bell className="w-4 h-4" />
                <span className="hidden sm:inline">{t('settings.notifications')}</span>
              </TabsTrigger>
              <TabsTrigger value="privacy" className="gap-2">
                <Lock className="w-4 h-4" />
                <span className="hidden sm:inline">{t('settings.privacy')}</span>
              </TabsTrigger>
              <TabsTrigger value="chat" className="gap-2">
                <MessageSquare className="w-4 h-4" />
                <span className="hidden sm:inline">{t('settings.chat')}</span>
              </TabsTrigger>
              <TabsTrigger value="language" className="gap-2">
                <Globe className="w-4 h-4" />
                <span className="hidden sm:inline">{t('settings.language')}</span>
              </TabsTrigger>
              <TabsTrigger value="admin" className="gap-2">
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">{dir === 'rtl' ? 'لوحة التحكم' : 'Admin Panel'}</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-6">
              <ProfileSettings currentUser={currentUser} onUpdateUser={onUpdateUser} />
            </TabsContent>

            <TabsContent value="appearance" className="mt-6">
              <AppearanceSettings />
            </TabsContent>

            <TabsContent value="notifications" className="mt-6">
              <NotificationSettings />
            </TabsContent>

            <TabsContent value="privacy" className="mt-6">
              <PrivacySettings />
            </TabsContent>

            <TabsContent value="chat" className="mt-6">
              <ChatSettings />
            </TabsContent>

            <TabsContent value="language" className="mt-6">
              <LanguageSettings />
            </TabsContent>

            {(isOwner || isAdmin) && (
              <TabsContent value="admin" className="mt-6">
                <div className="h-[calc(100vh-200px)] overflow-auto">
                  <AdminDashboard />
                </div>
              </TabsContent>
            )}
            {!isOwner && !isAdmin && (
              <TabsContent value="admin" className="mt-6">
                <div className="p-6 text-center">
                  <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-bold mb-2">
                    {dir === 'rtl' ? 'غير مصرح لك' : 'Access Denied'}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {dir === 'rtl' 
                      ? 'يجب أن تكون مالكاً أو أدمن للوصول إلى لوحة التحكم'
                      : 'You must be an owner or admin to access the admin panel'}
                  </p>
                  {!isAuthenticated && (
                    <Button
                      onClick={() => router.push('/admin')}
                      className="mt-4 bg-primary hover:bg-primary/90"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      {dir === 'rtl' ? 'تسجيل الدخول كمالك' : 'Login as Owner'}
                    </Button>
                  )}
                  {isAuthenticated && (
                    <p className="text-sm text-muted-foreground mt-4">
                      {dir === 'rtl' 
                        ? 'حسابك الحالي ليس لديه صلاحيات المالك'
                        : 'Your current account does not have owner permissions'}
                    </p>
                  )}
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </ScrollArea>
    </div>
  );
}
