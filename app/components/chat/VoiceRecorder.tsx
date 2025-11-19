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
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        const errorMsg = dir === 'rtl' 
          ? 'الميكروفون غير مدعوم في متصفحك. يرجى استخدام متصفح حديث مثل Chrome أو Firefox.'
          : 'Microphone is not supported in your browser. Please use a modern browser like Chrome or Firefox.';
        alert(errorMsg);
        throw new Error('getUserMedia is not supported');
      }

      // Request microphone permission with better Android support
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
          channelCount: 1,
          // Android specific constraints (may not be supported in all browsers)
          ...(navigator.userAgent.includes('Android') && {
            latency: 0.01,
            googEchoCancellation: true,
            googNoiseSuppression: true,
            googAutoGainControl: true
          })
        } 
      }).catch((error) => {
        console.error('Error accessing microphone:', error);
        let errorMsg = dir === 'rtl' 
          ? 'خطأ في الوصول إلى الميكروفون. يرجى التحقق من أذونات الميكروفون في إعدادات المتصفح.'
          : 'Error accessing microphone. Please check microphone permissions in browser settings.';
        
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          errorMsg = dir === 'rtl'
            ? 'تم رفض الوصول إلى الميكروفون. يرجى السماح بالوصول في إعدادات المتصفح.'
            : 'Microphone access denied. Please allow microphone access in browser settings.';
        } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
          errorMsg = dir === 'rtl'
            ? 'لم يتم العثور على ميكروفون. يرجى التأكد من وجود ميكروفون متصل.'
            : 'No microphone found. Please ensure a microphone is connected.';
        }
        
        alert(errorMsg);
        throw error;
      });
      
      streamRef.current = stream;
      
      // Detect best mime type for Android and other mobile devices
      let mimeType = 'audio/webm';
      const supportedTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/ogg',
        'audio/mp4',
        'audio/aac',
        'audio/mpeg',
        'audio/wav'
      ];
      
      for (const type of supportedTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          mimeType = type;
          break;
        }
      }
      
      // Fallback for Android devices that don't support MediaRecorder properly
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        // Try default MediaRecorder without mimeType (Android fallback)
        try {
          const recorder = new MediaRecorder(stream);
          recorder.start();
          setMediaRecorder(recorder);
          setAudioChunks([]);
          setIsRecording(true);
          setRecordingTime(0);
          
          const chunks: Blob[] = [];
          recorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              chunks.push(event.data);
            }
          };
          
          recorder.onstop = () => {
            const audioBlob = new Blob(chunks, { type: 'audio/webm' });
            const duration = recordingTime;
            
            const url = URL.createObjectURL(audioBlob);
            setAudioUrl(url);
            setAudioChunks(chunks);
            setHasRecorded(true);
            
            if (audioRef.current) {
              audioRef.current.pause();
            }
            const audio = new Audio(url);
            audioRef.current = audio;
            
            stream.getTracks().forEach(track => track.stop());
          };
          
          intervalRef.current = setInterval(() => {
            setRecordingTime(prev => prev + 1);
          }, 1000);
          
          return;
        } catch (fallbackError) {
          console.error('Fallback MediaRecorder failed:', fallbackError);
          throw new Error('MediaRecorder not supported on this device');
        }
      }
      
      const recorder = new MediaRecorder(stream, {
        mimeType: mimeType,
        audioBitsPerSecond: 128000 // Good quality for Android
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
      // Error message already shown in getUserMedia catch block
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
        "flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-full touch-manipulation",
        dir === 'rtl' ? 'flex-row-reverse' : ''
      )} dir={dir} style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}>
        {/* Audio Preview */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="rounded-full h-10 w-10 sm:h-8 sm:w-8 flex-shrink-0 touch-manipulation min-h-[44px] min-w-[44px]"
            onClick={() => {
              if (audioRef.current) {
                if (audioRef.current.paused) {
                  audioRef.current.play().catch(err => console.error('Error playing audio:', err));
                } else {
                  audioRef.current.pause();
                }
              }
            }}
            style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
          >
            <Mic className="w-5 h-5 sm:w-4 sm:h-4 text-red-600" />
          </Button>
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-[10px] font-medium text-red-600 truncate">
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
          className="h-10 w-10 sm:h-8 sm:w-8 rounded-full hover:bg-red-500/20 touch-manipulation min-h-[44px] min-w-[44px]"
          onClick={cancelRecording}
          title={dir === 'rtl' ? 'حذف' : 'Delete'}
          style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
        >
          <Trash2 className="w-5 h-5 sm:w-4 sm:h-4 text-red-600" />
        </Button>
        
        {/* Send Button */}
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="h-10 w-10 sm:h-8 sm:w-8 rounded-full bg-primary hover:bg-primary/90 text-white touch-manipulation min-h-[44px] min-w-[44px]"
          onClick={sendRecording}
          title={dir === 'rtl' ? 'إرسال' : 'Send'}
          style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
        >
          <Send className="w-5 h-5 sm:w-4 sm:h-4" />
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
      onTouchCancel={handleTouchEnd}
      size="icon"
      className={cn(
        "rounded-full h-11 w-11 sm:h-10 sm:w-10 transition-all duration-200 touch-manipulation min-h-[44px] min-w-[44px]",
        isRecording 
          ? "bg-red-500 hover:bg-red-600 text-white animate-pulse scale-110" 
          : "bg-red-500 hover:bg-red-600 text-white",
        dir === 'rtl' && 'mr-2'
      )}
      title={isRecording ? (dir === 'rtl' ? 'ارفع لإرسال' : 'Release to send') : (dir === 'rtl' ? 'اضغط للتسجيل' : 'Press to record')}
      style={{
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation',
        userSelect: 'none',
        WebkitUserSelect: 'none'
      }}
    >
      {isRecording ? (
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 sm:w-2 sm:h-2 bg-white rounded-full animate-pulse" />
          <span className="text-xs sm:text-[10px] font-mono">{formatTime(recordingTime)}</span>
        </div>
      ) : (
        <Mic className="w-6 h-6 sm:w-5 sm:h-5" />
      )}
    </Button>
  );
}
