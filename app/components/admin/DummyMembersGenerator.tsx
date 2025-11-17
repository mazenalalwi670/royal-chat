'use client';

import { Button } from '@/ui/button';
import { Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const dummyMembers = [
  {
    name: 'KINGSMAN',
    phoneNumber: '+1234567890',
    statusMessage: 'Royal member of the chat',
    rank: 1,
    backgroundGradient: 'from-gray-800 via-gray-900 to-gray-800'
  },
  {
    name: 'معقء الحكومة',
    phoneNumber: '+1234567891',
    statusMessage: 'تقنعني المواقف لا داعي للثرثره',
    rank: 2,
    backgroundGradient: 'from-gray-800 via-gray-900 to-gray-800'
  },
  {
    name: 'Queen Malak',
    phoneNumber: '+1234567892',
    statusMessage: 'Love for the heart, and passion for the soul',
    rank: 3,
    backgroundGradient: 'from-orange-600 via-orange-700 to-orange-800'
  },
  {
    name: 'يه_SAMAL',
    phoneNumber: '+1234567893',
    statusMessage: 'مشترك مميز نشط',
    rank: 4,
    backgroundGradient: 'from-purple-600 via-purple-700 to-purple-800'
  },
  {
    name: 'مكس = MIX=',
    phoneNumber: '+1234567894',
    statusMessage: 'Premium subscriber',
    rank: 5,
    backgroundGradient: 'from-gray-800 via-gray-900 to-gray-800'
  },
  {
    name: 'سمو الملكة',
    phoneNumber: '+1234567895',
    statusMessage: 'Her Majesty the Queen',
    rank: 6,
    backgroundGradient: 'from-green-600 via-green-700 to-green-800'
  },
  {
    name: 'أبن الأكابر',
    phoneNumber: '+1234567896',
    statusMessage: 'Son of the Nobles',
    rank: 7,
    backgroundGradient: 'from-blue-600 via-blue-700 to-blue-800'
  },
  {
    name: 'ياسو المزاجية',
    phoneNumber: '+1234567897',
    statusMessage: 'Yaso Mood',
    rank: 8,
    backgroundGradient: 'from-blue-600 via-blue-700 to-blue-800'
  }
];

export function DummyMembersGenerator({ onGenerate }: { onGenerate: (members: any[]) => void }) {
  const { dir } = useLanguage();

  const handleGenerate = () => {
    const generated = dummyMembers.map((member, index) => ({
      id: `dummy-${Date.now()}-${index}`,
      name: member.name,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`,
      phoneNumber: member.phoneNumber,
      statusMessage: member.statusMessage,
      backgroundGradient: member.backgroundGradient,
      rank: member.rank,
      isPremiumSubscriber: true,
      subscriptionDate: new Date().toISOString(),
      isActive: true
    }));
    onGenerate(generated);
  };

  return (
    <Button
      onClick={handleGenerate}
      variant="outline"
      className="w-full"
    >
      <Sparkles className="w-4 h-4 mr-2" />
      {dir === 'rtl' ? 'إضافة مستخدمين وهميين للعرض' : 'Add Dummy Members for Preview'}
    </Button>
  );
}


