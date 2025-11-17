# 🔐 المتغيرات البيئية لـ Railway

## الرابط العام:

```
royal-chat-production.up.railway.app
```

---

## 📝 المتغيرات المطلوبة:

### 1. اذهب إلى تبويب "Variables" في Railway

### 2. اضغط "New Variable" أو "Add Variable"

### 3. أضف المتغيرات التالية واحدة تلو الأخرى:

---

## ✅ المتغيرات:

### المتغير 1:

```
Name: NEXT_PUBLIC_APP_URL
Value: https://royal-chat-production.up.railway.app
```

### المتغير 2:

```
Name: NEXT_PUBLIC_WS_URL
Value: wss://royal-chat-production.up.railway.app
```

### المتغير 3:

```
Name: ALLOWED_ORIGINS
Value: https://royal-chat-production.up.railway.app
```

### المتغير 4:

```
Name: NODE_ENV
Value: production
```

---

## 📋 نسخ سريع (Copy & Paste):

```
NEXT_PUBLIC_APP_URL=https://royal-chat-production.up.railway.app
NEXT_PUBLIC_WS_URL=wss://royal-chat-production.up.railway.app
ALLOWED_ORIGINS=https://royal-chat-production.up.railway.app
NODE_ENV=production
```

---

## ⚠️ ملاحظات مهمة:

1. **لا تنسى** أن تضيف `https://` في `NEXT_PUBLIC_APP_URL` و `ALLOWED_ORIGINS`
2. **لا تنسى** أن تضيف `wss://` في `NEXT_PUBLIC_WS_URL` (للاتصال الآمن)
3. بعد إضافة المتغيرات، سيتم إعادة نشر التطبيق تلقائياً
4. انتظر حتى ينتهي البناء (5-10 دقائق)

---

## 🎯 بعد إضافة المتغيرات:

1. انتظر حتى ينتهي البناء
2. جرب الرابط: https://royal-chat-production.up.railway.app
3. يجب أن يعمل التطبيق الآن! 🎉
