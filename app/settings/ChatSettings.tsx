'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card';
import { Label } from '@/ui/label';
import { Switch } from '@/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select';
import { Separator } from '@/ui/separator';
import { Button } from '@/ui/button';
import { MessageSquare, Download, Archive, Trash2, Clock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export function ChatSettings() {
  const { t, dir } = useLanguage();
  const [autoDownload, setAutoDownload] = useState(true);
  const [saveToGallery, setSaveToGallery] = useState(false);
  const [enterToSend, setEnterToSend] = useState(true);
  const [disappearingMessages, setDisappearingMessages] = useState(false);
  const [disappearingTimer, setDisappearingTimer] = useState('24h');
  const [archiveRead, setArchiveRead] = useState(false);
  const [linkPreviews, setLinkPreviews] = useState(true);

  return (
    <div className="space-y-6" dir={dir}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-amber-500" />
            {t('chatSettings.title')}
          </CardTitle>
          <CardDescription>{t('chatSettings.title')} - تخصيص تجربة المراسلة</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enterToSend">{t('chatSettings.title')} - Enter للإرسال</Label>
              <p className="text-sm text-muted-foreground">
                اضغط Enter لإرسال الرسائل
              </p>
            </div>
            <Switch
              id="enterToSend"
              checked={enterToSend}
              onCheckedChange={setEnterToSend}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="linkPreviews">{t('chatSettings.title')} - معاينة الروابط</Label>
              <p className="text-sm text-muted-foreground">
                إظهار معاينة للروابط المشتركة
              </p>
            </div>
            <Switch
              id="linkPreviews"
              checked={linkPreviews}
              onCheckedChange={setLinkPreviews}
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="messageAlignment">{t('chatSettings.title')} - نمط فقاعات الرسائل</Label>
            <Select defaultValue="modern">
              <SelectTrigger id="messageAlignment">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="modern">{dir === 'rtl' ? 'حديث' : 'Modern'}</SelectItem>
                <SelectItem value="classic">{dir === 'rtl' ? 'كلاسيكي' : 'Classic'}</SelectItem>
                <SelectItem value="minimal">{dir === 'rtl' ? 'بسيط' : 'Minimal'}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            {t('chatSettings.disappearing')}
          </CardTitle>
          <CardDescription>تعيين المؤقت الافتراضي للرسائل التي تختفي</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="disappearing">{t('chatSettings.disappearing')} - التفعيل افتراضياً</Label>
              <p className="text-sm text-muted-foreground">
                تفعيل للمحادثات الجديدة
              </p>
            </div>
            <Switch
              id="disappearing"
              checked={disappearingMessages}
              onCheckedChange={setDisappearingMessages}
            />
          </div>

          {disappearingMessages && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="timer">{t('chatSettings.disappearing')} - المؤقت الافتراضي</Label>
                <Select value={disappearingTimer} onValueChange={setDisappearingTimer}>
                  <SelectTrigger id="timer">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">{dir === 'rtl' ? 'ساعة واحدة' : '1 Hour'}</SelectItem>
                    <SelectItem value="24h">{dir === 'rtl' ? '24 ساعة' : '24 Hours'}</SelectItem>
                    <SelectItem value="7d">{dir === 'rtl' ? '7 أيام' : '7 Days'}</SelectItem>
                    <SelectItem value="30d">{dir === 'rtl' ? '30 يوم' : '30 Days'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5 text-amber-500" />
            {t('chatSettings.title')} - إعدادات الوسائط
          </CardTitle>
          <CardDescription>التحكم في تنزيل وتخزين الوسائط</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="autoDownload">{t('chatSettings.autoDownload')}</Label>
              <p className="text-sm text-muted-foreground">
                تنزيل الصور والفيديوهات تلقائياً
              </p>
            </div>
            <Switch
              id="autoDownload"
              checked={autoDownload}
              onCheckedChange={setAutoDownload}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="saveToGallery">{t('chatSettings.saveToGallery')}</Label>
              <p className="text-sm text-muted-foreground">
                حفظ الوسائط في معرض الجهاز
              </p>
            </div>
            <Switch
              id="saveToGallery"
              checked={saveToGallery}
              onCheckedChange={setSaveToGallery}
            />
          </div>

          <Separator />

          <div className="space-y-3">
            <Label>{t('chatSettings.title')} - استخدام التخزين</Label>
            <p className="text-sm text-muted-foreground">
              إدارة التخزين ومسح البيانات المخزنة مؤقتاً
            </p>
            <div className="flex gap-2">
              <Button type="button" variant="outline" className="flex-1">
                {dir === 'rtl' ? 'عرض التخزين' : 'View Storage'}
              </Button>
              <Button type="button" variant="outline" className="flex-1">
                {dir === 'rtl' ? 'مسح الذاكرة المؤقتة' : 'Clear Cache'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Archive className="w-5 h-5 text-amber-500" />
            {t('chatSettings.archive')} & {t('chatSettings.backup')}
          </CardTitle>
          <CardDescription>إدارة المحادثات المؤرشفة والنسخ الاحتياطي</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="archiveRead">{t('chatSettings.archive')} - أرشفة المحادثات المقروءة</Label>
              <p className="text-sm text-muted-foreground">
                أرشفة تلقائية للمحادثات المقروءة
              </p>
            </div>
            <Switch
              id="archiveRead"
              checked={archiveRead}
              onCheckedChange={setArchiveRead}
            />
          </div>

          <Separator />

          <div className="space-y-3">
            <Label>{t('chatSettings.backup')}</Label>
            <p className="text-sm text-muted-foreground">
              نسخ احتياطي لمحادثاتك إلى التخزين السحابي
            </p>
            <Button type="button" variant="outline" className="w-full">
              {dir === 'rtl' ? 'تكوين النسخ الاحتياطي' : 'Configure Backup'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="w-5 h-5" />
            {t('chatSettings.title')} - منطقة الخطر
          </CardTitle>
          <CardDescription>{t('common.delete')} - إجراءات لا يمكن التراجع عنها</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button type="button" variant="outline" className="w-full text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground">
            {dir === 'rtl' ? 'حذف جميع المحادثات' : 'Delete All Chats'}
          </Button>
          <Button type="button" variant="outline" className="w-full text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground">
            {dir === 'rtl' ? 'حذف الحساب' : 'Delete Account'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
