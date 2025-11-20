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
import { useWebSocket } from '@/contexts/WebSocketContext';
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
  conversationId?: string;
  currentUserId?: string;
}

const EMOJI_LIST = ['😀', '😂', '😍', '🥳', '😎', '🤔', '👍', '❤️', '🔥', '✨', '🎉', '💯'];

export function MessageInput({
  onSend,
  replyingTo,
  onCancelReply,
  editingMessage,
  onCancelEdit,
  conversationId,
  currentUserId
}: MessageInputProps) {
  const { t, dir } = useLanguage();
  const { socket } = useWebSocket();
  const [message, setMessage] = useState(editingMessage?.content || '');
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const attachmentMenuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  // Send typing indicator
  const sendTypingIndicator = useCallback((isTyping: boolean) => {
    if (!socket || !conversationId || !currentUserId || isTypingRef.current === isTyping) return;
    
    isTypingRef.current = isTyping;
    socket.emit('typing', {
      conversationId,
      userId: currentUserId,
      isTyping
    });
  }, [socket, conversationId, currentUserId]);

  // Handle typing with debounce
  const handleTyping = useCallback(() => {
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Send typing indicator
    sendTypingIndicator(true);

    // Set timeout to stop typing after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      sendTypingIndicator(false);
    }, 3000);
  }, [sendTypingIndicator]);

  const handleSend = useCallback((attachments?: AttachmentData[]) => {
    if (message.trim() || attachments?.length) {
      // Stop typing indicator
      sendTypingIndicator(false);
      
      onSend(message, attachments);
      setMessage('');
      inputRef.current?.focus();
    }
  }, [message, onSend, sendTypingIndicator]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    } else {
      handleTyping();
    }
  };

  // Cleanup typing indicator on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      sendTypingIndicator(false);
    };
  }, [sendTypingIndicator]);

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
      // Check file size (Android may have issues with large files)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        alert(dir === 'rtl' ? 'الملف كبير جداً. الحد الأقصى 10 ميجابايت' : 'File too large. Maximum 10MB');
        return;
      }

      const reader = new FileReader();
      
      // Error handling for Android
      reader.onerror = (error) => {
        console.error('FileReader error:', error);
        alert(dir === 'rtl' ? 'خطأ في قراءة الملف' : 'Error reading file');
      };
      
      reader.onloadend = () => {
        try {
          const url = reader.result as string;
          if (!url) {
            throw new Error('Failed to read file');
          }
          handleSend([{
            type: type === 'image' ? 'image' : 'file',
            url,
            name: file.name,
            size: file.size
          }]);
        } catch (error) {
          console.error('Error processing file:', error);
          alert(dir === 'rtl' ? 'خطأ في معالجة الملف' : 'Error processing file');
        }
      };
      
      // Use readAsDataURL with error handling for Android
      try {
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Error reading file:', error);
        alert(dir === 'rtl' ? 'خطأ في قراءة الملف' : 'Error reading file');
      }
    });

    // Reset input (important for Android)
    setTimeout(() => {
      if (e.target) {
        e.target.value = '';
      }
    }, 100);
  }, [handleSend, dir]);

  const handleVoiceRecordingComplete = useCallback((audioBlob: Blob, duration: number) => {
    const reader = new FileReader();
    
    // Error handling for Android
    reader.onerror = (error) => {
      console.error('FileReader error:', error);
      alert(dir === 'rtl' ? 'خطأ في قراءة التسجيل الصوتي' : 'Error reading audio recording');
    };
    
    reader.onloadend = () => {
      try {
        const url = reader.result as string;
        if (!url) {
          throw new Error('Failed to read audio');
        }
        handleSend([{
          type: 'voice',
          url,
          name: dir === 'rtl' ? `رسالة صوتية ${duration}s` : `Voice message ${duration}s`,
          size: audioBlob.size,
          data: { duration }
        }]);
      } catch (error) {
        console.error('Error processing audio:', error);
        alert(dir === 'rtl' ? 'خطأ في معالجة التسجيل الصوتي' : 'Error processing audio');
      }
    };
    
    // Use readAsDataURL with error handling for Android
    try {
      reader.readAsDataURL(audioBlob);
    } catch (error) {
      console.error('Error reading audio:', error);
      alert(dir === 'rtl' ? 'خطأ في قراءة التسجيل الصوتي' : 'Error reading audio');
    }
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
    <div className="border-t bg-background p-1.5 sm:p-2 md:p-3 w-full min-w-0 overflow-hidden" dir={dir} style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}>
      {(replyingTo || editingMessage) && (
        <div className={`mb-1.5 sm:mb-2 md:mb-3 p-1.5 sm:p-2 md:p-3 bg-muted rounded-lg flex items-start ${dir === 'rtl' ? 'flex-row-reverse' : ''} justify-between gap-1.5 sm:gap-2`}>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] sm:text-xs font-medium truncate" style={{ color: `hsl(var(--chat-reply-border))` }}>
              {editingMessage ? t('chat.editMessage') : `${t('chat.replyTo')} ${replyingTo?.senderId === 'user-1' ? (dir === 'rtl' ? 'نفسك' : 'yourself') : (dir === 'rtl' ? 'الرسالة' : 'message')}`}
            </p>
            <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground truncate">
              {(editingMessage || replyingTo)?.content}
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 w-7 sm:h-6 sm:w-6 p-0 flex-shrink-0 touch-manipulation min-h-[28px] min-w-[28px]"
            onClick={editingMessage ? onCancelEdit : onCancelReply}
            style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
          >
            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </Button>
        </div>
      )}

      <div className={`flex items-end gap-1 sm:gap-1.5 md:gap-2 ${dir === 'rtl' ? 'flex-row-reverse' : ''} w-full min-w-0`}>
        <div className="flex-1 flex items-center gap-1 sm:gap-1.5 md:gap-2 bg-muted rounded-full px-1.5 sm:px-2 md:px-4 py-1 sm:py-1.5 md:py-2 min-w-0 overflow-hidden">
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                type="button" 
                size="sm" 
                variant="ghost" 
                className="h-9 w-9 sm:h-8 sm:w-8 md:h-9 md:w-9 p-0 rounded-full hover:bg-accent touch-manipulation flex-shrink-0 min-h-[36px] min-w-[36px] sm:min-h-[32px] sm:min-w-[32px]"
                style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
              >
                <Smile className="w-4 h-4 sm:w-4 sm:h-4 md:w-5 md:h-5 text-muted-foreground" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2 sm:p-3">
              <div className="grid grid-cols-6 gap-1.5 sm:gap-2">
                {EMOJI_LIST.map((emoji) => (
                  <button
                    type="button"
                    key={emoji}
                    onClick={() => setMessage(prev => prev + emoji)}
                    className="text-xl sm:text-2xl hover:scale-125 transition-transform touch-manipulation min-h-[36px] min-w-[36px]"
                    style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
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
            onChange={(e) => {
              setMessage(e.target.value);
              handleTyping();
            }}
            onKeyDown={handleKeyPress}
            className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0 text-xs sm:text-sm md:text-base min-w-0 flex-1 min-h-[36px] sm:min-h-[32px] md:min-h-[36px] touch-manipulation"
            dir={dir}
            style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
          />

          <Button 
            type="button" 
            size="sm" 
            variant="ghost" 
            className="h-9 w-9 sm:h-8 sm:w-8 md:h-9 md:w-9 p-0 rounded-full hover:bg-accent transition-all duration-200 hover:scale-110 touch-manipulation flex-shrink-0 min-h-[36px] min-w-[36px] sm:min-h-[32px] sm:min-w-[32px]"
            onClick={() => setShowStickerPicker(true)}
            title={dir === 'rtl' ? 'الملصقات' : 'Stickers'}
            style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
          >
            <Sticker className="w-4 h-4 sm:w-4 sm:h-4 md:w-5 md:h-5 text-muted-foreground" />
          </Button>

          <div className="relative" ref={attachmentMenuRef}>
            <Button 
              type="button" 
              size="sm" 
              variant="ghost" 
              className="h-9 w-9 sm:h-8 sm:w-8 md:h-9 md:w-9 p-0 rounded-full hover:bg-accent touch-manipulation flex-shrink-0 min-h-[36px] min-w-[36px] sm:min-h-[32px] sm:min-w-[32px]"
              onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
              title={dir === 'rtl' ? 'المرفقات' : 'Attachments'}
              style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
            >
              <Paperclip className="w-4 h-4 sm:w-4 sm:h-4 md:w-5 md:h-5 text-muted-foreground" />
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
            // Android specific attributes
            webkitdirectory="false"
            directory="false"
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
          className="rounded-full h-9 w-9 sm:h-8 sm:w-8 md:h-10 md:w-10 shadow-lg button-transition hover:scale-110 active:scale-95 flex-shrink-0 touch-manipulation min-h-[36px] min-w-[36px] sm:min-h-[32px] sm:min-w-[32px] md:min-h-[40px] md:min-w-[40px]"
          style={{
            background: `linear-gradient(to right, hsl(var(--chat-from)), hsl(var(--chat-to)))`,
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation'
          }}
          disabled={!message.trim()}
        >
          <Send className="w-4 h-4 sm:w-4 sm:h-4 md:w-5 md:h-5" />
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

