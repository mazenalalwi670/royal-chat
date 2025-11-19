'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
import { Textarea } from '@/ui/textarea';
import { Badge } from '@/ui/badge';
import { Switch } from '@/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/ui/dialog';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Crown, 
  Sparkles,
  Calendar,
  X
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

export interface Advertisement {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  buttonText: string;
  buttonTextAr: string;
  link?: string;
  type: 'subscription' | 'premium' | 'feature';
  isActive: boolean;
  createdAt: string;
  expiresAt?: string;
}

const STORAGE_KEY = 'premium_advertisements';

export function AdvertisementManager() {
  const { dir } = useLanguage();
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
  const [formData, setFormData] = useState<Omit<Advertisement, 'id' | 'createdAt'>>({
    title: '',
    titleAr: '',
    description: '',
    descriptionAr: '',
    buttonText: 'Subscribe Now',
    buttonTextAr: 'اشترك الآن',
    link: '',
    type: 'subscription',
    isActive: true,
    expiresAt: undefined
  });

  useEffect(() => {
    loadAdvertisements();
  }, []);

  const loadAdvertisements = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          setAdvertisements(JSON.parse(saved));
        } catch (error) {
          console.error('Error loading advertisements:', error);
        }
      }
    }
  };

  const saveAdvertisements = (ads: Advertisement[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ads));
      setAdvertisements(ads);
      // Notify premium chat to reload ads
      window.dispatchEvent(new CustomEvent('advertisements-updated'));
    }
  };

  const handleCreate = () => {
    const newAd: Advertisement = {
      ...formData,
      id: `ad-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    const updated = [...advertisements, newAd];
    saveAdvertisements(updated);
    resetForm();
    setShowCreateDialog(false);
  };

  const handleUpdate = () => {
    if (!editingAd) return;
    const updated = advertisements.map(ad => 
      ad.id === editingAd.id 
        ? { ...editingAd, ...formData }
        : ad
    );
    saveAdvertisements(updated);
    resetForm();
    setEditingAd(null);
  };

  const handleDelete = (id: string) => {
    if (confirm(dir === 'rtl' ? 'هل أنت متأكد من حذف هذا الإعلان؟' : 'Are you sure you want to delete this advertisement?')) {
      const updated = advertisements.filter(ad => ad.id !== id);
      saveAdvertisements(updated);
    }
  };

  const handleToggleActive = (id: string) => {
    const updated = advertisements.map(ad => 
      ad.id === id ? { ...ad, isActive: !ad.isActive } : ad
    );
    saveAdvertisements(updated);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      titleAr: '',
      description: '',
      descriptionAr: '',
      buttonText: 'Subscribe Now',
      buttonTextAr: 'اشترك الآن',
      link: '',
      type: 'subscription',
      isActive: true,
      expiresAt: undefined
    });
  };

  const startEdit = (ad: Advertisement) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title,
      titleAr: ad.titleAr,
      description: ad.description,
      descriptionAr: ad.descriptionAr,
      buttonText: ad.buttonText,
      buttonTextAr: ad.buttonTextAr,
      link: ad.link || '',
      type: ad.type,
      isActive: ad.isActive,
      expiresAt: ad.expiresAt
    });
    setShowCreateDialog(true);
  };

  return (
    <div className="space-y-4" dir={dir}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            {dir === 'rtl' ? 'إدارة الإعلانات' : 'Advertisement Management'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {dir === 'rtl' 
              ? 'إنشاء وإدارة الإعلانات التي تظهر في الدردشة الجماعية المميزة'
              : 'Create and manage advertisements shown in premium group chat'}
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setEditingAd(null); }}>
              <Plus className="w-4 h-4 mr-2" />
              {dir === 'rtl' ? 'إعلان جديد' : 'New Advertisement'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingAd 
                  ? (dir === 'rtl' ? 'تعديل الإعلان' : 'Edit Advertisement')
                  : (dir === 'rtl' ? 'إعلان جديد' : 'New Advertisement')
                }
              </DialogTitle>
              <DialogDescription>
                {dir === 'rtl' 
                  ? 'املأ التفاصيل للإعلان الذي سيظهر في الدردشة الجماعية المميزة'
                  : 'Fill in the details for the advertisement to show in premium group chat'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{dir === 'rtl' ? 'العنوان (إنجليزي)' : 'Title (English)'}</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder={dir === 'rtl' ? 'عنوان الإعلان' : 'Advertisement Title'}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{dir === 'rtl' ? 'العنوان (عربي)' : 'Title (Arabic)'}</Label>
                  <Input
                    value={formData.titleAr}
                    onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
                    placeholder={dir === 'rtl' ? 'عنوان الإعلان' : 'عنوان الإعلان'}
                    dir="rtl"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{dir === 'rtl' ? 'الوصف (إنجليزي)' : 'Description (English)'}</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder={dir === 'rtl' ? 'وصف الإعلان' : 'Advertisement Description'}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{dir === 'rtl' ? 'الوصف (عربي)' : 'Description (Arabic)'}</Label>
                  <Textarea
                    value={formData.descriptionAr}
                    onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                    placeholder={dir === 'rtl' ? 'وصف الإعلان' : 'وصف الإعلان'}
                    rows={3}
                    dir="rtl"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{dir === 'rtl' ? 'نص الزر (إنجليزي)' : 'Button Text (English)'}</Label>
                  <Input
                    value={formData.buttonText}
                    onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                    placeholder="Subscribe Now"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{dir === 'rtl' ? 'نص الزر (عربي)' : 'Button Text (Arabic)'}</Label>
                  <Input
                    value={formData.buttonTextAr}
                    onChange={(e) => setFormData({ ...formData, buttonTextAr: e.target.value })}
                    placeholder="اشترك الآن"
                    dir="rtl"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{dir === 'rtl' ? 'الرابط (اختياري)' : 'Link (Optional)'}</Label>
                <Input
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  placeholder="https://..."
                  type="url"
                />
              </div>
              <div className="space-y-2">
                <Label>{dir === 'rtl' ? 'النوع' : 'Type'}</Label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="subscription">{dir === 'rtl' ? 'اشتراك' : 'Subscription'}</option>
                  <option value="premium">{dir === 'rtl' ? 'مميز' : 'Premium'}</option>
                  <option value="feature">{dir === 'rtl' ? 'ميزة' : 'Feature'}</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label>{dir === 'rtl' ? 'نشط' : 'Active'}</Label>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => { setShowCreateDialog(false); resetForm(); setEditingAd(null); }}>
                  {dir === 'rtl' ? 'إلغاء' : 'Cancel'}
                </Button>
                <Button onClick={editingAd ? handleUpdate : handleCreate}>
                  {editingAd ? (dir === 'rtl' ? 'حفظ' : 'Save') : (dir === 'rtl' ? 'إنشاء' : 'Create')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {advertisements.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Sparkles className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {dir === 'rtl' ? 'لا توجد إعلانات بعد' : 'No advertisements yet'}
              </p>
            </CardContent>
          </Card>
        ) : (
          advertisements.map((ad) => (
            <Card key={ad.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">{dir === 'rtl' ? ad.titleAr : ad.title}</h4>
                      <Badge variant={ad.isActive ? 'default' : 'secondary'}>
                        {ad.isActive ? (dir === 'rtl' ? 'نشط' : 'Active') : (dir === 'rtl' ? 'غير نشط' : 'Inactive')}
                      </Badge>
                      <Badge variant="outline">{ad.type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {dir === 'rtl' ? ad.descriptionAr : ad.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(ad.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggleActive(ad.id)}
                      title={ad.isActive ? (dir === 'rtl' ? 'إخفاء' : 'Hide') : (dir === 'rtl' ? 'إظهار' : 'Show')}
                    >
                      {ad.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => startEdit(ad)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(ad.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}





