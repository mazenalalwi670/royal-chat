'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/ui/dialog';
import { Button } from '@/ui/button';
import { Label } from '@/ui/label';
import { Input } from '@/ui/input';
import { Crown, Sparkles, Star, Palette, Wand2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { CustomNameStyle } from './PremiumUserFrame';

interface NameCustomizationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentName: string;
  onSave: (name: string, style: CustomNameStyle) => void;
}

export function NameCustomizationDialog({
  open,
  onOpenChange,
  currentName,
  onSave
}: NameCustomizationDialogProps) {
  const { dir } = useLanguage();
  const [name, setName] = useState(currentName);
  const [style, setStyle] = useState<CustomNameStyle>({
    fontFamily: 'royal',
    color: 'gold',
    decoration: 'crown',
    glow: true,
    animated: true
  });

  const fontOptions = [
    { value: 'royal', label: dir === 'rtl' ? 'ملكي' : 'Royal', icon: Crown },
    { value: 'elegant', label: dir === 'rtl' ? 'أنيق' : 'Elegant', icon: Sparkles },
    { value: 'bold', label: dir === 'rtl' ? 'جريء' : 'Bold', icon: Wand2 },
    { value: 'cursive', label: dir === 'rtl' ? 'مائل' : 'Cursive', icon: Star }
  ];

  const colorOptions = [
    { value: 'gold', label: dir === 'rtl' ? 'ذهبي' : 'Gold', color: 'text-yellow-400' },
    { value: 'silver', label: dir === 'rtl' ? 'فضي' : 'Silver', color: 'text-gray-300' },
    { value: 'bronze', label: dir === 'rtl' ? 'برونزي' : 'Bronze', color: 'text-amber-600' },
    { value: 'platinum', label: dir === 'rtl' ? 'بلاتيني' : 'Platinum', color: 'text-white' },
    { value: 'rainbow', label: dir === 'rtl' ? 'قوس قزح' : 'Rainbow', color: 'bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500' }
  ];

  const decorationOptions = [
    { value: 'crown', label: dir === 'rtl' ? 'تاج' : 'Crown', icon: '👑' },
    { value: 'star', label: dir === 'rtl' ? 'نجمة' : 'Star', icon: '⭐' },
    { value: 'sparkles', label: dir === 'rtl' ? 'شرارات' : 'Sparkles', icon: '✨' },
    { value: 'none', label: dir === 'rtl' ? 'بدون' : 'None', icon: '' }
  ];

  const getPreviewName = () => {
    let preview = name || currentName;
    if (style.decoration === 'crown') {
      preview = `👑 ${preview} 👑`;
    } else if (style.decoration === 'star') {
      preview = `⭐ ${preview} ⭐`;
    } else if (style.decoration === 'sparkles') {
      preview = `✨ ${preview} ✨`;
    }
    return preview;
  };

  const fontStyles = {
    royal: 'font-serif font-bold tracking-wider',
    elegant: 'font-sans font-light tracking-wide italic',
    bold: 'font-bold tracking-tight',
    cursive: 'font-serif italic'
  };

  const colorStyles = {
    gold: 'text-yellow-400',
    silver: 'text-gray-300',
    bronze: 'text-amber-600',
    platinum: 'text-white',
    rainbow: 'bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 bg-clip-text text-transparent animate-gradient'
  };

  const handleSave = () => {
    onSave(name, style);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir={dir}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-primary" />
            {dir === 'rtl' ? 'تخصيص الاسم الملكي' : 'Customize Royal Name'}
          </DialogTitle>
          <DialogDescription>
            {dir === 'rtl' 
              ? 'اختر الشكل الفاخر لاسمك في الدردشة الملكية'
              : 'Choose the luxurious style for your name in royal chat'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Name Input */}
          <div className="space-y-2">
            <Label>{dir === 'rtl' ? 'الاسم' : 'Name'}</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={dir === 'rtl' ? 'أدخل اسمك' : 'Enter your name'}
              dir={dir}
            />
          </div>

          {/* Preview */}
          <div className="p-6 bg-gradient-to-br from-yellow-500/10 via-amber-500/10 to-yellow-500/10 rounded-lg border-2 border-yellow-500/30 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shine" />
            <Label className="mb-3 block font-semibold">{dir === 'rtl' ? 'معاينة الاسم الذهبي المرصع' : 'Preview Golden Embellished Name'}</Label>
            <div className="relative">
              <div className={cn(
                "text-3xl font-bold text-center relative z-10",
                fontStyles[style.fontFamily],
                colorStyles[style.color],
                style.glow && 'drop-shadow-[0_0_15px_currentColor,0_0_30px_currentColor,0_0_45px_currentColor]',
                style.animated && 'animate-pulse',
                "premium-embellished-name"
              )}>
                {getPreviewName()}
              </div>
              {/* Golden Embossed Effect */}
              <div className={cn(
                "absolute inset-0 text-3xl font-bold text-center opacity-30 blur-sm",
                fontStyles[style.fontFamily],
                "text-yellow-600",
                "premium-embossed-shadow"
              )}>
                {getPreviewName()}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3 text-center">
              {dir === 'rtl' ? '✨ اسم ذهبي مرصع بتأثيرات فاخرة ✨' : '✨ Golden embellished name with luxurious effects ✨'}
            </p>
          </div>

          {/* Font Family */}
          <div className="space-y-2">
            <Label>{dir === 'rtl' ? 'نوع الخط' : 'Font Style'}</Label>
            <div className="grid grid-cols-4 gap-2">
              {fontOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setStyle({ ...style, fontFamily: option.value as any })}
                    className={cn(
                      "p-3 rounded-lg border-2 transition-all",
                      "hover:scale-105 active:scale-95",
                      style.fontFamily === option.value
                        ? "border-primary bg-primary/10 shadow-lg"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <Icon className="w-5 h-5 mx-auto mb-1 text-primary" />
                    <div className="text-xs">{option.label}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label>{dir === 'rtl' ? 'اللون' : 'Color'}</Label>
            <div className="grid grid-cols-5 gap-2">
              {colorOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setStyle({ ...style, color: option.value as any })}
                  className={cn(
                    "p-3 rounded-lg border-2 transition-all",
                    "hover:scale-105 active:scale-95",
                    style.color === option.value
                      ? "border-primary bg-primary/10 shadow-lg"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full mx-auto mb-1",
                    option.color,
                    option.value === 'rainbow' && 'bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500'
                  )} />
                  <div className="text-xs">{option.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Decoration */}
          <div className="space-y-2">
            <Label>{dir === 'rtl' ? 'الزخرفة' : 'Decoration'}</Label>
            <div className="grid grid-cols-4 gap-2">
              {decorationOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setStyle({ ...style, decoration: option.value as any })}
                  className={cn(
                    "p-3 rounded-lg border-2 transition-all",
                    "hover:scale-105 active:scale-95",
                    style.decoration === option.value
                      ? "border-primary bg-primary/10 shadow-lg"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <div className="text-2xl mb-1">{option.icon}</div>
                  <div className="text-xs">{option.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Effects */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>{dir === 'rtl' ? 'تأثير التوهج' : 'Glow Effect'}</Label>
              <button
                type="button"
                onClick={() => setStyle({ ...style, glow: !style.glow })}
                className={cn(
                  "w-12 h-6 rounded-full transition-all",
                  style.glow ? "bg-primary" : "bg-muted"
                )}
              >
                <div className={cn(
                  "w-5 h-5 rounded-full bg-white transition-transform",
                  style.glow ? "translate-x-6" : "translate-x-0.5"
                )} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <Label>{dir === 'rtl' ? 'حركة متحركة' : 'Animation'}</Label>
              <button
                type="button"
                onClick={() => setStyle({ ...style, animated: !style.animated })}
                className={cn(
                  "w-12 h-6 rounded-full transition-all",
                  style.animated ? "bg-primary" : "bg-muted"
                )}
              >
                <div className={cn(
                  "w-5 h-5 rounded-full bg-white transition-transform",
                  style.animated ? "translate-x-6" : "translate-x-0.5"
                )} />
              </button>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {dir === 'rtl' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button 
              onClick={handleSave}
              className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600"
            >
              {dir === 'rtl' ? 'حفظ مدى الحياة' : 'Save Lifetime'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

