'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card';
import { Label } from '@/ui/label';
import { Switch } from '@/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select';
import { Separator } from '@/ui/separator';
import { Bell, Volume2, Smartphone } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { NotificationService } from '../services/NotificationService';

export function NotificationSettings() {
  const { t, dir } = useLanguage();
  const [pushNotifications, setPushNotifications] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('royal_chat_notifications_enabled');
      return saved !== null ? saved === 'true' : true;
    }
    return true;
  });
  const [messageNotifications, setMessageNotifications] = useState(true);
  const [groupNotifications, setGroupNotifications] = useState(true);
  const [reactionNotifications, setReactionNotifications] = useState(true);
  const [mentionNotifications, setMentionNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('royal_chat_notifications_sound');
      return saved !== null ? saved === 'true' : true;
    }
    return true;
  });
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [notificationSound, setNotificationSound] = useState('default');
  const [notificationPreview, setNotificationPreview] = useState('always');

  // Request permission when component mounts and notifications are enabled
  useEffect(() => {
    if (pushNotifications && NotificationService.isSupported()) {
      NotificationService.requestPermission();
    }
  }, [pushNotifications]);

  return (
    <div className="space-y-6" dir={dir}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-500" />
            {t('notifications.title')}
          </CardTitle>
          <CardDescription>{t('notifications.title')} - إدارة كيفية استلام الإشعارات</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="push">{t('notifications.enable')}</Label>
              <p className="text-sm text-muted-foreground">تلقي إشعارات الدفع على جهازك</p>
            </div>
            <Switch
              id="push"
              checked={pushNotifications}
              onCheckedChange={(checked) => {
                setPushNotifications(checked);
                NotificationService.setEnabled(checked);
                if (checked) {
                  NotificationService.requestPermission();
                }
              }}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="messages">{t('notifications.message')}</Label>
              <p className="text-sm text-muted-foreground">الإشعار عن الرسائل الجديدة</p>
            </div>
            <Switch
              id="messages"
              checked={messageNotifications}
              onCheckedChange={setMessageNotifications}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="groups">{t('notifications.group')}</Label>
              <p className="text-sm text-muted-foreground">إشعارات رسائل المجموعات</p>
            </div>
            <Switch
              id="groups"
              checked={groupNotifications}
              onCheckedChange={setGroupNotifications}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="reactions">{t('notifications.title')} - إشعارات التفاعلات</Label>
              <p className="text-sm text-muted-foreground">عندما يتفاعل شخص ما مع رسالتك</p>
            </div>
            <Switch
              id="reactions"
              checked={reactionNotifications}
              onCheckedChange={setReactionNotifications}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="mentions">{t('notifications.title')} - إشعارات الإشارة</Label>
              <p className="text-sm text-muted-foreground">عندما يتم الإشارة إليك في مجموعة</p>
            </div>
            <Switch
              id="mentions"
              checked={mentionNotifications}
              onCheckedChange={setMentionNotifications}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-amber-500" />
            {t('notifications.sound')} & {t('notifications.vibration')}
          </CardTitle>
          <CardDescription>تخصيص تنبيهات الإشعارات</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="sound">{t('notifications.sound')}</Label>
              <p className="text-sm text-muted-foreground">تشغيل صوت للإشعارات</p>
            </div>
            <Switch
              id="sound"
              checked={soundEnabled}
              onCheckedChange={(checked) => {
                setSoundEnabled(checked);
                NotificationService.setSoundEnabled(checked);
              }}
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="soundType">{t('notifications.title')} - نوع الصوت</Label>
            <Select value={notificationSound} onValueChange={setNotificationSound}>
              <SelectTrigger id="soundType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">{dir === 'rtl' ? 'افتراضي' : 'Default'}</SelectItem>
                <SelectItem value="chime">{dir === 'rtl' ? 'نغمة' : 'Chime'}</SelectItem>
                <SelectItem value="bell">{dir === 'rtl' ? 'جرس' : 'Bell'}</SelectItem>
                <SelectItem value="ping">{dir === 'rtl' ? 'تنبيه' : 'Ping'}</SelectItem>
                <SelectItem value="royal">{dir === 'rtl' ? 'نشيد ملكي' : 'Royal Fanfare'}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="vibration">{t('notifications.vibration')}</Label>
              <p className="text-sm text-muted-foreground">الاهتزاز عند الإشعارات</p>
            </div>
            <Switch
              id="vibration"
              checked={vibrationEnabled}
              onCheckedChange={setVibrationEnabled}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-amber-500" />
            {t('notifications.title')} - معاينة الإشعارات
          </CardTitle>
          <CardDescription>التحكم فيما يتم عرضه في الإشعارات</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="preview">{t('notifications.title')} - إظهار المعاينة</Label>
            <Select value={notificationPreview} onValueChange={setNotificationPreview}>
              <SelectTrigger id="preview">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="always">{dir === 'rtl' ? 'دائماً' : 'Always'}</SelectItem>
                <SelectItem value="unlocked">{dir === 'rtl' ? 'عند الفتح' : 'When Unlocked'}</SelectItem>
                <SelectItem value="never">{dir === 'rtl' ? 'أبداً' : 'Never'}</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              اختر متى يتم عرض محتوى الرسالة في الإشعارات
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
