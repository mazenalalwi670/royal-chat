'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/ui/popover';
import { Send, Smile, Paperclip, X, Sticker } from 'lucide-react';
import { Message } from '@/types/chat';
import { useLanguage } from '@/contexts/LanguageContext';
import { StickerPicker } from '@/components/stickers/StickerPicker';
import { AttachmentMenu } from './components/chat/AttachmentMenu';
import { VoiceRecorder } from './components/chat/VoiceRecorder';

export interface AttachmentData {
  type: 'image' | 'file' | 'voice' | 'location';
  url: string;
  name: string;
  size?: number;
  data?: {
    latitude?: number;
    longitude?: number;
    duration?: number;
    [key: string]: unknown;
  };
}

interface MessageInputProps {
  onSend: (content: string, attachments?: AttachmentData[]) => void;
  replyingTo?: Message;
  onCancelReply: () => void;
  editingMessage?: Message;
  onCancelEdit: () => void;
}

const EMOJI_LIST = ['😀', '😂', '😍', '🥳', '😎', '🤔', '👍', '❤️', '🔥', '✨', '🎉', '💯'];

export function MessageInput({
  onSend,
  replyingTo,
  onCancelReply,
  editingMessage,
  onCancelEdit
}: MessageInputProps) {
  const { t, dir } = useLanguage();
  const [message, setMessage] = useState(editingMessage?.content || '');
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const attachmentMenuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  const handleSend = useCallback((attachments?: AttachmentData[]) => {
    if (message.trim() || attachments?.length) {
      onSend(message, attachments);
      setMessage('');
      inputRef.current?.focus();
    }
  }, [message, onSend]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleStickerSelect = (sticker: string) => {
    setMessage(prev => prev + sticker);
    setShowStickerPicker(false);
    inputRef.current?.focus();
  };

  const handleAttachmentSelect = async (type: 'image' | 'document' | 'location' | 'camera' | 'video' | 'audio') => {
    setShowAttachmentMenu(false);

    switch (type) {
      case 'image':
        fileInputRef.current?.click();
        break;
      case 'camera':
        cameraInputRef.current?.click();
        break;
      case 'document':
        documentInputRef.current?.click();
        break;
      case 'location':
        handleLocationSelect();
        break;
      case 'video':
        // Handle video similar to image
        fileInputRef.current?.setAttribute('accept', 'video/*');
        fileInputRef.current?.click();
        fileInputRef.current?.setAttribute('accept', 'image/*');
        break;
      case 'audio':
        // Voice recording is handled by VoiceRecorder component directly
        break;
    }
  };

  const handleLocationSelect = () => {
    if (!navigator.geolocation) {
      alert(dir === 'rtl' ? 'الموقع الجغرافي غير مدعوم في متصفحك' : 'Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const locationUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
        const locationName = dir === 'rtl' ? 'موقعي' : 'My Location';
        
        handleSend([{
          type: 'location',
          url: locationUrl,
          name: locationName,
          data: { latitude, longitude }
        }]);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert(dir === 'rtl' ? 'خطأ في الحصول على الموقع' : 'Error getting location');
      }
    );
  };

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'file' = 'image') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const url = reader.result as string;
        handleSend([{
          type: type === 'image' ? 'image' : 'file',
          url,
          name: file.name,
          size: file.size
        }]);
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    e.target.value = '';
  }, [handleSend]);

  const handleVoiceRecordingComplete = useCallback((audioBlob: Blob, duration: number) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const url = reader.result as string;
      handleSend([{
        type: 'voice',
        url,
        name: dir === 'rtl' ? `رسالة صوتية ${duration}s` : `Voice message ${duration}s`,
        size: audioBlob.size,
        data: { duration }
      }]);
    };
    reader.readAsDataURL(audioBlob);
  }, [dir, handleSend]);

  const handleVoiceRecordingCancel = useCallback(() => {
    // Just cancel, no action needed
  }, []);

  // Close attachment menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (attachmentMenuRef.current && !attachmentMenuRef.current.contains(e.target as Node)) {
        setShowAttachmentMenu(false);
      }
    };

    if (showAttachmentMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showAttachmentMenu]);

  return (
    <div className="border-t bg-background p-2 sm:p-4 w-full min-w-0 overflow-hidden" dir={dir} style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}>
      {(replyingTo || editingMessage) && (
        <div className={`mb-2 sm:mb-3 p-2 sm:p-3 bg-muted rounded-lg flex items-start ${dir === 'rtl' ? 'flex-row-reverse' : ''} justify-between gap-2`}>
          <div className="flex-1">
            <p className="text-xs font-medium" style={{ color: `hsl(var(--chat-reply-border))` }}>
              {editingMessage ? t('chat.editMessage') : `${t('chat.replyTo')} ${replyingTo?.senderId === 'user-1' ? (dir === 'rtl' ? 'نفسك' : 'yourself') : (dir === 'rtl' ? 'الرسالة' : 'message')}`}
            </p>
            <p className="text-sm text-muted-foreground truncate">
              {(editingMessage || replyingTo)?.content}
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            onClick={editingMessage ? onCancelEdit : onCancelReply}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      <div className={`flex items-end gap-1 sm:gap-2 ${dir === 'rtl' ? 'flex-row-reverse' : ''} w-full min-w-0`}>
        <div className="flex-1 flex items-center gap-1 sm:gap-2 bg-muted rounded-full px-2 sm:px-4 py-1.5 sm:py-2 min-w-0 overflow-hidden">
          <Popover>
            <PopoverTrigger asChild>
              <Button type="button" size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full hover:bg-accent">
                <Smile className="w-5 h-5 text-muted-foreground" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-3">
              <div className="grid grid-cols-6 gap-2">
                {EMOJI_LIST.map((emoji) => (
                  <button
                    type="button"
                    key={emoji}
                    onClick={() => setMessage(prev => prev + emoji)}
                    className="text-2xl hover:scale-125 transition-transform"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <Input
            ref={inputRef}
            placeholder={t('chat.sendMessage')}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0 text-sm sm:text-base min-w-0 flex-1"
            dir={dir}
          />

          <Button 
            type="button" 
            size="sm" 
            variant="ghost" 
            className="h-8 w-8 p-0 rounded-full hover:bg-accent transition-all duration-200 hover:scale-110"
            onClick={() => setShowStickerPicker(true)}
            title={dir === 'rtl' ? 'الملصقات' : 'Stickers'}
          >
            <Sticker className="w-5 h-5 text-muted-foreground" />
          </Button>

          <div className="relative" ref={attachmentMenuRef}>
            <Button 
              type="button" 
              size="sm" 
              variant="ghost" 
              className="h-8 w-8 p-0 rounded-full hover:bg-accent"
              onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
              title={dir === 'rtl' ? 'المرفقات' : 'Attachments'}
            >
              <Paperclip className="w-5 h-5 text-muted-foreground" />
            </Button>
            {showAttachmentMenu && (
              <AttachmentMenu 
                onSelect={handleAttachmentSelect}
                onClose={() => setShowAttachmentMenu(false)}
              />
            )}
          </div>

          <VoiceRecorder
            onRecordingComplete={handleVoiceRecordingComplete}
            onCancel={handleVoiceRecordingCancel}
          />

          {/* Hidden file inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFileSelect(e, 'image')}
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => handleFileSelect(e, 'image')}
          />
          <input
            ref={documentInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt,.xls,.xlsx"
            className="hidden"
            onChange={(e) => handleFileSelect(e, 'file')}
          />
        </div>

        <Button
          type="button"
          onClick={() => handleSend()}
          size="icon"
          className="rounded-full h-9 w-9 sm:h-10 sm:w-10 shadow-lg button-transition hover:scale-110 active:scale-95 flex-shrink-0"
          style={{
            background: `linear-gradient(to right, hsl(var(--chat-from)), hsl(var(--chat-to)))`
          }}
          disabled={!message.trim()}
        >
          <Send className="w-4 h-4 sm:w-5 sm:h-5" />
        </Button>
      </div>

      {/* Sticker Picker */}
      {showStickerPicker && (
        <StickerPicker
          onSelect={handleStickerSelect}
          onClose={() => setShowStickerPicker(false)}
        />
      )}
    </div>
  );
}
