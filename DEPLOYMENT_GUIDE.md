# دليل النشر - Royal Chat Application

## ✅ نعم، سيعمل على الهواتف الحقيقية!

التطبيق جاهز للنشر وسيعمل على هواتف أصدقائك عبر الإنترنت. المكالمات الصوتية والفيديو ستعمل بشكل حقيقي.

---

## 📋 المتطلبات الأساسية

### الخيار 1: VPS (السيرفر الخاص - موصى به للمكالمات)

- **VPS**: DigitalOcean, AWS, Google Cloud, أو أي VPS آخر
- **Domain**: نطاق (مثل: yourdomain.com) - **مطلوب للـ HTTPS**
- **Node.js**: 18+ و Bun

### الخيار 2: خدمات النشر السريع (سهل لكن محدود)

- **Vercel** (للموقع)
- **Railway** (للسيرفر والموقع)
- **Render** (للسيرفر)

---

## 🚀 طريقة النشر - الخيار 1: VPS (موصى به)

### الخطوة 1: إعداد السيرفر

```bash
# تحديث السيرفر
sudo apt update && sudo apt upgrade -y

# تثبيت Node.js و Bun
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# تثبيت Bun
curl -fsSL https://bun.sh/install | bash

# تثبيت Nginx
sudo apt install -y nginx

# تثبيت Certbot (لـ SSL/HTTPS)
sudo apt install -y certbot python3-certbot-nginx
```

### الخطوة 2: رفع الكود

```bash
# على سيرفرك
cd /var/www
sudo git clone YOUR_REPO_URL royal-chat
cd royal-chat
sudo bun install
```

### الخطوة 3: إعداد المتغيرات البيئية

```bash
# إنشاء ملف .env
sudo nano .env
```

أضف:

```env
# السيرفر URL
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_WS_URL=wss://yourdomain.com

# المنافذ
NEXT_PORT=4000
ADMIN_PORT=4001
WS_PORT=4002

# TURN Server (مطلوب للمكالمات عبر الإنترنت)
NEXT_PUBLIC_TURN_SERVER=your-turn-server.com
NEXT_PUBLIC_TURN_USERNAME=username
NEXT_PUBLIC_TURN_PASSWORD=password

# SSL (إذا كان لديك شهادات)
SSL_CERT_PATH=/etc/letsencrypt/live/yourdomain.com/fullchain.pem
SSL_KEY_PATH=/etc/letsencrypt/live/yourdomain.com/privkey.pem
```

### الخطوة 4: بناء التطبيق

```bash
# بناء Next.js
bun run build

# بناء Admin
cd . && bun run build
```

### الخطوة 5: إعداد Nginx

```nginx
# /etc/nginx/sites-available/royal-chat
server {
    listen 80;
    server_name yourdomain.com;

    # إعادة توجيه إلى HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    # SSL Certificates
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Next.js App (المستخدمين العاديين)
    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Admin Panel
    location /admin {
        proxy_pass http://localhost:4001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket Server
    location /socket.io/ {
        proxy_pass http://localhost:4002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # API
    location /api/ {
        proxy_pass http://localhost:4002;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

تفعيل الموقع:

```bash
sudo ln -s /etc/nginx/sites-available/royal-chat /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### الخطوة 6: الحصول على SSL Certificate

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### الخطوة 7: إعداد PM2 (لتشغيل التطبيق تلقائياً)

```bash
# تثبيت PM2
sudo npm install -g pm2

# تشغيل التطبيق
cd /var/www/royal-chat
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## 🌐 طريقة النشر - الخيار 2: Railway (سهل وسريع)

### الخطوة 1: إنشاء حساب على Railway

1. اذهب إلى [railway.app](https://railway.app)
2. سجل دخول بحساب GitHub

### الخطوة 2: رفع المشروع

1. اضغط "New Project"
2. اختر "Deploy from GitHub repo"
3. اختر repository الخاص بك

### الخطوة 3: إعداد المتغيرات البيئية

في Railway Dashboard → Variables:

```env
NEXT_PUBLIC_APP_URL=https://your-app.up.railway.app
NEXT_PUBLIC_WS_URL=wss://your-app.up.railway.app
```

### الخطوة 4: النشر

Railway سيُنشر تلقائياً!

---

## 📱 للمكالمات الحقيقية - TURN Server

### الخيار 1: استخدام خدمة مجانية (للتجربة)

- **Twilio STUN/TURN**: https://www.twilio.com/stun-turn
- **Xirsys**: https://xirsys.com (محدود مجاناً)

### الخيار 2: إعداد TURN Server خاص (موصى به)

```bash
# تثبيت Coturn
sudo apt install -y coturn

# إعداد Coturn
sudo nano /etc/turnserver.conf
```

أضف:

```conf
listening-port=3478
external-ip=YOUR_SERVER_IP
realm=yourdomain.com
user=username:password
```

---

## 🔧 تحديث الكود للنشر

تم تحديث الملفات التالية:

1. ✅ `app/contexts/WebSocketContext.tsx` - يستخدم متغيرات البيئة
2. ✅ `server/index.ts` - يدعم HTTPS و CORS
3. ✅ `.env.example` - مثال للمتغيرات البيئية
4. ✅ `ecosystem.config.js` - PM2 configuration
5. ✅ `docker-compose.yml` - للنشر بالـ Docker

---

## 📲 الروابط بعد النشر

- **المستخدمين العاديين**: `https://yourdomain.com`
- **المالك/Admin**: `https://yourdomain.com/admin`
- **WebSocket**: `wss://yourdomain.com/socket.io`

---

## ✅ التحقق من النشر

1. افتح `https://yourdomain.com` في الهاتف
2. تأكد من ظهور صفحة تسجيل الدخول
3. جرب إرسال رسالة
4. جرب مكالمة صوتية/فيديو

---

## 🆘 حل المشاكل

### المكالمات لا تعمل؟

- تأكد من استخدام HTTPS (مطلوب للميكروفون/الكاميرا)
- تأكد من إعداد TURN Server بشكل صحيح
- تحقق من فتح المنافذ في Firewall

### WebSocket لا يعمل؟

- تأكد من إعداد Nginx بشكل صحيح
- تحقق من فتح المنفذ 4002
- تأكد من استخدام `wss://` (ليس `ws://`)

### HTTPS لا يعمل؟

- تأكد من تفعيل SSL Certificate
- تحقق من إعدادات Nginx
- تأكد من فتح المنفذ 443 في Firewall

---

## 📞 للدعم

إذا واجهت أي مشاكل، تحقق من:

- Logs في PM2: `pm2 logs`
- Logs في Nginx: `sudo tail -f /var/log/nginx/error.log`
- Logs في التطبيق: `pm2 logs royal-chat`

---

**نعم، سيعمل على هواتف أصدقائك بشكل حقيقي! 🎉**
