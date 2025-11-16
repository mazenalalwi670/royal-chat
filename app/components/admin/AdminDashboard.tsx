'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card';
import { Button } from '@/ui/button';
import { Badge } from '@/ui/badge';
import { Switch } from '@/ui/switch';
import { Label } from '@/ui/label';
import { ScrollArea } from '@/ui/scroll-area';
import { 
  Crown, 
  Settings, 
  Users, 
  MessageSquare, 
  Eye, 
  EyeOff, 
  LogOut, 
  Shield,
  BarChart3,
  Database,
  Activity,
  Zap,
  Lock,
  Globe,
  Sparkles,
  UserPlus,
  Edit,
  Trash2,
  UserCog,
  Home,
  Check,
  X
} from 'lucide-react';
import { useAuth, AdminPermissions, AdminUser } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { PremiumChatInterface } from '../premium/PremiumChatInterface';
import { Subscription } from '@/types/subscription';
import { Input } from '@/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/ui/dialog';
import { useRouter } from 'next/navigation';
import { AdvertisementManager } from './AdvertisementManager';
import { MembersManager } from './MembersManager';
import { FrameManager } from './FrameManager';

export function AdminDashboard() {
  const { user, logout, toggleInvisibility, setInvisible, updateName, isOwner, createAdmin, getAdmins, updateAdmin, deleteAdmin } = useAuth();
  const { dir } = useLanguage();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<'dashboard' | 'chat' | 'settings' | 'advertisements' | 'members' | 'frames'>('dashboard');
  const [stats, setStats] = useState({
    totalUsers: 1234,
    premiumUsers: 567,
    activeChats: 89,
    messagesToday: 12345
  });
  
  // Name editing state
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(user?.name || '');
  
  // Admin management state
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [showCreateAdminDialog, setShowCreateAdminDialog] = useState(false);
  const [newAdminData, setNewAdminData] = useState({
    username: '',
    password: '',
    name: '',
    permissions: {
      canManageUsers: false,
      canManageAdmins: false,
      canAccessPremiumChat: true,
      canViewStatistics: false,
      canManageSettings: false,
      canAccessDatabase: false
    } as AdminPermissions
  });

  useEffect(() => {
    if (user) {
      setNewName(user.name);
      if (isOwner) {
        setAdmins(getAdmins());
      }
    }
  }, [user, isOwner, getAdmins]);

  // Listen for navigation to premium chat event
  useEffect(() => {
    const handleNavigateToChat = () => {
      setActiveSection('chat');
    };
    window.addEventListener('navigate-to-premium-chat', handleNavigateToChat);
    return () => {
      window.removeEventListener('navigate-to-premium-chat', handleNavigateToChat);
    };
  }, []);

  if (!user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6" dir={dir}>
        <div className="text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-bold mb-2">
            {dir === 'rtl' ? 'يرجى تسجيل الدخول' : 'Please Login'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {dir === 'rtl' 
              ? 'يجب أن تسجل دخول كمالك أو أدمن للوصول إلى لوحة التحكم'
              : 'You must login as owner or admin to access the admin panel'}
          </p>
          <Button
            onClick={() => router.push('/admin')}
            className="bg-primary hover:bg-primary/90"
          >
            {dir === 'rtl' ? 'تسجيل الدخول' : 'Login'}
          </Button>
        </div>
      </div>
    );
  }

  const handleGoToChat = () => {
    setActiveSection('chat');
  };

  const handleGoToNormalChat = () => {
    router.push('/');
  };

  const handleSaveName = () => {
    if (newName.trim()) {
      updateName(newName.trim());
      setIsEditingName(false);
    }
  };

  const handleCreateAdmin = async () => {
    if (newAdminData.username && newAdminData.password && newAdminData.name) {
      const success = await createAdmin(newAdminData);
      if (success) {
        setAdmins(getAdmins());
        setShowCreateAdminDialog(false);
        setNewAdminData({
          username: '',
          password: '',
          name: '',
          permissions: {
            canManageUsers: false,
            canManageAdmins: false,
            canAccessPremiumChat: true,
            canViewStatistics: false,
            canManageSettings: false,
            canAccessDatabase: false
          }
        });
      }
    }
  };

  const handleDeleteAdmin = (adminId: string) => {
    if (confirm(dir === 'rtl' ? 'هل أنت متأكد من حذف هذا الأدمن؟' : 'Are you sure you want to delete this admin?')) {
      deleteAdmin(adminId);
      setAdmins(getAdmins());
    }
  };

  const mockSubscription: Subscription = {
    id: 'admin-sub',
    userId: user.id,
    status: 'active',
    plan: 'lifetime',
    amount: 0,
    currency: 'USD',
    purchaseDate: new Date(),
    paymentMethod: 'admin',
    paymentId: 'admin-access',
    transactionId: 'admin-access'
  };

  if (activeSection === 'chat') {
    return (
      <div className="flex-1 flex flex-col h-full" dir={dir}>
        <div className="border-b bg-gradient-to-r from-primary/10 via-background to-primary/10 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Crown className="w-6 h-6 text-primary animate-bounce-slow admin-crown-jewel" style={{ color: `#ffd700` }} />
                <div className="absolute -inset-1 bg-yellow-400/30 rounded-full blur-md animate-pulse" />
              </div>
              <h2 className="text-xl font-bold animate-gradient" style={{ color: `hsl(var(--primary))` }}>
                {dir === 'rtl' ? `الدردشة الجماعية المميزة - المالك ${user.isInvisible ? '(مخفي)' : ''}` : `Premium Group Chat - Admin ${user.isInvisible ? '(Invisible)' : ''}`}
              </h2>
              <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-600 border-yellow-500/30 animate-pulse admin-badge-jewel">
                <Crown className="w-3 h-3 mr-1 animate-bounce-slow" />
                {dir === 'rtl' ? 'مالك' : 'Owner'}
              </Badge>
              {user.isInvisible && (
                <Badge variant="secondary" className="bg-gray-500/20 text-gray-600 border-gray-500/30 animate-pulse">
                  <EyeOff className="w-3 h-3 mr-1" />
                  {dir === 'rtl' ? 'مخفي' : 'Invisible'}
                </Badge>
              )}
            </div>
            <Button
              variant="outline"
              onClick={() => setActiveSection('dashboard')}
              className="transition-all duration-300 hover:scale-110"
            >
              {dir === 'rtl' ? 'العودة للوحة التحكم' : 'Back to Dashboard'}
            </Button>
          </div>
        </div>
        <PremiumChatInterface 
          currentUser={{
            id: user.id,
            name: user.name,
            avatar: user.avatar,
            status: user.status as 'online' | 'offline' | 'away' | 'busy' | 'invisible'
          }}
          subscription={mockSubscription}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-gradient-to-br from-primary/5 via-background to-primary/5" dir={dir}>
      {/* Header */}
      <div className="border-b bg-gradient-to-r from-primary/10 via-background to-primary/10 p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-yellow-400/30 rounded-full blur-xl animate-pulse admin-glow-jewel" />
              <Crown className="w-10 h-10 text-primary relative z-10 animate-bounce-slow admin-crown-jewel" style={{ color: `#ffd700` }} />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-ping" />
            </div>
            <div>
              <h1 className="text-2xl font-bold animate-gradient" style={{ color: `hsl(var(--primary))` }}>
                {dir === 'rtl' ? 'لوحة تحكم المالك' : 'Admin Control Panel'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {dir === 'rtl' ? 'مرحباً، المالك' : 'Welcome, Owner'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-600 border-yellow-500/30 animate-pulse admin-badge-jewel">
              <Crown className="w-3 h-3 mr-1 animate-bounce-slow" />
              {dir === 'rtl' ? 'مالك' : 'Owner'}
            </Badge>
            <Button
              variant="outline"
              onClick={logout}
              className="transition-all duration-300 hover:scale-110 hover:bg-red-500 hover:text-white"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {dir === 'rtl' ? 'تسجيل الخروج' : 'Logout'}
            </Button>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 p-6">
        <div className="space-y-6">
          {/* Name Editing */}
          <Card className="border-2 border-primary/20 shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Edit className="w-6 h-6 text-primary" />
                  <CardTitle>{dir === 'rtl' ? 'تغيير الاسم' : 'Change Name'}</CardTitle>
                </div>
              </div>
              <CardDescription>
                {dir === 'rtl' ? 'يمكنك تغيير اسمك في أي وقت' : 'You can change your name at any time'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {isEditingName ? (
                  <>
                    <Input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="flex-1"
                      dir={dir}
                      placeholder={dir === 'rtl' ? 'أدخل الاسم الجديد' : 'Enter new name'}
                    />
                    <Button
                      size="sm"
                      onClick={handleSaveName}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setIsEditingName(false);
                        setNewName(user.name);
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="flex-1 p-2 bg-muted rounded-lg">
                      <p className="text-lg font-semibold">{user.name}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsEditingName(true)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      {dir === 'rtl' ? 'تعديل' : 'Edit'}
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Invisibility Toggle */}
          <Card className="border-2 border-primary/20 shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {user.isInvisible ? (
                    <EyeOff className="w-6 h-6 text-primary animate-pulse" />
                  ) : (
                    <Eye className="w-6 h-6 text-primary" />
                  )}
                  <CardTitle>{dir === 'rtl' ? 'وضعية الاخفاء' : 'Invisibility Mode'}</CardTitle>
                </div>
                <Switch
                  checked={user.isInvisible}
                  onCheckedChange={setInvisible}
                  className="transition-all duration-300"
                />
              </div>
              <CardDescription>
                {user.isInvisible
                  ? (dir === 'rtl' 
                      ? 'أنت مخفي حالياً - لا أحد يستطيع رؤيتك'
                      : 'You are currently invisible - no one can see you')
                  : (dir === 'rtl'
                      ? 'أنت مرئي حالياً - يمكن للآخرين رؤيتك'
                      : 'You are currently visible - others can see you')
                }
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-2 border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {dir === 'rtl' ? 'إجمالي المستخدمين' : 'Total Users'}
                </CardTitle>
                <Users className="w-4 h-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {dir === 'rtl' ? 'مستخدم نشط' : 'active users'}
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {dir === 'rtl' ? 'المستخدمون المميزون' : 'Premium Users'}
                </CardTitle>
                <Crown className="w-4 h-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.premiumUsers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {dir === 'rtl' ? 'مشترك مميز' : 'premium subscribers'}
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {dir === 'rtl' ? 'الدردشات النشطة' : 'Active Chats'}
                </CardTitle>
                <MessageSquare className="w-4 h-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeChats.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {dir === 'rtl' ? 'دردشة نشطة' : 'active chats'}
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {dir === 'rtl' ? 'الرسائل اليوم' : 'Messages Today'}
                </CardTitle>
                <Activity className="w-4 h-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.messagesToday.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {dir === 'rtl' ? 'رسالة اليوم' : 'messages today'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="border-2 border-primary/20 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                {dir === 'rtl' ? 'إجراءات سريعة' : 'Quick Actions'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button
                  onClick={handleGoToNormalChat}
                  className="h-auto py-4 flex flex-col items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-300 hover:scale-105"
                >
                  <Home className="w-6 h-6" />
                  <span>{dir === 'rtl' ? 'الدردشة العادية' : 'Normal Chat'}</span>
                  <Badge variant="secondary" className="bg-white/20 text-white">
                    {dir === 'rtl' ? 'انتقال' : 'Go'}
                  </Badge>
                </Button>

                <Button
                  onClick={handleGoToChat}
                  className="h-auto py-4 flex flex-col items-center gap-2 bg-gradient-to-r from-primary to-primary/80 text-white hover:from-primary/90 hover:to-primary transition-all duration-300 hover:scale-105"
                >
                  <MessageSquare className="w-6 h-6" />
                  <span>{dir === 'rtl' ? 'الدردشة الجماعية المميزة' : 'Premium Group Chat'}</span>
                  <Badge variant="secondary" className="bg-white/20 text-white">
                    {dir === 'rtl' ? 'دخول فوري' : 'Instant Access'}
                  </Badge>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center gap-2 border-2 border-primary/20 hover:border-primary transition-all duration-300 hover:scale-105"
                >
                  <Users className="w-6 h-6 text-primary" />
                  <span>{dir === 'rtl' ? 'إدارة المستخدمين' : 'Manage Users'}</span>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center gap-2 border-2 border-primary/20 hover:border-primary transition-all duration-300 hover:scale-105"
                >
                  <BarChart3 className="w-6 h-6 text-primary" />
                  <span>{dir === 'rtl' ? 'الإحصائيات' : 'Statistics'}</span>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center gap-2 border-2 border-primary/20 hover:border-primary transition-all duration-300 hover:scale-105"
                >
                  <Database className="w-6 h-6 text-primary" />
                  <span>{dir === 'rtl' ? 'قاعدة البيانات' : 'Database'}</span>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center gap-2 border-2 border-primary/20 hover:border-primary transition-all duration-300 hover:scale-105"
                >
                  <Settings className="w-6 h-6 text-primary" />
                  <span>{dir === 'rtl' ? 'الإعدادات' : 'Settings'}</span>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center gap-2 border-2 border-primary/20 hover:border-primary transition-all duration-300 hover:scale-105"
                >
                  <Shield className="w-6 h-6 text-primary" />
                  <span>{dir === 'rtl' ? 'الأمان' : 'Security'}</span>
                </Button>

                <Button
                  onClick={() => setActiveSection('advertisements')}
                  className="h-auto py-4 flex flex-col items-center gap-2 bg-gradient-to-r from-yellow-500 to-amber-500 text-white hover:from-yellow-600 hover:to-amber-600 transition-all duration-300 hover:scale-105"
                >
                  <Sparkles className="w-6 h-6" />
                  <span>{dir === 'rtl' ? 'إدارة الإعلانات' : 'Advertisements'}</span>
                  <Badge variant="secondary" className="bg-white/20 text-white">
                    {dir === 'rtl' ? 'إدارة' : 'Manage'}
                  </Badge>
                </Button>

                <Button
                  onClick={() => setActiveSection('members')}
                  className="h-auto py-4 flex flex-col items-center gap-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 transition-all duration-300 hover:scale-105"
                >
                  <Users className="w-6 h-6" />
                  <span>{dir === 'rtl' ? 'إدارة المشتركين' : 'Members'}</span>
                  <Badge variant="secondary" className="bg-white/20 text-white">
                    {dir === 'rtl' ? 'إدارة' : 'Manage'}
                  </Badge>
                </Button>

                <Button
                  onClick={() => setActiveSection('frames')}
                  className="h-auto py-4 flex flex-col items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 transition-all duration-300 hover:scale-105"
                >
                  <Crown className="w-6 h-6" />
                  <span>{dir === 'rtl' ? 'الإطارات والأسماء' : 'Frames & Names'}</span>
                  <Badge variant="secondary" className="bg-white/20 text-white">
                    {dir === 'rtl' ? 'إدارة' : 'Manage'}
                  </Badge>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Admin Management - Only for Owner */}
          {isOwner && (
            <Card className="border-2 border-purple-500/30 bg-gradient-to-r from-purple-500/10 via-background to-purple-500/10 shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <UserCog className="w-5 h-5 text-purple-600" />
                    {dir === 'rtl' ? 'إدارة الأدمن' : 'Admin Management'}
                  </CardTitle>
                  <Dialog open={showCreateAdminDialog} onOpenChange={setShowCreateAdminDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                        <UserPlus className="w-4 h-4 mr-2" />
                        {dir === 'rtl' ? 'إضافة أدمن جديد' : 'Add New Admin'}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md" dir={dir}>
                      <DialogHeader>
                        <DialogTitle>{dir === 'rtl' ? 'إضافة أدمن جديد' : 'Add New Admin'}</DialogTitle>
                        <DialogDescription>
                          {dir === 'rtl' ? 'قم بإنشاء حساب أدمن جديد وتحديد صلاحياته' : 'Create a new admin account and set their permissions'}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>{dir === 'rtl' ? 'اسم المستخدم' : 'Username'}</Label>
                          <Input
                            value={newAdminData.username}
                            onChange={(e) => setNewAdminData({ ...newAdminData, username: e.target.value })}
                            placeholder={dir === 'rtl' ? 'أدخل اسم المستخدم' : 'Enter username'}
                            dir={dir}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{dir === 'rtl' ? 'كلمة المرور' : 'Password'}</Label>
                          <Input
                            type="password"
                            value={newAdminData.password}
                            onChange={(e) => setNewAdminData({ ...newAdminData, password: e.target.value })}
                            placeholder={dir === 'rtl' ? 'أدخل كلمة المرور' : 'Enter password'}
                            dir={dir}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{dir === 'rtl' ? 'الاسم' : 'Name'}</Label>
                          <Input
                            value={newAdminData.name}
                            onChange={(e) => setNewAdminData({ ...newAdminData, name: e.target.value })}
                            placeholder={dir === 'rtl' ? 'أدخل الاسم' : 'Enter name'}
                            dir={dir}
                          />
                        </div>
                        <div className="space-y-3">
                          <Label>{dir === 'rtl' ? 'الصلاحيات' : 'Permissions'}</Label>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={newAdminData.permissions.canManageUsers}
                                onCheckedChange={(checked) =>
                                  setNewAdminData({
                                    ...newAdminData,
                                    permissions: { ...newAdminData.permissions, canManageUsers: checked }
                                  })
                                }
                              />
                              <Label className="text-sm">{dir === 'rtl' ? 'إدارة المستخدمين' : 'Manage Users'}</Label>
                            </div>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={newAdminData.permissions.canManageAdmins}
                                onCheckedChange={(checked) =>
                                  setNewAdminData({
                                    ...newAdminData,
                                    permissions: { ...newAdminData.permissions, canManageAdmins: checked }
                                  })
                                }
                              />
                              <Label className="text-sm">{dir === 'rtl' ? 'إدارة الأدمن' : 'Manage Admins'}</Label>
                            </div>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={newAdminData.permissions.canAccessPremiumChat}
                                onCheckedChange={(checked) =>
                                  setNewAdminData({
                                    ...newAdminData,
                                    permissions: { ...newAdminData.permissions, canAccessPremiumChat: checked }
                                  })
                                }
                              />
                              <Label className="text-sm">{dir === 'rtl' ? 'الدردشة المميزة' : 'Premium Chat'}</Label>
                            </div>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={newAdminData.permissions.canViewStatistics}
                                onCheckedChange={(checked) =>
                                  setNewAdminData({
                                    ...newAdminData,
                                    permissions: { ...newAdminData.permissions, canViewStatistics: checked }
                                  })
                                }
                              />
                              <Label className="text-sm">{dir === 'rtl' ? 'عرض الإحصائيات' : 'View Statistics'}</Label>
                            </div>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={newAdminData.permissions.canManageSettings}
                                onCheckedChange={(checked) =>
                                  setNewAdminData({
                                    ...newAdminData,
                                    permissions: { ...newAdminData.permissions, canManageSettings: checked }
                                  })
                                }
                              />
                              <Label className="text-sm">{dir === 'rtl' ? 'إدارة الإعدادات' : 'Manage Settings'}</Label>
                            </div>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={newAdminData.permissions.canAccessDatabase}
                                onCheckedChange={(checked) =>
                                  setNewAdminData({
                                    ...newAdminData,
                                    permissions: { ...newAdminData.permissions, canAccessDatabase: checked }
                                  })
                                }
                              />
                              <Label className="text-sm">{dir === 'rtl' ? 'الوصول لقاعدة البيانات' : 'Access Database'}</Label>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 justify-end pt-4">
                          <Button variant="outline" onClick={() => setShowCreateAdminDialog(false)}>
                            {dir === 'rtl' ? 'إلغاء' : 'Cancel'}
                          </Button>
                          <Button onClick={handleCreateAdmin} className="bg-purple-600 hover:bg-purple-700">
                            {dir === 'rtl' ? 'إنشاء' : 'Create'}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {admins.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    {dir === 'rtl' ? 'لا يوجد أدمن آخر' : 'No other admins'}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {admins.map((admin) => (
                      <div
                        key={admin.id}
                        className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-purple-500/20"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                            <UserCog className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-semibold">{admin.name}</p>
                            <p className="text-sm text-muted-foreground">@{admin.username}</p>
                            <div className="flex gap-2 mt-1">
                              {admin.permissions?.canManageUsers && (
                                <Badge variant="secondary" className="text-xs">
                                  {dir === 'rtl' ? 'مستخدمين' : 'Users'}
                                </Badge>
                              )}
                              {admin.permissions?.canAccessPremiumChat && (
                                <Badge variant="secondary" className="text-xs">
                                  {dir === 'rtl' ? 'مميز' : 'Premium'}
                                </Badge>
                              )}
                              {admin.permissions?.canViewStatistics && (
                                <Badge variant="secondary" className="text-xs">
                                  {dir === 'rtl' ? 'إحصائيات' : 'Stats'}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteAdmin(admin.id)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Admin Privileges */}
          <Card className="border-2 border-yellow-500/30 bg-gradient-to-r from-yellow-500/10 via-background to-yellow-500/10 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-600 animate-bounce-slow" />
                {dir === 'rtl' ? 'صلاحيات المالك' : 'Owner Privileges'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
                  <Lock className="w-5 h-5 text-primary" />
                  <div className="flex-1">
                    <p className="font-semibold">{dir === 'rtl' ? 'وصول كامل' : 'Full Access'}</p>
                    <p className="text-sm text-muted-foreground">
                      {dir === 'rtl' ? 'يمكنك الوصول إلى جميع الميزات دون قيود' : 'You have access to all features without restrictions'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  <div className="flex-1">
                    <p className="font-semibold">{dir === 'rtl' ? 'الدردشة الجماعية المميزة' : 'Premium Group Chat'}</p>
                    <p className="text-sm text-muted-foreground">
                      {dir === 'rtl' ? 'يمكنك الدخول بدون اشتراك' : 'You can access without subscription'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
                  <EyeOff className="w-5 h-5 text-primary" />
                  <div className="flex-1">
                    <p className="font-semibold">{dir === 'rtl' ? 'وضعية الاخفاء' : 'Invisibility Mode'}</p>
                    <p className="text-sm text-muted-foreground">
                      {dir === 'rtl' ? 'يمكنك الاختفاء والظهور حسب رغبتك' : 'You can hide and appear as you wish'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>

      {activeSection === 'advertisements' && (
        <div className="flex-1 flex flex-col h-full" dir={dir}>
          <div className="border-b bg-gradient-to-r from-primary/10 via-background to-primary/10 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-bold">
                  {dir === 'rtl' ? 'إدارة الإعلانات' : 'Advertisement Management'}
                </h2>
              </div>
              <Button
                variant="outline"
                onClick={() => setActiveSection('dashboard')}
                className="transition-all duration-300 hover:scale-110"
              >
                {dir === 'rtl' ? 'العودة للوحة التحكم' : 'Back to Dashboard'}
              </Button>
            </div>
          </div>
          <ScrollArea className="flex-1 p-6">
            <AdvertisementManager />
          </ScrollArea>
        </div>
      )}

      {activeSection === 'members' && (
        <div className="flex-1 flex flex-col h-full" dir={dir}>
          <div className="border-b bg-gradient-to-r from-primary/10 via-background to-primary/10 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-bold">
                  {dir === 'rtl' ? 'إدارة المشتركين' : 'Members Management'}
                </h2>
              </div>
              <Button
                variant="outline"
                onClick={() => setActiveSection('dashboard')}
                className="transition-all duration-300 hover:scale-110"
              >
                {dir === 'rtl' ? 'العودة للوحة التحكم' : 'Back to Dashboard'}
              </Button>
            </div>
          </div>
          <ScrollArea className="flex-1 p-6">
            <MembersManager />
          </ScrollArea>
        </div>
      )}

      {activeSection === 'frames' && (
        <div className="flex-1 flex flex-col h-full" dir={dir}>
          <div className="border-b bg-gradient-to-r from-primary/10 via-background to-primary/10 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Crown className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-bold">
                  {dir === 'rtl' ? 'إدارة الإطارات والأسماء' : 'Frames & Names Manager'}
                </h2>
              </div>
              <Button
                variant="outline"
                onClick={() => setActiveSection('dashboard')}
                className="transition-all duration-300 hover:scale-110"
              >
                {dir === 'rtl' ? 'العودة للوحة التحكم' : 'Back to Dashboard'}
              </Button>
            </div>
          </div>
          <ScrollArea className="flex-1">
            <FrameManager />
          </ScrollArea>
        </div>
      )}
    </div>
  );
}

