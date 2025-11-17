'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/ui/badge';
import { Users } from 'lucide-react';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface OnlineUsersCounterProps {
  conversationId: string;
  className?: string;
}

export function OnlineUsersCounter({ conversationId, className }: OnlineUsersCounterProps) {
  const { socket } = useWebSocket();
  const { dir } = useLanguage();
  const [onlineCount, setOnlineCount] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!socket) return;

    const handleActiveUsers = (users: Array<{ userId: string; userName: string }>) => {
      setOnlineCount(users.length);
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 500);
    };

    const handleUserJoined = () => {
      // Update count when user joins
      socket.emit('get_online_count', conversationId);
    };

    const handleUserLeft = () => {
      // Update count when user leaves
      socket.emit('get_online_count', conversationId);
    };

    socket.on('active_users', handleActiveUsers);
    socket.on('user_joined', handleUserJoined);
    socket.on('user_left', handleUserLeft);

    // Request initial count
    socket.emit('get_online_count', conversationId);

    return () => {
      socket.off('active_users', handleActiveUsers);
      socket.off('user_joined', handleUserJoined);
      socket.off('user_left', handleUserLeft);
    };
  }, [socket, conversationId]);

  return (
    <Badge
      variant="secondary"
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-600 dark:text-green-400",
        "transition-all duration-300",
        isAnimating && "scale-110 animate-pulse",
        className
      )}
    >
      <Users className={cn("w-3.5 h-3.5", isAnimating && "animate-bounce")} />
      <span className="font-semibold">{onlineCount}</span>
      <span className="text-xs opacity-80">
        {dir === 'rtl' ? 'متصل' : 'online'}
      </span>
    </Badge>
  );
}



