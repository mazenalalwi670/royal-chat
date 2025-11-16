# 🚀 نشر سريع - Royal Chat

## ✅ نعم، سيعمل على هواتف أصدقائك!

التطبيق جاهز للنشر وسيعمل على هواتف أصدقائك عبر الإنترنت. المكالمات الصوتية والفيديو ستعمل بشكل حقيقي.

---

## 📋 الخيارات السريعة للنشر

### الخيار 1: Railway (الأسهل - موصى به) ⭐

1. **سجل دخول**: https://railway.app
2. **New Project** → **Deploy from GitHub repo**
3. **إعداد المتغيرات البيئية**:
   ```
   NEXT_PUBLIC_APP_URL=https://your-app.up.railway.app
   NEXT_PUBLIC_WS_URL=wss://your-app.up.railway.app
   ```
4. **النشر تلقائياً!**

---

### الخيار 2: VPS (للمكالمات الحقيقية) 🔥

#### الخطوات السريعة:

```bash
# 1. تحديث السيرفر
sudo apt update && sudo apt upgrade -y

# 2. تثبيت Node.js و Bun
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
curl -fsSL https://bun.sh/install | bash

# 3. تثبيت Nginx و Certbot
sudo apt install -y nginx certbot python3-certbot-nginx

# 4. رفع الكود
cd /var/www
sudo git clone YOUR_REPO_URL royal-chat
cd royal-chat
sudo bun install

# 5. إنشاء ملف .env
sudo nano .env
```

#### ملف .env:
```env
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_WS_URL=wss://yourdomain.com
ALLOWED_ORIGINS=https://yourdomain.com
```

#### بناء التطبيق:
```bash
bun run build
```

#### إعداد Nginx (مبسط):
```bash
sudo nano /etc/nginx/sites-available/royal-chat
```

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }

    location /admin {
        proxy_pass http://localhost:4001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }

    location /socket.io/ {
        proxy_pass http://localhost:4002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

#### تفعيل الموقع:
```bash
sudo ln -s /etc/nginx/sites-available/royal-chat /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### الحصول على SSL:
```bash
sudo certbot --nginx -d yourdomain.com
```

#### تشغيل التطبيق:
```bash
# تثبيت PM2
sudo npm install -g pm2

# تشغيل
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## 📱 للمكالمات الحقيقية

### TURN Server (مطلوب للمكالمات عبر الإنترنت)

#### خيار مجاني للتجربة:
1. **Twilio STUN/TURN**: https://www.twilio.com/stun-turn
   - سجل حساب مجاني
   - احصل على Credentials
   - أضفها في `.env`:
   ```env
   NEXT_PUBLIC_TURN_SERVER=turn:global.turn.twilio.com:3478
   NEXT_PUBLIC_TURN_USERNAME=your-username
   NEXT_PUBLIC_TURN_PASSWORD=your-password
   ```

#### إعداد TURN Server خاص:
```bash
sudo apt install -y coturn
sudo nano /etc/turnserver.conf
```

```conf
listening-port=3478
external-ip=YOUR_SERVER_IP
realm=yourdomain.com
user=username:password
```

---

## ✅ بعد النشر

### الروابط:
- **المستخدمين**: `https://yourdomain.com`
- **المالك**: `https://yourdomain.com/admin`

### التحقق:
1. افتح الرابط في الهاتف ✅
2. جرب تسجيل الدخول ✅
3. جرب إرسال رسالة ✅
4. جرب مكالمة صوتية/فيديو ✅

---

## ⚠️ ملاحظات مهمة

1. **HTTPS مطلوب**: الميكروفون والكاميرا لا تعمل بدون HTTPS
2. **TURN Server**: مطلوب للمكالمات عبر الإنترنت (بين مستخدمين مختلفين)
3. **Firewall**: تأكد من فتح المنافذ 80, 443, 4000, 4001, 4002

---

## 🆘 مشاكل شائعة

### المكالمات لا تعمل؟
- ✅ تأكد من HTTPS
- ✅ تأكد من TURN Server
- ✅ تحقق من Firewall

### WebSocket لا يعمل؟
- ✅ تأكد من Nginx configuration
- ✅ تحقق من CORS settings
- ✅ استخدم `wss://` (ليس `ws://`)

---

**جاهز للنشر! 🎉**

راجع `DEPLOYMENT_GUIDE.md` للتفاصيل الكاملة.

