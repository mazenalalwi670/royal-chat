'use client';

import { useState, useRef, useEffect } from 'react';
import { Video, VideoOff, Mic, MicOff, PhoneOff, Phone } from 'lucide-react';
import { Button } from '@/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/ui/avatar';

interface VideoCallProps {
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

export function VideoCall({
  isOpen,
  onClose,
  caller,
  currentUser,
  onCallEnd
}: VideoCallProps) {
  const { dir } = useLanguage();
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isConnecting, setIsConnecting] = useState(true);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Request permissions and start video call
  useEffect(() => {
    if (!isOpen) return;

    const startCall = async () => {
      try {
        setIsConnecting(true);
        setPermissionError(null);

        // Request camera and microphone permissions
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user'
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });

        setLocalStream(stream);
        
        // Display local video
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

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
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
          }
          setIsConnecting(false);
        };

        // Handle ICE candidates
        peerConnection.onicecandidate = (event) => {
          if (event.candidate) {
            // Send ICE candidate to remote peer via WebSocket
            // This would be handled by your WebSocket server
            console.log('ICE candidate:', event.candidate);
          }
        };

        // Start call duration timer
        durationIntervalRef.current = setInterval(() => {
          setCallDuration(prev => prev + 1);
        }, 1000);

        setIsConnecting(false);
      } catch (error: any) {
        console.error('Error starting video call:', error);
        let errorMessage = dir === 'rtl' 
          ? 'خطأ في الوصول إلى الكاميرا أو الميكروفون' 
          : 'Error accessing camera or microphone';
        
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          errorMessage = dir === 'rtl'
            ? 'تم رفض الوصول إلى الكاميرا أو الميكروفون. يرجى السماح بالوصول في إعدادات المتصفح.'
            : 'Camera or microphone access denied. Please allow access in browser settings.';
        } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
          errorMessage = dir === 'rtl'
            ? 'لم يتم العثور على كاميرا أو ميكروفون'
            : 'Camera or microphone not found';
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
    };
  }, [isOpen, dir]);

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoEnabled;
        setIsVideoEnabled(!isVideoEnabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioEnabled;
        setIsAudioEnabled(!isAudioEnabled);
      }
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
      <DialogContent className="max-w-4xl w-full h-[90vh] p-0 gap-0 bg-black">
        <DialogHeader className="sr-only">
          <DialogTitle>
            {dir === 'rtl' ? 'مكالمة فيديو' : 'Video Call'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="relative w-full h-full flex items-center justify-center bg-black">
          {/* Remote Video (Full Screen) */}
          <div className="absolute inset-0 w-full h-full">
            {remoteStream ? (
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
                style={{ transform: 'scaleX(-1)' }} // Mirror effect
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
                <div className="text-center">
                  <Avatar className="w-32 h-32 mx-auto mb-4">
                    <AvatarImage src={caller.avatar} alt={caller.name} />
                    <AvatarFallback className="text-4xl">
                      {caller.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-white text-xl font-semibold mb-2">{caller.name}</p>
                  {isConnecting && (
                    <p className="text-gray-400 text-sm">
                      {dir === 'rtl' ? 'جاري الاتصال...' : 'Connecting...'}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Local Video (Picture-in-Picture) */}
          {localStream && (
            <div className="absolute bottom-4 right-4 w-48 h-36 sm:w-64 sm:h-48 rounded-lg overflow-hidden border-2 border-white shadow-2xl z-10">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ transform: 'scaleX(-1)' }} // Mirror effect
              />
              {!isVideoEnabled && (
                <div className="absolute inset-0 bg-black flex items-center justify-center">
                  <VideoOff className="w-8 h-8 text-white" />
                </div>
              )}
            </div>
          )}

          {/* Call Info Overlay */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
            <div className="flex items-center gap-3 bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-white font-mono text-sm">{formatDuration(callDuration)}</span>
            </div>
            <div className="text-white text-sm bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2">
              {caller.name}
            </div>
          </div>

          {/* Permission Error */}
          {permissionError && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-30">
              <div className="text-center max-w-md mx-4">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <VideoOff className="w-8 h-8 text-red-500" />
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
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-3 z-20">
            <Button
              type="button"
              size="icon"
              variant={isVideoEnabled ? "secondary" : "destructive"}
              className="rounded-full w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm"
              onClick={toggleVideo}
              title={isVideoEnabled ? (dir === 'rtl' ? 'إيقاف الفيديو' : 'Turn off video') : (dir === 'rtl' ? 'تشغيل الفيديو' : 'Turn on video')}
            >
              {isVideoEnabled ? (
              <Video className="w-6 h-6 text-white" />
            ) : (
              <VideoOff className="w-6 h-6 text-white" />
            )}
            </Button>

            <Button
              type="button"
              size="icon"
              variant={isAudioEnabled ? "secondary" : "destructive"}
              className="rounded-full w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm"
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
              variant="destructive"
              className="rounded-full w-14 h-14 bg-red-600 hover:bg-red-700"
              onClick={endCall}
              title={dir === 'rtl' ? 'إنهاء المكالمة' : 'End Call'}
            >
              <PhoneOff className="w-7 h-7 text-white" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

