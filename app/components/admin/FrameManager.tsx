'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card';
import { Button } from '@/ui/button';
import { Badge } from '@/ui/badge';
import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
import { Switch } from '@/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/tabs';
import { 
  Crown, 
  Flame, 
  Sparkles, 
  Star, 
  Zap, 
  Gem, 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  Users,
  Settings
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { AnimatedFrame, FrameConfig, FrameType } from '../frames/AnimatedFrames';
import { AnimatedName, NameEffectConfig, NameEffectType } from '../names/AnimatedName';
import { Avatar, AvatarFallback, AvatarImage } from '@/ui/avatar';

// Default frame configurations
const defaultFrames: FrameConfig[] = [
  {
    id: 'tiktok-gold',
    name: 'TikTok Gold',
    nameAr: 'ذهبي تيك توك',
    type: 'royal-gold',
    gradient: ['#FFD700', '#FFA500', '#FFD700'],
    glowColor: 'rgba(255, 215, 0, 0.9)',
    borderStyle: 'animated',
    animationSpeed: 'medium',
    particles: true,
    sparkles: true,
    glow: true,
    premium: true,
    price: 99
  },
  {
    id: 'tiktok-fire',
    name: 'TikTok Fire',
    nameAr: 'لهب تيك توك',
    type: 'royal-fire',
    gradient: ['#FF4500', '#FF6347', '#FFD700'],
    glowColor: 'rgba(255, 69, 0, 0.9)',
    borderStyle: 'animated',
    animationSpeed: 'fast',
    flames: true,
    particles: true,
    glow: true,
    premium: true,
    price: 149
  },
  {
    id: 'tiktok-rainbow',
    name: 'TikTok Rainbow',
    nameAr: 'قوس قزح تيك توك',
    type: 'royal-rainbow',
    gradient: ['#FF006E', '#8338EC', '#3A86FF', '#06FFA5', '#FFBE0B'],
    glowColor: 'rgba(168, 85, 247, 0.9)',
    borderStyle: 'animated',
    animationSpeed: 'medium',
    particles: true,
    sparkles: true,
    glow: true,
    premium: true,
    price: 129
  },
  {
    id: 'tiktok-diamond',
    name: 'TikTok Diamond',
    nameAr: 'ألماس تيك توك',
    type: 'royal-diamond',
    gradient: ['#00FFFF', '#0080FF', '#FFFFFF'],
    glowColor: 'rgba(0, 255, 255, 0.9)',
    borderStyle: 'animated',
    animationSpeed: 'slow',
    particles: true,
    sparkles: true,
    glow: true,
    premium: true,
    price: 179
  }
];

// Default name effect configurations
const defaultNameEffects: NameEffectConfig[] = [
  {
    type: 'flame',
    colors: ['#FF4500', '#FF6347', '#FFD700'],
    speed: 'fast',
    glow: true,
    flames: true,
    sparkles: false
  },
  {
    type: 'gradient-flow',
    colors: ['#FF006E', '#8338EC', '#3A86FF'],
    speed: 'medium',
    glow: true,
    sparkles: true,
    flames: false
  },
  {
    type: 'rainbow',
    colors: ['#FF006E', '#8338EC', '#3A86FF', '#06FFA5', '#FFBE0B'],
    speed: 'medium',
    glow: true,
    sparkles: true,
    flames: false
  },
  {
    type: 'gold-shine',
    colors: ['#FFD700', '#FFA500', '#FFD700'],
    speed: 'slow',
    glow: true,
    sparkles: true,
    flames: false
  }
];

export function FrameManager() {
  const { dir } = useLanguage();
  const [frames, setFrames] = useState<FrameConfig[]>(defaultFrames);
  const [nameEffects, setNameEffects] = useState<NameEffectConfig[]>(defaultNameEffects);
  const [editingFrame, setEditingFrame] = useState<FrameConfig | null>(null);
  const [editingEffect, setEditingEffect] = useState<NameEffectConfig | null>(null);
  const [showFrameForm, setShowFrameForm] = useState(false);
  const [showEffectForm, setShowEffectForm] = useState(false);

  const handleSaveFrame = (frame: FrameConfig) => {
    if (editingFrame) {
      setFrames(frames.map(f => f.id === frame.id ? frame : f));
      setEditingFrame(null);
    } else {
      setFrames([...frames, { ...frame, id: `frame-${Date.now()}` }]);
    }
    setShowFrameForm(false);
  };

  const handleDeleteFrame = (id: string) => {
    setFrames(frames.filter(f => f.id !== id));
  };

  const handleSaveEffect = (effect: NameEffectConfig) => {
    if (editingEffect) {
      setNameEffects(nameEffects.map(e => e.type === effect.type ? effect : e));
      setEditingEffect(null);
    } else {
      setNameEffects([...nameEffects, effect]);
    }
    setShowEffectForm(false);
  };

  return (
    <div className="p-6 space-y-6" dir={dir}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <Crown className="w-8 h-8 text-yellow-500" />
            {dir === 'rtl' ? 'إدارة الإطارات والأسماء المتحركة' : 'Frame & Name Effects Manager'}
          </h2>
          <p className="text-muted-foreground mt-1">
            {dir === 'rtl' 
              ? 'قم بإدارة إطارات المستخدمين والأسماء المتحركة'
              : 'Manage user frames and animated names'}
          </p>
        </div>
      </div>

      <Tabs defaultValue="frames" className="space-y-4">
        <TabsList>
          <TabsTrigger value="frames">
            <Crown className="w-4 h-4 mr-2" />
            {dir === 'rtl' ? 'الإطارات' : 'Frames'}
          </TabsTrigger>
          <TabsTrigger value="effects">
            <Flame className="w-4 h-4 mr-2" />
            {dir === 'rtl' ? 'تأثيرات الأسماء' : 'Name Effects'}
          </TabsTrigger>
          <TabsTrigger value="preview">
            <Sparkles className="w-4 h-4 mr-2" />
            {dir === 'rtl' ? 'معاينة' : 'Preview'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="frames" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowFrameForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              {dir === 'rtl' ? 'إضافة إطار جديد' : 'Add New Frame'}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {frames.map((frame) => (
              <Card key={frame.id} className="relative overflow-hidden">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {dir === 'rtl' ? frame.nameAr : frame.name}
                    </CardTitle>
                    {frame.premium && (
                      <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-600">
                        <Crown className="w-3 h-3 mr-1" />
                        {dir === 'rtl' ? 'مميز' : 'Premium'}
                      </Badge>
                    )}
                  </div>
                  <CardDescription>
                    {dir === 'rtl' 
                      ? `السعر: $${frame.price}` 
                      : `Price: $${frame.price}`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center mb-4">
                    <AnimatedFrame frameConfig={frame} size="medium">
                      <Avatar className="w-full h-full">
                        <AvatarFallback className="bg-gradient-to-br from-yellow-500/20 to-amber-500/20">
                          <Crown className="w-8 h-8 text-yellow-600" />
                        </AvatarFallback>
                      </Avatar>
                    </AnimatedFrame>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setEditingFrame(frame);
                        setShowFrameForm(true);
                      }}
                      className="flex-1"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      {dir === 'rtl' ? 'تعديل' : 'Edit'}
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDeleteFrame(frame.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="effects" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowEffectForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              {dir === 'rtl' ? 'إضافة تأثير جديد' : 'Add New Effect'}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {nameEffects.map((effect, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg capitalize">
                    {effect.type}
                  </CardTitle>
                  <CardDescription>
                    {dir === 'rtl' 
                      ? `السرعة: ${effect.speed}` 
                      : `Speed: ${effect.speed}`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center mb-4">
                    <AnimatedName 
                      name={dir === 'rtl' ? 'اسم المستخدم' : 'User Name'}
                      effect={effect}
                      size="md"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setEditingEffect(effect);
                        setShowEffectForm(true);
                      }}
                      className="flex-1"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      {dir === 'rtl' ? 'تعديل' : 'Edit'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{dir === 'rtl' ? 'معاينة الإطارات' : 'Frame Preview'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-6 justify-center">
                {frames.map((frame) => (
                  <div key={frame.id} className="text-center">
                    <AnimatedFrame frameConfig={frame} size="large">
                      <Avatar className="w-full h-full">
                        <AvatarFallback className="bg-gradient-to-br from-yellow-500/20 to-amber-500/20">
                          <Crown className="w-12 h-12 text-yellow-600" />
                        </AvatarFallback>
                      </Avatar>
                    </AnimatedFrame>
                    <p className="mt-2 text-sm font-medium">
                      {dir === 'rtl' ? frame.nameAr : frame.name}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{dir === 'rtl' ? 'معاينة تأثيرات الأسماء' : 'Name Effects Preview'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {nameEffects.map((effect, index) => (
                  <div key={index} className="flex items-center justify-center py-4 border rounded-lg">
                    <AnimatedName 
                      name={dir === 'rtl' ? 'اسم المستخدم المميز' : 'Premium User Name'}
                      effect={effect}
                      size="lg"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Frame Form Dialog */}
      {(showFrameForm || editingFrame) && (
        <FrameFormDialog
          open={showFrameForm || !!editingFrame}
          onOpenChange={(open) => {
            setShowFrameForm(open);
            if (!open) setEditingFrame(null);
          }}
          frame={editingFrame}
          onSave={handleSaveFrame}
        />
      )}

      {/* Effect Form Dialog */}
      {(showEffectForm || editingEffect) && (
        <EffectFormDialog
          open={showEffectForm || !!editingEffect}
          onOpenChange={(open) => {
            setShowEffectForm(open);
            if (!open) setEditingEffect(null);
          }}
          effect={editingEffect}
          onSave={handleSaveEffect}
        />
      )}
    </div>
  );
}

// Frame Form Dialog Component
function FrameFormDialog({
  open,
  onOpenChange,
  frame,
  onSave
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  frame?: FrameConfig | null;
  onSave: (frame: FrameConfig) => void;
}) {
  const { dir } = useLanguage();
  const [formData, setFormData] = useState<Partial<FrameConfig>>(frame ? {
    ...frame,
    type: frame.type as any // Allow any type for editing
  } : {
    name: '',
    nameAr: '',
    type: 'royal-gold',
    gradient: ['#FFD700', '#FFA500'],
    glowColor: 'rgba(255, 215, 0, 0.9)',
    borderStyle: 'animated',
    animationSpeed: 'medium',
    particles: true,
    sparkles: false,
    flames: false,
    glow: true,
    premium: true,
    price: 99
  });

  return (
    <div className={cn('fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4', !open && 'hidden')}>
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>
            {frame ? (dir === 'rtl' ? 'تعديل الإطار' : 'Edit Frame') : (dir === 'rtl' ? 'إضافة إطار جديد' : 'Add New Frame')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{dir === 'rtl' ? 'الاسم (إنجليزي)' : 'Name (English)'}</Label>
              <Input 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label>{dir === 'rtl' ? 'الاسم (عربي)' : 'Name (Arabic)'}</Label>
              <Input 
                value={formData.nameAr}
                onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label>{dir === 'rtl' ? 'السعر' : 'Price'}</Label>
            <Input 
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
            />
          </div>

          <div className="space-y-2">
            <Label>{dir === 'rtl' ? 'الألوان (مفصولة بفواصل)' : 'Colors (comma separated)'}</Label>
            <Input 
              value={formData.gradient?.join(', ')}
              onChange={(e) => setFormData({ 
                ...formData, 
                gradient: e.target.value.split(',').map(c => c.trim()) 
              })}
              placeholder="#FFD700, #FFA500, #FFD700"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.particles}
                onCheckedChange={(checked) => setFormData({ ...formData, particles: checked })}
              />
              <Label>{dir === 'rtl' ? 'جزيئات' : 'Particles'}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.sparkles}
                onCheckedChange={(checked) => setFormData({ ...formData, sparkles: checked })}
              />
              <Label>{dir === 'rtl' ? 'بريق' : 'Sparkles'}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.flames}
                onCheckedChange={(checked) => setFormData({ ...formData, flames: checked })}
              />
              <Label>{dir === 'rtl' ? 'لهب' : 'Flames'}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.glow}
                onCheckedChange={(checked) => setFormData({ ...formData, glow: checked })}
              />
              <Label>{dir === 'rtl' ? 'توهج' : 'Glow'}</Label>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {dir === 'rtl' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button onClick={() => onSave(formData as FrameConfig)}>
              <Save className="w-4 h-4 mr-2" />
              {dir === 'rtl' ? 'حفظ' : 'Save'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Effect Form Dialog Component
function EffectFormDialog({
  open,
  onOpenChange,
  effect,
  onSave
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  effect?: NameEffectConfig | null;
  onSave: (effect: NameEffectConfig) => void;
}) {
  const { dir } = useLanguage();
  const [formData, setFormData] = useState<NameEffectConfig>(effect || {
    type: 'flame',
    colors: ['#FF4500', '#FF6347'],
    speed: 'medium',
    glow: true,
    sparkles: false,
    flames: false
  });

  return (
    <div className={cn('fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4', !open && 'hidden')}>
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>
            {effect ? (dir === 'rtl' ? 'تعديل التأثير' : 'Edit Effect') : (dir === 'rtl' ? 'إضافة تأثير جديد' : 'Add New Effect')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>{dir === 'rtl' ? 'نوع التأثير' : 'Effect Type'}</Label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as NameEffectType })}
              className="w-full p-2 border rounded"
            >
              <option value="flame">Flame</option>
              <option value="gradient-flow">Gradient Flow</option>
              <option value="sparkle">Sparkle</option>
              <option value="rainbow">Rainbow</option>
              <option value="gold-shine">Gold Shine</option>
              <option value="glow-pulse">Glow Pulse</option>
            </select>
          </div>

          <div>
            <Label>{dir === 'rtl' ? 'الألوان' : 'Colors'}</Label>
            <Input 
              value={formData.colors.join(', ')}
              onChange={(e) => setFormData({ 
                ...formData, 
                colors: e.target.value.split(',').map(c => c.trim()) 
              })}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.flames}
              onCheckedChange={(checked) => setFormData({ ...formData, flames: checked })}
            />
            <Label>{dir === 'rtl' ? 'لهب' : 'Flames'}</Label>
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {dir === 'rtl' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button onClick={() => onSave(formData)}>
              <Save className="w-4 h-4 mr-2" />
              {dir === 'rtl' ? 'حفظ' : 'Save'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

