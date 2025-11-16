import { User, Conversation, Message } from './lib/types/chat';
import { almalkPortrait } from './almalkPortrait';

export const currentUser: User = {
  id: 'user-1',
  name: 'المالك',
  avatar: almalkPortrait,
  status: 'online',
  bio: 'عايش الحلم'
};

export const users: User[] = [
  {
    id: 'user-2',
    name: 'سارة',
    avatar: 'https://i.pravatar.cc/150?img=47',
    status: 'online',
    bio: 'مصممة ومبدعة'
  },
  {
    id: 'user-3',
    name: 'محمد علي',
    avatar: 'https://i.pravatar.cc/150?img=12',
    status: 'away',
    bio: 'مهندس برمجيات'
  },
  {
    id: 'user-4',
    name: 'أميرة',
    avatar: 'https://i.pravatar.cc/150?img=47',
    status: 'offline',
    bio: 'أخصائية تسويق'
  },
  {
    id: 'user-5',
    name: 'داوود',
    avatar: 'https://i.pravatar.cc/150?img=33',
    status: 'online',
    bio: 'مدير منتج'
  }
];

export const mockMessages: Message[] = [
  {
    id: 'msg-1',
    conversationId: 'conv-1',
    senderId: 'user-2',
    content: 'أهلاً! كيف الحال اليوم؟ 👋',
    timestamp: new Date(Date.now() - 3600000),
    status: 'read',
    reactions: [
      { emoji: '👍', userId: 'user-1', userName: 'المالك' }
    ]
  },
  {
    id: 'msg-2',
    conversationId: 'conv-1',
    senderId: 'user-1',
    content: 'أهلاً سارة! الحمد لله تمام، شغال على مشاريع جديدة حلوة.',
    timestamp: new Date(Date.now() - 3500000),
    status: 'read',
    reactions: []
  },
  {
    id: 'msg-3',
    conversationId: 'conv-1',
    senderId: 'user-2',
    content: 'واو،  حلو! إيش نوع المشاريع اللي شغال عليها؟',
    timestamp: new Date(Date.now() - 3400000),
    status: 'read',
    reactions: []
  },
  {
    id: 'msg-4',
    conversationId: 'conv-1',
    senderId: 'user-1',
    content: 'بشتغل على مشاريع كثيرة والان أكمل تطبيق دردشة مميز فيه ميزات حلوة زي التفاعلات والردود والرسائل المجدولة!اي شيء براسك  بأذن الله بشتغله       ',
    timestamp: new Date(Date.now() - 3300000),
    status: 'read',
    reactions: [
      { emoji: '🔥', userId: 'user-2', userName: 'سارة' },
      { emoji: '😍', userId: 'user-2', userName: 'سارة' }
    ]
  },
  {
    id: 'msg-5',
    conversationId: 'conv-1',
    senderId: 'user-2',
    content: 'يا سلام! متى أشوفه لما يخلص.',
    timestamp: new Date(Date.now() - 1800000),
    status: 'read',
    replyTo: 'msg-4',
    reactions: []
  }
];

export const mockConversations: Conversation[] = [
  {
    id: 'conv-1',
    type: 'direct',
    participants: [currentUser, users[0]],
    lastMessage: mockMessages[4],
    unreadCount: 0,
    pinned: true,
    archived: false
  },
  {
    id: 'conv-2',
    type: 'direct',
    participants: [currentUser, users[1]],
    lastMessage: {
      id: 'msg-6',
      conversationId: 'conv-2',
      senderId: 'user-3',
      content: 'نشوفه قريب!',
      timestamp: new Date(Date.now() - 7200000),
      status: 'delivered',
      reactions: []
    },
    unreadCount: 2,
    pinned: false,
    archived: false
  },
  {
    id: 'conv-3',
    type: 'group',
    name: 'فريق المشروع',
    participants: [currentUser, users[2]],
    lastMessage: {
      id: 'msg-7',
      conversationId: 'conv-3',
      senderId: 'user-3',
      content: 'أي إستفسار !',
      timestamp: new Date(Date.now() - 86400000),
      status: 'read',
      reactions: []
    },
    unreadCount: 0,
    pinned: false,
    archived: false,
    avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=team'
  },
  {
    id: 'conv-4',
    type: 'direct',
    participants: [currentUser, users[3]],
    lastMessage: {
      id: 'msg-8',
      conversationId: 'conv-4',
      senderId: 'user-5',
      content: 'شكراً على التحديث!',
      timestamp: new Date(Date.now() - 172800000),
      status: 'read',
      reactions: []
    },
    unreadCount: 0,
    pinned: false,
    archived: false
  }
];
