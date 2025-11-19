'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/ui/button';
import { Play, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface VoiceMessagePlayerProps {
  attachment: {
    id: string;
    url: string;
    name?: string;
    size?: number;
    data?: {
      duration?: number;
    };
  };
  dir?: 'rtl' | 'ltr';
}

export function VoiceMessagePlayer({ attachment, dir }: VoiceMessagePlayerProps) {
  const { dir: contextDir } = useLanguage();
  const finalDir = dir || contextDir;
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(attachment.data?.duration || 0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio element
    if (!audioRef.current) {
      audioRef.current = new Audio(attachment.url);
      
      audioRef.current.addEventListener('loadedmetadata', () => {
        setDuration(audioRef.current?.duration || 0);
      });
      
      audioRef.current.addEventListener('timeupdate', () => {
        setCurrentTime(audioRef.current?.currentTime || 0);
      });
      
      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false);
        setCurrentTime(0);
      });
      
      audioRef.current.addEventListener('error', (e) => {
        console.error('Audio playback error:', e);
        setIsPlaying(false);
      });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [attachment.url]);

  const togglePlay = async () => {
    if (!audioRef.current) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsPlaying(false);
    }
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={cn(
      "flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-muted/50 rounded-lg w-full min-w-0",
      finalDir === 'rtl' && 'flex-row-reverse'
    )} dir={finalDir}>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className={cn(
          "rounded-full h-12 w-12 sm:h-10 sm:w-10 touch-manipulation min-h-[44px] min-w-[44px] flex-shrink-0",
          isPlaying && "bg-primary/20"
        )}
        onClick={togglePlay}
        style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
        title={isPlaying ? (finalDir === 'rtl' ? 'إيقاف' : 'Pause') : (finalDir === 'rtl' ? 'تشغيل' : 'Play')}
      >
        {isPlaying ? (
          <Pause className="w-6 h-6 sm:w-5 sm:h-5" />
        ) : (
          <Play className={cn("w-6 h-6 sm:w-5 sm:h-5", finalDir === 'rtl' && 'scale-x-[-1]')} />
        )}
      </Button>
      
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        {/* Progress Bar */}
        <div className="relative h-1.5 sm:h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-100 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {/* Time and Name */}
        <div className="flex items-center justify-between gap-2 min-w-0">
          <p className="text-xs sm:text-sm font-medium truncate min-w-0">
            {attachment.name || (finalDir === 'rtl' ? 'رسالة صوتية' : 'Voice Message')}
          </p>
          <div className="flex items-center gap-1 flex-shrink-0">
            <span className="text-[10px] sm:text-xs text-muted-foreground font-mono">
              {formatTime(currentTime)}
            </span>
            <span className="text-[10px] sm:text-xs text-muted-foreground">
              / {formatTime(duration)}
            </span>
          </div>
        </div>
        
        {attachment.size && (
          <p className="text-[10px] text-muted-foreground">
            {(attachment.size / 1024).toFixed(1)} KB
          </p>
        )}
      </div>
    </div>
  );
}

