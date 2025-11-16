'use client';

import { Image, MapPin, FileText, Camera, Video, Music, File } from 'lucide-react';
import { Button } from '@/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface AttachmentMenuProps {
  onSelect: (type: 'image' | 'document' | 'location' | 'camera' | 'video' | 'audio') => void;
  onClose?: () => void;
}

export function AttachmentMenu({ onSelect, onClose }: AttachmentMenuProps) {
  const { dir } = useLanguage();

  const attachments = [
    {
      type: 'image' as const,
      icon: Image,
      label: dir === 'rtl' ? 'صورة' : 'Photo',
      color: 'text-blue-500'
    },
    {
      type: 'document' as const,
      icon: FileText,
      label: dir === 'rtl' ? 'مستند' : 'Document',
      color: 'text-purple-500'
    },
    {
      type: 'location' as const,
      icon: MapPin,
      label: dir === 'rtl' ? 'موقع' : 'Location',
      color: 'text-red-500'
    },
    {
      type: 'camera' as const,
      icon: Camera,
      label: dir === 'rtl' ? 'كاميرا' : 'Camera',
      color: 'text-green-500'
    },
    {
      type: 'video' as const,
      icon: Video,
      label: dir === 'rtl' ? 'فيديو' : 'Video',
      color: 'text-orange-500'
    },
    {
      type: 'audio' as const,
      icon: Music,
      label: dir === 'rtl' ? 'صوت' : 'Audio',
      color: 'text-pink-500'
    }
  ];

  const handleSelect = (type: typeof attachments[number]['type']) => {
    onSelect(type);
    onClose?.();
  };

  return (
    <div 
      className={cn(
        "absolute bottom-full right-0 mb-2 bg-background border rounded-lg shadow-xl p-2 z-50 min-w-[200px]",
        dir === 'rtl' && 'left-0 right-auto'
      )}
      dir={dir}
    >
      <div className="grid grid-cols-3 gap-2">
        {attachments.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.type}
              type="button"
              variant="ghost"
              className={cn(
                "flex flex-col items-center gap-2 p-3 h-auto hover:bg-accent transition-colors",
                dir === 'rtl' && 'flex-col-reverse'
              )}
              onClick={() => handleSelect(item.type)}
            >
              <Icon className={cn("w-6 h-6", item.color)} />
              <span className="text-xs">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}

