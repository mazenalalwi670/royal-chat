'use client';

import { Button } from '@/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/ui/avatar';
import { Separator } from '@/ui/separator';
import { MessageSquare, Users, Settings, LogOut, Crown, UsersRound } from 'lucide-react';
import { User } from '@/types/chat';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface SidebarProps {
  currentUser: User;
  activeTab: 'chats' | 'contacts' | 'settings' | 'premium';
  onTabChange: (tab: 'chats' | 'contacts' | 'settings' | 'premium') => void;
}

export function Sidebar({ currentUser, activeTab, onTabChange }: SidebarProps) {
  const { t } = useLanguage();
  const tabs = [
    { id: 'chats' as const, icon: MessageSquare, label: t('nav.chats') },
    { id: 'contacts' as const, icon: Users, label: t('nav.contacts') },
    { id: 'premium' as const, icon: UsersRound, label: t('nav.premium') || 'Premium Chat' },
    { id: 'settings' as const, icon: Settings, label: t('nav.settings') }
  ];

  return (
    <div className="w-20 flex flex-col items-center py-6 gap-6 sidebar-gradient">
      <div className="flex flex-col items-center gap-2">
        <Crown className="w-8 h-8 text-white royal-crown" style={{
          filter: 'drop-shadow(0 0 12px rgba(255, 215, 0, 0.9)) drop-shadow(0 0 24px rgba(255, 215, 0, 0.6))'
        }} />
        <span className="text-white font-bold text-xs tracking-wider royal-text-sidebar">ROYAL</span>
      </div>

      <Separator className="w-10 bg-white/20" />

      <div className="relative">
        <Avatar className="w-12 h-12 border-2 border-white shadow-lg">
          <AvatarImage src={currentUser.avatar} />
          <AvatarFallback>{currentUser.name[0]}</AvatarFallback>
        </Avatar>
        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />
      </div>

      <Separator className="w-10 bg-white/20" />

      <div className="flex-1 flex flex-col gap-2">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'w-12 h-12 rounded-xl transition-all duration-200',
              activeTab === tab.id
                ? 'bg-white shadow-lg'
                : 'text-white hover:bg-white/20'
            )}
            style={activeTab === tab.id ? {
              color: `hsl(var(--chat-from))`
            } : undefined}
            title={tab.label}
          >
            <tab.icon className="w-5 h-5" />
          </Button>
        ))}
      </div>

      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="w-12 h-12 rounded-xl text-white hover:bg-red-500 transition-colors"
        title={t('nav.logout')}
      >
        <LogOut className="w-5 h-5" />
      </Button>
    </div>
  );
}
