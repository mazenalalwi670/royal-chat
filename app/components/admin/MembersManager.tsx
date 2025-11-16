'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
import { Textarea } from '@/ui/textarea';
import { Badge } from '@/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/ui/dialog';
import { 
  Plus, 
  Edit, 
  Trash2, 
  UserPlus,
  Crown,
  Image as ImageIcon,
  X
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/ui/avatar';
import { DummyMembersGenerator } from './DummyMembersGenerator';

export interface PremiumMember {
  id: string;
  name: string;
  avatar: string;
  phoneNumber: string;
  statusMessage?: string;
  backgroundImage?: string;
  backgroundGradient?: string;
  rank: number;
  isPremiumSubscriber: boolean;
  customNameStyle?: any;
  selectedFrame?: any;
  subscriptionDate: string;
  isActive: boolean;
}

const STORAGE_KEY = 'premium_members';

export function MembersManager() {
  const { dir } = useLanguage();
  const [members, setMembers] = useState<PremiumMember[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingMember, setEditingMember] = useState<PremiumMember | null>(null);
  const [formData, setFormData] = useState<Omit<PremiumMember, 'id' | 'subscriptionDate' | 'rank'>>({
    name: '',
    avatar: '',
    phoneNumber: '',
    statusMessage: '',
    backgroundImage: '',
    isPremiumSubscriber: true,
    isActive: true
  });
  const [backgroundImagePreview, setBackgroundImagePreview] = useState<string | null>(null);
  const backgroundImageInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [redirectToChat, setRedirectToChat] = useState(false);

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          setMembers(JSON.parse(saved));
        } catch (error) {
          console.error('Error loading members:', error);
        }
      }
    }
  };

  const saveMembers = (newMembers: PremiumMember[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newMembers));
      setMembers(newMembers);
      // Notify premium chat to reload members
      window.dispatchEvent(new CustomEvent('premium-members-updated'));
    }
  };

  const handleGenerateDummy = (dummyMembers: PremiumMember[]) => {
    const updated = [...members, ...dummyMembers];
    saveMembers(updated);
  };

  const handleCreate = () => {
    const newMember: PremiumMember = {
      ...formData,
      id: `member-${Date.now()}`,
      subscriptionDate: new Date().toISOString(),
      rank: members.length + 1,
      avatar: formData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name}`,
      backgroundGradient: getRandomGradient()
    };
    const updated = [...members, newMember];
    saveMembers(updated);
    resetForm();
    setShowCreateDialog(false);
    
    // Redirect to premium chat if requested
    if (redirectToChat) {
      // Dispatch event to navigate to chat (handled by AdminDashboard)
      window.dispatchEvent(new CustomEvent('navigate-to-premium-chat'));
      setRedirectToChat(false);
    }
  };

  const getRandomGradient = () => {
    const gradients = [
      'from-gray-800 via-gray-900 to-gray-800',
      'from-orange-600 via-orange-700 to-orange-800',
      'from-purple-600 via-purple-700 to-purple-800',
      'from-green-600 via-green-700 to-green-800',
      'from-blue-600 via-blue-700 to-blue-800'
    ];
    return gradients[Math.floor(Math.random() * gradients.length)];
  };

  const handleUpdate = () => {
    if (!editingMember) return;
    const updated = members.map(m => 
      m.id === editingMember.id 
        ? { ...editingMember, ...formData }
        : m
    );
    saveMembers(updated);
    resetForm();
    setEditingMember(null);
  };

  const handleDelete = (id: string) => {
    if (confirm(dir === 'rtl' ? 'هل أنت متأكد من حذف هذا العضو؟' : 'Are you sure you want to delete this member?')) {
      const updated = members.filter(m => m.id !== id);
      saveMembers(updated);
    }
  };

  const handleBackgroundImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert(dir === 'rtl' ? 'يرجى اختيار ملف صورة' : 'Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert(dir === 'rtl' ? 'حجم الصورة كبير جداً (الحد الأقصى 5MB)' : 'Image size is too large (max 5MB)');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setBackgroundImagePreview(result);
        setFormData({ ...formData, backgroundImage: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert(dir === 'rtl' ? 'يرجى اختيار ملف صورة' : 'Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert(dir === 'rtl' ? 'حجم الصورة كبير جداً (الحد الأقصى 5MB)' : 'Image size is too large (max 5MB)');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setAvatarPreview(result);
        setFormData({ ...formData, avatar: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      avatar: '',
      phoneNumber: '',
      statusMessage: '',
      backgroundImage: '',
      backgroundGradient: '',
      isPremiumSubscriber: true,
      isActive: true
    });
    setBackgroundImagePreview(null);
    setAvatarPreview(null);
    setRedirectToChat(false);
    if (backgroundImageInputRef.current) {
      backgroundImageInputRef.current.value = '';
    }
    if (avatarInputRef.current) {
      avatarInputRef.current.value = '';
    }
  };

  const startEdit = (member: PremiumMember) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      avatar: member.avatar,
      phoneNumber: member.phoneNumber,
      statusMessage: member.statusMessage || '',
      backgroundImage: member.backgroundImage || '',
      isPremiumSubscriber: member.isPremiumSubscriber,
      isActive: member.isActive
    });
    setBackgroundImagePreview(member.backgroundImage || null);
    setAvatarPreview(member.avatar && member.avatar.startsWith('data:image') ? member.avatar : null);
    setShowCreateDialog(true);
  };

  return (
    <div className="space-y-4" dir={dir}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Crown className="w-5 h-5 text-primary" />
            {dir === 'rtl' ? 'إدارة المشتركين المميزين' : 'Premium Members Management'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {dir === 'rtl' 
              ? 'إضافة وإدارة المشتركين في الدردشة الجماعية المميزة'
              : 'Add and manage members in premium group chat'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setEditingMember(null); }}>
                <Plus className="w-4 h-4 mr-2" />
                {dir === 'rtl' ? 'إضافة عضو' : 'Add Member'}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingMember 
                  ? (dir === 'rtl' ? 'تعديل العضو' : 'Edit Member')
                  : (dir === 'rtl' ? 'عضو جديد' : 'New Member')
                }
              </DialogTitle>
              <DialogDescription>
                {dir === 'rtl' 
                  ? 'املأ بيانات العضو الذي سيظهر في قائمة المشتركين'
                  : 'Fill in member details to appear in members list'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{dir === 'rtl' ? 'الاسم' : 'Name'}</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={dir === 'rtl' ? 'اسم العضو' : 'Member Name'}
                    dir={dir}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{dir === 'rtl' ? 'رقم الهاتف' : 'Phone Number'}</Label>
                  <Input
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    placeholder="+1234567890"
                    type="tel"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{dir === 'rtl' ? 'الصورة الشخصية' : 'Avatar'}</Label>
                <div className="space-y-2">
                  {avatarPreview ? (
                    <div className="relative rounded-lg overflow-hidden border-2 border-primary/50 w-32 h-32">
                      <img 
                        src={avatarPreview} 
                        alt="Avatar preview" 
                        className="w-full h-full object-cover"
                      />
                      <Button
                        type="button"
                        size="icon"
                        onClick={() => {
                          setAvatarPreview(null);
                          setFormData({ ...formData, avatar: '' });
                          if (avatarInputRef.current) {
                            avatarInputRef.current.value = '';
                          }
                        }}
                        className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 h-6 w-6"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : (
                    <div 
                      className="relative w-32 h-32 rounded-lg border-2 border-dashed border-primary/30 flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors bg-muted/50"
                      onClick={() => avatarInputRef.current?.click()}
                    >
                      <div className="text-center">
                        <ImageIcon className="w-6 h-6 mx-auto mb-1 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">
                          {dir === 'rtl' ? 'اضغط لرفع صورة' : 'Click to upload'}
                        </p>
                      </div>
                    </div>
                  )}
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                    id="member-avatar-upload"
                  />
                  <Input
                    value={formData.avatar && !formData.avatar.startsWith('data:image') ? formData.avatar : ''}
                    onChange={(e) => {
                      setFormData({ ...formData, avatar: e.target.value });
                      if (e.target.value) {
                        setAvatarPreview(null);
                      }
                    }}
                    placeholder={dir === 'rtl' ? 'أو أدخل رابط URL' : 'Or enter URL'}
                    type="url"
                    dir={dir}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{dir === 'rtl' ? 'رسالة الحالة' : 'Status Message'}</Label>
                <Textarea
                  value={formData.statusMessage}
                  onChange={(e) => setFormData({ ...formData, statusMessage: e.target.value })}
                  placeholder={dir === 'rtl' ? 'رسالة الحالة التي تظهر تحت الاسم' : 'Status message shown under name'}
                  rows={2}
                  dir={dir}
                />
              </div>
              <div className="space-y-2">
                <Label>{dir === 'rtl' ? 'صورة الخلفية' : 'Background Image'}</Label>
                <div className="relative">
                  {backgroundImagePreview ? (
                    <div className="relative rounded-lg overflow-hidden border-2 border-primary/50">
                      <img 
                        src={backgroundImagePreview} 
                        alt="Background preview" 
                        className="w-full h-32 object-cover"
                      />
                      <Button
                        type="button"
                        size="icon"
                        onClick={() => {
                          setBackgroundImagePreview(null);
                          setFormData({ ...formData, backgroundImage: '' });
                          if (backgroundImageInputRef.current) {
                            backgroundImageInputRef.current.value = '';
                          }
                        }}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div 
                      className="relative h-32 rounded-lg border-2 border-dashed border-primary/30 flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors bg-muted/50"
                      onClick={() => backgroundImageInputRef.current?.click()}
                    >
                      <div className="text-center">
                        <ImageIcon className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          {dir === 'rtl' ? 'اضغط لاختيار صورة' : 'Click to select image'}
                        </p>
                      </div>
                    </div>
                  )}
                  <input
                    ref={backgroundImageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleBackgroundImageChange}
                    className="hidden"
                    id="member-background-upload"
                  />
                </div>
              </div>
              {!editingMember && (
                <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <input
                    type="checkbox"
                    id="redirect-to-chat"
                    checked={redirectToChat}
                    onChange={(e) => setRedirectToChat(e.target.checked)}
                    className="w-4 h-4 rounded border-primary/30"
                  />
                  <Label htmlFor="redirect-to-chat" className="text-sm cursor-pointer">
                    {dir === 'rtl' ? 'الانتقال إلى الدردشة المميزة الجماعية بعد الإضافة' : 'Go to Premium Group Chat after adding'}
                  </Label>
                </div>
              )}
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => { setShowCreateDialog(false); resetForm(); setEditingMember(null); }}>
                  {dir === 'rtl' ? 'إلغاء' : 'Cancel'}
                </Button>
                <Button onClick={editingMember ? handleUpdate : handleCreate}>
                  {editingMember ? (dir === 'rtl' ? 'حفظ' : 'Save') : (dir === 'rtl' ? 'إضافة' : 'Add')}
                </Button>
              </div>
            </div>
          </DialogContent>
          </Dialog>
          <DummyMembersGenerator onGenerate={handleGenerateDummy} />
        </div>
      </div>

      <div className="grid gap-4">
        {members.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <UserPlus className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {dir === 'rtl' ? 'لا يوجد أعضاء بعد' : 'No members yet'}
              </p>
            </CardContent>
          </Card>
        ) : (
          members.map((member) => (
            <Card key={member.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <Avatar className="w-16 h-16 border-2 border-primary/30">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-white">
                        {member.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{member.name}</h4>
                        <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-600">
                          <Crown className="w-3 h-3 mr-1" />
                          Rank {member.rank}
                        </Badge>
                        {member.isActive ? (
                          <Badge variant="default" className="bg-green-500">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{member.phoneNumber}</p>
                      {member.statusMessage && (
                        <p className="text-xs text-muted-foreground mt-1">{member.statusMessage}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => startEdit(member)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(member.id)}
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

