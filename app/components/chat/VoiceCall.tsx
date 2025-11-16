'use client';

import { useState, useRef, useEffect } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/ui/avatar';

interface VoiceCallProps {
  isOpen: boolean;
  onClose: () => void;
  caller: {
    id: string;
    name: string;
    avatar: string;
  };
  currentUser: {
    id: string;
    name: string;
    avatar: string;
  };
  onCallEnd?: () => void;
}

export function VoiceCall({
  isOpen,
  onClose,
  caller,
  currentUser,
  onCallEnd
}: VoiceCallProps) {
  const { dir } = useLanguage();
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isSpeakerEnabled, setIsSpeakerEnabled] = useState(true);
  const [isConnecting, setIsConnecting] = useState(true);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Request permissions and start voice call
  useEffect(() => {
    if (!isOpen) return;

    const startCall = async () => {
      try {
        setIsConnecting(true);
        setPermissionError(null);

        // Request microphone permission
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 44100
          }
        });

        setLocalStream(stream);

        // Initialize WebRTC peer connection with TURN servers for real internet calls
        const turnServer = process.env.NEXT_PUBLIC_TURN_SERVER || 'stun:stun.l.google.com:19302';
        const turnUsername = process.env.NEXT_PUBLIC_TURN_USERNAME || '';
        const turnPassword = process.env.NEXT_PUBLIC_TURN_PASSWORD || '';
        
        const iceServers: RTCIceServer[] = [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ];
        
        // Add TURN server if configured (required for calls over internet)
        if (turnServer && turnServer.startsWith('turn:')) {
          iceServers.push({
            urls: turnServer,
            username: turnUsername || undefined,
            credential: turnPassword || undefined
          });
        }
        
        const configuration: RTCConfiguration = {
          iceServers
        };

        const peerConnection = new RTCPeerConnection(configuration);
        peerConnectionRef.current = peerConnection;

        // Add local stream tracks to peer connection
        stream.getTracks().forEach(track => {
          peerConnection.addTrack(track, stream);
        });

        // Handle remote stream
        peerConnection.ontrack = (event) => {
          const remoteStream = event.streams[0];
          setRemoteStream(remoteStream);
          
          // Play remote audio
          if (audioRef.current) {
            audioRef.current.srcObject = remoteStream;
            audioRef.current.play().catch(error => {
              console.error('Error playing remote audio:', error);
            });
          }
          
          setIsConnecting(false);
        };

        // Handle ICE candidates
        peerConnection.onicecandidate = (event) => {
          if (event.candidate) {
            // Send ICE candidate to remote peer via WebSocket
            console.log('ICE candidate:', event.candidate);
          }
        };

        // Start call duration timer
        durationIntervalRef.current = setInterval(() => {
          setCallDuration(prev => prev + 1);
        }, 1000);

        setIsConnecting(false);
      } catch (error: any) {
        console.error('Error starting voice call:', error);
        let errorMessage = dir === 'rtl' 
          ? 'خطأ في الوصول إلى الميكروفون' 
          : 'Error accessing microphone';
        
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          errorMessage = dir === 'rtl'
            ? 'تم رفض الوصول إلى الميكروفون. يرجى السماح بالوصول في إعدادات المتصفح.'
            : 'Microphone access denied. Please allow access in browser settings.';
        } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
          errorMessage = dir === 'rtl'
            ? 'لم يتم العثور على ميكروفون'
            : 'Microphone not found';
        }
        
        setPermissionError(errorMessage);
        setIsConnecting(false);
      }
    };

    startCall();

    return () => {
      // Cleanup
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (remoteStream) {
        remoteStream.getTracks().forEach(track => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.srcObject = null;
      }
    };
  }, [isOpen, dir]);

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioEnabled;
        setIsAudioEnabled(!isAudioEnabled);
      }
    }
  };

  const toggleSpeaker = () => {
    if (audioRef.current) {
      audioRef.current.muted = isSpeakerEnabled;
      setIsSpeakerEnabled(!isSpeakerEnabled);
    }
  };

  const endCall = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (remoteStream) {
      remoteStream.getTracks().forEach(track => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.srcObject = null;
    }
    setLocalStream(null);
    setRemoteStream(null);
    setIsConnecting(false);
    onCallEnd?.();
    onClose();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full p-0 gap-0 bg-gradient-to-br from-gray-900 to-black">
        <DialogHeader className="sr-only">
          <DialogTitle>
            {dir === 'rtl' ? 'مكالمة صوتية' : 'Voice Call'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="relative w-full min-h-[500px] flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-black p-6">
          {/* Caller Avatar */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <Avatar className="w-32 h-32 sm:w-40 sm:h-40 mb-6 border-4 border-white/20">
              <AvatarImage src={caller.avatar} alt={caller.name} />
              <AvatarFallback className="text-5xl bg-gradient-to-br from-primary to-primary/60">
                {caller.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <h3 className="text-white text-2xl font-semibold mb-2">{caller.name}</h3>
            
            {isConnecting ? (
              <p className="text-gray-400 text-sm">
                {dir === 'rtl' ? 'جاري الاتصال...' : 'Connecting...'}
              </p>
            ) : (
              <p className="text-gray-400 text-sm font-mono">
                {formatDuration(callDuration)}
              </p>
            )}

            {/* Audio Visualization */}
            {!isConnecting && remoteStream && (
              <div className="mt-6 flex items-center justify-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-primary rounded-full animate-pulse"
                    style={{
                      height: `${20 + Math.random() * 30}px`,
                      animationDelay: `${i * 0.1}s`,
                      animationDuration: `${0.5 + Math.random() * 0.5}s`
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Permission Error */}
          {permissionError && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-30 p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MicOff className="w-8 h-8 text-red-500" />
                </div>
                <p className="text-white text-lg font-semibold mb-2">
                  {dir === 'rtl' ? 'خطأ في الأذونات' : 'Permission Error'}
                </p>
                <p className="text-gray-300 text-sm mb-4">{permissionError}</p>
                <Button
                  onClick={endCall}
                  variant="destructive"
                  className="mt-4"
                >
                  {dir === 'rtl' ? 'إغلاق' : 'Close'}
                </Button>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="w-full flex items-center justify-center gap-4 pb-6">
            <Button
              type="button"
              size="icon"
              variant={isAudioEnabled ? "secondary" : "destructive"}
              className="rounded-full w-12 h-12 bg-white/10 hover:bg-white/20"
              onClick={toggleAudio}
              title={isAudioEnabled ? (dir === 'rtl' ? 'كتم الصوت' : 'Mute') : (dir === 'rtl' ? 'إلغاء كتم الصوت' : 'Unmute')}
            >
              {isAudioEnabled ? (
                <Mic className="w-6 h-6 text-white" />
              ) : (
                <MicOff className="w-6 h-6 text-white" />
              )}
            </Button>

            <Button
              type="button"
              size="icon"
              variant={isSpeakerEnabled ? "secondary" : "outline"}
              className="rounded-full w-12 h-12 bg-white/10 hover:bg-white/20"
              onClick={toggleSpeaker}
              title={isSpeakerEnabled ? (dir === 'rtl' ? 'إيقاف السماعة' : 'Turn off speaker') : (dir === 'rtl' ? 'تشغيل السماعة' : 'Turn on speaker')}
            >
              {isSpeakerEnabled ? (
                <Volume2 className="w-6 h-6 text-white" />
              ) : (
                <VolumeX className="w-6 h-6 text-white" />
              )}
            </Button>

            <Button
              type="button"
              size="icon"
              variant="destructive"
              className="rounded-full w-14 h-14 bg-red-600 hover:bg-red-700"
              onClick={endCall}
              title={dir === 'rtl' ? 'إنهاء المكالمة' : 'End Call'}
            >
              <PhoneOff className="w-7 h-7 text-white" />
            </Button>
          </div>

          {/* Hidden audio element for remote stream */}
          <audio ref={audioRef} autoPlay playsInline />
        </div>
      </DialogContent>
    </Dialog>
  );
}

