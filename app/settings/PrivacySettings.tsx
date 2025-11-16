'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card';
import { Label } from '@/ui/label';
import { Switch } from '@/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select';
import { Separator } from '@/ui/separator';
import { Button } from '@/ui/button';
import { Shield, Eye, Clock, CheckCheck, Users } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export function PrivacySettings() {
  const { t, dir } = useLanguage();
  const [lastSeen, setLastSeen] = useState('everyone');
  const [profilePhoto, setProfilePhoto] = useState('everyone');
  const [status, setStatus] = useState('everyone');
  const [readReceipts, setReadReceipts] = useState(true);
  const [typing, setTyping] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);

  return (
    <div className="space-y-6" dir={dir}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-500" />
            {t('privacy.title')}
          </CardTitle>
          <CardDescription>{t('privacy.title')} - إدارة من يمكنه رؤية معلوماتك</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="lastSeen" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {t('privacy.lastSeen')} & {t('status.online')}
            </Label>
            <Select value={lastSeen} onValueChange={setLastSeen}>
              <SelectTrigger id="lastSeen">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="everyone">{t('privacy.everyone')}</SelectItem>
                <SelectItem value="contacts">{t('privacy.contacts')}</SelectItem>
                <SelectItem value="nobody">{t('privacy.nobody')}</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              التحكم في من يمكنه رؤية آخر ظهور لك
            </p>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="profilePhoto" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              {t('privacy.profilePhoto')}
            </Label>
            <Select value={profilePhoto} onValueChange={setProfilePhoto}>
              <SelectTrigger id="profilePhoto">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="everyone">{t('privacy.everyone')}</SelectItem>
                <SelectItem value="contacts">{t('privacy.contacts')}</SelectItem>
                <SelectItem value="nobody">{t('privacy.nobody')}</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              من يمكنه رؤية صورة ملفك الشخصي
            </p>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="status">{t('status.online')}</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="everyone">{t('privacy.everyone')}</SelectItem>
                <SelectItem value="contacts">{t('privacy.contacts')}</SelectItem>
                <SelectItem value="nobody">{t('privacy.nobody')}</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              من يمكنه رؤية تحديثات حالتك
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCheck className="w-5 h-5 text-amber-500" />
            {t('privacy.readReceipts')} & {t('status.typing')}
          </CardTitle>
          <CardDescription>التحكم فيما يراه الآخرون عند تفاعلك</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="readReceipts">{t('privacy.readReceipts')}</Label>
              <p className="text-sm text-muted-foreground">
                إظهار متى قرأت الرسائل
              </p>
            </div>
            <Switch
              id="readReceipts"
              checked={readReceipts}
              onCheckedChange={setReadReceipts}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="typing">{t('status.typing')}</Label>
              <p className="text-sm text-muted-foreground">
                إظهار متى تكتب
              </p>
            </div>
            <Switch
              id="typing"
              checked={typing}
              onCheckedChange={setTyping}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-500" />
            {t('group.title')}
          </CardTitle>
          <CardDescription>إدارة إعدادات خصوصية المجموعات</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Label htmlFor="groups">{t('privacy.title')} - من يمكنه إضافتي إلى المجموعات</Label>
          <Select defaultValue="everyone">
            <SelectTrigger id="groups">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="everyone">{t('privacy.everyone')}</SelectItem>
              <SelectItem value="contacts">{t('privacy.contacts')}</SelectItem>
              <SelectItem value="nobody">{t('privacy.nobody')}</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('privacy.title')} - الأمان</CardTitle>
          <CardDescription>ميزات الأمان الإضافية</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="twoFactor">{t('privacy.title')} - المصادقة الثنائية</Label>
              <p className="text-sm text-muted-foreground">
                إضافة أمان إضافي لحسابك
              </p>
            </div>
            <Switch
              id="twoFactor"
              checked={twoFactor}
              onCheckedChange={setTwoFactor}
            />
          </div>

          <Separator />

          <div className="space-y-3">
            <Label>{t('privacy.blocked')}</Label>
            <p className="text-sm text-muted-foreground">
              إدارة المستخدمين الذين قمت بحظرهم
            </p>
            <Button type="button" variant="outline" className="w-full">
              {t('privacy.blocked')} (0)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
