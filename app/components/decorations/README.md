# نظام الزخارف المتحركة والحديثة

## نظرة عامة
تم إضافة نظام شامل للزخارف المتحركة والإطارات الفاخرة التي تجعل التطبيق يبدو مثل تطبيقات الدردشة الحديثة جداً.

## المكونات المتاحة

### 1. AnimatedDecorations
زخارف متحركة خلفية مع جزيئات طائفة وتأثيرات توهج.

**الاستخدام:**
```tsx
import { AnimatedDecorations } from '@/components/decorations/AnimatedDecorations';

<AnimatedDecorations 
  type="premium" // 'premium' | 'gold' | 'platinum' | 'royal' | 'diamond'
  intensity="medium" // 'low' | 'medium' | 'high'
  className="p-8 rounded-lg"
>
  {/* محتواك هنا */}
</AnimatedDecorations>
```

**الأنواع المتاحة:**
- `premium`: ذهبي مع تأثيرات مميزة
- `gold`: ذهبي أنيق
- `platinum`: بلاتيني فاخر
- `royal`: ملكي مع ألوان بنفسجية
- `diamond`: ألماسي مع ألوان سماوية

### 2. AnimatedTopBar
شريط علوي متحرك متقدم مع إحصائيات وتأثيرات.

**الاستخدام:**
```tsx
import { AnimatedTopBar } from '@/components/decorations/AnimatedTopBar';

<AnimatedTopBar
  title="الدردشة الملكية"
  subtitle="تجربة فاخرة"
  showStats={true}
  premiumCount={42}
  totalUsers={1250}
/>
```

### 3. LuxuryNameFrames
إطارات فاخرة للأسماء مع تأثيرات متحركة وتوهج.

**الاستخدام:**
```tsx
import { LuxuryNameFrame } from '@/components/decorations/LuxuryNameFrames';

<LuxuryNameFrame
  name="المستخدم"
  frameStyle="premium-gold" // 'royal-crown' | 'golden-star' | 'diamond-gem' | 'platinum-luxury' | 'rainbow-sparkle' | 'electric-zap' | 'premium-gold'
  size="medium" // 'small' | 'medium' | 'large'
  animated={true}
  glow={true}
/>
```

**أنواع الإطارات:**
- `royal-crown`: تاج ملكي بنفسجي
- `golden-star`: نجمة ذهبية
- `diamond-gem`: جوهرة ألماسية
- `platinum-luxury`: بلاتيني فاخر
- `rainbow-sparkle`: قوس قزح متألق
- `electric-zap`: برق كهربائي
- `premium-gold`: ذهبي مميز (افتراضي)

### 4. ModernIcons & PremiumBadge
أيقونات حديثة وشارات اشتراك مميزة.

**الاستخدام:**
```tsx
import { ModernIcon, PremiumBadge } from '@/components/icons/ModernIcons';

// أيقونة حديثة
<ModernIcon 
  type="crown" // 'crown' | 'star' | 'gem' | 'sparkles' | 'zap' | 'heart' | 'trophy' | etc.
  variant="premium" // 'default' | 'premium' | 'gold' | 'platinum' | 'diamond' | 'glow'
  size={24}
  animated={true}
/>

// شارة اشتراك مميزة
<PremiumBadge 
  text="مميز"
  variant="gold" // 'gold' | 'platinum' | 'diamond'
  size="md" // 'sm' | 'md' | 'lg'
  animated={true}
/>
```

## التكامل في Chat

تم تحديث `MessageBubble` لاستخدام هذه المكونات تلقائياً:

```tsx
// في MessageBubble - المستخدمون المميزون يحصلون على:
- AnimatedDecorations حول الصورة الشخصية
- LuxuryNameFrame للأسماء
- PremiumBadge للشارات
```

## CSS Animations

تم إضافة العديد من الحركات في `globals.css`:
- `animate-gradient-x`: حركة تدرج لوني
- `animate-float-particle`: جزيئات طائفة
- `animate-shimmer`: تأثير لمعان
- `animate-sparkle-float`: نجمة متحركة
- `animate-bounce-slow`: ارتداد بطيء
- `animate-pulse-slow`: نبض بطيء
- `animate-spin-slow`: دوران بطيء

## مثال كامل

راجع `DecorationExample.tsx` لمشاهدة جميع المكونات في العمل.

## ملاحظات

- جميع المكونات تدعم RTL (اللغة العربية)
- المكونات متجاوبة وتعمل على جميع الأجهزة
- الحركات محسّنة للأداء
- يمكن تخصيص الألوان والحركات بسهولة


