# 📦 رفع المشروع على GitHub - خطوة بخطوة

## الخطوة 1: إنشاء حساب GitHub (إذا لم يكن لديك)

1. **اذهب إلى**: https://github.com
2. **اضغط**: "Sign up"
3. **املأ البيانات**:
   - Username (اسم المستخدم)
   - Email (البريد الإلكتروني)
   - Password (كلمة المرور)
4. **تحقق من البريد**: افتح البريد واضغط على رابط التحقق

---

## الخطوة 2: إنشاء Repository جديد

1. **في GitHub**: اضغط على زر "+" في الأعلى الأيمن
2. **اختر**: "New repository"
3. **املأ**:
   - **Repository name**: `royal-chat` (أو أي اسم تريده)
   - **Description**: "Royal Chat Application" (اختياري)
   - **Public** أو **Private**: اختر ما تريد
4. **لا تضع علامة** على "Add a README file"
5. **اضغط**: "Create repository"

---

## الخطوة 3: تثبيت Git (إذا لم يكن مثبت)

### على Windows:

1. **اذهب إلى**: https://git-scm.com/download/win
2. **حمّل**: Git for Windows
3. **ثبت**: (اضغط Next في كل شيء)
4. **أعد فتح**: PowerShell أو Command Prompt

### التحقق من التثبيت:

```bash
git --version
```

**يجب أن يظهر**: `git version 2.x.x`

---

## الخطوة 4: رفع الكود على GitHub

### افتح PowerShell في مجلد المشروع:

1. **اضغط**: `Windows + R`
2. **اكتب**: `powershell`
3. **اضغط**: Enter
4. **انتقل إلى المجلد**:
```powershell
cd C:\Royal
```

### تهيئة Git:

```powershell
# تهيئة Git
git init

# إضافة جميع الملفات
git add .

# Commit
git commit -m "Initial commit: Royal Chat Application"
```

### إضافة GitHub Repository:

```powershell
# استبدل YOUR_USERNAME باسمك على GitHub
git remote add origin https://github.com/YOUR_USERNAME/royal-chat.git

# ادفع الكود
git branch -M main
git push -u origin main
```

**سيطلب اسم المستخدم وكلمة المرور**:
- **Username**: اسم المستخدم على GitHub
- **Password**: استخدم **Personal Access Token** (ليس كلمة المرور!)

---

## الخطوة 5: إنشاء Personal Access Token

1. **في GitHub**: اضغط على صورتك الشخصية (أعلى يمين)
2. **اختر**: "Settings"
3. **في القائمة اليسرى**: "Developer settings"
4. **اختر**: "Personal access tokens" → "Tokens (classic)"
5. **اضغط**: "Generate new token" → "Generate new token (classic)"
6. **املأ**:
   - **Note**: "Royal Chat Deployment"
   - **Expiration**: 90 days (أو No expiration)
   - **Select scopes**: ضع علامة على `repo` (كل ما تحته)
7. **اضغط**: "Generate token"
8. **انسخ**: Token (سيظهر مرة واحدة فقط!)

---

## الخطوة 6: استخدام Token عند Push

```powershell
git push -u origin main
```

**عند الطلب**:
- **Username**: اسم المستخدم على GitHub
- **Password**: الصق **Personal Access Token** (ليس كلمة المرور!)

---

## ✅ جاهز!

الآن الكود على GitHub ويمكنك استخدامه في Railway أو VPS!

---

## 📝 تحديث الكود لاحقاً

إذا عدّلت الكود وترغب برفعه:

```powershell
cd C:\Royal

# إضافة التغييرات
git add .

# Commit
git commit -m "Update: وصف التحديث"

# رفع التغييرات
git push
```

---

## 🔒 إذا نسيت Token

1. **اذهب إلى**: GitHub → Settings → Developer settings → Personal access tokens
2. **احذف**: Token القديم
3. **أنشئ**: Token جديد
4. **استخدمه**: في Push

---

**الكود الآن على GitHub! ✅**

