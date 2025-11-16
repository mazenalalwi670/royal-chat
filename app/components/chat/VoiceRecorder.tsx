'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, X, Send, Trash2 } from 'lucide-react';
import { Button } from '@/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob, duration: number) => void;
  onCancel?: () => void;
}

export function VoiceRecorder({ onRecordingComplete, onCancel }: VoiceRecorderProps) {
  const { dir } = useLanguage();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [hasRecorded, setHasRecorded] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      streamRef.current = stream;
      
      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/ogg'
      });
      
      const chunks: Blob[] = [];
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      recorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: recorder.mimeType });
        const duration = recordingTime;
        
        // Create audio URL for preview
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        setAudioChunks(chunks);
        setHasRecorded(true);
        
        // Create audio element for preview
        if (audioRef.current) {
          audioRef.current.pause();
        }
        const audio = new Audio(url);
        audioRef.current = audio;
        
        // Stop stream
        stream.getTracks().forEach(track => track.stop());
      };
      
      recorder.start();
      setMediaRecorder(recorder);
      setAudioChunks(chunks);
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert(dir === 'rtl' ? 'خطأ في الوصول إلى الميكروفون' : 'Error accessing microphone');
      onCancel?.();
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  };

  const sendRecording = () => {
    if (audioChunks.length > 0 && mediaRecorder) {
      const audioBlob = new Blob(audioChunks, { type: mediaRecorder.mimeType });
      const duration = recordingTime;
      onRecordingComplete(audioBlob, duration);
      
      // Cleanup
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      setAudioChunks([]);
      setRecordingTime(0);
      setHasRecorded(false);
      setAudioUrl(null);
      setMediaRecorder(null);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioChunks([]);
    setRecordingTime(0);
    setHasRecorded(false);
    setAudioUrl(null);
    setMediaRecorder(null);
    onCancel?.();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle mouse/touch events for WhatsApp-like recording
  const handleMouseDown = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isRecording && !hasRecorded) {
      await startRecording();
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isRecording) {
      stopRecording();
    }
  };

  const handleTouchStart = async (e: React.TouchEvent) => {
    e.preventDefault();
    if (!isRecording && !hasRecorded) {
      await startRecording();
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    if (isRecording) {
      stopRecording();
    }
  };

  // Show preview and send/delete buttons after recording
  if (hasRecorded && audioUrl) {
    return (
      <div className={cn(
        "flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-full",
        dir === 'rtl' ? 'flex-row-reverse' : ''
      )} dir={dir}>
        {/* Audio Preview */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="rounded-full h-8 w-8 flex-shrink-0"
            onClick={() => {
              if (audioRef.current) {
                if (audioRef.current.paused) {
                  audioRef.current.play();
                } else {
                  audioRef.current.pause();
                }
              }
            }}
          >
            <Mic className="w-4 h-4 text-red-600" />
          </Button>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-red-600 truncate">
              {formatTime(recordingTime)}
            </p>
            <audio ref={audioRef} src={audioUrl} className="hidden" />
          </div>
        </div>
        
        {/* Delete Button */}
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="h-8 w-8 rounded-full hover:bg-red-500/20"
          onClick={cancelRecording}
          title={dir === 'rtl' ? 'حذف' : 'Delete'}
        >
          <Trash2 className="w-4 h-4 text-red-600" />
        </Button>
        
        {/* Send Button */}
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="h-8 w-8 rounded-full bg-primary hover:bg-primary/90 text-white"
          onClick={sendRecording}
          title={dir === 'rtl' ? 'إرسال' : 'Send'}
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  // Show recording button (WhatsApp style - press and hold)
  return (
    <Button
      ref={buttonRef}
      type="button"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      size="icon"
      className={cn(
        "rounded-full h-9 w-9 sm:h-10 sm:w-10 transition-all duration-200",
        isRecording 
          ? "bg-red-500 hover:bg-red-600 text-white animate-pulse scale-110" 
          : "bg-red-500 hover:bg-red-600 text-white",
        dir === 'rtl' && 'mr-2'
      )}
      title={isRecording ? (dir === 'rtl' ? 'ارفع لإرسال' : 'Release to send') : (dir === 'rtl' ? 'اضغط للتسجيل' : 'Press to record')}
      style={{
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation',
        userSelect: 'none'
      }}
    >
      {isRecording ? (
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          <span className="text-xs font-mono">{formatTime(recordingTime)}</span>
        </div>
      ) : (
        <Mic className="w-5 h-5" />
      )}
    </Button>
  );
}
